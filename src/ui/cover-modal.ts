import { getAllCovers, addCustomCover } from '../core/db';
import type { CanvasEngine } from '../core/canvas-engine';
import type { PresetItem } from '../types';

export class CoverModal {
  canvasEngine: CanvasEngine;
  targetMeta: PresetItem | null;
  modalEl: HTMLElement | null;
  gridEl: HTMLElement | null;
  fileInputEl: HTMLInputElement | null;
  btnUploadTrigger: HTMLElement | null;
  btnRemoveCover: HTMLElement | null;
  btnClose: HTMLElement | null;

  constructor(canvasEngine: CanvasEngine) {
    this.canvasEngine = canvasEngine;
    this.targetMeta = null;
    this.modalEl = document.getElementById('cover-modal');
    this.gridEl = document.getElementById('covers-modal-grid');
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
        // Salva nova capa no banco de dados local
        await addCustomCover({
          themeName: 'Minhas Estampas',
          name: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: imageUrl,
          targetType: 'all'
        });

        // Aplica imediatamente na peça
        await this.canvasEngine.applyCoverToSelected(imageUrl);
        this.close();
        this.loadCovers();
      };
      reader.readAsDataURL(file);
      if (this.fileInputEl) this.fileInputEl.value = '';
    });

    this.btnRemoveCover?.addEventListener('click', async () => {
      await this.canvasEngine.applyCoverToSelected(null);
      this.close();
    });
  }

  async open(meta: PresetItem | null): Promise<void> {
    this.targetMeta = meta;
    const titleEl = document.getElementById('cover-modal-subtitle');
    if (titleEl && meta) {
      titleEl.textContent = `Aplicar estampa em: ${meta.name}`;
    }

    await this.loadCovers();
    this.modalEl?.classList.add('open');
  }

  close(): void {
    this.modalEl?.classList.remove('open');
  }

  async loadCovers(): Promise<void> {
    if (!this.gridEl) return;
    const covers = await getAllCovers();
    this.gridEl.innerHTML = '';

    covers.forEach((cover) => {
      const card = document.createElement('div');
      card.className = 'cover-card';
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

