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
  type BalloonPiece,
  type BalloonPaletteConfig,
  type BalloonSizeInches,
  type BalloonFinish,
  type BalloonSlot,
  type BalloonModelTemplate,
  type ArrangementStats
} from '../core/balloon-studio-engine';
import { addCustomItem } from '../core/db';
import type { PresetItem } from '../types';

export class BalloonStudioModal {
  private overlayEl: HTMLElement | null = null;
  private canvasSvgEl: SVGSVGElement | null = null;

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
    | 'eraser'
    | 'balloon-5'
    | 'balloon-10'
    | 'balloon-12'
    | 'balloon-18'
    | 'balloon-24'
    | 'cluster-quad'
    | 'cluster-trio'
    | 'base-balloon'
    | 'light-point'
    | 'big-balloon' = 'adjust';

  // Aba ativa no dock inferior
  private activeBottomTab: 'forma' | 'cores' | 'incluir' = 'forma';
  private activeColorCount: number = 4;
  private currentGhostGuide: 'none' | 'roman' | 'round' | 'rect' | 'table' = 'none';

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

            <!-- CARD 1: COMEÇAR DO ZERO (EM PRIMEIRO LUGAR - SEM TAGS) -->
            <div id="bs-card-start-zero" class="bs-card-zero" title="Iniciar arranjo em branco">
              <div class="bs-card-zero-icon">✦</div>
              <div class="bs-card-zero-content">
                <b class="bs-card-zero-title">Começar do zero (em branco)</b>
                <span class="bs-card-zero-desc">Monte seu arranjo em um espaço livre sem modelo pré-definido</span>
              </div>
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
                <span class="bs-editor-title-icon">✎</span>
              </div>
            </div>

            <div class="bs-header-right-actions">
              <!-- Desfazer / Refazer -->
              <div class="bs-undo-redo-group">
                <button id="bs-btn-editor-undo" class="bs-btn-header-icon" title="Desfazer (Ctrl+Z)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                  </svg>
                </button>
                <button id="bs-btn-editor-redo" class="bs-btn-header-icon" title="Refazer (Ctrl+Y)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M21 7v6h-6"></path>
                    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
                  </svg>
                </button>
              </div>

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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
                <span>Ajustar</span>
              </button>
              <button id="bs-quick-btn-eraser" class="bs-quick-btn" title="Modo Apagar: toque em qualquer balão para excluir">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>
                <span>Apagar</span>
              </button>
              <button id="bs-quick-btn-mirror" class="bs-quick-btn" title="Inverter o arranjo horizontalmente (espelhar)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                <span>Inverter</span>
              </button>
            </div>
            <button id="bs-btn-reset-view" class="bs-canvas-chip bs-chip-reset" style="display:none" title="Resetar zoom e centralizar">
              <span>↺ <span id="bs-zoom-level-badge">100%</span></span>
            </button>
            <button id="bs-chip-shopping" class="bs-canvas-chip bs-chip-shop" title="Ver lista de compras de balões">
              <span>🎈 <span id="bs-chip-count-label">0 balões</span> ›</span>
            </button>

            <!-- Banner de Ferramenta Ativa -->
            <div id="bs-tool-active-banner" class="bs-tool-banner" style="display:none">
              <span id="bs-tool-banner-text">Toque no arco para encaixar</span>
            </div>

            <!-- Estado Vazio (quando tela estiver em branco) -->
            <div id="bs-canvas-empty-state" class="bs-canvas-empty-state" style="display:none">
              <div class="bs-empty-state-icon">🎈</div>
              <p class="bs-empty-state-text">Sua tela está livre</p>
              <span class="bs-empty-state-sub">Toque para adicionar seu primeiro cluster ou balão</span>
            </div>

            <!-- SVG Interativo -->
            <svg id="bs-canvas-svg" class="bs-canvas-svg" xmlns="http://www.w3.org/2000/svg">
              <defs id="bs-svg-defs"></defs>
              <g id="bs-backdrop-sketch-layer"></g>
              <g id="bs-balloons-layer"></g>
              <g id="bs-highlight-layer"></g>
            </svg>

            <!-- Pílula Flutuante no Balão Selecionado -->
            <div id="bs-floating-balloon-pill" class="bs-balloon-pill" style="display:none">
              <button id="bs-pill-color-btn" class="bs-pill-btn" title="Mudar cor desta família">
                <span id="bs-pill-swatch-dot" class="bs-pill-swatch-dot"></span>
                <span id="bs-pill-color-name">Cor</span>
                <small>▾</small>
              </button>
              <button id="bs-pill-size-btn" class="bs-pill-btn" title="Mudar tamanho">
                <span id="bs-pill-size-text">12"</span>
                <small>▾</small>
              </button>
              <button id="bs-pill-dup-btn" class="bs-pill-btn" title="Duplicar">⧉</button>
              <button id="bs-pill-del-btn" class="bs-pill-btn bs-pill-btn-danger" title="Excluir">🗑</button>
            </div>
          </main>

          <!-- Faixa da Paleta (Cores da Festa) -->
          <section class="bs-palette-strip">
            <div class="bs-swatches-row" id="bs-swatches-container">
              <!-- Swatches A, B, C, D gerados dinamicamente -->
            </div>

          </section>

          <!-- Painel Ativo da Aba -->
          <section class="bs-tab-panel" id="bs-tab-active-panel">
            <!-- Conteúdo injetado dinamicamente: Forma, Cores ou Retoques -->
          </section>

          <!-- Dock Inferior com 3 Abas -->
          <nav class="bs-tabs-dock">
            <button class="bs-dock-tab active" data-tab="forma">
              <span class="bs-dock-tab-icon">🧩</span>
              <span>Modelos & Forma</span>
            </button>
            <button class="bs-dock-tab" data-tab="cores">
              <span class="bs-dock-tab-icon">🎨</span>
              <span>Cores</span>
            </button>
            <button class="bs-dock-tab" data-tab="incluir">
              <span class="bs-dock-tab-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="9"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </span>
              <span>Incluir</span>
            </button>
          </nav>
        </section>

        <!-- ======================================================= -->
        <!-- 3. GAVETAS / BOTTOM SHEETS                             -->
        <!-- ======================================================= -->

        <!-- Gaveta: Trocar Cor & Acabamento da Família -->
        <div id="bs-color-sheet" class="bs-sheet-dim" style="display:none">
          <div class="bs-bottom-sheet">
            <div class="bs-sheet-grabber"></div>
            <div class="bs-sheet-header">
              <h3 class="bs-sheet-title" id="bs-color-sheet-title">Editar Cor da Família</h3>
              <button id="bs-btn-close-color-sheet" class="bs-sheet-close">✕</button>
            </div>
            <div class="bs-sheet-body">
              <div class="bs-label-row" style="margin-bottom:8px">
                <span>Acabamento do Látex:</span>
              </div>
              <div class="bs-finishes-selector" id="bs-sheet-finishes-grid">
                <button class="bs-finish-btn-chip active" data-finish="satin">Acetinado</button>
                <button class="bs-finish-btn-chip" data-finish="matte">Fosco</button>
                <button class="bs-finish-btn-chip" data-finish="chrome">Cromado ✨</button>
                <button class="bs-finish-btn-chip" data-finish="crystal">Cristal</button>
                <button class="bs-finish-btn-chip" data-finish="glitter">Glitter</button>
              </div>

              <!-- Cor Personalizada (Posicionada Acima de Cores da Moda) -->
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
          </div>
        </div>

        <!-- Gaveta: Lista de Materiais e WhatsApp -->
        <div id="bs-shopping-modal" class="bs-sheet-dim" style="display:none">
          <div class="bs-bottom-sheet">
            <div class="bs-sheet-grabber"></div>
            <div class="bs-sheet-header">
              <h3 class="bs-sheet-title">Lista de Balões & Material</h3>
              <button id="bs-btn-close-shopping" class="bs-sheet-close">✕</button>
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
                  📋 Copiar Lista
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
              <h3 class="bs-sheet-title">Ficou Lindo ✨</h3>
              <button id="bs-btn-close-conclude" class="bs-sheet-close">✕</button>
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
                🎈 Ver Lista de Materiais (<span id="bs-link-count">0</span> balões)
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
    document.getElementById('bs-btn-close-gallery')?.addEventListener('click', () => this.close());

    // Card de Começar do Zero (Em Primeiro Lugar)
    document.getElementById('bs-card-start-zero')?.addEventListener('click', () => {
      this.startFromScratch();
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

    // 2. Ações do Topo do Editor
    document.getElementById('bs-btn-back-to-gallery')?.addEventListener('click', () => {
      this.setScreen('gallery');
    });

    document.getElementById('bs-editor-title-container')?.addEventListener('click', () => {
      const novo = prompt('Nome do arranjo:', this.arrangementTitle);
      if (novo && novo.trim()) {
        this.arrangementTitle = novo.trim();
        const el = document.getElementById('bs-editor-current-title');
        if (el) el.textContent = this.arrangementTitle;
      }
    });

    document.getElementById('bs-btn-editor-undo')?.addEventListener('click', () => this.undo());
    document.getElementById('bs-btn-editor-redo')?.addEventListener('click', () => this.redo());

    document.getElementById('bs-btn-conclude-flow')?.addEventListener('click', () => {
      this.openConcludeModal();
    });

    // 3. Chips do Canvas
    document.getElementById('bs-quick-btn-mirror')?.addEventListener('click', () => {
      this.mirrorArrangement();
    });
    document.getElementById('bs-quick-btn-adjust')?.addEventListener('click', () => {
      this.setActiveTouchTool('adjust');
    });
    document.getElementById('bs-quick-btn-eraser')?.addEventListener('click', () => {
      this.setActiveTouchTool(this.activeTouchTool === 'eraser' ? 'adjust' : 'eraser');
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
      // Cicla entre tamanhos 5", 10", 12", 18", 24"
      const sizes: BalloonSizeInches[] = [5, 10, 12, 18, 24];
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



    // 6. Dock de Abas Inferiores
    this.overlayEl.querySelectorAll('.bs-dock-tab').forEach((tabBtn) => {
      tabBtn.addEventListener('click', (e) => {
        const btn = e.currentTarget as HTMLElement;
        const tab = btn.dataset.tab as 'forma' | 'cores' | 'incluir';
        if (tab) this.setBottomTab(tab);
      });
    });

    // 7. Gavetas Modais (Fechar e Ações)
    document.getElementById('bs-btn-close-color-sheet')?.addEventListener('click', () => this.toggleSheet('bs-color-sheet', false));
    document.getElementById('bs-btn-close-shopping')?.addEventListener('click', () => this.toggleSheet('bs-shopping-modal', false));
    document.getElementById('bs-btn-close-conclude')?.addEventListener('click', () => this.toggleSheet('bs-conclude-modal', false));

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
      if (hex) this.updateSlotColorAndName(this.editingColorSlot, hex, 'Cor Customizada');
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
      this.renderTabActivePanel();
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

      // Execução conforme a ferramenta ativa
      if (this.activeTouchTool === 'eraser') {
        if (pieceGroup) {
          const pieceId = pieceGroup.id.replace('piece-', '');
          this.deletePieceById(pieceId);
        }
        return;
      }

      if (this.activeTouchTool === 'balloon-5' || this.activeTouchTool === 'light-point') {
        const svgCoords = this.screenToSvgCoordinates(e.clientX, e.clientY);
        this.insertSingleBalloonAt(svgCoords.x, svgCoords.y, 5);
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

      // Ferramenta 'adjust' (padrão)
      if (pieceGroup) {
        const pieceId = pieceGroup.id.replace('piece-', '');
        this.selectedPieceIds.clear();
        this.selectedPieceIds.add(pieceId);
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

      // Arraste de peça com 1 único dedo
      if (this.isDragging && e.pointerId === this.dragPointerId && this.activePointers.size === 1) {
        const svgPt = this.screenToSvgCoordinates(e.clientX, e.clientY);
        const dx = svgPt.x - this.dragStartSvgX;
        const dy = svgPt.y - this.dragStartSvgY;

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

      if (this.activePointers.size < 2 && this.isPinching) {
        this.isPinching = false;
        // Cooldown de 240ms pós-pinça
        this.multiTouchCooldown = Date.now() + 240;
      }

      if (this.isDragging && e.pointerId === this.dragPointerId) {
        this.isDragging = false;
        this.dragPointerId = null;
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}
        this.saveHistory();
        this.renderCanvas(true);
        this.updateBalloonPillPosition();
      }
    };

    canvas.addEventListener('pointerup', onPointerEnd);
    canvas.addEventListener('pointercancel', onPointerEnd);

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
    this.renderBackdropSketchGuide();

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
    const p = this.getActiveSelectedPiece();
    if (!pill || !p) return;

    const colorDot = document.getElementById('bs-pill-swatch-dot');
    const colorName = document.getElementById('bs-pill-color-name');
    const sizeText = document.getElementById('bs-pill-size-text');

    const slotHex = (this.palette as any)[p.slot] || '#c97a8e';
    const slotFriendlyName = this.palette.names?.[p.slot as 'A' | 'B' | 'C' | 'D'] || `Cor ${p.slot}`;

    if (colorDot) colorDot.style.background = slotHex;
    if (colorName) colorName.textContent = slotFriendlyName;
    if (sizeText) sizeText.textContent = `${p.sizeInches}"`;

    pill.style.display = 'flex';
    this.updateBalloonPillPosition();
  }

  private hideBalloonPill(): void {
    const pill = document.getElementById('bs-floating-balloon-pill');
    if (pill) pill.style.display = 'none';
  }

  private updateBalloonPillPosition(): void {
    const pill = document.getElementById('bs-floating-balloon-pill');
    const p = this.getActiveSelectedPiece();
    if (!pill || !p || !this.canvasSvgEl || pill.style.display === 'none') return;

    const r = BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28;
    const pt = this.canvasSvgEl.createSVGPoint();
    pt.x = p.x;
    pt.y = p.y - r - 8;

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
    const container = document.getElementById('bs-swatches-container');
    if (!container) return;

    const allSlots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
    const activeSlots = allSlots.slice(0, this.activeColorCount);
    container.innerHTML = activeSlots.map((s) => {
      const hex = (this.palette as any)[s] || (s === 'E' ? '#f8fafc' : '#ffffff');
      const name = this.palette.names?.[s] || `Cor ${s}`;
      const activeClass = this.activeColorSlot === s ? 'active' : '';

      return `
        <div class="bs-palette-swatch ${activeClass}" data-slot="${s}" title="Família ${s} (${name})">
          <span class="bs-swatch-circle" style="background:${hex}"></span>
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

  private openColorSheet(slot: BalloonSlot): void {
    this.editingColorSlot = slot;
    const titleEl = document.getElementById('bs-color-sheet-title');
    const currentName = this.palette.names?.[slot as 'A' | 'B' | 'C' | 'D'] || `Slot ${slot}`;
    if (titleEl) titleEl.textContent = `Editar ${currentName} (${slot})`;

    const currentFin = this.palette.finishes?.[slot as 'A' | 'B' | 'C' | 'D'] || 'satin';
    this.overlayEl?.querySelectorAll('.bs-finish-btn-chip').forEach((c) => {
      c.classList.toggle('active', (c as HTMLElement).dataset.finish === currentFin);
    });

    const customInput = document.getElementById('bs-custom-color-input') as HTMLInputElement | null;
    if (customInput) customInput.value = (this.palette as any)[slot] || '#c97a8e';

    this.toggleSheet('bs-color-sheet', true);
  }

  private updateSlotColorAndName(slot: BalloonSlot, hex: string, name: string): void {
    (this.palette as any)[slot] = hex;
    if (!this.palette.names) this.palette.names = { A: '', B: '', C: '', D: '' };
    this.palette.names[slot as 'A' | 'B' | 'C' | 'D'] = name;

    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
    this.showBalloonPill();
  }

  private updateSlotFinish(slot: BalloonSlot, finish: BalloonFinish): void {
    if (!this.palette.finishes) this.palette.finishes = { A: 'satin', B: 'satin', C: 'chrome', D: 'matte' };
    this.palette.finishes[slot as 'A' | 'B' | 'C' | 'D'] = finish;

    // Atualiza o acabamento de todas as peças pertencentes a esta família
    this.pieces.forEach((p) => {
      if (p.slot === slot) p.finish = finish;
    });

    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
  }

  // ----------------------------------------------------------------------
  // DOCK DE 3 ABAS: MODELOS & FORMA, CORES, RETOQUES
  // ----------------------------------------------------------------------

  private setBottomTab(tab: 'forma' | 'cores' | 'incluir'): void {
    this.activeBottomTab = tab;
    this.overlayEl?.querySelectorAll('.bs-dock-tab').forEach((b) => {
      const btn = b as HTMLElement;
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    this.renderTabActivePanel();
  }

  private renderTabActivePanel(): void {
    const panel = document.getElementById('bs-tab-active-panel');
    if (!panel) return;

    if (this.activeBottomTab === 'forma') {
      panel.innerHTML = `
        <div class="bs-panel-forma">
          <div class="bs-label-row">
            <span>Volume do Arranjo:</span>
            <em>${this.currentVolumeLevel === 'enxuto' ? 'Enxuto' : (this.currentVolumeLevel === 'cheio' ? 'Super Cheio' : 'Padrão')}</em>
          </div>
          <div class="bs-segmented-control">
            <button class="bs-seg-btn ${this.currentVolumeLevel === 'enxuto' ? 'active' : ''}" data-volume="enxuto">Enxuto</button>
            <button class="bs-seg-btn ${this.currentVolumeLevel === 'padrao' ? 'active' : ''}" data-volume="padrao">Padrão</button>
            <button class="bs-seg-btn ${this.currentVolumeLevel === 'cheio' ? 'active' : ''}" data-volume="cheio">Super Cheio</button>
          </div>

          <div class="bs-actions-forma-grid">
            <button id="bs-btn-forma-mirror" class="bs-btn-action-forma">
              <span>⇄ Inverter</span>
            </button>
            <button id="bs-btn-forma-variar" class="bs-btn-action-forma" title="Sorteia variações de cores e harmonia">
              <span>🎲 Variar</span>
            </button>
            <button id="bs-btn-forma-trocar" class="bs-btn-action-forma">
              <span>✦ Trocar Base</span>
            </button>
          </div>
        </div>
      `;

      panel.querySelectorAll('.bs-seg-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const vol = (e.currentTarget as HTMLElement).dataset.volume as any;
          if (vol) this.setVolumeLevel(vol);
        });
      });

      document.getElementById('bs-btn-forma-mirror')?.addEventListener('click', () => this.mirrorArrangement());
      document.getElementById('bs-btn-forma-variar')?.addEventListener('click', () => this.variateColorsAndSizes());
      document.getElementById('bs-btn-forma-trocar')?.addEventListener('click', () => this.setScreen('gallery'));
      return;
    }

    if (this.activeBottomTab === 'cores') {
      panel.innerHTML = `
        <div class="bs-panel-cores">
          <div class="bs-label-row">
            <span>Quantidade de Cores no Arranjo:</span>
            <em id="bs-active-color-count-label">${this.activeColorCount} cores</em>
          </div>
          <div class="bs-segmented-control" id="bs-color-count-selector">
            <button class="bs-seg-btn ${this.activeColorCount === 2 ? 'active' : ''}" data-color-count="2">2 Cores</button>
            <button class="bs-seg-btn ${this.activeColorCount === 3 ? 'active' : ''}" data-color-count="3">3 Cores</button>
            <button class="bs-seg-btn ${this.activeColorCount === 4 ? 'active' : ''}" data-color-count="4">4 Cores</button>
            <button class="bs-seg-btn ${this.activeColorCount === 5 ? 'active' : ''}" data-color-count="5">5 Cores</button>
          </div>

          <div class="bs-label-row" style="margin-top:12px">
            <span>Paletas da Festa:</span>
            <em>Toque para aplicar</em>
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

          <div class="bs-label-row" style="margin-top:12px">
            <span>Modo de Distribuição das Cores:</span>
          </div>
          <div class="bs-segmented-control">
            <button class="bs-seg-btn ${this.currentDistributionMode === 'mesclado' ? 'active' : ''}" data-mode="mesclado">Mesclado</button>
            <button class="bs-seg-btn ${this.currentDistributionMode === 'degrade' ? 'active' : ''}" data-mode="degrade">Degradê</button>
            <button class="bs-seg-btn ${this.currentDistributionMode === 'blocos' ? 'active' : ''}" data-mode="blocos">Blocos</button>
          </div>
        </div>
      `;

      // Seleção de Quantidade de Cores (2 a 5)
      panel.querySelectorAll('#bs-color-count-selector .bs-seg-btn').forEach((btn) => {
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

    if (this.activeBottomTab === 'incluir') {
      panel.innerHTML = `
        <div class="bs-panel-incluir">
          <!-- 1. Estrutura de Fundo (Sketch Guia) -->
          <div class="bs-label-row">
            <span>Estrutura / Painel de Fundo:</span>
            <em id="bs-active-guide-label">${
              this.currentGhostGuide === 'roman' ? 'Romano' :
              this.currentGhostGuide === 'round' ? 'Redondo' :
              this.currentGhostGuide === 'rect' ? 'Retangular' :
              this.currentGhostGuide === 'table' ? 'Mesa' : 'Nenhum'
            }</em>
          </div>
          <div class="bs-guides-selector">
            <button class="bs-guide-btn-chip ${this.currentGhostGuide === 'none' ? 'active' : ''}" data-guide="none">
              <span class="bs-guide-icon">✕</span>
              <span>Nenhum</span>
            </button>
            <button class="bs-guide-btn-chip ${this.currentGhostGuide === 'roman' ? 'active' : ''}" data-guide="roman">
              <span class="bs-guide-icon">∩</span>
              <span>Romano</span>
            </button>
            <button class="bs-guide-btn-chip ${this.currentGhostGuide === 'round' ? 'active' : ''}" data-guide="round">
              <span class="bs-guide-icon">◯</span>
              <span>Redondo</span>
            </button>
            <button class="bs-guide-btn-chip ${this.currentGhostGuide === 'rect' ? 'active' : ''}" data-guide="rect">
              <span class="bs-guide-icon">▭</span>
              <span>Pórtico</span>
            </button>
            <button class="bs-guide-btn-chip ${this.currentGhostGuide === 'table' ? 'active' : ''}" data-guide="table">
              <span class="bs-guide-icon">⬭</span>
              <span>Mesa</span>
            </button>
          </div>

          <!-- 2. Adicionar Balões e Peças -->
          <div class="bs-label-row" style="margin-top:12px">
            <span>Adicionar Peças ao Arranjo:</span>
            <em>Toque e posicione no canvas</em>
          </div>
          <div class="bs-elements-catalog-grid">
            <div class="bs-element-card ${this.activeTouchTool === 'balloon-5' ? 'active' : ''}" data-tool="balloon-5">
              <div class="bs-elem-thumb-balloon bs-size-5"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">5" Detalhe</strong>
                <span class="bs-elem-sub">Ponto de luz</span>
              </div>
            </div>

            <div class="bs-element-card ${this.activeTouchTool === 'balloon-10' ? 'active' : ''}" data-tool="balloon-10">
              <div class="bs-elem-thumb-balloon bs-size-10"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">10" Médio</strong>
                <span class="bs-elem-sub">Preenchimento</span>
              </div>
            </div>

            <div class="bs-element-card ${this.activeTouchTool === 'balloon-12' ? 'active' : ''}" data-tool="balloon-12">
              <div class="bs-elem-thumb-balloon bs-size-12"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">12" Padrão</strong>
                <span class="bs-elem-sub">Volume base</span>
              </div>
            </div>

            <div class="bs-element-card ${this.activeTouchTool === 'balloon-18' ? 'active' : ''}" data-tool="balloon-18">
              <div class="bs-elem-thumb-balloon bs-size-18"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">18" Destaque</strong>
                <span class="bs-elem-sub">Volume forte</span>
              </div>
            </div>

            <div class="bs-element-card ${this.activeTouchTool === 'balloon-24' ? 'active' : ''}" data-tool="balloon-24">
              <div class="bs-elem-thumb-balloon bs-size-24"></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">24" Gigante</strong>
                <span class="bs-elem-sub">Big Balloon</span>
              </div>
            </div>

            <div class="bs-element-card ${this.activeTouchTool === 'cluster-quad' ? 'active' : ''}" data-tool="cluster-quad">
              <div class="bs-elem-thumb-cluster"><i></i><i></i><i></i><i></i></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">Cluster 4x</strong>
                <span class="bs-elem-sub">Quad agrupado</span>
              </div>
            </div>

            <div class="bs-element-card ${this.activeTouchTool === 'cluster-trio' ? 'active' : ''}" data-tool="cluster-trio">
              <div class="bs-elem-thumb-trio"><i></i><i></i><i></i></div>
              <div class="bs-elem-info">
                <strong class="bs-elem-title">Tufo 3x</strong>
                <span class="bs-elem-sub">Trio mini 5"</span>
              </div>
            </div>
          </div>
        </div>
      `;

      // Seleção de Sketch Guia
      panel.querySelectorAll('.bs-guide-btn-chip').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const guide = (e.currentTarget as HTMLElement).dataset.guide as any;
          if (guide) {
            this.currentGhostGuide = guide;
            panel.querySelectorAll('.bs-guide-btn-chip').forEach((b) => b.classList.remove('active'));
            (e.currentTarget as HTMLElement).classList.add('active');
            const label = document.getElementById('bs-active-guide-label');
            if (label) {
              label.textContent = guide === 'roman' ? 'Romano' :
                guide === 'round' ? 'Redondo' :
                guide === 'rect' ? 'Retangular' :
                guide === 'table' ? 'Mesa' : 'Nenhum';
            }
            this.renderBackdropSketchGuide();
          }
        });
      });

      // Seleção de Ferramenta de Inserção de Peças
      panel.querySelectorAll('.bs-element-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          const tool = (e.currentTarget as HTMLElement).dataset.tool as any;
          if (tool) this.setActiveTouchTool(tool);
        });
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
    this.pieces = variateArrangement(this.pieces);
    this.saveHistory();
    this.renderCanvas();
  }

  private setVolumeLevel(volume: 'enxuto' | 'padrao' | 'cheio'): void {
    this.currentVolumeLevel = volume;
    if (this.baseTemplatePieces.length > 0) {
      this.pieces = applyVolumeLevel(this.baseTemplatePieces, volume);
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

  private setActiveTouchTool(tool: 'adjust' | 'base-balloon' | 'light-point' | 'big-balloon' | 'cluster-quad' | 'eraser'): void {
    this.activeTouchTool = tool;
    const banner = document.getElementById('bs-tool-active-banner');
    const text = document.getElementById('bs-tool-banner-text');

    if (banner && text) {
      if (tool === 'adjust') {
        banner.style.display = 'none';
      } else {
        banner.style.display = 'block';
        if (tool === 'base-balloon') text.textContent = '⚪ Toque para adicionar um balão de 12"';
        else if (tool === 'light-point') text.textContent = '✨ Toque no arco para encaixar um ponto de luz de 5"';
        else if (tool === 'big-balloon') text.textContent = '🎈 Toque para adicionar um Big Balloon de 18"';
        else if (tool === 'cluster-quad') text.textContent = '🫧 Toque para adicionar um cluster de 4 balões';
        else if (tool === 'eraser') text.textContent = '🧽 Toque em qualquer balão para apagar';
      }
    }
    this.renderTabActivePanel();
  }

  // Inserção direta de balão base 12"

  // Navegação Segura no Mobile (Interceptação do Botão Voltar)
  public handleBackNavigation(): boolean {
    // 1. Se alguma gaveta/modal interna estiver aberta, fecha apenas a gaveta
    const openSheets = ['bs-color-sheet', 'bs-shopping-modal', 'bs-conclude-modal'];
    for (const sheetId of openSheets) {
      const el = document.getElementById(sheetId);
      if (el && el.style.display === 'flex') {
        this.toggleSheet(sheetId, false);
        return true;
      }
    }

    // 2. Se estiver na tela de edição, volta para a galeria de modelos
    if (this.currentScreen === 'editor') {
      this.setScreen('gallery');
      return true;
    }

    // 3. Se estiver na galeria inicial, fecha o estúdio com segurança
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

    // Redistribui as peças existentes para que respeitem o novo limite de cores
    this.pieces = distributeColors(this.pieces, this.currentDistributionMode, this.activeColorCount);
    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
    this.renderTabActivePanel();
  }

  // Renderiza o esboço arquitetural/guia de fundo para apoio visual
  private renderBackdropSketchGuide(): void {
    const layer = document.getElementById('bs-backdrop-sketch-layer');
    if (!layer) return;

    if (this.currentGhostGuide === 'none' || this.pieces.length === 0) {
      layer.innerHTML = '';
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

    if (minX === Infinity) {
      minX = 120; maxX = 320; minY = 80; maxY = 420;
    }

    const cx = Math.round((minX + maxX) / 2);
    const baseY = Math.round(maxY + 4);
    const archW = Math.max(160, Math.min(270, Math.round((maxX - minX) * 0.95)));
    const archH = Math.max(260, Math.min(440, Math.round((maxY - minY) * 1.05)));
    const topY = baseY - archH;

    let sketchHtml = '';
    const strokeColor = '#a8a29e';
    const fillColor = 'rgba(245, 245, 244, 0.40)';

    if (this.currentGhostGuide === 'roman') {
      const rx = Math.round(archW / 2);
      const left = cx - rx;
      const right = cx + rx;
      const arcCenterY = topY + rx;
      const d = `M ${left} ${baseY} L ${left} ${arcCenterY} A ${rx} ${rx} 0 0 1 ${right} ${arcCenterY} L ${right} ${baseY} Z`;
      sketchHtml = `
        <path d="${d}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="7 5" opacity="0.8"/>
        <text x="${cx}" y="${arcCenterY + 45}" fill="#78716c" font-size="11.5" font-weight="600" text-anchor="middle" opacity="0.75">Painel Romano (100×200cm)</text>
      `;
    } else if (this.currentGhostGuide === 'round') {
      const r = Math.round(Math.min(archW, archH) * 0.52);
      const centerCY = Math.round(topY + r + 15);
      sketchHtml = `
        <circle cx="${cx}" cy="${centerCY}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="7 5" opacity="0.8"/>
        <line x1="${cx}" y1="${centerCY + r}" x2="${cx}" y2="${baseY}" stroke="${strokeColor}" stroke-width="2.2" stroke-dasharray="5 4" opacity="0.6"/>
        <line x1="${cx - 36}" y1="${baseY}" x2="${cx + 36}" y2="${baseY}" stroke="${strokeColor}" stroke-width="2.5" opacity="0.7"/>
        <text x="${cx}" y="${centerCY}" fill="#78716c" font-size="11.5" font-weight="600" text-anchor="middle" opacity="0.75">Painel Redondo (150cm)</text>
      `;
    } else if (this.currentGhostGuide === 'rect') {
      const rx = Math.round(archW / 2);
      const left = cx - rx;
      sketchHtml = `
        <rect x="${left}" y="${topY}" width="${archW}" height="${archH}" rx="6" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="7 5" opacity="0.8"/>
        <text x="${cx}" y="${topY + 38}" fill="#78716c" font-size="11.5" font-weight="600" text-anchor="middle" opacity="0.75">Arco Retangular (120×210cm)</text>
      `;
    } else if (this.currentGhostGuide === 'table') {
      const tw = Math.round(Math.max(140, archW * 0.75));
      const th = Math.round(Math.min(180, archH * 0.45));
      const tTop = baseY - th;
      const rx = Math.round(tw / 2);
      sketchHtml = `
        <ellipse cx="${cx}" cy="${tTop}" rx="${rx}" ry="15" fill="rgba(240, 238, 233, 0.6)" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="6 4" opacity="0.85"/>
        <path d="M ${cx - rx} ${tTop} L ${cx - rx} ${baseY} A ${rx} 15 0 0 0 ${cx + rx} ${baseY} L ${cx + rx} ${tTop}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="6 4" opacity="0.75"/>
        <text x="${cx}" y="${tTop + Math.round(th / 2)}" fill="#78716c" font-size="11.5" font-weight="600" text-anchor="middle" opacity="0.75">Mesa Cilíndrica (50×80cm)</text>
      `;
    }

    layer.innerHTML = sketchHtml;
  }

  // Inserção de balão individual de qualquer tamanho
  private insertSingleBalloonAt(x: number, y: number, sizeInches: BalloonSizeInches): void {
    const slot = this.activeColorSlot;
    const finish = this.palette.finishes?.[slot as 'A' | 'B' | 'C' | 'D' | 'E'] || (sizeInches === 5 ? 'chrome' : 'satin');
    const newPiece: BalloonPiece = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x,
      y,
      sizeInches,
      slot,
      finish
    };
    this.pieces.push(newPiece);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(newPiece.id);

    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
  }

  private insertClusterQuadAt(x: number, y: number): void {
    const r = 24;
    const baseId = Date.now();
    const activeSlots: BalloonSlot[] = (['A', 'B', 'C', 'D', 'E'] as const).slice(0, this.activeColorCount);
    const clusterPieces: BalloonPiece[] = [
      { id: `c-${baseId}-1`, x: x - r, y: y - r, sizeInches: 10, slot: activeSlots[0] || 'A', finish: 'satin' },
      { id: `c-${baseId}-2`, x: x + r, y: y - r, sizeInches: 10, slot: activeSlots[1] || 'B', finish: 'satin' },
      { id: `c-${baseId}-3`, x: x - r, y: y + r, sizeInches: 10, slot: activeSlots[2] || activeSlots[0] || 'A', finish: 'chrome' },
      { id: `c-${baseId}-4`, x: x + r, y: y + r, sizeInches: 10, slot: activeSlots[3] || activeSlots[1] || 'B', finish: 'matte' },
    ];
    this.pieces.push(...clusterPieces);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(clusterPieces[0].id);
    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
  }

  private insertClusterTrioAt(x: number, y: number): void {
    const r = 14;
    const baseId = Date.now();
    const activeSlots: BalloonSlot[] = (['A', 'B', 'C', 'D', 'E'] as const).slice(0, this.activeColorCount);
    const trioPieces: BalloonPiece[] = [
      { id: `t-${baseId}-1`, x, y: y - r * 0.8, sizeInches: 5, slot: activeSlots[0] || 'A', finish: 'chrome' },
      { id: `t-${baseId}-2`, x: x - r * 0.8, y: y + r * 0.6, sizeInches: 5, slot: activeSlots[1] || 'B', finish: 'satin' },
      { id: `t-${baseId}-3`, x: x + r * 0.8, y: y + r * 0.6, sizeInches: 5, slot: activeSlots[2] || activeSlots[0] || 'A', finish: 'chrome' },
    ];
    this.pieces.push(...trioPieces);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(trioPieces[0].id);
    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
  }

  private insertBaseBalloonAt(x: number, y: number): void {
    const newPiece: BalloonPiece = {
      id: `base-${Date.now()}`,
      x,
      y,
      sizeInches: 12,
      slot: this.activeColorSlot,
      finish: this.palette.finishes?.[this.activeColorSlot as 'A' | 'B' | 'C' | 'D'] || 'satin'
    };
    this.pieces.push(newPiece);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(newPiece.id);

    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
  }

  // Inserção direta de cluster quad (4 balões de 10")
  private insertClusterAt(x: number, y: number): void {
    const r = 24;
    const baseId = Date.now();
    const clusterPieces: BalloonPiece[] = [
      { id: `c-${baseId}-1`, x: x - r, y: y - r, sizeInches: 10, slot: 'A', finish: this.palette.finishes?.A || 'satin' },
      { id: `c-${baseId}-2`, x: x + r, y: y - r, sizeInches: 10, slot: 'B', finish: this.palette.finishes?.B || 'satin' },
      { id: `c-${baseId}-3`, x: x - r, y: y + r, sizeInches: 10, slot: 'C', finish: this.palette.finishes?.C || 'chrome' },
      { id: `c-${baseId}-4`, x: x + r, y: y + r, sizeInches: 10, slot: 'D', finish: this.palette.finishes?.D || 'matte' },
    ];
    this.pieces.push(...clusterPieces);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(clusterPieces[0].id);

    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
  }

  // Inserção direta no ponto clicado
  private insertPointOfLightAt(x: number, y: number): void {
    const newPiece: BalloonPiece = {
      id: `light-${Date.now()}`,
      x,
      y,
      sizeInches: 5,
      slot: this.activeColorSlot,
      finish: this.palette.finishes?.[this.activeColorSlot as 'A' | 'B' | 'C' | 'D'] || 'chrome'
    };
    this.pieces.push(newPiece);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(newPiece.id);

    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
  }

  private insertBigBalloonAt(x: number, y: number): void {
    const newPiece: BalloonPiece = {
      id: `big-${Date.now()}`,
      x,
      y,
      sizeInches: 18,
      slot: this.activeColorSlot,
      finish: this.palette.finishes?.[this.activeColorSlot as 'A' | 'B' | 'C' | 'D'] || 'satin'
    };
    this.pieces.push(newPiece);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(newPiece.id);

    this.saveHistory();
    this.renderCanvas();
    this.showBalloonPill();
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
    const p = this.getActiveSelectedPiece();
    if (!p) return;
    const newPiece: BalloonPiece = {
      ...JSON.parse(JSON.stringify(p)),
      id: `dup-${Date.now()}`,
      x: p.x + 14,
      y: p.y + 14
    };
    this.pieces.push(newPiece);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(newPiece.id);

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
    this.arrangementTitle = 'Novo Arranjo';
    const el = document.getElementById('bs-editor-current-title');
    if (el) el.textContent = this.arrangementTitle;

    // Inicia com um cluster base acolhedor de 4 balões no centro
    this.pieces = [
      { id: 'c1', x: 230, y: 230, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'c2', x: 260, y: 220, sizeInches: 12, slot: 'B', finish: 'satin' },
      { id: 'c3', x: 240, y: 250, sizeInches: 12, slot: 'C', finish: 'chrome' },
      { id: 'c4', x: 270, y: 250, sizeInches: 10, slot: 'D', finish: 'matte' },
      { id: 'c5', x: 252, y: 236, sizeInches: 5, slot: 'C', finish: 'chrome' }
    ];
    this.baseTemplatePieces = JSON.parse(JSON.stringify(this.pieces));
    this.selectedPieceIds.clear();
    this.history = [];
    this.historyIndex = -1;
    this.saveHistory();

    this.setScreen('editor');
    this.computeBaseViewBox();
  }

  public loadTemplate(templateId: string): void {
    const tmpl = BALLOON_STUDIO_TEMPLATES.find((t) => t.id === templateId) || BALLOON_STUDIO_TEMPLATES[0];
    this.selectedTemplateId = tmpl.id;
    this.arrangementTitle = tmpl.name;

    const titleEl = document.getElementById('bs-editor-current-title');
    if (titleEl) titleEl.textContent = this.arrangementTitle;

    this.pieces = JSON.parse(JSON.stringify(tmpl.pieces));
    this.baseTemplatePieces = JSON.parse(JSON.stringify(tmpl.pieces));
    this.palette = JSON.parse(JSON.stringify(tmpl.palette));
    this.activeColorCount = this.palette.colorCount || 4;
    if (!this.palette.E) this.palette.E = '#ffffff';

    // Garante nomes amigáveis em português
    if (!this.palette.names) {
      this.palette.names = { A: 'Rosa Quartzo', B: 'Blush Suave', C: 'Ouro Cromo', D: 'Branco Neve' };
    }
    if (!this.palette.finishes) {
      this.palette.finishes = { A: 'satin', B: 'satin', C: 'chrome', D: 'matte' };
    }

    this.selectedPieceIds.clear();
    this.history = [];
    this.historyIndex = -1;
    this.saveHistory();

    this.computeBaseViewBox();
    this.renderCanvas();
    this.syncPaletteSwatches();
    this.renderTabActivePanel();
  }

  private applyPalettePreset(newPalette: BalloonPaletteConfig): void {
    this.palette = JSON.parse(JSON.stringify(newPalette));
    this.saveHistory();
    this.renderCanvas();
    this.syncPaletteSwatches();
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

      const countsBySize: Record<BalloonSizeInches, number> = { 5: 0, 10: 0, 12: 0, 18: 0, 24: 0 };
      piecesOfSlot.forEach((p) => {
        countsBySize[p.sizeInches]++;
      });

      const sizesBadges = ([18, 12, 10, 5] as BalloonSizeInches[])
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

    let text = `🎈 *${this.arrangementTitle}*\n`;
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

      const countsBySize: Record<BalloonSizeInches, number> = { 5: 0, 10: 0, 12: 0, 18: 0, 24: 0 };
      piecesOfSlot.forEach((p) => countsBySize[p.sizeInches]++);

      const sizesStr = ([18, 12, 10, 5] as BalloonSizeInches[])
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
        btn.textContent = '✓ Copiado com Sucesso!';
        setTimeout(() => {
          btn.textContent = '📋 Copiar Lista';
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
  }

  private undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const state = this.history[this.historyIndex];
      this.pieces = JSON.parse(JSON.stringify(state.pieces));
      this.palette = JSON.parse(JSON.stringify(state.palette));
      this.renderCanvas();
      this.syncPaletteSwatches();
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
      this.showBalloonPill();
    }
  }

  // ----------------------------------------------------------------------
  // API PÚBLICA
  // ----------------------------------------------------------------------

  public open(
    templateId = 'modelo-arco-l-luxo',
    callbacks?: { onInsert?: (item: PresetItem) => void; onSaved?: (item: PresetItem) => void }
  ): void {
    this.createDomStructure();
    if (!this.overlayEl) return;

    this.onInsertCallback = callbacks?.onInsert;
    this.onSavedCallback = callbacks?.onSaved;

    this.overlayEl.style.display = 'flex';
    document.body.classList.add('bs-studio-open');

    // Abre na Galeria Inicial
    this.setScreen('gallery');
  }

  public close(): void {
    if (this.overlayEl) {
      this.overlayEl.style.display = 'none';
      document.body.classList.remove('bs-studio-open');
      this.hideBalloonPill();
    }
  }

  public isOpen(): boolean {
    return this.overlayEl?.style.display === 'flex';
  }
}
