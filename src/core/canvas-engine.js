import Konva from 'konva';
import { createClipFunction, loadImageAsync } from './mask-renderer.js';
import { TEXTURE_WALL_BOISERIE, TEXTURE_FLOOR_WOOD } from './textures-data.js';

// OTIMIZAÇÃO CRÍTICA PARA MOBILE: Desativa detecção de colisão durante o arrasto
Konva.hitOnDragEnabled = false;

export class CanvasEngine {
  constructor() {
    this.stage = null;
    this.bgLayer = null;    // Camada Estática de Fundo (Nunca repinta no drag)
    this.decorLayer = null; // Camada Rápida dos Elementos de Decoração
    this.uiLayer = null;    // Camada Leve do Transformer de Seleção
    this.transformer = null;
    this.selectedNode = null;

    // Resolução Virtual VERTICAL 9:16 Nativa (1080 x 1920)
    this.VIRTUAL_WIDTH = 1080;
    this.VIRTUAL_HEIGHT = 1920;
    this.WALL_HEIGHT = 1380;
    this.FLOOR_HEIGHT = 540;

    // Escala métrica: 1080px virtuais equivalem a 280cm físicos na parede
    this.pxPerCm = this.VIRTUAL_WIDTH / 280;

    // Texturas Atuais do Ambiente
    this.wallTextureUrl = TEXTURE_WALL_BOISERIE;
    this.floorTextureUrl = TEXTURE_FLOOR_WOOD;

    // Callbacks para UI
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

    // 1. CAMADA DE FUNDO ISOLADA (Renderiza uma única vez na GPU)
    this.bgLayer = new Konva.Layer({ listening: false });
    this.stage.add(this.bgLayer);

    // 2. CAMADA DE DECORAÇÃO (Apenas itens móveis)
    this.decorLayer = new Konva.Layer();
    this.stage.add(this.decorLayer);

    // 3. CAMADA DE INTERFACE (Transformer de seleção)
    this.uiLayer = new Konva.Layer();
    this.stage.add(this.uiLayer);

    this.setupTransformer();
    this.renderEnvironment();
    this.fitToView();

    // Desseleção rápida ao tocar no fundo vazio
    this.stage.on('tap click pointerdown', (e) => {
      if (e.target === this.stage || e.target.hasName('bg-element')) {
        this.deselect();
      }
    });

    window.addEventListener('resize', () => {
      this.handleResize(container);
    });
  }

  // Ajusta a escala e posição de enquadramento 9:16 diretamente no Stage (Aceleração por Hardware)
  fitToView() {
    if (!this.stage) return;
    const containerW = this.stage.width();
    const containerH = this.stage.height();

    const scale = Math.min(containerW / this.VIRTUAL_WIDTH, containerH / this.VIRTUAL_HEIGHT);
    const offsetX = (containerW - this.VIRTUAL_WIDTH * scale) / 2;
    const offsetY = (containerH - this.VIRTUAL_HEIGHT * scale) / 2;

    // Aplica o enquadramento 9:16 nas 3 camadas
    [this.bgLayer, this.decorLayer, this.uiLayer].forEach((layer) => {
      if (layer) {
        layer.scale({ x: scale, y: scale });
        layer.position({ x: offsetX, y: offsetY });
        layer.batchDraw();
      }
    });
  }

  // Renderiza Parede e Piso na camada bgLayer estática (Zero repintura no arrasto)
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
    this.uiLayer.add(this.transformer);
  }

  // Adiciona item com arrasto super rápido e sem lag
  async addItem(itemData, position = null) {
    const widthPx = Math.max(70, (itemData.widthCm || 60) * this.pxPerCm);
    const heightPx = Math.max(70, (itemData.heightCm || 60) * this.pxPerCm);

    const posX = position ? position.x : (this.VIRTUAL_WIDTH / 2 - widthPx / 2 + (Math.random() * 40 - 20));
    const posY = position ? position.y : (this.WALL_HEIGHT + 80 - heightPx + (Math.random() * 30 - 15));

    const group = new Konva.Group({
      x: posX,
      y: posY,
      width: widthPx,
      height: heightPx,
      draggable: true,
      name: 'decor-item',
      // Limites de arrasto ultra-rápidos dentro da resolução 1080 x 1920
      dragBoundFunc: (pos) => {
        const layer = group.getLayer();
        const scale = layer ? layer.scaleX() : 1;
        const offsetX = layer ? layer.x() : 0;
        const offsetY = layer ? layer.y() : 0;

        const minX = offsetX;
        const maxX = offsetX + (this.VIRTUAL_WIDTH - widthPx) * scale;
        const minY = offsetY;
        const maxY = offsetY + (this.VIRTUAL_HEIGHT - heightPx) * scale;

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

    const imgElement = await loadImageAsync(itemData.previewUrl);
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

    // DISPARO IMEDIATO AO TOCAR NO ITEM
    group.on('pointerdown tap click', (e) => {
      e.cancelBubble = true;
      this.selectNode(group);
    });

    // Durante o drag, atualiza apenas a posição do transformer de forma ultra leve
    group.on('dragmove', () => {
      this.uiLayer.batchDraw();
    });

    group.on('dragend', () => {
      this.uiLayer.batchDraw();
      this.notifyLayersChange();
    });

    this.decorLayer.add(group);
    this.decorLayer.batchDraw();

    this.selectNode(group);
    this.notifyLayersChange();

    return group;
  }

  selectNode(node) {
    this.selectedNode = node;
    this.transformer.nodes(node ? [node] : []);
    this.uiLayer.batchDraw();

    if (this.onSelectionChange) {
      const meta = node ? node.getAttr('itemMeta') : null;
      this.onSelectionChange(meta, node);
    }
  }

  deselect() {
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
    this.decorLayer.batchDraw();
  }

  bringForward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveUp();
    this.decorLayer.batchDraw();
    this.notifyLayersChange();
  }

  sendBackward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveDown();
    this.decorLayer.batchDraw();
    this.notifyLayersChange();
  }

  bringToFront() {
    if (!this.selectedNode) return;
    this.selectedNode.moveToTop();
    this.decorLayer.batchDraw();
    this.notifyLayersChange();
  }

  sendToBack() {
    if (!this.selectedNode) return;
    this.selectedNode.moveToBottom();
    this.decorLayer.batchDraw();
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
  }

  async duplicateSelected() {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta');
    const newPos = {
      x: Math.min(this.VIRTUAL_WIDTH - 120, this.selectedNode.x() + 40),
      y: Math.min(this.VIRTUAL_HEIGHT - 120, this.selectedNode.y() + 40)
    };
    await this.addItem({ ...meta }, newPos);
  }

  deleteSelected() {
    if (!this.selectedNode) return;
    const node = this.selectedNode;
    this.deselect();
    node.destroy();
    this.decorLayer.batchDraw();
    this.notifyLayersChange();
  }

  clearScene() {
    this.deselect();
    this.decorGroup.destroyChildren();
    this.decorLayer.batchDraw();
    this.notifyLayersChange();
  }

  exportHDImage() {
    this.deselect();
    return this.stage.toDataURL({
      pixelRatio: 1.5,
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
