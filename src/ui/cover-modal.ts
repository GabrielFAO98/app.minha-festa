import { getAllCovers, addCustomCover } from '../core/db';
import { SOLID_STRUCTURAL_COLORS } from '../core/modular-svg-generator';
import type { CanvasEngine } from '../core/canvas-engine';
import type { PresetItem } from '../types';

export class CoverModal {
  canvasEngine: CanvasEngine;
  targetMeta: PresetItem | null;
  modalEl: HTMLElement | null;
  gridEl: HTMLElement | null;
  solidColorsContainer: HTMLElement | null;
  repositionBannerEl: HTMLElement | null;
  fileInputEl: HTMLInputElement | null;
  btnUploadTrigger: HTMLElement | null;
  btnRemoveCover: HTMLElement | null;
  btnClose: HTMLElement | null;

  constructor(canvasEngine: CanvasEngine) {
    this.canvasEngine = canvasEngine;
    this.targetMeta = null;
    this.modalEl = document.getElementById('cover-modal');
    this.gridEl = document.getElementById('covers-modal-grid');
    this.solidColorsContainer = document.getElementById('solid-colors-modal-section');
    this.repositionBannerEl = document.getElementById('cover-reposition-Trigger-box');
    this.fileInputEl = document.getElementById('cover-upload-input') as HTMLInputElement | null;
    this.btnUploadTrigger = document.getElementById('btn-upload-cover-trigger');
    this.btnRemoveCover = document.getElementById('btn-remove-cover');
    this.btnClose = document.getElementById('btn-close-cover-modal');

    this.setupEvents();
  }

  setupEvents(): void {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.btnUploadTrigger?.addEventListener('click', () => {
      this.fileInputEl?.click();
    });

    this.fileInputEl?.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;
        if (!imageUrl) return;
        await addCustomCover({
          themeName: 'Minhas Estampas',
          name: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: imageUrl,
          targetType: 'all'
        });

        await this.canvasEngine.applyCoverToSelected(imageUrl);
        this.close();
        this.canvasEngine.enterCoverRepositionMode();
        this.loadCovers();
      };
      reader.readAsDataURL(file);
      if (this.fileInputEl) this.fileInputEl.value = '';
    });

    this.btnRemoveCover?.addEventListener('click', async () => {
      await this.canvasEngine.applyCoverToSelected(null);
      this.canvasEngine.applySolidColorToSelected(null);
      this.close();
    });
  }

  async open(meta: PresetItem | null): Promise<void> {
    this.targetMeta = meta;
    const titleEl = document.getElementById('cover-modal-subtitle');
    if (titleEl && meta) {
      titleEl.textContent = `${meta.name} • Escolha uma Cor Sólida ou Capa`;
    }

    this.renderSolidColorsSection();
    await this.loadCovers();
    this.modalEl?.classList.add('open');
  }

  close(): void {
    this.modalEl?.classList.remove('open');
  }

  renderSolidColorsSection(): void {
    if (!this.solidColorsContainer) return;
    const currentColor = this.targetMeta?.customColor || '#ffffff';
    const hasCover = Boolean(this.targetMeta?.customCoverUrl);

    const swatchesHtml = SOLID_STRUCTURAL_COLORS.map((c) => {
      const isSelected = !hasCover && this.targetMeta?.customColor?.toLowerCase() === c.hex.toLowerCase();
      return `<button type="button" class="solid-color-swatch-btn ${isSelected ? 'active' : ''}" data-hex="${c.hex}" title="${c.name}" style="background-color: ${c.hex};"></button>`;
    }).join('');

    this.solidColorsContainer.innerHTML = `
      ${hasCover ? `
        <div class="cover-reposition-callout">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <strong style="font-size: 0.8rem; color: #fff; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              Capa Aplicada na Estrutura
            </strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Arraste e dê zoom na capa como no Facebook</span>
          </div>
          <button type="button" id="btn-modal-reposition-cover" class="btn-reposition-highlight" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            Enquadrar Capa
          </button>
        </div>
      ` : ''}
      <div class="solid-colors-box">
        <div class="solid-colors-header">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z"/></svg>
            Pintar Estrutura com Cor Lisa (Sem Capa)
          </span>
          <label class="custom-color-inline-picker" title="Escolher qualquer cor">
            <input type="color" id="structural-free-color-input" value="${currentColor}" />
            <span>+ Cor Livre</span>
          </label>
        </div>
        <div class="solid-colors-swatches-grid">
          ${swatchesHtml}
        </div>
      </div>
    `;

    this.solidColorsContainer.querySelector('#btn-modal-reposition-cover')?.addEventListener('click', () => {
      this.close();
      this.canvasEngine.enterCoverRepositionMode();
    });

    this.solidColorsContainer.querySelectorAll('.solid-color-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hex = (btn as HTMLElement).dataset.hex;
        if (hex) {
          this.canvasEngine.applySolidColorToSelected(hex);
          this.close();
        }
      });
    });

    const freeColorInput = this.solidColorsContainer.querySelector('#structural-free-color-input') as HTMLInputElement | null;
    freeColorInput?.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (val) {
        this.canvasEngine.applySolidColorToSelected(val);
      }
    });
  }

  async loadCovers(): Promise<void> {
    if (!this.gridEl) return;
    const covers = await getAllCovers();
    this.gridEl.innerHTML = '';

    covers.forEach((cover) => {
      const card = document.createElement('div');
      card.className = 'cover-card';
      if (this.targetMeta?.customCoverUrl === cover.imageUrl) {
        card.classList.add('selected');
      }
      card.innerHTML = `
        <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy"/>
        <div class="cover-card-label">${cover.name}</div>
      `;

      card.addEventListener('click', async () => {
        await this.canvasEngine.applyCoverToSelected(cover.imageUrl);
        this.close();
      });

      this.gridEl?.appendChild(card);
    });
  }
}
