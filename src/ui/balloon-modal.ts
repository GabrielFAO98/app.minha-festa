// Modal Universal de Customização Modular de Cores para Peças SVG Autossuficientes
import { BALLOON_PALETTES, generateBalloonArchDataUrl } from '../core/balloon-generator';
import { getItemCustomizationMode, getModularConfigForItem, generateModularSvgDataUrl } from '../core/modular-svg-generator';
import type { CanvasEngine } from '../core/canvas-engine';
import type { PresetItem } from '../types';
import type Konva from 'konva';

export class BalloonModal {
  canvasEngine: CanvasEngine;
  modalEl: HTMLElement | null;
  modalTitleEl: HTMLElement | null;
  modalSubtitleEl: HTMLElement | null;
  previewImg: HTMLImageElement | null;
  palettesContainer: HTMLElement | null;
  colorPickersContainer: HTMLElement | null;
  btnClose: HTMLElement | null;
  btnApply: HTMLElement | null;
  currentNode: Konva.Group | Konva.Node | null;
  currentColors: string[];
  currentSlotLabels: string[];

  constructor(canvasEngine: CanvasEngine) {
    this.canvasEngine = canvasEngine;
    this.modalEl = document.getElementById('balloon-modal');
    this.modalTitleEl = document.getElementById('modular-modal-title');
    this.modalSubtitleEl = document.getElementById('modular-modal-subtitle');
    this.previewImg = document.getElementById('balloon-preview-img') as HTMLImageElement | null;
    this.palettesContainer = document.getElementById('balloon-palettes-grid');
    this.colorPickersContainer = document.getElementById('balloon-color-pickers');
    this.btnClose = document.getElementById('btn-close-balloon-modal');
    this.btnApply = document.getElementById('btn-apply-balloon-colors');

    this.currentNode = null;
    this.currentColors = ['#d97706', '#1c0a00'];
    this.currentSlotLabels = ['Cor Principal', 'Cor Secundária'];

    this.setupEvents();
  }

  setupEvents(): void {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.btnApply?.addEventListener('click', () => {
      this.applyColors(true);
      this.close();
    });
  }

  open(node: Konva.Group | Konva.Node): void {
    this.currentNode = node;
    const meta = (node.getAttr('itemMeta') || {}) as PresetItem;
    const mode = getItemCustomizationMode(meta);

    if (mode === 'modular') {
      const config = getModularConfigForItem(meta);
      if (this.modalTitleEl) this.modalTitleEl.textContent = config.title;
      if (this.modalSubtitleEl) this.modalSubtitleEl.textContent = config.subtitle;
      this.currentSlotLabels = config.slotLabels;

      if (meta.modularColors && Array.isArray(meta.modularColors) && meta.modularColors.length > 0) {
        this.currentColors = [...meta.modularColors];
      } else {
        this.currentColors = [...config.defaultColors];
      }

      this.renderPalettesList(config.palettes);
    } else {
      if (this.modalTitleEl) this.modalTitleEl.textContent = 'Personalizar Cores';
      if (this.modalSubtitleEl) this.modalSubtitleEl.textContent = 'Escolha uma paleta de cores ou personalize cada tom';
      this.currentSlotLabels = ['Cor 1', 'Cor 2', 'Cor 3', 'Cor 4'];

      if (meta.balloonColors && Array.isArray(meta.balloonColors) && meta.balloonColors.length > 0) {
        this.currentColors = [...meta.balloonColors];
      } else {
        this.currentColors = ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7'];
      }

      this.renderPalettesList(BALLOON_PALETTES);
    }

    this.renderColorPickers();
    this.updatePreview();

    this.modalEl?.classList.add('open');
  }

  close(): void {
    this.modalEl?.classList.remove('open');
    this.currentNode = null;
  }

  updatePreview(): void {
    if (!this.currentNode || !this.previewImg) return;
    const meta = (this.currentNode.getAttr('itemMeta') || {}) as PresetItem;
    const mode = getItemCustomizationMode(meta);

    if (mode === 'modular') {
      const dataUrl = generateModularSvgDataUrl(meta, this.currentColors);
      this.previewImg.src = dataUrl;
    } else {
      const dataUrl = generateBalloonArchDataUrl(this.currentColors);
      this.previewImg.src = dataUrl;
    }
  }

  renderPalettesList(palettes: { name: string; colors: string[] }[]): void {
    if (!this.palettesContainer) return;
    this.palettesContainer.innerHTML = '';

    palettes.forEach((palette) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'balloon-palette-card';

      const circles = palette.colors
        .map((c) => `<span class="palette-swatch" style="background-color: ${c};"></span>`)
        .join('');

      card.innerHTML = `
        <div class="palette-swatches-row">${circles}</div>
        <div class="palette-name">${palette.name}</div>
      `;

      card.addEventListener('click', () => {
        this.currentColors = [...palette.colors];
        this.renderColorPickers();
        this.updatePreview();
        this.applyColors(false);
      });

      this.palettesContainer?.appendChild(card);
    });
  }

  renderColorPickers(): void {
    if (!this.colorPickersContainer) return;
    this.colorPickersContainer.innerHTML = '';

    this.currentColors.forEach((color, idx) => {
      const row = document.createElement('div');
      row.className = 'color-picker-item';
      const label = this.currentSlotLabels[idx] || `Cor ${idx + 1}`;

      row.innerHTML = `
        <div class="color-picker-label">${label}</div>
        <div class="color-picker-input-wrap">
          <input type="color" class="color-picker-native" value="${color}" data-index="${idx}" />
          <span class="color-hex-tag">${color.toUpperCase()}</span>
        </div>
      `;

      const input = row.querySelector('.color-picker-native') as HTMLInputElement | null;
      const hexTag = row.querySelector('.color-hex-tag');

      input?.addEventListener('input', (e) => {
        const val = (e.target as HTMLInputElement).value;
        this.currentColors[idx] = val;
        if (hexTag) hexTag.textContent = val.toUpperCase();
        this.updatePreview();
        this.applyColors(false);
      });

      this.colorPickersContainer?.appendChild(row);
    });
  }

  applyColors(saveHistory: boolean = true): void {
    if (!this.currentNode) return;
    this.canvasEngine.applyBalloonColorsToNode(this.currentNode, this.currentColors, saveHistory);
  }
}
