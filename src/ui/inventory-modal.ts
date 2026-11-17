import { addCustomItem, updateCustomItem } from '../core/db';
import {
  analyzeImageTransparency,
  autoTrimImage,
  optimizeUserUploadedImage
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
  btnRestoreOriginal: HTMLButtonElement | null;

  widthInputEl: HTMLInputElement | null;
  heightInputEl: HTMLInputElement | null;
  optionalDetailsEl: HTMLDetailsElement | null;

  currentImageData: string | null;
  originalImageData: string | null;
  editingItemId: string | null;
  isProcessingBg: boolean;
  isSaving: boolean;
  hasManualDimensions: boolean;
  defaultHeightCm: number;
  private sessionSeq: number;

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
    this.btnRestoreOriginal = document.getElementById('btn-restore-bg-original') as HTMLButtonElement | null;

    this.widthInputEl = document.getElementById('item-width-input') as HTMLInputElement | null;
    this.heightInputEl = document.getElementById('item-height-input') as HTMLInputElement | null;
    this.optionalDetailsEl = document.getElementById('inventory-optional-details') as HTMLDetailsElement | null;

    this.currentImageData = null;
    this.originalImageData = null;
    this.editingItemId = null;
    this.isProcessingBg = false;
    this.isSaving = false;
    this.hasManualDimensions = false;
    this.defaultHeightCm = 80;
    this.sessionSeq = 0;

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
    if (this.btnRestoreOriginal) this.btnRestoreOriginal.disabled = active;
    if (this.submitBtn) this.submitBtn.disabled = active || this.isSaving;
  }

  private setSavingState(saving: boolean): void {
    this.isSaving = saving;
    if (!this.submitBtn) return;
    this.submitBtn.disabled = saving || this.isProcessingBg;
    if (saving) {
      this.submitBtn.textContent = 'Salvando...';
    } else {
      this.submitBtn.textContent = this.editingItemId ? 'Salvar Alterações' : 'Salvar no Meu Acervo';
    }
  }

  private applyProportionalHeight(aspectRatio: number): void {
    if (this.editingItemId || this.hasManualDimensions) return;
    if (!this.widthInputEl || !this.heightInputEl || !Number.isFinite(aspectRatio) || aspectRatio <= 0) {
      return;
    }
    const widthCm = Number(this.widthInputEl.value) || 60;
    const nextHeight = Math.max(10, Math.min(400, Math.round(widthCm / aspectRatio)));
    this.defaultHeightCm = nextHeight;
    this.heightInputEl.placeholder = String(nextHeight);
    if (this.heightInputEl.value.trim()) {
      this.heightInputEl.value = String(nextHeight);
    }
  }

  private async runLocalAiCutout(): Promise<void> {
    if (this.isProcessingBg || !this.originalImageData) return;
    const seq = this.sessionSeq;

    this.setProcessingState(true);
    this.setProgress(5);
    this.setBgStatus('Iniciando recorte...', 'neutral');

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
      this.setBgStatus('Pronto! Fundo removido com sucesso.', 'success');
    } catch (err) {
      if (seq !== this.sessionSeq) return;
      console.error('Falha ao remover fundo com IA:', err);
      this.setProgress(null);
      this.setBgStatus(
        'Não foi possível remover o fundo agora. Verifique sua internet e tente novamente.',
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
    if (this.btnRestoreOriginal) this.btnRestoreOriginal.style.display = 'none';
    this.setProgress(null);
    this.setBgStatus('Foto original restaurada.', 'neutral');
  }

  private async handleLoadedSource(src: string, isInitialEdit: boolean): Promise<void> {
    const seq = ++this.sessionSeq;
    this.originalImageData = src;
    this.currentImageData = src;
    this.setPreviewImage(src);
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
        this.setBgStatus('Foto já está com fundo transparente.', 'success');
      } else {
        if (!isInitialEdit) {
          this.applyProportionalHeight(info.width / Math.max(1, info.height));
        }
        this.setBgStatus('Toque em "Remover Fundo (IA)" para deixar a peça sem fundo.', 'neutral');
      }
    } catch {
      if (seq !== this.sessionSeq) return;
      this.setBgStatus('Foto carregada. Toque abaixo se quiser remover o fundo.', 'neutral');
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
        this.setBgStatus('Não foi possível abrir esta foto. Tente outra imagem.', 'error');
      }
    });

    this.btnRemoveBgAi?.addEventListener('click', () => {
      void this.runLocalAiCutout();
    });

    this.btnRestoreOriginal?.addEventListener('click', () => {
      this.restoreOriginalPhoto();
    });

    this.formEl?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.isProcessingBg || this.isSaving) return;

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

      const rawWidth = widthInput?.value.trim() ? Number(widthInput.value) : NaN;
      const rawHeight = heightInput?.value.trim() ? Number(heightInput.value) : NaN;
      const rawStock = stockInput?.value.trim() ? Number(stockInput.value) : NaN;
      const rawPrice = priceInput?.value.trim() ? Number(priceInput.value) : NaN;

      const name = nameInput?.value.trim() || 'Nova Peça';
      const category = categoryInput?.value || 'paineis';
      const widthCm = Number.isFinite(rawWidth) && rawWidth > 0 ? Math.round(rawWidth) : 60;
      const heightCm = Number.isFinite(rawHeight) && rawHeight > 0 ? Math.round(rawHeight) : this.defaultHeightCm;
      const stockQuantity = Number.isFinite(rawStock) && rawStock > 0 ? Math.round(rawStock) : 1;
      const rentalPrice = Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : 0;

      // Fotos próprias do usuário sempre usam recorte por alpha real ('generic'),
      // evitando colisões com máscaras geométricas SVG de painéis/cilindros/mesas de fábrica.
      const type = 'generic';

      this.setSavingState(true);
      try {
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
      } catch (err) {
        console.error('[InventoryModal] Erro ao salvar peça:', err);
        alert('Não foi possível salvar a peça. Tente novamente.');
      } finally {
        this.setSavingState(false);
      }
    });
  }

  open(itemToEdit?: PresetItem): void {
    this.hasManualDimensions = false;
    if (this.optionalDetailsEl) this.optionalDetailsEl.open = false;

    if (itemToEdit) {
      this.editingItemId = itemToEdit.id;
      this.hasManualDimensions = true;
      this.defaultHeightCm = itemToEdit.heightCm || 80;
      if (this.titleEl) this.titleEl.textContent = 'Editar Peça do Acervo';
      this.setSavingState(false);

      const nameInput = document.getElementById('item-name-input') as HTMLInputElement | null;
      const categoryInput = document.getElementById('item-category-input') as HTMLSelectElement | null;
      const stockInput = document.getElementById('item-stock-input') as HTMLInputElement | null;
      const priceInput = document.getElementById('item-price-input') as HTMLInputElement | null;

      if (nameInput) nameInput.value = itemToEdit.name;
      if (categoryInput) categoryInput.value = itemToEdit.category || 'paineis';
      if (this.widthInputEl) {
        this.widthInputEl.value = itemToEdit.widthCm ? String(itemToEdit.widthCm) : '';
        this.widthInputEl.placeholder = '60';
      }
      if (this.heightInputEl) {
        this.heightInputEl.value = itemToEdit.heightCm ? String(itemToEdit.heightCm) : '';
        this.heightInputEl.placeholder = '80';
      }
      if (stockInput) stockInput.value = itemToEdit.stockQuantity ? String(itemToEdit.stockQuantity) : '';
      if (priceInput) priceInput.value = itemToEdit.rentalPrice ? String(itemToEdit.rentalPrice) : '';

      if (itemToEdit.previewUrl) {
        void this.handleLoadedSource(itemToEdit.previewUrl, true);
      } else {
        this.setPreviewImage(null);
      }
    } else {
      this.editingItemId = null;
      if (this.titleEl) this.titleEl.textContent = 'Cadastrar Nova Peça';
      this.resetForm();
      this.setSavingState(false);
    }

    this.modalEl?.classList.add('open');
  }

  close(): void {
    this.sessionSeq++;
    this.isSaving = false;
    this.setProcessingState(false);
    this.modalEl?.classList.remove('open');
  }

  resetForm(): void {
    this.sessionSeq++;
    this.formEl?.reset();
    this.currentImageData = null;
    this.originalImageData = null;
    this.editingItemId = null;
    this.isSaving = false;
    this.hasManualDimensions = false;
    this.defaultHeightCm = 80;
    if (this.optionalDetailsEl) this.optionalDetailsEl.open = false;
    if (this.widthInputEl) this.widthInputEl.placeholder = '60';
    if (this.heightInputEl) this.heightInputEl.placeholder = '80';
    this.setPreviewImage(null);
    this.setProgress(null);
    if (this.btnRestoreOriginal) this.btnRestoreOriginal.style.display = 'none';
    if (this.fileInputEl) {
      this.fileInputEl.value = '';
    }
    this.setSavingState(false);
  }
}
