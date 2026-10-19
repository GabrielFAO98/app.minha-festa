import Konva from 'konva';
import {
  createClipFunction,
  calculateCoverPlacement,
  loadImageAsync,
  isPointInsideMask,
  createShadingOverlay,
  createCylinderFloorShadow,
  createPanelSupportBase
} from './mask-renderer';
import { TEXTURE_WALL_BOISERIE, TEXTURE_FLOOR_WOOD } from './textures-data';
import { generateBalloonArchDataUrl } from './balloon-generator';
import { getItemCustomizationMode, generateModularSvgDataUrl } from './modular-svg-generator';

import type { PresetItem, SceneElement } from '../types';

// OTIMIZAÇÃO CRÍTICA PARA MOBILE:
// 1. Desativa detecção de colisão durante arraste
// 2. Limita pixelRatio em 2x (Retina) para evitar sobrecarga de fill-rate 3x/3.5x em GPUs mobile
Konva.hitOnDragEnabled = false;
if (typeof window !== 'undefined') {
  Konva.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
}

export class CanvasEngine {
  stage: Konva.Stage | null;
  bgLayer: Konva.Layer | null;
  decorLayer: Konva.Layer;
  uiLayer: Konva.Layer | null;
  transformer: Konva.Transformer | null;
  selectedNode: Konva.Group | null;

  // Botões de Ação nos Cantos Inferiores do Quadro de Seleção
  btnCornerFlip: Konva.Group | null;
  btnCornerDuplicate: Konva.Group | null;

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

  // Modo Enquadrar Capa (Pinça + Arraste Direto)
  isRepositioningCover: boolean;
  private isDraggingCoverInternal: boolean;
  private isPinchingCover: boolean;
  private pinchStartDist: number;
  private pinchStartScale: number;
  private pinchStartCenterX: number;
  private pinchStartCenterY: number;

  // Motor Direto 1:1 de Arraste (Zero Lag no Mobile)
  private draggingNode: Konva.Group | null;
  private dragStartClientX: number;
  private dragStartClientY: number;
  private dragStartNodeX: number;
  private dragStartNodeY: number;
  private dragStartCoverOffsetX: number;
  private dragStartCoverOffsetY: number;
  private dragContainerScaleX: number;
  private dragContainerScaleY: number;
  private hasMovedDuringDrag: boolean;
  private wasAlreadySelectedOnDown: boolean;
  private wasSelectedByCycleOrLayer: boolean;
  private dragCandidatesOnDown: Konva.Group[];
  private pendingDragPos: { x: number; y: number } | null;
  private pendingCoverRefresh: boolean;
  private rafId: number | null;
  private lastTouchTime: number;

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
    this.btnCornerFlip = null;
    this.btnCornerDuplicate = null;

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
    this.isPinchingCover = false;
    this.pinchStartDist = 1;
    this.pinchStartScale = 1;
    this.pinchStartCenterX = 0;
    this.pinchStartCenterY = 0;

    this.draggingNode = null;
    this.dragStartClientX = 0;
    this.dragStartClientY = 0;
    this.dragStartNodeX = 0;
    this.dragStartNodeY = 0;
    this.dragStartCoverOffsetX = 0;
    this.dragStartCoverOffsetY = 0;
    this.dragContainerScaleX = 1;
    this.dragContainerScaleY = 1;
    this.hasMovedDuringDrag = false;
    this.wasAlreadySelectedOnDown = false;
    this.wasSelectedByCycleOrLayer = false;
    this.dragCandidatesOnDown = [];
    this.pendingDragPos = null;
    this.pendingCoverRefresh = false;
    this.rafId = null;
    this.lastTouchTime = 0;

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

    // decorLayer com listening: false elimina 100% da renderização de HitCanvas e leituras getImageData do Konva
    this.decorLayer = new Konva.Layer({ listening: false });
    this.stage.add(this.decorLayer);

    // Apenas uiLayer possui listening: true para as 4 âncoras de redimensionamento/rotação do Transformer
    this.uiLayer = new Konva.Layer({ listening: true });
    this.stage.add(this.uiLayer);

    this.setupTransformer();
    this.setupDirectInteraction();
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
      rotateAnchorOffset: 24,
      enabledAnchors: ['top-left', 'top-right'],
      anchorSize: 13, // Diminuído pela metade (era 26)
      anchorCornerRadius: 6.5,
      anchorStroke: '#ec4899',
      anchorFill: '#ffffff',
      anchorStrokeWidth: 2,
      borderStroke: '#ec4899',
      borderStrokeWidth: 2,
      borderDash: [5, 4],
      keepRatio: true,
      shouldOverdrawWholeArea: false
    });

    // Desativa o interceptador '.back' interno do Transformer que causava conflito de drag no mobile
    const backShape = this.transformer.findOne('.back');
    if (backShape) {
      backShape.listening(false);
      backShape.draggable(false);
    }

    this.createCornerActionButtons();

    this.transformer.on('transform', () => {
      this.updateCornerActionButtons();
      this.decorLayer?.drawScene();
      this.uiLayer?.drawScene();
    });

    this.transformer.on('transformend', () => {
      this.updateCornerActionButtons();
      this.decorLayer?.batchDraw();
      this.uiLayer?.draw();
      this.saveSnapshot();
      this.notifyLayersChange();
    });

    this.uiLayer.add(this.transformer);
  }

  private createCornerActionButtons() {
    if (!this.transformer) return;

    const stopEvt = (e: any) => {
      if (e && e.cancelBubble !== undefined) e.cancelBubble = true;
    };

    // 1. Botão de Espelhar (Canto Inferior Esquerdo)
    this.btnCornerFlip = new Konva.Group({
      name: 'corner-btn-flip',
      visible: false,
      listening: true
    });

    const hitFlip = new Konva.Circle({
      radius: 20,
      fill: 'transparent',
      listening: true
    });

    const circleFlip = new Konva.Circle({
      radius: 11,
      fill: '#0f172a',
      stroke: '#ec4899',
      strokeWidth: 2,
      listening: false
    });

    // Ícone de Espelhar: Dois triângulos opostos com eixo central
    const iconFlip = new Konva.Shape({
      sceneFunc: (ctx, shape) => {
        // Eixo divisor central
        ctx.beginPath();
        ctx.moveTo(0, -5.5);
        ctx.lineTo(0, 5.5);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Triângulo esquerdo (apontando para esquerda)
        ctx.beginPath();
        ctx.moveTo(-1.4, -4.2);
        ctx.lineTo(-5.8, 0);
        ctx.lineTo(-1.4, 4.2);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Triângulo direito (apontando para direita)
        ctx.beginPath();
        ctx.moveTo(1.4, -4.2);
        ctx.lineTo(5.8, 0);
        ctx.lineTo(1.4, 4.2);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      },
      listening: false
    });

    this.btnCornerFlip.add(hitFlip);
    this.btnCornerFlip.add(circleFlip);
    this.btnCornerFlip.add(iconFlip);

    this.btnCornerFlip.on('click tap', (e) => {
      stopEvt(e);
      this.flipHorizontal();
    });
    this.btnCornerFlip.on('mousedown touchstart', stopEvt);

    this.btnCornerFlip.on('mouseenter', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = 'pointer';
      circleFlip.fill('#1e293b');
      this.uiLayer?.batchDraw();
    });
    this.btnCornerFlip.on('mouseleave', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = '';
      circleFlip.fill('#0f172a');
      this.uiLayer?.batchDraw();
    });

    // 2. Botão de Duplicar (Canto Inferior Direito)
    this.btnCornerDuplicate = new Konva.Group({
      name: 'corner-btn-duplicate',
      visible: false,
      listening: true
    });

    const hitDup = new Konva.Circle({
      radius: 20,
      fill: 'transparent',
      listening: true
    });

    const circleDup = new Konva.Circle({
      radius: 11,
      fill: '#0f172a',
      stroke: '#ec4899',
      strokeWidth: 2,
      listening: false
    });

    // Ícone de Duplicar: Dois quadrados sobrepostos
    const iconDup = new Konva.Shape({
      sceneFunc: (ctx, shape) => {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;

        // Quadrado traseiro (topo-direita)
        ctx.beginPath();
        ctx.strokeRect(-0.8, -5.4, 6.2, 6.2);

        // Quadrado frontal (baixo-esquerda, com fundo escuro que sobrepõe o traseiro)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-5.4, -0.8, 6.2, 6.2);
        ctx.strokeRect(-5.4, -0.8, 6.2, 6.2);
      },
      listening: false
    });

    this.btnCornerDuplicate.add(hitDup);
    this.btnCornerDuplicate.add(circleDup);
    this.btnCornerDuplicate.add(iconDup);

    this.btnCornerDuplicate.on('click tap', (e) => {
      stopEvt(e);
      this.duplicateSelected();
    });
    this.btnCornerDuplicate.on('mousedown touchstart', stopEvt);

    this.btnCornerDuplicate.on('mouseenter', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = 'pointer';
      circleDup.fill('#1e293b');
      this.uiLayer?.batchDraw();
    });
    this.btnCornerDuplicate.on('mouseleave', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = '';
      circleDup.fill('#0f172a');
      this.uiLayer?.batchDraw();
    });

    this.transformer.add(this.btnCornerFlip);
    this.transformer.add(this.btnCornerDuplicate);
  }

  updateCornerActionButtons() {
    if (!this.selectedNode || !this.transformer || this.isRepositioningCover) {
      if (this.btnCornerFlip) this.btnCornerFlip.visible(false);
      if (this.btnCornerDuplicate) this.btnCornerDuplicate.visible(false);
      return;
    }

    const back = this.transformer.findOne('.back') as Konva.Shape | null;
    if (!back) {
      if (this.btnCornerFlip) this.btnCornerFlip.visible(false);
      if (this.btnCornerDuplicate) this.btnCornerDuplicate.visible(false);
      return;
    }

    const w = back.width();
    const h = back.height();

    // Com getAbsoluteRotation preservado, (0, h) é sempre o canto inferior esquerdo
    // e (w, h) é sempre o canto inferior direito, sem inversão ao espelhar
    if (this.btnCornerFlip) {
      this.btnCornerFlip.scaleX(1);
      this.btnCornerFlip.scaleY(1);
      this.btnCornerFlip.position({ x: 0, y: h });
      this.btnCornerFlip.visible(true);
    }

    if (this.btnCornerDuplicate) {
      this.btnCornerDuplicate.scaleX(1);
      this.btnCornerDuplicate.scaleY(1);
      this.btnCornerDuplicate.position({ x: w, y: h });
      this.btnCornerDuplicate.visible(true);
    }
  }

  private isTransformerAnchor(target: Konva.Node | null | undefined): boolean {
    if (!target || !this.transformer) return false;
    const name = target.name ? target.name() : '';
    return target.getParent() === (this.transformer as any) && name.includes('_anchor');
  }

  private isCornerActionButton(target: Konva.Node | null | undefined): boolean {
    if (!target) return false;
    let curr: Konva.Node | null = target;
    while (curr) {
      const name = curr.name ? curr.name() : '';
      if (name.includes('corner-btn-')) return true;
      if (curr === this.stage) break;
      curr = curr.getParent();
    }
    return false;
  }

  /**
   * Agenda um único frame de renderização rápida (apenas drawScene, sem HitCanvas)
   * sincronizado com a taxa de atualização da tela (60Hz / 120Hz).
   */
  private scheduleFastDraw() {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;

      if (this.draggingNode && this.pendingDragPos) {
        this.draggingNode.position(this.pendingDragPos);
      }

      if (this.pendingCoverRefresh && this.selectedNode) {
        this.pendingCoverRefresh = false;
        this.refreshCoverPlacementOnNode(this.selectedNode, false);
        const zoomBadge = document.getElementById('stage-cover-zoom-value');
        const zoomSlider = document.getElementById('stage-cover-zoom-slider') as HTMLInputElement | null;
        const meta = this.selectedNode.getAttr('itemMeta') || {};
        const scaleVal = meta.coverScale || 1;
        if (zoomBadge) zoomBadge.textContent = `${Math.round(scaleVal * 100)}%`;
        if (zoomSlider) zoomSlider.value = String(scaleVal);
      }

      this.decorLayer?.drawScene();
      if (!this.draggingNode) {
        this.uiLayer?.drawScene();
      }
    });
  }

  // ========================================================
  // MOTOR DE SELEÇÃO E ARRASTE DIRETO 1:1 (ZERO LAG MOBILE)
  // ========================================================
  setupDirectInteraction() {
    if (!this.stage) return;

    const getTouchDistance = (t1: Touch, t2: Touch) =>
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

    const getTouchCenter = (t1: Touch, t2: Touch) => ({
      x: (t1.clientX + t2.clientX) * 0.5,
      y: (t1.clientY + t2.clientY) * 0.5
    });

    const handleDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!this.stage) return;
      const rawEvt = e.evt;
      const isTouch = rawEvt.type.startsWith('touch');

      const contentEl = this.stage.content || this.stage.container();
      const rect = contentEl.getBoundingClientRect();
      this.dragContainerScaleX = (rect.width / (this.stage.width() || 1)) || 1;
      this.dragContainerScaleY = (rect.height / (this.stage.height() || 1)) || 1;

      if (isTouch) {
        this.lastTouchTime = performance.now();
        const touchEvt = rawEvt as TouchEvent;

        // GESTO DE PINÇA COM 2 DEDOS NO MOBILE (SOMENTE QUANDO O MODO ENQUADRAR ESTIVER ATIVO)
        if (touchEvt.touches && touchEvt.touches.length === 2) {
          if (this.isRepositioningCover && this.selectedNode) {
            const meta = this.selectedNode.getAttr('itemMeta') || {};
            if (meta.customCoverUrl) {
              if (rawEvt.cancelable) rawEvt.preventDefault();
              const t1 = touchEvt.touches[0];
              const t2 = touchEvt.touches[1];
              const center = getTouchCenter(t1, t2);
              this.draggingNode = null;
              this.isDraggingCoverInternal = false;
              this.isPinchingCover = true;
              this.pinchStartDist = Math.max(12, getTouchDistance(t1, t2));
              this.pinchStartScale = meta.coverScale || 1;
              this.pinchStartCenterX = center.x;
              this.pinchStartCenterY = center.y;
              this.dragStartCoverOffsetX = meta.coverOffsetX || 0;
              this.dragStartCoverOffsetY = meta.coverOffsetY || 0;
            }
          }
          return;
        }

        if (touchEvt.touches && touchEvt.touches.length > 2) return;
      } else {
        // Ignora mousedown sintético disparado pelo navegador mobile após touchstart
        if (performance.now() - this.lastTouchTime < 500) return;
        const mouseEvt = rawEvt as MouseEvent;
        if (mouseEvt.button !== undefined && mouseEvt.button !== 0) return;
      }

      // Se clicou/tocou em um dos botões de ação de canto (Espelhar ou Duplicar), deixa o botão agir
      if (this.isCornerActionButton(e.target)) {
        return;
      }

      // Se clicou/tocou em uma das âncoras de canto ou rotação do Transformer, deixa o Transformer agir
      if (this.isTransformerAnchor(e.target)) {
        return;
      }

      if (isTouch && rawEvt.cancelable) {
        rawEvt.preventDefault();
      }

      const clientX = isTouch
        ? (rawEvt as TouchEvent).touches[0].clientX
        : (rawEvt as MouseEvent).clientX;
      const clientY = isTouch
        ? (rawEvt as TouchEvent).touches[0].clientY
        : (rawEvt as MouseEvent).clientY;

      const pointerPos = {
        x: (clientX - rect.left) / this.dragContainerScaleX,
        y: (clientY - rect.top) / this.dragContainerScaleY
      };

      // 1. Se estamos no modo de enquadrar capa (ativado pelo botão)
      if (this.isRepositioningCover && this.selectedNode) {
        const candidates = this.findOpaqueItemsAtPoint(pointerPos);
        if (candidates.includes(this.selectedNode)) {
          this.isDraggingCoverInternal = true;
          this.dragStartClientX = clientX;
          this.dragStartClientY = clientY;
          const meta = this.selectedNode.getAttr('itemMeta') || {};
          this.dragStartCoverOffsetX = meta.coverOffsetX || 0;
          this.dragStartCoverOffsetY = meta.coverOffsetY || 0;
          return;
        } else {
          this.exitCoverRepositionMode();
        }
      }

      // 2. Busca peças opacas exatamente sob o dedo/cursor
      const candidates = this.findOpaqueItemsAtPoint(pointerPos);

      if (candidates.length === 0) {
        this.deselect();
        return;
      }

      // Decide qual peça selecionar/arrastar imediatamente no mesmo gesto
      const keepCurrentSelected =
        Boolean(this.selectedNode && candidates.includes(this.selectedNode)) &&
        (candidates[0] === this.selectedNode || this.wasSelectedByCycleOrLayer);

      if (keepCurrentSelected && this.selectedNode) {
        this.wasAlreadySelectedOnDown = true;
      } else {
        this.wasAlreadySelectedOnDown = false;
        this.wasSelectedByCycleOrLayer = false;
        this.selectNode(candidates[0]);
      }

      if (this.selectedNode && !this.selectedNode.getAttr('locked')) {
        this.draggingNode = this.selectedNode;
        this.dragStartClientX = clientX;
        this.dragStartClientY = clientY;
        this.dragStartNodeX = this.selectedNode.x();
        this.dragStartNodeY = this.selectedNode.y();
        this.hasMovedDuringDrag = false;
        this.dragCandidatesOnDown = candidates;
        this.pendingDragPos = null;
      }
    };

    const handleMove = (evt: MouseEvent | TouchEvent) => {
      if (!this.draggingNode && !this.isDraggingCoverInternal && !this.isPinchingCover) return;
      if (this.transformer && (this.transformer as any).isTransforming && (this.transformer as any).isTransforming()) {
        this.draggingNode = null;
        return;
      }

      const isTouch = evt.type.startsWith('touch');
      if (isTouch) {
        const touchEvt = evt as TouchEvent;
        if (!touchEvt.touches || touchEvt.touches.length === 0) return;

        // PINCH-TO-ZOOM COM 2 DEDOS NA CAPA
        if (this.isPinchingCover && this.selectedNode && touchEvt.touches.length >= 2) {
          if (evt.cancelable) evt.preventDefault();

          const t1 = touchEvt.touches[0];
          const t2 = touchEvt.touches[1];
          const dist = Math.max(12, getTouchDistance(t1, t2));
          const center = getTouchCenter(t1, t2);

          const scaleRatio = dist / this.pinchStartDist;
          const newScale = Math.max(0.4, Math.min(3.5, this.pinchStartScale * scaleRatio));

          const screenDx = center.x - this.pinchStartCenterX;
          const screenDy = center.y - this.pinchStartCenterY;
          const layerScale = this.decorLayer?.scaleX() || 1;
          const virtualDx = screenDx / (layerScale * (this.dragContainerScaleX || 1));
          const virtualDy = screenDy / (layerScale * (this.dragContainerScaleY || 1));

          const nodeScaleX = Math.abs(this.selectedNode.scaleX() || 1);
          const nodeScaleY = Math.abs(this.selectedNode.scaleY() || 1);
          const flipSignX = (this.selectedNode.scaleX() || 1) < 0 ? -1 : 1;

          const meta = this.selectedNode.getAttr('itemMeta') || {};
          meta.coverScale = newScale;
          meta.coverOffsetX = this.dragStartCoverOffsetX + (virtualDx / nodeScaleX) * flipSignX;
          meta.coverOffsetY = this.dragStartCoverOffsetY + (virtualDy / nodeScaleY);
          this.selectedNode.setAttr('itemMeta', meta);

          this.pendingCoverRefresh = true;
          this.scheduleFastDraw();
          return;
        }
      }

      if (evt.cancelable) {
        evt.preventDefault();
      }

      const clientX = isTouch
        ? (evt as TouchEvent).touches[0].clientX
        : (evt as MouseEvent).clientX;
      const clientY = isTouch
        ? (evt as TouchEvent).touches[0].clientY
        : (evt as MouseEvent).clientY;

      const screenDx = clientX - this.dragStartClientX;
      const screenDy = clientY - this.dragStartClientY;

      const layerScale = this.decorLayer?.scaleX() || 1;
      const virtualDx = screenDx / (layerScale * (this.dragContainerScaleX || 1));
      const virtualDy = screenDy / (layerScale * (this.dragContainerScaleY || 1));

      // Arraste interno de capa com 1 dedo / mouse
      if (this.isDraggingCoverInternal && this.selectedNode) {
        const nodeScaleX = Math.abs(this.selectedNode.scaleX() || 1);
        const nodeScaleY = Math.abs(this.selectedNode.scaleY() || 1);
        const flipSignX = (this.selectedNode.scaleX() || 1) < 0 ? -1 : 1;
        const meta = this.selectedNode.getAttr('itemMeta') || {};
        meta.coverOffsetX = this.dragStartCoverOffsetX + (virtualDx / nodeScaleX) * flipSignX;
        meta.coverOffsetY = this.dragStartCoverOffsetY + (virtualDy / nodeScaleY);
        this.selectedNode.setAttr('itemMeta', meta);
        this.pendingCoverRefresh = true;
        this.scheduleFastDraw();
        return;
      }

      // Arraste 1:1 da peça no palco
      if (this.draggingNode) {
        if (!this.hasMovedDuringDrag) {
          if (Math.abs(screenDx) < 2 && Math.abs(screenDy) < 2) return;
          this.hasMovedDuringDrag = true;
          // Otimização Zero-Lag Mobile: oculta transformer e botões durante o arraste e desativa listening
          if (this.transformer) this.transformer.visible(false);
          if (this.btnCornerFlip) this.btnCornerFlip.visible(false);
          if (this.btnCornerDuplicate) this.btnCornerDuplicate.visible(false);
          if (this.uiLayer) this.uiLayer.listening(false);
          this.uiLayer?.drawScene();
        }

        const w = this.draggingNode.width() * Math.abs(this.draggingNode.scaleX() || 1);
        const h = this.draggingNode.height() * Math.abs(this.draggingNode.scaleY() || 1);

        const newX = Math.max(-180, Math.min(this.VIRTUAL_WIDTH - w + 180, this.dragStartNodeX + virtualDx));
        const newY = Math.max(-180, Math.min(this.VIRTUAL_HEIGHT - h + 180, this.dragStartNodeY + virtualDy));

        this.pendingDragPos = { x: newX, y: newY };
        this.scheduleFastDraw();
      }
    };

    const handleUp = (evt?: MouseEvent | TouchEvent) => {
      if (this.isPinchingCover) {
        const isTouch = evt && evt.type.startsWith('touch');
        const touchEvt = isTouch ? (evt as TouchEvent) : null;

        // Se soltou 1 dedo e ainda resta 1 dedo na tela, continua o arraste de 1 dedo sem salto
        if (touchEvt && touchEvt.touches && touchEvt.touches.length === 1 && this.isRepositioningCover && this.selectedNode) {
          this.isPinchingCover = false;
          this.isDraggingCoverInternal = true;
          this.dragStartClientX = touchEvt.touches[0].clientX;
          this.dragStartClientY = touchEvt.touches[0].clientY;
          const meta = this.selectedNode.getAttr('itemMeta') || {};
          this.dragStartCoverOffsetX = meta.coverOffsetX || 0;
          this.dragStartCoverOffsetY = meta.coverOffsetY || 0;
          return;
        }

        this.isPinchingCover = false;
        this.decorLayer?.batchDraw();
        if (this.onCoverRepositionChange && this.selectedNode) {
          this.onCoverRepositionChange(this.isRepositioningCover, this.selectedNode.getAttr('itemMeta'));
        }
        return;
      }

      if (this.isDraggingCoverInternal) {
        this.isDraggingCoverInternal = false;
        this.decorLayer?.batchDraw();
        return;
      }

      if (!this.draggingNode) return;

      const moved = this.hasMovedDuringDrag;
      const finalPos = this.pendingDragPos;
      const node = this.draggingNode;

      this.draggingNode = null;
      this.pendingDragPos = null;
      this.hasMovedDuringDrag = false;

      if (moved) {
        if (finalPos) {
          node.position(finalPos);
        }
        if (this.transformer) {
          this.transformer.visible(true);
          (this.transformer as any)._resetTransformCache();
          this.transformer.update();
        }
        if (this.uiLayer) {
          this.uiLayer.listening(true);
        }
        this.updateCornerActionButtons();
        this.decorLayer?.batchDraw();
        this.uiLayer?.draw();
        this.saveSnapshot();
        this.notifyLayersChange();
      } else {
        if (this.transformer) {
          this.transformer.visible(true);
        }
        if (this.uiLayer) {
          this.uiLayer.listening(true);
        }
        this.updateCornerActionButtons();
        this.uiLayer?.draw();

        // Toque rápido sem arrastar: se havia mais de 1 peça sobreposta, alterna para a peça de baixo
        if (this.wasAlreadySelectedOnDown && this.dragCandidatesOnDown.length > 1 && this.selectedNode) {
          const currentIndex = this.dragCandidatesOnDown.indexOf(this.selectedNode);
          const nextIndex = (currentIndex + 1) % this.dragCandidatesOnDown.length;
          this.wasSelectedByCycleOrLayer = true;
          this.selectNode(this.dragCandidatesOnDown[nextIndex]);
        }
      }
    };

    this.stage.on('mousedown touchstart', handleDown);
    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    window.addEventListener('touchcancel', handleUp);

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
  }

  enterCoverRepositionMode() {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta') || {};
    if (!meta.customCoverUrl) return;

    this.isRepositioningCover = true;
    this.draggingNode = null;
    if (this.transformer) {
      this.transformer.borderStroke('#38bdf8');
      this.transformer.borderDash([4, 4]);
      this.transformer.enabledAnchors([]);
      this.transformer.rotateEnabled(false);
      if (this.btnCornerFlip) this.btnCornerFlip.visible(false);
      if (this.btnCornerDuplicate) this.btnCornerDuplicate.visible(false);
      this.uiLayer?.draw();
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
    this.isPinchingCover = false;

    if (this.transformer) {
      this.transformer.borderStroke('#ec4899');
      this.transformer.borderDash([5, 4]);
      this.transformer.enabledAnchors(['top-left', 'top-right']);
      this.transformer.rotateEnabled(true);
      this.updateCornerActionButtons();
      this.uiLayer?.draw();
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

  refreshCoverPlacementOnNode(node: Konva.Group, redraw: boolean = true) {
    const meta = node.getAttr('itemMeta') || {};
    const coverGroup = node.findOne('.cover-group') as Konva.Group | null;
    if (!coverGroup) return;
    const coverImgNode = coverGroup.findOne('.cover-image-node') as Konva.Image | null;
    if (!coverImgNode) return;

    const imgEl = coverImgNode.image() as HTMLImageElement | null;
    if (!imgEl) return;

    const w = node.width();
    const h = node.height();
    const imgNatW = (imgEl as any).naturalWidth || imgEl.width;
    const imgNatH = (imgEl as any).naturalHeight || imgEl.height;

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
    if (redraw) {
      this.decorLayer.batchDraw();
    }
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

    if (meta.customColor || meta.customCoverUrl) {
      return isPointInsideMask(meta.type, localPt.x, localPt.y, w, h);
    }

    const baseImgNode = group.findOne('.base-image') as Konva.Image | null;
    if (!baseImgNode) return true;

    const imgEl = baseImgNode.image() as any;
    if (!imgEl) return true;

    // Consulta O(1) na grade 64x64 de opacidade pré-calculada em RAM (Zero chamadas GPU getImageData!)
    const alphaGrid: Uint8Array | undefined = imgEl.__alphaGrid;
    const gridSize: number | undefined = imgEl.__alphaGridSize;
    if (alphaGrid && gridSize) {
      const gx = Math.min(gridSize - 1, Math.max(0, Math.floor((localPt.x / w) * gridSize)));
      const gy = Math.min(gridSize - 1, Math.max(0, Math.floor((localPt.y / h) * gridSize)));
      return alphaGrid[gy * gridSize + gx] > 20;
    }

    const imgW = imgEl.naturalWidth || imgEl.width || 0;
    const imgH = imgEl.naturalHeight || imgEl.height || 0;
    if (!imgW || !imgH || !this.hitCtx) return true;

    const natX = Math.floor((localPt.x / w) * imgW);
    const natY = Math.floor((localPt.y / h) * imgH);

    if (natX < 0 || natX >= imgW || natY < 0 || natY >= imgH) {
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
      listening: false,
      name: 'decor-item'
    });

    // Otimização O(1) para getClientRect: impede que o Transformer percorra filhos recursivamente
    // a cada frame de movimento e impede que capas com zoom expandam a caixa de seleção
    (group as any).getClientRect = function (config: any = {}) {
      const selfRect = {
        x: 0,
        y: 0,
        width: this.width(),
        height: this.height()
      };
      if (!config.skipTransform) {
        return this._transformedRect(selfRect, config.relativeTo);
      }
      return selfRect;
    };

    // Impede que o Transformer do Konva inverta a orientação (rot=180°) ao espelhar horizontalmente (scaleX: -1)
    (group as any).getAbsoluteRotation = function () {
      return this.rotation() || 0;
    };

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
    } else if (
      itemData.type === 'panel_round' ||
      itemData.type === 'panel_arch' ||
      itemData.type === 'panel_rect' ||
      itemData.type === 'panel_half_moon'
    ) {
      const supportBase = createPanelSupportBase(itemData.type, widthPx, heightPx);
      supportBase.visible(false);
      group.add(supportBase);
    }

    const imgElement = await loadImageAsync(currentPreviewUrl);
    const baseImage = new Konva.Image({
      name: 'base-image',
      image: imgElement,
      width: widthPx,
      height: heightPx,
      listening: false
    });
    group.add(baseImage);

    if (svgRole === 'structural') {
      if (itemData.customCoverUrl) {
        await this.attachCoverToNode(group, itemData.customCoverUrl);
      } else if (itemData.customColor) {
        this.attachSolidColorToNode(group, itemData.customColor);
      }
    }

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

    if (node && !(node as any).__patchedRotation) {
      (node as any).__patchedRotation = true;
      (node as any).getAbsoluteRotation = function () {
        return this.rotation() || 0;
      };
    }

    this.selectedNode = node as Konva.Group | null;

    this.transformer?.nodes(node ? [node] : []);
    this.updateCornerActionButtons();
    this.uiLayer?.draw();

    if (this.onSelectionChange) {
      const meta = node ? node.getAttr('itemMeta') : null;
      this.onSelectionChange(meta, this.selectedNode);
    }
  }

  deselect() {
    if (this.isRepositioningCover) {
      this.exitCoverRepositionMode(false);
    }
    this.draggingNode = null;
    this.selectedNode = null;
    this.wasSelectedByCycleOrLayer = false;
    this.transformer?.nodes([]);
    this.updateCornerActionButtons();
    this.uiLayer?.draw();

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

    if (coverImageUrl && getItemCustomizationMode(meta) !== 'structural') {
      return false;
    }

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
    const supportBase = node.findOne('.panel-support-base');
    if (!colorHex) {
      if (baseImage) baseImage.visible(true);
      if (supportBase) supportBase.visible(false);
      return;
    }

    if (baseImage) baseImage.visible(false);
    if (supportBase) supportBase.visible(true);

    const w = node.width();
    const h = node.height();
    const clipFunc = createClipFunction(meta.type, w, h);

    const coverGroup = new Konva.Group({
      name: 'cover-group',
      clipFunc: clipFunc,
      listening: false
    });

    const colorRect = new Konva.Rect({
      name: 'solid-color-node',
      x: 0,
      y: 0,
      width: w,
      height: h,
      fill: colorHex,
      listening: false
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
    const supportBase = node.findOne('.panel-support-base');

    if (!coverImageUrl) {
      if (baseImage) baseImage.visible(true);
      if (supportBase) supportBase.visible(false);
      return;
    }

    if (baseImage) baseImage.visible(false);
    if (supportBase) supportBase.visible(true);

    const w = node.width();
    const h = node.height();
    const coverImg = await loadImageAsync(coverImageUrl);
    const clipFunc = createClipFunction(meta.type, w, h);

    const imgNatW = (coverImg as any).naturalWidth || coverImg.width;
    const imgNatH = (coverImg as any).naturalHeight || coverImg.height;
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
      clipFunc: clipFunc,
      listening: false
    });

    const coverImageNode = new Konva.Image({
      name: 'cover-image-node',
      image: coverImg,
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      listening: false
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
    if (this.transformer) {
      (this.transformer as any)._resetTransformCache();
      this.transformer.update();
      this.updateCornerActionButtons();
      this.uiLayer?.draw();
    }
    this.decorLayer.batchDraw();
    this.saveSnapshot();
  }

  toggleLockNode(node: Konva.Node | Konva.Group): boolean {
    const isLocked = Boolean(node.getAttr('locked'));
    node.setAttr('locked', !isLocked);
    if (!isLocked && this.selectedNode === node) {
      this.transformer?.nodes([]);
      this.uiLayer?.draw();
    }
    this.decorLayer.batchDraw();
    return !isLocked;
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
