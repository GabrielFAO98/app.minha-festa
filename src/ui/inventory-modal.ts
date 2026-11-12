import { addCustomItem, updateCustomItem } from '../core/db';
import {
  analyzeImageTransparency,
  autoTrimImage,
  optimizeUserUploadedImage,
  removeLightBackgroundFast
} from '../core/image-optimizer';
import { removeBackgroundLocalAI } from '../core/bg-remover';
import type { PresetItem } from '../types';

export class InventoryModal {
  onItemCreated?: ((item: PresetItem) => void) | null;
  onItemUpdated?: ((item: PresetItem) => void) | null;
  modalEl: HTMLElement | null;
  titleEl: HTMLElement | null;
  submitBtn: HTMLButtonElement | null;
  formEl: HTMLFormElement | null;
  fileInputEl: HTMLInputElement | null;
  uploadBoxEl: HTMLElement | null;
  previewImgEl: HTMLImageElement | null;
  uploadPlaceholder: HTMLElement | null;
  uploadChangePill: HTMLElement | null;
  btnClose: HTMLElement | null;

  bgPanelEl: HTMLElement | null;
  bgStatusEl: HTMLElement | null;
  bgProgressWrapEl: HTMLElement | null;
  bgProgressFillEl: HTMLElement | null;
  btnRemoveBgAi: HTMLButtonElement | null;
  btnRemoveBgFast: HTMLButtonElement | null;
  btnRestoreOriginal: HTMLButtonElement | null;
  toleranceRowEl: HTMLElement | null;
  toleranceInputEl: HTMLInputElement | null;
  toleranceValEl: HTMLElement | null;

  widthInputEl: HTMLInputElement | null;
  heightInputEl: HTMLInputElement | null;

  currentImageData: string | null;
  originalImageData: string | null;
  editingItemId: string | null;
  isProcessingBg: boolean;
  hasManualDimensions: boolean;
  private sessionSeq: number;
  private fastAdjustTimer: number | null;

  constructor(
    onItemCreated?: ((item: PresetItem) => void) | null,
    onItemUpdated?: ((item: PresetItem) => void) | null
  ) {
    this.onItemCreated = onItemCreated;
    this.onItemUpdated = onItemUpdated;
    this.modalEl = document.getElementById('inventory-modal');
    this.titleEl = document.getElementById('inventory-modal-title');
    this.submitBtn = document.getElementById('btn-save-inventory') as HTMLButtonElement | null;
    this.formEl = document.getElementById('inventory-form') as HTMLFormElement | null;
    this.fileInputEl = document.getElementById('item-image-input') as HTMLInputElement | null;
    this.uploadBoxEl = document.getElementById('image-upload-box');
    this.previewImgEl = document.getElementById('upload-preview-img') as HTMLImageElement | null;
    this.uploadPlaceholder = document.getElementById('upload-placeholder');
    this.uploadChangePill = document.getElementById('upload-change-pill');
    this.btnClose = document.getElementById('btn-close-inventory-modal');

    this.bgPanelEl = document.getElementById('bg-removal-panel');
    this.bgStatusEl = document.getElementById('bg-removal-status');
    this.bgProgressWrapEl = document.getElementById('bg-removal-progress-wrap');
    this.bgProgressFillEl = document.getElementById('bg-removal-progress-fill');
    this.btnRemoveBgAi = document.getElementById('btn-remove-bg-ai') as HTMLButtonElement | null;
    this.btnRemoveBgFast = document.getElementById('btn-remove-bg-fast') as HTMLButtonElement | null;
    this.btnRestoreOriginal = document.getElementById('btn-restore-bg-original') as HTMLButtonElement | null;
    this.toleranceRowEl = document.getElementById('bg-fast-tolerance-row');
    this.toleranceInputEl = document.getElementById('bg-fast-tolerance') as HTMLInputElement | null;
    this.toleranceValEl = document.getElementById('bg-fast-tolerance-val');

    this.widthInputEl = document.getElementById('item-width-input') as HTMLInputElement | null;
    this.heightInputEl = document.getElementById('item-height-input') as HTMLInputElement | null;

    this.currentImageData = null;
    this.originalImageData = null;
    this.editingItemId = null;
    this.isProcessingBg = false;
    this.hasManualDimensions = false;
    this.sessionSeq = 0;
    this.fastAdjustTimer = null;

    this.setupEvents();
  }

  private setPreviewImage(src: string | null): void {
    if (this.previewImgEl) {
      if (src) {
        this.previewImgEl.src = src;
        this.previewImgEl.style.display = 'block';
      } else {
        this.previewImgEl.src = '';
        this.previewImgEl.style.display = 'none';
      }
    }
    this.uploadBoxEl?.classList.toggle('has-preview', Boolean(src));
    if (this.uploadPlaceholder) {
      this.uploadPlaceholder.style.display = src ? 'none' : 'flex';
    }
    if (this.uploadChangePill) {
      this.uploadChangePill.style.display = src ? 'inline-flex' : 'none';
    }
    if (this.bgPanelEl) {
      this.bgPanelEl.style.display = src ? 'flex' : 'none';
    }
  }

  private setBgStatus(text: string, tone: 'neutral' | 'success' | 'error' = 'neutral'): void {
    if (!this.bgStatusEl) return;
    this.bgStatusEl.textContent = text;
    this.bgStatusEl.classList.remove('is-success', 'is-error');
    if (tone === 'success') this.bgStatusEl.classList.add('is-success');
    if (tone === 'error') this.bgStatusEl.classList.add('is-error');
  }

  private setProgress(percent: number | null): void {
    if (!this.bgProgressWrapEl || !this.bgProgressFillEl) return;
    if (percent === null) {
      this.bgProgressWrapEl.style.display = 'none';
      this.bgProgressFillEl.style.width = '0%';
      return;
    }
    this.bgProgressWrapEl.style.display = 'block';
    this.bgProgressFillEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  private setProcessingState(active: boolean): void {
    this.isProcessingBg = active;
    if (this.btnRemoveBgAi) this.btnRemoveBgAi.disabled = active;
    if (this.btnRemoveBgFast) this.btnRemoveBgFast.disabled = active;
    if (this.btnRestoreOriginal) this.btnRestoreOriginal.disabled = active;
    if (this.submitBtn) this.submitBtn.disabled = active;
    if (this.toleranceInputEl) this.toleranceInputEl.disabled = active;
  }

  private applyProportionalHeight(aspectRatio: number): void {
    if (this.editingItemId || this.hasManualDimensions) return;
    if (!this.widthInputEl || !this.heightInputEl || !Number.isFinite(aspectRatio) || aspectRatio <= 0) {
      return;
    }
    const widthCm = Number(this.widthInputEl.value) || 60;
    const nextHeight = Math.max(10, Math.min(400, Math.round(widthCm / aspectRatio)));
    this.heightInputEl.value = String(nextHeight);
  }

  private async runFastCutout(): Promise<void> {
    if (this.isProcessingBg || !this.originalImageData) return;
    const seq = this.sessionSeq;
    const tolerance = Number(this.toleranceInputEl?.value || 28);

    this.setProcessingState(true);
    this.setProgress(null);
    if (this.toleranceRowEl) this.toleranceRowEl.style.display = 'flex';

    try {
      const result = await removeLightBackgroundFast(this.originalImageData, tolerance, 1024);
      if (seq !== this.sessionSeq) return;

      this.currentImageData = result.dataUrl;
      this.setPreviewImage(result.dataUrl);
      this.applyProportionalHeight(result.aspectRatio);
      if (this.btnRestoreOriginal) this.btnRestoreOriginal.style.display = 'inline-flex';
      this.setBgStatus('Fundo claro recortado! Ajuste a suavidade abaixo se precisar.', 'success');
    } catch (err) {
      if (seq !== this.sessionSeq) return;
      console.error('Falha no recorte rápido de fundo claro:', err);
      this.setBgStatus('Não foi possível processar esta foto no modo rápido.', 'error');
    } finally {
      if (seq === this.sessionSeq) {
        this.setProcessingState(false);
      }
    }
  }

  private async runLocalAiCutout(): Promise<void> {
    if (this.isProcessingBg || !this.originalImageData) return;
    const seq = this.sessionSeq;

    this.setProcessingState(true);
    if (this.toleranceRowEl) this.toleranceRowEl.style.display = 'none';
    this.setProgress(5);
    this.setBgStatus('Iniciando motor IA local...', 'neutral');

    try {
      const result = await removeBackgroundLocalAI(this.originalImageData, (pct, label) => {
        if (seq !== this.sessionSeq) return;
        this.setProgress(pct);
        this.setBgStatus(label, 'neutral');
      });
      if (seq !== this.sessionSeq) return;

      this.currentImageData = result.dataUrl;
      this.setPreviewImage(result.dataUrl);
      this.applyProportionalHeight(result.aspectRatio);
      if (this.btnRestoreOriginal) this.btnRestoreOriginal.style.display = 'inline-flex';
      this.setProgress(null);
      this.setBgStatus('Fundo removido com IA local e bordas ajustadas!', 'success');
    } catch (err) {
      if (seq !== this.sessionSeq) return;
      console.error('Falha ao remover fundo localmente com IA:', err);
      this.setProgress(null);
      this.setBgStatus(
        'Não foi possível rodar a IA neste momento (verifique internet no 1º uso) ou tente "Fundo Claro Rápido".',
        'error'
      );
    } finally {
      if (seq === this.sessionSeq) {
        this.setProcessingState(false);
      }
    }
  }

  private restoreOriginalPhoto(): void {
    if (this.isProcessingBg || !this.originalImageData) return;
    this.currentImageData = this.originalImageData;
    this.setPreviewImage(this.originalImageData);
    if (this.toleranceRowEl) this.toleranceRowEl.style.display = 'none';
    if (this.btnRestoreOriginal) this.btnRestoreOriginal.style.display = 'none';
    this.setProgress(null);
    this.setBgStatus('Foto original restaurada.', 'neutral');
  }

  private async handleLoadedSource(src: string, isInitialEdit: boolean): Promise<void> {
    const seq = ++this.sessionSeq;
    this.originalImageData = src;
    this.currentImageData = src;
    this.setPreviewImage(src);
    if (this.toleranceRowEl) this.toleranceRowEl.style.display = 'none';
    if (this.btnRestoreOriginal) this.btnRestoreOriginal.style.display = 'none';
    this.setProgress(null);

    try {
      const info = await analyzeImageTransparency(src);
      if (seq !== this.sessionSeq) return;

      if (info.hasTransparency) {
        const trimmed = await autoTrimImage(src, 1024);
        if (seq !== this.sessionSeq) return;
        this.currentImageData = trimmed.dataUrl;
        this.setPreviewImage(trimmed.dataUrl);
        if (!isInitialEdit) {
          this.applyProportionalHeight(trimmed.aspectRatio);
        }
        if (this.btnRestoreOriginal && trimmed.dataUrl !== src) {
          this.btnRestoreOriginal.style.display = 'inline-flex';
        }
        this.setBgStatus('Fundo transparente detectado e margens ajustadas.', 'success');
      } else {
        if (!isInitialEdit) {
          this.applyProportionalHeight(info.width / Math.max(1, info.height));
        }
        this.setBgStatus('Escolha "Remover Fundo (IA)" ou "Fundo Claro Rápido" se precisar recortar.', 'neutral');
      }
    } catch {
      if (seq !== this.sessionSeq) return;
      this.setBgStatus('Foto pronta. Recorte o fundo abaixo se desejar.', 'neutral');
    }
  }

  setupEvents(): void {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl && !this.isProcessingBg) this.close();
    });

    this.widthInputEl?.addEventListener('input', () => {
      this.hasManualDimensions = true;
    });
    this.heightInputEl?.addEventListener('input', () => {
      this.hasManualDimensions = true;
    });

    this.uploadBoxEl?.addEventListener('click', () => {
      if (!this.isProcessingBg) {
        this.fileInputEl?.click();
      }
    });

    this.fileInputEl?.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;

      try {
        const optimized = await optimizeUserUploadedImage(file, 1200);
        await this.handleLoadedSource(optimized, false);
      } catch (err) {
        console.error('Falha ao processar foto:', err);
        this.setBgStatus('Falha ao ler a imagem selecionada.', 'error');
      }
    });

    this.btnRemoveBgAi?.addEventListener('click', () => {
      void this.runLocalAiCutout();
    });

    this.btnRemoveBgFast?.addEventListener('click', () => {
      void this.runFastCutout();
    });

    this.btnRestoreOriginal?.addEventListener('click', () => {
      this.restoreOriginalPhoto();
    });

    this.toleranceInputEl?.addEventListener('input', () => {
      const val = Number(this.toleranceInputEl?.value || 28);
      if (this.toleranceValEl) this.toleranceValEl.textContent = String(val);
      if (this.fastAdjustTimer !== null) {
        window.clearTimeout(this.fastAdjustTimer);
      }
      this.fastAdjustTimer = window.setTimeout(() => {
        this.fastAdjustTimer = null;
        void this.runFastCutout();
      }, 90);
    });

    this.formEl?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.isProcessingBg) return;

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

      // Fotos próprias do usuário sempre usam recorte por alpha real ('generic'),
      // evitando colisões com máscaras geométricas SVG de painéis/cilindros/mesas de fábrica.
      const type = 'generic';

      if (this.editingItemId) {
        const updated = await updateCustomItem(this.editingItemId, {
          name,
          category,
          type,
          svgRole: 'photo',
          widthCm,
          heightCm,
          previewUrl: this.currentImageData,
          stockQuantity,
          rentalPrice
        });
        this.close();
        if (updated && this.onItemUpdated) {
          this.onItemUpdated(updated);
        }
      } else {
        const newItem = await addCustomItem({
          name,
          category,
          type,
          svgRole: 'photo',
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
      }
    });
  }

  open(itemToEdit?: PresetItem): void {
    this.hasManualDimensions = false;
    if (this.toleranceInputEl) this.toleranceInputEl.value = '28';
    if (this.toleranceValEl) this.toleranceValEl.textContent = '28';

    if (itemToEdit) {
      this.editingItemId = itemToEdit.id;
      this.hasManualDimensions = true;
      if (this.titleEl) this.titleEl.textContent = 'Editar Peça do Acervo';
      if (this.submitBtn) this.submitBtn.textContent = 'Salvar Alterações';

      const nameInput = document.getElementById('item-name-input') as HTMLInputElement | null;
      const categoryInput = document.getElementById('item-category-input') as HTMLSelectElement | null;
      const stockInput = document.getElementById('item-stock-input') as HTMLInputElement | null;
      const priceInput = document.getElementById('item-price-input') as HTMLInputElement | null;

      if (nameInput) nameInput.value = itemToEdit.name;
      if (categoryInput) categoryInput.value = itemToEdit.category || 'paineis';
      if (this.widthInputEl) this.widthInputEl.value = String(itemToEdit.widthCm || 50);
      if (this.heightInputEl) this.heightInputEl.value = String(itemToEdit.heightCm || 50);
      if (stockInput) stockInput.value = String(itemToEdit.stockQuantity || 1);
      if (priceInput) priceInput.value = itemToEdit.rentalPrice ? String(itemToEdit.rentalPrice) : '';

      if (itemToEdit.previewUrl) {
        void this.handleLoadedSource(itemToEdit.previewUrl, true);
      } else {
        this.setPreviewImage(null);
      }
    } else {
      this.editingItemId = null;
      if (this.titleEl) this.titleEl.textContent = 'Cadastrar Nova Peça';
      if (this.submitBtn) this.submitBtn.textContent = 'Salvar no Meu Acervo';
      this.resetForm();
    }

    this.modalEl?.classList.add('open');
  }

  close(): void {
    this.sessionSeq++;
    if (this.fastAdjustTimer !== null) {
      window.clearTimeout(this.fastAdjustTimer);
      this.fastAdjustTimer = null;
    }
    this.setProcessingState(false);
    this.modalEl?.classList.remove('open');
  }

  resetForm(): void {
    this.sessionSeq++;
    this.formEl?.reset();
    this.currentImageData = null;
    this.originalImageData = null;
    this.editingItemId = null;
    this.hasManualDimensions = false;
    this.setPreviewImage(null);
    this.setProgress(null);
    if (this.toleranceRowEl) this.toleranceRowEl.style.display = 'none';
    if (this.btnRestoreOriginal) this.btnRestoreOriginal.style.display = 'none';
    if (this.fileInputEl) {
      this.fileInputEl.value = '';
    }
  }
}
