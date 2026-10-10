// Modal de Customizaǜo ParamǸtrica de Cores do Arco de Bales
import { BALLOON_PALETTES, generateBalloonArchDataUrl } from '../core/balloon-generator.js';

export class BalloonModal {
  constructor(canvasEngine) {
    this.canvasEngine = canvasEngine;
    this.modalEl = document.getElementById('balloon-modal');
    this.previewImg = document.getElementById('balloon-preview-img');
    this.palettesContainer = document.getElementById('balloon-palettes-grid');
    this.colorPickersContainer = document.getElementById('balloon-color-pickers');
    this.btnClose = document.getElementById('btn-close-balloon-modal');
    this.btnApply = document.getElementById('btn-apply-balloon-colors');

    this.currentNode = null;
    this.currentColors = ['#f472b6', '#fbcfe8', '#fbbf24', '#ffffff'];

    this.setupEvents();
  }

  setupEvents() {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.btnApply?.addEventListener('click', () => {
      this.applyColors();
      this.close();
    });
  }

  open(node) {
    this.currentNode = node;
    const meta = node.getAttr('itemMeta') || {};

    if (meta.balloonColors && Array.isArray(meta.balloonColors) && meta.balloonColors.length > 0) {
      this.currentColors = [...meta.balloonColors];
    } else {
      this.currentColors = ['#f472b6', '#fbcfe8', '#fbbf24', '#ffffff'];
    }

    this.renderPalettesList();
    this.renderColorPickers();
    this.updatePreview();

    this.modalEl?.classList.add('open');
  }

  close() {
    this.modalEl?.classList.remove('open');
    this.currentNode = null;
  }

  updatePreview() {
    const dataUrl = generateBalloonArchDataUrl(this.currentColors);
    if (this.previewImg) {
      this.previewImg.src = dataUrl;
    }
  }

  renderPalettesList() {
    if (!this.palettesContainer) return;
    this.palettesContainer.innerHTML = '';

    BALLOON_PALETTES.forEach((palette) => {
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
        this.applyColors(false); // Live preview no canvas
      });

      this.palettesContainer.appendChild(card);
    });
  }

  renderColorPickers() {
    if (!this.colorPickersContainer) return;
    this.colorPickersContainer.innerHTML = '';

    this.currentColors.forEach((color, idx) => {
      const row = document.createElement('div');
      row.className = 'color-picker-item';

      row.innerHTML = `
        <div class="color-picker-label">Cor ${idx + 1}</div>
        <div class="color-picker-input-wrap">
          <input type="color" class="color-picker-native" value="${color}" data-index="${idx}" />
          <span class="color-hex-tag">${color.toUpperCase()}</span>
        </div>
      `;

      const input = row.querySelector('.color-picker-native');
      const hexTag = row.querySelector('.color-hex-tag');

      input.addEventListener('input', (e) => {
        const val = e.target.value;
        this.currentColors[idx] = val;
        hexTag.textContent = val.toUpperCase();
        this.updatePreview();
        this.applyColors(false);
      });

      this.colorPickersContainer.appendChild(row);
    });
  }

  applyColors(saveHistory = true) {
    if (!this.currentNode) return;
    this.canvasEngine.applyBalloonColorsToNode(this.currentNode, this.currentColors, saveHistory);
  }
}

