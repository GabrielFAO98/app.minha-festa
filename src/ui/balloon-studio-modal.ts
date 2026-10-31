// Estúdio Visual de Criação e Customização de Balões Orgânicos
// Padrão de Alto Nível para Decoradoras de Festa (Pegue e Monte)

import {
  BALLOON_STUDIO_TEMPLATES,
  STUDIO_PALETTE_PRESETS,
  BALLOON_SIZE_RADIUS_MAP,
  renderArrangementSvg,
  arrangementSvgToDataUrl,
  calculateArrangementStats,
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

  // Estado atual do estúdio
  private pieces: BalloonPiece[] = [];
  private palette: BalloonPaletteConfig = {
    A: '#c97a8e',
    B: '#f7dbe1',
    C: '#d4af37',
    D: '#ffffff',
    name: 'Rose Gold, Blush & Pérola'
  };

  private selectedPieceIds: Set<string> = new Set();
  private selectedTemplateId: string = 'modelo-arco-l-luxo';
  private currentGhostGuide: 'none' | 'round' | 'roman' | 'table' = 'none';

  // Ferramenta de inserção padrão
  private currentToolSize: BalloonSizeInches = 12;
  private currentToolFinish: BalloonFinish = 'satin';
  private currentToolSlot: BalloonSlot = 'A';

  // Histórico Undo / Redo
  private history: { pieces: BalloonPiece[]; palette: BalloonPaletteConfig }[] = [];
  private historyIndex = -1;

  // Dragging state no canvas
  private isDragging = false;
  private dragPointerId: number | null = null;
  private dragStartSvgX = 0;
  private dragStartSvgY = 0;
  private dragPieceInitialPositions: Map<string, { x: number; y: number }> = new Map();

  // Mobile Tabs
  private activeMobileTab: 'colors' | 'add' | 'inspector' = 'colors';

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

  // Cria a estrutura visual completa do estúdio no DOM
  private createDomStructure(): void {
    if (document.getElementById('balloon-studio-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'balloon-studio-overlay';
    overlay.className = 'balloon-studio-overlay';
    overlay.style.display = 'none';

    overlay.innerHTML = `
      <div class="balloon-studio-container">
        <!-- Topo: Barra de Navegação e Ações -->
        <header class="bs-header">
          <div class="bs-header-left">
            <button id="bs-btn-back" class="bs-btn-ghost" title="Voltar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Voltar</span>
            </button>
            <div class="bs-title-group">
              <h1 class="bs-title">Estúdio de Balões</h1>
              <span class="bs-badge-tag">Criador Orgânico</span>
            </div>
          </div>

          <div class="bs-header-center">
            <!-- Seletor de Modelos Prontos -->
            <div class="bs-template-select-box">
              <label class="bs-field-label">Modelo:</label>
              <select id="bs-select-template" class="bs-select">
                ${BALLOON_STUDIO_TEMPLATES.map(
                  (t) => `<option value="${t.id}">${t.name}</option>`
                ).join('')}
                <option value="custom">✦ Em Branco (Do Zero)</option>
              </select>
            </div>

            <!-- Gabarito de Fundo (Guias Visuais) -->
            <div class="bs-ghost-guide-box">
              <label class="bs-field-label">Gabarito:</label>
              <div class="bs-ghost-btn-group">
                <button class="bs-ghost-btn active" data-guide="none" title="Sem gabarito">Nenhum</button>
                <button class="bs-ghost-btn" data-guide="roman" title="Painel Romano (100x200cm)">Romano</button>
                <button class="bs-ghost-btn" data-guide="round" title="Painel Redondo (150cm)">Redondo</button>
                <button class="bs-ghost-btn" data-guide="table" title="Mesa (150x80cm)">Mesa</button>
              </div>
            </div>

            <!-- Contador de Balões / Lista de Material -->
            <button id="bs-btn-counter" class="bs-counter-badge" title="Clique para ver a lista de compras completa">
              <span class="bs-counter-icon">🎈</span>
              <span id="bs-counter-label">0 balões</span>
            </button>
          </div>

          <div class="bs-header-right">
            <!-- Desfazer / Refazer -->
            <div class="bs-undo-group">
              <button id="bs-btn-undo" class="bs-btn-icon" title="Desfazer (Ctrl+Z)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 7v6h6"></path>
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                </svg>
              </button>
              <button id="bs-btn-redo" class="bs-btn-icon" title="Refazer (Ctrl+Y)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 7v6h-6"></path>
                  <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
                </svg>
              </button>
            </div>

            <!-- Botões Principais de Salvamento -->
            <button id="bs-btn-save-element" class="bs-btn-primary" title="Salvar em Meus Elementos">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
              </svg>
              <span class="bs-btn-label-desktop">Salvar em Meus Elementos</span>
              <span class="bs-btn-label-mobile">Salvar</span>
            </button>

            <button id="bs-btn-insert-scene" class="bs-btn-accent" title="Salvar e Inserir no Cenário">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span class="bs-btn-label-desktop">Inserir no Cenário</span>
              <span class="bs-btn-label-mobile">Inserir</span>
            </button>
          </div>
        </header>

        <!-- Corpo Principal: Sidebar Ferramentas + Canvas + Inspetor -->
        <div class="bs-body" data-mobile-tab="colors">
          <!-- Abas de Navegação Mobile (< 900px) -->
          <nav class="bs-mobile-tabs" id="bs-mobile-tabs">
            <button class="bs-mobile-tab active" data-tab="colors" type="button">
              <span>🎨 Cores</span>
            </button>
            <button class="bs-mobile-tab" data-tab="add" type="button">
              <span>➕ Adicionar</span>
            </button>
            <button class="bs-mobile-tab" data-tab="inspector" type="button">
              <span>⚙️ Inspetor</span>
              <span id="bs-tab-insp-indicator" class="bs-tab-dot" style="display:none"></span>
            </button>
          </nav>

          <!-- Sidebar Esquerda: Paletas e Adicionar Balões -->
          <aside class="bs-sidebar-left">
            <!-- Seção 1: Paleta Vinculada (Troca global de cores) -->
            <div class="bs-panel-box" id="bs-panel-colors">
              <div class="bs-panel-header">
                <h3 class="bs-panel-title">Cores Vinculadas</h3>
                <span class="bs-panel-tip" title="Ao alterar uma cor aqui, todos os balões com essa letra mudam juntos">Dica: troca global</span>
              </div>

              <!-- 4 Slots de Cores -->
              <div class="bs-slots-grid">
                <div class="bs-slot-card" data-slot="A">
                  <div class="bs-slot-indicator" style="background:#c97a8e" id="bs-slot-dot-A"></div>
                  <div class="bs-slot-info">
                    <span class="bs-slot-tag">Slot A</span>
                    <span class="bs-slot-name">Principal</span>
                  </div>
                  <input type="color" id="bs-slot-color-A" class="bs-slot-color-input" value="#c97a8e">
                </div>

                <div class="bs-slot-card" data-slot="B">
                  <div class="bs-slot-indicator" style="background:#f7dbe1" id="bs-slot-dot-B"></div>
                  <div class="bs-slot-info">
                    <span class="bs-slot-tag">Slot B</span>
                    <span class="bs-slot-name">Secundária</span>
                  </div>
                  <input type="color" id="bs-slot-color-B" class="bs-slot-color-input" value="#f7dbe1">
                </div>

                <div class="bs-slot-card" data-slot="C">
                  <div class="bs-slot-indicator" style="background:#d4af37" id="bs-slot-dot-C"></div>
                  <div class="bs-slot-info">
                    <span class="bs-slot-tag">Slot C</span>
                    <span class="bs-slot-name">Destaque</span>
                  </div>
                  <input type="color" id="bs-slot-color-C" class="bs-slot-color-input" value="#d4af37">
                </div>

                <div class="bs-slot-card" data-slot="D">
                  <div class="bs-slot-indicator" style="background:#ffffff" id="bs-slot-dot-D"></div>
                  <div class="bs-slot-info">
                    <span class="bs-slot-tag">Slot D</span>
                    <span class="bs-slot-name">Base / Neutro</span>
                  </div>
                  <input type="color" id="bs-slot-color-D" class="bs-slot-color-input" value="#ffffff">
                </div>
              </div>

              <!-- Paletas Prontas Populares -->
              <div class="bs-palette-presets-box">
                <label class="bs-field-label">Paletas Prontas da Festa:</label>
                <div class="bs-palette-chips-grid">
                  ${STUDIO_PALETTE_PRESETS.map(
                    (p) => `
                    <button class="bs-palette-chip" data-preset="${p.id}" title="${p.name}">
                      <div class="bs-chip-swatches">
                        <span style="background:${p.palette.A}"></span>
                        <span style="background:${p.palette.B}"></span>
                        <span style="background:${p.palette.C}"></span>
                        <span style="background:${p.palette.D}"></span>
                      </div>
                      <span class="bs-chip-label">${p.name}</span>
                    </button>
                  `
                  ).join('')}
                </div>
              </div>
            </div>

            <!-- Seção 2: Ferramentas de Inserção -->
            <div class="bs-panel-box" id="bs-panel-add">
              <div class="bs-panel-header">
                <h3 class="bs-panel-title">Adicionar Balões</h3>
              </div>

              <!-- Tamanhos em Polegadas -->
              <div class="bs-field-group">
                <label class="bs-field-label">Tamanho do Balão:</label>
                <div class="bs-size-selector">
                  <button class="bs-size-btn" data-size="5" title="5 polegadas (Mini / Detalhe)">5"</button>
                  <button class="bs-size-btn" data-size="10" title="10 polegadas (Pequeno)">10"</button>
                  <button class="bs-size-btn active" data-size="12" title="12 polegadas (Padrão de Arco)">12"</button>
                  <button class="bs-size-btn" data-size="18" title="18 polegadas (Grande Statement)">18"</button>
                  <button class="bs-size-btn" data-size="24" title="24 polegadas (Gigante / Big Balloon)">24"</button>
                </div>
              </div>

              <!-- Acabamentos de Látex -->
              <div class="bs-field-group">
                <label class="bs-field-label">Acabamento:</label>
                <div class="bs-finish-selector">
                  <button class="bs-finish-btn active" data-finish="satin" title="Látex Acetinado (Brilho suave)">Acetinado</button>
                  <button class="bs-finish-btn" data-finish="matte" title="Látex Fosco / Aveludado">Fosco</button>
                  <button class="bs-finish-btn" data-finish="chrome" title="Cromado / Espelhado Metálico">Cromado</button>
                  <button class="bs-finish-btn" data-finish="crystal" title="Transparente Cristal">Cristal</button>
                  <button class="bs-finish-btn" data-finish="glitter" title="Transparente com Glitter e Confete">Glitter ✨</button>
                </div>
              </div>

              <!-- Slot de Cor para os novos balões -->
              <div class="bs-field-group">
                <label class="bs-field-label">Vincular à Cor:</label>
                <div class="bs-slot-radio-group">
                  <button class="bs-slot-radio-btn active" data-slot="A">Slot A</button>
                  <button class="bs-slot-radio-btn" data-slot="B">Slot B</button>
                  <button class="bs-slot-radio-btn" data-slot="C">Slot C</button>
                  <button class="bs-slot-radio-btn" data-slot="D">Slot D</button>
                </div>
              </div>

              <!-- Botões de Inserção Imediata -->
              <div class="bs-action-buttons-group">
                <button id="bs-btn-add-single" class="bs-tool-btn bs-tool-btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <span>+ Balão Individual</span>
                </button>

                <button id="bs-btn-add-quad" class="bs-tool-btn" title="Adiciona 4 balões interligados prontos (Quad profissional)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                  </svg>
                  <span>+ Cluster Quad (4x)</span>
                </button>

                <button id="bs-btn-add-trio" class="bs-tool-btn" title="Adiciona 3 mini balões de 5 polegadas para acabamento nas fendas">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="7" r="4"></circle>
                    <circle cx="7" cy="16" r="4"></circle>
                    <circle cx="17" cy="16" r="4"></circle>
                  </svg>
                  <span>+ Tufo Detalhe (3x 5")</span>
                </button>
              </div>
            </div>
          </aside>

          <!-- Centro: Canvas Interativo de Montagem -->
          <main class="bs-canvas-area" id="bs-canvas-container">
            <!-- Barra Flutuante de Dimensões e Dica -->
            <div class="bs-canvas-info-bar">
              <span id="bs-dimension-badge" class="bs-dimension-badge">180 cm × 230 cm</span>
              <span class="bs-canvas-hint">Arraste para posicionar • Clique para selecionar • Del para remover</span>
            </div>

            <!-- SVG Renderizado Interativo -->
            <svg id="bs-canvas-svg" class="bs-canvas-svg" xmlns="http://www.w3.org/2000/svg">
              <!-- Definições e Gabarito Fantasma -->
              <defs id="bs-svg-defs"></defs>
              <g id="bs-ghost-guide-layer"></g>
              <!-- Camada de Peças de Balão -->
              <g id="bs-balloons-layer"></g>
              <!-- Caixa de Seleção / Contorno -->
              <g id="bs-selection-layer"></g>
            </svg>
          </main>

          <!-- Sidebar Direita: Inspetor do Balão Selecionado -->
          <aside class="bs-sidebar-right" id="bs-inspector-sidebar">
            <div class="bs-panel-box" id="bs-inspector-box">
              <div class="bs-panel-header">
                <h3 class="bs-panel-title">Balão Selecionado</h3>
                <span id="bs-selection-count-badge" class="bs-tag-selection">1 selecionado</span>
              </div>

              <div id="bs-inspector-content">
                <!-- Seletor de Slot -->
                <div class="bs-field-group">
                  <label class="bs-field-label">Cor Vinculada:</label>
                  <div class="bs-inspector-slots">
                    <button class="bs-insp-slot-btn" data-slot="A">Slot A</button>
                    <button class="bs-insp-slot-btn" data-slot="B">Slot B</button>
                    <button class="bs-insp-slot-btn" data-slot="C">Slot C</button>
                    <button class="bs-insp-slot-btn" data-slot="D">Slot D</button>
                  </div>
                </div>

                <!-- Seletor de Tamanho -->
                <div class="bs-field-group">
                  <label class="bs-field-label">Mudar Tamanho:</label>
                  <div class="bs-inspector-sizes">
                    <button class="bs-insp-size-btn" data-size="5">5"</button>
                    <button class="bs-insp-size-btn" data-size="10">10"</button>
                    <button class="bs-insp-size-btn" data-size="12">12"</button>
                    <button class="bs-insp-size-btn" data-size="18">18"</button>
                    <button class="bs-insp-size-btn" data-size="24">24"</button>
                  </div>
                </div>

                <!-- Seletor de Acabamento -->
                <div class="bs-field-group">
                  <label class="bs-field-label">Mudar Acabamento:</label>
                  <div class="bs-inspector-finishes">
                    <button class="bs-insp-fin-btn" data-finish="satin">Acetinado</button>
                    <button class="bs-insp-fin-btn" data-finish="matte">Fosco</button>
                    <button class="bs-insp-fin-btn" data-finish="chrome">Cromado</button>
                    <button class="bs-insp-fin-btn" data-finish="crystal">Cristal</button>
                    <button class="bs-insp-fin-btn" data-finish="glitter">Glitter ✨</button>
                  </div>
                </div>

                <!-- Ordem de Camadas (Profundidade 3D) -->
                <div class="bs-field-group">
                  <label class="bs-field-label">Profundidade / Camada:</label>
                  <div class="bs-layers-btn-group">
                    <button id="bs-btn-bring-front" class="bs-layer-btn" title="Trazer para o topo absoluto">
                      <span>↑ Frente</span>
                    </button>
                    <button id="bs-btn-send-back" class="bs-layer-btn" title="Enviar para trás de todos">
                      <span>↓ Trás</span>
                    </button>
                    <button id="bs-btn-step-forward" class="bs-layer-btn" title="Avançar uma posição">
                      <span>+1 Acima</span>
                    </button>
                    <button id="bs-btn-step-backward" class="bs-layer-btn" title="Recuar uma posição">
                      <span>-1 Abaixo</span>
                    </button>
                  </div>
                </div>

                <!-- Ações Rápidas (Duplicar e Deletar) -->
                <div class="bs-field-group bs-actions-row">
                  <button id="bs-btn-duplicate" class="bs-btn-secondary" title="Duplicar peça (Ctrl+D)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Duplicar</span>
                  </button>

                  <button id="bs-btn-delete" class="bs-btn-danger" title="Excluir balão (Del)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Excluir</span>
                  </button>
                </div>
              </div>

              <!-- Estado Vazio (Nenhum balão selecionado) -->
              <div id="bs-inspector-empty" class="bs-inspector-empty">
                <p>Clique em qualquer balão no canvas para personalizar cor, tamanho, acabamento e camada.</p>
              </div>
            </div>
          </aside>
        </div>

        <!-- Modal Popover de Lista de Compras / Contador -->
        <div id="bs-shopping-modal" class="bs-shopping-modal" style="display:none">
          <div class="bs-shopping-card">
            <div class="bs-shopping-header">
              <h3>Lista de Balões & Material</h3>
              <button id="bs-btn-close-shopping" class="bs-btn-icon">✕</button>
            </div>
            <div class="bs-shopping-body" id="bs-shopping-content">
              <!-- Conteúdo gerado dinamicamente -->
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

  // Vincula todos os eventos de clique, teclado e arraste
  private setupEvents(): void {
    if (!this.overlayEl) return;

    // Fechar / Voltar
    document.getElementById('bs-btn-back')?.addEventListener('click', () => this.close());

    // Seletor de Modelo Pronto
    const selectTemplate = document.getElementById('bs-select-template') as HTMLSelectElement | null;
    selectTemplate?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      if (val === 'custom') {
        this.pieces = [];
        this.saveHistory();
        this.renderCanvas();
      } else {
        this.loadTemplate(val);
      }
    });

    // Seletor de Gabarito de Fundo
    this.overlayEl.querySelectorAll('.bs-ghost-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.overlayEl?.querySelectorAll('.bs-ghost-btn').forEach((b) => b.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentGhostGuide = (target.dataset.guide as any) || 'none';
        this.renderGhostGuide();
      });
    });

    // Popover Lista de Compras
    document.getElementById('bs-btn-counter')?.addEventListener('click', () => {
      this.toggleShoppingModal(true);
    });
    document.getElementById('bs-btn-close-shopping')?.addEventListener('click', () => {
      this.toggleShoppingModal(false);
    });

    // Desfazer e Refazer
    document.getElementById('bs-btn-undo')?.addEventListener('click', () => this.undo());
    document.getElementById('bs-btn-redo')?.addEventListener('click', () => this.redo());

    // Cores Vinculadas (Slots A, B, C, D)
    ['A', 'B', 'C', 'D'].forEach((slot) => {
      const input = document.getElementById(`bs-slot-color-${slot}`) as HTMLInputElement | null;
      input?.addEventListener('input', (e) => {
        const col = (e.target as HTMLInputElement).value;
        this.updateSlotColor(slot as BalloonSlot, col);
      });
    });

    // Paletas Prontas
    this.overlayEl.querySelectorAll('.bs-palette-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.preset;
        const preset = STUDIO_PALETTE_PRESETS.find((p) => p.id === id);
        if (preset) {
          this.applyPalettePreset(preset.palette);
        }
      });
    });

    // Seletores da Ferramenta de Inserção
    this.overlayEl.querySelectorAll('.bs-size-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.overlayEl?.querySelectorAll('.bs-size-btn').forEach((b) => b.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentToolSize = Number(target.dataset.size) as BalloonSizeInches;
      });
    });

    this.overlayEl.querySelectorAll('.bs-finish-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.overlayEl?.querySelectorAll('.bs-finish-btn').forEach((b) => b.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentToolFinish = target.dataset.finish as BalloonFinish;
      });
    });

    this.overlayEl.querySelectorAll('.bs-slot-radio-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.overlayEl?.querySelectorAll('.bs-slot-radio-btn').forEach((b) => b.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentToolSlot = target.dataset.slot as BalloonSlot;
      });
    });

    // Ações de Adição
    document.getElementById('bs-btn-add-single')?.addEventListener('click', () => this.addSingleBalloon());
    document.getElementById('bs-btn-add-quad')?.addEventListener('click', () => this.addClusterQuad());
    document.getElementById('bs-btn-add-trio')?.addEventListener('click', () => this.addCreviceTrio());

    // Ações do Inspetor (Camadas, Duplicar, Deletar)
    document.getElementById('bs-btn-bring-front')?.addEventListener('click', () => this.changeZIndex('front'));
    document.getElementById('bs-btn-send-back')?.addEventListener('click', () => this.changeZIndex('back'));
    document.getElementById('bs-btn-step-forward')?.addEventListener('click', () => this.changeZIndex('forward'));
    document.getElementById('bs-btn-step-backward')?.addEventListener('click', () => this.changeZIndex('backward'));
    document.getElementById('bs-btn-duplicate')?.addEventListener('click', () => this.duplicateSelected());
    document.getElementById('bs-btn-delete')?.addEventListener('click', () => this.deleteSelected());

    // Ações do Inspetor (Mudar propriedades da peça selecionada)
    this.overlayEl.querySelectorAll('.bs-insp-slot-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const slot = (e.currentTarget as HTMLElement).dataset.slot as BalloonSlot;
        this.setSelectedPieceSlot(slot);
      });
    });

    this.overlayEl.querySelectorAll('.bs-insp-size-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const size = Number((e.currentTarget as HTMLElement).dataset.size) as BalloonSizeInches;
        this.setSelectedPieceSize(size);
      });
    });

    this.overlayEl.querySelectorAll('.bs-insp-fin-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const fin = (e.currentTarget as HTMLElement).dataset.finish as BalloonFinish;
        this.setSelectedPieceFinish(fin);
      });
    });

    // Salvamento
    document.getElementById('bs-btn-save-element')?.addEventListener('click', () => this.saveToCustomElements(false));
    document.getElementById('bs-btn-insert-scene')?.addEventListener('click', () => this.saveToCustomElements(true));

    // Abas Mobile (< 900px)
    this.overlayEl.querySelectorAll('.bs-mobile-tab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).dataset.tab as 'colors' | 'add' | 'inspector';
        if (tab) this.setMobileTab(tab);
      });
    });

    // Eventos do Canvas Interativo (Mouse & Touch via PointerEvents)
    this.setupCanvasInteraction();

    // Atalhos de Teclado no Estúdio
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen()) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedPieceIds.size > 0) {
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
          this.deleteSelected();
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.duplicateSelected();
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

  // Alterna a aba ativa no layout responsivo mobile
  public setMobileTab(tab: 'colors' | 'add' | 'inspector'): void {
    this.activeMobileTab = tab;
    const body = this.overlayEl?.querySelector('.bs-body') as HTMLElement | null;
    if (body) {
      body.setAttribute('data-mobile-tab', tab);
    }
    this.overlayEl?.querySelectorAll('.bs-mobile-tab').forEach((b) => {
      const btn = b as HTMLElement;
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
  }

  // Interação direta com os balões no canvas (Arrasto e Seleção com suporte a Touch & Mouse via PointerEvents)
  private setupCanvasInteraction(): void {
    const canvas = this.canvasSvgEl;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      // Bloqueia clique secundário do mouse
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const target = e.target as SVGElement;
      const pieceGroup = target.closest('.balloon-piece') as SVGElement | null;

      if (pieceGroup) {
        const pieceId = pieceGroup.id.replace('piece-', '');
        if (!e.shiftKey && !this.selectedPieceIds.has(pieceId)) {
          this.selectedPieceIds.clear();
        }
        this.selectedPieceIds.add(pieceId);
        this.updateInspectorUI();
        this.renderSelectionOutlines();
        this.setMobileTab('inspector'); // No mobile: auto-muda para a aba Inspetor

        // Inicia arrasto com coordenadas SVG fiéis via matriz CTM
        this.isDragging = true;
        this.dragPointerId = e.pointerId;

        const ctm = canvas.getScreenCTM();
        if (ctm) {
          const pt = canvas.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgPt = pt.matrixTransform(ctm.inverse());
          this.dragStartSvgX = svgPt.x;
          this.dragStartSvgY = svgPt.y;
        } else {
          this.dragStartSvgX = e.clientX;
          this.dragStartSvgY = e.clientY;
        }

        this.dragPieceInitialPositions.clear();
        this.selectedPieceIds.forEach((id) => {
          const p = this.pieces.find((x) => x.id === id);
          if (p) this.dragPieceInitialPositions.set(id, { x: p.x, y: p.y });
        });

        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
      } else {
        // Clicou no fundo do canvas: desseleciona
        this.selectedPieceIds.clear();
        this.updateInspectorUI();
        this.renderSelectionOutlines();
      }
    });

    canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDragging || (this.dragPointerId !== null && e.pointerId !== this.dragPointerId)) return;

      let dx = 0;
      let dy = 0;

      const ctm = canvas.getScreenCTM();
      if (ctm) {
        const pt = canvas.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(ctm.inverse());
        dx = svgPt.x - this.dragStartSvgX;
        dy = svgPt.y - this.dragStartSvgY;
      } else {
        dx = e.clientX - this.dragStartSvgX;
        dy = e.clientY - this.dragStartSvgY;
      }

      // Atualiza coordenadas dos balões selecionados
      this.selectedPieceIds.forEach((id) => {
        const init = this.dragPieceInitialPositions.get(id);
        const p = this.pieces.find((x) => x.id === id);
        if (init && p) {
          p.x = Math.round(init.x + dx);
          p.y = Math.round(init.y + dy);
        }
      });

      this.renderCanvas(false); // Atualização rápida sem salvar histórico a cada pixel
    });

    const onPointerEnd = (e: PointerEvent) => {
      if (this.isDragging && (this.dragPointerId === null || e.pointerId === this.dragPointerId)) {
        this.isDragging = false;
        this.dragPointerId = null;
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}
        this.saveHistory();
        this.renderCanvas();
      }
    };

    canvas.addEventListener('pointerup', onPointerEnd);
    canvas.addEventListener('pointercancel', onPointerEnd);
  }

  // Abre o Estúdio com um template pré-carregado
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

    // Carrega o modelo inicial
    this.loadTemplate(templateId);
  }

  public close(): void {
    if (this.overlayEl) {
      this.overlayEl.style.display = 'none';
      document.body.classList.remove('bs-studio-open');
    }
  }

  public isOpen(): boolean {
    return this.overlayEl?.style.display === 'flex';
  }

  // Carrega um dos 10 templates pré-definidos
  public loadTemplate(templateId: string): void {
    const tmpl = BALLOON_STUDIO_TEMPLATES.find((t) => t.id === templateId) || BALLOON_STUDIO_TEMPLATES[0];
    this.selectedTemplateId = tmpl.id;

    // Clona peças e paleta
    this.pieces = JSON.parse(JSON.stringify(tmpl.pieces));
    this.palette = JSON.parse(JSON.stringify(tmpl.palette));

    // Atualiza controles na tela
    this.syncPaletteSwatches();

    const select = document.getElementById('bs-select-template') as HTMLSelectElement | null;
    if (select) select.value = tmpl.id;

    this.selectedPieceIds.clear();
    this.history = [];
    this.historyIndex = -1;
    this.saveHistory();

    this.renderCanvas();
    this.renderGhostGuide();
    this.updateInspectorUI();
  }

  // Atualiza as amostras de cores na barra lateral
  private syncPaletteSwatches(): void {
    ['A', 'B', 'C', 'D'].forEach((slot) => {
      const col = (this.palette as any)[slot];
      const dot = document.getElementById(`bs-slot-dot-${slot}`);
      const input = document.getElementById(`bs-slot-color-${slot}`) as HTMLInputElement | null;
      if (dot) dot.style.background = col;
      if (input) input.value = col;
    });
  }

  // Atualiza a cor de um slot vinculado (atualiza TODOS os balões vinculados imediatamente)
  private updateSlotColor(slot: BalloonSlot, newColor: string): void {
    (this.palette as any)[slot] = newColor;
    const dot = document.getElementById(`bs-slot-dot-${slot}`);
    if (dot) dot.style.background = newColor;

    this.saveHistory();
    this.renderCanvas();
  }

  // Aplica uma paleta completa pronta
  private applyPalettePreset(palette: BalloonPaletteConfig): void {
    this.palette = { ...palette };
    this.syncPaletteSwatches();
    this.saveHistory();
    this.renderCanvas();
  }

  // Adiciona 1 balão no centro visual do arranjo
  private addSingleBalloon(): void {
    const center = this.getArrangementCenter();
    const newPiece: BalloonPiece = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      x: center.x,
      y: center.y,
      sizeInches: this.currentToolSize,
      slot: this.currentToolSlot,
      finish: this.currentToolFinish
    };

    this.pieces.push(newPiece);
    this.selectedPieceIds.clear();
    this.selectedPieceIds.add(newPiece.id);

    this.saveHistory();
    this.renderCanvas();
    this.updateInspectorUI();
  }

  // Adiciona um Cluster Quad profissional (4 balões interligados)
  private addClusterQuad(): void {
    const center = this.getArrangementCenter();
    const d = 26; // Deslocamento dos 4 balões
    const baseId = Date.now();

    const quadPieces: BalloonPiece[] = [
      {
        id: `quad-${baseId}-1`,
        x: center.x - d,
        y: center.y - d,
        sizeInches: this.currentToolSize,
        slot: 'A',
        finish: this.currentToolFinish
      },
      {
        id: `quad-${baseId}-2`,
        x: center.x + d,
        y: center.y - d,
        sizeInches: this.currentToolSize,
        slot: 'B',
        finish: this.currentToolFinish
      },
      {
        id: `quad-${baseId}-3`,
        x: center.x - d,
        y: center.y + d,
        sizeInches: this.currentToolSize,
        slot: 'C',
        finish: this.currentToolFinish
      },
      {
        id: `quad-${baseId}-4`,
        x: center.x + d,
        y: center.y + d,
        sizeInches: this.currentToolSize,
        slot: 'D',
        finish: this.currentToolFinish
      }
    ];

    this.pieces.push(...quadPieces);
    this.selectedPieceIds.clear();
    quadPieces.forEach((p) => this.selectedPieceIds.add(p.id));

    this.saveHistory();
    this.renderCanvas();
    this.updateInspectorUI();
  }

  // Adiciona um tufo de acabamento para fendas (3x mini balões de 5")
  private addCreviceTrio(): void {
    const center = this.getArrangementCenter();
    const baseId = Date.now();

    const trioPieces: BalloonPiece[] = [
      {
        id: `trio-${baseId}-1`,
        x: center.x,
        y: center.y - 10,
        sizeInches: 5,
        slot: 'A',
        finish: 'satin'
      },
      {
        id: `trio-${baseId}-2`,
        x: center.x - 10,
        y: center.y + 6,
        sizeInches: 5,
        slot: 'B',
        finish: 'satin'
      },
      {
        id: `trio-${baseId}-3`,
        x: center.x + 10,
        y: center.y + 6,
        sizeInches: 5,
        slot: 'C',
        finish: 'chrome'
      }
    ];

    this.pieces.push(...trioPieces);
    this.selectedPieceIds.clear();
    trioPieces.forEach((p) => this.selectedPieceIds.add(p.id));

    this.saveHistory();
    this.renderCanvas();
    this.updateInspectorUI();
  }

  // Ponto central de apoio para novas adições
  private getArrangementCenter(): { x: number; y: number } {
    if (this.pieces.length === 0) return { x: 180, y: 180 };
    let sx = 0, sy = 0;
    this.pieces.forEach((p) => {
      sx += p.x;
      sy += p.y;
    });
    return {
      x: Math.round(sx / this.pieces.length),
      y: Math.round(sy / this.pieces.length)
    };
  }

  // Renderiza todo o conteúdo do canvas SVG
  private renderCanvas(updateStats = true): void {
    const balloonsLayer = document.getElementById('bs-balloons-layer');
    const defsLayer = document.getElementById('bs-svg-defs');
    if (!balloonsLayer || !defsLayer || !this.canvasSvgEl) return;

    // Renderiza SVG
    const { svg, widthCm, heightCm, viewBox, stats } = renderArrangementSvg(this.pieces, this.palette, {
      hasFloorShadow: true
    });

    // Atualiza atributos do canvas
    this.canvasSvgEl.setAttribute('viewBox', viewBox);

    // Injeta defs e conteúdo
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');

    const newDefs = doc.querySelector('defs');
    if (newDefs) defsLayer.innerHTML = newDefs.innerHTML;

    // Constrói nós dos balões
    const pieceElements = Array.from(doc.querySelectorAll('.balloon-piece'));
    balloonsLayer.innerHTML = '';
    pieceElements.forEach((el) => {
      balloonsLayer.appendChild(el);
    });

    if (updateStats) {
      // Atualiza badge de dimensões
      const dimBadge = document.getElementById('bs-dimension-badge');
      if (dimBadge) dimBadge.textContent = `${widthCm} cm × ${heightCm} cm`;

      // Atualiza badge do contador
      const counterLabel = document.getElementById('bs-counter-label');
      if (counterLabel) counterLabel.textContent = `${stats.totalCount} balões`;

      this.renderShoppingContent(stats);
    }

    this.renderSelectionOutlines();
  }

  // Desenha os contornos de seleção nos balões ativos
  private renderSelectionOutlines(): void {
    const selLayer = document.getElementById('bs-selection-layer');
    if (!selLayer) return;
    selLayer.innerHTML = '';

    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) {
        const r = (BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28) + 3;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(p.x));
        circle.setAttribute('cy', String(p.y));
        circle.setAttribute('r', String(r));
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', '#38bdf8');
        circle.setAttribute('stroke-width', '2.5');
        circle.setAttribute('stroke-dasharray', '5 3');
        circle.setAttribute('opacity', '0.9');
        selLayer.appendChild(circle);
      }
    });
  }

  // Renderiza silhueta de gabarito fantasma semi-transparente no fundo
  private renderGhostGuide(): void {
    const layer = document.getElementById('bs-ghost-guide-layer');
    if (!layer) return;
    layer.innerHTML = '';

    if (this.currentGhostGuide === 'none') return;

    let guideSvg = '';
    if (this.currentGhostGuide === 'roman') {
      // Painel Romano (Arco superior)
      guideSvg = `
        <path d="M 40 430 L 40 180 A 100 100 0 0 1 240 180 L 240 430" fill="none" stroke="#64748b" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.45"/>
        <text x="140" y="240" fill="#94a3b8" font-size="14" text-anchor="middle" opacity="0.6">Painel Romano (100x200cm)</text>
      `;
    } else if (this.currentGhostGuide === 'round') {
      // Painel Redondo (150cm)
      guideSvg = `
        <circle cx="150" cy="180" r="130" fill="none" stroke="#64748b" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.45"/>
        <line x1="150" y1="310" x2="150" y2="430" stroke="#64748b" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.45"/>
        <text x="150" y="185" fill="#94a3b8" font-size="14" text-anchor="middle" opacity="0.6">Painel Redondo (150cm)</text>
      `;
    } else if (this.currentGhostGuide === 'table') {
      // Mesa Tradicional
      guideSvg = `
        <rect x="50" y="260" width="220" height="150" rx="6" fill="none" stroke="#64748b" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.45"/>
        <text x="160" y="340" fill="#94a3b8" font-size="14" text-anchor="middle" opacity="0.6">Mesa de Bolo (150cm)</text>
      `;
    }

    layer.innerHTML = guideSvg;
  }

  // Atualiza painel do Inspetor lateral direito
  private updateInspectorUI(): void {
    const content = document.getElementById('bs-inspector-content');
    const empty = document.getElementById('bs-inspector-empty');
    const badge = document.getElementById('bs-selection-count-badge');

    if (!content || !empty || !badge) return;

    const count = this.selectedPieceIds.size;
    const tabIndicator = document.getElementById('bs-tab-insp-indicator');
    if (tabIndicator) tabIndicator.style.display = count > 0 ? 'inline-block' : 'none';

    if (count === 0) {
      content.style.display = 'none';
      empty.style.display = 'block';
      badge.textContent = 'Nenhum selecionado';
    } else {
      content.style.display = 'block';
      empty.style.display = 'none';
      badge.textContent = count === 1 ? '1 balão selecionado' : `${count} balões selecionados`;

      // Se 1 balão estiver selecionado, sincroniza os botões ativos do inspetor
      if (count === 1) {
        const id = Array.from(this.selectedPieceIds)[0];
        const piece = this.pieces.find((p) => p.id === id);
        if (piece) {
          // Slot
          this.overlayEl?.querySelectorAll('.bs-insp-slot-btn').forEach((btn) => {
            btn.classList.toggle('active', (btn as HTMLElement).dataset.slot === piece.slot);
          });
          // Tamanho
          this.overlayEl?.querySelectorAll('.bs-insp-size-btn').forEach((btn) => {
            btn.classList.toggle('active', Number((btn as HTMLElement).dataset.size) === piece.sizeInches);
          });
          // Acabamento
          this.overlayEl?.querySelectorAll('.bs-insp-fin-btn').forEach((btn) => {
            btn.classList.toggle('active', (btn as HTMLElement).dataset.finish === piece.finish);
          });
        }
      }
    }
  }

  // Altera slot dos balões selecionados
  private setSelectedPieceSlot(slot: BalloonSlot): void {
    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) p.slot = slot;
    });
    this.saveHistory();
    this.renderCanvas();
    this.updateInspectorUI();
  }

  // Altera tamanho dos balões selecionados
  private setSelectedPieceSize(size: BalloonSizeInches): void {
    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) p.sizeInches = size;
    });
    this.saveHistory();
    this.renderCanvas();
    this.updateInspectorUI();
  }

  // Altera acabamento dos balões selecionados
  private setSelectedPieceFinish(finish: BalloonFinish): void {
    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) p.finish = finish;
    });
    this.saveHistory();
    this.renderCanvas();
    this.updateInspectorUI();
  }

  // Controle de camadas (Z-Index)
  private changeZIndex(action: 'front' | 'back' | 'forward' | 'backward'): void {
    if (this.selectedPieceIds.size === 0) return;

    const selected = this.pieces.filter((p) => this.selectedPieceIds.has(p.id));
    const unselected = this.pieces.filter((p) => !this.selectedPieceIds.has(p.id));

    if (action === 'front') {
      this.pieces = [...unselected, ...selected];
    } else if (action === 'back') {
      this.pieces = [...selected, ...unselected];
    } else if (action === 'forward') {
      // Avança 1 posição
      for (let i = this.pieces.length - 2; i >= 0; i--) {
        if (this.selectedPieceIds.has(this.pieces[i].id) && !this.selectedPieceIds.has(this.pieces[i + 1].id)) {
          const temp = this.pieces[i];
          this.pieces[i] = this.pieces[i + 1];
          this.pieces[i + 1] = temp;
        }
      }
    } else if (action === 'backward') {
      // Recua 1 posição
      for (let i = 1; i < this.pieces.length; i++) {
        if (this.selectedPieceIds.has(this.pieces[i].id) && !this.selectedPieceIds.has(this.pieces[i - 1].id)) {
          const temp = this.pieces[i];
          this.pieces[i] = this.pieces[i - 1];
          this.pieces[i - 1] = temp;
        }
      }
    }

    this.saveHistory();
    this.renderCanvas();
  }

  // Duplicar balões selecionados
  private duplicateSelected(): void {
    if (this.selectedPieceIds.size === 0) return;

    const newIds = new Set<string>();
    const clones: BalloonPiece[] = [];

    this.selectedPieceIds.forEach((id) => {
      const p = this.pieces.find((x) => x.id === id);
      if (p) {
        const newId = 'p-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
        clones.push({
          ...JSON.parse(JSON.stringify(p)),
          id: newId,
          x: p.x + 22,
          y: p.y + 22
        });
        newIds.add(newId);
      }
    });

    this.pieces.push(...clones);
    this.selectedPieceIds = newIds;

    this.saveHistory();
    this.renderCanvas();
    this.updateInspectorUI();
  }

  // Deletar balões selecionados
  private deleteSelected(): void {
    if (this.selectedPieceIds.size === 0) return;

    this.pieces = this.pieces.filter((p) => !this.selectedPieceIds.has(p.id));
    this.selectedPieceIds.clear();

    this.saveHistory();
    this.renderCanvas();
    this.updateInspectorUI();
  }

  // Histórico de alterações (Undo / Redo)
  private saveHistory(): void {
    // Trunca histórico se estive no meio
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
      this.syncPaletteSwatches();
      this.renderCanvas();
      this.updateInspectorUI();
    }
  }

  private redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const state = this.history[this.historyIndex];
      this.pieces = JSON.parse(JSON.stringify(state.pieces));
      this.palette = JSON.parse(JSON.stringify(state.palette));
      this.syncPaletteSwatches();
      this.renderCanvas();
      this.updateInspectorUI();
    }
  }

  // Renderiza a lista de compras de balões (detalhada e limpa)
  private renderShoppingContent(stats: ArrangementStats): void {
    const container = document.getElementById('bs-shopping-content');
    if (!container) return;

    container.innerHTML = `
      <div class="bs-shop-summary">
        <div class="bs-shop-total">
          <span class="bs-shop-total-num">${stats.totalCount}</span>
          <span class="bs-shop-total-desc">Balões no Total</span>
        </div>
        <div class="bs-shop-dim">
          <span class="bs-shop-dim-val">${stats.widthCm} × ${stats.heightCm} cm</span>
          <span class="bs-shop-dim-desc">Dimensões Estimadas</span>
        </div>
      </div>

      <div class="bs-shop-section">
        <h4 class="bs-shop-subtitle">Contagem por Tamanho (Polegadas)</h4>
        <div class="bs-shop-list">
          <div class="bs-shop-row">
            <span>24" (Gigante / Big Balloon)</span>
            <strong>${stats.bySize[24]} un</strong>
          </div>
          <div class="bs-shop-row">
            <span>18" (Grande / Statement)</span>
            <strong>${stats.bySize[18]} un</strong>
          </div>
          <div class="bs-shop-row">
            <span>12" (Padrão de Arco)</span>
            <strong>${stats.bySize[12]} un</strong>
          </div>
          <div class="bs-shop-row">
            <span>10" (Pequeno de Transição)</span>
            <strong>${stats.bySize[10]} un</strong>
          </div>
          <div class="bs-shop-row">
            <span>5" (Mini de Acabamento)</span>
            <strong>${stats.bySize[5]} un</strong>
          </div>
        </div>
      </div>

      <div class="bs-shop-section">
        <h4 class="bs-shop-subtitle">Contagem por Cor / Slot</h4>
        <div class="bs-shop-list">
          <div class="bs-shop-row">
            <span class="bs-shop-slot-name"><span class="bs-shop-dot" style="background:${this.palette.A}"></span> Slot A (Principal)</span>
            <strong>${stats.bySlot.A} un</strong>
          </div>
          <div class="bs-shop-row">
            <span class="bs-shop-slot-name"><span class="bs-shop-dot" style="background:${this.palette.B}"></span> Slot B (Secundária)</span>
            <strong>${stats.bySlot.B} un</strong>
          </div>
          <div class="bs-shop-row">
            <span class="bs-shop-slot-name"><span class="bs-shop-dot" style="background:${this.palette.C}"></span> Slot C (Destaque)</span>
            <strong>${stats.bySlot.C} un</strong>
          </div>
          <div class="bs-shop-row">
            <span class="bs-shop-slot-name"><span class="bs-shop-dot" style="background:${this.palette.D}"></span> Slot D (Base)</span>
            <strong>${stats.bySlot.D} un</strong>
          </div>
        </div>
      </div>

      <div class="bs-shop-section">
        <h4 class="bs-shop-subtitle">Contagem por Acabamento</h4>
        <div class="bs-shop-list">
          <div class="bs-shop-row"><span>Acetinado</span><strong>${stats.byFinish.satin} un</strong></div>
          <div class="bs-shop-row"><span>Fosco (Matte)</span><strong>${stats.byFinish.matte} un</strong></div>
          <div class="bs-shop-row"><span>Cromado / Metálico</span><strong>${stats.byFinish.chrome} un</strong></div>
          <div class="bs-shop-row"><span>Cristal Transparente</span><strong>${stats.byFinish.crystal} un</strong></div>
          <div class="bs-shop-row"><span>Cristal com Glitter ✨</span><strong>${stats.byFinish.glitter} un</strong></div>
        </div>
      </div>
    `;
  }

  private toggleShoppingModal(show: boolean): void {
    const modal = document.getElementById('bs-shopping-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
  }

  // Salva a composição como elemento do acervo ("Meus Elementos")
  public async saveToCustomElements(insertDirectly = false): Promise<PresetItem | null> {
    if (this.pieces.length === 0) {
      alert('Adicione pelo menos um balão antes de salvar.');
      return null;
    }

    const defaultName =
      BALLOON_STUDIO_TEMPLATES.find((t) => t.id === this.selectedTemplateId)?.name || 'Meu Arranjo de Balões';

    const itemName = prompt('Nome do seu Arranjo de Balões:', defaultName);
    if (!itemName) return null;

    const { svg, widthCm, heightCm } = renderArrangementSvg(this.pieces, this.palette, {
      hasFloorShadow: true
    });
    const previewUrl = arrangementSvgToDataUrl(svg);

    const newItem = await addCustomItem({
      name: itemName,
      category: 'baloes',
      type: 'balloon_arch',
      widthCm,
      heightCm,
      previewUrl,
      isCustom: true,
      stockQuantity: 1,
      rentalPrice: Math.round(widthCm * 0.75),
      modularColors: [this.palette.A, this.palette.B, this.palette.C, this.palette.D]
    });

    if (this.onSavedCallback) {
      this.onSavedCallback(newItem);
    }

    if (insertDirectly && this.onInsertCallback) {
      this.onInsertCallback(newItem);
      this.close();
    } else {
      alert(`Arranjo "${itemName}" salvo com sucesso em Meus Elementos!`);
    }

    return newItem;
  }
}
