import { generateRomaneio, formatWhatsAppMessage, shareViaWhatsApp, downloadImage } from '../core/export-service.js';

export class ExportModal {
  constructor(canvasEngine) {
    this.canvasEngine = canvasEngine;
    this.modalEl = document.getElementById('export-modal');
    this.previewImgEl = document.getElementById('export-preview-img');
    this.checklistContainer = document.getElementById('export-checklist-items');
    this.totalItemsBadge = document.getElementById('export-total-badge');
    this.btnDownload = document.getElementById('btn-download-image');
    this.btnWhatsApp = document.getElementById('btn-share-whatsapp');
    this.btnClose = document.getElementById('btn-close-export-modal');
    this.clientNameInput = document.getElementById('export-client-name');
    this.clientPhoneInput = document.getElementById('export-client-phone');

    this.currentDataUrl = null;
    this.currentRomaneio = null;

    this.setupEvents();
  }

  setupEvents() {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.btnDownload?.addEventListener('click', () => {
      if (!this.currentDataUrl) return;
      const title = document.getElementById('project-title-display')?.textContent || 'decoracao-festa';
      const safeFilename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      downloadImage(this.currentDataUrl, safeFilename);
    });

    this.btnWhatsApp?.addEventListener('click', () => {
      if (!this.currentRomaneio) return;
      const title = document.getElementById('project-title-display')?.textContent || 'Decoração Pegue-Monte';
      const clientName = this.clientNameInput?.value.trim() || '';
      const clientPhone = this.clientPhoneInput?.value.trim() || '';

      const message = formatWhatsAppMessage(title, this.currentRomaneio, clientName);
      shareViaWhatsApp(clientPhone, message);
    });
  }

  open() {
    const elements = this.canvasEngine.getSceneElements();
    if (elements.length === 0) {
      alert('Seu cenário está vazio! Adicione peças antes de exportar.');
      return;
    }

    // 1. Gera imagem em alta resolução
    this.currentDataUrl = this.canvasEngine.exportHDImage();
    if (this.previewImgEl) {
      this.previewImgEl.src = this.currentDataUrl;
    }

    // 2. Gera romaneio dos itens utilizados
    this.currentRomaneio = generateRomaneio(elements);

    if (this.totalItemsBadge) {
      this.totalItemsBadge.textContent = `${this.currentRomaneio.totalItems} peças`;
    }

    if (this.checklistContainer) {
      this.checklistContainer.innerHTML = '';
      this.currentRomaneio.checklist.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'checklist-item';
        li.innerHTML = `
          <span>${item.name} (${item.widthCm}x${item.heightCm}cm)</span>
          <span class="checklist-item-qty">${item.quantity}x</span>
        `;
        this.checklistContainer.appendChild(li);
      });
    }

    this.modalEl?.classList.add('open');
  }

  close() {
    this.modalEl?.classList.remove('open');
  }
}

