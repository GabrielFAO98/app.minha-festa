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

  // Botões de Ação nos Cantos do Quadro de Seleção e Alça de Arraste
  btnCornerRotate: Konva.Group | null;
  btnCornerFlip: Konva.Group | null;
  btnCornerDuplicate: Konva.Group | null;
  btnCornerMove: Konva.Group | null;

  VIRTUAL_WIDTH: number;
  VIRTUAL_HEIGHT: number;
  WALL_HEIGHT: number;
  FLOOR_HEIGHT: number;
  pxPerCm: number;

  wallTextureUrl: string;
  floorTextureUrl: string;
  bgImageUrl: string | null;

  undoStack: string[];
  redoStack: string[];
  maxHistory: number;
  isRestoringState: boolean;

  // Modo Zoom e Pan do Palco
  zoomLevel: number;
  panX: number;
  panY: number;
  baseScale: number;
  baseOffsetX: number;
  baseOffsetY: number;
  private isPinchingStage: boolean;
  private pinchStageStartDist: number;
  private pinchStageStartZoom: number;
  private pinchStageStartCenter: { x: number; y: number };
  private pinchStageStartPan: { x: number; y: number };

  // Modo Enquadrar Capa (Pinça + Arraste Direto)
  isRepositioningCover: boolean;
  private isDraggingCoverInternal: boolean;
  private isPinchingCover: boolean;
  private pinchStartDist: number;
  private pinchStartScale: number;
  private pinchStartCenterX: number;
  private pinchStartCenterY: number;
  // Modo Rotação Manual no Botão Superior Esquerdo
  private isRotatingNode: boolean;
  private rotateCenterScreenX: number;
  private rotateCenterScreenY: number;
  private rotateStartAngle: number;
  private rotateNodeStartRotation: number;

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
  onZoomChange: ((zoomPercent: number) => void) | null;

  constructor() {
    this.stage = null;
    this.bgLayer = null;
    this.decorLayer = null as unknown as Konva.Layer;
    this.uiLayer = null;
    this.transformer = null;
    this.selectedNode = null;
    this.btnCornerRotate = null;
    this.btnCornerFlip = null;
    this.btnCornerDuplicate = null;
    this.btnCornerMove = null;

    this.VIRTUAL_WIDTH = 1080;
    this.VIRTUAL_HEIGHT = 1920;
    this.WALL_HEIGHT = 1147; // Alinhado exatamente à divisa parede/chão do cenário padrão boiserie e madeira
    this.FLOOR_HEIGHT = 773;

    this.pxPerCm = this.VIRTUAL_WIDTH / 280;

    this.wallTextureUrl = TEXTURE_WALL_BOISERIE;
    this.floorTextureUrl = TEXTURE_FLOOR_WOOD;
    this.bgImageUrl = '/cenarios/cenario-boiserie-madeira.jpg';

    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 35;
    this.isRestoringState = false;

    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.baseScale = 1;
    this.baseOffsetX = 0;
    this.baseOffsetY = 0;
    this.isPinchingStage = false;
    this.pinchStageStartDist = 1;
    this.pinchStageStartZoom = 1;
    this.pinchStageStartCenter = { x: 0, y: 0 };
    this.pinchStageStartPan = { x: 0, y: 0 };

    this.isRepositioningCover = false;
    this.isDraggingCoverInternal = false;
    this.isPinchingCover = false;
    this.pinchStartDist = 1;
    this.pinchStartScale = 1;
    this.pinchStartCenterX = 0;
    this.pinchStartCenterY = 0;

    this.isRotatingNode = false;
    this.rotateCenterScreenX = 0;
    this.rotateCenterScreenY = 0;
    this.rotateStartAngle = 0;
    this.rotateNodeStartRotation = 0;

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
    this.onZoomChange = null;
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

    // Em telas mobile verticais, cover preenche 100% da viewport eliminando qualquer gap ou barra preta
    // No desktop studio 9:16, width e height mantêm a proporção exata, resultando na mesma escala
    this.baseScale = Math.max(containerW / this.VIRTUAL_WIDTH, containerH / this.VIRTUAL_HEIGHT);
    this.baseOffsetX = (containerW - this.VIRTUAL_WIDTH * this.baseScale) / 2;
    this.baseOffsetY = (containerH - this.VIRTUAL_HEIGHT * this.baseScale) / 2;

    this.applyViewTransform();
  }

  applyViewTransform() {
    if (!this.stage) return;
    const finalScale = this.baseScale * this.zoomLevel;
    const finalPosX = this.baseOffsetX + this.panX;
    const finalPosY = this.baseOffsetY + this.panY;

    [this.bgLayer, this.decorLayer, this.uiLayer].forEach((layer) => {
      if (layer) {
        layer.scale({ x: finalScale, y: finalScale });
        layer.position({ x: finalPosX, y: finalPosY });
        layer.batchDraw();
      }
    });

    if (this.onZoomChange) {
      this.onZoomChange(Math.round(this.zoomLevel * 100));
    }
  }

  setZoom(newZoom: number, focusScreenX?: number, focusScreenY?: number) {
    if (!this.stage) return;
    // Trava estritamente em no mínimo 1.0 (100%), facilitando o retorno ao enquadramento original sem sub-zoom
    const clampedZoom = Math.max(1.0, Math.min(4.0, newZoom));
    if (Math.abs(clampedZoom - this.zoomLevel) < 0.001) {
      if (clampedZoom === 1.0 && (this.panX !== 0 || this.panY !== 0)) {
        this.panX = 0;
        this.panY = 0;
        this.applyViewTransform();
      }
      return;
    }

    const containerW = this.stage.width();
    const containerH = this.stage.height();
    const screenFocusX = focusScreenX !== undefined ? focusScreenX : containerW / 2;
    const screenFocusY = focusScreenY !== undefined ? focusScreenY : containerH / 2;

    const oldScale = this.baseScale * this.zoomLevel;
    const newScale = this.baseScale * clampedZoom;

    // Converte o ponto da tela em coordenadas do palco virtual antes do zoom
    const virtualX = (screenFocusX - (this.baseOffsetX + this.panX)) / oldScale;
    const virtualY = (screenFocusY - (this.baseOffsetY + this.panY)) / oldScale;

    // Ajusta o pan para que o ponto da tela permaneça no mesmo local sob o novo zoom
    if (clampedZoom <= 1.001) {
      this.panX = 0;
      this.panY = 0;
    } else {
      this.panX = screenFocusX - this.baseOffsetX - virtualX * newScale;
      this.panY = screenFocusY - this.baseOffsetY - virtualY * newScale;
    }

    this.zoomLevel = clampedZoom <= 1.001 ? 1.0 : clampedZoom;
    this.applyViewTransform();
  }

  zoomIn() {
    const nextZoom = Math.min(4.0, Math.round((this.zoomLevel + 0.25) * 4) / 4);
    this.setZoom(nextZoom);
  }

  zoomOut() {
    const nextZoom = Math.max(1.0, Math.round((this.zoomLevel - 0.25) * 4) / 4);
    this.setZoom(nextZoom);
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyViewTransform();
  }

  panBy(screenDx: number, screenDy: number) {
    this.panX += screenDx;
    this.panY += screenDy;
    this.applyViewTransform();
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

    // 1. Cenário Fotográfico Completo (Foto real com parede ~60% e chão ~40%)
    if (this.bgImageUrl) {
      try {
        const bgImg = await loadImageAsync(this.bgImageUrl);
        const bgNode = new Konva.Image({
          name: 'bg-element',
          x: 0,
          y: 0,
          width: this.VIRTUAL_WIDTH,
          height: this.VIRTUAL_HEIGHT,
          image: bgImg,
          listening: false
        });
        this.bgLayer.add(bgNode);
        this.bgLayer.batchDraw();
        return;
      } catch (err) {
        console.warn('Falha ao carregar cenário fotográfico, usando texturas modulares:', err);
      }
    }

    // 2. Cenário Modular (Parede + Piso separados)
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

  async setEnvironmentScenario(scenarioUrl: string) {
    this.bgImageUrl = scenarioUrl;
    await this.renderEnvironment();
    this.saveSnapshot();
  }

  async setEnvironmentTextures(wallUrl: string | null, floorUrl: string | null) {
    this.bgImageUrl = null;
    if (wallUrl) this.wallTextureUrl = wallUrl;
    if (floorUrl) this.floorTextureUrl = floorUrl;
    await this.renderEnvironment();
    this.saveSnapshot();
  }

  setupTransformer() {
    if (!this.uiLayer) return;
    // Círculos reduzidos em 25% (26px -> 20px, raio 10px)
    this.transformer = new Konva.Transformer({
      rotateAnchorOffset: 0,
      enabledAnchors: ['top-right'], // Apenas top-right é âncora nativa de escala do Konva
      rotateEnabled: false, // Desativa âncora flutuante externa nativa; rotação integrada no canto superior esquerdo
      anchorSize: 20,
      anchorCornerRadius: 10,
      anchorStroke: '#c5a059',
      anchorFill: '#ffffff',
      anchorStrokeWidth: 2,
      borderStroke: '#c5a059',
      borderStrokeWidth: 1.8,
      borderDash: [5, 4],
      keepRatio: true,
      shouldOverdrawWholeArea: false,
      anchorStyleFunc: (anchor) => {
        anchor.hitStrokeWidth(16);
        // Desenha o ícone de seta diagonal de duas pontas (⤢) no botão superior direito
        if (anchor.hasName('top-right')) {
          anchor.stroke('#c5a059');
          anchor.fill('#ffffff');
          anchor.strokeWidth(2);
          anchor.cornerRadius(10);
          anchor.sceneFunc((ctx, shape) => {
            const w = shape.width();
            const h = shape.height();
            const r = typeof shape.cornerRadius() === 'number' ? (shape.cornerRadius() as number) : 10;

            // Fundo circular
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fillStrokeShape(shape);

            // Seta diagonal com 2 pontas (⤢)
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.strokeStyle = '#c5a059';
            ctx.fillStyle = '#c5a059';
            ctx.lineWidth = 1.3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Linha diagonal principal (do canto inferior-esquerdo ao superior-direito)
            ctx.beginPath();
            ctx.moveTo(-4.5, 4.5);
            ctx.lineTo(4.5, -4.5);
            ctx.stroke();

            // Ponta superior direita (apontando para cima-direita)
            ctx.beginPath();
            ctx.moveTo(1.5, -4.5);
            ctx.lineTo(4.5, -4.5);
            ctx.lineTo(4.5, -1.5);
            ctx.stroke();

            // Ponta inferior esquerda (apontando para baixo-esquerda)
            ctx.beginPath();
            ctx.moveTo(-1.5, 4.5);
            ctx.lineTo(-4.5, 4.5);
            ctx.lineTo(-4.5, 1.5);
            ctx.stroke();

            ctx.restore();
          });
        }
      }
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
      if (this.selectedNode && this.transformer) {
        const w = (typeof (this.selectedNode as any).width === 'function' ? (this.selectedNode as any).width() : 100) * Math.abs(this.selectedNode.scaleX() || 1);
        const h = (typeof (this.selectedNode as any).height === 'function' ? (this.selectedNode as any).height() : 100) * Math.abs(this.selectedNode.scaleY() || 1);
        const MIN_SPAN = 80;
        const padX = w < MIN_SPAN ? Math.round((MIN_SPAN - w) / 2) : 4;
        const padY = h < MIN_SPAN ? Math.round((MIN_SPAN - h) / 2) : 4;
        const pad = Math.max(padX, padY, 4);
        this.transformer.padding(pad);
        this.transformer.update();
      }
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

    // 1. Botão de Rotação (Canto Superior Esquerdo - Círculo reduzido em 25%)
    this.btnCornerRotate = new Konva.Group({
      name: 'corner-btn-rotate',
      visible: false,
      listening: true
    });

    const hitRotate = new Konva.Circle({
      radius: 20,
      fill: 'transparent',
      listening: true
    });

    const circleRotate = new Konva.Circle({
      radius: 10,
      fill: '#ffffff',
      stroke: '#c5a059',
      strokeWidth: 2,
      listening: false
    });

    // Ícone de Rotação: Seta curva girando no sentido horário (⟳)
    const iconRotate = new Konva.Shape({
      sceneFunc: (ctx, shape) => {
        ctx.save();
        ctx.strokeStyle = '#c5a059';
        ctx.fillStyle = '#c5a059';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Arco circular de rotação (~270 graus)
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, -Math.PI * 0.8, Math.PI * 0.35, false);
        ctx.stroke();

        // Seta tangencial na ponta do arco
        const endAngle = Math.PI * 0.35;
        const ex = Math.cos(endAngle) * 4.5;
        const ey = Math.sin(endAngle) * 4.5;
        const tanX = -Math.sin(endAngle);
        const tanY = Math.cos(endAngle);
        ctx.beginPath();
        ctx.moveTo(ex + tanX * 3.2, ey + tanY * 3.2);
        ctx.lineTo(ex - tanY * 2.3, ey + tanX * 2.3);
        ctx.lineTo(ex + tanY * 1.4, ey - tanX * 1.4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      },
      listening: false
    });

    this.btnCornerRotate.add(hitRotate);
    this.btnCornerRotate.add(circleRotate);
    this.btnCornerRotate.add(iconRotate);

    this.btnCornerRotate.on('mouseenter', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = 'crosshair';
      circleRotate.fill('#fbf8f1');
      this.uiLayer?.batchDraw();
    });
    this.btnCornerRotate.on('mouseleave', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = '';
      circleRotate.fill('#ffffff');
      this.uiLayer?.batchDraw();
    });

    // 2. Botão de Espelhar (Canto Inferior Esquerdo - Círculo reduzido em 25%)
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
      radius: 10,
      fill: '#ffffff',
      stroke: '#c5a059',
      strokeWidth: 2,
      listening: false
    });

    // Ícone de Espelhar: Dois triângulos opostos com eixo central
    const iconFlip = new Konva.Shape({
      sceneFunc: (ctx, shape) => {
        // Eixo divisor central
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Triângulo esquerdo (apontando para esquerda)
        ctx.beginPath();
        ctx.moveTo(-1.2, -4);
        ctx.lineTo(-5.5, 0);
        ctx.lineTo(-1.2, 4);
        ctx.closePath();
        ctx.fillStyle = '#c5a059';
        ctx.fill();

        // Triângulo direito (apontando para direita)
        ctx.beginPath();
        ctx.moveTo(1.2, -4);
        ctx.lineTo(5.5, 0);
        ctx.lineTo(1.2, 4);
        ctx.closePath();
        ctx.fillStyle = '#c5a059';
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
      circleFlip.fill('#fbf8f1');
      this.uiLayer?.batchDraw();
    });
    this.btnCornerFlip.on('mouseleave', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = '';
      circleFlip.fill('#ffffff');
      this.uiLayer?.batchDraw();
    });

    // 3. Botão de Duplicar (Canto Inferior Direito - Círculo reduzido em 25%)
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
      radius: 10,
      fill: '#ffffff',
      stroke: '#c5a059',
      strokeWidth: 2,
      listening: false
    });

    // Ícone de Duplicar: Dois quadrados sobrepostos
    const iconDup = new Konva.Shape({
      sceneFunc: (ctx, shape) => {
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 1.1;

        // Quadrado traseiro (topo-direita)
        ctx.beginPath();
        ctx.strokeRect(-0.8, -5, 5.8, 5.8);

        // Quadrado frontal (baixo-esquerda, com fundo que sobrepõe o traseiro)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5, -0.8, 5.8, 5.8);
        ctx.strokeRect(-5, -0.8, 5.8, 5.8);
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
      circleDup.fill('#fbf8f1');
      this.uiLayer?.batchDraw();
    });
    this.btnCornerDuplicate.on('mouseleave', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = '';
      circleDup.fill('#ffffff');
      this.uiLayer?.batchDraw();
    });

    // 4. Alça Flutuante de Arraste / Mover (Topo-Centro - Haste e altura reduzidas para y=-26)
    this.btnCornerMove = new Konva.Group({
      name: 'handle-btn-move',
      visible: false,
      listening: true
    });

    // Haste de conexão vertical elegante (liga o topo da seleção até a alça)
    const stemMove = new Konva.Line({
      points: [0, 0, 0, 26],
      stroke: '#c5a059',
      strokeWidth: 1.8,
      dash: [3, 2.5],
      listening: false
    });

    // Área de toque generosa (40px de diâmetro) para facilidade de toque no mobile
    const hitMove = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 20,
      fill: 'transparent',
      listening: true
    });

    // Círculo visual reduzido em 25% com visual ouro nobre
    const circleMove = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 10,
      fill: '#ffffff',
      stroke: '#c5a059',
      strokeWidth: 2,
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowBlur: 5,
      shadowOpacity: 0.25,
      shadowOffset: { x: 0, y: 1.5 },
      listening: false
    });

    // Ícone de 4 setas direcionais em cruz
    const iconMove = new Konva.Shape({
      x: 0,
      y: 0,
      sceneFunc: (ctx, shape) => {
        ctx.strokeStyle = '#c5a059';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 1.3;

        // Cruz
        ctx.beginPath();
        ctx.moveTo(0, -5.5);
        ctx.lineTo(0, 5.5);
        ctx.moveTo(-5.5, 0);
        ctx.lineTo(5.5, 0);
        ctx.stroke();

        // Seta Cima
        ctx.beginPath();
        ctx.moveTo(0, -6.8);
        ctx.lineTo(-2.2, -4.2);
        ctx.lineTo(2.2, -4.2);
        ctx.closePath();
        ctx.fill();

        // Seta Baixo
        ctx.beginPath();
        ctx.moveTo(0, 6.8);
        ctx.lineTo(-2.2, 4.2);
        ctx.lineTo(2.2, 4.2);
        ctx.closePath();
        ctx.fill();

        // Seta Esquerda
        ctx.beginPath();
        ctx.moveTo(-6.8, 0);
        ctx.lineTo(-4.2, -2.2);
        ctx.lineTo(-4.2, 2.2);
        ctx.closePath();
        ctx.fill();

        // Seta Direita
        ctx.beginPath();
        ctx.moveTo(6.8, 0);
        ctx.lineTo(4.2, -2.2);
        ctx.lineTo(4.2, 2.2);
        ctx.closePath();
        ctx.fill();
      },
      listening: false
    });

    this.btnCornerMove.add(stemMove);
    this.btnCornerMove.add(hitMove);
    this.btnCornerMove.add(circleMove);
    this.btnCornerMove.add(iconMove);

    this.btnCornerMove.on('mouseenter', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = 'grab';
      circleMove.fill('#fbf8f1');
      this.uiLayer?.batchDraw();
    });

    this.btnCornerMove.on('mouseleave', () => {
      if (performance.now() - this.lastTouchTime < 600) return;
      if (this.stage?.content) this.stage.content.style.cursor = '';
      circleMove.fill('#ffffff');
      this.uiLayer?.batchDraw();
    });

    this.transformer.add(this.btnCornerRotate);
    this.transformer.add(this.btnCornerFlip);
    this.transformer.add(this.btnCornerDuplicate);
    this.transformer.add(this.btnCornerMove);
  }

  updateCornerActionButtons() {
    if (!this.selectedNode || !this.transformer || this.isRepositioningCover) {
      if (this.btnCornerRotate) this.btnCornerRotate.visible(false);
      if (this.btnCornerFlip) this.btnCornerFlip.visible(false);
      if (this.btnCornerDuplicate) this.btnCornerDuplicate.visible(false);
      if (this.btnCornerMove) this.btnCornerMove.visible(false);
      return;
    }

    const back = this.transformer.findOne('.back') as Konva.Shape | null;
    if (!back) {
      if (this.btnCornerRotate) this.btnCornerRotate.visible(false);
      if (this.btnCornerFlip) this.btnCornerFlip.visible(false);
      if (this.btnCornerDuplicate) this.btnCornerDuplicate.visible(false);
      if (this.btnCornerMove) this.btnCornerMove.visible(false);
      return;
    }

    // Obtém dimensões sem padding do nó selecionado
    const nodeRect = typeof (this.transformer as any)._getNodeRect === 'function'
      ? (this.transformer as any)._getNodeRect()
      : null;
    const bw = nodeRect && typeof nodeRect.width === 'number' ? nodeRect.width : back.width();
    const bh = nodeRect && typeof nodeRect.height === 'number' ? nodeRect.height : back.height();
    const pad = this.transformer.padding() || 0;

    // Atualiza o quadro delimitador tracejado (.back) para envolver perfeitamente o padding
    back.x(-pad);
    back.y(-pad);
    back.width(bw + pad * 2);
    back.height(bh + pad * 2);

    // Canto superior esquerdo: Rotação (seta girando)
    if (this.btnCornerRotate) {
      this.btnCornerRotate.scaleX(1);
      this.btnCornerRotate.scaleY(1);
      this.btnCornerRotate.position({ x: -pad, y: -pad });
      this.btnCornerRotate.visible(true);
    }

    // Canto inferior esquerdo: Espelhar
    if (this.btnCornerFlip) {
      this.btnCornerFlip.scaleX(1);
      this.btnCornerFlip.scaleY(1);
      this.btnCornerFlip.position({ x: -pad, y: bh + pad });
      this.btnCornerFlip.visible(true);
    }

    // Canto inferior direito: Duplicar
    if (this.btnCornerDuplicate) {
      this.btnCornerDuplicate.scaleX(1);
      this.btnCornerDuplicate.scaleY(1);
      this.btnCornerDuplicate.position({ x: bw + pad, y: bh + pad });
      this.btnCornerDuplicate.visible(true);
    }

    // Posiciona a alça de mover no topo-centro com altura de -26px a partir do topo delimitado
    if (this.btnCornerMove) {
      this.btnCornerMove.scaleX(1);
      this.btnCornerMove.scaleY(1);
      this.btnCornerMove.position({ x: bw / 2, y: -pad - 26 });
      this.btnCornerMove.visible(true);
    }
  }

  private isRotateHandle(target: Konva.Node | null | undefined): boolean {
    if (!target) return false;
    let curr: Konva.Node | null = target;
    while (curr) {
      const name = curr.name ? curr.name() : '';
      if (name === 'corner-btn-rotate') return true;
      if (curr === this.stage) break;
      curr = curr.getParent();
    }
    return false;
  }

  private isMoveHandle(target: Konva.Node | null | undefined): boolean {
    if (!target) return false;
    let curr: Konva.Node | null = target;
    while (curr) {
      const name = curr.name ? curr.name() : '';
      if (name === 'handle-btn-move' || name.includes('btn-move')) return true;
      if (curr === this.stage) break;
      curr = curr.getParent();
    }
    return false;
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
      if (name === 'corner-btn-flip' || name === 'corner-btn-duplicate') return true;
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

        // GESTO COM 2 DEDOS NO MOBILE
        if (touchEvt.touches && touchEvt.touches.length === 2) {
          // 1. Gesto de Pinça na Capa (quando em modo Enquadrar Capa ativo)
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
              return;
            }
          }

          // 2. Gesto de Pinça e Pan do Palco Inteiro
          if (rawEvt.cancelable) rawEvt.preventDefault();
          const t1 = touchEvt.touches[0];
          const t2 = touchEvt.touches[1];
          const center = getTouchCenter(t1, t2);
          this.draggingNode = null;
          this.isDraggingCoverInternal = false;
          this.isPinchingCover = false;
          this.isPinchingStage = true;
          this.pinchStageStartDist = Math.max(12, getTouchDistance(t1, t2));
          this.pinchStageStartZoom = this.zoomLevel;
          this.pinchStageStartCenter = { x: center.x, y: center.y };
          this.pinchStageStartPan = { x: this.panX, y: this.panY };
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

      // Se clicou/tocou no Botão de Rotação (canto superior esquerdo), inicia a rotação em torno do centro da peça
      if (this.isRotateHandle(e.target) && this.selectedNode && !this.selectedNode.getAttr('locked')) {
        this.isRotatingNode = true;
        const centerLocal = { x: this.selectedNode.width() / 2, y: this.selectedNode.height() / 2 };
        const centerStage = this.selectedNode.getAbsoluteTransform().point(centerLocal);
        this.rotateCenterScreenX = rect.left + centerStage.x * this.dragContainerScaleX;
        this.rotateCenterScreenY = rect.top + centerStage.y * this.dragContainerScaleY;

        const dx = clientX - this.rotateCenterScreenX;
        const dy = clientY - this.rotateCenterScreenY;
        this.rotateStartAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        this.rotateNodeStartRotation = this.selectedNode.rotation() || 0;
        return;
      }

      // Se clicou/tocou na Alça de Arraste (Move Handle), inicia o arraste da peça selecionada com visão 100% livre
      if (this.isMoveHandle(e.target) && this.selectedNode && !this.selectedNode.getAttr('locked')) {
        this.draggingNode = this.selectedNode;
        this.dragStartClientX = clientX;
        this.dragStartClientY = clientY;
        this.dragStartNodeX = this.selectedNode.x();
        this.dragStartNodeY = this.selectedNode.y();
        this.hasMovedDuringDrag = false;
        this.dragCandidatesOnDown = [this.selectedNode];
        this.pendingDragPos = null;
        return;
      }

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
        // Se o palco está com zoom (> 1), permite arrastar (pan) clicando no fundo vazio
        if (this.zoomLevel > 1) {
          this.dragStartClientX = clientX;
          this.dragStartClientY = clientY;
          this.pinchStageStartPan = { x: this.panX, y: this.panY };
          this.isPinchingStage = true;
          this.pinchStageStartDist = 0; // Marca como pan de 1 ponteiro
        }
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
      const isTouch = evt.type.startsWith('touch');

      // 1. PINCH-TO-ZOOM / PAN DO PALCO INTEIRO
      if (this.isPinchingStage) {
        if (evt.cancelable) evt.preventDefault();

        if (isTouch) {
          const touchEvt = evt as TouchEvent;
          if (touchEvt.touches.length >= 2) {
            const t1 = touchEvt.touches[0];
            const t2 = touchEvt.touches[1];
            const dist = Math.max(12, getTouchDistance(t1, t2));
            const center = getTouchCenter(t1, t2);

            const scaleRatio = dist / this.pinchStageStartDist;
            const targetZoom = Math.max(1.0, Math.min(4.0, this.pinchStageStartZoom * scaleRatio));

            // Aplica zoom mantendo o centro do toque estável
            const contentEl = this.stage?.content || this.stage?.container();
            const rect = contentEl ? contentEl.getBoundingClientRect() : { left: 0, top: 0 };
            const focusScreenX = (center.x - rect.left) / this.dragContainerScaleX;
            const focusScreenY = (center.y - rect.top) / this.dragContainerScaleY;

            this.setZoom(targetZoom, focusScreenX, focusScreenY);

            // Adiciona translação do gesto com 2 dedos
            const panDx = (center.x - this.pinchStageStartCenter.x) / this.dragContainerScaleX;
            const panDy = (center.y - this.pinchStageStartCenter.y) / this.dragContainerScaleY;
            this.panX += panDx * 0.15;
            this.panY += panDy * 0.15;
            this.applyViewTransform();
            return;
          }
        }

        // Pan com 1 ponteiro (mouse ou 1 dedo em fundo vazio quando zoom > 1)
        const clientX = isTouch
          ? (evt as TouchEvent).touches[0].clientX
          : (evt as MouseEvent).clientX;
        const clientY = isTouch
          ? (evt as TouchEvent).touches[0].clientY
          : (evt as MouseEvent).clientY;

        const screenDx = (clientX - this.dragStartClientX) / this.dragContainerScaleX;
        const screenDy = (clientY - this.dragStartClientY) / this.dragContainerScaleY;
        this.panX = this.pinchStageStartPan.x + screenDx;
        this.panY = this.pinchStageStartPan.y + screenDy;
        this.applyViewTransform();
        return;
      }

      if (!this.draggingNode && !this.isDraggingCoverInternal && !this.isPinchingCover && !this.isRotatingNode) return;
      if (this.transformer && (this.transformer as any).isTransforming && (this.transformer as any).isTransforming()) {
        this.draggingNode = null;
        return;
      }

      // ROTAÇÃO DIRETA PELO BOTÃO SUPERIOR ESQUERDO
      if (this.isRotatingNode && this.selectedNode) {
        if (evt.cancelable) evt.preventDefault();

        const clientX = isTouch
          ? (evt as TouchEvent).touches[0].clientX
          : (evt as MouseEvent).clientX;
        const clientY = isTouch
          ? (evt as TouchEvent).touches[0].clientY
          : (evt as MouseEvent).clientY;

        const dx = clientX - this.rotateCenterScreenX;
        const dy = clientY - this.rotateCenterScreenY;
        const currentAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const deltaAngle = currentAngle - this.rotateStartAngle;

        let newAngle = this.rotateNodeStartRotation + deltaAngle;
        let normalizedAngle = ((newAngle % 360) + 360) % 360;

        // Snapping suave a cada 45 graus (0, 45, 90, 135, 180, etc.) com tolerância de 4 graus
        const snaps = [0, 45, 90, 135, 180, 225, 270, 315, 360];
        for (const snap of snaps) {
          if (Math.abs(normalizedAngle - snap) < 4) {
            newAngle = newAngle + ((snap === 360 ? 0 : snap) - normalizedAngle);
            break;
          }
        }

        const centerParent = this.selectedNode.getTransform().point({
          x: this.selectedNode.width() / 2,
          y: this.selectedNode.height() / 2
        });

        this.selectedNode.rotation(newAngle);

        const newCenterParent = this.selectedNode.getTransform().point({
          x: this.selectedNode.width() / 2,
          y: this.selectedNode.height() / 2
        });

        this.selectedNode.x(this.selectedNode.x() + (centerParent.x - newCenterParent.x));
        this.selectedNode.y(this.selectedNode.y() + (centerParent.y - newCenterParent.y));

        if (this.transformer) {
          (this.transformer as any)._resetTransformCache();
          this.transformer.update();
        }
        this.updateCornerActionButtons();
        this.decorLayer?.drawScene();
        this.uiLayer?.drawScene();
        return;
      }

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
          if (this.btnCornerMove) this.btnCornerMove.visible(false);
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
      if (this.isRotatingNode) {
        this.isRotatingNode = false;
        if (this.transformer) {
          (this.transformer as any)._resetTransformCache();
          this.transformer.update();
        }
        this.updateCornerActionButtons();
        this.decorLayer?.batchDraw();
        this.uiLayer?.draw();
        this.saveSnapshot();
        this.notifyLayersChange();
        return;
      }

      if (this.isPinchingStage) {
        this.isPinchingStage = false;
        return;
      }

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

    // Zoom com a roda do mouse (seja no palco inteiro ou na capa quando em Modo Enquadrar)
    this.stage.on('wheel', (e) => {
      e.evt.preventDefault();
      if (this.isRepositioningCover && this.selectedNode) {
        const meta = this.selectedNode.getAttr('itemMeta') || {};
        if (meta.customCoverUrl) {
          const currentScale = meta.coverScale || 1;
          const delta = e.evt.deltaY < 0 ? 0.08 : -0.08;
          this.setCoverScale(currentScale + delta, false);
          return;
        }
      }

      // Zoom do palco inteiro com roda do mouse focado na posição do cursor
      const contentEl = this.stage?.content || this.stage?.container();
      const rect = contentEl ? contentEl.getBoundingClientRect() : { left: 0, top: 0 };
      const mouseX = (e.evt.clientX - rect.left) / (this.dragContainerScaleX || 1);
      const mouseY = (e.evt.clientY - rect.top) / (this.dragContainerScaleY || 1);
      const zoomFactor = e.evt.deltaY < 0 ? 1.15 : 0.87;
      this.setZoom(this.zoomLevel * zoomFactor, mouseX, mouseY);
    });
  }

  enterCoverRepositionMode() {
    if (!this.selectedNode) return;
    const meta = this.selectedNode.getAttr('itemMeta') || {};
    if (!meta.customCoverUrl) return;

    this.isRepositioningCover = true;
    this.draggingNode = null;
    if (this.transformer) {
      this.transformer.borderStroke('#dfba73');
      this.transformer.borderDash([4, 4]);
      this.transformer.enabledAnchors([]);
      this.transformer.rotateEnabled(false);
      if (this.btnCornerFlip) this.btnCornerFlip.visible(false);
      if (this.btnCornerDuplicate) this.btnCornerDuplicate.visible(false);
      if (this.btnCornerMove) this.btnCornerMove.visible(false);
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
      this.transformer.borderStroke('#c5a059');
      this.transformer.borderDash([5, 4]);
      this.transformer.enabledAnchors(['top-right']);
      this.transformer.rotateEnabled(false);
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

  isPointOpaqueInGroup(group: Konva.Group, stagePoint: { x: number; y: number }, tolerance: number = 0): boolean {
    const transform = group.getAbsoluteTransform().copy().invert();
    const localPt = transform.point(stagePoint);

    const w = group.width();
    const h = group.height();

    // Se estiver fora dos limites mesmo com a tolerância de toque expandida
    if (localPt.x < -tolerance || localPt.x > w + tolerance || localPt.y < -tolerance || localPt.y > h + tolerance) {
      return false;
    }

    // Se o ponto está na margem de tolerância externa expandida, já considera acerto para facilitar peças pequenas
    if (tolerance > 0 && (localPt.x < 0 || localPt.x > w || localPt.y < 0 || localPt.y > h)) {
      return true;
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
      return alphaGrid[gy * gridSize + gx] > 20 || tolerance > 0;
    }

    const imgW = imgEl.naturalWidth || imgEl.width || 0;
    const imgH = imgEl.naturalHeight || imgEl.height || 0;
    if (!imgW || !imgH || !this.hitCtx) return true;

    const natX = Math.floor((localPt.x / w) * imgW);
    const natY = Math.floor((localPt.y / h) * imgH);

    if (natX < 0 || natX >= imgW || natY < 0 || natY >= imgH) {
      return tolerance > 0;
    }

    try {
      this.hitCtx.clearRect(0, 0, 1, 1);
      this.hitCtx.drawImage(imgEl, natX, natY, 1, 1, 0, 0, 1, 1);
      const alpha = this.hitCtx.getImageData(0, 0, 1, 1).data[3];
      return alpha > 25 || tolerance > 0;
    } catch {
      return true;
    }
  }

  findOpaqueItemsAtPoint(stagePoint: { x: number; y: number }): Konva.Group[] {
    const children = this.decorLayer.getChildren();
    const directMatches: Konva.Group[] = [];
    const proximityMatches: Konva.Group[] = [];

    // Tolerância em pixels virtuais para facilitar o toque de dedos no mobile (~38px virtual = ~13px na tela do celular)
    const TOUCH_TOLERANCE = 38;

    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i] as Konva.Group;
      if (child.name() !== 'decor-item') continue;

      // 1. Testa acerto direto (dentro da forma opaca da peça)
      if (this.isPointOpaqueInGroup(child, stagePoint, 0)) {
        directMatches.push(child);
      } else {
        // 2. Se for item pequeno (largura/altura < 160px ou área < 35000), testa com tolerância expandida
        const w = child.width() * Math.abs(child.scaleX() || 1);
        const h = child.height() * Math.abs(child.scaleY() || 1);
        const isSmallItem = w < 160 || h < 160 || (w * h < 35000);

        if (isSmallItem && this.isPointOpaqueInGroup(child, stagePoint, TOUCH_TOLERANCE)) {
          proximityMatches.push(child);
        }
      }
    }

    // Prioridade estrita à peça visível mais à frente (maior zIndex no topo visual).
    // directMatches já está naturalmente ordenado da camada mais à frente para a mais ao fundo
    // pois o loop acima percorre children de length - 1 até 0.
    // Proximidade só é consultada se o toque não tiver atingido diretamente nenhuma forma opaca.
    if (directMatches.length > 0) {
      return directMatches;
    }

    return proximityMatches;
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

    if (this.transformer && node) {
      const w = (typeof (node as any).width === 'function' ? (node as any).width() : 100) * Math.abs(node.scaleX() || 1);
      const h = (typeof (node as any).height === 'function' ? (node as any).height() : 100) * Math.abs(node.scaleY() || 1);

      // Garante distância mínima confortável entre botões opostos (raio 10px / diâmetro 20px)
      // para que nunca fiquem espremidos ou colidam em elementos pequenos
      const MIN_SPAN = 80;
      const padX = w < MIN_SPAN ? Math.round((MIN_SPAN - w) / 2) : 4;
      const padY = h < MIN_SPAN ? Math.round((MIN_SPAN - h) / 2) : 4;
      const pad = Math.max(padX, padY, 4);

      this.transformer.padding(pad);
      this.transformer.nodes([node]);
    } else {
      this.transformer?.nodes([]);
    }

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
    this.isRotatingNode = false;
    this.draggingNode = null;
    this.selectedNode = null;
    this.wasSelectedByCycleOrLayer = false;
    if (this.transformer) {
      this.transformer.padding(2);
      this.transformer.nodes([]);
    }
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

  bringForward(targetNode?: Konva.Group | null) {
    const node = targetNode || this.selectedNode;
    if (!node) return;
    node.moveUp();
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  sendBackward(targetNode?: Konva.Group | null) {
    const node = targetNode || this.selectedNode;
    if (!node) return;
    node.moveDown();
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  bringToFront(targetNode?: Konva.Group | null) {
    const node = targetNode || this.selectedNode;
    if (!node) return;
    node.moveToTop();
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  sendToBack(targetNode?: Konva.Group | null) {
    const node = targetNode || this.selectedNode;
    if (!node) return;
    node.moveToBottom();
    this.decorLayer.batchDraw();
    this.saveSnapshot();
    this.notifyLayersChange();
  }

  reorderLayers(instanceIdsFromTopToBottom: string[]) {
    // No decorLayer: children[0] é o fundo (menor zIndex), children[length-1] é o topo (maior zIndex).
    // instanceIdsFromTopToBottom vem na ordem visual do usuário (topo primeiro, fundo por último).
    // Portanto invertemos para [fundo, ..., topo] e atribuímos o zIndex crescente:
    const fromBottomToTop = [...instanceIdsFromTopToBottom].reverse();
    const children = this.decorLayer.getChildren();
    const nodeMap = new Map<string, Konva.Group>();

    children.forEach((c) => {
      const id = c.getAttr('itemMeta')?.instanceId;
      if (id) nodeMap.set(id, c as Konva.Group);
    });

    fromBottomToTop.forEach((id, zIndex) => {
      const node = nodeMap.get(id);
      if (node) {
        node.zIndex(zIndex);
      }
    });

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

  async updateItemMeta(updatedItem: PresetItem) {
    const nodes = this.decorLayer.getChildren((node) => {
      const meta = node.getAttr('itemMeta');
      return meta && meta.id === updatedItem.id;
    });

    for (const node of nodes) {
      const currentMeta = node.getAttr('itemMeta') || {};
      const newMeta = {
        ...currentMeta,
        name: updatedItem.name,
        category: updatedItem.category,
        rentalPrice: updatedItem.rentalPrice,
        stockQuantity: updatedItem.stockQuantity,
        widthCm: updatedItem.widthCm,
        heightCm: updatedItem.heightCm
      };
      node.setAttr('itemMeta', newMeta);

      if (updatedItem.previewUrl && updatedItem.previewUrl !== currentMeta.previewUrl) {
        newMeta.previewUrl = updatedItem.previewUrl;
        const baseImg = (node as Konva.Group).findOne ? ((node as Konva.Group).findOne('.base-image') as Konva.Image | null) : null;
        if (baseImg) {
          try {
            const imgElement = await loadImageAsync(updatedItem.previewUrl);
            baseImg.image(imgElement);
          } catch (e) {
            console.error('Erro ao atualizar imagem do item no palco:', e);
          }
        }
      }
    }
    this.decorLayer.batchDraw();
    this.notifyLayersChange();
    if (this.selectedNode && this.onSelectionChange) {
      this.onSelectionChange(this.selectedNode.getAttr('itemMeta'), this.selectedNode);
    }
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

  exportHDImage(): string {
    this.deselect();
    if (!this.stage) return '';

    // Salva o zoom/pan atual do usuário
    const prevZoom = this.zoomLevel;
    const prevPanX = this.panX;
    const prevPanY = this.panY;

    // Reseta temporariamente para o enquadramento completo 100%
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyViewTransform();

    const exportScale = this.baseScale;
    const exportX = this.baseOffsetX;
    const exportY = this.baseOffsetY;

    const dataUrl = this.stage.toDataURL({
      x: exportX,
      y: exportY,
      width: this.VIRTUAL_WIDTH * exportScale,
      height: this.VIRTUAL_HEIGHT * exportScale,
      pixelRatio: Math.max(1, 1 / exportScale),
      mimeType: 'image/png'
    }) || '';

    // Restaura o zoom e pan que o usuário estava usando
    if (prevZoom !== 1 || prevPanX !== 0 || prevPanY !== 0) {
      this.zoomLevel = prevZoom;
      this.panX = prevPanX;
      this.panY = prevPanY;
      this.applyViewTransform();
    }

    return dataUrl;
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
      floorTextureUrl: this.floorTextureUrl,
      bgImageUrl: this.bgImageUrl
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
      if (
        data.wallTextureUrl !== this.wallTextureUrl ||
        data.floorTextureUrl !== this.floorTextureUrl ||
        data.bgImageUrl !== this.bgImageUrl
      ) {
        this.wallTextureUrl = data.wallTextureUrl || this.wallTextureUrl;
        this.floorTextureUrl = data.floorTextureUrl || this.floorTextureUrl;
        this.bgImageUrl = data.bgImageUrl !== undefined ? data.bgImageUrl : this.bgImageUrl;
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
