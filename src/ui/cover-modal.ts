import { getAllCovers, addCustomCover, deleteCustomCover, type CoverItemRecord } from '../core/db';
import { optimizeUserUploadedImage } from '../core/image-optimizer';
import {
  PARTY_PALETTE_GROUPS,
  hslToHex,
  hexToHsl
} from '../core/color-extractor';
import type { CanvasEngine } from '../core/canvas-engine';
import type { PresetItem } from '../types';

const RECENT_COLORS_KEY = 'minha-festa-recent-colors';

export class CoverModal {
  canvasEngine: CanvasEngine;
  targetMeta: PresetItem | null;
  modalEl: HTMLElement | null;

  // Abas
  subtabBtnColors: HTMLElement | null;
  subtabBtnCovers: HTMLElement | null;
  tabPaneColors: HTMLElement | null;
  tabPaneCovers: HTMLElement | null;

  // Seletor de Parte (Mesa Orgânica: Base vs Tampo Feijão)
  partSelectorEl: HTMLElement | null;
  partBtnCylinder: HTMLElement | null;
  partBtnTabletop: HTMLElement | null;
  activePart: 'cylinder' | 'tabletop' = 'cylinder';

  // Seletor de Cores
  previewBadge: HTMLElement | null;
  sliderHue: HTMLInputElement | null;
  sliderLightness: HTMLInputElement | null;
  hexTextInput: HTMLInputElement | null;
  btnApplyCustomColor: HTMLElement | null;

  // Paletas e Conta-gotas
  sceneColorsContainer: HTMLElement | null;
  curatedPalettesContainer: HTMLElement | null;
  btnTriggerEyedropper: HTMLElement | null;
  eyedropperActiveBanner: HTMLElement | null;
  btnCancelEyedropper: HTMLElement | null;
  loupeEl: HTMLElement | null;
  loupeCanvas: HTMLCanvasElement | null;
  loupeSwatch: HTMLElement | null;
  loupeHex: HTMLElement | null;
  isEyedropperActive = false;
  private eyedropperCleanup: (() => void) | null = null;

  // Capas e Uploads
  calloutPlaceholder: HTMLElement | null;
  fileInputEl: HTMLInputElement | null;
  btnUploadTrigger: HTMLElement | null;
  btnRemoveCover: HTMLElement | null;
  myCoversGrid: HTMLElement | null;
  factoryCoversGrid: HTMLElement | null;
  btnClose: HTMLElement | null;

  // Estado Interno
  currentHue = 41;
  currentSaturation = 50;
  currentLightness = 56;
  currentHex = '#B58938';
  activeSubtab: 'colors' | 'covers' = 'colors';
  private curatedPalettesRendered = false;
  private factoryCoversRendered = false;

  constructor(canvasEngine: CanvasEngine) {
    this.canvasEngine = canvasEngine;
    this.targetMeta = null;

    this.modalEl = document.getElementById('cover-modal');
    this.btnClose = document.getElementById('btn-close-cover-modal');

    // Seletor de Parte
    this.partSelectorEl = document.getElementById('cover-modal-part-selector');
    this.partBtnCylinder = document.getElementById('part-btn-cylinder');
    this.partBtnTabletop = document.getElementById('part-btn-tabletop');

    // Abas
    this.subtabBtnColors = document.getElementById('subtab-btn-colors');
    this.subtabBtnCovers = document.getElementById('subtab-btn-covers');
    this.tabPaneColors = document.getElementById('cover-tab-colors');
    this.tabPaneCovers = document.getElementById('cover-tab-covers');

    // Seletor de Cor
    this.previewBadge = document.getElementById('color-studio-preview');
    this.sliderHue = document.getElementById('slider-hue') as HTMLInputElement | null;
    this.sliderLightness = document.getElementById('slider-lightness') as HTMLInputElement | null;
    this.hexTextInput = document.getElementById('color-hex-text-input') as HTMLInputElement | null;
    this.btnApplyCustomColor = document.getElementById('btn-apply-custom-color');

    // Paletas
    this.sceneColorsContainer = document.getElementById('scene-active-colors-container');
    this.curatedPalettesContainer = document.getElementById('curated-palettes-container');
    this.btnTriggerEyedropper = document.getElementById('btn-trigger-eyedropper');
    this.eyedropperActiveBanner = document.getElementById('eyedropper-active-banner');
    this.btnCancelEyedropper = document.getElementById('btn-cancel-eyedropper');
    this.loupeEl = document.getElementById('eyedropper-loupe');
    this.loupeCanvas = document.getElementById('eyedropper-loupe-canvas') as HTMLCanvasElement | null;
    this.loupeSwatch = document.getElementById('eyedropper-loupe-swatch');
    this.loupeHex = document.getElementById('eyedropper-loupe-hex');

    // Capas
    this.calloutPlaceholder = document.getElementById('cover-active-callout-placeholder');
    this.fileInputEl = document.getElementById('cover-upload-input') as HTMLInputElement | null;
    this.btnUploadTrigger = document.getElementById('btn-upload-cover-trigger');
    this.btnRemoveCover = document.getElementById('btn-remove-cover');
    this.myCoversGrid = document.getElementById('my-covers-grid');
    this.factoryCoversGrid = document.getElementById('factory-covers-grid');

    this.setupEvents();

    // Pré-renderiza paletas curadas estáticas em segundo plano
    setTimeout(() => {
      this.renderCuratedPalettes();
      this.loadCovers().catch(() => {});
    }, 100);
  }

  setupEvents(): void {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Troca de Abas (Cores vs Estampas)
    this.subtabBtnColors?.addEventListener('click', () => this.switchSubtab('colors'));
    this.subtabBtnCovers?.addEventListener('click', () => this.switchSubtab('covers'));

    // Slider de Matiz (Hue)
    this.sliderHue?.addEventListener('input', () => {
      this.currentHue = parseInt(this.sliderHue?.value || '0', 10);
      if (this.currentSaturation === 0) {
        this.currentSaturation = 80;
      }
      this.updateColorFromSliders();
    });

    // Slider de Luminosidade
    this.sliderLightness?.addEventListener('input', () => {
      this.currentLightness = parseInt(this.sliderLightness?.value || '85', 10);
      this.updateColorFromSliders();
    });

    // Input de Texto Hexadecimal
    this.hexTextInput?.addEventListener('change', () => {
      let val = this.hexTextInput?.value.trim().replace('#', '') || 'FFFFFF';
      if (val.length === 3) {
        val = val.split('').map((c) => c + c).join('');
      }
      if (/^[0-9A-Fa-f]{6}$/.test(val)) {
        this.setColorHex(`#${val}`);
      }
    });

    // Aplicar Cor Livre na Peça
    this.btnApplyCustomColor?.addEventListener('click', () => {
      this.applySolidColor(this.currentHex);
    });

    // Ferramenta Conta-gotas no Cenário
    this.btnTriggerEyedropper?.addEventListener('click', () => {
      this.startEyedropper();
    });

    this.btnCancelEyedropper?.addEventListener('click', () => {
      this.cancelEyedropper();
    });

    // Upload de Nova Estampa / Foto
    this.btnUploadTrigger?.addEventListener('click', () => {
      this.fileInputEl?.click();
    });

    this.fileInputEl?.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;

      try {
        const imageUrl = await optimizeUserUploadedImage(file, 1400);
        const newCover = await addCustomCover({
          themeName: 'Minhas Estampas',
          name: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: imageUrl,
          targetType: 'all'
        });

        await this.canvasEngine.applyCoverToSelected(newCover.imageUrl);
        this.close();
        this.canvasEngine.enterCoverRepositionMode();
      } catch (err) {
        console.error('Falha ao processar estampa:', err);
      }
      if (this.fileInputEl) this.fileInputEl.value = '';
    });

    // Remover Estampa / Restaurar Base
    this.btnRemoveCover?.addEventListener('click', async () => {
      if (Boolean(this.targetMeta?.type?.startsWith('table_organic_bean')) && this.activePart === 'tabletop') {
        await this.canvasEngine.applyTabletopColorToSelected('#FAF8F5');
      } else {
        await this.canvasEngine.applyCoverToSelected(null);
        this.canvasEngine.applySolidColorToSelected(null);
      }
      this.close();
    });

    // Seletor de Parte da Mesa Orgânica (Base Cilindro vs Tampo Feijão)
    this.partBtnCylinder?.addEventListener('click', () => this.switchPart('cylinder'));
    this.partBtnTabletop?.addEventListener('click', () => this.switchPart('tabletop'));
  }

  switchPart(part: 'cylinder' | 'tabletop'): void {
    this.activePart = part;
    const subtitleEl = document.getElementById('cover-modal-subtitle');

    if (part === 'tabletop') {
      this.partBtnCylinder?.classList.remove('active');
      this.partBtnTabletop?.classList.add('active');

      // O tampo aceita exclusivamente cor sólida
      if (this.subtabBtnCovers) {
        this.subtabBtnCovers.style.display = 'none';
      }
      this.switchSubtab('colors');

      const topHex = this.targetMeta?.tabletopColor || '#FAF8F5';
      this.setColorHex(topHex);

      if (subtitleEl && this.targetMeta) {
        subtitleEl.textContent = `${this.targetMeta.name} • Escolha a Cor do Tampo Curvo (Feijão)`;
      }
    } else {
      this.partBtnCylinder?.classList.add('active');
      this.partBtnTabletop?.classList.remove('active');

      if (this.subtabBtnCovers) {
        this.subtabBtnCovers.style.display = 'inline-flex';
      }

      const cylHex = this.targetMeta?.customColor || '#B58938';
      this.setColorHex(cylHex);

      if (subtitleEl && this.targetMeta) {
        subtitleEl.textContent = `${this.targetMeta.name} • Escolha uma Cor Sólida ou Capa para a Base (Cilindro)`;
      }
    }

    this.renderSceneActiveColors();
    this.renderCuratedPalettes();
  }

  switchSubtab(tab: 'colors' | 'covers'): void {
    this.activeSubtab = tab;
    if (tab === 'colors') {
      this.subtabBtnColors?.classList.add('active');
      this.subtabBtnCovers?.classList.remove('active');
      this.tabPaneColors?.classList.add('active');
      this.tabPaneCovers?.classList.remove('active');
    } else {
      this.subtabBtnColors?.classList.remove('active');
      this.subtabBtnCovers?.classList.add('active');
      this.tabPaneColors?.classList.remove('active');
      this.tabPaneCovers?.classList.add('active');
      this.loadCovers();
    }
  }

  async open(meta: PresetItem | null): Promise<void> {
    this.targetMeta = meta;
    this.activePart = 'cylinder';

    // 1. Abre o modal imediatamente no compositor (0ms)
    this.modalEl?.classList.add('open');

    // Configura o seletor de parte caso seja mesa orgânica
    if (Boolean(this.targetMeta?.type?.startsWith('table_organic_bean'))) {
      if (this.partSelectorEl) this.partSelectorEl.style.display = 'flex';
      this.partBtnCylinder?.classList.add('active');
      this.partBtnTabletop?.classList.remove('active');
      if (this.subtabBtnCovers) this.subtabBtnCovers.style.display = 'inline-flex';
    } else {
      if (this.partSelectorEl) this.partSelectorEl.style.display = 'none';
      if (this.subtabBtnCovers) this.subtabBtnCovers.style.display = 'inline-flex';
    }

    const subtitleEl = document.getElementById('cover-modal-subtitle');
    if (subtitleEl && meta) {
      if (meta.type.startsWith('table_organic_bean')) {
        subtitleEl.textContent = `${meta.name} • Escolha uma Cor Sólida ou Capa para a Base (Cilindro)`;
      } else {
        subtitleEl.textContent = `${meta.name} • Escolha uma Cor Sólida ou Capa`;
      }
    }

    const hasCover = Boolean(meta?.customCoverUrl);
    this.renderCallout(hasCover);

    // Inicializa a cor atual
    const initialHex = meta?.customColor || '#B58938';
    this.setColorHex(initialHex);

    // Renderiza seções da aba Cores de forma instantânea (cacheado)
    this.renderSceneActiveColors();
    this.renderCuratedPalettes();

    // Abre na aba de capas se o item já tiver capa, senão abre na de cores
    this.switchSubtab(hasCover ? 'covers' : 'colors');

    // Carrega/sincroniza capas assincronamente sem travar o frame de abertura
    this.loadCovers().catch(() => {});
  }

  close(): void {
    this.modalEl?.classList.remove('open');
  }

  renderCallout(hasCover: boolean): void {
    if (!this.calloutPlaceholder) return;
    if (!hasCover) {
      this.calloutPlaceholder.innerHTML = '';
      return;
    }

    this.calloutPlaceholder.innerHTML = `
      <div class="cover-reposition-callout" style="margin-bottom: 12px;">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <strong style="font-size: 0.8rem; color: #fff; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            Capa Aplicada na Estrutura
          </strong>
          <span style="font-size: 0.7rem; color: var(--text-muted);">Arraste e dê zoom para enquadrar a estampa no palco</span>
        </div>
        <button type="button" id="btn-modal-reposition-active-cover" class="btn-reposition-highlight" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          Enquadrar Capa
        </button>
      </div>
    `;

    this.calloutPlaceholder.querySelector('#btn-modal-reposition-active-cover')?.addEventListener('click', () => {
      this.close();
      this.canvasEngine.enterCoverRepositionMode();
    });
  }

  // ========================================================
  // SELETOR DE COR LIVRE INTEGRADO
  // ========================================================
  updateColorFromSliders(): void {
    this.currentHex = hslToHex(this.currentHue, this.currentSaturation, this.currentLightness);
    this.refreshColorStudioUI();
  }

  setColorHex(hex: string): void {
    this.currentHex = hex.toLowerCase();
    const hsl = hexToHsl(this.currentHex);
    this.currentHue = hsl.h;
    this.currentSaturation = hsl.s !== undefined && !isNaN(hsl.s) ? hsl.s : 75;
    this.currentLightness = hsl.l;

    if (this.sliderHue) this.sliderHue.value = String(this.currentHue);
    if (this.sliderLightness) this.sliderLightness.value = String(this.currentLightness);

    this.refreshColorStudioUI();
  }

  refreshColorStudioUI(): void {
    if (this.previewBadge) {
      this.previewBadge.style.backgroundColor = this.currentHex;
    }
    if (this.hexTextInput) {
      this.hexTextInput.value = this.currentHex.replace('#', '').toUpperCase();
    }
    if (this.sliderLightness) {
      const pureHueHex = hslToHex(this.currentHue, 100, 50);
      this.sliderLightness.style.background = `linear-gradient(to right, #000000 0%, ${pureHueHex} 50%, #ffffff 100%)`;
    }
  }

  applySolidColor(hex: string): void {
    this.saveRecentColor(hex);
    if (Boolean(this.targetMeta?.type?.startsWith('table_organic_bean')) && this.activePart === 'tabletop') {
      this.canvasEngine.applyTabletopColorToSelected(hex);
    } else {
      this.canvasEngine.applySolidColorToSelected(hex);
    }
    this.close();
  }

  // ========================================================
  // CORES DO CENÁRIO E PALETAS
  // ========================================================
  renderSceneActiveColors(): void {
    if (!this.sceneColorsContainer) return;
    const colorsSet = new Set<string>();

    // 1. Cores de peças no palco
    const nodes = this.canvasEngine.decorLayer.getChildren();
    nodes.forEach((node) => {
      const meta = node.getAttr('itemMeta') as PresetItem | undefined;
      if (meta?.customColor) colorsSet.add(meta.customColor.toLowerCase());
      if (meta?.modularColors && Array.isArray(meta.modularColors)) {
        meta.modularColors.forEach((c) => colorsSet.add(c.toLowerCase()));
      }
      if (meta?.balloonColors && Array.isArray(meta.balloonColors)) {
        meta.balloonColors.forEach((c) => colorsSet.add(c.toLowerCase()));
      }
    });

    // 2. Cores salvas no histórico recente do navegador
    try {
      const recent = JSON.parse(localStorage.getItem(RECENT_COLORS_KEY) || '[]');
      if (Array.isArray(recent)) {
        recent.forEach((c) => colorsSet.add(c.toLowerCase()));
      }
    } catch (e) {
      // Ignora erro de JSON
    }

    const colorsList = Array.from(colorsSet).slice(0, 24);

    if (colorsList.length === 0) {
      this.sceneColorsContainer.style.display = 'none';
      return;
    }

    const currentActiveColor = (
      this.activePart === 'tabletop' ? this.targetMeta?.tabletopColor : this.targetMeta?.customColor
    )?.toLowerCase() || '';

    this.sceneColorsContainer.style.display = 'flex';
    this.sceneColorsContainer.innerHTML = `
      <div class="scene-colors-label">
        <span style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>
          Cores em Uso no Cenário / Recentes
        </span>
        ${colorsList.length > 7 ? '<span style="font-size: 0.65rem; color: var(--text-muted); font-weight: normal;">deslize para ver mais →</span>' : ''}
      </div>
      <div class="scene-colors-swatches-grid">
        ${colorsList
          .map(
            (c) =>
              `<button type="button" class="solid-color-swatch-btn ${
                currentActiveColor === c ? 'active' : ''
              }" data-hex="${c}" style="background-color: ${c};" title="${c}"></button>`
          )
          .join('')}
      </div>
    `;

    this.sceneColorsContainer.querySelectorAll('.solid-color-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hex = (btn as HTMLElement).dataset.hex;
        if (hex) {
          this.setColorHex(hex);
          this.applySolidColor(hex);
        }
      });
    });
  }

  saveRecentColor(hex: string): void {
    try {
      const recent: string[] = JSON.parse(localStorage.getItem(RECENT_COLORS_KEY) || '[]');
      const filtered = recent.filter((c) => c.toLowerCase() !== hex.toLowerCase());
      filtered.unshift(hex.toLowerCase());
      localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(filtered.slice(0, 24)));
    } catch (e) {
      // Ignora erro de armazenamento
    }
  }

  renderCuratedPalettes(): void {
    if (!this.curatedPalettesContainer) return;

    const currentActiveHex = (
      this.activePart === 'tabletop' ? this.targetMeta?.tabletopColor : this.targetMeta?.customColor
    )?.toLowerCase() || '';

    if (this.curatedPalettesRendered) {
      this.curatedPalettesContainer.querySelectorAll<HTMLButtonElement>('.solid-color-swatch-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.hex?.toLowerCase() === currentActiveHex);
      });
      return;
    }

    this.curatedPalettesRendered = true;
    this.curatedPalettesContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();
    PARTY_PALETTE_GROUPS.forEach((group) => {
      const groupEl = document.createElement('div');
      groupEl.className = 'curated-palette-group';

      const swatchesHtml = group.colors
        .map(
          (c) =>
            `<button type="button" class="solid-color-swatch-btn ${
              currentActiveHex === c.hex.toLowerCase() ? 'active' : ''
            }" data-hex="${c.hex}" title="${c.name}" style="background-color: ${c.hex};"></button>`
        )
        .join('');

      groupEl.innerHTML = `
        <div class="curated-palette-title">${group.name}</div>
        <div class="curated-palette-swatches">${swatchesHtml}</div>
      `;

      groupEl.querySelectorAll('.solid-color-swatch-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const hex = (btn as HTMLElement).dataset.hex;
          if (hex) {
            this.setColorHex(hex);
            this.applySolidColor(hex);
          }
        });
      });

      fragment.appendChild(groupEl);
    });

    this.curatedPalettesContainer.appendChild(fragment);
  }

  // ========================================================
  // CONTA-GOTAS DINÂMICO NO CENÁRIO
  // ========================================================
  async startEyedropper(): Promise<void> {
    const meta = this.targetMeta;
    const part = this.activePart;

    // 1. Oculta o modal instantaneamente (sem transição de fade preto que distorcia a cor)
    if (this.modalEl) {
      this.modalEl.style.display = 'none';
      this.modalEl.classList.remove('open');
    }

    // 2. Oculta temporariamente a camada UI (Transformer, âncoras e botões de ação) para visão 100% limpa
    const wasUiVisible = this.canvasEngine.uiLayer.visible();
    this.canvasEngine.uiLayer.visible(false);
    this.canvasEngine.uiLayer.batchDraw();

    // 3. Exibe o banner de instrução no topo e ativa o modo de captura no canvas
    if (this.eyedropperActiveBanner) {
      this.eyedropperActiveBanner.style.display = 'flex';
    }
    this.isEyedropperActive = true;

    const stageContainer = this.canvasEngine.stage?.container();
    if (stageContainer) {
      stageContainer.style.cursor = 'crosshair';
    }

    let currentSampledHex: string | null = null;

    const updateLoupeAt = (clientX: number, clientY: number) => {
      if (!this.canvasEngine.stage || !this.loupeEl) return;
      const container = this.canvasEngine.stage.container();
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;

      // Se o cursor estiver fora do contêiner do palco, oculta a lupa
      if (screenX < -15 || screenX > rect.width + 15 || screenY < -15 || screenY > rect.height + 15) {
        this.loupeEl.style.display = 'none';
        return;
      }

      this.loupeEl.style.display = 'flex';
      this.loupeEl.style.left = `${clientX}px`;
      this.loupeEl.style.top = `${clientY}px`;
      if (clientY < 110) {
        this.loupeEl.style.transform = 'translate(-50%, 25px)';
      } else {
        this.loupeEl.style.transform = 'translate(-50%, -125%)';
      }

      const sampleResult = this.sampleStageColorAt(clientX, clientY);
      if (sampleResult) {
        currentSampledHex = sampleResult.hex;
        if (this.loupeSwatch) {
          this.loupeSwatch.style.backgroundColor = sampleResult.hex;
        }
        if (this.loupeHex) {
          this.loupeHex.textContent = sampleResult.label
            ? `${sampleResult.hex.toUpperCase()} • ${sampleResult.label}`
            : sampleResult.hex.toUpperCase();
        }
      }

      if (this.loupeCanvas) {
        this.renderLoupeMagnifiedView(this.loupeCanvas, screenX, screenY, rect);
      }
    };

    const cleanup = () => {
      this.isEyedropperActive = false;
      this.stopEyedropperBanner();
      if (this.loupeEl) {
        this.loupeEl.style.display = 'none';
      }
      if (stageContainer) {
        stageContainer.style.cursor = 'default';
        stageContainer.removeEventListener('pointerdown', onPointerDown, true);
        stageContainer.removeEventListener('pointermove', onPointerMove, true);
      }
      window.removeEventListener('keydown', onKeyDown);

      // Restaura a camada de UI
      this.canvasEngine.uiLayer.visible(wasUiVisible);
      this.canvasEngine.uiLayer.batchDraw();

      // Restaura o display do modal
      if (this.modalEl) {
        this.modalEl.style.display = '';
      }
      this.eyedropperCleanup = null;
    };

    const onPointerMove = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest('#eyedropper-active-banner')) {
        if (this.loupeEl) this.loupeEl.style.display = 'none';
        return;
      }
      updateLoupeAt(e.clientX, e.clientY);
    };

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest('#eyedropper-active-banner')) return;

      e.preventDefault();
      e.stopPropagation();

      const clientX = e.clientX;
      const clientY = e.clientY;

      const sample = this.sampleStageColorAt(clientX, clientY);
      const pickedColor = sample?.hex || currentSampledHex || '#B58938';

      cleanup();
      this.handleEyedropperColorPicked(pickedColor, meta, part);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
        this.open(meta);
        this.switchPart(part);
      }
    };

    if (stageContainer) {
      stageContainer.addEventListener('pointermove', onPointerMove, true);
      stageContainer.addEventListener('pointerdown', onPointerDown, true);
    }
    window.addEventListener('keydown', onKeyDown);

    this.eyedropperCleanup = cleanup;
  }

  cancelEyedropper(): void {
    if (this.eyedropperCleanup) {
      this.eyedropperCleanup();
    }
    this.stopEyedropperBanner();
    this.open(this.targetMeta);
    this.switchPart(this.activePart);
  }

  private stopEyedropperBanner(): void {
    if (this.eyedropperActiveBanner) {
      this.eyedropperActiveBanner.style.display = 'none';
    }
    if (this.loupeEl) {
      this.loupeEl.style.display = 'none';
    }
  }

  private async handleEyedropperColorPicked(hex: string, meta: PresetItem | null, part: 'cylinder' | 'tabletop'): Promise<void> {
    this.saveRecentColor(hex);

    if (Boolean(meta?.type?.startsWith('table_organic_bean')) && part === 'tabletop') {
      await this.canvasEngine.applyTabletopColorToSelected(hex);
    } else {
      this.canvasEngine.applySolidColorToSelected(hex);
    }

    await this.open(meta);
    this.switchPart(part);
    this.setColorHex(hex);
  }

  private renderLoupeMagnifiedView(
    loupeCanvas: HTMLCanvasElement,
    screenX: number,
    screenY: number,
    rect: DOMRect
  ): void {
    const bgCanvas = this.canvasEngine.bgLayer?.getCanvas()?._canvas;
    const decorCanvas = this.canvasEngine.decorLayer?.getCanvas()?._canvas;
    if (!bgCanvas) return;

    const ctx = loupeCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const scaleX = bgCanvas.width / (rect.width || 1);
    const scaleY = bgCanvas.height / (rect.height || 1);
    const sourceX = Math.round(screenX * scaleX);
    const sourceY = Math.round(screenY * scaleY);

    const PATCH_SIZE = 16;
    const halfPatch = Math.floor(PATCH_SIZE / 2);

    const sx = Math.max(0, Math.min(bgCanvas.width - PATCH_SIZE, sourceX - halfPatch));
    const sy = Math.max(0, Math.min(bgCanvas.height - PATCH_SIZE, sourceY - halfPatch));

    ctx.clearRect(0, 0, loupeCanvas.width, loupeCanvas.height);

    // 1. Parede e Piso
    try {
      ctx.drawImage(
        bgCanvas,
        sx,
        sy,
        PATCH_SIZE,
        PATCH_SIZE,
        0,
        0,
        loupeCanvas.width,
        loupeCanvas.height
      );
    } catch {
      // Ignora erro em caso de CORS
    }

    // 2. Peças Decorativas
    if (decorCanvas) {
      try {
        ctx.drawImage(
          decorCanvas,
          sx,
          sy,
          PATCH_SIZE,
          PATCH_SIZE,
          0,
          0,
          loupeCanvas.width,
          loupeCanvas.height
        );
      } catch {
        // Ignora erro em caso de CORS
      }
    }
  }

  sampleStageColorAt(clientX: number, clientY: number): { hex: string; label?: string } | null {
    try {
      if (!this.canvasEngine.stage) return null;
      const container = this.canvasEngine.stage.container();
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;

      if (screenX < 0 || screenX > rect.width || screenY < 0 || screenY > rect.height) {
        return null;
      }

      // 1. Prioridade inteligente: se passou por cima de um item decorativo com cor configurada
      const finalScale = this.canvasEngine.baseScale * this.canvasEngine.zoomLevel;
      const finalPosX = this.canvasEngine.baseOffsetX + this.canvasEngine.panX;
      const finalPosY = this.canvasEngine.baseOffsetY + this.canvasEngine.panY;

      const virtualX = (screenX - finalPosX) / finalScale;
      const virtualY = (screenY - finalPosY) / finalScale;

      const items = this.canvasEngine.findOpaqueItemsAtPoint({ x: virtualX, y: virtualY });
      if (items && items.length > 0) {
        const topItem = items[0];
        const meta = topItem.getAttr('itemMeta') as PresetItem | undefined;
        if (meta) {
          if (meta.type?.startsWith('table_organic_bean') && meta.tabletopColor) {
            return { hex: meta.tabletopColor.toLowerCase(), label: meta.name };
          }
          if (meta.customColor) {
            return { hex: meta.customColor.toLowerCase(), label: meta.name };
          }
        }
      }

      // 2. Amostragem direta dos pixels reais do canvas (bgLayer + decorLayer)
      const bgCanvas = this.canvasEngine.bgLayer?.getCanvas()?._canvas;
      const decorCanvas = this.canvasEngine.decorLayer?.getCanvas()?._canvas;
      if (!bgCanvas) return null;

      const scaleX = bgCanvas.width / (rect.width || 1);
      const scaleY = bgCanvas.height / (rect.height || 1);
      const sourceX = Math.round(screenX * scaleX);
      const sourceY = Math.round(screenY * scaleY);

      const clampedX = Math.max(0, Math.min(bgCanvas.width - 1, sourceX));
      const clampedY = Math.max(0, Math.min(bgCanvas.height - 1, sourceY));

      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 1;
      sampleCanvas.height = 1;
      const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      if (!sCtx) return null;

      sCtx.drawImage(bgCanvas, clampedX, clampedY, 1, 1, 0, 0, 1, 1);
      if (decorCanvas) {
        sCtx.drawImage(decorCanvas, clampedX, clampedY, 1, 1, 0, 0, 1, 1);
      }

      const pixel = sCtx.getImageData(0, 0, 1, 1).data;
      if (pixel[3] < 10) return null;

      const r = pixel[0].toString(16).padStart(2, '0');
      const g = pixel[1].toString(16).padStart(2, '0');
      const b = pixel[2].toString(16).padStart(2, '0');
      return { hex: `#${r}${g}${b}` };
    } catch (err) {
      console.warn('Erro ao capturar cor da tela:', err);
      return null;
    }
  }

  // ========================================================
  // ABA DE ESTAMPAS E REUTILIZAÇÃO DE IMAGENS
  // ========================================================
  async loadCovers(): Promise<void> {
    const allCovers = await getAllCovers();
    const customCovers = allCovers.filter((c) => c.isCustom).reverse();
    const factoryCovers = allCovers.filter((c) => !c.isCustom);

    // 1. Minhas Imagens e Uploads Recentes
    if (this.myCoversGrid) {
      this.myCoversGrid.innerHTML = '';
      if (customCovers.length === 0) {
        this.myCoversGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 18px 12px; text-align: center; color: var(--text-muted); font-size: 0.76rem; border: 1px dashed var(--border-subtle); border-radius: var(--radius-md);">
            Nenhuma estampa cadastrada ainda. Toque em <strong>"Subir nova estampa"</strong> para importar suas estampas e fotos!
          </div>
        `;
      } else {
        const frag = document.createDocumentFragment();
        customCovers.forEach((cover) => {
          const card = this.createMyCoverCard(cover);
          frag.appendChild(card);
        });
        this.myCoversGrid.appendChild(frag);
      }
    }

    // 2. Capas do Catálogo Padrão de Fábrica (Cacheado no DOM)
    if (this.factoryCoversGrid) {
      if (this.factoryCoversRendered) {
        this.factoryCoversGrid.querySelectorAll<HTMLElement>('.cover-card').forEach((card) => {
          card.classList.toggle('selected', card.dataset.coverUrl === this.targetMeta?.customCoverUrl);
        });
      } else {
        this.factoryCoversRendered = true;
        this.factoryCoversGrid.innerHTML = '';
        const frag = document.createDocumentFragment();
        factoryCovers.forEach((cover) => {
          const card = document.createElement('div');
          card.className = 'cover-card';
          card.dataset.coverUrl = cover.imageUrl;
          if (this.targetMeta?.customCoverUrl === cover.imageUrl) {
            card.classList.add('selected');
          }
          card.innerHTML = `
            <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy" decoding="async"/>
            <div class="cover-card-label">${cover.name}</div>
          `;

          card.addEventListener('click', async () => {
            await this.canvasEngine.applyCoverToSelected(cover.imageUrl);
            this.close();
          });

          frag.appendChild(card);
        });
        this.factoryCoversGrid.appendChild(frag);
      }
    }
  }

  createMyCoverCard(cover: CoverItemRecord): HTMLElement {
    const card = document.createElement('div');
    card.className = 'my-cover-card';
    if (this.targetMeta?.customCoverUrl === cover.imageUrl) {
      card.classList.add('selected');
    }

    card.innerHTML = `
      <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy" />
      <div class="my-cover-card-actions">
        <button type="button" class="btn-card-action btn-del-cover" title="Excluir da Minha Galeria">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="cover-card-label">${cover.name}</div>
    `;

    // 1 Toque: Reutiliza a imagem aplicando como capa na peça selecionada
    card.addEventListener('click', async (e) => {
      if ((e.target as HTMLElement).closest('.btn-card-action')) return;
      await this.canvasEngine.applyCoverToSelected(cover.imageUrl);
      this.close();
      this.canvasEngine.enterCoverRepositionMode();
    });

    // Ação: Excluir imagem do acervo pessoal
    card.querySelector('.btn-del-cover')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Deseja remover "${cover.name}" das suas estampas salvas?`)) {
        await deleteCustomCover(cover.id);
        await this.loadCovers();
      }
    });

    return card;
  }
}
