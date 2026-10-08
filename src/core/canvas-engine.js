import Konva from 'konva';
import { createClipFunction, loadImageAsync } from './mask-renderer.js';

export class CanvasEngine {
  constructor() {
    this.stage = null;
    this.bgLayer = null;
    this.decorLayer = null;
    this.uiLayer = null;
    this.transformer = null;
    this.selectedNode = null;

    // Escala métrica: 300cm de largura visível padrão
    this.sceneWidthCm = 320;
    this.pxPerCm = 1;

    // Configurações do Ambiente
    this.environment = {
      wallColor: '#1e293b',
      floorColor: '#0f172a',
      wallGradientEnd: '#0f172a'
    };

    // Callback para UI
    this.onSelectionChange = null;
  }

  init(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.pxPerCm = width / this.sceneWidthCm;

    this.stage = new Konva.Stage({
      container: container,
      width: width,
      height: height
    });

    // Camadas
    this.bgLayer = new Konva.Layer();
    this.decorLayer = new Konva.Layer();
    this.uiLayer = new Konva.Layer();

    this.stage.add(this.bgLayer);
    this.stage.add(this.decorLayer);
    this.stage.add(this.uiLayer);

    // Inicializar Fundo de Parede e Piso
    this.renderEnvironment();

    // Inicializar Transformer de Seleção
    this.setupTransformer();

    // Eventos de Toque e Seleção no Palco
    this.stage.on('tap click', (e) => {
      // Se clicou no fundo vazio, desseleciona
      if (e.target === this.stage || e.target.hasName('bg-element')) {
        this.deselect();
      }
    });

    // Resize responsivo
    window.addEventListener('resize', () => {
      this.handleResize(container);
    });
  }

  renderEnvironment() {
    this.bgLayer.destroyChildren();

    const w = this.stage.width();
    const h = this.stage.height();
    const floorHeight = h * 0.28;
    const wallHeight = h - floorHeight;

    // Parede de Fundo (Wall)
    const wall = new Konva.Rect({
      name: 'bg-element',
      x: 0,
      y: 0,
      width: w,
      height: wallHeight,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: wallHeight },
      fillLinearGradientColorStops: [0, this.environment.wallColor, 1, this.environment.wallGradientEnd]
    });

    // Rodapé de Parede
    const baseboard = new Konva.Rect({
      name: 'bg-element',
      x: 0,
      y: wallHeight - 8,
      width: w,
      height: 8,
      fill: 'rgba(255, 255, 255, 0.08)'
    });

    // Chão / Piso (Floor) com perspectiva
    const floor = new Konva.Rect({
      name: 'bg-element',
      x: 0,
      y: wallHeight,
      width: w,
      height: floorHeight,
      fillLinearGradientStartPoint: { x: 0, y: wallHeight },
      fillLinearGradientEndPoint: { x: 0, y: h },
      fillLinearGradientColorStops: [0, this.environment.floorColor, 1, '#050811']
    });

    // Linhas sutis de tábuas de piso para noção de profundidade
    const gridGroup = new Konva.Group({ name: 'bg-element' });
    const lineCount = 7;
    for (let i = 0; i <= lineCount; i++) {
      const xStart = (w / lineCount) * i;
      const xOffset = (i - lineCount / 2) * 45;
      const floorLine = new Konva.Line({
        name: 'bg-element',
        points: [xStart, wallHeight, xStart + xOffset, h],
        stroke: 'rgba(255, 255, 255, 0.03)',
        strokeWidth: 1.5
      });
      gridGroup.add(floorLine);
    }

    this.bgLayer.add(wall);
    this.bgLayer.add(baseboard);
    this.bgLayer.add(floor);
    this.bgLayer.add(gridGroup);
    this.bgLayer.batchDraw();
  }

  setEnvironment(wallColor, floorColor) {
    this.environment.wallColor = wallColor;
    this.environment.wallGradientEnd = this.darkenHex(wallColor, 20);
    this.environment.floorColor = floorColor;
    this.renderEnvironment();
  }

  darkenHex(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  setupTransformer() {
    this.transformer = new Konva.Transformer({
      rotateAnchorOffset: 30,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      anchorSize: 16,
      anchorCornerRadius: 8,
      anchorStroke: '#ec4899',
      anchorFill: '#ffffff',
      anchorStrokeWidth: 2,
      borderStroke: '#ec4899',
      borderStrokeWidth: 2,
      borderDash: [5, 4],
      keepRatio: true
    });
    this.uiLayer.add(this.transformer);
  }

  async addItem(itemData, position = null) {
    // Dimensões em pixels calculadas pela proporção física
    const widthPx = Math.max(40, (itemData.widthCm || 60) * this.pxPerCm);
    const heightPx = Math.max(40, (itemData.heightCm || 60) * this.pxPerCm);

    // Posição padrão centralizada no chão
    const posX = position ? position.x : (this.stage.width() / 2 - widthPx / 2 + (Math.random() * 30 - 15));
    const posY = position ? position.y : (this.stage.height() * 0.72 - heightPx + (Math.random() * 20 - 10));

    const group = new Konva.Group({
      x: posX,
      y: posY,
      width: widthPx,
      height: heightPx,
      draggable: true,
      name: 'decor-item'
    });

    // Guardar metadados no nó
    group.setAttr('itemMeta', {
      ...itemData,
      instanceId: 'inst-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      customCoverUrl: itemData.customCoverUrl || null
    });

    // Carregar imagem base da peça
    const imgElement = await loadImageAsync(itemData.previewUrl);

    const baseImage = new Konva.Image({
      name: 'base-image',
      image: imgElement,
      width: widthPx,
      height: heightPx
    });
    group.add(baseImage);

    // Se já tiver capa personalizada pré-atribuída
    if (itemData.customCoverUrl) {
      await this.attachCoverToNode(group, itemData.customCoverUrl);
    }

    // Eventos de Seleção no Elemento
    group.on('tap click', (e) => {
      e.cancelBubble = true;
      this.selectNode(group);
    });

    group.on('dragstart', () => {
      this.selectNode(group);
    });

    this.decorLayer.add(group);
    this.decorLayer.batchDraw();

    // Seleciona o novo item automaticamente
    this.selectNode(group);

    return group;
  }

  selectNode(node) {
    if (this.selectedNode === node) return;

    this.selectedNode = node;
    this.transformer.nodes([node]);
    this.uiLayer.batchDraw();

    if (this.onSelectionChange) {
      const meta = node.getAttr('itemMeta');
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
  }

  async attachCoverToNode(node, coverImageUrl) {
    const meta = node.getAttr('itemMeta');
    meta.customCoverUrl = coverImageUrl;
    node.setAttr('itemMeta', meta);

    // Remover capa existente anterior se houver
    const existingCoverGroup = node.findOne('.cover-group');
    if (existingCoverGroup) {
      existingCoverGroup.destroy();
    }

    if (!coverImageUrl) {
      return;
    }

    const w = node.width();
    const h = node.height();
    const coverImg = await loadImageAsync(coverImageUrl);

    // Criar grupo com máscara adequada para o tipo da peça
    const clipFunc = createClipFunction(meta.type, w, h);

    const coverGroup = new Konva.Group({
      name: 'cover-group',
      clipFunc: clipFunc
    });

    // Imagem da capa dentro da máscara
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

  bringForward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveUp();
    this.decorLayer.batchDraw();
  }

  sendBackward() {
    if (!this.selectedNode) return;
    this.selectedNode.moveDown();
    this.decorLayer.batchDraw();
  }

  flipHorizontal() {
    if (!this.selectedNode) return;
    const currentScale = this.selectedNode.scaleX();
    this.selectedNode.scaleX(-currentScale);

    // Ajusta o offset para girar no próprio centro ao espelhar
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
      x: this.selectedNode.x() + 25,
      y: this.selectedNode.y() + 25
    };
    await this.addItem({ ...meta }, newPos);
  }

  deleteSelected() {
    if (!this.selectedNode) return;
    const node = this.selectedNode;
    this.deselect();
    node.destroy();
    this.decorLayer.batchDraw();
  }

  clearScene() {
    this.deselect();
    this.decorLayer.destroyChildren();
    this.decorLayer.batchDraw();
  }

  exportHDImage() {
    this.deselect();
    return this.stage.toDataURL({
      pixelRatio: 2.5,
      mimeType: 'image/png'
    });
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

  handleResize(container) {
    if (!this.stage) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.stage.width(width);
    this.stage.height(height);
    this.pxPerCm = width / this.sceneWidthCm;
    this.renderEnvironment();
    this.decorLayer.batchDraw();
    this.uiLayer.batchDraw();
  }
}
