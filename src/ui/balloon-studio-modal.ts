// Ateliê Visual de Criação e Customização de Balões Orgânicos
// Padrão Editorial Ateliê Claro para Decoradoras de Festa

import {
  BALLOON_STUDIO_TEMPLATES,
  STUDIO_PALETTE_PRESETS,
  FASHION_BALLOON_COLORS,
  BALLOON_SIZE_RADIUS_MAP,
  renderArrangementSvg,
  arrangementSvgToDataUrl,
  calculateArrangementStats,
  generateStudioDefs,
  renderBalloonPieceSvg,
  sortPiecesByDepth,
  mirrorArrangementHorizontal,
  distributeColors,
  variateArrangement,
  applyVolumeLevel,
  adjustColorBrightness,
  getFriendlyColorName,
  type BalloonPiece,
  type BalloonPaletteConfig,
  type BalloonSizeInches,
  type BalloonFinish,
  type BalloonSlot,
  type BalloonModelTemplate,
  type ArrangementStats
} from '../core/balloon-studio-engine';
import { addCustomItem, getAllCovers, addCustomCover, saveProject, getBalloonProjects, deleteProject, type CoverItemRecord } from '../core/db';
import { renameModal } from './rename-modal';
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

  // Ferramenta ativa no canvas (Ajustar por padrão)
  private activeTouchTool:
    | 'adjust'
    | 'multi-select'
    | 'pan'
    | 'eraser'
    | 'balloon-5'
    | 'balloon-7'
    | 'balloon-10'
    | 'balloon-12'
    | 'balloon-18'
    | 'balloon-24'
    | 'cluster-quad'
    | 'cluster-trio'
    | 'base-balloon'
    | 'light-point'
    | 'big-balloon' = 'adjust';

  // Aba ativa no dock inferior (Inicia sem nenhum menu aberto)
  private activeBottomTab: 'cores' | 'incluir' | 'ajustes' | null = null;
  private isBottomDrawerOpen: boolean = false;
  private activeColorCount: number = 4;
  private hasConfirmedVariar: boolean = false;
  private colorSheetSubtab: 'colors' | 'covers' = 'colors';
  private cachedCovers: CoverItemRecord[] = [];

  // Estado da ferramenta de arrastar tela (Pan)
  private isPanningWithTool: boolean = false;
  private panPointerId: number = -1;
  private panStartClient = { x: 0, y: 0 };
  private panStartPan = { x: 0, y: 0 };
  private quickBarPreviewTimer: number | null = null;
  private multiSelectToggleCandidate: string | null = null;
  private hasMovedDrag: boolean = false;

  // Viewport e Zoom Controlado EXCLUSIVAMENTE por Pinça (Estável, sem pular ao arrastar balões)
  private baseViewBox = { x: 0, y: 0, width: 600, height: 600 };
  private zoomLevel = 1.0;
  private panOffset = { x: 0, y: 0 };
  private activePointers = new Map<number, { x: number; y: number }>();
  private isPinching = false;
  private pinchStartDist = 1;
  private pinchStartZoom = 1;
  private pinchStartPan = { x: 0, y: 0 };
  private pinchStartMidpoint = { x: 0, y: 0 };
  private multiTouchCooldown = 0;

  // Arraste de peças individuais com 1 único ponteiro
  private isDragging = false;
  private dragPointerId: number | null = null;
  private dragStartSvgX = 0;
  private dragStartSvgY = 0;
  private dragPieceInitialPositions: Map<string, { x: number; y: number }> = new Map();

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
              <!-- Ação Principal de Saída -->
              <button id="bs-btn-conclude-flow" class="bs-btn-conclude" title="Concluir e usar no cenário">
                <span>Concluir</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </header>

          <!-- Centro: Canvas Interativo com Zoom Estável por Pinça -->
          <main class="bs-canvas-area" id="bs-canvas-container">
            <!-- Chips Flutuantes -->
            <div id="bs-chip-dimension" class="bs-canvas-chip bs-chip-dim">180 × 230 cm</div>
            <div id="bs-canvas-quick-bar" class="bs-canvas-quick-bar">
              <button id="bs-quick-btn-adjust" class="bs-quick-btn active" title="Modo Ajustar: selecione e arraste balões livremente">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
                <span>Ajustar</span>
              </button>
              <button id="bs-quick-btn-multiselect" class="bs-quick-btn" title="Seleção Múltipla: selecione vários balões">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="12" height="12" rx="2" stroke-dasharray="2 1.5"></rect><path d="M8 21h11a2 2 0 0 0 2-2V8"></path></svg>
                <span>Múltiplos</span>
              </button>
              <button id="bs-quick-btn-pan" class="bs-quick-btn" title="Arrastar Tela: mova o cenário livremente com 1 dedo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
                <span>Mover Tela</span>
              </button>
              <button id="bs-quick-btn-eraser" class="bs-quick-btn" title="Modo Apagar: toque em qualquer balão para excluir">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>
                <span>Apagar</span>
              </button>
              <div class="bs-quick-divider"></div>
              <button id="bs-quick-btn-mirror" class="bs-quick-btn" title="Inverter o arranjo horizontalmente (espelhar)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="2 2"></line><path d="M8 7 2 12l6 5V7z" fill="currentColor" fill-opacity="0.18"></path><path d="M16 7l6 5-6 5V7z" fill="currentColor" fill-opacity="0.75"></path></svg>
                <span>Inverter</span>
              </button>
              <button id="bs-quick-btn-undo" class="bs-quick-btn" title="Desfazer (Ctrl+Z)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                <span>Desfazer</span>
              </button>
              <button id="bs-quick-btn-redo" class="bs-quick-btn" title="Refazer (Ctrl+Y)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
                <span>Refazer</span>
              </button>
            </div>
            <button id="bs-btn-reset-view" class="bs-canvas-chip bs-chip-reset" style="display:none" title="Resetar zoom e centralizar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span id="bs-zoom-level-badge">100%</span>
            </button>
            <button id="bs-chip-shopping" class="bs-canvas-chip bs-chip-shop" title="Ver lista de compras de balões">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="7"></circle><path d="M12 17v4"></path></svg>
              <span id="bs-chip-count-label">0 balões</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <!-- Banner de Ferramenta Ativa com Botão Cancelar -->
            <div id="bs-tool-active-banner" class="bs-tool-banner" style="display:none">
              <span id="bs-tool-banner-text">Toque no cenário para posicionar</span>
              <button id="bs-btn-cancel-tool" class="bs-tool-cancel-btn" title="Cancelar inserção">Cancelar</button>
            </div>

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
              <g id="bs-balloons-layer"></g>
              <g id="bs-highlight-layer"></g>
            </svg>

            <!-- Pílula Flutuante no Balão Selecionado -->
            <div id="bs-floating-balloon-pill" class="bs-balloon-pill" style="display:none">
              <button id="bs-pill-color-btn" class="bs-pill-btn" title="Mudar cor desta família">
                <span id="bs-pill-swatch-dot" class="bs-pill-swatch-dot"></span>
                <span id="bs-pill-color-name">Cor</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <button id="bs-pill-size-btn" class="bs-pill-btn" title="Mudar tamanho">
                <span id="bs-pill-size-text">12"</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <button id="bs-pill-dup-btn" class="bs-pill-btn" title="Duplicar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button id="bs-pill-del-btn" class="bs-pill-btn bs-pill-btn-danger" title="Excluir">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </main>

          <!-- Faixa da Paleta (Exibida APENAS no Menu Cores) -->
          <section class="bs-palette-strip" id="bs-palette-strip-bar">
            <div class="bs-swatches-row" id="bs-swatches-container">
              <!-- Swatches gerados dinamicamente -->
            </div>
          </section>

          <!-- Painel Ativo da Aba -->
          <section class="bs-tab-panel" id="bs-tab-active-panel" style="display:none">
            <!-- Conteúdo injetado dinamicamente: Cores, Incluir ou Ajustes -->
          </section>

          <!-- Dock Inferior com 3 Abas: Cores | Incluir (Centro Destacado) | Ajustes -->
          <nav class="bs-tabs-dock">
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
            <button class="bs-dock-tab" data-tab="ajustes">
              <span class="bs-dock-tab-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
              </span>
              <span>Ajustes</span>
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

        <!-- Gaveta: Adicionar Arranjo Modelo -->
        <div id="bs-append-model-sheet" class="bs-sheet-dim" style="display:none">
          <div class="bs-bottom-sheet">
            <div class="bs-sheet-grabber"></div>
            <div class="bs-sheet-header">
              <h3 class="bs-sheet-title">Adicionar Arranjo Modelo</h3>
              <button id="bs-btn-close-append-sheet" class="bs-sheet-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="bs-sheet-body">
              <div class="bs-label-row" style="margin-bottom:8px">
                <span>Escolha um modelo para somar ao arranjo atual:</span>
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
              <h3 class="bs-sheet-title">Arranjo Concluído</h3>
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

              <button id="bs-btn-confirm-insert-scene" class="bs-btn-conclude-insert">
                Colocar no Cenário
              </button>
              <button id="bs-btn-confirm-save-only" class="bs-btn-conclude-saveonly">
                Só Salvar em Meus Elementos
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

    // 2. Ações do Topo do Editor (Retorna à Galeria com Salvamento)
    document.getElementById('bs-btn-back-to-gallery')?.addEventListener('click', async () => {
      if (this.autosaveTimer) {
        clearTimeout(this.autosaveTimer);
        this.autosaveTimer = null;
        if (this.isDirty) {
          await this.performAutosave();
        }
      }

      if (!this.hasCustomName && this.hasEverBeenSaved) {
        const result = await renameModal.prompt({
          currentTitle: this.arrangementTitle,
          itemType: 'arranjo'
        });

        if (result.action === 'cancel') {
          return;
        }

        if (result.action === 'rename' && result.title) {
          this.arrangementTitle = result.title;
          this.hasCustomName = true;
          const titleEl = document.getElementById('bs-editor-current-title');
          if (titleEl) titleEl.textContent = this.arrangementTitle;
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
        } else if (result.action === 'keep') {
          this.hasCustomName = true;
        }
      }

      this.setScreen('gallery');
      await this.renderSavedArrangements();
    });

    document.getElementById('bs-editor-title-container')?.addEventListener('click', () => {
      const novo = prompt('Nome do arranjo:', this.arrangementTitle);
      if (novo && novo.trim()) {
        this.arrangementTitle = novo.trim();
        this.hasCustomName = true;
        const el = document.getElementById('bs-editor-current-title');
        if (el) el.textContent = this.arrangementTitle;
      }
    });



    document.getElementById('bs-btn-conclude-flow')?.addEventListener('click', () => {
      this.openConcludeModal();
    });

    // 3. Quick Bar Vertical do Canvas
    document.getElementById('bs-quick-btn-adjust')?.addEventListener('click', () => {
      this.setActiveTouchTool('adjust');
    });
    document.getElementById('bs-quick-btn-multiselect')?.addEventListener('click', () => {
      this.setActiveTouchTool(this.activeTouchTool === 'multi-select' ? 'adjust' : 'multi-select');
    });
    document.getElementById('bs-quick-btn-pan')?.addEventListener('click', () => {
      this.setActiveTouchTool(this.activeTouchTool === 'pan' ? 'adjust' : 'pan');
    });
    document.getElementById('bs-quick-btn-eraser')?.addEventListener('click', () => {
      this.setActiveTouchTool(this.activeTouchTool === 'eraser' ? 'adjust' : 'eraser');
    });
    document.getElementById('bs-quick-btn-mirror')?.addEventListener('click', () => {
      this.mirrorArrangement();
    });
    document.getElementById('bs-quick-btn-undo')?.addEventListener('click', () => {
      this.undo();
    });
    document.getElementById('bs-quick-btn-redo')?.addEventListener('click', () => {
      this.redo();
    });

    // Botão cancelar modo ativo no banner
    document.getElementById('bs-btn-cancel-tool')?.addEventListener('click', () => {
      this.setActiveTouchTool('adjust');
    });

    document.getElementById('bs-btn-reset-view')?.addEventListener('click', () => {
      this.resetViewportZoom();
    });

    document.getElementById('bs-chip-shopping')?.addEventListener('click', () => {
      this.openShoppingModal();
    });

    // 4. Pílula Flutuante do Balão
    document.getElementById('bs-pill-color-btn')?.addEventListener('click', () => {
      const slots: BalloonSlot[] = (['A', 'B', 'C', 'D', 'E'] as const).slice(0, this.activeColorCount);
      const currentSlot = this.getActiveSelectedPiece()?.slot || 'A';
      const nextIdx = (slots.indexOf(currentSlot) + 1) % slots.length;
      this.setSelectedPieceSlot(slots[nextIdx]);
    });

    document.getElementById('bs-pill-size-btn')?.addEventListener('click', () => {
      const sizes: BalloonSizeInches[] = [5, 7, 10, 12, 18, 24];
      const p = this.getActiveSelectedPiece();
      const currentSize = p?.sizeInches || 12;
      const nextIdx = (sizes.indexOf(currentSize) + 1) % sizes.length;
      this.setSelectedPieceSize(sizes[nextIdx]);
    });

    document.getElementById('bs-pill-dup-btn')?.addEventListener('click', () => {
      this.duplicateSelected();
    });

    document.getElementById('bs-pill-del-btn')?.addEventListener('click', () => {
      this.deleteSelected();
    });

    // 6. Dock de Abas Inferiores com Comportamento de Toggle ao Re-clicar
    this.overlayEl.querySelectorAll('.bs-dock-tab').forEach((tabBtn) => {
      tabBtn.addEventListener('click', (e) => {
        const btn = e.currentTarget as HTMLElement;
        const tab = btn.dataset.tab as 'cores' | 'incluir' | 'ajustes';
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

    // Clique nos cards de Adicionar Arranjo Modelo
    this.overlayEl.querySelectorAll('.bs-append-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const id = target.dataset.templateId;
        if (id) {
          this.appendModelTemplate(id);
        }
      });
    });

    document.getElementById('bs-toggle-spare-checkbox')?.addEventListener('change', (e) => {
      this.includeSpareBalloons = (e.target as HTMLInputElement).checked;
      this.renderShoppingContent();
    });

    document.getElementById('bs-btn-copy-shopping-text')?.addEventListener('click', () => this.copyShoppingListText());
    document.getElementById('bs-btn-share-whatsapp')?.addEventListener('click', () => this.shareOnWhatsApp());

    document.getElementById('bs-btn-confirm-insert-scene')?.addEventListener('click', () => this.concludeSave(true));
    document.getElementById('bs-btn-confirm-save-only')?.addEventListener('click', () => this.concludeSave(false));
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

    // 8. Eventos de Canvas: Pinch-to-zoom com multi-touch guard e arrasto de balões
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
        this.close();
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
      this.renderCanvas();
      this.syncPaletteSwatches();
      // Não reabre menus automaticamente; apenas renderiza se a gaveta estiver explicitamente aberta
      if (this.isBottomDrawerOpen) {
        this.renderTabActivePanel();
      } else {
        const panel = document.getElementById('bs-tab-active-panel');
        if (panel) panel.style.display = 'none';
      }
    } else if (screen === 'gallery') {
      this.closeBottomDrawer();
      this.closeAllSheets();
      this.renderSavedArrangements();
    }
  }

  // ----------------------------------------------------------------------
  // SISTEMA DE ZOOM POR PINÇA E GESTOS NO CANVAS
  // ----------------------------------------------------------------------

  // Calcula viewBox base estável baseado na envoltória inicial do modelo
  private computeBaseViewBox(): void {
    if (this.pieces.length === 0) {
      this.baseViewBox = { x: 0, y: 0, width: 500, height: 500 };
      this.zoomLevel = 1.0;
      this.panOffset = { x: 0, y: 0 };
      this.applyViewport();
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of this.pieces) {
      const r = BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28;
      if (p.x - r < minX) minX = p.x - r;
      if (p.x + r > maxX) maxX = p.x + r;
      if (p.y - r < minY) minY = p.y - r;
      if (p.y + r > maxY) maxY = p.y + r;
    }

    const pad = 60;
    const w = Math.max(300, (maxX - minX) + pad * 2);
    const h = Math.max(300, (maxY - minY) + pad * 2);
    const size = Math.max(w, h);
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

  // Aplica o viewBox calculado ao SVG (NUNCA altera com o simples arrasto de balões)
  private applyViewport(): void {
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

    this.updateBalloonPillPosition();
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

    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // DOIS DEDOS: CANCELA IMEDIATAMENTE QUALQUER ARRASTO DE BALÃO!
      if (this.activePointers.size >= 2) {
        if (this.isDragging) {
          this.isDragging = false;
          this.dragPointerId = null;
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
        this.hideBalloonPill();

        // Inicia pinça de zoom
        const pts = Array.from(this.activePointers.values());
        this.isPinching = true;
        this.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        this.pinchStartZoom = this.zoomLevel;
        this.pinchStartPan = { ...this.panOffset };
        this.pinchStartMidpoint = {
          x: (pts[0].x + pts[1].x) / 2,
          y: (pts[0].y + pts[1].y) / 2
        };
        return;
      }

      // Se ainda estiver no cooldown pós-pinça, ignora início de arrasto
      if (Date.now() < this.multiTouchCooldown) return;

      const target = e.target as SVGElement;
      const pieceGroup = target.closest('.balloon-piece') as SVGElement | null;

      // Execução conforme a ferramenta ativa:
      // 1. Mover a Tela (Pan com 1 dedo ou mouse)
      if (this.activeTouchTool === 'pan') {
        this.isPanningWithTool = true;
        this.panPointerId = e.pointerId;
        this.panStartClient = { x: e.clientX, y: e.clientY };
        this.panStartPan = { ...this.panOffset };
        this.hideBalloonPill();
        const container = document.getElementById('bs-canvas-container');
        if (container) container.classList.add('is-panning');
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
        return;
      }

      // 2. Apagar
      if (this.activeTouchTool === 'eraser') {
        if (pieceGroup) {
          const pieceId = pieceGroup.id.replace('piece-', '');
          this.deletePieceById(pieceId);
        }
        return;
      }

      // 3. Inserção de Peças
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

      // 4. Modo Múltiplos (Seleção Múltipla acumulativa e arrasto de grupo)
      if (this.activeTouchTool === 'multi-select') {
        if (pieceGroup) {
          const pieceId = pieceGroup.id.replace('piece-', '');
          if (this.selectedPieceIds.has(pieceId)) {
            this.multiSelectToggleCandidate = pieceId;
          } else {
            this.selectedPieceIds.add(pieceId);
            this.multiSelectToggleCandidate = null;
          }
          this.hasMovedDrag = false;

          this.renderSelectionHighlights();
          this.showBalloonPill();

          this.isDragging = true;
          this.dragPointerId = e.pointerId;

          const svgPt = this.screenToSvgCoordinates(e.clientX, e.clientY);
          this.dragStartSvgX = svgPt.x;
          this.dragStartSvgY = svgPt.y;

          this.dragPieceInitialPositions.clear();
          this.selectedPieceIds.forEach((id) => {
            const p = this.pieces.find((x) => x.id === id);
            if (p) this.dragPieceInitialPositions.set(id, { x: p.x, y: p.y });
          });

          try {
            canvas.setPointerCapture(e.pointerId);
          } catch (_) {}
        } else {
          // Tocou no fundo no modo múltiplos: limpa a seleção
          this.selectedPieceIds.clear();
          this.renderSelectionHighlights();
          this.hideBalloonPill();
        }
        return;
      }

      // 5. Modo Ajustar (Padrão: move peça ou grupo inteiro se já estiver selecionado)
      if (pieceGroup) {
        const pieceId = pieceGroup.id.replace('piece-', '');
        // Se a peça já estiver no grupo de selecionados (ex: cluster recém inserido ou seleção anterior), mantém o grupo!
        if (!this.selectedPieceIds.has(pieceId)) {
          this.selectedPieceIds.clear();
          this.selectedPieceIds.add(pieceId);
        }
        this.renderSelectionHighlights();
        this.showBalloonPill();

        this.isDragging = true;
        this.dragPointerId = e.pointerId;

        const svgPt = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.dragStartSvgX = svgPt.x;
        this.dragStartSvgY = svgPt.y;

        this.dragPieceInitialPositions.clear();
        this.selectedPieceIds.forEach((id) => {
          const p = this.pieces.find((x) => x.id === id);
          if (p) this.dragPieceInitialPositions.set(id, { x: p.x, y: p.y });
        });

        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
      } else {
        // Clicou no fundo do canvas
        this.selectedPieceIds.clear();
        this.renderSelectionHighlights();
        this.hideBalloonPill();
      }
    });

    canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Mover Tela com a ferramenta 'pan' (1 dedo ou mouse)
      if (this.isPanningWithTool && e.pointerId === this.panPointerId && this.activePointers.size === 1) {
        const dx = e.clientX - this.panStartClient.x;
        const dy = e.clientY - this.panStartClient.y;
        const svgScale = (this.baseViewBox.width / this.zoomLevel) / (canvas.clientWidth || 400);

        this.panOffset.x = this.panStartPan.x - dx * svgScale;
        this.panOffset.y = this.panStartPan.y - dy * svgScale;

        this.applyViewport();
        return;
      }

      // Gesto de pinça com 2 dedos
      if (this.activePointers.size >= 2 && this.isPinching) {
        const pts = Array.from(this.activePointers.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        const scale = currentDist / this.pinchStartDist;
        this.zoomLevel = Math.max(0.5, Math.min(3.5, this.pinchStartZoom * scale));

        const currentMid = {
          x: (pts[0].x + pts[1].x) / 2,
          y: (pts[0].y + pts[1].y) / 2
        };
        const dx = currentMid.x - this.pinchStartMidpoint.x;
        const dy = currentMid.y - this.pinchStartMidpoint.y;
        const svgScale = (this.baseViewBox.width / this.zoomLevel) / (canvas.clientWidth || 400);

        this.panOffset.x = this.pinchStartPan.x - dx * svgScale;
        this.panOffset.y = this.pinchStartPan.y - dy * svgScale;

        this.applyViewport();
        return;
      }

      // Arraste de peças (individual ou grupo selecionado) com 1 único dedo
      if (this.isDragging && e.pointerId === this.dragPointerId && this.activePointers.size === 1) {
        const svgPt = this.screenToSvgCoordinates(e.clientX, e.clientY);
        const dx = svgPt.x - this.dragStartSvgX;
        const dy = svgPt.y - this.dragStartSvgY;

        if (Math.hypot(dx, dy) > 3) {
          this.hasMovedDrag = true;
        }

        this.selectedPieceIds.forEach((id) => {
          const init = this.dragPieceInitialPositions.get(id);
          const p = this.pieces.find((x) => x.id === id);
          if (init && p) {
            p.x = Math.round(init.x + dx);
            p.y = Math.round(init.y + dy);
          }
        });

        this.renderCanvas(false);
        this.updateBalloonPillPosition();
      }
    });

    const onPointerEnd = (e: PointerEvent) => {
      this.activePointers.delete(e.pointerId);

      // Finaliza pan da ferramenta 'pan'
      if (this.isPanningWithTool && e.pointerId === this.panPointerId) {
        this.isPanningWithTool = false;
        this.panPointerId = -1;
        const container = document.getElementById('bs-canvas-container');
        if (container) container.classList.remove('is-panning');
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}
      }

      if (this.activePointers.size < 2 && this.isPinching) {
        this.isPinching = false;
        // Cooldown de 240ms pós-pinça
        this.multiTouchCooldown = Date.now() + 240;
      }

      if (this.isDragging && e.pointerId === this.dragPointerId) {
        // No modo múltiplos, se tocou em uma peça já selecionada sem arrastar, desmarca ela
        if (this.activeTouchTool === 'multi-select' && !this.hasMovedDrag && this.multiSelectToggleCandidate) {
          this.selectedPieceIds.delete(this.multiSelectToggleCandidate);
          this.multiSelectToggleCandidate = null;
        }

        this.renderSelectionHighlights();
        if (this.selectedPieceIds.size === 0) {
          this.hideBalloonPill();
        } else {
          this.showBalloonPill();
        }

        this.isDragging = false;
        this.dragPointerId = null;
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}

        if (this.hasMovedDrag) {
          this.saveHistory();
          this.renderCanvas(true);
          this.updateBalloonPillPosition();
        }
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

  // Converte coordenadas da tela para o espaço SVG real
  private screenToSvgCoordinates(clientX: number, clientY: number): { x: number; y: number } {
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

    // Sombra do chão desativada permanentemente
    const { widthCm, heightCm, stats } = renderArrangementSvg(this.pieces, this.palette, {
      hasFloorShadow: false,
      idPrefix: 'bs-cv-'
    });

    const defs = generateStudioDefs(this.palette, 'bs-cv-');
    const sortedPieces = sortPiecesByDepth(this.pieces);
    let piecesHtml = '';
    for (const p of sortedPieces) {
      piecesHtml += renderBalloonPieceSvg(p, this.palette, 'bs-cv-');
    }

    this.canvasSvgEl.innerHTML = `
      <defs id="bs-svg-defs">${defs}</defs>
      <g id="bs-backdrop-sketch-layer"></g>
      <g id="bs-balloons-layer">${piecesHtml}</g>
      <g id="bs-highlight-layer"></g>
    `;
    
    if (updateDimensions) {
      const dimBadge = document.getElementById('bs-chip-dimension');
      if (dimBadge) dimBadge.textContent = `${widthCm} × ${heightCm} cm`;

      const countLabel = document.getElementById('bs-chip-count-label');
      if (countLabel) countLabel.textContent = `${stats.totalCount} balões`;

      const emptyState = document.getElementById('bs-canvas-empty-state');
      if (emptyState) emptyState.style.display = this.pieces.length === 0 ? 'flex' : 'none';
    }

    this.renderSelectionHighlights();
  }

  // Desenha anel de destaque dourado sutil no balão selecionado
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
        h += `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="none" stroke="#B58938" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.95"/>`;
      }
    });
    layer.innerHTML = h;
  }

  // ----------------------------------------------------------------------
  // PÍLULA FLUTUANTE DO BALÃO SELECIONADO
  // ----------------------------------------------------------------------

  private getActiveSelectedPiece(): BalloonPiece | undefined {
    if (this.selectedPieceIds.size === 0) return undefined;
    const firstId = Array.from(this.selectedPieceIds)[0];
    return this.pieces.find((p) => p.id === firstId);
  }

  private showBalloonPill(): void {
    const pill = document.getElementById('bs-floating-balloon-pill');
    if (!pill || this.selectedPieceIds.size === 0) return;

    const colorDot = document.getElementById('bs-pill-swatch-dot');
    const colorName = document.getElementById('bs-pill-color-name');
    const sizeText = document.getElementById('bs-pill-size-text');

    if (this.selectedPieceIds.size > 1) {
      if (colorDot) colorDot.style.background = '#d4af37';
      if (colorName) colorName.textContent = `${this.selectedPieceIds.size} balões`;
      const allSelected = this.pieces.filter((p) => this.selectedPieceIds.has(p.id));
      const firstSize = allSelected[0]?.sizeInches;
      const allSameSize = allSelected.every((p) => p.sizeInches === firstSize);
      if (sizeText) sizeText.textContent = allSameSize ? `${firstSize}"` : 'Grupo';
    } else {
      const p = this.getActiveSelectedPiece();
      if (!p) return;
      const slotHex = (this.palette as any)[p.slot] || '#c97a8e';
      const slotFriendlyName = this.palette.names?.[p.slot as 'A' | 'B' | 'C' | 'D' | 'E'] || `Cor ${p.slot}`;

      if (colorDot) colorDot.style.background = slotHex;
      if (colorName) colorName.textContent = slotFriendlyName;
      if (sizeText) sizeText.textContent = `${p.sizeInches}"`;
    }

    pill.style.display = 'flex';
    this.updateBalloonPillPosition();
  }

  private hideBalloonPill(): void {
    const pill = document.getElementById('bs-floating-balloon-pill');
    if (pill) pill.style.display = 'none';
  }

  private updateBalloonPillPosition(): void {
    const pill = document.getElementById('bs-floating-balloon-pill');
    if (!pill || this.selectedPieceIds.size === 0 || !this.canvasSvgEl || pill.style.display === 'none') return;

    const selectedPieces = this.pieces.filter((p) => this.selectedPieceIds.has(p.id));
    if (selectedPieces.length === 0) return;

    let targetX = 0;
    let targetY = Infinity;

    if (selectedPieces.length === 1) {
      const p = selectedPieces[0];
      const r = BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28;
      targetX = p.x;
      targetY = p.y - r - 8;
    } else {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      selectedPieces.forEach((p) => {
        const r = BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28;
        if (p.x - r < minX) minX = p.x - r;
        if (p.x + r > maxX) maxX = p.x + r;
        if (p.y - r < minY) minY = p.y - r;
      });
      targetX = (minX + maxX) / 2;
      targetY = minY - 10;
    }

    const pt = this.canvasSvgEl.createSVGPoint();
    pt.x = targetX;
    pt.y = targetY;

    const ctm = this.canvasSvgEl.getScreenCTM();
    if (ctm) {
      const screenPt = pt.matrixTransform(ctm);
      const containerRect = document.getElementById('bs-canvas-container')?.getBoundingClientRect();
      if (containerRect) {
        pill.style.left = `${screenPt.x - containerRect.left}px`;
        pill.style.top = `${screenPt.y - containerRect.top}px`;
      }
    }
  }

  // ----------------------------------------------------------------------
  // FAIXA DA PALETA (CORES DA FESTA COM NOMES REAIS E ACABAMENTOS)
  // ----------------------------------------------------------------------

  private syncPaletteSwatches(): void {
    const strip = document.getElementById('bs-palette-strip-bar');
    if (strip) {
      // Exibe a barra de cores APENAS quando a aba Cores estiver aberta
      strip.style.display = (this.activeBottomTab === 'cores' && this.isBottomDrawerOpen) ? 'flex' : 'none';
    }

    const container = document.getElementById('bs-swatches-container');
    if (!container) return;

    const allSlots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
    const activeSlots = allSlots.slice(0, this.activeColorCount);
    container.innerHTML = activeSlots.map((s) => {
      const hex = (this.palette as any)[s] || (s === 'E' ? '#f8fafc' : '#ffffff');
      const hasCover = Boolean(this.palette.covers && this.palette.covers[s]);
      const coverUrl = this.palette.covers?.[s];
      const name = hasCover
        ? (this.palette.coverNames?.[s] || `Capa ${s}`)
        : (this.palette.names?.[s] || getFriendlyColorName(hex));
      const activeClass = this.activeColorSlot === s ? 'active' : '';

      const circleStyle = hasCover
        ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center; border: 1.5px solid #d4af37;`
        : `background: ${hex};`;

      return `
        <div class="bs-palette-swatch ${activeClass}" data-slot="${s}" title="Família ${s} (${name})">
          <span class="bs-swatch-circle" style="${circleStyle}"></span>
          <span class="bs-swatch-name">${name}</span>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.bs-palette-swatch').forEach((sw) => {
      sw.addEventListener('click', (e) => {
        const slot = (e.currentTarget as HTMLElement).dataset.slot as BalloonSlot;
        if (slot) {
          this.activeColorSlot = slot;
          this.openColorSheet(slot);
          this.syncPaletteSwatches();
        }
      });
    });
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
  // DOCK DE 3 ABAS COM TOGGLE: CORES | INCLUIR | AJUSTES
  // ----------------------------------------------------------------------

  public toggleBottomTab(tab: 'cores' | 'incluir' | 'ajustes'): void {
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

    const strip = document.getElementById('bs-palette-strip-bar');
    if (strip) strip.style.display = 'none';

    // Ao fechar a gaveta, o modo de inserção é desativado voltando para ajustar
    if (this.activeTouchTool !== 'adjust' && this.activeTouchTool !== 'eraser') {
      this.setActiveTouchTool('adjust');
    }
  }

  public openBottomDrawer(tab: 'cores' | 'incluir' | 'ajustes'): void {
    this.isBottomDrawerOpen = true;
    this.activeBottomTab = tab;
    this.overlayEl?.querySelectorAll('.bs-dock-tab').forEach((b) => {
      const btn = b as HTMLElement;
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const panel = document.getElementById('bs-tab-active-panel');
    if (panel) panel.style.display = 'block';

    this.syncPaletteSwatches();
    this.renderTabActivePanel();
  }

  private setBottomTab(tab: 'cores' | 'incluir' | 'ajustes'): void {
    this.openBottomDrawer(tab);
  }

  private renderTabActivePanel(): void {
    const panel = document.getElementById('bs-tab-active-panel');
    if (!panel) return;

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

          <!-- Lista de Cores do Arranjo (1 coluna fluida, 100% legível em qualquer tela) -->
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

      // Eventos dos cards de cores
      panel.querySelectorAll('.bs-color-family-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          const slot = (e.currentTarget as HTMLElement).dataset.slot as BalloonSlot;
          if (slot) {
            this.activeColorSlot = slot;
            this.openColorSheet(slot);
          }
        });
      });

      // Seletor de quantidade de cores
      panel.querySelectorAll('#bs-color-count-selector .bs-count-chip').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const count = Number((e.currentTarget as HTMLElement).dataset.colorCount);
          if (count >= 2 && count <= 5) {
            this.setActiveColorCount(count);
          }
        });
      });

      // Paletas Prontas
      panel.querySelectorAll('.bs-preset-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          const id = (e.currentTarget as HTMLElement).dataset.presetId;
          const preset = STUDIO_PALETTE_PRESETS.find((p) => p.id === id);
          if (preset) this.applyPalettePreset(preset.palette);
        });
      });

      // Modo de Distribuição
      panel.querySelectorAll('.bs-seg-btn[data-mode]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const mode = (e.currentTarget as HTMLElement).dataset.mode as any;
          if (mode) this.setDistributionMode(mode);
        });
      });
      return;
    }

    // ABA 2: INCLUIR (MEIO, DESTACADO)
    if (this.activeBottomTab === 'incluir') {
      panel.innerHTML = `
        <div class="bs-panel-incluir">
          <div class="bs-label-row">
            <span>Toque na peça para adicionar:</span>
            <em>Balões e clusters prontos</em>
          </div>
          <div class="bs-elements-catalog-grid">
            <!-- 5 polegadas -->
            <div class="bs-element-card" data-tool="balloon-5" data-type="balloon-5">
              <div class="bs-elem-thumb-balloon bs-size-5"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">5" Detalhe</strong>
                <span class="bs-elem-sub">Ponto de luz</span>
              </div>
            </div>

            <!-- 7 polegadas -->
            <div class="bs-element-card" data-tool="balloon-7" data-type="balloon-7">
              <div class="bs-elem-thumb-balloon bs-size-7"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">7" Mini</strong>
                <span class="bs-elem-sub">Transição</span>
              </div>
            </div>

            <!-- 10 polegadas -->
            <div class="bs-element-card" data-tool="balloon-10" data-type="balloon-10">
              <div class="bs-elem-thumb-balloon bs-size-10"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">10" Médio</strong>
                <span class="bs-elem-sub">Preenchimento</span>
              </div>
            </div>

            <!-- 12 polegadas -->
            <div class="bs-element-card" data-tool="balloon-12" data-type="balloon-12">
              <div class="bs-elem-thumb-balloon bs-size-12"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">12" Padrão</strong>
                <span class="bs-elem-sub">Volume base</span>
              </div>
            </div>

            <!-- 18 polegadas -->
            <div class="bs-element-card" data-tool="balloon-18" data-type="balloon-18">
              <div class="bs-elem-thumb-balloon bs-size-18"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">18" Destaque</strong>
                <span class="bs-elem-sub">Volume forte</span>
              </div>
            </div>

            <!-- 24 polegadas -->
            <div class="bs-element-card" data-tool="balloon-24" data-type="balloon-24">
              <div class="bs-elem-thumb-balloon bs-size-24"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">24" Gigante</strong>
                <span class="bs-elem-sub">Big Balloon</span>
              </div>
            </div>

            <!-- Cluster Quad -->
            <div class="bs-element-card" data-tool="cluster-quad" data-type="cluster-quad">
              <div class="bs-elem-thumb-cluster"><i></i><i></i><i></i><i></i></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">Cluster 4x</strong>
                <span class="bs-elem-sub">Quad agrupado</span>
              </div>
            </div>

            <!-- Tufo Trio -->
            <div class="bs-element-card" data-tool="cluster-trio" data-type="cluster-trio">
              <div class="bs-elem-thumb-trio"><i></i><i></i><i></i></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">Tufo 3x</strong>
                <span class="bs-elem-sub">Trio mini 5"</span>
              </div>
            </div>
          </div>
        </div>
      `;

      // Clique direto no card: insere a peça imediatamente no centro do cenário
      panel.querySelectorAll('.bs-element-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          const el = e.currentTarget as HTMLElement;
          const type = el.dataset.type as any;
          if (type) {
            this.insertPieceAtCenter(type);
            el.classList.add('bs-card-pulse');
            setTimeout(() => el.classList.remove('bs-card-pulse'), 250);
          }
        });
      });
      return;
    }

    // ABA 3: AJUSTES (VOLUME E MODELOS)
    if (this.activeBottomTab === 'ajustes') {
      panel.innerHTML = `
        <div class="bs-panel-forma">
          <!-- 1. Volume do Arranjo -->
          <div class="bs-label-row">
            <span>Volume do Arranjo:</span>
            <em>${this.currentVolumeLevel === 'enxuto' ? 'Enxuto' : (this.currentVolumeLevel === 'cheio' ? 'Super Cheio' : 'Padrão')}</em>
          </div>
          <div class="bs-segmented-control">
            <button class="bs-seg-btn ${this.currentVolumeLevel === 'enxuto' ? 'active' : ''}" data-volume="enxuto">Enxuto</button>
            <button class="bs-seg-btn ${this.currentVolumeLevel === 'padrao' ? 'active' : ''}" data-volume="padrao">Padrão</button>
            <button class="bs-seg-btn ${this.currentVolumeLevel === 'cheio' ? 'active' : ''}" data-volume="cheio">Super Cheio</button>
          </div>

          <!-- 2. Ações do Arranjo (Botões amplos, sem quebras nem corte) -->
          <div class="bs-ajustes-actions" style="margin-top:12px">
            <button id="bs-btn-forma-append-model" class="bs-btn-ajuste-full" title="Somar outro modelo ao arranjo atual">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Adicionar Modelo</span>
            </button>
            <button id="bs-btn-forma-variar" class="bs-btn-ajuste-full bs-btn-ajuste-secondary" title="Sortear novas posições e mesclas de cores">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
              <span>Variar Arranjo</span>
            </button>
          </div>
        </div>
      `;

      // Volume do arranjo
      panel.querySelectorAll('.bs-seg-btn[data-volume]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const vol = (e.currentTarget as HTMLElement).dataset.volume as any;
          if (vol) this.setVolumeLevel(vol);
        });
      });

      // Variar com confirmação na 1ª vez
      document.getElementById('bs-btn-forma-variar')?.addEventListener('click', () => {
        this.variateColorsAndSizes();
      });

      // Adicionar arranjo modelo à cena
      document.getElementById('bs-btn-forma-append-model')?.addEventListener('click', () => {
        this.toggleSheet('bs-append-model-sheet', true);
      });
    }
  }

  // ----------------------------------------------------------------------
  // AÇÕES DO ARRANJO: INVERTER, VARIAR, VOLUME, FERRAMENTAS
  // ----------------------------------------------------------------------

  private mirrorArrangement(): void {
    if (this.pieces.length === 0) return;
    this.pieces = mirrorArrangementHorizontal(this.pieces);
    this.baseTemplatePieces = mirrorArrangementHorizontal(this.baseTemplatePieces);
    this.saveHistory();
    this.renderCanvas();
    this.updateBalloonPillPosition();
  }

  private variateColorsAndSizes(): void {
    if (!this.hasConfirmedVariar) {
      const ok = window.confirm('Deseja redistribuir as posições e variações dos balões do arranjo?');
      if (!ok) return;
      this.hasConfirmedVariar = true;
    }

    this.pieces = variateArrangement(this.pieces);
    this.saveHistory();
    this.renderCanvas();
  }

  // Ajusta volume alterando APENAS as peças dos modelos, preservando as inseridas pelo usuário
  private setVolumeLevel(volume: 'enxuto' | 'padrao' | 'cheio'): void {
    this.currentVolumeLevel = volume;
    if (this.baseTemplatePieces.length > 0) {
      const userPieces = this.pieces.filter((p) => p.source === 'user');
      const modelTemplatePieces = this.baseTemplatePieces.filter((p) => p.source !== 'user');
      const adjustedModelPieces = applyVolumeLevel(modelTemplatePieces, volume).map((p) => ({
        ...p,
        source: 'model' as const
      }));

      this.pieces = [...adjustedModelPieces, ...userPieces];
      this.saveHistory();
      this.renderCanvas();
    }
    this.renderTabActivePanel();
  }

  private setDistributionMode(mode: 'mesclado' | 'degrade' | 'blocos'): void {
    this.currentDistributionMode = mode;
    this.pieces = distributeColors(this.pieces, mode, this.activeColorCount);
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

    this.pieces.push(...newPieces);
    this.baseTemplatePieces.push(...newPieces);

    this.toggleSheet('bs-append-model-sheet', false);
    this.saveHistory();
    this.computeBaseViewBox();
    this.renderCanvas();
    this.renderTabActivePanel();
  }

  // Atualiza a ferramenta ativa com feedback visual claro e destaque na quick bar

  // Exibe as legendas da barra de ações por 2 segundos ao abrir o estúdio
  private triggerQuickBarPreview(): void {
    const bar = document.getElementById('bs-canvas-quick-bar');
    if (!bar) return;
    bar.classList.add('bs-quick-bar-preview');
    if (this.quickBarPreviewTimer) clearTimeout(this.quickBarPreviewTimer);
    this.quickBarPreviewTimer = window.setTimeout(() => {
      bar.classList.remove('bs-quick-bar-preview');
    }, 2000);
  }

  private setActiveTouchTool(tool: 'adjust' | 'multi-select' | 'pan' | 'eraser' | 'balloon-5' | 'balloon-7' | 'balloon-10' | 'balloon-12' | 'balloon-18' | 'balloon-24' | 'cluster-quad' | 'cluster-trio' | 'base-balloon' | 'light-point' | 'big-balloon'): void {
    this.activeTouchTool = tool;

    // Limpa ponteiros órfãos para evitar travamento de toque
    this.activePointers.clear();
    this.isPanningWithTool = false;
    this.isDragging = false;
    this.isPinching = false;
    this.multiSelectToggleCandidate = null;

    // Atualiza classes do container do canvas para o cursor correto
    const container = document.getElementById('bs-canvas-container');
    if (container) {
      container.classList.toggle('tool-pan', tool === 'pan');
      container.classList.toggle('tool-multiselect', tool === 'multi-select');
      container.classList.toggle('tool-eraser', tool === 'eraser');
      container.classList.remove('is-panning');
    }

    // Atualiza destaque na barra de ações rápidas
    const btnAdjust = document.getElementById('bs-quick-btn-adjust');
    const btnMulti = document.getElementById('bs-quick-btn-multiselect');
    const btnPan = document.getElementById('bs-quick-btn-pan');
    const btnEraser = document.getElementById('bs-quick-btn-eraser');
    if (btnAdjust) btnAdjust.classList.toggle('active', tool === 'adjust');
    if (btnMulti) btnMulti.classList.toggle('active', tool === 'multi-select');
    if (btnPan) btnPan.classList.toggle('active', tool === 'pan');
    if (btnEraser) btnEraser.classList.toggle('active', tool === 'eraser');

    const banner = document.getElementById('bs-tool-active-banner');
    const text = document.getElementById('bs-tool-banner-text');

    if (banner && text) {
      if (tool === 'adjust') {
        banner.style.display = 'none';
      } else {
        banner.style.display = 'flex';
        if (tool === 'multi-select') {
          text.textContent = 'Toque nos balões para selecionar vários';
        } else if (tool === 'pan') {
          text.textContent = 'Arraste com um dedo para mover o cenário';
        } else if (tool === 'eraser') {
          text.textContent = 'Toque em qualquer balão para apagar';
        } else if (tool === 'balloon-5' || tool === 'light-point') {
          text.textContent = 'Toque no cenário para posicionar ponto de luz de 5"';
        } else if (tool === 'balloon-10') {
          text.textContent = 'Toque no cenário para posicionar balão de 10"';
        } else if (tool === 'balloon-12' || tool === 'base-balloon') {
          text.textContent = 'Toque no cenário para posicionar balão de 12"';
        } else if (tool === 'balloon-18' || tool === 'big-balloon') {
          text.textContent = 'Toque no cenário para posicionar balão de 18"';
        } else if (tool === 'balloon-24') {
          text.textContent = 'Toque no cenário para posicionar balão de 24"';
        } else if (tool === 'cluster-quad') {
          text.textContent = 'Toque no cenário para posicionar cluster de 4 balões';
        } else if (tool === 'cluster-trio') {
          text.textContent = 'Toque no cenário para posicionar tufo de 3 balões';
        }
      }
    }

    if (this.activeBottomTab === 'incluir' && this.isBottomDrawerOpen) {
      this.renderTabActivePanel();
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

    if (this.currentScreen === 'editor') {
      this.setScreen('gallery');
      return true;
    }

    this.close();
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

    this.pieces = distributeColors(this.pieces, this.currentDistributionMode, this.activeColorCount);
    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
    this.renderTabActivePanel();
  }

  // Inserção no centro do canvas (usada pelo botão + Inserir)
  private insertPieceAtCenter(type: 'balloon-5' | 'balloon-7' | 'balloon-10' | 'balloon-12' | 'balloon-18' | 'balloon-24' | 'cluster-quad' | 'cluster-trio'): void {
    const cx = this.baseViewBox.x + this.baseViewBox.width / 2 + this.panOffset.x;
    const cy = this.baseViewBox.y + this.baseViewBox.height / 2 + this.panOffset.y;

    if (type === 'cluster-quad') {
      this.insertClusterQuadAt(cx, cy);
    } else if (type === 'cluster-trio') {
      this.insertClusterTrioAt(cx, cy);
    } else {
      const size = type === 'balloon-5' ? 5 : type === 'balloon-7' ? 7 : type === 'balloon-10' ? 10 : type === 'balloon-12' ? 12 : type === 'balloon-18' ? 18 : 24;
      this.insertSingleBalloonAt(cx, cy, size as BalloonSizeInches);
    }
  }

  // Inserção de balão individual (Single-shot: volta para ajustar imediatamente)
  private insertSingleBalloonAt(x: number, y: number, sizeInches: BalloonSizeInches): void {
    const slot = this.activeColorSlot;
    const finish = this.palette.finishes?.[slot as 'A' | 'B' | 'C' | 'D' | 'E'] || (sizeInches === 5 ? 'chrome' : 'satin');
    const newPiece: BalloonPiece = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x,
      y,
      sizeInches,
      slot,
      finish,
      source: 'user'
    };
    this.pieces.push(newPiece);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(newPiece.id);

    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();

    // Volta para ajustar para permitir mover a peça imediatamente
    this.setActiveTouchTool('adjust');
  }

  // Inserção de cluster quad (4 balões)
  private insertClusterQuadAt(x: number, y: number): void {
    const r = 24;
    const baseId = Date.now();
    const activeSlots: BalloonSlot[] = (['A', 'B', 'C', 'D', 'E'] as const).slice(0, this.activeColorCount);
    const clusterPieces: BalloonPiece[] = [
      { id: `c-${baseId}-1`, x: x - r, y: y - r, sizeInches: 10, slot: activeSlots[0] || 'A', finish: 'satin', source: 'user' },
      { id: `c-${baseId}-2`, x: x + r, y: y - r, sizeInches: 10, slot: activeSlots[1] || 'B', finish: 'satin', source: 'user' },
      { id: `c-${baseId}-3`, x: x - r, y: y + r, sizeInches: 10, slot: activeSlots[2] || activeSlots[0] || 'A', finish: 'chrome', source: 'user' },
      { id: `c-${baseId}-4`, x: x + r, y: y + r, sizeInches: 10, slot: activeSlots[3] || activeSlots[1] || 'B', finish: 'matte', source: 'user' },
    ];
    this.pieces.push(...clusterPieces);
    this.selectedPieceIds.clear();
    clusterPieces.forEach((p) => this.selectedPieceIds.add(p.id));
    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();

    this.setActiveTouchTool('adjust');
  }

  // Inserção de tufo trio (3 balões de 5")
  private insertClusterTrioAt(x: number, y: number): void {
    const r = 14;
    const baseId = Date.now();
    const activeSlots: BalloonSlot[] = (['A', 'B', 'C', 'D', 'E'] as const).slice(0, this.activeColorCount);
    const trioPieces: BalloonPiece[] = [
      { id: `t-${baseId}-1`, x, y: y - r * 0.8, sizeInches: 5, slot: activeSlots[0] || 'A', finish: 'chrome', source: 'user' },
      { id: `t-${baseId}-2`, x: x - r * 0.8, y: y + r * 0.6, sizeInches: 5, slot: activeSlots[1] || 'B', finish: 'satin', source: 'user' },
      { id: `t-${baseId}-3`, x: x + r * 0.8, y: y + r * 0.6, sizeInches: 5, slot: activeSlots[2] || activeSlots[0] || 'A', finish: 'chrome', source: 'user' },
    ];
    this.pieces.push(...trioPieces);
    this.selectedPieceIds.clear();
    trioPieces.forEach((p) => this.selectedPieceIds.add(p.id));
    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();

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
    this.saveHistory();
    this.renderCanvas();
    this.hideBalloonPill();
  }

  private setSelectedPieceSlot(slot: BalloonSlot): void {
    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) p.slot = slot;
    });
    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
  }

  private setSelectedPieceSize(size: BalloonSizeInches): void {
    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) p.sizeInches = size;
    });
    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
  }

  private duplicateSelected(): void {
    if (this.selectedPieceIds.size === 0) return;
    const newItems: BalloonPiece[] = [];
    const newIds = new Set<string>();

    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) {
        const cloned: BalloonPiece = {
          ...JSON.parse(JSON.stringify(p)),
          id: `dup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          x: p.x + 16,
          y: p.y + 16,
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
    this.pieces = this.pieces.filter((p) => !this.selectedPieceIds.has(p.id));
    this.selectedPieceIds.clear();

    this.saveHistory();
    this.renderCanvas();
    this.hideBalloonPill();
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
    this.selectedPieceIds.clear();
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

    this.selectedPieceIds.clear();
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
    this.syncPaletteSwatches();
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

      const countsBySize: Record<BalloonSizeInches, number> = { 5: 0, 7: 0, 10: 0, 12: 0, 18: 0, 24: 0 };
      piecesOfSlot.forEach((p) => {
        countsBySize[p.sizeInches]++;
      });

      const sizesBadges = ([24, 18, 12, 10, 7, 5] as BalloonSizeInches[])
        .filter((sz) => countsBySize[sz] > 0)
        .map((sz) => {
          const qty = Math.ceil(countsBySize[sz] * mult);
          return `<span class="bs-size-badge">${sz}" · <u>${qty}</u></span>`;
        })
        .join('');

      return `
        <div class="bs-material-row">
          <span class="bs-material-dot" style="background:${hex}"></span>
          <div class="bs-material-info">
            <b class="bs-material-name">${name}</b>
            <span class="bs-material-finish">${finishLabel[fin]}</span>
          </div>
          <div class="bs-material-sizes">
            ${sizesBadges}
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

      const countsBySize: Record<BalloonSizeInches, number> = { 5: 0, 7: 0, 10: 0, 12: 0, 18: 0, 24: 0 };
      piecesOfSlot.forEach((p) => countsBySize[p.sizeInches]++);

      const sizesStr = ([24, 18, 12, 10, 7, 5] as BalloonSizeInches[])
        .filter((sz) => countsBySize[sz] > 0)
        .map((sz) => `${sz}" × ${Math.ceil(countsBySize[sz] * mult)}`)
        .join(' · ');

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

  private async concludeSave(insertIntoScene: boolean): Promise<void> {
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

    this.toggleSheet('bs-conclude-modal', false);
    this.close();

    if (insertIntoScene && this.onInsertCallback) {
      this.onInsertCallback(savedItem);
    } else if (this.onSavedCallback) {
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

    this.markDirtyAndScheduleAutosave();
  }

  private undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const state = this.history[this.historyIndex];
      this.pieces = JSON.parse(JSON.stringify(state.pieces));
      this.palette = JSON.parse(JSON.stringify(state.palette));
      this.renderCanvas();
      this.syncPaletteSwatches();
      this.renderTabActivePanel();
      this.showBalloonPill();
    }
  }

  private redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const state = this.history[this.historyIndex];
      this.pieces = JSON.parse(JSON.stringify(state.pieces));
      this.palette = JSON.parse(JSON.stringify(state.palette));
      this.renderCanvas();
      this.syncPaletteSwatches();
      this.renderTabActivePanel();
      this.showBalloonPill();
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

  // Verificação Segura ao tentar sair do Estúdio
  public async requestExit(): Promise<boolean> {
    console.log('[BS] requestExit called! isDirty:', this.isDirty, 'hasEverBeenSaved:', this.hasEverBeenSaved);
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
      if (this.isDirty) {
        await this.performAutosave();
      }
    }

    // Se nunca foi salvo (o usuário não fez nada), sai direto sem prompt!
    if (!this.hasEverBeenSaved) {
      this.close();
      this.onExitCallback?.();
      return true;
    }

    // Se o projeto já tem nome personalizado, salva em silêncio e sai direto SEM abrir o modal de renomear!
    if (this.hasCustomName || (this.arrangementTitle && this.arrangementTitle !== 'Novo Arranjo' && this.arrangementTitle !== 'Arranjo de Balões')) {
      if (this.isDirty) {
        await this.performAutosave();
      }
      this.close();
      this.onExitCallback?.();
      return true;
    }

    // Se e somente se o projeto foi salvo automaticamente e ainda está com nome padrão 'Novo Arranjo', pergunta se quer renomear
    const result = await renameModal.prompt({
      currentTitle: this.arrangementTitle,
      itemType: 'arranjo'
    });

    if (result.action === 'cancel') {
      return false; // Cancela a saída, permanece editando
    }

    if (result.action === 'rename' && result.title) {
      this.arrangementTitle = result.title;
      this.hasCustomName = true;
      const titleEl = document.getElementById('bs-editor-current-title');
      if (titleEl) titleEl.textContent = this.arrangementTitle;

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
    } else if (result.action === 'keep') {
      this.hasCustomName = true;
    }

    this.close();
    this.onExitCallback?.();
    return true; // Prossegue com a saída
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
    this.onInsertCallback = options?.onInsert;
    this.onSavedCallback = options?.onSaved;
    this.onExitCallback = options?.onExit;

    this.overlayEl.style.display = 'flex';
    document.body.classList.add('bs-studio-open');
    document.body.classList.add('screen-balloon-studio');

    // Atualiza texto do botão no modal de concluir
    const btnInsert = document.getElementById('bs-btn-confirm-insert-scene');
    if (btnInsert) {
      btnInsert.textContent = this.openedFromScenario ? 'Inserir no Cenário Atual' : 'Criar Cenário com este Arranjo';
    }

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

    this.hasEverBeenSaved = true;
    this.isDirty = false;
    this.history = [];
    this.historyIndex = -1;
    this.saveHistory();

    this.setScreen('editor');
    this.renderCanvas();
    this.syncPaletteSwatches();
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
            <b class="bs-card-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${proj.title}">${proj.title}</b>
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
          if (target.closest('.bs-btn-delete-saved')) return;
          this.loadBalloonProject(proj);
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

  public close(): void {
    if (this.overlayEl) {
      this.overlayEl.style.display = 'none';
      document.body.classList.remove('bs-studio-open');
      document.body.classList.remove('screen-balloon-studio');
      this.hideBalloonPill();
    }
  }

  public isOpen(): boolean {
    return this.overlayEl?.style.display === 'flex';
  }
}
