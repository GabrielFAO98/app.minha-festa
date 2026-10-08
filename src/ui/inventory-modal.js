import { addCustomItem } from '../core/db.js';

export class InventoryModal {
  constructor(onItemCreated) {
    this.onItemCreated = onItemCreated;
    this.modalEl = document.getElementById('inventory-modal');
    this.formEl = document.getElementById('inventory-form');
    this.fileInputEl = document.getElementById('item-image-input');
    this.uploadBoxEl = document.getElementById('image-upload-box');
    this.previewImgEl = document.getElementById('upload-preview-img');
    this.uploadPlaceholder = document.getElementById('upload-placeholder');
    this.btnClose = document.getElementById('btn-close-inventory-modal');

    this.currentImageData = null;
    this.setupEvents();
  }

  setupEvents() {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.uploadBoxEl?.addEventListener('click', () => {
      this.fileInputEl?.click();
    });

    this.fileInputEl?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        this.currentImageData = event.target.result;
        if (this.previewImgEl) {
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

      const name = document.getElementById('item-name-input').value.trim();
      const category = document.getElementById('item-category-input').value;
      const widthCm = Number(document.getElementById('item-width-input').value) || 50;
      const heightCm = Number(document.getElementById('item-height-input').value) || 50;
      const stockQuantity = Number(document.getElementById('item-stock-input').value) || 1;
      const rentalPrice = Number(document.getElementById('item-price-input').value) || 0;

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

  open() {
    this.resetForm();
    this.modalEl?.classList.add('open');
  }

  close() {
    this.modalEl?.classList.remove('open');
  }

  resetForm() {
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

