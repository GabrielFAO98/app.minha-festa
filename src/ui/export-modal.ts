import {
  generateRomaneio,
  formatWhatsAppMessage,
  shareViaWhatsApp,
  downloadImage,
  type WhatsAppMessageMode
} from '../core/export-service';
import { db } from '../core/db';
import type { CanvasEngine } from '../core/canvas-engine';
import type { SceneElement } from '../types';

interface CachedRealismEntry {
  hash: string;
  dataUrl: string;
  createdAt: number;
}

const AI_REALISM_CACHE_KEY = 'ai_realism_cache_v3';
const MAX_CACHED_REALISM_ENTRIES = 6;
const COLLAPSED_CHECKLIST_LIMIT = 5;

export class ExportModal {
  canvasEngine: CanvasEngine;
  modalEl: HTMLElement | null;
  previewImgEl: HTMLImageElement | null;
  previewBadgeEl: HTMLElement | null;
  aiLoadingEl: HTMLElement | null;
  viewToggleEl: HTMLElement | null;
  btnViewOriginal: HTMLButtonElement | null;
  btnViewRealistic: HTMLButtonElement | null;
  btnGenerateAi: HTMLButtonElement | null;
  aiStatusEl: HTMLElement | null;
  categorySummaryEl: HTMLElement | null;
  checklistContainer: HTMLElement | null;
  btnToggleChecklist: HTMLButtonElement | null;
  totalItemsBadge: HTMLElement | null;
  btnWaModeSummary: HTMLButtonElement | null;
  btnWaModeDetailed: HTMLButtonElement | null;
  btnShareImage: HTMLElement | null;
  btnDownload: HTMLElement | null;
  btnWhatsApp: HTMLElement | null;
  btnClose: HTMLElement | null;
  clientNameInput: HTMLInputElement | null;
  clientPhoneInput: HTMLInputElement | null;

  originalDataUrl: string | null;
  realisticDataUrl: string | null;
  activeMode: 'original' | 'realistic';
  currentSceneHash: string;
  isGeneratingAi: boolean;
  isChecklistExpanded: boolean;
  whatsappMode: WhatsAppMessageMode;
  private memoryCache: Map<string, string>;
  currentRomaneio: ReturnType<typeof generateRomaneio> | null;

  constructor(canvasEngine: CanvasEngine) {
    this.canvasEngine = canvasEngine;
    this.modalEl = document.getElementById('export-modal');
    this.previewImgEl = document.getElementById('export-preview-img') as HTMLImageElement | null;
    this.previewBadgeEl = document.getElementById('export-preview-badge');
    this.aiLoadingEl = document.getElementById('export-ai-loading');
    this.viewToggleEl = document.getElementById('export-view-toggle');
    this.btnViewOriginal = document.getElementById('btn-view-original') as HTMLButtonElement | null;
    this.btnViewRealistic = document.getElementById('btn-view-realistic') as HTMLButtonElement | null;
    this.btnGenerateAi = document.getElementById('btn-generate-ai-realism') as HTMLButtonElement | null;
    this.aiStatusEl = document.getElementById('export-ai-status');
    this.categorySummaryEl = document.getElementById('export-category-summary');
    this.checklistContainer = document.getElementById('export-checklist-items');
    this.btnToggleChecklist = document.getElementById('btn-toggle-checklist') as HTMLButtonElement | null;
    this.totalItemsBadge = document.getElementById('export-total-badge');
    this.btnWaModeSummary = document.getElementById('btn-wa-mode-summary') as HTMLButtonElement | null;
    this.btnWaModeDetailed = document.getElementById('btn-wa-mode-detailed') as HTMLButtonElement | null;
    this.btnShareImage = document.getElementById('btn-share-image');
    this.btnDownload = document.getElementById('btn-download-image');
    this.btnWhatsApp = document.getElementById('btn-share-whatsapp');
    this.btnClose = document.getElementById('btn-close-export-modal');
    this.clientNameInput = document.getElementById('export-client-name') as HTMLInputElement | null;
    this.clientPhoneInput = document.getElementById('export-client-phone') as HTMLInputElement | null;

    this.originalDataUrl = null;
    this.realisticDataUrl = null;
    this.activeMode = 'original';
    this.currentSceneHash = '';
    this.isGeneratingAi = false;
    this.isChecklistExpanded = false;
    this.whatsappMode = 'summary';
    this.memoryCache = new Map();
    this.currentRomaneio = null;

    this.setupEvents();
  }

  setupEvents(): void {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.btnGenerateAi?.addEventListener('click', async () => {
      await this.handleGenerateRealism();
    });

    this.btnViewOriginal?.addEventListener('click', () => {
      this.setViewMode('original');
    });

    this.btnViewRealistic?.addEventListener('click', () => {
      if (this.realisticDataUrl) {
        this.setViewMode('realistic');
      }
    });

    this.btnToggleChecklist?.addEventListener('click', () => {
      this.isChecklistExpanded = !this.isChecklistExpanded;
      this.renderRomaneioChecklist();
    });

    this.btnWaModeSummary?.addEventListener('click', () => {
      this.setWhatsAppMode('summary');
    });

    this.btnWaModeDetailed?.addEventListener('click', () => {
      this.setWhatsAppMode('detailed');
    });

    this.btnShareImage?.addEventListener('click', async () => {
      await this.handleShareImage();
    });

    this.btnDownload?.addEventListener('click', () => {
      const exportData = this.getActiveExportData();
      if (!exportData) return;
      const title = document.getElementById('project-title-display')?.textContent?.trim() || 'decoracao-festa';
      const baseSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'decoracao';
      const filename = `${baseSlug}${exportData.suffix}.${exportData.ext}`;
      downloadImage(exportData.dataUrl, filename);
    });

    this.btnWhatsApp?.addEventListener('click', () => {
      if (!this.currentRomaneio) return;
      const title = document.getElementById('project-title-display')?.textContent?.trim() || 'Minha Decoração';
      const clientName = this.clientNameInput?.value.trim() || '';
      const clientPhone = this.clientPhoneInput?.value.trim() || '';

      const message = formatWhatsAppMessage(title, this.currentRomaneio, clientName, this.whatsappMode);
      shareViaWhatsApp(clientPhone, message);
    });
  }

  private getActiveExportData(): { dataUrl: string; mimeType: string; ext: string; suffix: string } | null {
    const isRealistic = this.activeMode === 'realistic' && Boolean(this.realisticDataUrl);
    const dataUrl = isRealistic ? this.realisticDataUrl : this.originalDataUrl;
    if (!dataUrl) return null;

    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    const mimeType = match?.[1] || 'image/png';
    const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
    const suffix = isRealistic ? '-realista' : '';

    return { dataUrl, mimeType, ext, suffix };
  }

  private computeSceneHash(elements: SceneElement[]): string {
    const fingerprint = JSON.stringify({
      bg: this.canvasEngine.bgImageUrl || '',
      wall: this.canvasEngine.wallTextureUrl || '',
      floor: this.canvasEngine.floorTextureUrl || '',
      items: elements.map((el) => ({
        id: el.id,
        type: el.type,
        x: Math.round(el.x || 0),
        y: Math.round(el.y || 0),
        sx: Math.round((el.scaleX || 1) * 100),
        sy: Math.round((el.scaleY || 1) * 100),
        r: Math.round(el.rotation || 0),
        z: el.zIndex || 0,
        cc: el.customColor || '',
        cu: el.customCoverUrl || '',
        cx: Math.round(el.coverOffsetX || 0),
        cy: Math.round(el.coverOffsetY || 0),
        cs: Math.round((el.coverScale || 1) * 100),
        tc: el.tabletopColor || '',
        tu: el.tabletopCoverUrl || '',
        mc: el.modularColors || null,
        bc: el.balloonColors || null,
        cur: el.currentColor || ''
      }))
    });

    // Hash FNV-1a 32-bit compacto para indexação em cache local
    let hash = 2166136261;
    for (let i = 0; i < fingerprint.length; i++) {
      hash ^= fingerprint.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `sc_${(hash >>> 0).toString(36)}_${elements.length}`;
  }

  private async getCachedRealism(hash: string): Promise<string | null> {
    const inMemory = this.memoryCache.get(hash);
    if (inMemory) return inMemory;

    try {
      const record = await db.settings.get(AI_REALISM_CACHE_KEY);
      const entries: CachedRealismEntry[] = Array.isArray(record?.value) ? record.value : [];
      const found = entries.find((e) => e.hash === hash);
      if (found?.dataUrl) {
        this.memoryCache.set(hash, found.dataUrl);
        return found.dataUrl;
      }
    } catch {
      // Cache persistente indisponível, segue apenas em memória
    }
    return null;
  }

  private async saveCachedRealism(hash: string, dataUrl: string): Promise<void> {
    this.memoryCache.set(hash, dataUrl);
    try {
      const record = await db.settings.get(AI_REALISM_CACHE_KEY);
      const entries: CachedRealismEntry[] = Array.isArray(record?.value) ? record.value : [];
      const filtered = entries.filter((e) => e.hash !== hash);
      filtered.unshift({ hash, dataUrl, createdAt: Date.now() });
      await db.settings.put({
        key: AI_REALISM_CACHE_KEY,
        value: filtered.slice(0, MAX_CACHED_REALISM_ENTRIES)
      });
    } catch {
      // Ignora erro de cota do IndexedDB sem impactar o usuário
    }
  }

  private async renderDataUrlToCanvas(dataUrl: string, maxW = 1080, maxH = 1920): Promise<HTMLCanvasElement | null> {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || maxW;
        const h = img.naturalHeight || maxH;
        const scale = Math.min(1, maxW / w, maxH / h);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Falha ao preparar imagem.'));
      img.src = dataUrl;
    });
  }

  private async convertToUploadJpeg(dataUrl: string): Promise<string> {
    const canvas = await this.renderDataUrlToCanvas(dataUrl, 1080, 1920);
    return canvas ? canvas.toDataURL('image/jpeg', 0.88) : dataUrl;
  }

  private async dataUrlToPngBlob(dataUrl: string, fallbackBlob: Blob): Promise<Blob> {
    if (fallbackBlob.type === 'image/png') return fallbackBlob;
    const canvas = await this.renderDataUrlToCanvas(dataUrl, 2160, 3840);
    if (!canvas) return fallbackBlob;
    return await new Promise((resolve) => {
      canvas.toBlob((png) => resolve(png || fallbackBlob), 'image/png');
    });
  }

  private setViewMode(mode: 'original' | 'realistic'): void {
    this.activeMode = mode === 'realistic' && this.realisticDataUrl ? 'realistic' : 'original';
    const showRealistic = this.activeMode === 'realistic';

    if (this.previewImgEl) {
      this.previewImgEl.src = (showRealistic ? this.realisticDataUrl : this.originalDataUrl) || '';
    }
    if (this.previewBadgeEl) {
      this.previewBadgeEl.textContent = showRealistic ? '9:16 • Realista IA' : '9:16 HD';
    }
    this.btnViewOriginal?.classList.toggle('active', !showRealistic);
    this.btnViewRealistic?.classList.toggle('active', showRealistic);
  }

  private setAiStatus(message: string, variant: 'neutral' | 'success' | 'error' = 'neutral'): void {
    if (!this.aiStatusEl) return;
    if (!message) {
      this.aiStatusEl.textContent = '';
      this.aiStatusEl.style.display = 'none';
      this.aiStatusEl.className = 'export-ai-status';
      return;
    }
    this.aiStatusEl.textContent = message;
    this.aiStatusEl.style.display = 'block';
    this.aiStatusEl.className = `export-ai-status ${variant === 'neutral' ? '' : variant}`.trim();
  }

  private updateAiControls(): void {
    const hasRealistic = Boolean(this.realisticDataUrl);

    if (this.aiLoadingEl) {
      this.aiLoadingEl.style.display = this.isGeneratingAi ? 'flex' : 'none';
    }
    if (this.viewToggleEl) {
      this.viewToggleEl.style.display = hasRealistic ? 'grid' : 'none';
    }
    if (this.btnGenerateAi) {
      this.btnGenerateAi.style.display = hasRealistic ? 'none' : 'inline-flex';
      this.btnGenerateAi.disabled = this.isGeneratingAi;
      const span = this.btnGenerateAi.querySelector('span');
      if (span) {
        span.textContent = this.isGeneratingAi
          ? 'Gerando versão realista (~10s)...'
          : 'Gerar Versão Realista (IA)';
      }
    }
  }

  async handleGenerateRealism(): Promise<void> {
    if (this.isGeneratingAi || !this.originalDataUrl) return;
    const targetHash = this.currentSceneHash;

    // Verificação dupla para evitar consumo duplicado no mesmo cenário
    const alreadyCached = await this.getCachedRealism(targetHash);
    if (alreadyCached) {
      this.realisticDataUrl = alreadyCached;
      this.updateAiControls();
      this.setViewMode('realistic');
      this.setAiStatus('Versão realista recuperada do cache deste cenário.', 'success');
      return;
    }

    this.isGeneratingAi = true;
    this.setAiStatus('');
    this.updateAiControls();

    try {
      const jpegDataUrl = await this.convertToUploadJpeg(this.originalDataUrl);
      const response = await fetch('/api/enhance-realism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: jpegDataUrl,
          mimeType: 'image/jpeg'
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.realisticDataUrl) {
        throw new Error(payload?.error || 'Não foi possível gerar a imagem realista.');
      }

      await this.saveCachedRealism(targetHash, payload.realisticDataUrl);

      if (this.currentSceneHash === targetHash) {
        this.realisticDataUrl = payload.realisticDataUrl;
        this.isGeneratingAi = false;
        this.updateAiControls();
        this.setViewMode('realistic');
        this.setAiStatus('Versão realista salva para este cenário.', 'success');
      }
    } catch (err: any) {
      if (this.currentSceneHash === targetHash) {
        this.isGeneratingAi = false;
        this.updateAiControls();
        this.setAiStatus(err?.message || 'Erro ao gerar versão realista. Tente novamente.', 'error');
      }
    }
  }

  async handleShareImage(): Promise<void> {
    const exportData = this.getActiveExportData();
    if (!exportData) return;

    const title = document.getElementById('project-title-display')?.textContent?.trim() || 'Decoração Decoraly';
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'decoracao';
    const safeFilename = `${baseSlug}${exportData.suffix}.${exportData.ext}`;

    const blob = await fetch(exportData.dataUrl).then((r) => r.blob());

    try {
      const file = new File([blob], safeFilename, { type: exportData.mimeType });

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

    // Fallback Área de Transferência (Desktop colar direto no WhatsApp Web com Ctrl+V; ClipboardItem exige image/png)
    try {
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const pngBlob = await this.dataUrlToPngBlob(exportData.dataUrl, blob);
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
        alert('Foto copiada para a área de transferência! Você já pode colar (Ctrl+V) no WhatsApp ou redes sociais.');
        return;
      }
    } catch {}

    // Fallback Download direto
    downloadImage(exportData.dataUrl, safeFilename);
  }

  open(): void {
    const elements = this.canvasEngine.getSceneElements();
    if (elements.length === 0) {
      alert('Seu cenário está vazio! Adicione peças antes de exportar.');
      return;
    }

    // 1. Gera imagem 2D em alta resolução imediatamente
    this.originalDataUrl = this.canvasEngine.exportHDImage();
    this.realisticDataUrl = null;
    this.isGeneratingAi = false;
    this.currentSceneHash = this.computeSceneHash(elements);

    this.setViewMode('original');
    this.setAiStatus('');
    this.updateAiControls();

    // Verifica se este cenário exato já tem versão realista salva (custo zero)
    const openingHash = this.currentSceneHash;
    this.getCachedRealism(openingHash).then((cachedUrl) => {
      if (cachedUrl && this.currentSceneHash === openingHash && !this.isGeneratingAi) {
        this.realisticDataUrl = cachedUrl;
        this.updateAiControls();
        this.setViewMode('realistic');
        this.setAiStatus('Versão realista salva para este cenário.', 'success');
      }
    });

    // 2. Gera romaneio agrupado e resumido dos itens utilizados
    this.currentRomaneio = generateRomaneio(elements);
    this.isChecklistExpanded = false;
    this.setWhatsAppMode(this.whatsappMode);
    this.renderRomaneioChecklist();

    this.modalEl?.classList.add('open');
  }

  private setWhatsAppMode(mode: WhatsAppMessageMode): void {
    this.whatsappMode = mode;
    this.btnWaModeSummary?.classList.toggle('active', mode === 'summary');
    this.btnWaModeDetailed?.classList.toggle('active', mode === 'detailed');
  }

  private renderRomaneioChecklist(): void {
    if (!this.currentRomaneio) return;
    const { totalItems, categories, checklist } = this.currentRomaneio;

    if (this.totalItemsBadge) {
      this.totalItemsBadge.textContent = `${totalItems} ${totalItems === 1 ? 'peça' : 'peças'}`;
    }

    if (this.categorySummaryEl) {
      this.categorySummaryEl.innerHTML = '';
      categories.forEach((cat) => {
        const pill = document.createElement('span');
        pill.className = 'checklist-summary-pill';
        const label = cat.totalQty === 1 ? cat.singular : cat.plural;
        pill.textContent = `${cat.totalQty} ${label}`;
        this.categorySummaryEl?.appendChild(pill);
      });
      this.categorySummaryEl.style.display = categories.length > 0 ? 'flex' : 'none';
    }

    const canCollapse = checklist.length > COLLAPSED_CHECKLIST_LIMIT + 1;
    const visibleItems = canCollapse && !this.isChecklistExpanded
      ? checklist.slice(0, COLLAPSED_CHECKLIST_LIMIT)
      : checklist;

    if (this.checklistContainer) {
      this.checklistContainer.innerHTML = '';
      this.checklistContainer.classList.toggle('expanded', canCollapse && this.isChecklistExpanded);

      visibleItems.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'checklist-item';

        const info = document.createElement('div');
        info.className = 'checklist-item-info';

        const nameEl = document.createElement('span');
        nameEl.className = 'checklist-item-name';
        nameEl.textContent = item.name;

        const metaEl = document.createElement('span');
        metaEl.className = 'checklist-item-meta';
        const sizeLabel = item.widthCm > 0 && item.heightCm > 0 ? ` · ${item.widthCm}x${item.heightCm}cm` : '';
        metaEl.textContent = `${item.categoryLabel}${sizeLabel}`;

        info.append(nameEl, metaEl);

        const qtyBadge = document.createElement('span');
        qtyBadge.className = 'checklist-item-qty';
        qtyBadge.textContent = `${item.quantity}x`;

        li.append(info, qtyBadge);
        this.checklistContainer?.appendChild(li);
      });
    }

    if (this.btnToggleChecklist) {
      if (!canCollapse) {
        this.btnToggleChecklist.style.display = 'none';
      } else {
        this.btnToggleChecklist.style.display = 'block';
        const hiddenCount = checklist.length - COLLAPSED_CHECKLIST_LIMIT;
        this.btnToggleChecklist.textContent = this.isChecklistExpanded
          ? 'Recolher lista (ver resumo)'
          : `Ver lista completa (${checklist.length} tipos · +${hiddenCount} itens)`;
      }
    }
  }

  close(): void {
    this.modalEl?.classList.remove('open');
  }
}

