import Konva from 'konva';
import {
  createClipFunction,
  calculateCoverPlacement,
  loadImageAsync,
  isPointInsideMask,
  createShadingOverlay,
  createCylinderFloorShadow
} from './mask-renderer';
import { TEXTURE_WALL_BOISERIE, TEXTURE_FLOOR_WOOD } from './textures-data';
import { generateBalloonArchDataUrl } from './balloon-generator';
import { getItemCustomizationMode, generateModularSvgDataUrl } from './modular-svg-generator';

import type { PresetItem, SceneElement } from '../types';

// OTIMIZAÇÃO CRÍTICA PARA MOBILE: Desativa detecção de colisão durante o arrasto contínuo
Konva.hitOnDragEnabled = false;

export class CanvasEngine {
  stage: Konva.Stage | null;
  bgLayer: Konva.Layer | null;
  decorLayer: Konva.Layer;
  uiLayer: Konva.Layer | null;
  transformer: Konva.Transformer | null;
  selectedNode: Konva.Group | null;

  VIRTUAL_WIDTH: number;
  VIRTUAL_HEIGHT: number;
  WALL_HEIGHT: number;
  FLOOR_HEIGHT: number;
  pxPerCm: number;

  wallTextureUrl: string;
  floorTextureUrl: string;

  undoStack: string[];
  redoStack: string[];
  maxHistory: number;
  isRestoringState: boolean;

  // Modo Enquadrar Capa (Estilo Facebook Cover Reposition)
  isRepositioningCover: boolean;
  private isDraggingCoverInternal: boolean;
  private lastCoverDragPt: { x: number; y: number } | null;

  hitCanvas: HTMLCanvasElement;
  hitCtx: CanvasRenderingContext2D | null;

  onSelectionChange: ((meta: PresetItem | null, node: Konva.Group | null) => void) | null;
  onLayersChange: ((elements: SceneElement[]) => void) | null;
  onHistoryChange: ((canUndo: boolean, canRedo: boolean) => void) | null;
  onCoverRepositionChange: ((isActive: boolean, meta: PresetItem | null) => void) | null;

  constructor() {
    this.stage = null;
    this.bgLayer = null;
    this.decorLayer = null as unknown as Konva.Layer;
    this.uiLayer = null;
    this.transformer = null;
    this.selectedNode = null;

    this.VIRTUAL_WIDTH = 1080;
    this.VIRTUAL_HEIGHT = 1920;
    this.WALL_HEIGHT = 1380;
    this.FLOOR_HEIGHT = 540;

    this.pxPerCm = this.VIRTUAL_WIDTH / 280;

    this.wallTextureUrl = TEXTURE_WALL_BOISERIE;
    this.floorTextureUrl = TEXTURE_FLOOR_WOOD;

    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 35;
    this.isRestoringState = false;

    this.isRepositioningCover = false;
    this.isDraggingCoverInternal = false;
    this.lastCoverDragPt = null;

    this.hitCanvas = document.createElement('canvas');
    this.hitCanvas.width = 1;
    this.hitCanvas.height = 1;
    this.hitCtx = this.hitCanvas.getContext('2d', { willReadFrequently: true });

    this.onSelectionChange = null;
    this.onLayersChange = null;
    this.onHistoryChange = null;
    this.onCoverRepositionChange = null;
  }

  init(container: HTMLElement | null) {
    if (!container) return;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    this.stage = new Konva.Stage({
      container: container as HTMLDivElement,
      width: containerW,
      height: containerH
    });

    this.bgLayer = new Konva.Layer({ listening: false });
    this.stage.add(this.bgLayer);

    this.decorLayer = new Konva.Layer();
    this.stage.add(this.decorLayer);

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

  handleResize(container: HTMLElement | null) {
    if (!this.stage || !container) return;
    const newW = container.clientWidth;
    const newH = container.clientHeight;
    if (newW > 0 && newH > 0) {
      this.stage.width(newW);
      this.stage.height(newH);
      this.fitToView();
    }
  }

  async renderEnvironment() {
    if (!this.bgLayer) return;
    this.bgLayer.destroyChildren();

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

  async setEnvironmentTextures(wallUrl: string | null, floorUrl: string | null) {
    if (wallUrl) this.wallTextureUrl = wallUrl;
    if (floorUrl) this.floorTextureUrl = floorUrl;
    await this.renderEnvironment();
    this.saveSnapshot();
  }

  setupTransformer() {
    if (!this.uiLayer) return;
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
  // SELEÇÃO E ENQUADRAMENTO DE CAPA ESTILO FACEBOOK
  // ========================================================
  setupSmartSelection() {
    if (!this.stage) return;

    this.stage.on('pointerdown', (e) => {
      if (!this.stage) return;

      // Se estamos no modo de enquadrar capa estilo Facebook
      if (this.isRepositioningCover && this.selectedNode) {
        const pointerPos = this.stage.getPointerPosition();
        if (!pointerPos) return;
        const candidates = this.findOpaqueItemsAtPoint(pointerPos);
        if (candidates.includes(this.selectedNode)) {
          this.isDraggingCoverInternal = true;
          const transform = this.selectedNode.getAbsoluteTransform().copy().invert();
          this.lastCoverDragPt = transform.point(pointerPos);
          return;
        } else {
          // Clicou fora da peça: finaliza o modo de enquadramento
          this.exitCoverRepositionMode();
        }
      }

      if (e.target && (e.target.getParent() === (this.transformer as any) || (e.target as any) === this.transformer)) {
        return;
      }

      const pointerPos = this.stage.getPointerPosition();
      if (!pointerPos) return;

      const candidates = this.findOpaqueItemsAtPoint(pointerPos);

      if (candidates.length === 0) {
        this.deselect();
        return;
      }

      const isAlreadySelected = this.selectedNode && candidates.includes(this.selectedNode);

      if (isAlreadySelected && this.selectedNode) {
        const targetNode = this.selectedNode;
        targetNode.draggable(true);
        targetNode.startDrag({ evt: e.evt });
      } else {
        const targetNode = candidates[0];
        this.selectNode(targetNode);
      }
    });

    this.stage.on('pointermove', () => {
      if (!this.isRepositioningCover || !this.isDraggingCoverInternal || !this.selectedNode || !this.stage) return;
      const pointerPos = this.stage.getPointerPosition();
      if (!pointerPos || !this.lastCoverDragPt) return;

      const transform = this.selectedNode.getAbsoluteTransform().copy().invert();
      const currentPt = transform.point(pointerPos);
      const dx = currentPt.x - this.lastCoverDragPt.x;
      const dy = currentPt.y - this.lastCoverDragPt.y;
      this.lastCoverDragPt = currentPt;

      this.panSelectedCoverBy(dx, dy);
    });

    window.addEventListener('pointerup', () => {
      if (this.isDraggingCoverInternal) {
        this.isDraggingCoverInternal = false;
        this.lastCoverDragPt = null;
      }
    });

    // Zoom da capa com roda do mouse quando em Modo Enquadrar Capa
    this.stage.on('wheel', (e) => {
      if (!this.isRepositioningCover || !this.selectedNode) return;
      e.evt.preventDefault();
      const meta = this.selectedNode.getAttr('itemMeta') || {};
      if (!meta.customCoverUrl) return;
      const currentScale = meta.coverScale || 1;
      const delta = e.evt.deltaY < 0 ? 0.08 : -0.08;
      this.setCoverScale(currentScale + delta, false);
    });

    // Duplo clique / duplo toque em peça com capa ativa o Modo Enquadrar Capa estilo Facebook
    this.stage.on('dblclick dbltap', () => {
      if (!this.selectedNode) return;
      const meta = this.selectedNode.getAttr('itemMeta') || {};
      if (meta.customCoverUrl) {
        if (this.isRepositioningCover) {
          this.exitCoverRepositionMode();
        } else {
          this.enterCoverRepositionMode();
        }
      }
    });

    this.stage.on('click tap', (e) => {
      if (this.isRepositioningCover) return;
      if (!this.stage) return;
      if (e.target && (e.target.getParent() === (this.transformer as any) || (e.target as any) === this.transformer)) {
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

  enterCoverRepositionMode() {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta') || {};
    if (!meta.customCoverUrl) return;

    this.isRepositioningCover = true;
    this.selectedNode.draggable(false);
    if (this.transformer) {
      this.transformer.borderStroke('#f59e0b');
      this.transformer.borderDash([4, 4]);
      this.transformer.enabledAnchors([]);
      this.transformer.rotateEnabled(false);
      this.uiLayer?.batchDraw();
    }
    if (this.stage) {
      this.stage.container().style.cursor = 'grab';
    }
    if (this.onCoverRepositionChange) {
      this.onCoverRepositionChange(true, meta);
    }
  }

  exitCoverRepositionMode(saveSnap: boolean = true) {
    if (!this.isRepositioningCover) return;
    this.isRepositioningCover = false;
    this.isDraggingCoverInternal = false;
    this.lastCoverDragPt = null;

    if (this.selectedNode) {
      this.selectedNode.draggable(true);
    }
    if (this.transformer) {
      this.transformer.borderStroke('#ec4899');
      this.transformer.borderDash([6, 4]);
      this.transformer.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
      this.transformer.rotateEnabled(true);
      this.uiLayer?.batchDraw();
    }
    if (this.stage) {
      this.stage.container().style.cursor = 'default';
    }
    if (saveSnap) {
      this.saveSnapshot();
    }
    const meta = this.selectedNode ? this.selectedNode.getAttr('itemMeta') : null;
    if (this.onCoverRepositionChange) {
      this.onCoverRepositionChange(false, meta);
    }
  }

  panSelectedCoverBy(dx: number, dy: number) {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta') || {};
    if (!meta.customCoverUrl) return;

    meta.coverOffsetX = (meta.coverOffsetX || 0) + dx;
    meta.coverOffsetY = (meta.coverOffsetY || 0) + dy;
    this.selectedNode.setAttr('itemMeta', meta);

    this.refreshCoverPlacementOnNode(this.selectedNode);
  }

  setCoverScale(newScale: number, saveSnap: boolean = false) {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta') || {};
    if (!meta.customCoverUrl) return;

    const clamped = Math.max(0.4, Math.min(3.2, newScale));
    meta.coverScale = clamped;
    this.selectedNode.setAttr('itemMeta', meta);

    this.refreshCoverPlacementOnNode(this.selectedNode);
    if (saveSnap) {
      this.saveSnapshot();
    }
    if (this.onCoverRepositionChange && this.isRepositioningCover) {
      this.onCoverRepositionChange(true, meta);
    }
  }

  resetCoverTransform() {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta') || {};
    if (!meta.customCoverUrl) return;

    meta.coverOffsetX = 0;
    meta.coverOffsetY = 0;
    meta.coverScale = 1;
    this.selectedNode.setAttr('itemMeta', meta);

    this.refreshCoverPlacementOnNode(this.selectedNode);
    this.saveSnapshot();
    if (this.onCoverRepositionChange && this.isRepositioningCover) {
      this.onCoverRepositionChange(true, meta);
    }
  }

  refreshCoverPlacementOnNode(node: Konva.Group) {
    const meta = node.getAttr('itemMeta') || {};
    const coverGroup = node.findOne('.cover-group') as Konva.Group | null;
    if (!coverGroup) return;
    const coverImgNode = coverGroup.findOne('.cover-image-node') as Konva.Image | null;
    if (!coverImgNode) return;

    const imgEl = coverImgNode.image() as HTMLImageElement | null;
    if (!imgEl) return;

    const w = node.width();
    const h = node.height();
    const imgNatW = imgEl.naturalWidth || imgEl.width;
    const imgNatH = imgEl.naturalHeight || imgEl.height;

    const placement = calculateCoverPlacement(
      meta.type,
      w,
      h,
      imgNatW,
      imgNatH,
      meta.coverScale || 1,
      meta.coverOffsetX || 0,
      meta.coverOffsetY || 0
    );

    coverImgNode.position({ x: placement.x, y: placement.y });
    coverImgNode.size({ width: placement.width, height: placement.height });
    this.decorLayer.batchDraw();
  }

  isPointOpaqueInGroup(group: Konva.Group, stagePoint: { x: number; y: number }): boolean {
    const transform = group.getAbsoluteTransform().copy().invert();
    const localPt = transform.point(stagePoint);

    const w = group.width();
    const h = group.height();

    if (localPt.x < 0 || localPt.x > w || localPt.y < 0 || localPt.y > h) {
      return false;
    }

    const meta = group.getAttr('itemMeta') || {};

    const geometricTypes = ['panel_round', 'panel_arch', 'cylinder', 'cylinder_fluted', 'rug_oval', 'rug_round', 'rug_rect_3d'];
    if (meta.type && (geometricTypes.includes(meta.type) || meta.type.startsWith('rug'))) {
      return isPointInsideMask(meta.type, localPt.x, localPt.y, w, h);
    }

    // Se tem pintura sólida ou capa aplicada na estrutura, valida pela máscara ou baseImage
    if (meta.customColor || meta.customCoverUrl) {
      return isPointInsideMask(meta.type, localPt.x, localPt.y, w, h);
    }

    const baseImgNode = group.findOne('.base-image') as Konva.Image | null;
    if (!baseImgNode) return true;

    const imgEl = baseImgNode.image() as HTMLImageElement | null;
    if (!imgEl || !imgEl.complete || !imgEl.naturalWidth || !this.hitCtx) return true;

    const natX = Math.floor((localPt.x / w) * imgEl.naturalWidth);
    const natY = Math.floor((localPt.y / h) * imgEl.naturalHeight);

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

  findOpaqueItemsAtPoint(stagePoint: { x: number; y: number }): Konva.Group[] {
    const children = this.decorLayer.getChildren();
    const matches: Konva.Group[] = [];

    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i] as Konva.Group;
      if (child.name() === 'decor-item' && this.isPointOpaqueInGroup(child, stagePoint)) {
        matches.push(child);
      }
    }

    return matches;
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const targetEl = e.target as HTMLElement | null;
      const tag = targetEl?.tagName ? targetEl.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'Escape') {
        if (this.isRepositioningCover) {
          this.exitCoverRepositionMode();
        } else {
          this.deselect();
        }
        return;
      }

      if (e.key === 'Enter' && this.isRepositioningCover) {
        this.exitCoverRepositionMode();
        return;
      }

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
        if (this.selectedNode && !this.isRepositioningCover) {
          e.preventDefault();
          this.deleteSelected();
        }
      }
    });
  }

  // ========================================================
  // ADIÇÃO E MANIPULAÇÃO DE ITENS NO PALCO
  // ========================================================
  async addItem(itemData: PresetItem, position: { x: number; y: number } | null = null, saveHistory: boolean = true) {
    if (this.isRepositioningCover) {
      this.exitCoverRepositionMode(false);
    }

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
      draggable: false,
      dragDistance: 6,
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

    const svgRole = getItemCustomizationMode(itemData);

    group.setAttr('itemMeta', {
      ...itemData,
      svgRole,
      instanceId: itemData.instanceId || ('inst-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)),
      customCoverUrl: itemData.customCoverUrl || null,
      customColor: itemData.customColor || null,
      coverOffsetX: itemData.coverOffsetX || 0,
      coverOffsetY: itemData.coverOffsetY || 0,
      coverScale: itemData.coverScale || 1,
      modularColors: itemData.modularColors || null,
      balloonColors: itemData.balloonColors || null
    });

    let currentPreviewUrl = itemData.previewUrl;
    if (itemData.type === 'balloon_arch' && itemData.balloonColors) {
      currentPreviewUrl = generateBalloonArchDataUrl(itemData.balloonColors as string[]);
    } else if (svgRole === 'modular' && itemData.modularColors && itemData.modularColors.length > 0) {
      currentPreviewUrl = generateModularSvgDataUrl(itemData, itemData.modularColors);
    }

    if (itemData.type === 'cylinder' || itemData.type === 'cylinder_fluted') {
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

    if (svgRole === 'structural') {
      if (itemData.customCoverUrl) {
        await this.attachCoverToNode(group, itemData.customCoverUrl);
      } else if (itemData.customColor) {
        this.attachSolidColorToNode(group, itemData.customColor);
      }
    }

    group.on('dragmove', () => {
      this.uiLayer?.batchDraw();
    });

    group.on('dragend', () => {
      this.uiLayer?.batchDraw();
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

  selectNode(node: Konva.Group | Konva.Node | null) {
    if (this.isRepositioningCover && this.selectedNode !== node) {
      this.exitCoverRepositionMode(false);
    }

    if (this.selectedNode && this.selectedNode !== node) {
      this.selectedNode.draggable(false);
    }

    this.selectedNode = node as Konva.Group | null;

    if (node && !this.isRepositioningCover) {
      node.draggable(true);
    }

    this.transformer?.nodes(node ? [node] : []);
    this.uiLayer?.batchDraw();

    if (this.onSelectionChange) {
      const meta = node ? node.getAttr('itemMeta') : null;
      this.onSelectionChange(meta, this.selectedNode);
    }
  }

  deselect() {
    if (this.isRepositioningCover) {
      this.exitCoverRepositionMode(false);
    }
    if (this.selectedNode) {
      this.selectedNode.draggable(false);
    }
    this.selectedNode = null;
    this.transformer?.nodes([]);
    this.uiLayer?.batchDraw();

    if (this.onSelectionChange) {
      this.onSelectionChange(null, null);
    }
  }

  // ========================================================
  // CAPAS E PINTURA DE COR SÓLIDA (APENAS SVG ESTRUTURAL)
  // ========================================================
  async applyCoverToSelected(coverImageUrl: string | null): Promise<boolean> {
    if (!this.selectedNode) return false;
    const meta = this.selectedNode.getAttr('itemMeta') as PresetItem;

    // Regra: Apenas itens de SVG estruturais permitem capas
    if (coverImageUrl && getItemCustomizationMode(meta) !== 'structural') {
      return false;
    }

    // Ao trocar de capa, reseta o pan/zoom para centralizado
    if (coverImageUrl !== meta.customCoverUrl) {
      meta.coverOffsetX = 0;
      meta.coverOffsetY = 0;
      meta.coverScale = 1;
    }
    meta.customColor = null;
    this.selectedNode.setAttr('itemMeta', meta);

    await this.attachCoverToNode(this.selectedNode, coverImageUrl);
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();

    if (this.onSelectionChange) {
      this.onSelectionChange(this.selectedNode.getAttr('itemMeta'), this.selectedNode);
    }
    return true;
  }

  applySolidColorToSelected(colorHex: string | null): boolean {
    if (!this.selectedNode) return false;
    const meta = this.selectedNode.getAttr('itemMeta') as PresetItem;

    if (colorHex && getItemCustomizationMode(meta) !== 'structural') {
      return false;
    }

    if (this.isRepositioningCover) {
      this.exitCoverRepositionMode(false);
    }

    meta.customCoverUrl = null;
    meta.customColor = colorHex;
    meta.coverOffsetX = 0;
    meta.coverOffsetY = 0;
    meta.coverScale = 1;
    this.selectedNode.setAttr('itemMeta', meta);

    this.attachSolidColorToNode(this.selectedNode, colorHex);
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();

    if (this.onSelectionChange) {
      this.onSelectionChange(this.selectedNode.getAttr('itemMeta'), this.selectedNode);
    }
    return true;
  }

  attachSolidColorToNode(node: Konva.Group, colorHex: string | null) {
    const meta = node.getAttr('itemMeta') as PresetItem;
    meta.customColor = colorHex;
    if (colorHex) meta.customCoverUrl = null;
    node.setAttr('itemMeta', meta);

    const existingCoverGroup = node.findOne('.cover-group');
    if (existingCoverGroup) {
      existingCoverGroup.destroy();
    }

    const baseImage = node.findOne('.base-image');
    if (!colorHex) {
      if (baseImage) baseImage.visible(true);
      return;
    }

    if (baseImage && (meta.type === 'cylinder' || meta.type === 'cube' || (meta.type && meta.type.startsWith('rug')))) {
      baseImage.visible(false);
    } else if (baseImage) {
      // Nos painéis, mantém a baseImage visível para preservar os pés dourados discretos e a sombra de piso
      baseImage.visible(true);
    }

    const w = node.width();
    const h = node.height();
    const clipFunc = createClipFunction(meta.type, w, h);

    const coverGroup = new Konva.Group({
      name: 'cover-group',
      clipFunc: clipFunc
    });

    const colorRect = new Konva.Rect({
      name: 'solid-color-node',
      x: 0,
      y: 0,
      width: w,
      height: h,
      fill: colorHex
    });
    coverGroup.add(colorRect);

    const shadingOverlay = createShadingOverlay(meta.type, w, h);
    if (shadingOverlay) {
      coverGroup.add(shadingOverlay);
    }

    node.add(coverGroup);
  }

  async attachCoverToNode(node: Konva.Group, coverImageUrl: string | null) {
    const meta = node.getAttr('itemMeta') as PresetItem;
    meta.customCoverUrl = coverImageUrl;
    if (coverImageUrl) meta.customColor = null;
    node.setAttr('itemMeta', meta);

    const existingCoverGroup = node.findOne('.cover-group');
    if (existingCoverGroup) {
      existingCoverGroup.destroy();
    }

    const baseImage = node.findOne('.base-image');

    if (!coverImageUrl) {
      if (baseImage) baseImage.visible(true);
      return;
    }

    if (baseImage && (meta.type === 'cylinder' || meta.type === 'cube' || (meta.type && meta.type.startsWith('rug')))) {
      baseImage.visible(false);
    } else if (baseImage) {
      baseImage.visible(true);
    }

    const w = node.width();
    const h = node.height();
    const coverImg = await loadImageAsync(coverImageUrl);
    const clipFunc = createClipFunction(meta.type, w, h);

    const imgNatW = coverImg.naturalWidth || coverImg.width;
    const imgNatH = coverImg.naturalHeight || coverImg.height;
    const placement = calculateCoverPlacement(
      meta.type,
      w,
      h,
      imgNatW,
      imgNatH,
      meta.coverScale || 1,
      meta.coverOffsetX || 0,
      meta.coverOffsetY || 0
    );

    const coverGroup = new Konva.Group({
      name: 'cover-group',
      clipFunc: clipFunc
    });

    const coverImageNode = new Konva.Image({
      name: 'cover-image-node',
      image: coverImg,
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height
    });

    coverGroup.add(coverImageNode);

    const shadingOverlay = createShadingOverlay(meta.type, w, h);
    if (shadingOverlay) {
      coverGroup.add(shadingOverlay);
    }

    node.add(coverGroup);
    this.decorLayer.batchDraw();
  }

  // ========================================================
  // ATUALIZAÇÃO MODULAR DE CORES (ITENS SVG AUTOSSUFICIENTES)
  // ========================================================
  async applyModularColorsToNode(group: Konva.Group | Konva.Node, colors: string[], saveHistory: boolean = true) {
    const meta = group.getAttr('itemMeta') as PresetItem;
    meta.modularColors = [...colors];
    const newUrl = generateModularSvgDataUrl(meta, colors);
    meta.previewUrl = newUrl;
    group.setAttr('itemMeta', meta);

    const baseImgNode = (group as Konva.Group).findOne('.base-image') as Konva.Image | null;
    if (baseImgNode) {
      const newImg = await loadImageAsync(newUrl);
      baseImgNode.image(newImg);
      this.decorLayer.batchDraw();
    }

    if (saveHistory) {
      this.saveSnapshot();
    }
    this.notifyLayersChange();
    if (this.onSelectionChange && this.selectedNode === group) {
      this.onSelectionChange(meta, this.selectedNode);
    }
  }

  async applyBalloonColorsToNode(group: Konva.Group | Konva.Node, colors: string[], saveHistory: boolean = true) {
    const meta = group.getAttr('itemMeta') as PresetItem;
    if (getItemCustomizationMode(meta) === 'modular') {
      await this.applyModularColorsToNode(group, colors, saveHistory);
      return;
    }

    meta.balloonColors = colors;
    meta.type = 'balloon_arch';
    group.setAttr('itemMeta', meta);

    const newUrl = generateBalloonArchDataUrl(colors);
    meta.previewUrl = newUrl;

    const baseImgNode = (group as Konva.Group).findOne('.base-image') as Konva.Image | null;
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

  async applyBalloonColorsToSelected(colors: string[]) {
    if (!this.selectedNode) return;
    await this.applyBalloonColorsToNode(this.selectedNode, colors, true);
  }

  async changeItemImage(group: Konva.Group, newUrl: string, newColor?: string) {
    const meta = (group.getAttr('itemMeta') || {}) as any;
    if (newColor) {
      meta.currentColor = newColor;
    }
    meta.previewUrl = newUrl;
    group.setAttr('itemMeta', meta);

    const baseImgNode = group.findOne('.base-image') as Konva.Image;
    if (baseImgNode) {
      const newImg = await loadImageAsync(newUrl);
      baseImgNode.image(newImg);
      this.decorLayer.batchDraw();
      this.saveSnapshot();
      this.notifyLayersChange();
    }
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

  toggleLockNode(node: Konva.Node | Konva.Group): boolean {
    const isDraggable = node.draggable();
    node.draggable(!isDraggable);
    if (!isDraggable) {
      if (this.selectedNode === node) {
        this.transformer?.nodes([]);
      }
    }
    this.decorLayer.batchDraw();
    return !isDraggable;
  }

  async duplicateSelected() {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta');
    const newPos = {
      x: Math.min(this.VIRTUAL_WIDTH - 120, this.selectedNode.x() + 40),
      y: Math.min(this.VIRTUAL_HEIGHT - 120, this.selectedNode.y() + 40)
    };
    await this.addItem({ ...meta, instanceId: undefined }, newPos, true);
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
    return this.stage?.toDataURL({
      pixelRatio: 1.5,
      mimeType: 'image/png'
    }) || '';
  }

  getSceneNodes() {
    return this.decorLayer.getChildren();
  }

  getSceneElements(): SceneElement[] {
    const items: SceneElement[] = [];
    const children = this.decorLayer.getChildren();
    children.forEach((child, index) => {
      const meta = child.getAttr('itemMeta');
      if (meta) {
        items.push({
          ...meta,
          instanceId: meta.instanceId,
          id: meta.id || meta.itemId,
          name: meta.name,
          category: meta.category,
          type: meta.type,
          svgRole: meta.svgRole,
          widthCm: meta.widthCm,
          heightCm: meta.heightCm,
          previewUrl: meta.previewUrl,
          customCoverUrl: meta.customCoverUrl || null,
          customColor: meta.customColor || null,
          coverOffsetX: meta.coverOffsetX || 0,
          coverOffsetY: meta.coverOffsetY || 0,
          coverScale: meta.coverScale || 1,
          modularColors: meta.modularColors || null,
          balloonColors: meta.balloonColors || null,
          currentColor: meta.currentColor,
          availableColors: meta.availableColors,
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

  async loadSceneElements(elements: SceneElement[]) {
    this.deselect();
    this.decorLayer.destroyChildren();

    for (const elem of elements) {
      const node = await this.addItem(elem, { x: elem.x, y: elem.y }, false);
      if (node) {
        node.scaleX(elem.scaleX || 1);
        node.scaleY(elem.scaleY || 1);
        node.rotation(elem.rotation || 0);
        if ((elem.scaleX || 1) < 0) {
          node.offsetX(node.width());
        }
      }
    }

    this.decorLayer.batchDraw();
    this.notifyLayersChange();
  }

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

    const currentState = this.undoStack.pop()!;
    this.redoStack.push(currentState);

    const previousState = this.undoStack[this.undoStack.length - 1];
    await this.restoreSnapshot(previousState);
  }

  async redo() {
    if (!this.canRedo()) return;

    const nextState = this.redoStack.pop()!;
    this.undoStack.push(nextState);

    await this.restoreSnapshot(nextState);
  }

  async restoreSnapshot(jsonString: string) {
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
