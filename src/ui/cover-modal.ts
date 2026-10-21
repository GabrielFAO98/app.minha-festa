import { getAllCovers, addCustomCover, deleteCustomCover, type CoverItemRecord } from '../core/db';
import { optimizeUserUploadedImage } from '../core/image-optimizer';
import {
  PARTY_PALETTE_GROUPS,
  extractColorsFromImage,
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

  // Seletor de Cores
  previewBadge: HTMLElement | null;
  sliderHue: HTMLInputElement | null;
  sliderLightness: HTMLInputElement | null;
  hexTextInput: HTMLInputElement | null;
  btnApplyCustomColor: HTMLElement | null;

  // Paletas e Extração
  sceneColorsContainer: HTMLElement | null;
  curatedPalettesContainer: HTMLElement | null;
  btnTriggerPhotoExtract: HTMLElement | null;
  photoPaletteInput: HTMLInputElement | null;
  extractedPaletteRow: HTMLElement | null;

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
    this.btnTriggerPhotoExtract = document.getElementById('btn-trigger-photo-extract');
    this.photoPaletteInput = document.getElementById('photo-palette-input') as HTMLInputElement | null;
    this.extractedPaletteRow = document.getElementById('extracted-palette-row');

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

    // Extração de Paleta a partir de Imagem / Convite
    this.btnTriggerPhotoExtract?.addEventListener('click', () => {
      this.photoPaletteInput?.click();
    });

    this.photoPaletteInput?.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        if (!dataUrl) return;
        const colors = await extractColorsFromImage(dataUrl, 5);
        this.renderExtractedPalette(colors);
      };
      reader.readAsDataURL(file);
      if (this.photoPaletteInput) this.photoPaletteInput.value = '';
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
      await this.canvasEngine.applyCoverToSelected(null);
      this.canvasEngine.applySolidColorToSelected(null);
      this.close();
    });
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

    // 1. Abre o modal imediatamente no compositor (0ms)
    this.modalEl?.classList.add('open');

    const subtitleEl = document.getElementById('cover-modal-subtitle');
    if (subtitleEl && meta) {
      subtitleEl.textContent = `${meta.name} • Escolha uma Cor Sólida ou Capa`;
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
    this.currentSaturation = hsl.s || 75;
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
      this.sliderLightness.style.background = `linear-gradient(to right, #ffffff 0%, ${pureHueHex} 50%, #000000 100%)`;
    }
  }

  applySolidColor(hex: string): void {
    this.saveRecentColor(hex);
    this.canvasEngine.applySolidColorToSelected(hex);
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

    const colorsList = Array.from(colorsSet).slice(0, 14);

    if (colorsList.length === 0) {
      this.sceneColorsContainer.style.display = 'none';
      return;
    }

    this.sceneColorsContainer.style.display = 'flex';
    this.sceneColorsContainer.innerHTML = `
      <div class="scene-colors-label">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>
        Cores em Uso no Cenário / Recentes
      </div>
      <div class="scene-colors-swatches-grid">
        ${colorsList
          .map(
            (c) =>
              `<button type="button" class="solid-color-swatch-btn ${
                this.targetMeta?.customColor?.toLowerCase() === c ? 'active' : ''
              }" data-hex="${c}" style="background-color: ${c}; width: 28px; height: 28px;" title="${c}"></button>`
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
      localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(filtered.slice(0, 16)));
    } catch (e) {
      // Ignora erro de armazenamento
    }
  }

  renderCuratedPalettes(): void {
    if (!this.curatedPalettesContainer) return;

    if (this.curatedPalettesRendered) {
      const activeHex = this.targetMeta?.customColor?.toLowerCase() || '';
      this.curatedPalettesContainer.querySelectorAll<HTMLButtonElement>('.solid-color-swatch-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.hex?.toLowerCase() === activeHex);
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
              this.targetMeta?.customColor?.toLowerCase() === c.hex.toLowerCase() ? 'active' : ''
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

  renderExtractedPalette(colors: string[]): void {
    if (!this.extractedPaletteRow) return;
    if (colors.length === 0) {
      this.extractedPaletteRow.style.display = 'none';
      return;
    }

    this.extractedPaletteRow.style.display = 'flex';
    this.extractedPaletteRow.innerHTML = `
      <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary);">Cores Extraídas da Imagem:</div>
      <div class="extracted-swatches-list">
        ${colors
          .map(
            (c) =>
              `<button type="button" class="solid-color-swatch-btn" data-hex="${c}" style="background-color: ${c}; width: 28px; height: 28px;" title="${c}"></button>`
          )
          .join('')}
      </div>
    `;

    this.extractedPaletteRow.querySelectorAll('.solid-color-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hex = (btn as HTMLElement).dataset.hex;
        if (hex) {
          this.setColorHex(hex);
          this.applySolidColor(hex);
        }
      });
    });
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
        <button type="button" class="btn-card-action btn-extract-cover" title="Extrair Paleta de Cores desta Imagem">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z"/></svg>
        </button>
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

    // Ação: Extrair Paleta desta imagem
    card.querySelector('.btn-extract-cover')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const colors = await extractColorsFromImage(cover.imageUrl, 5);
      this.switchSubtab('colors');
      this.renderExtractedPalette(colors);
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
