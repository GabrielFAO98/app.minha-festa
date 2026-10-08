import Konva from 'konva';
import { createClipFunction, loadImageAsync } from './mask-renderer.js';
import { TEXTURE_WALL_BOISERIE, TEXTURE_FLOOR_WOOD } from './textures-data.js';

export class CanvasEngine {
  constructor() {
    this.stage = null;
    this.viewport = null;
    this.bgGroup = null;
    this.decorGroup = null;
    this.uiGroup = null;
    this.transformer = null;
    this.selectedNode = null;

    // Resolução Virtual Widescreen 16:9 Nativa
    this.VIRTUAL_WIDTH = 1600;
    this.VIRTUAL_HEIGHT = 900;
    this.WALL_HEIGHT = 640;
    this.FLOOR_HEIGHT = 260;

    // Escala métrica: 1600px virtuais equivalem a 400cm físicos reais (4 metros)
    this.pxPerCm = this.VIRTUAL_WIDTH / 400;

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

    this.mainLayer = new Konva.Layer();
    this.stage.add(this.mainLayer);

    // Viewport Group 16:9
    this.viewport = new Konva.Group({
      width: this.VIRTUAL_WIDTH,
      height: this.VIRTUAL_HEIGHT,
      name: 'viewport-16-9'
    });
    this.mainLayer.add(this.viewport);

    this.bgGroup = new Konva.Group({ name: 'bg-group' });
    this.decorGroup = new Konva.Group({ name: 'decor-group' });
    this.uiGroup = new Konva.Group({ name: 'ui-group' });

    this.viewport.add(this.bgGroup);
    this.viewport.add(this.decorGroup);
    this.viewport.add(this.uiGroup);

    this.setupTransformer();
    this.renderEnvironment();
    this.fitToView();

    // Toque no fundo desseleciona a peça
    this.stage.on('tap click', (e) => {
      if (e.target === this.stage || e.target.hasName('bg-element') || e.target === this.viewport) {
        this.deselect();
      }
    });

    window.addEventListener('resize', () => {
      this.handleResize(container);
    });
  }

  // Enquadra a proporção 16:9 na tela do mobile com aproveitamento total
  fitToView() {
    if (!this.stage || !this.viewport) return;
    const containerW = this.stage.width();
    const containerH = this.stage.height();

    // Escala para caber exatamente na largura disponível do celular
    const scale = Math.min(containerW / this.VIRTUAL_WIDTH, containerH / this.VIRTUAL_HEIGHT);

    this.viewport.scale({ x: scale, y: scale });
    this.viewport.position({
      x: (containerW - this.VIRTUAL_WIDTH * scale) / 2,
      y: (containerH - this.VIRTUAL_HEIGHT * scale) / 2
    });

    this.mainLayer.batchDraw();
  }

  // Renderiza a Parede e o Piso 16:9
  async renderEnvironment() {
    this.bgGroup.destroyChildren();

    // 1. Parede Realista (1600 x 640)
    const wallImg = await loadImageAsync(this.wallTextureUrl);
    const wallNode = new Konva.Image({
      name: 'bg-element',
      x: 0,
      y: 0,
      width: this.VIRTUAL_WIDTH,
      height: this.WALL_HEIGHT,
      image: wallImg
    });

    // 2. Piso Realista (1600 x 260)
    const floorImg = await loadImageAsync(this.floorTextureUrl);
    const floorNode = new Konva.Image({
      name: 'bg-element',
      x: 0,
      y: this.WALL_HEIGHT,
      width: this.VIRTUAL_WIDTH,
      height: this.FLOOR_HEIGHT,
      image: floorImg
    });

    this.bgGroup.add(wallNode);
    this.bgGroup.add(floorNode);
    this.mainLayer.batchDraw();
  }

  async setEnvironmentTextures(wallUrl, floorUrl) {
    if (wallUrl) this.wallTextureUrl = wallUrl;
    if (floorUrl) this.floorTextureUrl = floorUrl;
    await this.renderEnvironment();
  }

  setupTransformer() {
    this.transformer = new Konva.Transformer({
      rotateAnchorOffset: 28,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      anchorSize: 22, // Âncoras maiores e fáceis para tocar no celular
      anchorCornerRadius: 11,
      anchorStroke: '#ec4899',
      anchorFill: '#ffffff',
      anchorStrokeWidth: 3,
      borderStroke: '#ec4899',
      borderStrokeWidth: 2,
      borderDash: [6, 4],
      keepRatio: true
    });
    this.uiGroup.add(this.transformer);
  }

  // Adiciona item limpo (SEM SOMBRA ARTIFICIAL)
  async addItem(itemData, position = null) {
    const widthPx = Math.max(60, (itemData.widthCm || 60) * this.pxPerCm);
    const heightPx = Math.max(60, (itemData.heightCm || 60) * this.pxPerCm);

    // Posição padrão centralizada no chão da cena 16:9
    const posX = position ? position.x : (this.VIRTUAL_WIDTH / 2 - widthPx / 2 + (Math.random() * 40 - 20));
    const posY = position ? position.y : (this.WALL_HEIGHT + 40 - heightPx + (Math.random() * 20 - 10));

    const group = new Konva.Group({
      x: posX,
      y: posY,
      width: widthPx,
      height: heightPx,
      draggable: true,
      name: 'decor-item',
      // Trava para manter dentro dos limites 16:9
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

    // Imagem base da peça (recorte puro sem sombra preta embaixo)
    const imgElement = await loadImageAsync(itemData.previewUrl);
    const baseImage = new Konva.Image({
      name: 'base-image',
      image: imgElement,
      width: widthPx,
      height: heightPx
    });
    group.add(baseImage);

    // Capa personalizada se houver
    if (itemData.customCoverUrl) {
      await this.attachCoverToNode(group, itemData.customCoverUrl);
    }

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

  // --- CONTROLE DE CAMADAS DIRETO ---
  bringForward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveUp();
    this.mainLayer.batchDraw();
    this.notifyLayersChange();
  }

  sendBackward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveDown();
    this.mainLayer.batchDraw();
    this.notifyLayersChange();
  }

  bringToFront() {
    if (!this.selectedNode) return;
    this.selectedNode.moveToTop();
    this.mainLayer.batchDraw();
    this.notifyLayersChange();
  }

  sendToBack() {
    if (!this.selectedNode) return;
    this.selectedNode.moveToBottom();
    this.mainLayer.batchDraw();
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
    this.mainLayer.batchDraw();
  }

  async duplicateSelected() {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta');
    const newPos = {
      x: Math.min(this.VIRTUAL_WIDTH - 100, this.selectedNode.x() + 40),
      y: Math.min(this.VIRTUAL_HEIGHT - 100, this.selectedNode.y() + 40)
    };
    await this.addItem({ ...meta }, newPos);
  }

  // Exclusão rápida e direta da peça selecionada
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
