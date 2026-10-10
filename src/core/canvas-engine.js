import Konva from 'konva';
import { createClipFunction, calculateCoverPlacement, loadImageAsync, isPointInsideMask, createShadingOverlay, createCylinderFloorShadow } from './mask-renderer.js';
import { TEXTURE_WALL_BOISERIE, TEXTURE_FLOOR_WOOD } from './textures-data.js';
import { generateBalloonArchDataUrl } from './balloon-generator.js';

// OTIMIZAO CRTICA PARA MOBILE: Desativa deteco de coliso durante o arrasto contnuo
Konva.hitOnDragEnabled = false;

export class CanvasEngine {
  constructor() {
    this.stage = null;
    this.bgLayer = null;    // Camada Esttica de Fundo (Zero repintura no drag)
    this.decorLayer = null; // Camada Rpida dos Elementos de Decorao
    this.uiLayer = null;    // Camada Leve do Transformer de Seleo
    this.transformer = null;
    this.selectedNode = null;

    // Resoluo Virtual VERTICAL 9:16 Nativa (1080 x 1920)
    this.VIRTUAL_WIDTH = 1080;
    this.VIRTUAL_HEIGHT = 1920;
    this.WALL_HEIGHT = 1380;
    this.FLOOR_HEIGHT = 540;

    // Escala mtrica: 1080px virtuais equivalem a 280cm fsicos na parede
    this.pxPerCm = this.VIRTUAL_WIDTH / 280;

    // Texturas Atuais do Ambiente
    this.wallTextureUrl = TEXTURE_WALL_BOISERIE;
    this.floorTextureUrl = TEXTURE_FLOOR_WOOD;

    // Pilhas de Histrico para Desfazer / Refazer (Undo/Redo)
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 35;
    this.isRestoringState = false;

    // Canvas 1x1 em memria para teste instantneo de transparncia (0.01ms)
    this.hitCanvas = document.createElement('canvas');
    this.hitCanvas.width = 1;
    this.hitCanvas.height = 1;
    this.hitCtx = this.hitCanvas.getContext('2d', { willReadFrequently: true });

    // Callbacks para UI
    this.onSelectionChange = null;
    this.onLayersChange = null;
    this.onHistoryChange = null;
  }

  init(container) {
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    this.stage = new Konva.Stage({
      container: container,
      width: containerW,
      height: containerH
    });

    // 1. CAMADA DE FUNDO ISOLADA (Renderiza uma nica vez na GPU)
    this.bgLayer = new Konva.Layer({ listening: false });
    this.stage.add(this.bgLayer);

    // 2. CAMADA DE DECORAO (Apenas itens mveis)
    this.decorLayer = new Konva.Layer();
    this.stage.add(this.decorLayer);

    // 3. CAMADA DE INTERFACE (Transformer de seleo)
    this.uiLayer = new Konva.Layer();
    this.stage.add(this.uiLayer);

    this.setupTransformer();
    this.setupSmartSelection();
    this.setupKeyboardShortcuts();
    this.renderEnvironment();
    this.fitToView();

    window.addEventListener('resize', () => {
      this.handleResize(container);
    });
  }

  // Ajusta o palco 9:16 perfeitamente centralizado no container
  fitToView() {
    if (!this.stage) return;
    const containerW = this.stage.width();
    const containerH = this.stage.height();

    const scale = Math.min(containerW / this.VIRTUAL_WIDTH, containerH / this.VIRTUAL_HEIGHT);
    const offsetX = (containerW - this.VIRTUAL_WIDTH * scale) / 2;
    const offsetY = (containerH - this.VIRTUAL_HEIGHT * scale) / 2;

    [this.bgLayer, this.decorLayer, this.uiLayer].forEach((layer) => {
      if (layer) {
        layer.scale({ x: scale, y: scale });
        layer.position({ x: offsetX, y: offsetY });
        layer.batchDraw();
      }
    });
  }

  handleResize(container) {
    if (!this.stage || !container) return;
    const newW = container.clientWidth;
    const newH = container.clientHeight;
    if (newW > 0 && newH > 0) {
      this.stage.width(newW);
      this.stage.height(newH);
      this.fitToView();
    }
  }

  // Renderiza Parede e Piso na camada bgLayer esttica
  async renderEnvironment() {
    this.bgLayer.destroyChildren();

    // 1. Parede Realista (1080 x 1380)
    const wallImg = await loadImageAsync(this.wallTextureUrl);
    const wallNode = new Konva.Image({
      name: 'bg-element',
      x: 0,
      y: 0,
      width: this.VIRTUAL_WIDTH,
      height: this.WALL_HEIGHT,
      image: wallImg,
      listening: false
    });

    // 2. Piso Realista em Perspectiva (1080 x 540)
    const floorImg = await loadImageAsync(this.floorTextureUrl);
    const floorNode = new Konva.Image({
      name: 'bg-element',
      x: 0,
      y: this.WALL_HEIGHT,
      width: this.VIRTUAL_WIDTH,
      height: this.FLOOR_HEIGHT,
      image: floorImg,
      listening: false
    });

    this.bgLayer.add(wallNode);
    this.bgLayer.add(floorNode);
    this.bgLayer.batchDraw();
  }

  async setEnvironmentTextures(wallUrl, floorUrl) {
    if (wallUrl) this.wallTextureUrl = wallUrl;
    if (floorUrl) this.floorTextureUrl = floorUrl;
    await this.renderEnvironment();
    this.saveSnapshot();
  }

  setupTransformer() {
    this.transformer = new Konva.Transformer({
      rotateAnchorOffset: 30,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      anchorSize: 26,
      anchorCornerRadius: 13,
      anchorStroke: '#ec4899',
      anchorFill: '#ffffff',
      anchorStrokeWidth: 3,
      borderStroke: '#ec4899',
      borderStrokeWidth: 2.5,
      borderDash: [6, 4],
      keepRatio: true
    });

    this.transformer.on('transformend', () => {
      this.saveSnapshot();
      this.notifyLayersChange();
    });

    this.uiLayer.add(this.transformer);
  }

  // ========================================================
  // SELEO E ARRASTO INTELIGENTE POR PIXEL / TRANSPARNCIA
  // ========================================================
  setupSmartSelection() {
    this.stage.on('pointerdown', (e) => {
      // Se clicou em uma ala do transformer (redimensionamento / rotao), permite interao do transformer
      if (e.target && (e.target.getParent() === this.transformer || e.target === this.transformer)) {
        return;
      }

      const pointerPos = this.stage.getPointerPosition();
      if (!pointerPos) return;

      const candidates = this.findOpaqueItemsAtPoint(pointerPos);

      if (candidates.length === 0) {
        // Clicou em rea vazia ou 100% transparente: desseleciona tudo
        this.deselect();
        return;
      }

      const isAlreadySelected = this.selectedNode && candidates.includes(this.selectedNode);

      if (isAlreadySelected) {
        // O objeto já está selecionado: o usuário clicou nele para arrastar
        const targetNode = this.selectedNode;
        targetNode.draggable(true);
        targetNode.startDrag({ evt: e.evt });
      } else {
        // O objeto não estava selecionado: o primeiro clique apenas seleciona
        // Não inicia arrasto para não mover acidentalmente ao clicar para inspecionar/selecionar
        const targetNode = candidates[0];
        this.selectNode(targetNode);
      }
    });

    // Alternncia cclica ao clicar rpido (sem arrastar) onde mltiplos itens opacos se sobrepem
    this.stage.on('click tap', (e) => {
      if (e.target && (e.target.getParent() === this.transformer || e.target === this.transformer)) {
        return;
      }

      const pointerPos = this.stage.getPointerPosition();
      if (!pointerPos) return;

      const candidates = this.findOpaqueItemsAtPoint(pointerPos);
      if (candidates.length > 1 && this.selectedNode && candidates.includes(this.selectedNode)) {
        const currentIndex = candidates.indexOf(this.selectedNode);
        const nextIndex = (currentIndex + 1) % candidates.length;
        this.selectNode(candidates[nextIndex]);
      }
    });
  }

  // Verifica se o pixel na posio do palco  visivelmente opaco no grupo
  isPointOpaqueInGroup(group, stagePoint) {
    const transform = group.getAbsoluteTransform().copy().invert();
    const localPt = transform.point(stagePoint);

    const w = group.width();
    const h = group.height();

    // Fora da bounding box = não acertou
    if (localPt.x < 0 || localPt.x > w || localPt.y < 0 || localPt.y > h) {
      return false;
    }

    const meta = group.getAttr('itemMeta') || {};

    // Se é uma peça com silhueta geométrica definida, valida se o ponto está dentro da área útil
    const geometricTypes = ['panel_round', 'panel_arch', 'cylinder', 'rug_oval', 'rug_round', 'rug_rect_3d'];
    if (meta.type && (geometricTypes.includes(meta.type) || meta.type.startsWith('rug'))) {
      if (!isPointInsideMask(meta.type, localPt.x, localPt.y, w, h)) {
        return false;
      }
    }

    const coverGroup = group.findOne('.cover-group');
    const coverImgNode = coverGroup ? coverGroup.findOne('Image') : null;
    const baseImgNode = group.findOne('.base-image');
    const targetNode = coverImgNode || baseImgNode;

    if (!targetNode) return true;

    const imgEl = targetNode.image();
    if (!imgEl || !imgEl.complete || !imgEl.naturalWidth) return true;

    const nodeX = targetNode.x();
    const nodeY = targetNode.y();
    const nodeW = targetNode.width();
    const nodeH = targetNode.height();

    const relX = localPt.x - nodeX;
    const relY = localPt.y - nodeY;

    if (relX < 0 || relX >= nodeW || relY < 0 || relY >= nodeH) {
      if (coverImgNode && baseImgNode && baseImgNode.image()) {
        const baseEl = baseImgNode.image();
        const bX = Math.floor((localPt.x / w) * baseEl.naturalWidth);
        const bY = Math.floor((localPt.y / h) * baseEl.naturalHeight);
        try {
          this.hitCtx.clearRect(0, 0, 1, 1);
          this.hitCtx.drawImage(baseEl, bX, bY, 1, 1, 0, 0, 1, 1);
          return this.hitCtx.getImageData(0, 0, 1, 1).data[3] > 25;
        } catch { return true; }
      }
      return false;
    }

    const natX = Math.floor((relX / nodeW) * imgEl.naturalWidth);
    const natY = Math.floor((relY / nodeH) * imgEl.naturalHeight);

    if (natX < 0 || natX >= imgEl.naturalWidth || natY < 0 || natY >= imgEl.naturalHeight) {
      return false;
    }

    try {
      this.hitCtx.clearRect(0, 0, 1, 1);
      this.hitCtx.drawImage(imgEl, natX, natY, 1, 1, 0, 0, 1, 1);
      const alpha = this.hitCtx.getImageData(0, 0, 1, 1).data[3];
      return alpha > 25;
    } catch {
      return true;
    }
  }

  // Encontra todos os itens visveis sob a coordenada (do topo para o fundo)
  findOpaqueItemsAtPoint(stagePoint) {
    const children = this.decorLayer.getChildren();
    const matches = [];

    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.name() === 'decor-item' && this.isPointOpaqueInGroup(child, stagePoint)) {
        matches.push(child);
      }
    }

    return matches;
  }

  // Atalhos de Teclado Globais (Ctrl+Z, Ctrl+Y, Delete, Esc)
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedNode) {
          e.preventDefault();
          this.deleteSelected();
        }
      } else if (e.key === 'Escape') {
        this.deselect();
      }
    });
  }

  // ========================================================
  // ADIO E MANIPULAO DE ITENS NO PALCO
  // ========================================================
  async addItem(itemData, position = null, saveHistory = true) {
    const widthPx = Math.max(70, (itemData.widthCm || 60) * this.pxPerCm);
    const heightPx = Math.max(70, (itemData.heightCm || 60) * this.pxPerCm);

    const isRug = (itemData.category === 'tapetes' || (itemData.type && itemData.type.startsWith('rug')));
    const defaultPosY = isRug ? (this.WALL_HEIGHT + 20) : (this.WALL_HEIGHT + 80 - heightPx + (Math.random() * 30 - 15));
    const posX = position ? position.x : (this.VIRTUAL_WIDTH / 2 - widthPx / 2 + (isRug ? 0 : (Math.random() * 40 - 20)));
    const posY = position ? position.y : defaultPosY;

    const group = new Konva.Group({
      x: posX,
      y: posY,
      width: widthPx,
      height: heightPx,
      draggable: false, // Inicia desativado: somente o item selecionado é draggable
      dragDistance: 6,  // Tolerância de 6px para evitar arraste em cliques estáticos
      name: 'decor-item',
      dragBoundFunc: (pos) => {
        const layer = group.getLayer();
        const scale = layer ? layer.scaleX() : 1;
        const offsetX = layer ? layer.x() : 0;
        const offsetY = layer ? layer.y() : 0;

        const minX = offsetX - 100 * scale;
        const maxX = offsetX + (this.VIRTUAL_WIDTH - widthPx + 100) * scale;
        const minY = offsetY - 100 * scale;
        const maxY = offsetY + (this.VIRTUAL_HEIGHT - heightPx + 100) * scale;

        return {
          x: Math.max(minX, Math.min(maxX, pos.x)),
          y: Math.max(minY, Math.min(maxY, pos.y))
        };
      }
    });

    group.setAttr('itemMeta', {
      ...itemData,
      instanceId: itemData.instanceId || ('inst-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)),
      customCoverUrl: itemData.customCoverUrl || null,
      balloonColors: itemData.balloonColors || null
    });

    let currentPreviewUrl = itemData.previewUrl;
    if (itemData.type === 'balloon_arch' && itemData.balloonColors) {
      currentPreviewUrl = generateBalloonArchDataUrl(itemData.balloonColors);
    }

    // Sombra de contato projetada no piso/tapete para cilindros
    if (itemData.type === 'cylinder') {
      const floorShadow = createCylinderFloorShadow(widthPx, heightPx);
      group.add(floorShadow);
    }

    const imgElement = await loadImageAsync(currentPreviewUrl);
    const baseImage = new Konva.Image({
      name: 'base-image',
      image: imgElement,
      width: widthPx,
      height: heightPx
    });
    group.add(baseImage);

    if (itemData.customCoverUrl) {
      await this.attachCoverToNode(group, itemData.customCoverUrl);
    }

    group.on('dragmove', () => {
      this.uiLayer.batchDraw();
    });

    group.on('dragend', () => {
      this.uiLayer.batchDraw();
      this.saveSnapshot();
      this.notifyLayersChange();
    });

    this.decorLayer.add(group);
    if (isRug && !position) {
      group.moveToBottom();
    }
    this.decorLayer.batchDraw();

    this.selectNode(group);
    this.notifyLayersChange();

    if (saveHistory) {
      this.saveSnapshot();
    }

    return group;
  }

  selectNode(node) {
    // Desativa draggable do nó anterior para evitar arraste fantasma
    if (this.selectedNode && this.selectedNode !== node) {
      this.selectedNode.draggable(false);
    }

    this.selectedNode = node;

    // Ativa draggable exclusivamente no nó selecionado
    if (node) {
      node.draggable(true);
    }

    this.transformer.nodes(node ? [node] : []);
    this.uiLayer.batchDraw();

    if (this.onSelectionChange) {
      const meta = node ? node.getAttr('itemMeta') : null;
      this.onSelectionChange(meta, node);
    }
  }

  deselect() {
    if (this.selectedNode) {
      this.selectedNode.draggable(false);
    }
    this.selectedNode = null;
    this.transformer.nodes([]);
    this.uiLayer.batchDraw();

    if (this.onSelectionChange) {
      this.onSelectionChange(null, null);
    }
  }

  async applyCoverToSelected(coverImageUrl) {
    if (!this.selectedNode) return;
    await this.attachCoverToNode(this.selectedNode, coverImageUrl);
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  async attachCoverToNode(node, coverImageUrl) {
    const meta = node.getAttr('itemMeta');
    meta.customCoverUrl = coverImageUrl;
    node.setAttr('itemMeta', meta);

    const existingCoverGroup = node.findOne('.cover-group');
    if (existingCoverGroup) {
      existingCoverGroup.destroy();
    }

    if (!coverImageUrl) return;

    const w = node.width();
    const h = node.height();
    const coverImg = await loadImageAsync(coverImageUrl);
    const clipFunc = createClipFunction(meta.type, w, h);

    const imgNatW = coverImg.naturalWidth || coverImg.width;
    const imgNatH = coverImg.naturalHeight || coverImg.height;
    const placement = calculateCoverPlacement(meta.type, w, h, imgNatW, imgNatH);

    const coverGroup = new Konva.Group({
      name: 'cover-group',
      clipFunc: clipFunc
    });

    const coverImageNode = new Konva.Image({
      image: coverImg,
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height
    });

    coverGroup.add(coverImageNode);

    // Aplica camada de sombreamento 3D realista sobre a capa
    const shadingOverlay = createShadingOverlay(meta.type, w, h);
    if (shadingOverlay) {
      coverGroup.add(shadingOverlay);
    }

    node.add(coverGroup);
    this.decorLayer.batchDraw();
  }

  // Atualizao paramtrica das cores do arco de bales
  async applyBalloonColorsToNode(group, colors, saveHistory = true) {
    const meta = group.getAttr('itemMeta');
    meta.balloonColors = colors;
    meta.type = 'balloon_arch';
    group.setAttr('itemMeta', meta);

    const newUrl = generateBalloonArchDataUrl(colors);
    meta.previewUrl = newUrl;

    const baseImgNode = group.findOne('.base-image');
    if (baseImgNode) {
      const newImg = await loadImageAsync(newUrl);
      baseImgNode.image(newImg);
      this.decorLayer.batchDraw();
    }

    if (saveHistory) {
      this.saveSnapshot();
    }
    this.notifyLayersChange();
  }

  async applyBalloonColorsToSelected(colors) {
    if (!this.selectedNode) return;
    await this.applyBalloonColorsToNode(this.selectedNode, colors, true);
  }

  bringForward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveUp();
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  sendBackward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveDown();
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  bringToFront() {
    if (!this.selectedNode) return;
    this.selectedNode.moveToTop();
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  sendToBack() {
    if (!this.selectedNode) return;
    this.selectedNode.moveToBottom();
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  flipHorizontal() {
    if (!this.selectedNode) return;
    const currentScale = this.selectedNode.scaleX();
    this.selectedNode.scaleX(-currentScale);

    if (currentScale > 0) {
      this.selectedNode.offsetX(this.selectedNode.width());
    } else {
      this.selectedNode.offsetX(0);
    }
    this.decorLayer.batchDraw();
    this.saveSnapshot();
  }

  async duplicateSelected() {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta');
    const newPos = {
      x: Math.min(this.VIRTUAL_WIDTH - 120, this.selectedNode.x() + 40),
      y: Math.min(this.VIRTUAL_HEIGHT - 120, this.selectedNode.y() + 40)
    };
    await this.addItem({ ...meta }, newPos, true);
  }

  deleteSelected() {
    if (!this.selectedNode) return;
    const node = this.selectedNode;
    this.deselect();
    node.destroy();
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  clearScene() {
    this.deselect();
    this.decorLayer.destroyChildren();
    this.decorLayer.batchDraw();
    this.notifyLayersChange();
    this.saveSnapshot();
  }

  exportHDImage() {
    this.deselect();
    return this.stage.toDataURL({
      pixelRatio: 1.5,
      mimeType: 'image/png'
    });
  }

  getSceneNodes() {
    return this.decorLayer.getChildren();
  }

  getSceneElements() {
    const items = [];
    const children = this.decorLayer.getChildren();
    children.forEach((child, index) => {
      const meta = child.getAttr('itemMeta');
      if (meta) {
        items.push({
          instanceId: meta.instanceId,
          itemId: meta.id,
          name: meta.name,
          category: meta.category,
          type: meta.type,
          widthCm: meta.widthCm,
          heightCm: meta.heightCm,
          previewUrl: meta.previewUrl,
          customCoverUrl: meta.customCoverUrl,
          balloonColors: meta.balloonColors,
          rentalPrice: meta.rentalPrice,
          x: child.x(),
          y: child.y(),
          scaleX: child.scaleX(),
          scaleY: child.scaleY(),
          rotation: child.rotation(),
          zIndex: index
        });
      }
    });
    return items;
  }

  async loadSceneElements(elements) {
    this.deselect();
    this.decorLayer.destroyChildren();

    for (const elem of elements) {
      const node = await this.addItem(elem, { x: elem.x, y: elem.y }, false);
      if (node) {
        node.scaleX(elem.scaleX || 1);
        node.scaleY(elem.scaleY || 1);
        node.rotation(elem.rotation || 0);
        if (elem.balloonColors && elem.type === 'balloon_arch') {
          await this.applyBalloonColorsToNode(node, elem.balloonColors, false);
        }
      }
    }

    this.decorLayer.batchDraw();
    this.notifyLayersChange();
  }

  // ========================================================
  // HISTRICO: DESFAZER / REFAZER (UNDO / REDO)
  // ========================================================
  saveSnapshot() {
    if (this.isRestoringState) return;

    const currentSnapshot = JSON.stringify({
      elements: this.getSceneElements(),
      wallTextureUrl: this.wallTextureUrl,
      floorTextureUrl: this.floorTextureUrl
    });

    const lastSnapshot = this.undoStack[this.undoStack.length - 1];
    if (lastSnapshot === currentSnapshot) return;

    this.undoStack.push(currentSnapshot);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    this.redoStack = [];
    this.notifyHistoryChange();
  }

  async undo() {
    if (!this.canUndo()) return;

    const currentState = this.undoStack.pop();
    this.redoStack.push(currentState);

    const previousState = this.undoStack[this.undoStack.length - 1];
    await this.restoreSnapshot(previousState);
  }

  async redo() {
    if (!this.canRedo()) return;

    const nextState = this.redoStack.pop();
    this.undoStack.push(nextState);

    await this.restoreSnapshot(nextState);
  }

  async restoreSnapshot(jsonString) {
    this.isRestoringState = true;
    try {
      const data = JSON.parse(jsonString);
      if (data.wallTextureUrl !== this.wallTextureUrl || data.floorTextureUrl !== this.floorTextureUrl) {
        this.wallTextureUrl = data.wallTextureUrl;
        this.floorTextureUrl = data.floorTextureUrl;
        await this.renderEnvironment();
      }
      await this.loadSceneElements(data.elements || []);
    } finally {
      this.isRestoringState = false;
      this.notifyHistoryChange();
    }
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  notifyHistoryChange() {
    if (this.onHistoryChange) {
      this.onHistoryChange(this.canUndo(), this.canRedo());
    }
  }

  notifyLayersChange() {
    if (this.onLayersChange) {
      this.onLayersChange(this.getSceneElements());
    }
  }
}
