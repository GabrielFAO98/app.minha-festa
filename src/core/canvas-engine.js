import Konva from 'konva';
import { createClipFunction, loadImageAsync } from './mask-renderer.js';
import { TEXTURE_WALL_BOISERIE, TEXTURE_FLOOR_WOOD } from './textures-data.js';

export class CanvasEngine {
  constructor() {
    this.stage = null;
    this.viewport = null; // Grupo raiz 4:3 com zoom e pan
    this.bgLayer = null;
    this.decorLayer = null;
    this.uiLayer = null;
    this.transformer = null;
    this.selectedNode = null;

    // Dimensões Fixas Virtuais 4:3 do Cenário
    this.VIRTUAL_WIDTH = 1200;
    this.VIRTUAL_HEIGHT = 900;
    this.WALL_HEIGHT = 630;
    this.FLOOR_HEIGHT = 270;

    // Escala métrica: 1200px virtuais equivalem a 350cm físicos reais
    this.pxPerCm = this.VIRTUAL_WIDTH / 350;

    // Estado da Câmera (Pan & Zoom)
    this.cameraScale = 1;
    this.isPanMode = false;

    // Texturas Atuais do Ambiente
    this.wallTextureUrl = TEXTURE_WALL_BOISERIE;
    this.floorTextureUrl = TEXTURE_FLOOR_WOOD;

    // Callback para UI
    this.onSelectionChange = null;
    this.onLayersChange = null;
  }

  init(container) {
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    this.stage = new Konva.Stage({
      container: container,
      width: containerW,
      height: containerH
    });

    // Camada principal com suporte a pan/zoom
    this.mainLayer = new Konva.Layer();
    this.stage.add(this.mainLayer);

    // Viewport Group onde todo o cenário 4:3 existe
    this.viewport = new Konva.Group({
      width: this.VIRTUAL_WIDTH,
      height: this.VIRTUAL_HEIGHT,
      name: 'viewport-root'
    });
    this.mainLayer.add(this.viewport);

    // Grupos internos do Viewport
    this.bgGroup = new Konva.Group({ name: 'bg-group' });
    this.decorGroup = new Konva.Group({ name: 'decor-group' });
    this.uiGroup = new Konva.Group({ name: 'ui-group' });

    this.viewport.add(this.bgGroup);
    this.viewport.add(this.decorGroup);
    this.viewport.add(this.uiGroup);

    // Setup do Transformer de Seleção
    this.setupTransformer();

    // Renderizar Ambiente Inicial Realista
    this.renderEnvironment();

    // Ajustar enquadramento 4:3 inicial proporcional à tela
    this.fitToView();

    // Eventos de Seleção e Desseleção no Palco
    this.stage.on('tap click', (e) => {
      if (this.isPanMode) return;
      if (e.target === this.stage || e.target.hasName('bg-element') || e.target === this.viewport) {
        this.deselect();
      }
    });

    // Suporte a Arrastar o Fundo (Pan da Câmera)
    this.setupPanAndZoom(container);

    // Resize responsivo da janela
    window.addEventListener('resize', () => {
      this.handleResize(container);
    });
  }

  // Enquadra perfeitamente o cenário 4:3 na tela (Mobile e Desktop)
  fitToView() {
    if (!this.stage || !this.viewport) return;
    const containerW = this.stage.width();
    const containerH = this.stage.height();

    // Margem de respiro de 16px
    const padding = 20;
    const availW = Math.max(280, containerW - padding * 2);
    const availH = Math.max(280, containerH - padding * 2);

    const baseScale = Math.min(availW / this.VIRTUAL_WIDTH, availH / this.VIRTUAL_HEIGHT);
    this.cameraScale = baseScale;

    this.viewport.scale({ x: baseScale, y: baseScale });
    this.viewport.position({
      x: (containerW - this.VIRTUAL_WIDTH * baseScale) / 2,
      y: (containerH - this.VIRTUAL_HEIGHT * baseScale) / 2
    });

    this.mainLayer.batchDraw();
  }

  // Zoom in e Zoom out
  setZoom(factor) {
    const currentScale = this.viewport.scaleX();
    const newScale = Math.max(0.2, Math.min(3.0, currentScale * factor));
    this.viewport.scale({ x: newScale, y: newScale });
    this.mainLayer.batchDraw();
  }

  // Ativa/Desativa modo de arrastar o fundo
  togglePanMode(active) {
    this.isPanMode = active !== undefined ? active : !this.isPanMode;
    this.viewport.draggable(this.isPanMode);
    this.stage.container().style.cursor = this.isPanMode ? 'grab' : 'default';
  }

  setupPanAndZoom(container) {
    // Zoom via Scroll do Mouse no Desktop
    this.stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const oldScale = this.viewport.scaleX();
      const pointer = this.stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - this.viewport.x()) / oldScale,
        y: (pointer.y - this.viewport.y()) / oldScale
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const factor = 1.08;
      const newScale = direction > 0 ? oldScale * factor : oldScale / factor;
      if (newScale < 0.2 || newScale > 3.5) return;

      this.viewport.scale({ x: newScale, y: newScale });
      this.viewport.position({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale
      });

      this.mainLayer.batchDraw();
    });
  }

  // Renderiza a Parede e o Piso Realista em 4:3
  async renderEnvironment() {
    this.bgGroup.destroyChildren();

    // 1. Parede Realista (1200 x 630)
    const wallImg = await loadImageAsync(this.wallTextureUrl);
    const wallNode = new Konva.Image({
      name: 'bg-element',
      x: 0,
      y: 0,
      width: this.VIRTUAL_WIDTH,
      height: this.WALL_HEIGHT,
      image: wallImg
    });

    // 2. Piso Realista em Perspectiva (1200 x 270)
    const floorImg = await loadImageAsync(this.floorTextureUrl);
    const floorNode = new Konva.Image({
      name: 'bg-element',
      x: 0,
      y: this.WALL_HEIGHT,
      width: this.VIRTUAL_WIDTH,
      height: this.FLOOR_HEIGHT,
      image: floorImg
    });

    // 3. Moldura de Borda Discreta 4:3
    const frameBorder = new Konva.Rect({
      name: 'bg-element',
      x: 0,
      y: 0,
      width: this.VIRTUAL_WIDTH,
      height: this.VIRTUAL_HEIGHT,
      stroke: 'rgba(255, 255, 255, 0.1)',
      strokeWidth: 2,
      listening: false
    });

    this.bgGroup.add(wallNode);
    this.bgGroup.add(floorNode);
    this.bgGroup.add(frameBorder);
    this.mainLayer.batchDraw();
  }

  async setEnvironmentTextures(wallUrl, floorUrl) {
    if (wallUrl) this.wallTextureUrl = wallUrl;
    if (floorUrl) this.floorTextureUrl = floorUrl;
    await this.renderEnvironment();
  }

  setupTransformer() {
    this.transformer = new Konva.Transformer({
      rotateAnchorOffset: 32,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      anchorSize: 18,
      anchorCornerRadius: 9,
      anchorStroke: '#ec4899',
      anchorFill: '#ffffff',
      anchorStrokeWidth: 2.5,
      borderStroke: '#ec4899',
      borderStrokeWidth: 2,
      borderDash: [6, 4],
      keepRatio: true
    });
    this.uiGroup.add(this.transformer);
  }

  // Adiciona item com limites de arrasto dentro do 1200x900
  async addItem(itemData, position = null) {
    const widthPx = Math.max(50, (itemData.widthCm || 60) * this.pxPerCm);
    const heightPx = Math.max(50, (itemData.heightCm || 60) * this.pxPerCm);

    // Posição padrão no piso
    const posX = position ? position.x : (this.VIRTUAL_WIDTH / 2 - widthPx / 2 + (Math.random() * 40 - 20));
    const posY = position ? position.y : (this.WALL_HEIGHT + 60 - heightPx + (Math.random() * 30 - 15));

    const group = new Konva.Group({
      x: posX,
      y: posY,
      width: widthPx,
      height: heightPx,
      draggable: true,
      name: 'decor-item',
      // Trava para NUNCA sair do frame visível 4:3
      dragBoundFunc: (pos) => {
        const stageScale = this.viewport.scaleX();
        const stageX = this.viewport.x();
        const stageY = this.viewport.y();

        const minX = stageX;
        const maxX = stageX + (this.VIRTUAL_WIDTH - widthPx) * stageScale;
        const minY = stageY;
        const maxY = stageY + (this.VIRTUAL_HEIGHT - heightPx) * stageScale;

        return {
          x: Math.max(minX, Math.min(maxX, pos.x)),
          y: Math.max(minY, Math.min(maxY, pos.y))
        };
      }
    });

    group.setAttr('itemMeta', {
      ...itemData,
      instanceId: 'inst-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      customCoverUrl: itemData.customCoverUrl || null
    });

    // 1. Sombra de Contato Realista 3D na base
    const shadow = new Konva.Ellipse({
      name: 'contact-shadow',
      x: widthPx / 2,
      y: heightPx - 2,
      radiusX: widthPx * 0.42,
      radiusY: 10,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: widthPx * 0.42,
      fillRadialGradientColorStops: [0, 'rgba(0, 0, 0, 0.45)', 0.6, 'rgba(0, 0, 0, 0.25)', 1, 'rgba(0, 0, 0, 0)'],
      listening: false
    });
    group.add(shadow);

    // 2. Imagem Base da Peça
    const imgElement = await loadImageAsync(itemData.previewUrl);
    const baseImage = new Konva.Image({
      name: 'base-image',
      image: imgElement,
      width: widthPx,
      height: heightPx
    });
    group.add(baseImage);

    // 3. Se tiver capa personalizada
    if (itemData.customCoverUrl) {
      await this.attachCoverToNode(group, itemData.customCoverUrl);
    }

    // Eventos de Seleção
    group.on('tap click', (e) => {
      e.cancelBubble = true;
      this.selectNode(group);
    });

    group.on('dragstart', () => {
      this.selectNode(group);
    });

    this.decorGroup.add(group);
    this.mainLayer.batchDraw();

    this.selectNode(group);
    this.notifyLayersChange();

    return group;
  }

  selectNode(node) {
    if (this.selectedNode === node) return;

    this.selectedNode = node;
    this.transformer.nodes(node ? [node] : []);
    this.mainLayer.batchDraw();

    if (this.onSelectionChange) {
      const meta = node ? node.getAttr('itemMeta') : null;
      this.onSelectionChange(meta, node);
    }
  }

  deselect() {
    this.selectedNode = null;
    this.transformer.nodes([]);
    this.mainLayer.batchDraw();

    if (this.onSelectionChange) {
      this.onSelectionChange(null, null);
    }
  }

  async applyCoverToSelected(coverImageUrl) {
    if (!this.selectedNode) return;
    await this.attachCoverToNode(this.selectedNode, coverImageUrl);
    this.mainLayer.batchDraw();
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

    const coverGroup = new Konva.Group({
      name: 'cover-group',
      clipFunc: clipFunc
    });

    const coverImageNode = new Konva.Image({
      image: coverImg,
      x: 0,
      y: 0,
      width: w,
      height: h
    });

    coverGroup.add(coverImageNode);
    node.add(coverGroup);
    node.getLayer()?.batchDraw();
  }

  // --- GERENCIAMENTO DE CAMADAS (ESTILO CANVA) ---

  // Avançar 1 camada (para frente)
  bringForward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveUp();
    this.mainLayer.batchDraw();
    this.notifyLayersChange();
  }

  // Recuar 1 camada (para trás)
  sendBackward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveDown();
    this.mainLayer.batchDraw();
    this.notifyLayersChange();
  }

  // Mover para o primeiro plano (topo absoluto)
  bringToFront() {
    if (!this.selectedNode) return;
    this.selectedNode.moveToTop();
    this.mainLayer.batchDraw();
    this.notifyLayersChange();
  }

  // Mover para o fundo absoluto (base da pilha)
  sendToBack() {
    if (!this.selectedNode) return;
    this.selectedNode.moveToBottom();
    this.mainLayer.batchDraw();
    this.notifyLayersChange();
  }

  // Travar ou destravar posição
  toggleLockNode(node = null) {
    const target = node || this.selectedNode;
    if (!target) return false;

    const isDraggable = target.draggable();
    target.draggable(!isDraggable);

    if (this.selectedNode === target) {
      if (!isDraggable) {
        // Agora está travado
        this.transformer.enabledAnchors([]);
        this.transformer.rotateEnabled(false);
      } else {
        // Agora está livre
        this.transformer.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
        this.transformer.rotateEnabled(true);
      }
    }

    this.mainLayer.batchDraw();
    this.notifyLayersChange();
    return isDraggable; // retorna true se agora está travado
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
    this.mainLayer.batchDraw();
  }

  async duplicateSelected() {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta');
    const newPos = {
      x: Math.min(this.VIRTUAL_WIDTH - 80, this.selectedNode.x() + 30),
      y: Math.min(this.VIRTUAL_HEIGHT - 80, this.selectedNode.y() + 30)
    };
    await this.addItem({ ...meta }, newPos);
  }

  deleteSelected() {
    if (!this.selectedNode) return;
    const node = this.selectedNode;
    this.deselect();
    node.destroy();
    this.mainLayer.batchDraw();
    this.notifyLayersChange();
  }

  clearScene() {
    this.deselect();
    this.decorGroup.destroyChildren();
    this.mainLayer.batchDraw();
    this.notifyLayersChange();
  }

  exportHDImage() {
    this.deselect();
    // Exporta estritamente o enquadramento 4:3 perfeito (1200x900) em altíssima resolução
    return this.viewport.toDataURL({
      pixelRatio: 2.0,
      mimeType: 'image/png'
    });
  }

  getSceneNodes() {
    return this.decorGroup.getChildren();
  }

  getSceneElements() {
    const items = [];
    const children = this.decorGroup.getChildren();
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
    this.clearScene();
    for (const elem of elements) {
      const node = await this.addItem(elem, { x: elem.x, y: elem.y });
      if (node) {
        node.scaleX(elem.scaleX || 1);
        node.scaleY(elem.scaleY || 1);
        node.rotation(elem.rotation || 0);
      }
    }
    this.deselect();
  }

  notifyLayersChange() {
    if (this.onLayersChange) {
      this.onLayersChange();
    }
  }

  handleResize(container) {
    if (!this.stage) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.stage.width(width);
    this.stage.height(height);
    this.fitToView();
  }
}
