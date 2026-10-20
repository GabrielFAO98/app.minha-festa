import { generateRomaneio, formatWhatsAppMessage, shareViaWhatsApp, downloadImage } from '../core/export-service';
import type { CanvasEngine } from '../core/canvas-engine';

export class ExportModal {
  canvasEngine: CanvasEngine;
  modalEl: HTMLElement | null;
  previewImgEl: HTMLImageElement | null;
  checklistContainer: HTMLElement | null;
  totalItemsBadge: HTMLElement | null;
  btnShareImage: HTMLElement | null;
  btnDownload: HTMLElement | null;
  btnWhatsApp: HTMLElement | null;
  btnClose: HTMLElement | null;
  clientNameInput: HTMLInputElement | null;
  clientPhoneInput: HTMLInputElement | null;
  currentDataUrl: string | null;
  currentRomaneio: ReturnType<typeof generateRomaneio> | null;

  constructor(canvasEngine: CanvasEngine) {
    this.canvasEngine = canvasEngine;
    this.modalEl = document.getElementById('export-modal');
    this.previewImgEl = document.getElementById('export-preview-img') as HTMLImageElement | null;
    this.checklistContainer = document.getElementById('export-checklist-items');
    this.totalItemsBadge = document.getElementById('export-total-badge');
    this.btnShareImage = document.getElementById('btn-share-image');
    this.btnDownload = document.getElementById('btn-download-image');
    this.btnWhatsApp = document.getElementById('btn-share-whatsapp');
    this.btnClose = document.getElementById('btn-close-export-modal');
    this.clientNameInput = document.getElementById('export-client-name') as HTMLInputElement | null;
    this.clientPhoneInput = document.getElementById('export-client-phone') as HTMLInputElement | null;

    this.currentDataUrl = null;
    this.currentRomaneio = null;

    this.setupEvents();
  }

  setupEvents(): void {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.btnShareImage?.addEventListener('click', async () => {
      await this.handleShareImage();
    });

    this.btnDownload?.addEventListener('click', () => {
      if (!this.currentDataUrl) return;
      const title = document.getElementById('project-title-display')?.textContent?.trim() || 'decoracao-festa';
      const safeFilename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'decoracao'}.png`;
      downloadImage(this.currentDataUrl, safeFilename);
    });

    this.btnWhatsApp?.addEventListener('click', () => {
      if (!this.currentRomaneio) return;
      const title = document.getElementById('project-title-display')?.textContent?.trim() || 'Minha Decoração';
      const clientName = this.clientNameInput?.value.trim() || '';
      const clientPhone = this.clientPhoneInput?.value.trim() || '';

      const message = formatWhatsAppMessage(title, this.currentRomaneio, clientName);
      shareViaWhatsApp(clientPhone, message);
    });
  }

  async handleShareImage(): Promise<void> {
    if (!this.currentDataUrl) return;
    const title = document.getElementById('project-title-display')?.textContent?.trim() || 'Decoração Minha Festa';
    const safeFilename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'decoracao'}.png`;

    try {
      const res = await fetch(this.currentDataUrl);
      const blob = await res.blob();
      const file = new File([blob], safeFilename, { type: 'image/png' });

      // Web Share API nativo (WhatsApp, Stories, AirDrop, etc. no Celular)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: `Decoração: ${title}`
        });
        return;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
    }

    // Fallback Área de Transferência (Desktop colar direto no WhatsApp Web com Ctrl+V)
    try {
      const res = await fetch(this.currentDataUrl);
      const blob = await res.blob();
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('Foto copiada para a área de transferência! Você já pode colar (Ctrl+V) no WhatsApp ou redes sociais.');
        return;
      }
    } catch {}

    // Fallback Download direto
    downloadImage(this.currentDataUrl, safeFilename);
  }

  open(): void {
    const elements = this.canvasEngine.getSceneElements();
    if (elements.length === 0) {
      alert('Seu cenário está vazio! Adicione peças antes de exportar.');
      return;
    }

    // 1. Gera imagem em alta resolução
    this.currentDataUrl = this.canvasEngine.exportHDImage();
    if (this.previewImgEl && this.currentDataUrl) {
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
        this.checklistContainer?.appendChild(li);
      });
    }

    this.modalEl?.classList.add('open');
  }

  close(): void {
    this.modalEl?.classList.remove('open');
  }
}

