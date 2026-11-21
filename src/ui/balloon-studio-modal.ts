// Ateliê Visual de Criação e Customização de Balões Orgânicos
// Padrão Editorial Ateliê Claro para Decoradoras de Festa

import {
  BALLOON_STUDIO_TEMPLATES,
  STUDIO_PALETTE_PRESETS,
  FASHION_BALLOON_COLORS,
  BALLOON_SIZE_RADIUS_MAP,
  generateStarPath,
  renderArrangementSvg,
  arrangementSvgToDataUrl,
  calculateArrangementStats,
  generateStudioDefs,
  renderBalloonPieceSvg,
  sortPiecesByDepth,
  mirrorArrangementHorizontal,
  distributeColors,
  adjustColorBrightness,
  getFriendlyColorName,
  type BalloonPiece,
  type BalloonShape,
  type BalloonPaletteConfig,
  type BalloonSizeInches,
  type BalloonFinish,
  type BalloonSlot,
  type BalloonModelTemplate,
  type ArrangementStats
} from '../core/balloon-studio-engine';
import { addCustomItem, getAllCovers, addCustomCover, saveProject, getBalloonProjects, deleteProject, type CoverItemRecord } from '../core/db';
import type { ProjectData } from '../types';
import { optimizeUserUploadedImage } from '../core/image-optimizer';
import type { PresetItem } from '../types';

export class BalloonStudioModal {
  private overlayEl: HTMLElement | null = null;
  private canvasSvgEl: SVGSVGElement | null = null;
  private hasCustomName = false;

  private currentBalloonProjectId: string | null = null;
  public hasEverBeenSaved = false;
  public isDirty = false;
  private autosaveTimer: any = null;
  public openedFromScenario = false;
  private onExitCallback?: (() => void);

  // Telas: 'gallery' (tela inicial com modelos) ou 'editor' (área de criação)
  private currentScreen: 'gallery' | 'editor' = 'gallery';

  // Estado atual do arranjo no editor
  private arrangementTitle = 'Arco Orgânico em L';
  private pieces: BalloonPiece[] = [];
  private baseTemplatePieces: BalloonPiece[] = [];
  private palette: BalloonPaletteConfig = {
    A: '#c97a8e',
    B: '#f7dbe1',
    C: '#d4af37',
    D: '#ffffff',
    name: 'Rose Gold, Blush & Pérola',
    names: { A: 'Rosa Quartzo', B: 'Blush Suave', C: 'Ouro Cromo', D: 'Branco Neve' },
    finishes: { A: 'satin', B: 'satin', C: 'chrome', D: 'matte' }
  };

  private selectedPieceIds: Set<string> = new Set();
  private selectedTemplateId: string = 'modelo-arco-l-luxo';
  private activeColorSlot: BalloonSlot = 'A';
  private currentVolumeLevel: 'enxuto' | 'padrao' | 'cheio' = 'padrao';
  private currentDistributionMode: 'mesclado' | 'degrade' | 'blocos' = 'mesclado';
  private currentScaleLevel: 'compacto' | 'padrao' | 'grande' = 'padrao';
  private scaleOrigins: Map<string, { x: number; y: number; sizeInches: BalloonSizeInches }> = new Map();
  private backdropMode: 'redondo' | 'romano' | 'cilindro' | 'livre' = 'redondo';
  private showPersonRef: boolean = true;
  private modelSheetMode: 'append' | 'replace' = 'append';

  // Ferramenta ativa no canvas (Ajustar por padrão)
  private activeTouchTool:
    | 'adjust'
    | 'multi-select'
    | 'pan'
    | 'eraser'
    | 'balloon-5'
    | 'balloon-7'
    | 'balloon-9'
    | 'balloon-10'
    | 'balloon-12'
    | 'balloon-16'
    | 'balloon-18'
    | 'balloon-24'
    | 'balloon-36'
    | 'balloon-star'
    | 'cluster-quad'
    | 'cluster-trio'
    | 'base-balloon'
    | 'light-point'
    | 'big-balloon' = 'adjust';

  // Aba ativa no dock inferior (Inicia sem nenhum menu aberto)
  private activeBottomTab: 'cores' | 'incluir' | 'arranjo' | null = null;
  private isBottomDrawerOpen: boolean = false;
  private activeColorCount: number = 4;
  private hasConfirmedVariar: boolean = false;
  private colorSheetSubtab: 'colors' | 'covers' = 'colors';
  private cachedCovers: CoverItemRecord[] = [];

  // Seleção múltipla moderna (Long-press + botão "+ Vários" + barra contextual inferior)
  private isMultiSelectMode: boolean = false;
  private isMarqueeMode: boolean = false;
  private selectionSubpanel: 'color' | 'size' | null = null;
  private longPressTimer: number | null = null;
  private longPressTriggered: boolean = false;
  private dragStartClientX: number = 0;
  private dragStartClientY: number = 0;

  // Estado de movimentação da tela (Pan) - seja por ferramenta ou por arrasto no fundo livre
  private isPanning: boolean = false;
  private panPointerId: number = -1;
  private panStartClient = { x: 0, y: 0 };
  private panStartPan = { x: 0, y: 0 };
  private hasMovedPan: boolean = false;
  private cachedCanvasRect: DOMRect | null = null;
  private cachedCanvasWidth: number = 400;
  private cachedCanvasHeight: number = 400;
  private multiSelectToggleCandidate: string | null = null;
  private hasMovedDrag: boolean = false;

  // Estado do Retângulo de Seleção (Marquee Box)
  private isMarqueeSelecting = false;
  private marqueePointerId = -1;
  private marqueeStartSvg = { x: 0, y: 0 };
  private marqueeCurrentSvg = { x: 0, y: 0 };
  private marqueeInitialSelected = new Set<string>();

  // Viewport e Zoom Controlado por Pinça de Alto Desempenho e Pan Fluido
  private baseViewBox = { x: 0, y: 0, width: 600, height: 600 };
  private zoomLevel = 1.0;
  private panOffset = { x: 0, y: 0 };
  private activePointers = new Map<number, { x: number; y: number }>();
  private isPinching = false;
  private pinchStartDist = 1;
  private pinchStartZoom = 1;
  private pinchStartPan = { x: 0, y: 0 };
  private pinchStartMidpoint = { x: 0, y: 0 };
  private pinchStartSvgFocal = { x: 0, y: 0 };
  private multiTouchCooldown = 0;
  private viewportRafId: number | null = null;

  // Arraste de peças individuais com 1 único ponteiro (Otimizado com GPU transform)
  private isDragging = false;
  private dragPointerId: number | null = null;
  private dragStartSvgX = 0;
  private dragStartSvgY = 0;
  private currentDragDx = 0;
  private currentDragDy = 0;
  private dragRafId: number | null = null;
  private draggedDomElements: Element[] = [];
  private highlightLayerEl: Element | null = null;
  private cachedDefsKey = '';
  private dragInverseCtm: DOMMatrix | SVGMatrix | null = null;
  private dragPieceInitialPositions: Map<string, { x: number; y: number }> = new Map();

  private applyDragTransform(): void {
    this.dragRafId = null;
    if (!this.isDragging) return;
    const transformStr = `translate(${this.currentDragDx} ${this.currentDragDy})`;
    for (let i = 0; i < this.draggedDomElements.length; i++) {
      this.draggedDomElements[i].setAttribute('transform', transformStr);
    }
    if (this.highlightLayerEl) {
      this.highlightLayerEl.setAttribute('transform', transformStr);
    }
  }

  // Limpa com segurança o estado de arraste e restaura os eventos de toque
  private cleanupDragState(): void {
    this.isDragging = false;
    this.dragPointerId = null;
    this.dragInverseCtm = null;
    if (this.dragRafId) {
      cancelAnimationFrame(this.dragRafId);
      this.dragRafId = null;
    }
    const container = document.getElementById('bs-canvas-container');
    if (container) container.classList.remove('is-dragging-balloon');
    for (let i = 0; i < this.draggedDomElements.length; i++) {
      this.draggedDomElements[i].removeAttribute('transform');
      this.draggedDomElements[i].classList.remove('is-dragged');
    }
    if (this.highlightLayerEl) {
      this.highlightLayerEl.removeAttribute('transform');
    }
    this.draggedDomElements = [];
    this.highlightLayerEl = null;
  }

  // Histórico Undo / Redo
  private history: { pieces: BalloonPiece[]; palette: BalloonPaletteConfig }[] = [];
  private historyIndex = -1;

  // Toggle de reserva na lista de materiais
  private includeSpareBalloons = true;

  // Slot em edição na gaveta de cores
  private editingColorSlot: BalloonSlot = 'A';

  // Callbacks
  private onInsertCallback?: (item: PresetItem) => void;
  private onSavedCallback?: (item: PresetItem) => void;

  constructor(onInsertCallback?: (item: PresetItem) => void, onSavedCallback?: (item: PresetItem) => void) {
    this.onInsertCallback = onInsertCallback;
    this.onSavedCallback = onSavedCallback;
    this.createDomStructure();
  }

  public setOnInsert(cb: (item: PresetItem) => void): void {
    this.onInsertCallback = cb;
  }

  public setOnSaved(cb: (item: PresetItem) => void): void {
    this.onSavedCallback = cb;
  }

  // Cria a estrutura visual completa do Ateliê no DOM
  private createDomStructure(): void {
    if (document.getElementById('balloon-studio-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'balloon-studio-overlay';
    overlay.className = 'balloon-studio-overlay';
    overlay.style.display = 'none';

    overlay.innerHTML = `
      <div class="balloon-studio-container">
        <!-- ======================================================= -->
        <!-- 1. TELA INICIAL: GALERIA DE MODELOS & COMEÇAR DO ZERO   -->
        <!-- ======================================================= -->
        <section id="bs-gallery-screen" class="bs-screen">
          <header class="bs-gallery-header">
            <div class="bs-gallery-header-left">
              <button id="bs-btn-close-gallery" class="bs-btn-icon-circle" title="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h1 class="bs-gallery-header-title">Ateliê de Balões</h1>
            </div>
          </header>

          <main class="bs-gallery-body">
            <div class="bs-gallery-intro">
              <h2 class="bs-gallery-title">Por onde vamos começar?</h2>
              <p class="bs-gallery-sub">Escolha uma base. Você ajusta tudo depois.</p>
            </div>
            <!-- SEÇÃO: MEUS ARRANJOS SALVOS (DROPDOWN RETRÁTIL) -->
            <div id="bs-saved-arrangements-section" class="bs-saved-dropdown-card" style="display: none;">
              <button type="button" id="bs-saved-dropdown-toggle" class="bs-saved-dropdown-toggle" aria-expanded="false" title="Abrir ou fechar arranjos salvos">
                <div class="bs-saved-dropdown-left">
                  <span class="bs-saved-dropdown-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  <span class="bs-saved-dropdown-title">Meus Arranjos Salvos</span>
                  <span id="bs-saved-count-label" class="bs-saved-dropdown-badge">0 salvos</span>
                </div>
                <svg class="bs-saved-dropdown-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div id="bs-saved-dropdown-content" class="bs-saved-dropdown-content">
                <div class="bs-gallery-grid" id="bs-saved-arrangements-grid" style="margin-top: 10px;"></div>
              </div>
            </div>

            <!-- CARD 1: COMEÇAR DO ZERO (EM PRIMEIRO LUGAR - SEM TAGS) -->
            <div id="bs-card-start-zero" class="bs-card-zero" title="Iniciar arranjo em branco">
              <div class="bs-card-zero-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div class="bs-card-zero-content">
                <b class="bs-card-zero-title">Começar do zero (em branco)</b>
                <span class="bs-card-zero-desc">Monte seu arranjo em um espaço livre sem modelo pré-definido</span>
              </div>
            </div>

            <!-- SEÇÃO: MODELOS DE ARRANJO -->
            <div class="bs-gallery-section-header" style="margin: 22px 0 10px 0;">
              <h3 style="font-family: var(--font-brand, 'Fredoka', sans-serif); font-size: 16px; font-weight: 600; color: var(--text-brand, #261613); margin: 0;">
                Modelos de Arranjo
              </h3>
            </div>

            <!-- GRID DOS 10 MODELOS REALISTAS (SEM TAGS) -->
            <div class="bs-gallery-grid" id="bs-gallery-templates-grid">
              ${BALLOON_STUDIO_TEMPLATES.map((tmpl) => {
                const { svg } = renderArrangementSvg(tmpl.pieces, tmpl.palette, { pad: 16, hasFloorShadow: false, idPrefix: `gal-${tmpl.id}-` });
                return `
                  <div class="bs-template-card" data-template-id="${tmpl.id}">
                    <div class="bs-card-thumb">
                      ${svg}
                    </div>
                    <div class="bs-card-meta">
                      <b class="bs-card-name">${tmpl.name}</b>
                      <span class="bs-card-sub">${tmpl.defaultWidthCm} × ${tmpl.defaultHeightCm} cm · ~${tmpl.pieces.length} balões</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </main>
        </section>

        <!-- ======================================================= -->
        <!-- 2. TELA DO EDITOR: ATELIÊ DE CRIAÇÃO E PERSONALIZAÇÃO   -->
        <!-- ======================================================= -->
        <section id="bs-editor-screen" class="bs-screen" style="display:none">
          <!-- Topo do Editor -->
          <header class="bs-editor-header">
            <div class="bs-header-left-actions">
              <button id="bs-btn-back-to-gallery" class="bs-btn-back-gallery" title="Voltar para os modelos" aria-label="Voltar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div id="bs-editor-title-container" class="bs-editor-title-box" title="Clique para renomear">
                <h2 id="bs-editor-current-title" class="bs-editor-title">Arco Orgânico em L</h2>
                <span class="bs-editor-title-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </span>
              </div>
            </div>

            <div class="bs-header-right-actions">
              <div class="bs-undo-redo-group">
                <button id="bs-btn-header-undo" class="bs-btn-header-icon" title="Desfazer (Ctrl+Z)" aria-label="Desfazer" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                </button>
                <button id="bs-btn-header-redo" class="bs-btn-header-icon" title="Refazer (Ctrl+Y)" aria-label="Refazer" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
                </button>
              </div>
              <!-- Ação Principal de Saída -->
              <button id="bs-btn-conclude-flow" class="bs-btn-conclude" title="Salvar Arranjo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span>Salvar</span>
              </button>
            </div>
          </header>

          <!-- Centro: Canvas Interativo Limpo com Zoom por Pinça e Long-Press -->
          <main class="bs-canvas-area" id="bs-canvas-container">
            <!-- Chips Flutuantes Discretos -->
            <div id="bs-chip-dimension" class="bs-canvas-chip bs-chip-dim">180 × 230 cm</div>
            <button id="bs-btn-reset-view" class="bs-canvas-chip bs-chip-reset" style="display:none" title="Resetar zoom e centralizar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span id="bs-zoom-level-badge">100%</span>
            </button>
            <button id="bs-chip-shopping" class="bs-canvas-chip bs-chip-shop" title="Ver lista de compras de balões">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="7"></circle><path d="M12 17v4"></path></svg>
              <span id="bs-chip-count-label">0 balões</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <!-- Estado Vazio (quando tela estiver em branco) -->
            <div id="bs-canvas-empty-state" class="bs-canvas-empty-state" style="display:none">
              <div class="bs-empty-state-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="10" r="7"></circle><path d="M12 17v4"></path></svg>
              </div>
              <p class="bs-empty-state-text">Sua tela está livre</p>
              <span class="bs-empty-state-sub">Toque para adicionar seu primeiro cluster ou balão</span>
            </div>

            <!-- SVG Interativo -->
            <svg id="bs-canvas-svg" class="bs-canvas-svg" xmlns="http://www.w3.org/2000/svg">
              <defs id="bs-svg-defs"></defs>
              <g id="bs-backdrop-sketch-layer"></g>
              <g id="bs-balloons-layer"></g>
              <g id="bs-highlight-layer"></g>
              <g id="bs-marquee-layer"></g>
            </svg>
          </main>

          <!-- Painel Ativo da Aba -->
          <section class="bs-tab-panel" id="bs-tab-active-panel" style="display:none">
            <!-- Conteúdo injetado dinamicamente: Cores, Incluir ou Arranjo -->
          </section>

          <!-- Barra Contextual Inferior de Seleção (Zona do Polegar — substitui o dock ao selecionar balões) -->
          <section id="bs-selection-dock" class="bs-selection-dock" style="display:none" aria-label="Ações de seleção">
            <div id="bs-selection-subpanel" class="bs-selection-subpanel" style="display:none"></div>
            <div id="bs-selection-top-row" class="bs-selection-top-row"></div>
            <div id="bs-selection-actions-row" class="bs-selection-actions-row"></div>
          </section>

          <!-- Dock Inferior com 3 Abas: Cores | Incluir | Arranjo -->
          <nav id="bs-tabs-dock" class="bs-tabs-dock">
            <button class="bs-dock-tab" data-tab="cores">
              <span class="bs-dock-tab-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path></svg>
              </span>
              <span>Cores</span>
            </button>
            <button class="bs-dock-tab" data-tab="incluir">
              <span class="bs-dock-tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
              <span>Incluir</span>
            </button>
            <button class="bs-dock-tab" data-tab="arranjo">
              <span class="bs-dock-tab-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                  <path d="M14 17.5h7"></path>
                  <path d="M17.5 14v7"></path>
                </svg>
              </span>
              <span>Arranjo</span>
            </button>
          </nav>
        </section>

        <!-- ======================================================= -->
        <!-- 3. GAVETAS / BOTTOM SHEETS                             -->
        <!-- ======================================================= -->

        <!-- Gaveta: Trocar Cor, Acabamento ou Capa de Tecido -->
        <div id="bs-color-sheet" class="bs-sheet-dim" style="display:none">
          <div class="bs-bottom-sheet">
            <div class="bs-sheet-grabber"></div>
            <div class="bs-sheet-header">
              <h3 class="bs-sheet-title" id="bs-color-sheet-title">Editar Cor da Família</h3>
              <button id="bs-btn-close-color-sheet" class="bs-sheet-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="bs-sheet-body">
              <!-- Sub-abas: Cor & Acabamento vs Capa de Tecido -->
              <div class="bs-sheet-subtabs">
                <button id="bs-sheet-subtab-color" class="bs-sheet-subtab active">Cor & Acabamento</button>
                <button id="bs-sheet-subtab-cover" class="bs-sheet-subtab">Capa de Tecido</button>
              </div>

              <!-- Painel 1: Cores Sólidas & Acabamentos -->
              <div id="bs-sheet-panel-colors">
                <div class="bs-label-row" style="margin-bottom:8px">
                  <span>Acabamento do Látex:</span>
                </div>
                <div class="bs-finishes-selector" id="bs-sheet-finishes-grid">
                  <button class="bs-finish-btn-chip active" data-finish="satin">Acetinado</button>
                  <button class="bs-finish-btn-chip" data-finish="matte">Fosco</button>
                  <button class="bs-finish-btn-chip" data-finish="chrome">Cromado</button>
                  <button class="bs-finish-btn-chip" data-finish="crystal">Cristal</button>
                  <button class="bs-finish-btn-chip" data-finish="glitter">Glitter</button>
                </div>

                <div class="bs-custom-color-card">
                  <div class="bs-custom-color-info">
                    <span class="bs-custom-color-title">Cor Personalizada</span>
                    <span class="bs-custom-color-sub">Toque para selecionar qualquer tom no círculo</span>
                  </div>
                  <div class="bs-custom-color-picker-wrap">
                    <input type="color" id="bs-custom-color-input" class="bs-custom-color-input" value="#B58938">
                    <span id="bs-custom-color-preview" class="bs-custom-color-preview"></span>
                  </div>
                </div>

                <div class="bs-label-row" style="margin: 14px 0 8px">
                  <span>Cores da Moda (Catálogo):</span>
                </div>
                <div class="bs-color-catalog-grid">
                  ${FASHION_BALLOON_COLORS.map((c) => `
                    <div class="bs-color-tile" data-hex="${c.hex}" data-name="${c.name}">
                      <span class="bs-color-tile-dot" style="background:${c.hex}"></span>
                      <span class="bs-color-tile-name">${c.name}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Painel 2: Capas de Tecido / Estampas -->
              <div id="bs-sheet-panel-covers" style="display:none">
                <div id="bs-active-cover-status" class="bs-covers-status-card" style="display:none">
                  <div class="bs-covers-status-info">
                    <div id="bs-active-cover-thumb" class="bs-covers-status-thumb"></div>
                    <div>
                      <b id="bs-active-cover-name" style="font-size:12px;color:#1C1917">Capa Ativa</b>
                      <div style="font-size:10.5px;color:#78716C">Estampa aplicada aos balões desta cor</div>
                    </div>
                  </div>
                  <button id="bs-btn-remove-active-cover" class="bs-btn-remove-cover">Remover Capa</button>
                </div>

                <div class="bs-label-row" style="margin: 10px 0 8px">
                  <span>Capas e Estampas Disponíveis:</span>
                </div>
                <div class="bs-covers-grid" id="bs-sheet-covers-grid">
                  <div id="bs-card-upload-cover" class="bs-cover-tile bs-cover-tile-upload">
                    <div class="bs-cover-tile-thumb" style="display:flex;align-items:center;justify-content:center;background:transparent;border:none">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                    <span class="bs-cover-tile-name">Nova da Galeria</span>
                    <input type="file" id="bs-input-cover-upload" accept="image/*" style="display:none">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gaveta: Adicionar ou Trocar Arranjo Modelo -->
        <div id="bs-append-model-sheet" class="bs-sheet-dim" style="display:none">
          <div class="bs-bottom-sheet">
            <div class="bs-sheet-grabber"></div>
            <div class="bs-sheet-header">
              <h3 class="bs-sheet-title" id="bs-append-sheet-title">Somar Outro Modelo</h3>
              <button id="bs-btn-close-append-sheet" class="bs-sheet-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="bs-sheet-body">
              <div class="bs-label-row" style="margin-bottom:8px">
                <span id="bs-append-sheet-subtitle">Escolha um modelo para somar ao arranjo atual:</span>
              </div>
              <div class="bs-models-append-grid">
                ${BALLOON_STUDIO_TEMPLATES.map((tmpl) => {
                  const { svg } = renderArrangementSvg(tmpl.pieces, tmpl.palette, { pad: 14, hasFloorShadow: false, idPrefix: `app-${tmpl.id}-` });
                  return `
                    <div class="bs-append-card" data-template-id="${tmpl.id}">
                      <div class="bs-append-card-thumb">${svg}</div>
                      <span class="bs-append-card-title">${tmpl.name}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Gaveta: Lista de Materiais e WhatsApp -->
        <div id="bs-shopping-modal" class="bs-sheet-dim" style="display:none">
          <div class="bs-bottom-sheet">
            <div class="bs-sheet-grabber"></div>
            <div class="bs-sheet-header">
              <h3 class="bs-sheet-title">Lista de Balões & Material</h3>
              <button id="bs-btn-close-shopping" class="bs-sheet-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="bs-sheet-body">
              <div class="bs-shopping-summary-cards">
                <div class="bs-stat-box">
                  <span id="bs-stat-total-balloons" class="bs-stat-num">0</span>
                  <span class="bs-stat-desc">Balões c/ reserva</span>
                </div>
                <div class="bs-stat-box">
                  <span id="bs-stat-meters-frame" class="bs-stat-num">~2,5 m</span>
                  <span class="bs-stat-desc">Fita / Estrutura</span>
                </div>
                <div class="bs-stat-box">
                  <span id="bs-stat-estimated-time" class="bs-stat-num">~1h30</span>
                  <span class="bs-stat-desc">Montagem aprox.</span>
                </div>
              </div>

              <div class="bs-toggle-row">
                <span>Somar 10% de reserva (estouros)</span>
                <label class="bs-switch">
                  <input type="checkbox" id="bs-toggle-spare-checkbox" checked>
                  <span class="bs-slider-round"></span>
                </label>
              </div>

              <div class="bs-materials-list" id="bs-materials-list-container">
                <!-- Linhas por cor geradas dinamicamente -->
              </div>

              <div style="display:flex;gap:8px;margin-top:10px">
                <button id="bs-btn-copy-shopping-text" class="bs-btn-conclude-saveonly" style="flex:1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Copiar Lista</span>
                </button>
                <button id="bs-btn-share-whatsapp" class="bs-btn-whatsapp" style="flex:2;margin-top:0">
                  <span>Enviar no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Gaveta: Concluir / Salvar e Inserir no Cenário -->
        <div id="bs-conclude-modal" class="bs-sheet-dim" style="display:none">
          <div class="bs-bottom-sheet">
            <div class="bs-sheet-grabber"></div>
            <div class="bs-sheet-header">
              <h3 class="bs-sheet-title">Salvar Arranjo</h3>
              <button id="bs-btn-close-conclude" class="bs-sheet-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="bs-sheet-body">
              <div class="bs-conclude-preview-card" id="bs-conclude-preview-box">
                <!-- Miniatura SVG inserida dinamicamente -->
              </div>

              <div class="bs-input-field-group">
                <label class="bs-input-label">Nome do Arranjo:</label>
                <input type="text" id="bs-input-arrangement-name" class="bs-input-text" value="Arco Orgânico em L">
              </div>

              <button id="bs-btn-confirm-save-only" class="bs-btn-conclude-insert">
                Salvar Arranjo
              </button>

              <span id="bs-link-view-shopping" class="bs-conclude-materials-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                <span>Ver Lista de Materiais (<span id="bs-link-count">0</span> balões)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;
    this.canvasSvgEl = document.getElementById('bs-canvas-svg') as unknown as SVGSVGElement;

    this.setupEvents();
  }

  // Configura todos os eventos de UI e interação
  private setupEvents(): void {
    if (!this.overlayEl) return;

    // 1. Ações da Galeria Inicial
    document.getElementById('bs-btn-close-gallery')?.addEventListener('click', async () => {
      await this.requestExit();
    });

    // Card de Começar do Zero (Em Primeiro Lugar)
    document.getElementById('bs-card-start-zero')?.addEventListener('click', () => {
      this.startFromScratch();
    });

    // Toggle do Dropdown 'Meus Arranjos Salvos'
    document.getElementById('bs-saved-dropdown-toggle')?.addEventListener('click', () => {
      const sectionEl = document.getElementById('bs-saved-arrangements-section');
      const toggleBtn = document.getElementById('bs-saved-dropdown-toggle');
      if (sectionEl) {
        const isOpen = sectionEl.classList.toggle('is-open');
        toggleBtn?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
    });

    // Cards dos 10 Modelos na Galeria
    this.overlayEl.querySelectorAll('.bs-template-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const id = target.dataset.templateId;
        if (id) {
          this.loadTemplate(id);
          this.setScreen('editor');
        }
      });
    });

    // 2. Ações do Topo do Editor (Retorna à Galeria com Salvamento Silencioso)
    document.getElementById('bs-btn-back-to-gallery')?.addEventListener('click', async () => {
      if (this.autosaveTimer) {
        clearTimeout(this.autosaveTimer);
        this.autosaveTimer = null;
        if (this.isDirty) {
          await this.performAutosave();
        }
      }

      this.setScreen('gallery');
      await this.renderSavedArrangements();
    });

    document.getElementById('bs-editor-title-container')?.addEventListener('click', async () => {
      const currentName = this.arrangementTitle || 'Novo Arranjo';
      const novo = prompt('Digite o nome do arranjo:', currentName);
      if (novo && novo.trim() && novo.trim() !== currentName) {
        this.arrangementTitle = novo.trim();
        this.hasCustomName = true;
        const el = document.getElementById('bs-editor-current-title');
        if (el) el.textContent = this.arrangementTitle;

        if (this.currentBalloonProjectId) {
          await saveProject({
            id: this.currentBalloonProjectId,
            title: this.arrangementTitle,
            projectType: 'balloon',
            elements: [],
            balloonData: {
              pieces: JSON.parse(JSON.stringify(this.pieces)),
              palette: JSON.parse(JSON.stringify(this.palette)),
              distributionMode: this.currentDistributionMode,
              volumeLevel: this.currentVolumeLevel,
              selectedTemplateId: this.selectedTemplateId
            },
            thumbnailUrl: this.exportSvgThumbnail(),
            updatedAt: Date.now()
          });
        }
      }
    });



    document.getElementById('bs-btn-header-undo')?.addEventListener('click', () => {
      this.undo();
    });
    document.getElementById('bs-btn-header-redo')?.addEventListener('click', () => {
      this.redo();
    });

    document.getElementById('bs-btn-conclude-flow')?.addEventListener('click', () => {
      this.openConcludeModal();
    });

    document.getElementById('bs-btn-reset-view')?.addEventListener('click', () => {
      this.resetViewportZoom();
    });

    document.getElementById('bs-chip-shopping')?.addEventListener('click', () => {
      this.openShoppingModal();
    });

    // 4. Barra Contextual Inferior de Seleção (eventos delegados)
    document.getElementById('bs-selection-dock')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      const slotBtn = target.closest('[data-sel-slot]') as HTMLElement | null;
      if (slotBtn) {
        const slot = slotBtn.dataset.selSlot as BalloonSlot;
        if (slot) this.setSelectedPieceSlot(slot);
        return;
      }

      const sizeBtn = target.closest('[data-sel-size]') as HTMLElement | null;
      if (sizeBtn) {
        const sz = Number(sizeBtn.dataset.selSize) as BalloonSizeInches;
        if (sz) this.setSelectedPieceSize(sz);
        return;
      }

      const cmdBtn = target.closest('[data-sel-cmd]') as HTMLElement | null;
      if (cmdBtn) {
        const cmd = cmdBtn.dataset.selCmd;
        if (cmd === 'enter-multi') {
          this.enterMultiSelectMode();
        } else if (cmd === 'exit-multi' || cmd === 'clear') {
          this.exitMultiSelectMode(true);
        } else if (cmd === 'same-color') {
          this.selectSameColor();
        } else if (cmd === 'same-size') {
          this.selectSameSize();
        } else if (cmd === 'toggle-marquee') {
          this.toggleMarqueeMode();
        } else if (cmd === 'select-all') {
          this.selectAllPieces();
        }
        return;
      }

      const actBtn = target.closest('[data-sel-act]') as HTMLElement | null;
      if (actBtn) {
        if ((actBtn as HTMLButtonElement).disabled) return;
        const act = actBtn.dataset.selAct;
        if (act === 'color') {
          this.selectionSubpanel = this.selectionSubpanel === 'color' ? null : 'color';
          this.renderSelectionDock();
        } else if (act === 'size') {
          this.selectionSubpanel = this.selectionSubpanel === 'size' ? null : 'size';
          this.renderSelectionDock();
        } else if (act === 'bring-front') {
          this.bringSelectedForward();
        } else if (act === 'send-back') {
          this.sendSelectedBackward();
        } else if (act === 'group') {
          this.toggleGroupSelected();
        } else if (act === 'duplicate') {
          this.duplicateSelected();
        } else if (act === 'delete') {
          this.deleteSelected();
        }
      }
    });

    // 6. Dock de Abas Inferiores com Comportamento de Toggle ao Re-clicar
    this.overlayEl.querySelectorAll('.bs-dock-tab').forEach((tabBtn) => {
      tabBtn.addEventListener('click', (e) => {
        const btn = e.currentTarget as HTMLElement;
        const tab = btn.dataset.tab as 'cores' | 'incluir' | 'arranjo';
        if (tab) this.toggleBottomTab(tab);
      });
    });

    // 7. Gavetas Modais (Fechar e Ações)
    document.getElementById('bs-btn-close-color-sheet')?.addEventListener('click', () => this.toggleSheet('bs-color-sheet', false));
    document.getElementById('bs-btn-close-append-sheet')?.addEventListener('click', () => this.toggleSheet('bs-append-model-sheet', false));
    document.getElementById('bs-btn-close-shopping')?.addEventListener('click', () => this.toggleSheet('bs-shopping-modal', false));
    document.getElementById('bs-btn-close-conclude')?.addEventListener('click', () => this.toggleSheet('bs-conclude-modal', false));

    // Sub-abas na Gaveta de Cores
    document.getElementById('bs-sheet-subtab-color')?.addEventListener('click', () => {
      this.switchColorSheetSubtab('colors');
    });
    document.getElementById('bs-sheet-subtab-cover')?.addEventListener('click', () => {
      this.switchColorSheetSubtab('covers');
    });

    // Remoção de capa ativa
    document.getElementById('bs-btn-remove-active-cover')?.addEventListener('click', () => {
      this.removeCoverFromSlot(this.editingColorSlot);
    });

    // Upload de capa da galeria
    const coverUploadInput = document.getElementById('bs-input-cover-upload') as HTMLInputElement | null;
    coverUploadInput?.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const optimizedUrl = await optimizeUserUploadedImage(file, 1400);
        const newCover = await addCustomCover({
          themeName: 'Minhas Estampas',
          name: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: optimizedUrl,
          targetType: 'all'
        });
        this.cachedCovers.unshift(newCover);
        this.applyCoverToSlot(this.editingColorSlot, newCover.imageUrl, newCover.name);
      } catch (err) {
        console.error('Falha ao importar capa da galeria:', err);
      }
      if (coverUploadInput) coverUploadInput.value = '';
    });

    // Clique nos cards de Adicionar ou Trocar Arranjo Modelo
    this.overlayEl.querySelectorAll('.bs-append-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const id = target.dataset.templateId;
        if (id) {
          if (this.modelSheetMode === 'replace') {
            this.replaceModelKeepingPalette(id);
          } else {
            this.appendModelTemplate(id);
          }
        }
      });
    });

    document.getElementById('bs-toggle-spare-checkbox')?.addEventListener('change', (e) => {
      this.includeSpareBalloons = (e.target as HTMLInputElement).checked;
      this.renderShoppingContent();
    });

    document.getElementById('bs-btn-copy-shopping-text')?.addEventListener('click', () => this.copyShoppingListText());
    document.getElementById('bs-btn-share-whatsapp')?.addEventListener('click', () => this.shareOnWhatsApp());

    document.getElementById('bs-btn-confirm-save-only')?.addEventListener('click', () => this.concludeSave());
    document.getElementById('bs-link-view-shopping')?.addEventListener('click', () => {
      this.toggleSheet('bs-conclude-modal', false);
      this.openShoppingModal();
    });

    // Seletor de Acabamento na Gaveta de Cor
    this.overlayEl.querySelectorAll('.bs-finish-btn-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.overlayEl?.querySelectorAll('.bs-finish-btn-chip').forEach((c) => c.classList.remove('active'));
        target.classList.add('active');
        const fin = target.dataset.finish as BalloonFinish;
        if (fin) this.updateSlotFinish(this.editingColorSlot, fin);
      });
    });

    // Seletor de Cores da Moda na Gaveta de Cor
    this.overlayEl.querySelectorAll('.bs-color-tile').forEach((tile) => {
      tile.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const hex = target.dataset.hex;
        const name = target.dataset.name;
        if (hex && name) {
          this.updateSlotColorAndName(this.editingColorSlot, hex, name);
          this.toggleSheet('bs-color-sheet', false);
        }
      });
    });

    const customColorInput = document.getElementById('bs-custom-color-input') as HTMLInputElement | null;
    customColorInput?.addEventListener('input', (e) => {
      const hex = (e.target as HTMLInputElement).value;
      if (hex) this.updateSlotColorAndName(this.editingColorSlot, hex, getFriendlyColorName(hex));
    });

    // 8. Eventos de Canvas: Pinch-to-zoom com multi-touch guard, long-press e arrasto de balões
    this.setupCanvasPointerGestures();

    // 9. Atalhos de teclado no estúdio
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen() || this.currentScreen !== 'editor') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedPieceIds.size > 0) {
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
          this.deleteSelected();
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.undo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
      } else if (e.key === 'Escape') {
        if (this.isMultiSelectMode || this.selectedPieceIds.size > 0) {
          this.exitMultiSelectMode(true);
        } else {
          this.requestExit();
        }
      }
    });
  }

  // Alterna entre tela inicial (galeria) e editor
  private setScreen(screen: 'gallery' | 'editor'): void {
    this.currentScreen = screen;
    const galleryScreen = document.getElementById('bs-gallery-screen');
    const editorScreen = document.getElementById('bs-editor-screen');
    if (galleryScreen) galleryScreen.style.display = screen === 'gallery' ? 'flex' : 'none';
    if (editorScreen) editorScreen.style.display = screen === 'editor' ? 'flex' : 'none';

    if (screen === 'editor') {
      this.computeBaseViewBox();
      this.renderCanvas();
      this.updateUndoRedoButtons();
      this.renderSelectionDock();
      // Não reabre menus automaticamente; apenas renderiza se a gaveta estiver explicitamente aberta
      if (this.isBottomDrawerOpen) {
        this.renderTabActivePanel();
      } else {
        const panel = document.getElementById('bs-tab-active-panel');
        if (panel) panel.style.display = 'none';
      }
    } else if (screen === 'gallery') {
      this.exitMultiSelectMode(true);
      this.closeBottomDrawer();
      this.closeAllSheets();
      this.renderSavedArrangements();
    }
  }

  // ----------------------------------------------------------------------
  // SISTEMA DE ZOOM POR PINÇA E GESTOS NO CANVAS
  // ----------------------------------------------------------------------

  // Calcula viewBox base estável e centralizado baseado na cenografia física real e no modelo
  private computeBaseViewBox(): void {
    // Dimensões de referência padrão da cenografia física real (Painel + Pessoa 1,70m + Piso)
    let minX = -30;
    let maxX = 475;
    let minY = -25;
    let maxY = 525;

    // Se houver balões que se expandam além do espaço de referência, expande com margem
    for (const p of this.pieces) {
      const r = BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28;
      if (p.x - r < minX) minX = p.x - r;
      if (p.x + r > maxX) maxX = p.x + r;
      if (p.y - r < minY) minY = p.y - r;
      if (p.y + r > maxY) maxY = p.y + r;
    }

    const pad = 28;
    const sceneW = (maxX - minX) + pad * 2;
    const sceneH = (maxY - minY) + pad * 2;
    const size = Math.max(sceneW, sceneH);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    this.baseViewBox = {
      x: Math.round(cx - size / 2),
      y: Math.round(cy - size / 2),
      width: Math.round(size),
      height: Math.round(size)
    };

    this.zoomLevel = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.applyViewport();
  }

  // Agendamento via rAF para manter 60/120fps fluidos sem engasgos ou layout thrashing
  private scheduleViewportUpdate(): void {
    if (this.viewportRafId) return;
    this.viewportRafId = requestAnimationFrame(() => {
      this.viewportRafId = null;
      this.applyViewport(true);
    });
  }

  // Aplica o viewBox calculado ao SVG (NUNCA altera com o simples arrasto de balões)
  private applyViewport(skipPillUpdate = false): void {
    if (!this.canvasSvgEl) return;
    const w = this.baseViewBox.width / this.zoomLevel;
    const h = this.baseViewBox.height / this.zoomLevel;
    const cx = this.baseViewBox.x + this.baseViewBox.width / 2 + this.panOffset.x;
    const cy = this.baseViewBox.y + this.baseViewBox.height / 2 + this.panOffset.y;

    const vx = Math.round(cx - w / 2);
    const vy = Math.round(cy - h / 2);
    this.canvasSvgEl.setAttribute('viewBox', `${vx} ${vy} ${Math.round(w)} ${Math.round(h)}`);

    // Atualiza chip discreto de reset de zoom
    const resetBtn = document.getElementById('bs-btn-reset-view');
    if (resetBtn) {
      const isDefault = Math.abs(this.zoomLevel - 1) < 0.05 && Math.abs(this.panOffset.x) < 5 && Math.abs(this.panOffset.y) < 5;
      resetBtn.style.display = isDefault ? 'none' : 'inline-flex';
      const badge = document.getElementById('bs-zoom-level-badge');
      if (badge) badge.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    if (!skipPillUpdate && !this.isPinching && !this.isPanning) {
      this.updateBalloonPillPosition();
    }
  }

  public resetViewportZoom(): void {
    this.zoomLevel = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.applyViewport();
  }

  // Configuração dos ponteiros de toque no Canvas (Multi-Touch Guard + Pinça + Ferramentas)
  private setupCanvasPointerGestures(): void {
    const canvas = this.canvasSvgEl;
    if (!canvas) return;

    // Evita menu de contexto nativo do celular durante long-press em balões
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // DOIS DEDOS: CANCELA IMEDIATAMENTE QUALQUER ARRASTO OU LONG-PRESS!
      if (this.activePointers.size >= 2) {
        this.cancelLongPressTimer();
        if (this.isDragging) {
          this.cleanupDragState();

          // Reverte os balões para a posição original anterior ao toque acidental
          this.selectedPieceIds.forEach((id) => {
            const init = this.dragPieceInitialPositions.get(id);
            const p = this.pieces.find((x) => x.id === id);
            if (init && p) {
              p.x = init.x;
              p.y = init.y;
            }
          });
          this.renderCanvas(false);
        }

        if (this.isMarqueeSelecting) {
          this.isMarqueeSelecting = false;
          this.marqueePointerId = -1;
          const marqueeLayer = document.getElementById('bs-marquee-layer');
          if (marqueeLayer) marqueeLayer.innerHTML = '';
        }

        // Inicia pinça de zoom de alto desempenho com ancoragem focal
        if (this.isPanning) {
          this.isPanning = false;
          this.panPointerId = -1;
          const container = document.getElementById('bs-canvas-container');
          if (container) container.classList.remove('is-panning');
        }

        const pts = Array.from(this.activePointers.values());
        this.isPinching = true;
        this.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        this.pinchStartZoom = this.zoomLevel;
        this.pinchStartPan = { ...this.panOffset };

        const rect = this.canvasSvgEl.getBoundingClientRect();
        this.cachedCanvasRect = rect;
        this.cachedCanvasWidth = rect.width || 400;
        this.cachedCanvasHeight = rect.height || 400;

        const midClientX = (pts[0].x + pts[1].x) / 2;
        const midClientY = (pts[0].y + pts[1].y) / 2;
        this.pinchStartMidpoint = { x: midClientX, y: midClientY };
        this.pinchStartSvgFocal = this.screenToSvgCoordinates(midClientX, midClientY);

        const container = document.getElementById('bs-canvas-container');
        if (container) container.classList.add('is-pinching');
        return;
      }

      // Se ainda estiver no cooldown pós-pinça, ignora início de arrasto
      if (Date.now() < this.multiTouchCooldown) return;

      const target = e.target as SVGElement;
      const pieceGroup = target.closest('.balloon-piece') as unknown as SVGElement | null;

      // 1. Mover a Tela (Pan explícito caso ferramenta esteja ativa)
      if (this.activeTouchTool === 'pan') {
        this.isPanning = true;
        this.panPointerId = e.pointerId;
        this.panStartClient = { x: e.clientX, y: e.clientY };
        this.panStartPan = { ...this.panOffset };
        this.hasMovedPan = false;

        const rect = this.canvasSvgEl.getBoundingClientRect();
        this.cachedCanvasRect = rect;
        this.cachedCanvasWidth = rect.width || 400;
        this.cachedCanvasHeight = rect.height || 400;

        const container = document.getElementById('bs-canvas-container');
        if (container) container.classList.add('is-panning');
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
        return;
      }

      // 2. Apagar (se ativado programaticamente)
      if (this.activeTouchTool === 'eraser') {
        if (pieceGroup) {
          const pieceId = pieceGroup.id.replace('piece-', '');
          this.deletePieceById(pieceId);
        }
        return;
      }

      // 3. Inserção de Peças por toque no canvas (se ativo)
      if (this.activeTouchTool === 'balloon-5' || this.activeTouchTool === 'light-point') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 5);
        return;
      }

      if (this.activeTouchTool === 'balloon-7') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 7);
        return;
      }

      if (this.activeTouchTool === 'balloon-9') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 9);
        return;
      }

      if (this.activeTouchTool === 'balloon-10') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 10);
        return;
      }

      if (this.activeTouchTool === 'balloon-12' || this.activeTouchTool === 'base-balloon') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 12);
        return;
      }

      if (this.activeTouchTool === 'balloon-16') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 16);
        return;
      }

      if (this.activeTouchTool === 'balloon-18' || this.activeTouchTool === 'big-balloon') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 18);
        return;
      }

      if (this.activeTouchTool === 'balloon-24') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 24);
        return;
      }

      if (this.activeTouchTool === 'balloon-36') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 36);
        return;
      }

      if (this.activeTouchTool === 'balloon-star') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 18, 'star');
        return;
      }

      if (this.activeTouchTool === 'cluster-quad') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertClusterQuadAt(svgCoords.x, svgCoords.y);
        return;
      }

      if (this.activeTouchTool === 'cluster-trio') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertClusterTrioAt(svgCoords.x, svgCoords.y);
        return;
      }

      // Se a tela estiver totalmente vazia e o usuário tocar em qualquer ponto
      if (this.pieces.length === 0 && !pieceGroup) {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertClusterAt(svgCoords.x, svgCoords.y);
        return;
      }

      // 4. Seleção Múltipla Ativa (Toque acumula/alterna, arrasto >8px move grupo, Caixa desenha retângulo)
      if (this.isMultiSelectMode) {
        if (pieceGroup) {
          const pieceId = pieceGroup.id.replace('piece-', '');
          const clickedPiece = this.pieces.find((x) => x.id === pieceId);
          const targetIds = clickedPiece?.groupId
            ? this.pieces.filter((x) => x.groupId === clickedPiece.groupId).map((x) => x.id)
            : [pieceId];

          const anySelected = targetIds.some((id) => this.selectedPieceIds.has(id));
          if (anySelected) {
            this.multiSelectToggleCandidate = pieceId;
          } else {
            targetIds.forEach((id) => this.selectedPieceIds.add(id));
            this.multiSelectToggleCandidate = null;
          }
          this.hasMovedDrag = false;
          this.longPressTriggered = false;
          this.dragStartClientX = e.clientX;
          this.dragStartClientY = e.clientY;

          this.renderSelectionHighlights();
          this.renderSelectionDock();

          this.isDragging = true;
          this.dragPointerId = e.pointerId;

          const ctm = this.canvasSvgEl?.getScreenCTM();
          this.dragInverseCtm = ctm ? ctm.inverse() : null;

          const svgPt = this.screenToSvgCoordinates(e.clientX, e.clientY);
          this.dragStartSvgX = svgPt.x;
          this.dragStartSvgY = svgPt.y;
          this.currentDragDx = 0;
          this.currentDragDy = 0;

          this.dragPieceInitialPositions.clear();
          this.draggedDomElements = [];
          const balloonsLayer = document.getElementById('bs-balloons-layer');
          this.selectedPieceIds.forEach((id) => {
            const p = this.pieces.find((x) => x.id === id);
            if (p) this.dragPieceInitialPositions.set(id, { x: p.x, y: p.y });
            const el = balloonsLayer ? balloonsLayer.querySelector('#piece-' + id) : document.getElementById('piece-' + id);
            if (el) this.draggedDomElements.push(el);
          });
          this.highlightLayerEl = document.getElementById('bs-highlight-layer');

          try {
            canvas.setPointerCapture(e.pointerId);
          } catch (_) {}
        } else if (this.isMarqueeMode) {
          // Modo Caixa explícito: arrastar no fundo livre desenha o retângulo de seleção
          this.isMarqueeSelecting = true;
          this.marqueePointerId = e.pointerId;
          const svgPt = this.screenToSvgCoordinates(e.clientX, e.clientY);
          this.marqueeStartSvg = svgPt;
          this.marqueeCurrentSvg = { ...svgPt };
          this.marqueeInitialSelected = new Set(this.selectedPieceIds);

          const marqueeLayer = document.getElementById('bs-marquee-layer');
          if (marqueeLayer) marqueeLayer.innerHTML = '';

          try {
            canvas.setPointerCapture(e.pointerId);
          } catch (_) {}
        } else {
          // Mesmo em seleção múltipla, arrastar fundo livre mantém Pan natural com 1 dedo!
          this.isPanning = true;
          this.panPointerId = e.pointerId;
          this.panStartClient = { x: e.clientX, y: e.clientY };
          this.panStartPan = { ...this.panOffset };
          this.hasMovedPan = false;

          const rect = this.canvasSvgEl.getBoundingClientRect();
          this.cachedCanvasRect = rect;
          this.cachedCanvasWidth = rect.width || 400;
          this.cachedCanvasHeight = rect.height || 400;

          const container = document.getElementById('bs-canvas-container');
          if (container) container.classList.add('is-panning');
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch (_) {}
        }
        return;
      }

      // 5. Modo Padrão (Toque seleciona, Arrasto >8px move, Segurar 360ms ativa Seleção Múltipla)
      if (pieceGroup) {
        const pieceId = pieceGroup.id.replace('piece-', '');
        const clickedPiece = this.pieces.find((x) => x.id === pieceId);

        // Fecha gaveta de aba caso esteja aberta para dar foco total à edição do balão
        if (this.isBottomDrawerOpen) {
          this.closeBottomDrawer();
        }

        // Se o balão faz parte de um grupo vinculado, seleciona todos os balões do grupo juntos
        if (clickedPiece?.groupId) {
          const groupPieces = this.pieces.filter((x) => x.groupId === clickedPiece.groupId);
          const isGroupAlreadySelected = groupPieces.every((x) => this.selectedPieceIds.has(x.id));
          if (!isGroupAlreadySelected) {
            this.selectedPieceIds.clear();
            groupPieces.forEach((x) => this.selectedPieceIds.add(x.id));
          }
        } else if (!this.selectedPieceIds.has(pieceId)) {
          this.selectedPieceIds.clear();
          this.selectedPieceIds.add(pieceId);
        }

        this.hasMovedDrag = false;
        this.longPressTriggered = false;
        this.dragStartClientX = e.clientX;
        this.dragStartClientY = e.clientY;

        this.renderSelectionHighlights();
        this.renderSelectionDock();

        // Inicia timer de long-press (360ms) para ativar seleção múltipla naturalmente
        this.cancelLongPressTimer();
        this.longPressTimer = window.setTimeout(() => {
          this.longPressTimer = null;
          if (!this.hasMovedDrag && !this.isPinching && this.activePointers.size === 1) {
            this.longPressTriggered = true;
            this.cleanupDragState();
            this.isMultiSelectMode = true;
            this.isMarqueeMode = false;
            this.selectionSubpanel = null;
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try { navigator.vibrate(25); } catch (_) {}
            }
            this.renderSelectionHighlights();
            this.renderSelectionDock();
            this.showToast('Seleção múltipla ativa — toque em outros balões');
          }
        }, 360);

        this.isDragging = true;
        this.dragPointerId = e.pointerId;

        const ctm = this.canvasSvgEl?.getScreenCTM();
        this.dragInverseCtm = ctm ? ctm.inverse() : null;

        const svgPt = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.dragStartSvgX = svgPt.x;
        this.dragStartSvgY = svgPt.y;
        this.currentDragDx = 0;
        this.currentDragDy = 0;

        this.dragPieceInitialPositions.clear();
        this.draggedDomElements = [];
        const balloonsLayer = document.getElementById('bs-balloons-layer');
        this.selectedPieceIds.forEach((id) => {
          const p = this.pieces.find((x) => x.id === id);
          if (p) this.dragPieceInitialPositions.set(id, { x: p.x, y: p.y });
          const el = balloonsLayer ? balloonsLayer.querySelector('#piece-' + id) : document.getElementById('piece-' + id);
          if (el) this.draggedDomElements.push(el);
        });
        this.highlightLayerEl = document.getElementById('bs-highlight-layer');

        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
      } else {
        // Tocou no fundo livre do canvas no modo normal: inicia Pan fluido (arrastar a tela diretamente)
        this.isPanning = true;
        this.panPointerId = e.pointerId;
        this.panStartClient = { x: e.clientX, y: e.clientY };
        this.panStartPan = { ...this.panOffset };
        this.hasMovedPan = false;

        const rect = this.canvasSvgEl.getBoundingClientRect();
        this.cachedCanvasRect = rect;
        this.cachedCanvasWidth = rect.width || 400;
        this.cachedCanvasHeight = rect.height || 400;

        const container = document.getElementById('bs-canvas-container');
        if (container) container.classList.add('is-panning');
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    });

    canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Retângulo de Seleção (Marquee Box) quando Modo Caixa está ativo
      if (this.isMarqueeSelecting && e.pointerId === this.marqueePointerId && this.activePointers.size === 1) {
        const svgPt = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.marqueeCurrentSvg = svgPt;

        const minX = Math.min(this.marqueeStartSvg.x, svgPt.x);
        const maxX = Math.max(this.marqueeStartSvg.x, svgPt.x);
        const minY = Math.min(this.marqueeStartSvg.y, svgPt.y);
        const maxY = Math.max(this.marqueeStartSvg.y, svgPt.y);
        const w = maxX - minX;
        const h = maxY - minY;

        // Atualiza a seleção em tempo real com todos os balões capturados pelo retângulo
        const currentSelected = new Set(this.marqueeInitialSelected);

        for (let i = 0; i < this.pieces.length; i++) {
          const p = this.pieces[i];
          const r = (BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28) * 0.70;
          const intersects = (p.x + r >= minX) && (p.x - r <= maxX) && (p.y + r >= minY) && (p.y - r <= maxY);
          if (intersects) {
            currentSelected.add(p.id);
            if (p.groupId) {
              for (const sibling of this.pieces) {
                if (sibling.groupId === p.groupId) currentSelected.add(sibling.id);
              }
            }
          }
        }

        this.selectedPieceIds = currentSelected;
        this.renderSelectionHighlights();
        this.renderSelectionDock();

        const marqueeLayer = document.getElementById('bs-marquee-layer');
        if (marqueeLayer) {
          const badgeHtml = currentSelected.size > 0
            ? `<g transform="translate(${maxX}, ${minY})">
                <rect x="-34" y="-20" width="34" height="17" rx="4" fill="#B58938"/>
                <text x="-17" y="-8" fill="#FFFFFF" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${currentSelected.size}</text>
               </g>`
            : '';

          marqueeLayer.innerHTML = `
            <rect x="${minX}" y="${minY}" width="${Math.max(1, w)}" height="${Math.max(1, h)}" rx="3"
              fill="rgba(181, 137, 56, 0.14)" stroke="#B58938" stroke-width="1.8" stroke-dasharray="4 3"/>
            ${badgeHtml}
          `;
        }
        return;
      }

      // Mover Tela (Pan) - arrastar o fundo livre
      if (this.isPanning && e.pointerId === this.panPointerId && this.activePointers.size === 1) {
        const dx = e.clientX - this.panStartClient.x;
        const dy = e.clientY - this.panStartClient.y;

        if (Math.hypot(dx, dy) > 4) {
          this.hasMovedPan = true;
        }

        const cWidth = this.cachedCanvasWidth || 400;
        const svgScale = (this.baseViewBox.width / this.zoomLevel) / cWidth;

        this.panOffset.x = Math.round(this.panStartPan.x - dx * svgScale);
        this.panOffset.y = Math.round(this.panStartPan.y - dy * svgScale);

        this.scheduleViewportUpdate();
        return;
      }

      // Gesto de pinça com 2 dedos (Ultra fluido com ancoragem focal e zero layout thrashing)
      if (this.activePointers.size >= 2 && this.isPinching) {
        const pts = Array.from(this.activePointers.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        const scale = currentDist / this.pinchStartDist;
        const newZoom = Math.max(0.5, Math.min(3.5, this.pinchStartZoom * scale));
        this.zoomLevel = newZoom;

        const currentMidX = (pts[0].x + pts[1].x) / 2;
        const currentMidY = (pts[0].y + pts[1].y) / 2;

        const rect = this.cachedCanvasRect;
        const cWidth = this.cachedCanvasWidth || 400;
        const cHeight = this.cachedCanvasHeight || 400;
        const rectLeft = rect ? rect.left : 0;
        const rectTop = rect ? rect.top : 0;

        const u = Math.max(0, Math.min(1, (currentMidX - rectLeft) / cWidth));
        const v = Math.max(0, Math.min(1, (currentMidY - rectTop) / cHeight));

        const viewBoxW = this.baseViewBox.width / newZoom;
        const viewBoxH = this.baseViewBox.height / newZoom;

        const targetVx = this.pinchStartSvgFocal.x - u * viewBoxW;
        const targetVy = this.pinchStartSvgFocal.y - v * viewBoxH;

        const targetCenterX = targetVx + viewBoxW / 2;
        const targetCenterY = targetVy + viewBoxH / 2;

        const baseCenterX = this.baseViewBox.x + this.baseViewBox.width / 2;
        const baseCenterY = this.baseViewBox.y + this.baseViewBox.height / 2;

        this.panOffset.x = Math.round(targetCenterX - baseCenterX);
        this.panOffset.y = Math.round(targetCenterY - baseCenterY);

        this.scheduleViewportUpdate();
        return;
      }

      // Arraste de peças com deadzone de 8px em tela (evita arrasto acidental ao tocar/desmarcar)
      if (this.isDragging && e.pointerId === this.dragPointerId && this.activePointers.size === 1) {
        const clientDist = Math.hypot(e.clientX - this.dragStartClientX, e.clientY - this.dragStartClientY);
        if (clientDist <= 8 && !this.hasMovedDrag) {
          return;
        }

        if (!this.hasMovedDrag) {
          this.cancelLongPressTimer();
          this.hasMovedDrag = true;
          const container = document.getElementById('bs-canvas-container');
          if (container) container.classList.add('is-dragging-balloon');
          for (let i = 0; i < this.draggedDomElements.length; i++) {
            this.draggedDomElements[i].classList.add('is-dragged');
          }
        }

        const svgPt = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.currentDragDx = svgPt.x - this.dragStartSvgX;
        this.currentDragDy = svgPt.y - this.dragStartSvgY;

        if (!this.dragRafId) {
          this.dragRafId = requestAnimationFrame(() => this.applyDragTransform());
        }
      }
    });

    const onPointerEnd = (e: PointerEvent) => {
      this.activePointers.delete(e.pointerId);
      this.cancelLongPressTimer();

      // Finaliza Retângulo de Seleção (Marquee Box)
      if (this.isMarqueeSelecting && e.pointerId === this.marqueePointerId) {
        this.isMarqueeSelecting = false;
        this.marqueePointerId = -1;
        const marqueeLayer = document.getElementById('bs-marquee-layer');
        if (marqueeLayer) marqueeLayer.innerHTML = '';
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}

        if (this.selectedPieceIds.size > 0 && typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(18); } catch (_) {}
        }
        this.renderSelectionDock();
      }

      // Finaliza pan da tela
      if (this.isPanning && e.pointerId === this.panPointerId) {
        const didMove = this.hasMovedPan;
        this.isPanning = false;
        this.panPointerId = -1;
        const container = document.getElementById('bs-canvas-container');
        if (container) container.classList.remove('is-panning');
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}

        if (this.viewportRafId) {
          cancelAnimationFrame(this.viewportRafId);
          this.viewportRafId = null;
        }

        if (!didMove && !this.isMultiSelectMode) {
          // Toque simples no fundo livre fora do modo múltiplos: limpa seleção e fecha subpainel
          if (this.selectedPieceIds.size > 0) {
            this.selectedPieceIds.clear();
            this.selectionSubpanel = null;
            this.renderSelectionHighlights();
            this.renderSelectionDock();
          } else if (this.isBottomDrawerOpen) {
            this.closeBottomDrawer();
          }
        }
        this.applyViewport();
      }

      if (this.activePointers.size < 2 && this.isPinching) {
        this.isPinching = false;
        const container = document.getElementById('bs-canvas-container');
        if (container) container.classList.remove('is-pinching');
        if (this.viewportRafId) {
          cancelAnimationFrame(this.viewportRafId);
          this.viewportRafId = null;
        }
        // Cooldown de 240ms pós-pinça
        this.multiTouchCooldown = Date.now() + 240;
        this.applyViewport();
      }

      if (this.isDragging && e.pointerId === this.dragPointerId) {
        const didMove = this.hasMovedDrag;
        const finalDx = this.currentDragDx;
        const finalDy = this.currentDragDy;

        this.cleanupDragState();

        // No modo múltiplos, se tocou em uma peça (ou grupo) já selecionada sem arrastar, desmarca ela
        if (this.isMultiSelectMode && !didMove && this.multiSelectToggleCandidate) {
          const clickedPiece = this.pieces.find((x) => x.id === this.multiSelectToggleCandidate);
          const toggleIds = clickedPiece?.groupId
            ? this.pieces.filter((x) => x.groupId === clickedPiece.groupId).map((x) => x.id)
            : [this.multiSelectToggleCandidate];
          toggleIds.forEach((id) => this.selectedPieceIds.delete(id));
          this.multiSelectToggleCandidate = null;
        }

        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}

        if (didMove) {
          const scaleFactor = this.getScaleFactor(this.currentScaleLevel);
          // Atualiza as posições finais consolidadas das peças movidas (e origins de escala se existirem)
          this.selectedPieceIds.forEach((id) => {
            const init = this.dragPieceInitialPositions.get(id);
            const p = this.pieces.find((x) => x.id === id);
            if (init && p) {
              p.x = Math.round(init.x + finalDx);
              p.y = Math.round(init.y + finalDy);
              const orig = this.scaleOrigins.get(id);
              if (orig && scaleFactor > 0) {
                orig.x = Math.round(orig.x + finalDx / scaleFactor);
                orig.y = Math.round(orig.y + finalDy / scaleFactor);
              }
            }
          });

          this.saveHistory();
          this.renderCanvas(true);
        }

        this.renderSelectionHighlights();
        this.renderSelectionDock();
      }

      if (this.longPressTriggered) {
        this.longPressTriggered = false;
      }
    };

    canvas.addEventListener('pointerup', onPointerEnd);
    canvas.addEventListener('pointercancel', onPointerEnd);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);

    // Zoom por scroll de mouse no desktop
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.12 : 0.88;
      this.zoomLevel = Math.max(0.5, Math.min(3.5, this.zoomLevel * delta));
      this.applyViewport();
    }, { passive: false });
  }

  private cancelLongPressTimer(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  // Converte coordenadas da tela para o espaço SVG real
  private screenToSvgCoordinates(clientX: number, clientY: number): { x: number; y: number } {
    if (this.isDragging && this.dragInverseCtm) {
      const inv = this.dragInverseCtm;
      return {
        x: Math.round(inv.a * clientX + inv.c * clientY + inv.e),
        y: Math.round(inv.b * clientX + inv.d * clientY + inv.f)
      };
    }
    if (!this.canvasSvgEl) return { x: 0, y: 0 };
    const ctm = this.canvasSvgEl.getScreenCTM();
    if (ctm) {
      const pt = this.canvasSvgEl.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const svgPt = pt.matrixTransform(ctm.inverse());
      return { x: Math.round(svgPt.x), y: Math.round(svgPt.y) };
    }
    return { x: clientX, y: clientY };
  }

  // ----------------------------------------------------------------------
  // RENDERIZAÇÃO DO CANVAS
  // ----------------------------------------------------------------------

  private renderCanvas(updateDimensions = true): void {
    if (!this.canvasSvgEl) return;

    // Cache da camada <defs> (apenas recria quando a paleta/acabamentos sofrem alteração)
    const paletteKey = JSON.stringify(this.palette);
    const defsEl = document.getElementById('bs-svg-defs');
    if (!defsEl || this.cachedDefsKey !== paletteKey) {
      const defs = generateStudioDefs(this.palette, 'bs-cv-');
      this.cachedDefsKey = paletteKey;
      if (defsEl) {
        defsEl.innerHTML = defs;
      }
    }

    const sortedPieces = sortPiecesByDepth(this.pieces);
    let piecesHtml = '';
    for (let i = 0; i < sortedPieces.length; i++) {
      piecesHtml += renderBalloonPieceSvg(sortedPieces[i], this.palette, 'bs-cv-');
    }

    // Se a estrutura de camadas já existe no DOM, atualiza apenas o conteúdo de balões sem destruir a árvore
    const balloonsLayer = document.getElementById('bs-balloons-layer');
    if (balloonsLayer && defsEl) {
      balloonsLayer.innerHTML = piecesHtml;
      this.renderStaticBackdrop();
    } else {
      const defs = generateStudioDefs(this.palette, 'bs-cv-');
      this.cachedDefsKey = paletteKey;
      this.canvasSvgEl.innerHTML = `
        <defs id="bs-svg-defs">${defs}</defs>
        <g id="bs-backdrop-sketch-layer"></g>
        <g id="bs-balloons-layer">${piecesHtml}</g>
        <g id="bs-highlight-layer"></g>
        <g id="bs-marquee-layer"></g>
      `;
      this.renderStaticBackdrop();
    }
    
    if (updateDimensions) {
      const stats = calculateArrangementStats(this.pieces, this.palette);
      const dimBadge = document.getElementById('bs-chip-dimension');
      if (dimBadge) dimBadge.textContent = `${stats.widthCm} × ${stats.heightCm} cm`;

      const countLabel = document.getElementById('bs-chip-count-label');
      if (countLabel) countLabel.textContent = `${stats.totalCount} balões`;

      const emptyState = document.getElementById('bs-canvas-empty-state');
      if (emptyState) emptyState.style.display = this.pieces.length === 0 ? 'flex' : 'none';
    }

    this.renderSelectionHighlights();
  }

  // Cenário de fundo estático em escala real (Guias configuráveis: Redondo, Romano, Cilindro, Livre + Pessoa 1,70 m)
  private renderStaticBackdrop(force = false): void {
    let layer: Element | null = document.getElementById('bs-backdrop-sketch-layer');
    if (!layer && this.canvasSvgEl) {
      layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      layer.id = 'bs-backdrop-sketch-layer';
      const balloonsLayer = document.getElementById('bs-balloons-layer');
      if (balloonsLayer) {
        this.canvasSvgEl.insertBefore(layer, balloonsLayer);
      } else {
        this.canvasSvgEl.appendChild(layer);
      }
    }
    if (!layer) return;

    // Se já estiver renderizado e não forçado, mantém estático (zero custo durante arrasto)
    if (!force && layer.children.length > 0) return;

    const floorY = 510;
    const panelCx = 185;
    const personHeight = 327; // 170cm / 0.52 ≈ 327px
    const personCx = 412;

    let structureSvg = '';

    if (this.backdropMode === 'redondo') {
      const panelRadius = 144; // Ø 1,50 m
      const panelTotalHeight = 365; // 1,90 m
      const panelTopY = floorY - panelTotalHeight; // 145
      const panelCy = panelTopY + panelRadius; // 289
      structureSvg = `
        <!-- Painel Redondo de Festa (Ø 1,50 m x 1,90 m) -->
        <g class="bs-ghost-panel">
          <line x1="${panelCx - 58}" y1="${panelCy + 75}" x2="${panelCx - 58}" y2="${floorY}" stroke="#8c857b" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="${panelCx + 58}" y1="${panelCy + 75}" x2="${panelCx + 58}" y2="${floorY}" stroke="#8c857b" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="${panelCx - 78}" y1="${floorY}" x2="${panelCx - 38}" y2="${floorY}" stroke="#78716c" stroke-width="3" stroke-linecap="round"/>
          <line x1="${panelCx + 38}" y1="${floorY}" x2="${panelCx + 78}" y2="${floorY}" stroke="#78716c" stroke-width="3" stroke-linecap="round"/>
          <line x1="${panelCx - 58}" y1="${floorY - 28}" x2="${panelCx + 58}" y2="${floorY - 28}" stroke="#a8a29e" stroke-width="1.4" stroke-dasharray="3 3"/>

          <circle cx="${panelCx}" cy="${panelCy}" r="${panelRadius}"
            fill="rgba(255, 255, 255, 0.45)" stroke="#8c857b" stroke-width="1.8" stroke-dasharray="6 4"/>
          <circle cx="${panelCx}" cy="${panelCy}" r="${panelRadius - 2.5}"
            fill="none" stroke="#d6d3d1" stroke-width="0.8" opacity="0.5"/>

          <g class="bs-ghost-dim-diameter">
            <line x1="${panelCx - Math.round(panelRadius * 0.76)}" y1="${panelCy + Math.round(panelRadius * 0.65)}"
                  x2="${panelCx + Math.round(panelRadius * 0.76)}" y2="${panelCy - Math.round(panelRadius * 0.65)}"
                  stroke="#a8a29e" stroke-width="1" stroke-dasharray="3 3"/>
            <polyline points="${panelCx - Math.round(panelRadius * 0.76) + 8} ${panelCy + Math.round(panelRadius * 0.65) - 2} ${panelCx - Math.round(panelRadius * 0.76)} ${panelCy + Math.round(panelRadius * 0.65)} ${panelCx - Math.round(panelRadius * 0.76) + 2} ${panelCy + Math.round(panelRadius * 0.65) - 8}"
              fill="none" stroke="#78716c" stroke-width="1.2"/>
            <polyline points="${panelCx + Math.round(panelRadius * 0.76) - 8} ${panelCy - Math.round(panelRadius * 0.65) + 2} ${panelCx + Math.round(panelRadius * 0.76)} ${panelCy - Math.round(panelRadius * 0.65)} ${panelCx + Math.round(panelRadius * 0.76) - 2} ${panelCy - Math.round(panelRadius * 0.65) + 8}"
              fill="none" stroke="#78716c" stroke-width="1.2"/>

            <rect x="${panelCx - 44}" y="${panelCy - 9.5}" width="88" height="22" rx="11" fill="rgba(28,25,23,0.06)"/>
            <rect x="${panelCx - 44}" y="${panelCy - 11}" width="88" height="22" rx="11" fill="#FFFFFF" stroke="#d6d3d1" stroke-width="1"/>
            <text x="${panelCx}" y="${panelCy + 4}" fill="#44403c" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">Ø 1,50 m</text>
          </g>

          <g class="bs-ghost-dim-panel-height">
            <line x1="${panelCx - panelRadius - 10}" y1="${panelTopY}" x2="${panelCx - panelRadius - 40}" y2="${panelTopY}" stroke="#a8a29e" stroke-width="0.9" stroke-dasharray="2 2"/>
            <line x1="${panelCx - 78}" y1="${floorY}" x2="${panelCx - panelRadius - 40}" y2="${floorY}" stroke="#a8a29e" stroke-width="0.9" stroke-dasharray="2 2"/>
            <line x1="${panelCx - panelRadius - 30}" y1="${panelTopY + 4}" x2="${panelCx - panelRadius - 30}" y2="${floorY - 4}" stroke="#78716c" stroke-width="1.2"/>
            <polyline points="${panelCx - panelRadius - 33.5} ${panelTopY + 7} ${panelCx - panelRadius - 30} ${panelTopY} ${panelCx - panelRadius - 26.5} ${panelTopY + 7}" fill="none" stroke="#78716c" stroke-width="1.2"/>
            <polyline points="${panelCx - panelRadius - 33.5} ${floorY - 7} ${panelCx - panelRadius - 30} ${floorY} ${panelCx - panelRadius - 26.5} ${floorY - 7}" fill="none" stroke="#78716c" stroke-width="1.2"/>

            <rect x="${panelCx - panelRadius - 52}" y="${panelTopY + 173.5}" width="44" height="20" rx="4" fill="rgba(28,25,23,0.06)"/>
            <rect x="${panelCx - panelRadius - 52}" y="${panelTopY + 172}" width="44" height="20" rx="4" fill="#FFFFFF" stroke="#d6d3d1" stroke-width="1"/>
            <text x="${panelCx - panelRadius - 30}" y="${panelTopY + 186}" fill="#57534e" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">1,90 m</text>
          </g>
        </g>
      `;
    } else if (this.backdropMode === 'romano') {
      // Painel Romano Clássico: 1,00 m largura (192px) × 2,00 m altura (385px)
      const w = 192;
      const halfW = w / 2; // 96
      const h = 385;
      const topY = floorY - h; // 125
      const archSpringY = topY + halfW; // 221
      const leftX = panelCx - halfW;
      const rightX = panelCx + halfW;
      const archPath = `M ${leftX} ${floorY} L ${leftX} ${archSpringY} A ${halfW} ${halfW} 0 0 1 ${rightX} ${archSpringY} L ${rightX} ${floorY} Z`;
      const dimLeftX = leftX - 30;
      structureSvg = `
        <!-- Painel Romano Clássico (1,00 m x 2,00 m) -->
        <g class="bs-ghost-panel">
          <path d="${archPath}" fill="rgba(255, 255, 255, 0.48)" stroke="#8c857b" stroke-width="1.8" stroke-dasharray="6 4"/>
          <line x1="${leftX - 10}" y1="${floorY}" x2="${rightX + 10}" y2="${floorY}" stroke="#78716c" stroke-width="3" stroke-linecap="round"/>

          <!-- Cota largura 1,00 m -->
          <line x1="${leftX + 10}" y1="${archSpringY + 70}" x2="${rightX - 10}" y2="${archSpringY + 70}" stroke="#a8a29e" stroke-width="1" stroke-dasharray="3 3"/>
          <rect x="${panelCx - 44}" y="${archSpringY + 59}" width="88" height="22" rx="11" fill="#FFFFFF" stroke="#d6d3d1" stroke-width="1"/>
          <text x="${panelCx}" y="${archSpringY + 74}" fill="#44403c" font-size="10.5" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">1,00 × 2,00 m</text>

          <!-- Cota altura 2,00 m -->
          <line x1="${leftX - 8}" y1="${topY}" x2="${dimLeftX - 8}" y2="${topY}" stroke="#a8a29e" stroke-width="0.9" stroke-dasharray="2 2"/>
          <line x1="${leftX - 8}" y1="${floorY}" x2="${dimLeftX - 8}" y2="${floorY}" stroke="#a8a29e" stroke-width="0.9" stroke-dasharray="2 2"/>
          <line x1="${dimLeftX}" y1="${topY + 4}" x2="${dimLeftX}" y2="${floorY - 4}" stroke="#78716c" stroke-width="1.2"/>
          <polyline points="${dimLeftX - 3.5} ${topY + 7} ${dimLeftX} ${topY} ${dimLeftX + 3.5} ${topY + 7}" fill="none" stroke="#78716c" stroke-width="1.2"/>
          <polyline points="${dimLeftX - 3.5} ${floorY - 7} ${dimLeftX} ${floorY} ${dimLeftX + 3.5} ${floorY - 7}" fill="none" stroke="#78716c" stroke-width="1.2"/>
          <rect x="${dimLeftX - 22}" y="${topY + 182}" width="44" height="20" rx="4" fill="#FFFFFF" stroke="#d6d3d1" stroke-width="1"/>
          <text x="${dimLeftX}" y="${topY + 196}" fill="#57534e" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">2,00 m</text>
        </g>
      `;
    } else if (this.backdropMode === 'cilindro') {
      // Trio de Mesas Cilindro de Festa (G: 50×80cm, M: 44×65cm, P: 38×50cm)
      const gW = 96, gH = 154, gX = panelCx - 48, gTop = floorY - gH;
      const mW = 84, mH = 125, mX = panelCx - 118, mTop = floorY - mH;
      const pW = 73, pH = 96, pX = panelCx + 36, pTop = floorY - pH;
      structureSvg = `
        <!-- Trio de Mesas Cilindro de Festa -->
        <g class="bs-ghost-panel">
          <!-- Cilindro Médio (esquerda) -->
          <rect x="${mX}" y="${mTop}" width="${mW}" height="${mH}" rx="4" fill="rgba(255,255,255,0.42)" stroke="#a8a29e" stroke-width="1.5" stroke-dasharray="5 3"/>
          <ellipse cx="${mX + mW / 2}" cy="${mTop}" rx="${mW / 2}" ry="7" fill="rgba(255,255,255,0.65)" stroke="#a8a29e" stroke-width="1.3"/>

          <!-- Cilindro Pequeno (direita) -->
          <rect x="${pX}" y="${pTop}" width="${pW}" height="${pH}" rx="4" fill="rgba(255,255,255,0.42)" stroke="#a8a29e" stroke-width="1.5" stroke-dasharray="5 3"/>
          <ellipse cx="${pX + pW / 2}" cy="${pTop}" rx="${pW / 2}" ry="6" fill="rgba(255,255,255,0.65)" stroke="#a8a29e" stroke-width="1.3"/>

          <!-- Cilindro Grande (centro) -->
          <rect x="${gX}" y="${gTop}" width="${gW}" height="${gH}" rx="4" fill="rgba(255,255,255,0.58)" stroke="#8c857b" stroke-width="1.8" stroke-dasharray="6 4"/>
          <ellipse cx="${gX + gW / 2}" cy="${gTop}" rx="${gW / 2}" ry="8" fill="rgba(255,255,255,0.8)" stroke="#8c857b" stroke-width="1.5"/>

          <!-- Etiqueta de escala -->
          <rect x="${panelCx - 48}" y="${gTop + 64}" width="96" height="22" rx="11" fill="#FFFFFF" stroke="#d6d3d1" stroke-width="1"/>
          <text x="${panelCx}" y="${gTop + 79}" fill="#44403c" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">Cilindros · 80 cm</text>
        </g>
      `;
    }

    const floorSvg = this.backdropMode === 'livre'
      ? `
        <g class="bs-ghost-floor">
          <line x1="-80" y1="${floorY}" x2="520" y2="${floorY}" stroke="#d6d3d1" stroke-width="1.2" stroke-dasharray="5 5"/>
        </g>
      `
      : `
        <g class="bs-ghost-floor">
          <line x1="-80" y1="${floorY}" x2="520" y2="${floorY}" stroke="#8c857b" stroke-width="1.6" stroke-linecap="round"/>
          ${Array.from({ length: 24 }).map((_, i) => {
            const x = -70 + i * 25;
            return `<line x1="${x}" y1="${floorY}" x2="${x - 8}" y2="${floorY + 6}" stroke="#a8a29e" stroke-width="1" opacity="0.6"/>`;
          }).join('')}
          <rect x="-44" y="${floorY - 18}" width="38" height="15" rx="3" fill="#FAF8F5" stroke="#d6d3d1" stroke-width="0.8"/>
          <text x="-25" y="${floorY - 7}" fill="#8c857b" font-size="8.5" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" letter-spacing="0.5">PISO</text>
        </g>
      `;

    layer.innerHTML = `
      ${floorSvg}
      ${structureSvg}
      ${this.showPersonRef ? this.buildPersonSilhouetteSvg(personCx, floorY, personHeight) : ''}
    `;
  }

  // Gera o SVG do contorno elegante da pessoa com cota de altura (1,70 m)
  private buildPersonSilhouetteSvg(cx: number, floorY: number, heightPx: number): string {
    const topY = floorY - heightPx; // 510 - 327 = 183
    const headH = Math.round(heightPx * 0.125); // ~41px
    const headW = Math.round(headH * 0.72); // ~29px
    const headCy = topY + headH / 2; // ~203.5

    const shoulderY = topY + Math.round(heightPx * 0.16); // ~235
    const shoulderHalfW = Math.round(heightPx * 0.085); // ~28px
    const waistY = topY + Math.round(heightPx * 0.38); // ~307
    const waistHalfW = Math.round(heightPx * 0.055); // ~18px
    const hipY = topY + Math.round(heightPx * 0.50); // ~346
    const hipHalfW = Math.round(heightPx * 0.075); // ~25px
    const kneeY = topY + Math.round(heightPx * 0.73); // ~422
    const ankleY = floorY - Math.round(heightPx * 0.04); // ~497

    const bodyPath = `
      M ${cx - 5} ${topY + headH}
      C ${cx - 7} ${shoulderY - 5}, ${cx - shoulderHalfW + 4} ${shoulderY - 2}, ${cx - shoulderHalfW} ${shoulderY + 6}
      C ${cx - shoulderHalfW - 3} ${shoulderY + 25}, ${cx - waistHalfW - 6} ${waistY - 10}, ${cx - waistHalfW} ${waistY}
      C ${cx - waistHalfW + 2} ${waistY + 15}, ${cx - hipHalfW - 2} ${hipY - 10}, ${cx - hipHalfW} ${hipY}
      C ${cx - hipHalfW + 1} ${hipY + 30}, ${cx - 15} ${kneeY}, ${cx - 11} ${ankleY}
      L ${cx - 16} ${floorY}
      L ${cx - 4} ${floorY}
      L ${cx - 3} ${ankleY}
      C ${cx - 2} ${kneeY + 15}, ${cx - 2} ${hipY + 35}, ${cx} ${hipY + 18}
      C ${cx + 2} ${hipY + 35}, ${cx + 2} ${kneeY + 15}, ${cx + 3} ${ankleY}
      L ${cx + 4} ${floorY}
      L ${cx + 16} ${floorY}
      L ${cx + 11} ${ankleY}
      C ${cx + 15} ${kneeY}, ${cx + hipHalfW - 1} ${hipY + 30}, ${cx + hipHalfW} ${hipY}
      C ${cx + hipHalfW + 2} ${hipY - 10}, ${cx + waistHalfW - 2} ${waistY + 15}, ${cx + waistHalfW} ${waistY}
      C ${cx + waistHalfW + 6} ${waistY - 10}, ${cx + shoulderHalfW + 3} ${shoulderY + 25}, ${cx + shoulderHalfW} ${shoulderY + 6}
      C ${cx + shoulderHalfW - 4} ${shoulderY - 2}, ${cx + 7} ${shoulderY - 5}, ${cx + 5} ${topY + headH}
      Z
    `.replace(/\s+/g, ' ').trim();

    const dimX = cx + 42;

    return `
      <g class="bs-ghost-person">
        <!-- Cabeça -->
        <ellipse cx="${cx}" cy="${headCy}" rx="${Math.round(headW / 2)}" ry="${Math.round(headH / 2)}"
          fill="rgba(255, 255, 255, 0.45)" stroke="#8c857b" stroke-width="1.6"/>
        <!-- Silhueta anatômica proporcional -->
        <path d="${bodyPath}"
          fill="rgba(255, 255, 255, 0.45)" stroke="#8c857b" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>

        <!-- Cota de Altura (1,70 m) dedicada e sem interferência no painel -->
        <g class="bs-ghost-dim-person">
          <line x1="${cx + 20}" y1="${topY}" x2="${dimX + 6}" y2="${topY}" stroke="#a8a29e" stroke-width="0.9" stroke-dasharray="2 2"/>
          <line x1="${cx + 20}" y1="${floorY}" x2="${dimX + 6}" y2="${floorY}" stroke="#a8a29e" stroke-width="0.9" stroke-dasharray="2 2"/>
          <line x1="${dimX}" y1="${topY + 4}" x2="${dimX}" y2="${floorY - 4}" stroke="#78716c" stroke-width="1.2"/>
          <polyline points="${dimX - 3.5} ${topY + 7} ${dimX} ${topY} ${dimX + 3.5} ${topY + 7}" fill="none" stroke="#78716c" stroke-width="1.2"/>
          <polyline points="${dimX - 3.5} ${floorY - 7} ${dimX} ${floorY} ${dimX + 3.5} ${floorY - 7}" fill="none" stroke="#78716c" stroke-width="1.2"/>
          <!-- Etiqueta com 1,70 m -->
          <rect x="${dimX - 22}" y="${topY + 154.5}" width="44" height="20" rx="4" fill="rgba(28,25,23,0.06)"/>
          <rect x="${dimX - 22}" y="${topY + 153}" width="44" height="20" rx="4" fill="#FFFFFF" stroke="#d6d3d1" stroke-width="1"/>
          <text x="${dimX}" y="${topY + 167}" fill="#57534e" font-size="10" font-weight="700" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">1,70 m</text>
        </g>
      </g>
    `;
  }

  private renderSelectionHighlights(): void {
    const layer = document.getElementById('bs-highlight-layer');
    if (!layer) return;

    if (this.selectedPieceIds.size === 0) {
      layer.innerHTML = '';
      return;
    }

    let h = '';
    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) {
        const r = (BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28) + 3;
        if (p.shape === 'star') {
          const starPath = generateStarPath(p.x, p.y, r + 2);
          h += `<path d="${starPath}" fill="none" stroke="#B58938" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.95"/>`;
        } else {
          h += `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="none" stroke="#B58938" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.95"/>`;
        }
      }
    });
    layer.innerHTML = h;
  }

  // ----------------------------------------------------------------------
  // BARRA CONTEXTUAL INFERIOR DE SELEÇÃO & SELEÇÃO MÚLTIPLA INTELIGENTE
  // ----------------------------------------------------------------------

  private getActiveSelectedPiece(): BalloonPiece | undefined {
    if (this.selectedPieceIds.size === 0) return undefined;
    const firstId = Array.from(this.selectedPieceIds)[0];
    return this.pieces.find((p) => p.id === firstId);
  }

  private enterMultiSelectMode(): void {
    this.isMultiSelectMode = true;
    this.isMarqueeMode = false;
    this.selectionSubpanel = null;
    if (this.isBottomDrawerOpen) this.closeBottomDrawer();
    const container = document.getElementById('bs-canvas-container');
    if (container) container.classList.add('tool-multiselect');
    this.renderSelectionHighlights();
    this.renderSelectionDock();
    this.showToast('Toque nos balões para somar à seleção');
  }

  private exitMultiSelectMode(clearSelection = true): void {
    this.cancelLongPressTimer();
    this.isMultiSelectMode = false;
    this.isMarqueeMode = false;
    this.selectionSubpanel = null;
    this.multiSelectToggleCandidate = null;
    if (clearSelection) {
      this.selectedPieceIds.clear();
    }
    const container = document.getElementById('bs-canvas-container');
    if (container) {
      container.classList.remove('tool-multiselect');
      container.classList.remove('tool-marquee');
    }
    const marqueeLayer = document.getElementById('bs-marquee-layer');
    if (marqueeLayer) marqueeLayer.innerHTML = '';
    this.renderSelectionHighlights();
    this.renderSelectionDock();
  }

  private toggleMarqueeMode(): void {
    if (!this.isMultiSelectMode) this.isMultiSelectMode = true;
    this.isMarqueeMode = !this.isMarqueeMode;
    this.selectionSubpanel = null;
    const container = document.getElementById('bs-canvas-container');
    if (container) container.classList.toggle('tool-marquee', this.isMarqueeMode);
    this.renderSelectionDock();
    if (this.isMarqueeMode) {
      this.showToast('Arraste no fundo para circular os balões');
    }
  }

  private selectSameColor(): void {
    if (this.selectedPieceIds.size === 0) return;
    const targetSlots = new Set<BalloonSlot>();
    this.pieces.forEach((p) => {
      if (this.selectedPieceIds.has(p.id)) targetSlots.add(p.slot);
    });
    this.pieces.forEach((p) => {
      if (targetSlots.has(p.slot)) this.selectedPieceIds.add(p.id);
    });
    this.isMultiSelectMode = true;
    this.renderSelectionHighlights();
    this.renderSelectionDock();
  }

  private selectSameSize(): void {
    if (this.selectedPieceIds.size === 0) return;
    const targetSizes = new Set<BalloonSizeInches>();
    this.pieces.forEach((p) => {
      if (this.selectedPieceIds.has(p.id)) targetSizes.add(p.sizeInches);
    });
    this.pieces.forEach((p) => {
      if (targetSizes.has(p.sizeInches)) this.selectedPieceIds.add(p.id);
    });
    this.isMultiSelectMode = true;
    this.renderSelectionHighlights();
    this.renderSelectionDock();
  }

  private selectAllPieces(): void {
    this.selectedPieceIds.clear();
    this.pieces.forEach((p) => this.selectedPieceIds.add(p.id));
    this.isMultiSelectMode = true;
    this.renderSelectionHighlights();
    this.renderSelectionDock();
  }

  private getEffectivePieceZ(p: BalloonPiece): number {
    if (p.shape === 'star') return 100 + (p.z ?? 0);
    if (p.z !== undefined) return p.z;
    if (p.sizeInches === 5) return 45;
    if (p.sizeInches >= 18) return -15;
    return 10;
  }

  private bringSelectedForward(): void {
    if (this.selectedPieceIds.size === 0) return;
    const selected = this.pieces.filter((p) => this.selectedPieceIds.has(p.id));
    const unselected = this.pieces.filter((p) => !this.selectedPieceIds.has(p.id));

    let minDelta = Infinity;
    for (const sp of selected) {
      const spZ = this.getEffectivePieceZ(sp);
      const rp = BALLOON_SIZE_RADIUS_MAP[sp.sizeInches] || 28;
      for (const up of unselected) {
        const ru = BALLOON_SIZE_RADIUS_MAP[up.sizeInches] || 28;
        if (Math.hypot(sp.x - up.x, sp.y - up.y) < rp + ru + 6) {
          const upZ = this.getEffectivePieceZ(up);
          if (upZ >= spZ) {
            const needed = (upZ - spZ) + 4;
            if (needed < minDelta) minDelta = needed;
          }
        }
      }
    }

    const delta = minDelta === Infinity ? 8 : Math.max(4, minDelta);
    for (const sp of selected) {
      const curZ = this.getEffectivePieceZ(sp);
      const nextEff = Math.min(sp.shape === 'star' ? 160 : 95, curZ + delta);
      sp.z = sp.shape === 'star' ? nextEff - 100 : nextEff;
    }

    this.saveHistory();
    this.renderCanvas(false);
    this.renderSelectionDock();
  }

  private sendSelectedBackward(): void {
    if (this.selectedPieceIds.size === 0) return;
    const selected = this.pieces.filter((p) => this.selectedPieceIds.has(p.id));
    const unselected = this.pieces.filter((p) => !this.selectedPieceIds.has(p.id));

    let minDelta = Infinity;
    for (const sp of selected) {
      const spZ = this.getEffectivePieceZ(sp);
      const rp = BALLOON_SIZE_RADIUS_MAP[sp.sizeInches] || 28;
      for (const up of unselected) {
        const ru = BALLOON_SIZE_RADIUS_MAP[up.sizeInches] || 28;
        if (Math.hypot(sp.x - up.x, sp.y - up.y) < rp + ru + 6) {
          const upZ = this.getEffectivePieceZ(up);
          if (upZ <= spZ) {
            const needed = (spZ - upZ) + 4;
            if (needed < minDelta) minDelta = needed;
          }
        }
      }
    }

    const delta = minDelta === Infinity ? 8 : Math.max(4, minDelta);
    for (const sp of selected) {
      const curZ = this.getEffectivePieceZ(sp);
      const nextEff = Math.max(-60, curZ - delta);
      sp.z = sp.shape === 'star' ? nextEff - 100 : nextEff;
    }

    this.saveHistory();
    this.renderCanvas(false);
    this.renderSelectionDock();
  }

  private renderSelectionDock(): void {
    const selDock = document.getElementById('bs-selection-dock');
    const tabsDock = document.getElementById('bs-tabs-dock');
    const subpanelEl = document.getElementById('bs-selection-subpanel');
    const topRowEl = document.getElementById('bs-selection-top-row');
    const actionsRowEl = document.getElementById('bs-selection-actions-row');
    if (!selDock || !tabsDock || !subpanelEl || !topRowEl || !actionsRowEl) return;

    // Remove IDs que possam ter sido apagados via Undo/Redo
    if (this.selectedPieceIds.size > 0) {
      const validIds = new Set(this.pieces.map((p) => p.id));
      for (const id of Array.from(this.selectedPieceIds)) {
        if (!validIds.has(id)) this.selectedPieceIds.delete(id);
      }
    }

    const count = this.selectedPieceIds.size;
    const isActive = count > 0 || this.isMultiSelectMode;

    if (!isActive) {
      this.selectionSubpanel = null;
      selDock.style.display = 'none';
      tabsDock.style.display = 'flex';
      return;
    }

    // Esconde dock principal das 3 abas enquanto barra contextual de seleção está ativa
    tabsDock.style.display = 'none';
    selDock.style.display = 'flex';

    const selectedPieces = this.pieces.filter((p) => this.selectedPieceIds.has(p.id));
    const isGroup = this.isGroupSelected();
    const firstPiece = selectedPieces[0];
    const allSameSlot = selectedPieces.length > 0 && selectedPieces.every((p) => p.slot === firstPiece.slot);
    const allSameSize = selectedPieces.length > 0 && selectedPieces.every((p) => p.sizeInches === firstPiece.sizeInches && p.shape === firstPiece.shape);
    const allStars = selectedPieces.length > 0 && selectedPieces.every((p) => p.shape === 'star');

    // 1. Subpainel inline (1 toque para trocar Cor ou Tamanho sem sair do polegar)
    if (count > 0 && this.selectionSubpanel === 'color') {
      const allSlots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
      const activeSlots = allSlots.slice(0, this.activeColorCount);
      subpanelEl.style.display = 'flex';
      subpanelEl.innerHTML = `
        <div class="bs-sel-sub-scroll">
          ${activeSlots.map((s) => {
            const hex = (this.palette as any)[s] || '#d4af37';
            const hasCover = Boolean(this.palette.covers && this.palette.covers[s]);
            const coverUrl = this.palette.covers?.[s];
            const name = hasCover
              ? (this.palette.coverNames?.[s] || `Capa ${s}`)
              : (this.palette.names?.[s] || getFriendlyColorName(hex));
            const isSel = allSameSlot && firstPiece?.slot === s;
            const dotStyle = hasCover
              ? `background-image:url('${coverUrl}');background-size:cover;background-position:center;`
              : `background:${hex};`;
            return `
              <button type="button" class="bs-sel-color-chip ${isSel ? 'active' : ''}" data-sel-slot="${s}">
                <span class="bs-sel-color-dot" style="${dotStyle}"></span>
                <span>${name}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    } else if (count > 0 && this.selectionSubpanel === 'size') {
      const sizes: BalloonSizeInches[] = [5, 7, 9, 10, 12, 16, 18, 24, 36];
      subpanelEl.style.display = 'flex';
      subpanelEl.innerHTML = allStars
        ? `<div class="bs-sel-sub-hint">Estrela Metalizada tem tamanho fixo de 18"</div>`
        : `
          <div class="bs-sel-sub-scroll">
            ${sizes.map((sz) => {
              const isSel = allSameSize && firstPiece?.sizeInches === sz;
              return `<button type="button" class="bs-sel-size-chip ${isSel ? 'active' : ''}" data-sel-size="${sz}">${sz}"</button>`;
            }).join('')}
          </div>
        `;
    } else {
      subpanelEl.style.display = 'none';
      subpanelEl.innerHTML = '';
    }

    // 2. Faixa Superior Contextual (Resumo + "+ Vários" OU chips inteligentes de Seleção Múltipla)
    if (this.isMultiSelectMode) {
      topRowEl.innerHTML = `
        <div class="bs-sel-chips-scroll">
          <span class="bs-sel-count-pill">${count} sel.</span>
          <button type="button" class="bs-sel-smart-chip" data-sel-cmd="same-color" ${count === 0 ? 'disabled' : ''}>Mesma cor</button>
          <button type="button" class="bs-sel-smart-chip" data-sel-cmd="same-size" ${count === 0 ? 'disabled' : ''}>Mesmo tam.</button>
          <button type="button" class="bs-sel-smart-chip ${this.isMarqueeMode ? 'active' : ''}" data-sel-cmd="toggle-marquee" title="Arraste no fundo para selecionar em caixa">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 3"></rect></svg>
            <span>${this.isMarqueeMode ? 'Caixa ✓' : 'Caixa'}</span>
          </button>
          <button type="button" class="bs-sel-smart-chip" data-sel-cmd="select-all">Tudo</button>
        </div>
        <button type="button" class="bs-sel-done-btn" data-sel-cmd="exit-multi">Concluir</button>
      `;
    } else {
      const slotHex = firstPiece ? ((this.palette as any)[firstPiece.slot] || '#c97a8e') : '#d4af37';
      const slotName = firstPiece
        ? (this.palette.names?.[firstPiece.slot as 'A' | 'B' | 'C' | 'D' | 'E'] || getFriendlyColorName(slotHex))
        : '';
      const summaryLabel = count > 1
        ? (isGroup ? `Grupo · ${count} balões` : `${count} balões selecionados`)
        : `${firstPiece?.shape === 'star' ? 'Estrela 18"' : `${firstPiece?.sizeInches}"`} · ${slotName}`;

      topRowEl.innerHTML = `
        <div class="bs-sel-single-info">
          <span class="bs-sel-info-dot" style="background:${count > 1 && !allSameSlot ? 'conic-gradient(#c97a8e,#d4af37,#f7dbe1,#c97a8e)' : slotHex}"></span>
          <span class="bs-sel-info-text">${summaryLabel}</span>
        </div>
        <div class="bs-sel-single-right">
          <button type="button" class="bs-sel-multi-trigger" data-sel-cmd="enter-multi" title="Selecionar vários balões">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="3" y="3" width="12" height="12" rx="2" stroke-dasharray="2.5 1.5"></rect><path d="M8 21h11a2 2 0 0 0 2-2V8"></path></svg>
            <span>+ Vários</span>
          </button>
          <button type="button" class="bs-sel-close-btn" data-sel-cmd="clear" title="Fechar seleção" aria-label="Fechar seleção">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;
    }

    // 3. Faixa Principal de Ações (alvos táteis confortáveis na zona do polegar)
    const disabledAttr = count === 0 ? 'disabled' : '';
    const dotBg = count > 0 && allSameSlot && firstPiece
      ? ((this.palette as any)[firstPiece.slot] || '#c97a8e')
      : 'conic-gradient(#c97a8e, #d4af37, #7dd3fc, #c97a8e)';
    const sizeBadgeText = count > 0 && allSameSize && firstPiece
      ? (firstPiece.shape === 'star' ? '18"' : `${firstPiece.sizeInches}"`)
      : 'Tam.';

    const showGroupBtn = count > 1 || (count === 1 && Boolean(firstPiece?.groupId));
    const ungroupMode = isGroup || (count === 1 && Boolean(firstPiece?.groupId));

    actionsRowEl.innerHTML = `
      <button type="button" class="bs-sel-act-btn ${this.selectionSubpanel === 'color' ? 'active' : ''}" data-sel-act="color" ${disabledAttr}>
        <span class="bs-sel-act-swatch" style="background:${dotBg}"></span>
        <span>Cor</span>
      </button>
      <button type="button" class="bs-sel-act-btn ${this.selectionSubpanel === 'size' ? 'active' : ''}" data-sel-act="size" ${disabledAttr}>
        <span class="bs-sel-act-size-pill">${sizeBadgeText}</span>
        <span>Tamanho</span>
      </button>
      <button type="button" class="bs-sel-act-btn" data-sel-act="bring-front" title="Trazer para frente" ${disabledAttr}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" fill="currentColor" fill-opacity="0.14"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path></svg>
        <span>Frente</span>
      </button>
      <button type="button" class="bs-sel-act-btn" data-sel-act="send-back" title="Enviar para trás" ${disabledAttr}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="12" height="12" rx="2"></rect><path d="M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2"></path></svg>
        <span>Trás</span>
      </button>
      ${showGroupBtn ? `
        <button type="button" class="bs-sel-act-btn" data-sel-act="group" ${disabledAttr}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            ${ungroupMode
              ? '<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><line x1="10" y1="14" x2="14" y2="10" stroke-dasharray="2 2"></line>'
              : '<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><path d="M10 6.5h4a2 2 0 0 1 2 2v4M14 17.5h-4a2 2 0 0 1-2-2v-4"></path>'}
          </svg>
          <span>${ungroupMode ? 'Separar' : 'Agrupar'}</span>
        </button>
      ` : ''}
      <button type="button" class="bs-sel-act-btn" data-sel-act="duplicate" ${disabledAttr}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Duplicar</span>
      </button>
      <button type="button" class="bs-sel-act-btn bs-sel-act-danger" data-sel-act="delete" ${disabledAttr}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        <span>Excluir</span>
      </button>
    `;
  }

  private showBalloonPill(): void {
    this.renderSelectionDock();
  }

  private hideBalloonPill(): void {
    this.renderSelectionDock();
  }

  private updateBalloonPillPosition(): void {
    // Barra contextual fixa na base (zona do polegar) — sem reposicionamento flutuante sobre o arranjo
  }

  private syncPaletteSwatches(): void {
    if (this.selectedPieceIds.size > 0 || this.isMultiSelectMode) {
      this.renderSelectionDock();
    }
  }

  // ----------------------------------------------------------------------
  // GAVETA DE CORES / CAPAS DE TECIDO
  // ----------------------------------------------------------------------

  private async openColorSheet(slot: BalloonSlot): Promise<void> {
    this.editingColorSlot = slot;
    const titleEl = document.getElementById('bs-color-sheet-title');
    const hex = (this.palette as any)[slot] || '#c97a8e';
    const currentName = this.palette.names?.[slot as 'A' | 'B' | 'C' | 'D' | 'E'] || getFriendlyColorName(hex);
    if (titleEl) titleEl.textContent = `Editar Família ${slot} (${currentName})`;

    const currentFin = this.palette.finishes?.[slot as 'A' | 'B' | 'C' | 'D' | 'E'] || 'satin';
    this.overlayEl?.querySelectorAll('.bs-finish-btn-chip').forEach((c) => {
      c.classList.toggle('active', (c as HTMLElement).dataset.finish === currentFin);
    });

    const customInput = document.getElementById('bs-custom-color-input') as HTMLInputElement | null;
    if (customInput) customInput.value = (this.palette as any)[slot] || '#c97a8e';

    // Se a família já tiver capa aplicada, abre direto na aba de Capa
    const hasCover = Boolean(this.palette.covers && this.palette.covers[slot]);
    this.switchColorSheetSubtab(hasCover ? 'covers' : 'colors');
    await this.renderCoverPickerInSheet();

    this.toggleSheet('bs-color-sheet', true);
  }

  private switchColorSheetSubtab(subtab: 'colors' | 'covers'): void {
    this.colorSheetSubtab = subtab;
    const btnColor = document.getElementById('bs-sheet-subtab-color');
    const btnCover = document.getElementById('bs-sheet-subtab-cover');
    const panelColor = document.getElementById('bs-sheet-panel-colors');
    const panelCover = document.getElementById('bs-sheet-panel-covers');

    if (btnColor) btnColor.classList.toggle('active', subtab === 'colors');
    if (btnCover) btnCover.classList.toggle('active', subtab === 'covers');
    if (panelColor) panelColor.style.display = subtab === 'colors' ? 'block' : 'none';
    if (panelCover) panelCover.style.display = subtab === 'covers' ? 'block' : 'none';
  }

  private async renderCoverPickerInSheet(): Promise<void> {
    const slot = this.editingColorSlot;
    const activeCoverUrl = this.palette.covers?.[slot];
    const activeCoverName = this.palette.coverNames?.[slot] || 'Capa Personalizada';

    const statusCard = document.getElementById('bs-active-cover-status');
    const statusThumb = document.getElementById('bs-active-cover-thumb');
    const statusName = document.getElementById('bs-active-cover-name');

    if (activeCoverUrl) {
      if (statusCard) statusCard.style.display = 'flex';
      if (statusThumb) statusThumb.style.backgroundImage = `url('${activeCoverUrl}')`;
      if (statusName) statusName.textContent = activeCoverName;
    } else {
      if (statusCard) statusCard.style.display = 'none';
    }

    if (this.cachedCovers.length === 0) {
      try {
        this.cachedCovers = await getAllCovers();
      } catch (err) {
        console.warn('Erro ao carregar capas:', err);
      }
    }

    const grid = document.getElementById('bs-sheet-covers-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div id="bs-card-upload-cover" class="bs-cover-tile bs-cover-tile-upload">
        <div class="bs-cover-tile-thumb" style="display:flex;align-items:center;justify-content:center;background:transparent;border:none">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
        <span class="bs-cover-tile-name">Nova da Galeria</span>
        <input type="file" id="bs-input-cover-upload" accept="image/*" style="display:none">
      </div>
    ` + this.cachedCovers.map((cover) => {
      const isSelected = activeCoverUrl === cover.imageUrl;
      return `
        <div class="bs-cover-tile ${isSelected ? 'active' : ''}" data-cover-url="${cover.imageUrl}" data-cover-name="${cover.name}">
          <div class="bs-cover-tile-thumb" style="background-image:url('${cover.imageUrl}')"></div>
          <span class="bs-cover-tile-name">${cover.name}</span>
        </div>
      `;
    }).join('');

    // Vincula upload de arquivo
    const uploadBtn = document.getElementById('bs-card-upload-cover');
    const uploadInput = document.getElementById('bs-input-cover-upload') as HTMLInputElement | null;
    uploadBtn?.addEventListener('click', () => uploadInput?.click());
    uploadInput?.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const optimizedUrl = await optimizeUserUploadedImage(file, 1400);
        const newCover = await addCustomCover({
          themeName: 'Minhas Estampas',
          name: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: optimizedUrl,
          targetType: 'all'
        });
        this.cachedCovers.unshift(newCover);
        this.applyCoverToSlot(this.editingColorSlot, newCover.imageUrl, newCover.name);
      } catch (err) {
        console.error('Falha ao importar capa:', err);
      }
      if (uploadInput) uploadInput.value = '';
    });

    // Vincula seleção de capas existentes
    grid.querySelectorAll('.bs-cover-tile[data-cover-url]').forEach((tile) => {
      tile.addEventListener('click', (e) => {
        const el = e.currentTarget as HTMLElement;
        const url = el.dataset.coverUrl;
        const name = el.dataset.coverName || 'Capa';
        if (url) {
          this.applyCoverToSlot(this.editingColorSlot, url, name);
          this.toggleSheet('bs-color-sheet', false);
        }
      });
    });
  }

  private applyCoverToSlot(slot: BalloonSlot, coverUrl: string, name: string): void {
    if (!this.palette.covers) this.palette.covers = {};
    if (!this.palette.coverNames) this.palette.coverNames = {};
    this.palette.covers[slot] = coverUrl;
    this.palette.coverNames[slot] = name;

    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
    this.renderCoverPickerInSheet();
    this.renderTabActivePanel();
  }

  private removeCoverFromSlot(slot: BalloonSlot): void {
    if (this.palette.covers) delete this.palette.covers[slot];
    if (this.palette.coverNames) delete this.palette.coverNames[slot];

    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
    this.renderCoverPickerInSheet();
  }

  private updateSlotColorAndName(slot: BalloonSlot, hex: string, name: string): void {
    (this.palette as any)[slot] = hex;
    if (!this.palette.names) this.palette.names = { A: '', B: '', C: '', D: '', E: '' };
    this.palette.names[slot as 'A' | 'B' | 'C' | 'D' | 'E'] = name || getFriendlyColorName(hex);

    // Se tinha capa associada, desativa para usar a cor selecionada
    if (this.palette.covers && this.palette.covers[slot]) {
      delete this.palette.covers[slot];
      if (this.palette.coverNames) delete this.palette.coverNames[slot];
    }

    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
    this.renderTabActivePanel();
    this.showBalloonPill();
  }

  private updateSlotFinish(slot: BalloonSlot, finish: BalloonFinish): void {
    if (!this.palette.finishes) this.palette.finishes = { A: 'satin', B: 'satin', C: 'chrome', D: 'matte', E: 'satin' };
    this.palette.finishes[slot as 'A' | 'B' | 'C' | 'D' | 'E'] = finish;

    this.pieces.forEach((p) => {
      if (p.slot === slot) p.finish = finish;
    });

    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
    if (this.isBottomDrawerOpen) {
      this.renderTabActivePanel();
    }
  }

  // ----------------------------------------------------------------------
  // DOCK DE 3 ABAS COM TOGGLE: CORES | INCLUIR | ARRANJO
  // ----------------------------------------------------------------------

  public toggleBottomTab(tab: 'cores' | 'incluir' | 'arranjo'): void {
    if (this.isBottomDrawerOpen && this.activeBottomTab === tab) {
      this.closeBottomDrawer();
    } else {
      this.openBottomDrawer(tab);
    }
  }

  public closeAllSheets(): void {
    const sheets = ['bs-color-sheet', 'bs-append-model-sheet', 'bs-shopping-modal', 'bs-conclude-modal'];
    sheets.forEach((id) => this.toggleSheet(id, false));
  }

  public closeBottomDrawer(): void {
    this.isBottomDrawerOpen = false;
    this.overlayEl?.querySelectorAll('.bs-dock-tab').forEach((b) => b.classList.remove('active'));
    const panel = document.getElementById('bs-tab-active-panel');
    if (panel) {
      panel.style.display = 'none';
      panel.innerHTML = '';
    }

    // Ao fechar a gaveta, volta para o modo padrão de interação
    if (this.activeTouchTool !== 'adjust') {
      this.setActiveTouchTool('adjust');
    }
  }

  public openBottomDrawer(tab: 'cores' | 'incluir' | 'arranjo'): void {
    this.isBottomDrawerOpen = true;
    this.activeBottomTab = tab;
    this.overlayEl?.querySelectorAll('.bs-dock-tab').forEach((b) => {
      const btn = b as HTMLElement;
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const panel = document.getElementById('bs-tab-active-panel');
    if (panel) panel.style.display = 'block';

    this.renderTabActivePanel();
  }

  private setBottomTab(tab: 'cores' | 'incluir' | 'arranjo'): void {
    this.openBottomDrawer(tab);
  }

  private renderTabActivePanel(): void {
    const panel = document.getElementById('bs-tab-active-panel');
    if (!panel || !this.isBottomDrawerOpen) return;

    // ABA 1: CORES
    if (this.activeBottomTab === 'cores') {
      const allSlots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
      const activeSlots = allSlots.slice(0, this.activeColorCount);

      const slotRoles: Record<'A' | 'B' | 'C' | 'D' | 'E', string> = {
        A: 'Cor Principal',
        B: 'Secundária',
        C: 'Destaque',
        D: 'Base / Neutro',
        E: 'Detalhe Suave'
      };

      const finishLabels: Record<BalloonFinish, string> = {
        satin: 'Acetinado',
        matte: 'Fosco',
        chrome: 'Cromado',
        crystal: 'Cristal',
        glitter: 'Glitter'
      };

      panel.innerHTML = `
        <div class="bs-panel-cores">
          <!-- Topo: Título da seção + Seletor de Quantidade de Cores -->
          <div class="bs-cores-header-row">
            <span class="bs-cores-main-title">Cores do Arranjo</span>
            <div class="bs-color-count-chips" id="bs-color-count-selector">
              <button class="bs-count-chip ${this.activeColorCount === 2 ? 'active' : ''}" data-color-count="2" title="2 Cores">2</button>
              <button class="bs-count-chip ${this.activeColorCount === 3 ? 'active' : ''}" data-color-count="3" title="3 Cores">3</button>
              <button class="bs-count-chip ${this.activeColorCount === 4 ? 'active' : ''}" data-color-count="4" title="4 Cores">4</button>
              <button class="bs-count-chip ${this.activeColorCount === 5 ? 'active' : ''}" data-color-count="5" title="5 Cores">5</button>
            </div>
          </div>

          <!-- Lista de Cores do Arranjo -->
          <div class="bs-color-slots-list">
            ${activeSlots.map((s) => {
              const hex = (this.palette as any)[s] || (s === 'E' ? '#f8fafc' : '#d4af37');
              const hasCover = Boolean(this.palette.covers && this.palette.covers[s]);
              const coverUrl = this.palette.covers?.[s];
              const name = hasCover
                ? (this.palette.coverNames?.[s] || `Capa ${s}`)
                : (this.palette.names?.[s] || getFriendlyColorName(hex));
              const fin = this.palette.finishes?.[s] || 'satin';
              const badgeText = hasCover ? 'Capa / Estampa' : finishLabels[fin];
              const roleText = slotRoles[s];

              const ballStyle = hasCover
                ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center; border: 2px solid #d4af37; box-shadow: 0 2px 6px rgba(0,0,0,0.15);`
                : `background: radial-gradient(circle at 35% 32%, #FFFFFF 0%, ${hex} 55%, ${adjustColorBrightness(hex, -0.3)} 100%); border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.18);`;

              return `
                <div class="bs-color-slot-row bs-color-family-card ${this.activeColorSlot === s ? 'active' : ''}" data-slot="${s}" title="Editar ${roleText}">
                  <div class="bs-color-swatch-ball" style="${ballStyle}"></div>
                  <div class="bs-color-slot-details">
                    <div class="bs-color-slot-title-line">
                      <strong class="bs-color-slot-name">${name}</strong>
                      <span class="bs-color-slot-badge">${badgeText}</span>
                    </div>
                    <span class="bs-color-slot-role">${roleText}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="bs-color-slot-arrow"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Paletas Prontas da Festa -->
          <div class="bs-label-row" style="margin-top:4px">
            <span>Paletas da Festa:</span>
            <em>Harmonias prontas em 1 toque</em>
          </div>
          <div class="bs-palettes-hscroll">
            ${STUDIO_PALETTE_PRESETS.map((p) => `
              <div class="bs-preset-card ${p.id === this.palette.name ? 'active' : ''}" data-preset-id="${p.id}">
                <div class="bs-preset-dots">
                  <i style="background:${p.palette.A}"></i>
                  <i style="background:${p.palette.B}"></i>
                  <i style="background:${p.palette.C}"></i>
                  <i style="background:${p.palette.D}"></i>
                  ${p.palette.E ? `<i style="background:${p.palette.E}"></i>` : ''}
                </div>
                <span>${p.name}</span>
              </div>
            `).join('')}
          </div>

          <!-- Modo de Distribuição -->
          <div class="bs-label-row" style="margin-top:4px">
            <span>Modo de Distribuição:</span>
          </div>
          <div class="bs-segmented-control">
            <button class="bs-seg-btn ${this.currentDistributionMode === 'mesclado' ? 'active' : ''}" data-mode="mesclado">Mesclado</button>
            <button class="bs-seg-btn ${this.currentDistributionMode === 'degrade' ? 'active' : ''}" data-mode="degrade">Degradê</button>
            <button class="bs-seg-btn ${this.currentDistributionMode === 'blocos' ? 'active' : ''}" data-mode="blocos">Blocos</button>
          </div>
        </div>
      `;

      panel.querySelectorAll('.bs-color-family-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          const slot = (e.currentTarget as HTMLElement).dataset.slot as BalloonSlot;
          if (slot) {
            this.activeColorSlot = slot;
            this.openColorSheet(slot);
          }
        });
      });

      panel.querySelectorAll('#bs-color-count-selector .bs-count-chip').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const count = Number((e.currentTarget as HTMLElement).dataset.colorCount);
          if (count >= 2 && count <= 5) {
            this.setActiveColorCount(count);
          }
        });
      });

      panel.querySelectorAll('.bs-preset-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          const id = (e.currentTarget as HTMLElement).dataset.presetId;
          const preset = STUDIO_PALETTE_PRESETS.find((p) => p.id === id);
          if (preset) this.applyPalettePreset(preset.palette);
        });
      });

      panel.querySelectorAll('.bs-seg-btn[data-mode]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const mode = (e.currentTarget as HTMLElement).dataset.mode as any;
          if (mode) this.setDistributionMode(mode);
        });
      });
      return;
    }

    // ABA 2: INCLUIR (PEÇAS + CLUSTERS + SOMAR OUTRO MODELO)
    if (this.activeBottomTab === 'incluir') {
      panel.innerHTML = `
        <div class="bs-panel-incluir">
          <div class="bs-label-row">
            <span>Toque na peça para adicionar ao cenário:</span>
          </div>
          <div class="bs-elements-catalog-grid">
            <div class="bs-element-card" data-tool="balloon-5" data-type="balloon-5">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-balloon bs-size-5"></div></div>
              <strong class="bs-elem-title">5"</strong>
            </div>
            <div class="bs-element-card" data-tool="balloon-7" data-type="balloon-7">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-balloon bs-size-7"></div></div>
              <strong class="bs-elem-title">7"</strong>
            </div>
            <div class="bs-element-card" data-tool="balloon-9" data-type="balloon-9">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-balloon bs-size-9"></div></div>
              <strong class="bs-elem-title">9"</strong>
            </div>
            <div class="bs-element-card" data-tool="balloon-10" data-type="balloon-10">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-balloon bs-size-10"></div></div>
              <strong class="bs-elem-title">10"</strong>
            </div>
            <div class="bs-element-card" data-tool="balloon-12" data-type="balloon-12">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-balloon bs-size-12"></div></div>
              <strong class="bs-elem-title">12"</strong>
            </div>
            <div class="bs-element-card" data-tool="balloon-16" data-type="balloon-16">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-balloon bs-size-16"></div></div>
              <strong class="bs-elem-title">16"</strong>
            </div>
            <div class="bs-element-card" data-tool="balloon-18" data-type="balloon-18">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-balloon bs-size-18"></div></div>
              <strong class="bs-elem-title">18"</strong>
            </div>
            <div class="bs-element-card" data-tool="balloon-24" data-type="balloon-24">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-balloon bs-size-24"></div></div>
              <strong class="bs-elem-title">24"</strong>
            </div>
            <div class="bs-element-card" data-tool="balloon-36" data-type="balloon-36">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-balloon bs-size-36"></div></div>
              <strong class="bs-elem-title">36"</strong>
            </div>
            <div class="bs-element-card" data-tool="balloon-star" data-type="balloon-star">
              <div class="bs-elem-thumb-box">
                <svg class="bs-elem-thumb-star-svg" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M12 2l2.8 6.4 6.9.6-5.2 4.6 1.6 6.8-6.1-3.6-6.1 3.6 1.6-6.8-5.2-4.6 6.9-.6z" fill="#D4AF37" stroke="#9A7229" stroke-width="0.8"/>
                </svg>
              </div>
              <strong class="bs-elem-title">Estrela 18"</strong>
            </div>
            <div class="bs-element-card" data-tool="cluster-quad" data-type="cluster-quad">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-cluster"><i></i><i></i><i></i><i></i></div></div>
              <strong class="bs-elem-title">Cluster 4x</strong>
            </div>
            <div class="bs-element-card" data-tool="cluster-trio" data-type="cluster-trio">
              <div class="bs-elem-thumb-box"><div class="bs-elem-thumb-trio"><i></i><i></i><i></i></div></div>
              <strong class="bs-elem-title">Tufo 3x</strong>
            </div>
          </div>

          <button type="button" id="bs-btn-incluir-append-model" class="bs-incluir-append-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><line x1="17.5" y1="14" x2="17.5" y2="21"></line><line x1="14" y1="17.5" x2="21" y2="17.5"></line></svg>
            <span>Somar outro modelo ao arranjo</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="bs-incluir-append-arrow"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;

      panel.querySelectorAll('.bs-element-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          const el = e.currentTarget as HTMLElement;
          const type = el.dataset.type as any;
          if (type) {
            this.insertPieceAtCenter(type);
          }
        });
      });

      document.getElementById('bs-btn-incluir-append-model')?.addEventListener('click', () => {
        this.openModelSheet('append');
      });
      return;
    }

    // ABA 3: ARRANJO (ESTRUTURA, ESCALA REAL, CENÁRIO DE REFERÊNCIA E LISTA DE COMPRAS)
    if (this.activeBottomTab === 'arranjo') {
      const stats = calculateArrangementStats(this.pieces, this.palette);
      const scaleLabels: Record<'compacto' | 'padrao' | 'grande', string> = {
        compacto: '85% · Compacto',
        padrao: '100% · Padrão',
        grande: '115% · Grande'
      };

      panel.innerHTML = `
        <div class="bs-panel-arranjo">
          <!-- 1. Estrutura & Modelo -->
          <div class="bs-arranjo-section">
            <div class="bs-label-row">
              <span>Estrutura & Modelo:</span>
            </div>
            <div class="bs-arranjo-actions-grid">
              <button type="button" id="bs-btn-arranjo-mirror" class="bs-arranjo-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="2.5 2.5"></line>
                  <path d="M8 7 2 12l6 5V7z" fill="currentColor" fill-opacity="0.18"></path>
                  <path d="M16 7l6 5-6 5V7z" fill="currentColor" fill-opacity="0.78"></path>
                </svg>
                <span>Inverter Lado</span>
              </button>
              <button type="button" id="bs-btn-arranjo-replace-model" class="bs-arranjo-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
                <span>Trocar Modelo</span>
              </button>
            </div>
          </div>

          <!-- 2. Escala Real do Arranjo -->
          <div class="bs-arranjo-section">
            <div class="bs-label-row">
              <span>Escala Real do Arranjo:</span>
              <em>${scaleLabels[this.currentScaleLevel]} · ${stats.widthCm}×${stats.heightCm} cm</em>
            </div>
            <div class="bs-segmented-control">
              <button type="button" class="bs-seg-btn ${this.currentScaleLevel === 'compacto' ? 'active' : ''}" data-scale="compacto">85% Menor</button>
              <button type="button" class="bs-seg-btn ${this.currentScaleLevel === 'padrao' ? 'active' : ''}" data-scale="padrao">100% Padrão</button>
              <button type="button" class="bs-seg-btn ${this.currentScaleLevel === 'grande' ? 'active' : ''}" data-scale="grande">115% Maior</button>
            </div>
          </div>

          <!-- 3. Cenário de Referência (Guia de Fundo) -->
          <div class="bs-arranjo-section">
            <div class="bs-label-row">
              <span>Guia de Fundo (Escala Real):</span>
            </div>
            <div class="bs-backdrop-chips-grid">
              <button type="button" class="bs-backdrop-chip ${this.backdropMode === 'redondo' ? 'active' : ''}" data-backdrop="redondo">Redondo Ø1,5m</button>
              <button type="button" class="bs-backdrop-chip ${this.backdropMode === 'romano' ? 'active' : ''}" data-backdrop="romano">Romano 1×2m</button>
              <button type="button" class="bs-backdrop-chip ${this.backdropMode === 'cilindro' ? 'active' : ''}" data-backdrop="cilindro">Cilindros</button>
              <button type="button" class="bs-backdrop-chip ${this.backdropMode === 'livre' ? 'active' : ''}" data-backdrop="livre">Livre</button>
            </div>
            <button type="button" id="bs-btn-toggle-person-ref" class="bs-person-toggle-row ${this.showPersonRef ? 'active' : ''}">
              <span class="bs-person-toggle-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"></circle><path d="M9 20v-6l-1.5-4.5A2 2 0 0 1 9.4 7h5.2a2 2 0 0 1 1.9 2.5L15 14v6"></path></svg>
                <span>Referência de Pessoa (1,70 m)</span>
              </span>
              <span class="bs-switch-pill"><span class="bs-switch-knob"></span></span>
            </button>
          </div>

          <!-- 4. Lista de Balões & Compras -->
          <button type="button" id="bs-btn-arranjo-shopping" class="bs-arranjo-shopping-cta">
            <span class="bs-arranjo-shopping-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1"></rect><line x1="9" y1="12" x2="15" y2="12"></line><line x1="9" y1="16" x2="13" y2="16"></line></svg>
              <span>Lista de Balões & Compras</span>
            </span>
            <span class="bs-arranjo-shopping-count">${stats.totalCount} un. ›</span>
          </button>
        </div>
      `;

      document.getElementById('bs-btn-arranjo-mirror')?.addEventListener('click', () => {
        this.mirrorArrangement();
      });

      document.getElementById('bs-btn-arranjo-replace-model')?.addEventListener('click', () => {
        this.openModelSheet('replace');
      });

      panel.querySelectorAll('.bs-seg-btn[data-scale]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const scale = (e.currentTarget as HTMLElement).dataset.scale as 'compacto' | 'padrao' | 'grande';
          if (scale) this.setArrangementScale(scale);
        });
      });

      panel.querySelectorAll('.bs-backdrop-chip[data-backdrop]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const mode = (e.currentTarget as HTMLElement).dataset.backdrop as 'redondo' | 'romano' | 'cilindro' | 'livre';
          if (mode) this.setBackdropMode(mode);
        });
      });

      document.getElementById('bs-btn-toggle-person-ref')?.addEventListener('click', () => {
        this.showPersonRef = !this.showPersonRef;
        this.renderStaticBackdrop(true);
        this.renderTabActivePanel();
      });

      document.getElementById('bs-btn-arranjo-shopping')?.addEventListener('click', () => {
        this.openShoppingModal();
      });
    }
  }

  // ----------------------------------------------------------------------
  // AÇÕES DO ARRANJO: INVERTER, TROCAR MODELO, ESCALA REAL, GUIA DE FUNDO
  // ----------------------------------------------------------------------

  private openModelSheet(mode: 'append' | 'replace'): void {
    this.modelSheetMode = mode;
    const titleEl = document.getElementById('bs-append-sheet-title');
    const subEl = document.getElementById('bs-append-sheet-subtitle');
    if (mode === 'replace') {
      if (titleEl) titleEl.textContent = 'Trocar Modelo Base';
      if (subEl) subEl.textContent = 'Escolha outro formato mantendo sua paleta de cores atual:';
    } else {
      if (titleEl) titleEl.textContent = 'Somar Outro Modelo';
      if (subEl) subEl.textContent = 'Escolha um modelo para somar ao arranjo atual:';
    }
    this.toggleSheet('bs-append-model-sheet', true);
  }

  private replaceModelKeepingPalette(templateId: string): void {
    const tmpl = BALLOON_STUDIO_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    this.selectedTemplateId = tmpl.id;
    if (!this.hasCustomName) {
      this.arrangementTitle = tmpl.name;
      const titleEl = document.getElementById('bs-editor-current-title');
      if (titleEl) titleEl.textContent = this.arrangementTitle;
    }

    const freshPieces: BalloonPiece[] = JSON.parse(JSON.stringify(tmpl.pieces)).map((p: any) => ({
      ...p,
      source: 'model' as const
    }));

    // Mantém integralmente a paleta, acabamentos, número de cores e modo de distribuição do usuário
    this.pieces = distributeColors(freshPieces, this.currentDistributionMode, this.activeColorCount, this.palette);
    this.baseTemplatePieces = JSON.parse(JSON.stringify(this.pieces));
    this.currentScaleLevel = 'padrao';
    this.scaleOrigins.clear();
    this.exitMultiSelectMode(true);

    this.toggleSheet('bs-append-model-sheet', false);
    this.saveHistory();
    this.computeBaseViewBox();
    this.renderCanvas();
    if (this.isBottomDrawerOpen) this.renderTabActivePanel();
    this.showToast(`Modelo trocado para ${tmpl.name}`);
  }

  private getScaleFactor(level: 'compacto' | 'padrao' | 'grande'): number {
    if (level === 'compacto') return 0.85;
    if (level === 'grande') return 1.15;
    return 1.0;
  }

  private closestCommercialSize(targetRadius: number): BalloonSizeInches {
    const commercialSizes: BalloonSizeInches[] = [5, 7, 9, 10, 12, 16, 18, 24, 36];
    let best: BalloonSizeInches = 12;
    let bestDiff = Infinity;
    for (const sz of commercialSizes) {
      const r = BALLOON_SIZE_RADIUS_MAP[sz] || 28;
      const diff = Math.abs(r - targetRadius);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = sz;
      }
    }
    return best;
  }

  private setArrangementScale(level: 'compacto' | 'padrao' | 'grande'): void {
    if (this.pieces.length === 0 || level === this.currentScaleLevel) return;

    const prevFactor = this.getScaleFactor(this.currentScaleLevel);
    const nextFactor = this.getScaleFactor(level);

    // Garante que cada peça atual tenha sua origem em 100% registrada de forma não-destrutiva
    let currentMinX = Infinity;
    let currentMaxX = -Infinity;
    let currentMaxY = -Infinity;
    for (const p of this.pieces) {
      const r = BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28;
      if (p.x - r < currentMinX) currentMinX = p.x - r;
      if (p.x + r > currentMaxX) currentMaxX = p.x + r;
      if (p.y + r > currentMaxY) currentMaxY = p.y + r;
    }
    const curAnchorX = (currentMinX + currentMaxX) / 2;
    const curAnchorY = currentMaxY;

    for (const p of this.pieces) {
      if (!this.scaleOrigins.has(p.id)) {
        const invX = prevFactor !== 1 ? curAnchorX + (p.x - curAnchorX) / prevFactor : p.x;
        const invY = prevFactor !== 1 ? curAnchorY + (p.y - curAnchorY) / prevFactor : p.y;
        this.scaleOrigins.set(p.id, {
          x: Math.round(invX),
          y: Math.round(invY),
          sizeInches: p.sizeInches
        });
      }
    }

    // Calcula âncora estável (centro horizontal + base no chão) a partir das origens 100%
    let origMinX = Infinity;
    let origMaxX = -Infinity;
    let origMaxY = -Infinity;
    for (const p of this.pieces) {
      const orig = this.scaleOrigins.get(p.id);
      if (!orig) continue;
      const r = BALLOON_SIZE_RADIUS_MAP[orig.sizeInches] || 28;
      if (orig.x - r < origMinX) origMinX = orig.x - r;
      if (orig.x + r > origMaxX) origMaxX = orig.x + r;
      if (orig.y + r > origMaxY) origMaxY = orig.y + r;
    }
    const anchorX = (origMinX + origMaxX) / 2;
    const anchorY = origMaxY;

    for (const p of this.pieces) {
      const orig = this.scaleOrigins.get(p.id);
      if (!orig) continue;
      p.x = Math.round(anchorX + (orig.x - anchorX) * nextFactor);
      p.y = Math.round(anchorY + (orig.y - anchorY) * nextFactor);
      if (p.shape !== 'star') {
        const origR = BALLOON_SIZE_RADIUS_MAP[orig.sizeInches] || 28;
        p.sizeInches = nextFactor === 1 ? orig.sizeInches : this.closestCommercialSize(origR * nextFactor);
      }
    }

    this.currentScaleLevel = level;
    this.saveHistory();
    this.renderCanvas(true);
    if (this.isBottomDrawerOpen) this.renderTabActivePanel();
  }

  private setBackdropMode(mode: 'redondo' | 'romano' | 'cilindro' | 'livre'): void {
    this.backdropMode = mode;
    this.renderStaticBackdrop(true);
    if (this.isBottomDrawerOpen) this.renderTabActivePanel();
  }

  private mirrorArrangement(): void {
    if (this.pieces.length === 0) return;
    this.pieces = mirrorArrangementHorizontal(this.pieces);
    this.baseTemplatePieces = mirrorArrangementHorizontal(this.baseTemplatePieces);
    this.scaleOrigins.clear();
    this.currentScaleLevel = 'padrao';
    this.saveHistory();
    this.renderCanvas();
    if (this.isBottomDrawerOpen) this.renderTabActivePanel();
  }

  private setDistributionMode(mode: 'mesclado' | 'degrade' | 'blocos'): void {
    this.currentDistributionMode = mode;
    this.pieces = distributeColors(this.pieces, mode, this.activeColorCount, this.palette);
    this.saveHistory();
    this.renderCanvas();
    this.renderTabActivePanel();
  }

  // Adiciona um modelo como novo arranjo na cena (sem substituir o existente)
  private appendModelTemplate(templateId: string): void {
    const tmpl = BALLOON_STUDIO_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    let maxX = -Infinity;
    for (const p of this.pieces) {
      const r = BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28;
      if (p.x + r > maxX) maxX = p.x + r;
    }

    let offsetX = 70;
    if (this.pieces.length > 0 && maxX !== -Infinity) {
      let tMinX = Infinity;
      for (const p of tmpl.pieces) {
        if (p.x < tMinX) tMinX = p.x;
      }
      offsetX = Math.round(maxX - tMinX + 45);
    }

    const baseId = Date.now();
    const newPieces: BalloonPiece[] = tmpl.pieces.map((p, idx) => ({
      ...JSON.parse(JSON.stringify(p)),
      id: `app-${baseId}-${idx}`,
      x: p.x + offsetX,
      y: p.y,
      source: 'model' as const
    }));

    const coloredNewPieces = distributeColors(newPieces, this.currentDistributionMode, this.activeColorCount, this.palette);
    this.pieces.push(...coloredNewPieces);
    this.baseTemplatePieces.push(...coloredNewPieces);

    this.toggleSheet('bs-append-model-sheet', false);
    this.saveHistory();
    this.computeBaseViewBox();
    this.renderCanvas();
    if (this.isBottomDrawerOpen) this.renderTabActivePanel();
    this.showToast(`${tmpl.name} somado ao arranjo`);
  }

  private setActiveTouchTool(tool: 'adjust' | 'multi-select' | 'pan' | 'eraser' | 'balloon-5' | 'balloon-7' | 'balloon-9' | 'balloon-10' | 'balloon-12' | 'balloon-16' | 'balloon-18' | 'balloon-24' | 'balloon-36' | 'balloon-star' | 'cluster-quad' | 'cluster-trio' | 'base-balloon' | 'light-point' | 'big-balloon'): void {
    this.activeTouchTool = tool;

    // Limpa ponteiros órfãos para evitar travamento de toque
    this.activePointers.clear();
    this.isPanning = false;
    this.isDragging = false;
    this.isPinching = false;
    this.multiSelectToggleCandidate = null;

    const container = document.getElementById('bs-canvas-container');
    if (container) {
      container.classList.toggle('tool-pan', tool === 'pan');
      container.classList.toggle('tool-eraser', tool === 'eraser');
      container.classList.remove('is-panning');
    }

    if (tool === 'multi-select') {
      this.enterMultiSelectMode();
    }
  }

  // Navegação Segura no Mobile (Interceptação do Botão Voltar)
  public handleBackNavigation(): boolean {
    const openSheets = ['bs-color-sheet', 'bs-append-model-sheet', 'bs-shopping-modal', 'bs-conclude-modal'];
    for (const sheetId of openSheets) {
      const el = document.getElementById(sheetId);
      if (el && el.style.display === 'flex') {
        this.toggleSheet(sheetId, false);
        return true;
      }
    }

    if (this.isMultiSelectMode || this.selectedPieceIds.size > 0) {
      this.exitMultiSelectMode(true);
      return true;
    }

    if (this.isBottomDrawerOpen) {
      this.closeBottomDrawer();
      return true;
    }

    if (this.currentScreen === 'editor') {
      this.setScreen('gallery');
      return true;
    }

    this.close();
    this.onExitCallback?.();
    return false;
  }

  // Define a quantidade de cores no arranjo (2 a 5 cores)
  public setActiveColorCount(count: number): void {
    this.activeColorCount = Math.max(2, Math.min(5, count));
    if (!this.palette.E) {
      this.palette.E = '#ffffff';
    }
    if (!this.palette.names) {
      this.palette.names = { A: 'Rosa Quartzo', B: 'Blush Suave', C: 'Ouro Cromo', D: 'Branco Neve', E: 'Pérola' };
    }
    if (!this.palette.names.E) this.palette.names.E = 'Pérola';
    if (!this.palette.finishes) {
      this.palette.finishes = { A: 'satin', B: 'satin', C: 'chrome', D: 'matte', E: 'satin' };
    }
    if (!this.palette.finishes.E) this.palette.finishes.E = 'satin';

    this.palette.colorCount = this.activeColorCount;

    this.pieces = distributeColors(this.pieces, this.currentDistributionMode, this.activeColorCount, this.palette);
    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
    this.renderTabActivePanel();
  }

  // Inserção no centro do canvas (usada pela aba Incluir)
  private insertPieceAtCenter(type: string): void {
    const cx = Math.round(this.baseViewBox.x + this.baseViewBox.width / 2 + this.panOffset.x);
    const cy = Math.round(this.baseViewBox.y + this.baseViewBox.height / 2 + this.panOffset.y);

    // Fecha a gaveta para exibir imediatamente a peça inserida com a barra contextual de edição
    this.closeBottomDrawer();

    if (type === 'cluster-quad') {
      this.insertClusterQuadAt(cx, cy);
    } else if (type === 'cluster-trio') {
      this.insertClusterTrioAt(cx, cy);
    } else if (type === 'balloon-star') {
      this.insertSingleBalloonAt(cx, cy, 18, 'star');
    } else {
      const sizeMap: Record<string, BalloonSizeInches> = {
        'balloon-5': 5,
        'balloon-7': 7,
        'balloon-9': 9,
        'balloon-10': 10,
        'balloon-12': 12,
        'balloon-16': 16,
        'balloon-18': 18,
        'balloon-24': 24,
        'balloon-36': 36
      };
      const size = sizeMap[type] || 12;
      this.insertSingleBalloonAt(cx, cy, size, 'round');
    }
  }

  // Inserção de balão individual
  private insertSingleBalloonAt(x: number, y: number, sizeInches: BalloonSizeInches, shape: BalloonShape = 'round'): void {
    const slot = this.activeColorSlot;
    const finish = this.palette.finishes?.[slot as 'A' | 'B' | 'C' | 'D' | 'E'] || (shape === 'star' ? 'satin' : (sizeInches === 5 ? 'chrome' : 'satin'));
    const newPiece: BalloonPiece = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x: Math.round(x),
      y: Math.round(y),
      sizeInches,
      shape,
      slot,
      finish,
      z: sizeInches === 5 ? 48 : 22,
      source: 'user'
    };
    this.pieces.push(newPiece);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(newPiece.id);

    this.saveHistory();
    this.renderCanvas();
    this.renderSelectionDock();
    this.setActiveTouchTool('adjust');
  }

  // Inserção de cluster quad realista (4 balões de 10" com volume 3D)
  private insertClusterQuadAt(x: number, y: number): void {
    const r = 19;
    const baseId = Date.now();
    const activeSlots: BalloonSlot[] = (['A', 'B', 'C', 'D', 'E'] as const).slice(0, this.activeColorCount);
    const quadGroupId = `grp-c-${baseId}`;
    const getFin = (s: BalloonSlot): BalloonFinish => this.palette.finishes?.[s] || 'satin';
    const s0 = activeSlots[0] || 'A';
    const s1 = activeSlots[1] || s0;
    const s2 = activeSlots[2] || s0;
    const s3 = activeSlots[3] || s1;
    const clusterPieces: BalloonPiece[] = [
      { id: `c-${baseId}-1`, x: Math.round(x - r), y: Math.round(y - r * 0.85), sizeInches: 10, slot: s0, finish: getFin(s0), z: 6, groupId: quadGroupId, source: 'user' },
      { id: `c-${baseId}-2`, x: Math.round(x + r), y: Math.round(y - r * 0.85), sizeInches: 10, slot: s1, finish: getFin(s1), z: 12, groupId: quadGroupId, source: 'user' },
      { id: `c-${baseId}-3`, x: Math.round(x - r * 0.9), y: Math.round(y + r * 0.95), sizeInches: 10, slot: s2, finish: getFin(s2), z: 18, groupId: quadGroupId, source: 'user' },
      { id: `c-${baseId}-4`, x: Math.round(x + r * 0.9), y: Math.round(y + r * 0.95), sizeInches: 10, slot: s3, finish: getFin(s3), z: 24, groupId: quadGroupId, source: 'user' },
    ];
    this.pieces.push(...clusterPieces);
    this.selectedPieceIds.clear();
    clusterPieces.forEach((p) => this.selectedPieceIds.add(p.id));
    this.saveHistory();
    this.renderCanvas();
    this.renderSelectionDock();
    this.setActiveTouchTool('adjust');
  }

  // Inserção de tufo trio realista (roseta monocromática de 3 balões 5" na frente)
  private insertClusterTrioAt(x: number, y: number): void {
    const r = 12;
    const baseId = Date.now();
    const slot = this.activeColorSlot || 'A';
    const fin = this.palette.finishes?.[slot] || 'satin';
    const trioGroupId = `grp-t-${baseId}`;
    const trioPieces: BalloonPiece[] = [
      { id: `t-${baseId}-1`, x: Math.round(x), y: Math.round(y - r * 0.82), sizeInches: 5, slot, finish: fin, z: 46, groupId: trioGroupId, source: 'user' },
      { id: `t-${baseId}-2`, x: Math.round(x - r * 0.85), y: Math.round(y + r * 0.62), sizeInches: 5, slot, finish: fin, z: 48, groupId: trioGroupId, source: 'user' },
      { id: `t-${baseId}-3`, x: Math.round(x + r * 0.85), y: Math.round(y + r * 0.62), sizeInches: 5, slot, finish: fin, z: 50, groupId: trioGroupId, source: 'user' },
    ];
    this.pieces.push(...trioPieces);
    this.selectedPieceIds.clear();
    trioPieces.forEach((p) => this.selectedPieceIds.add(p.id));
    this.saveHistory();
    this.renderCanvas();
    this.renderSelectionDock();
    this.setActiveTouchTool('adjust');
  }

  private insertBaseBalloonAt(x: number, y: number): void {
    this.insertSingleBalloonAt(x, y, 12);
  }

  private insertClusterAt(x: number, y: number): void {
    this.insertClusterQuadAt(x, y);
  }

  private deletePieceById(id: string): void {
    this.pieces = this.pieces.filter((p) => p.id !== id);
    this.selectedPieceIds.delete(id);
    this.scaleOrigins.delete(id);
    this.saveHistory();
    this.renderCanvas();
    this.renderSelectionDock();
  }

  private setSelectedPieceSlot(slot: BalloonSlot): void {
    const finish = this.palette.finishes?.[slot] || 'satin';
    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) {
        p.slot = slot;
        p.finish = finish;
      }
    });
    this.saveHistory();
    this.renderCanvas();
    this.renderSelectionDock();
  }

  // ----------------------------------------------------------------------
  // AGRUPAMENTO E DESAGRUPAMENTO DE BALÕES (VINCULAÇÃO ESTILO CANVA)
  // ----------------------------------------------------------------------

  public isGroupSelected(): boolean {
    const selected = this.pieces.filter((p) => this.selectedPieceIds.has(p.id));
    if (selected.length < 2) return false;
    const firstGroup = selected[0].groupId;
    if (!firstGroup) return false;
    return selected.every((p) => p.groupId === firstGroup);
  }

  public groupSelectedPieces(): void {
    if (this.selectedPieceIds.size < 2) return;
    const newGroupId = `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.pieces.forEach((p) => {
      if (this.selectedPieceIds.has(p.id)) {
        p.groupId = newGroupId;
      }
    });
    this.saveHistory();
    this.renderCanvas();
    this.renderSelectionDock();
  }

  public ungroupSelectedPieces(): void {
    this.pieces.forEach((p) => {
      if (this.selectedPieceIds.has(p.id)) {
        delete p.groupId;
      }
    });
    this.saveHistory();
    this.renderCanvas();
    this.renderSelectionDock();
  }

  public toggleGroupSelected(): void {
    if (this.isGroupSelected() || (this.selectedPieceIds.size === 1 && this.getActiveSelectedPiece()?.groupId)) {
      this.ungroupSelectedPieces();
    } else {
      this.groupSelectedPieces();
    }
  }

  private setSelectedPieceSize(size: BalloonSizeInches): void {
    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p && p.shape !== 'star') {
        p.sizeInches = size;
        const orig = this.scaleOrigins.get(id);
        if (orig) orig.sizeInches = size;
      }
    });
    this.saveHistory();
    this.renderCanvas();
    this.renderSelectionDock();
  }

  private duplicateSelected(): void {
    if (this.selectedPieceIds.size === 0) return;
    const newItems: BalloonPiece[] = [];
    const newIds = new Set<string>();
    const groupMap = new Map<string, string>();

    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) {
        let newGrp = p.groupId;
        if (p.groupId) {
          if (!groupMap.has(p.groupId)) {
            groupMap.set(p.groupId, `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
          }
          newGrp = groupMap.get(p.groupId);
        }
        const cloned: BalloonPiece = {
          ...JSON.parse(JSON.stringify(p)),
          id: `dup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          x: p.x + 16,
          y: p.y + 16,
          groupId: newGrp,
          source: 'user'
        };
        newItems.push(cloned);
        newIds.add(cloned.id);
      }
    });

    this.pieces.push(...newItems);
    this.selectedPieceIds = newIds;
    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
  }

  private deleteSelected(): void {
    if (this.selectedPieceIds.size === 0) return;
    this.selectedPieceIds.forEach((id) => this.scaleOrigins.delete(id));
    this.pieces = this.pieces.filter((p) => !this.selectedPieceIds.has(p.id));
    this.exitMultiSelectMode(true);

    this.saveHistory();
    this.renderCanvas();
  }
  // ----------------------------------------------------------------------
  // COMEÇAR DO ZERO & CARREGAR TEMPLATES
  // ----------------------------------------------------------------------

  private startFromScratch(): void {
    this.closeBottomDrawer();
    this.closeAllSheets();
    this.arrangementTitle = 'Novo Arranjo';
    this.hasCustomName = false;
    const el = document.getElementById('bs-editor-current-title');
    if (el) el.textContent = this.arrangementTitle;

    this.palette = {
      A: '#c97a8e',
      B: '#f7dbe1',
      C: '#d4af37',
      D: '#ffffff',
      E: '#fdfbf7',
      names: {
        A: 'Rosa Quartzo',
        B: 'Blush Suave',
        C: 'Ouro Nobre',
        D: 'Branco Neve',
        E: 'Pérola'
      },
      finishes: { A: 'satin', B: 'satin', C: 'chrome', D: 'matte', E: 'satin' }
    };
    this.activeColorCount = 4;

    // Inicia com um cluster base de apoio
    this.pieces = [
      { id: 'c1', x: 230, y: 230, sizeInches: 18, slot: 'A', finish: 'satin', source: 'user' },
      { id: 'c2', x: 260, y: 220, sizeInches: 12, slot: 'B', finish: 'satin', source: 'user' },
      { id: 'c3', x: 240, y: 250, sizeInches: 12, slot: 'C', finish: 'chrome', source: 'user' },
      { id: 'c4', x: 270, y: 250, sizeInches: 10, slot: 'D', finish: 'matte', source: 'user' },
      { id: 'c5', x: 252, y: 236, sizeInches: 5, slot: 'C', finish: 'chrome', source: 'user' }
    ];
    this.baseTemplatePieces = JSON.parse(JSON.stringify(this.pieces));
    this.currentScaleLevel = 'padrao';
    this.scaleOrigins.clear();
    this.exitMultiSelectMode(true);
    this.history = [];
    this.historyIndex = -1;
    this.currentVolumeLevel = 'padrao';
    this.hasConfirmedVariar = false;
    this.saveHistory();

    this.setScreen('editor');
    this.computeBaseViewBox();
  }

  public loadTemplate(templateId: string): void {
    const tmpl = BALLOON_STUDIO_TEMPLATES.find((t) => t.id === templateId) || BALLOON_STUDIO_TEMPLATES[0];
    this.selectedTemplateId = tmpl.id;
    this.arrangementTitle = tmpl.name;
    this.hasCustomName = false;
    const titleEl = document.getElementById('bs-editor-current-title');
    if (titleEl) titleEl.textContent = this.arrangementTitle;

    this.pieces = JSON.parse(JSON.stringify(tmpl.pieces)).map((p: any) => ({ ...p, source: 'model' as const }));
    this.baseTemplatePieces = JSON.parse(JSON.stringify(this.pieces));
    this.palette = JSON.parse(JSON.stringify(tmpl.palette));
    this.activeColorCount = this.palette.colorCount || 4;
    if (!this.palette.E) this.palette.E = '#ffffff';

    // Garante nomes amigáveis fiéis às cores do modelo escolhido
    if (!this.palette.names) {
      this.palette.names = {
        A: getFriendlyColorName(this.palette.A),
        B: getFriendlyColorName(this.palette.B),
        C: getFriendlyColorName(this.palette.C),
        D: getFriendlyColorName(this.palette.D),
        E: getFriendlyColorName(this.palette.E || '#ffffff')
      };
    } else {
      const slots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
      slots.forEach((s) => {
        if (!this.palette.names![s]) {
          this.palette.names![s] = getFriendlyColorName((this.palette as any)[s] || '#ffffff');
        }
      });
    }

    if (!this.palette.finishes) {
      this.palette.finishes = { A: 'satin', B: 'satin', C: 'chrome', D: 'matte', E: 'satin' };
    }

    this.currentScaleLevel = 'padrao';
    this.scaleOrigins.clear();
    this.exitMultiSelectMode(true);
    this.history = [];
    this.historyIndex = -1;
    this.currentVolumeLevel = 'padrao';
    this.hasConfirmedVariar = false;
    this.saveHistory();

    // Fecha qualquer gaveta ou menu que estivesse aberto anteriormente!
    this.closeBottomDrawer();
    this.closeAllSheets();

    this.computeBaseViewBox();
    this.renderCanvas();
  }

  private applyPalettePreset(newPalette: BalloonPaletteConfig): void {
    this.palette = JSON.parse(JSON.stringify(newPalette));
    if (!this.palette.names) {
      this.palette.names = {
        A: getFriendlyColorName(this.palette.A),
        B: getFriendlyColorName(this.palette.B),
        C: getFriendlyColorName(this.palette.C),
        D: getFriendlyColorName(this.palette.D),
        E: getFriendlyColorName(this.palette.E || '#ffffff')
      };
    } else {
      const slots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
      slots.forEach((s) => {
        if (!this.palette.names![s]) {
          this.palette.names![s] = getFriendlyColorName((this.palette as any)[s] || '#ffffff');
        }
      });
    }
    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
    if (this.isBottomDrawerOpen) {
      this.renderTabActivePanel();
    }
  }

  // ----------------------------------------------------------------------
  // GAVETAS: SHOPPING LIST & CONCLUIR
  // ----------------------------------------------------------------------

  private toggleSheet(sheetId: string, show: boolean): void {
    const sheet = document.getElementById(sheetId);
    if (sheet) sheet.style.display = show ? 'flex' : 'none';
  }

  private openShoppingModal(): void {
    this.renderShoppingContent();
    this.toggleSheet('bs-shopping-modal', true);
  }

  private renderShoppingContent(): void {
    const container = document.getElementById('bs-materials-list-container');
    if (!container) return;

    const stats = calculateArrangementStats(this.pieces, this.palette);
    const mult = this.includeSpareBalloons ? 1.10 : 1.0;
    const totalCount = Math.ceil(stats.totalCount * mult);

    const totalEl = document.getElementById('bs-stat-total-balloons');
    if (totalEl) totalEl.textContent = `${totalCount}`;

    const metersEl = document.getElementById('bs-stat-meters-frame');
    const estimatedMeters = Math.max(1, Math.round((stats.widthCm + stats.heightCm) * 0.012 * 10) / 10);
    if (metersEl) metersEl.textContent = `~${estimatedMeters} m`;

    const timeEl = document.getElementById('bs-stat-estimated-time');
    const hours = Math.round((totalCount / 60) * 10) / 10;
    if (timeEl) timeEl.textContent = `~${hours}h`;

    const slots: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const finishLabel: Record<BalloonFinish, string> = {
      satin: 'Cetim',
      matte: 'Fosco',
      chrome: 'Cromado',
      crystal: 'Cristal',
      glitter: 'Glitter'
    };

    container.innerHTML = slots.map((s) => {
      const hex = (this.palette as any)[s] || '#ffffff';
      const name = this.palette.names?.[s] || `Cor ${s}`;
      const fin = this.palette.finishes?.[s] || 'satin';

      const piecesOfSlot = this.pieces.filter((p) => p.slot === s);
      if (piecesOfSlot.length === 0) return '';

      const countsBySize: Record<BalloonSizeInches, number> = { 5: 0, 7: 0, 9: 0, 10: 0, 12: 0, 16: 0, 18: 0, 24: 0, 36: 0 };
      let starCount = 0;
      piecesOfSlot.forEach((p) => {
        if (p.shape === 'star') {
          starCount++;
        } else {
          countsBySize[p.sizeInches]++;
        }
      });

      const sizesBadges = ([36, 24, 18, 16, 12, 10, 9, 7, 5] as BalloonSizeInches[])
        .filter((sz) => countsBySize[sz] > 0)
        .map((sz) => {
          const qty = Math.ceil(countsBySize[sz] * mult);
          return `<span class="bs-size-badge">${sz}" · <u>${qty}</u></span>`;
        });
      if (starCount > 0) {
        const qtyStar = Math.ceil(starCount * mult);
        sizesBadges.push(`<span class="bs-size-badge">⭐ 18" · <u>${qtyStar}</u></span>`);
      }
      const sizesBadgesHtml = sizesBadges.join('');

      return `
        <div class="bs-material-row">
          <span class="bs-material-dot" style="background:${hex}"></span>
          <div class="bs-material-info">
            <b class="bs-material-name">${name}</b>
            <span class="bs-material-finish">${finishLabel[fin]}</span>
          </div>
          <div class="bs-material-sizes">
            ${sizesBadgesHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  private generateShoppingListPlainText(): string {
    const stats = calculateArrangementStats(this.pieces, this.palette);
    const mult = this.includeSpareBalloons ? 1.10 : 1.0;
    const totalCount = Math.ceil(stats.totalCount * mult);
    const estimatedMeters = Math.max(1, Math.round((stats.widthCm + stats.heightCm) * 0.012 * 10) / 10);

    let text = `*${this.arrangementTitle}*\n`;
    text += `Medidas: ${stats.widthCm} cm × ${stats.heightCm} cm\n`;
    text += `Total: ${totalCount} balões ${this.includeSpareBalloons ? '(inclui 10% de reserva)' : ''}\n\n`;

    const slots: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const finishLabel: Record<BalloonFinish, string> = {
      satin: 'Cetim',
      matte: 'Fosco',
      chrome: 'Cromado',
      crystal: 'Cristal',
      glitter: 'Glitter'
    };

    slots.forEach((s) => {
      const name = this.palette.names?.[s] || `Cor ${s}`;
      const fin = this.palette.finishes?.[s] || 'satin';
      const piecesOfSlot = this.pieces.filter((p) => p.slot === s);
      if (piecesOfSlot.length === 0) return;

      const countsBySize: Record<BalloonSizeInches, number> = { 5: 0, 7: 0, 9: 0, 10: 0, 12: 0, 16: 0, 18: 0, 24: 0, 36: 0 };
      let starCount = 0;
      piecesOfSlot.forEach((p) => {
        if (p.shape === 'star') {
          starCount++;
        } else {
          countsBySize[p.sizeInches]++;
        }
      });

      const sizesParts = ([36, 24, 18, 16, 12, 10, 9, 7, 5] as BalloonSizeInches[])
        .filter((sz) => countsBySize[sz] > 0)
        .map((sz) => `${sz}" × ${Math.ceil(countsBySize[sz] * mult)}`);
      if (starCount > 0) {
        sizesParts.push(`⭐ 18" × ${Math.ceil(starCount * mult)}`);
      }
      const sizesStr = sizesParts.join(' · ');

      text += `• *${name}* (${finishLabel[fin]}): ${sizesStr}\n`;
    });

    text += `\nEstrutura / Fita: ~${estimatedMeters} m\n`;
    text += `Gerado no Decoraly`;
    return text;
  }

  private async copyShoppingListText(): Promise<void> {
    const text = this.generateShoppingListPlainText();
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById('bs-btn-copy-shopping-text');
      if (btn) {
        btn.textContent = 'Copiado com Sucesso!';
        setTimeout(() => {
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> <span>Copiar Lista</span>`;
        }, 2000);
      }
    } catch (_) {
      alert(text);
    }
  }

  private shareOnWhatsApp(): void {
    const text = this.generateShoppingListPlainText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  private openConcludeModal(): void {
    const previewBox = document.getElementById('bs-conclude-preview-box');
    const inputName = document.getElementById('bs-input-arrangement-name') as HTMLInputElement | null;
    const linkCount = document.getElementById('bs-link-count');

    if (inputName) inputName.value = this.arrangementTitle;
    if (linkCount) linkCount.textContent = `${this.pieces.length}`;

    if (previewBox) {
      const { svg } = renderArrangementSvg(this.pieces, this.palette, { pad: 20, hasFloorShadow: false, idPrefix: "bs-concl-" });
      previewBox.innerHTML = svg;
    }

    this.toggleSheet('bs-conclude-modal', true);
  }

  private async concludeSave(): Promise<void> {
    const inputName = document.getElementById('bs-input-arrangement-name') as HTMLInputElement | null;
    const finalName = inputName?.value.trim() || this.arrangementTitle;

    // Renderiza SVG final recortado com precisão
    const { svg, widthCm, heightCm } = renderArrangementSvg(this.pieces, this.palette, {
      pad: 12,
      hasFloorShadow: false
    });

    // Converte para imagem PNG com transparência
    const imgDataUrl = await this.svgToPngDataUrl(svg);

    let savedItem: PresetItem;
    try {
      savedItem = await addCustomItem({
        name: finalName,
        category: 'baloes',
        type: 'generic',
        widthCm,
        heightCm,
        previewUrl: imgDataUrl,
        isCustom: true,
        stockQuantity: 1,
        rentalPrice: 0
      });
    } catch (err) {
      console.error('Erro ao salvar no IndexedDB:', err);
      savedItem = {
        id: `custom-baloes-${Date.now()}`,
        name: finalName,
        category: 'baloes',
        type: 'generic',
        widthCm,
        heightCm,
        previewUrl: imgDataUrl,
        isCustom: true,
        stockQuantity: 1,
        rentalPrice: 0,
        createdAt: Date.now()
      };
    }

    this.arrangementTitle = finalName;
    this.hasCustomName = true;
    try {
      if (!this.currentBalloonProjectId) {
        this.currentBalloonProjectId = 'bal-' + Date.now();
      }
      await saveProject({
        id: this.currentBalloonProjectId,
        title: finalName,
        projectType: 'balloon',
        elements: [],
        balloonData: {
          pieces: JSON.parse(JSON.stringify(this.pieces)),
          palette: JSON.parse(JSON.stringify(this.palette)),
          distributionMode: this.currentDistributionMode,
          volumeLevel: this.currentVolumeLevel,
          selectedTemplateId: this.selectedTemplateId
        },
        thumbnailUrl: imgDataUrl
      });
      this.hasEverBeenSaved = true;
    } catch (e) {
      console.warn('Erro ao salvar projeto de balão:', e);
    }

    // Fecha a gaveta de salvamento sem sair do estúdio
    this.toggleSheet('bs-conclude-modal', false);

    // Atualiza o título na barra superior do estúdio
    const titleEl = document.getElementById('bs-editor-current-title');
    if (titleEl) titleEl.textContent = finalName;

    this.isDirty = false;
    this.showToast('Arranjo salvo com sucesso!');

    if (this.onSavedCallback) {
      this.onSavedCallback(savedItem);
    }
  }

  private svgToPngDataUrl(svgStr: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(1400, Math.max(img.width * 2, 800));
        canvas.height = Math.round(canvas.width * (img.height / img.width));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(pngUrl);
          return;
        }
        resolve(arrangementSvgToDataUrl(svgStr));
      };

      img.onerror = () => {
        resolve(arrangementSvgToDataUrl(svgStr));
      };

      img.src = url;
    });
  }

  // ----------------------------------------------------------------------
  // HISTÓRICO UNDO / REDO
  // ----------------------------------------------------------------------

  private updateUndoRedoButtons(): void {
    const btnUndo = document.getElementById('bs-btn-header-undo') as HTMLButtonElement | null;
    const btnRedo = document.getElementById('bs-btn-header-redo') as HTMLButtonElement | null;
    if (btnUndo) btnUndo.disabled = this.historyIndex <= 0;
    if (btnRedo) btnRedo.disabled = this.historyIndex >= this.history.length - 1;
  }

  private saveHistory(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push({
      pieces: JSON.parse(JSON.stringify(this.pieces)),
      palette: JSON.parse(JSON.stringify(this.palette))
    });
    if (this.history.length > 30) this.history.shift();
    this.historyIndex = this.history.length - 1;

    this.updateUndoRedoButtons();
    this.markDirtyAndScheduleAutosave();
  }

  private undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const state = this.history[this.historyIndex];
      this.pieces = JSON.parse(JSON.stringify(state.pieces));
      this.palette = JSON.parse(JSON.stringify(state.palette));
      this.scaleOrigins.clear();
      this.currentScaleLevel = 'padrao';
      this.updateUndoRedoButtons();
      this.renderCanvas();
      if (this.isBottomDrawerOpen) this.renderTabActivePanel();
      this.renderSelectionDock();
    }
  }

  private redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const state = this.history[this.historyIndex];
      this.pieces = JSON.parse(JSON.stringify(state.pieces));
      this.palette = JSON.parse(JSON.stringify(state.palette));
      this.scaleOrigins.clear();
      this.currentScaleLevel = 'padrao';
      this.updateUndoRedoButtons();
      this.renderCanvas();
      if (this.isBottomDrawerOpen) this.renderTabActivePanel();
      this.renderSelectionDock();
    }
  }


  // ----------------------------------------------------------------------
  // AUTOSAVE CONTÍNUO DO ESTÚDIO DE BALÕES
  // ----------------------------------------------------------------------
  public markDirtyAndScheduleAutosave(): void {
    if (this.pieces.length === 0) return;
    this.isDirty = true;

    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    this.autosaveTimer = setTimeout(async () => {
      await this.performAutosave();
    }, 800);
  }

  public async performAutosave(): Promise<void> {
    if (this.pieces.length === 0) return;

    if (!this.currentBalloonProjectId) {
      this.currentBalloonProjectId = 'bal-' + Date.now();
    }

    try {
      const thumb = this.exportSvgThumbnail();
      await saveProject({
        id: this.currentBalloonProjectId,
        title: this.arrangementTitle || 'Novo Arranjo',
        projectType: 'balloon',
        elements: [],
        balloonData: {
          pieces: JSON.parse(JSON.stringify(this.pieces)),
          palette: JSON.parse(JSON.stringify(this.palette)),
          distributionMode: this.currentDistributionMode,
          volumeLevel: this.currentVolumeLevel,
          selectedTemplateId: this.selectedTemplateId
        },
        thumbnailUrl: thumb,
        updatedAt: Date.now()
      });

      this.hasEverBeenSaved = true;
      this.isDirty = false;
      this.showAutosaveFeedback();
    } catch (err) {
      console.warn('Erro no autosave do estúdio de balões:', err);
    }
  }

  private exportSvgThumbnail(): string {
    if (!this.canvasSvgEl) return '';
    try {
      const clone = this.canvasSvgEl.cloneNode(true) as SVGSVGElement;
      const hl = clone.querySelector('#bs-highlight-layer');
      if (hl) hl.innerHTML = '';
      const xml = new XMLSerializer().serializeToString(clone);
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(xml);
    } catch {
      return '';
    }
  }

  private showAutosaveFeedback(): void {
    const el = document.getElementById('bs-autosave-tag');
    if (el) {
      el.classList.add('visible');
      setTimeout(() => el.classList.remove('visible'), 1600);
    }
  }

  // Verificação ao tentar sair do Estúdio (salvamento silencioso em background, sem bloquear o usuário)
  public async requestExit(): Promise<boolean> {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
      if (this.isDirty) {
        await this.performAutosave();
      }
    }

    this.close();
    this.onExitCallback?.();
    return true;
  }

  // ----------------------------------------------------------------------
  // API PÚBLICA
  // ----------------------------------------------------------------------

  public open(options?: {
    fromScenario?: boolean;
    templateId?: string;
    projectToLoad?: ProjectData;
    onInsert?: (item: PresetItem) => void;
    onSaved?: (item: PresetItem) => void;
    onExit?: () => void;
  }): void {
    this.createDomStructure();
    if (!this.overlayEl) return;

    this.closeBottomDrawer();
    this.closeAllSheets();
    this.openedFromScenario = Boolean(options?.fromScenario);
    if (options?.onInsert !== undefined) this.onInsertCallback = options.onInsert;
    if (options?.onSaved !== undefined) this.onSavedCallback = options.onSaved;
    if (options?.onExit !== undefined) this.onExitCallback = options.onExit;

    this.overlayEl.style.display = 'flex';
    document.body.classList.add('bs-studio-open');
    document.body.classList.add('screen-balloon-studio');

    if (options?.projectToLoad) {
      this.loadBalloonProject(options.projectToLoad);
    } else if (options?.templateId) {
      this.currentBalloonProjectId = null;
      this.hasEverBeenSaved = false;
      this.isDirty = false;
      this.loadTemplate(options.templateId);
      this.setScreen('editor');
    } else {
      this.currentBalloonProjectId = null;
      this.hasEverBeenSaved = false;
      this.isDirty = false;
      this.setScreen('gallery');
      this.renderSavedArrangements();
    }
  }

  public loadBalloonProject(proj: ProjectData): void {
    this.closeBottomDrawer();
    this.closeAllSheets();
    this.currentBalloonProjectId = proj.id;
    this.arrangementTitle = proj.title || 'Arranjo de Balões';
    this.hasCustomName = Boolean(proj.title && proj.title !== 'Novo Arranjo');
    const el = document.getElementById('bs-editor-current-title');
    if (el) el.textContent = this.arrangementTitle;

    if (proj.balloonData) {
      this.pieces = JSON.parse(JSON.stringify(proj.balloonData.pieces || []));
      this.palette = JSON.parse(JSON.stringify(proj.balloonData.palette || this.palette));
      this.activeColorCount = this.palette.colorCount || 4;
      this.currentDistributionMode = (proj.balloonData.distributionMode as any) || 'mesclado';
      this.currentVolumeLevel = (proj.balloonData.volumeLevel as any) || 'padrao';
      this.selectedTemplateId = proj.balloonData.selectedTemplateId || '';

      if (!this.palette.names) {
        this.palette.names = {
          A: getFriendlyColorName(this.palette.A),
          B: getFriendlyColorName(this.palette.B),
          C: getFriendlyColorName(this.palette.C),
          D: getFriendlyColorName(this.palette.D),
          E: getFriendlyColorName(this.palette.E || '#ffffff')
        };
      } else {
        const slots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
        slots.forEach((s) => {
          if (!this.palette.names![s]) {
            this.palette.names![s] = getFriendlyColorName((this.palette as any)[s] || '#ffffff');
          }
        });
      }
    }

    this.currentScaleLevel = 'padrao';
    this.scaleOrigins.clear();
    this.exitMultiSelectMode(true);
    this.hasEverBeenSaved = true;
    this.isDirty = false;
    this.history = [];
    this.historyIndex = -1;
    this.saveHistory();

    this.setScreen('editor');
    this.renderCanvas();
  }

  
  // Renderiza a Seção Dinâmica de Arranjos Salvos na Galeria Inicial
  public async renderSavedArrangements(): Promise<void> {
    const sectionEl = document.getElementById('bs-saved-arrangements-section');
    const gridEl = document.getElementById('bs-saved-arrangements-grid');
    const countEl = document.getElementById('bs-saved-count-label');
    const toggleBtn = document.getElementById('bs-saved-dropdown-toggle');
    if (!sectionEl || !gridEl) return;

    try {
      const savedProjects = await getBalloonProjects();

      if (savedProjects.length === 0) {
        sectionEl.style.display = 'none';
        sectionEl.classList.remove('is-open');
        toggleBtn?.setAttribute('aria-expanded', 'false');
        gridEl.innerHTML = '';
        return;
      }

      sectionEl.style.display = 'block';
      if (countEl) {
        countEl.textContent = `${savedProjects.length} ${savedProjects.length === 1 ? 'salvo' : 'salvos'}`;
      }

      gridEl.innerHTML = '';
      const fragment = document.createDocumentFragment();

      savedProjects.forEach((proj) => {
        const card = document.createElement('div');
        card.className = 'bs-template-card bs-saved-card';
        card.dataset.projectId = proj.id;
        card.style.position = 'relative';

        const piecesCount = proj.balloonData?.pieces.length || 0;
        const dateStr = new Date(proj.updatedAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });

        let thumbHtml = '';
        if (proj.thumbnailUrl && (proj.thumbnailUrl.startsWith('data:') || proj.thumbnailUrl.startsWith('http') || proj.thumbnailUrl.startsWith('blob:'))) {
          thumbHtml = `<img src="${proj.thumbnailUrl}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;" />`;
        } else if (proj.balloonData?.pieces && proj.balloonData?.palette) {
          const { svg } = renderArrangementSvg(proj.balloonData.pieces, proj.balloonData.palette, {
            pad: 14,
            hasFloorShadow: false,
            idPrefix: `saved-${proj.id}-`
          });
          thumbHtml = svg;
        } else {
          thumbHtml = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #A8A29E;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/></svg>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="bs-card-thumb" style="display: flex; align-items: center; justify-content: center; background: #FAF8F5; overflow: hidden; height: 115px;">
            ${thumbHtml}
          </div>
          <div class="bs-card-meta">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
              <b class="bs-card-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; flex: 1;" title="${proj.title}">${proj.title}</b>
              <button type="button" class="bs-btn-rename-saved" data-rename-id="${proj.id}" title="Renomear arranjo" style="background: none; border: none; cursor: pointer; color: var(--primary, #B58938); padding: 2px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
            </div>
            <span class="bs-card-sub">${piecesCount} balões • ${dateStr}</span>
          </div>
          <button type="button" class="bs-btn-delete-saved" data-delete-id="${proj.id}" title="Excluir este arranjo" style="position: absolute; top: 6px; right: 6px; width: 28px; height: 28px; border-radius: 8px; background: rgba(255, 255, 255, 0.94); border: 1px solid #E6E1DA; display: flex; align-items: center; justify-content: center; color: #DC2626; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.06); touch-action: manipulation; transition: all 0.15s ease;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        `;

        // Abrir arranjo no estúdio ao clicar no card
        card.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.bs-btn-delete-saved') || target.closest('.bs-btn-rename-saved')) return;
          this.loadBalloonProject(proj);
        });

        // Renomear arranjo salvo no card
        const btnRename = card.querySelector('.bs-btn-rename-saved');
        btnRename?.addEventListener('click', async (e) => {
          e.stopPropagation();
          const currentName = proj.title || 'Novo Arranjo';
          const novo = prompt('Digite o novo nome do arranjo:', currentName);
          if (novo && novo.trim() && novo.trim() !== currentName) {
            const cleanTitle = novo.trim();
            await saveProject({
              ...proj,
              title: cleanTitle
            });
            if (this.currentBalloonProjectId === proj.id) {
              this.arrangementTitle = cleanTitle;
              this.hasCustomName = true;
              const el = document.getElementById('bs-editor-current-title');
              if (el) el.textContent = cleanTitle;
            }
            await this.renderSavedArrangements();
          }
        });

        // Excluir arranjo com confirmação amigável
        const btnDelete = card.querySelector('.bs-btn-delete-saved');
        btnDelete?.addEventListener('click', async (e) => {
          e.stopPropagation();
          const conf = confirm(`Deseja excluir permanentemente o arranjo "${proj.title}"? Esta ação não pode ser desfeita.`);
          if (conf) {
            await deleteProject(proj.id);
            if (this.currentBalloonProjectId === proj.id) {
              this.currentBalloonProjectId = null;
              this.hasEverBeenSaved = false;
            }
            await this.renderSavedArrangements();
          }
        });

        fragment.appendChild(card);
      });

      gridEl.appendChild(fragment);
    } catch (err) {
      console.warn('Erro ao carregar arranjos salvos no estúdio:', err);
    }
  }

  private showToast(message: string): void {
    let toast = document.getElementById('bs-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bs-toast';
      toast.className = 'bs-toast';
      this.overlayEl?.appendChild(toast);
    }
    toast.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;
    toast.classList.add('visible');
    setTimeout(() => toast?.classList.remove('visible'), 2600);
  }

  public close(): void {
    this.exitMultiSelectMode(true);
    if (this.overlayEl) {
      this.overlayEl.style.display = 'none';
      document.body.classList.remove('bs-studio-open');
      document.body.classList.remove('screen-balloon-studio');
    }
  }

  public isOpen(): boolean {
    return this.overlayEl?.style.display === 'flex';
  }
}
