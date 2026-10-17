import { addCustomItem } from '../core/db';
import type { PresetItem } from '../types';

export class InventoryModal {
  onItemCreated?: ((item: PresetItem) => void) | null;
  modalEl: HTMLElement | null;
  formEl: HTMLFormElement | null;
  fileInputEl: HTMLInputElement | null;
  uploadBoxEl: HTMLElement | null;
  previewImgEl: HTMLImageElement | null;
  uploadPlaceholder: HTMLElement | null;
  btnClose: HTMLElement | null;
  currentImageData: string | null;

  constructor(onItemCreated?: ((item: PresetItem) => void) | null) {
    this.onItemCreated = onItemCreated;
    this.modalEl = document.getElementById('inventory-modal');
    this.formEl = document.getElementById('inventory-form') as HTMLFormElement | null;
    this.fileInputEl = document.getElementById('item-image-input') as HTMLInputElement | null;
    this.uploadBoxEl = document.getElementById('image-upload-box');
    this.previewImgEl = document.getElementById('upload-preview-img') as HTMLImageElement | null;
    this.uploadPlaceholder = document.getElementById('upload-placeholder');
    this.btnClose = document.getElementById('btn-close-inventory-modal');

    this.currentImageData = null;
    this.setupEvents();
  }

  setupEvents(): void {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.uploadBoxEl?.addEventListener('click', () => {
      this.fileInputEl?.click();
    });

    this.fileInputEl?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        this.currentImageData = (event.target?.result as string) || null;
        if (this.previewImgEl && this.currentImageData) {
          this.previewImgEl.src = this.currentImageData;
          this.previewImgEl.style.display = 'block';
        }
        if (this.uploadPlaceholder) {
          this.uploadPlaceholder.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    });

    this.formEl?.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!this.currentImageData) {
        alert('Por favor, selecione uma foto para a peça do seu acervo.');
        return;
      }

      const nameInput = document.getElementById('item-name-input') as HTMLInputElement | null;
      const categoryInput = document.getElementById('item-category-input') as HTMLSelectElement | null;
      const widthInput = document.getElementById('item-width-input') as HTMLInputElement | null;
      const heightInput = document.getElementById('item-height-input') as HTMLInputElement | null;
      const stockInput = document.getElementById('item-stock-input') as HTMLInputElement | null;
      const priceInput = document.getElementById('item-price-input') as HTMLInputElement | null;

      const name = nameInput?.value.trim() || 'Nova Peça';
      const category = categoryInput?.value || 'paineis';
      const widthCm = Number(widthInput?.value) || 50;
      const heightCm = Number(heightInput?.value) || 50;
      const stockQuantity = Number(stockInput?.value) || 1;
      const rentalPrice = Number(priceInput?.value) || 0;

      // Determinar o tipo da peça
      let type = 'generic';
      if (category === 'paineis') type = 'panel_round';
      if (category === 'cilindros') type = 'cylinder';
      if (category === 'mesas') type = 'table';
      if (category === 'displays') type = 'display';

      const newItem = await addCustomItem({
        name,
        category,
        type,
        widthCm,
        heightCm,
        previewUrl: this.currentImageData,
        stockQuantity,
        rentalPrice
      });

      this.close();
      if (this.onItemCreated) {
        this.onItemCreated(newItem);
      }
    });
  }

  open(): void {
    this.resetForm();
    this.modalEl?.classList.add('open');
  }

  close(): void {
    this.modalEl?.classList.remove('open');
  }

  resetForm(): void {
    this.formEl?.reset();
    this.currentImageData = null;
    if (this.previewImgEl) {
      this.previewImgEl.src = '';
      this.previewImgEl.style.display = 'none';
    }
    if (this.uploadPlaceholder) {
      this.uploadPlaceholder.style.display = 'flex';
    }
    if (this.fileInputEl) {
      this.fileInputEl.value = '';
    }
  }
}

