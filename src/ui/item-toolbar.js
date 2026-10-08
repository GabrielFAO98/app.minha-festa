// Barra de Ações Rápidas da Peça Selecionada para Mobile

export class ItemToolbar {
  constructor(canvasEngine, onOpenCoverModal) {
    this.canvasEngine = canvasEngine;
    this.onOpenCoverModal = onOpenCoverModal;
    this.container = document.getElementById('item-actions-bar');
    this.selectedMeta = null;

    this.setupUI();
  }

  setupUI() {
    if (!this.container) return;

    const btnDelete = document.getElementById('btn-action-delete');
    const btnCover = document.getElementById('btn-action-cover');
    const btnFront = document.getElementById('btn-action-front');
    const btnBack = document.getElementById('btn-action-back');
    const btnFlip = document.getElementById('btn-action-flip');
    const btnDuplicate = document.getElementById('btn-action-duplicate');

    // EXCLUSÃO RÁPIDA E DIRETA
    btnDelete?.addEventListener('click', () => {
      if (this.selectedMeta) {
        this.canvasEngine.deleteSelected();
      }
    });

    btnCover?.addEventListener('click', () => {
      if (this.onOpenCoverModal && this.selectedMeta) {
        this.onOpenCoverModal(this.selectedMeta);
      }
    });

    btnFront?.addEventListener('click', () => {
      this.canvasEngine.bringForward();
    });

    btnBack?.addEventListener('click', () => {
      this.canvasEngine.sendBackward();
    });

    btnFlip?.addEventListener('click', () => {
      this.canvasEngine.flipHorizontal();
    });

    btnDuplicate?.addEventListener('click', () => {
      this.canvasEngine.duplicateSelected();
    });

    this.canvasEngine.onSelectionChange = (meta, node) => {
      this.updateSelection(meta, node);
    };
  }

  updateSelection(meta, node) {
    this.selectedMeta = meta;
    const actionsRow = document.getElementById('item-actions-row');
    const emptyNotice = document.getElementById('item-actions-empty');
    const badge = document.getElementById('selection-badge');
    const badgeName = document.getElementById('selection-badge-name');
    const btnCover = document.getElementById('btn-action-cover');

    if (!node || !meta) {
      if (actionsRow) actionsRow.style.display = 'none';
      if (emptyNotice) emptyNotice.style.display = 'block';
      badge?.classList.remove('visible');
      return;
    }

    if (actionsRow) actionsRow.style.display = 'flex';
    if (emptyNotice) emptyNotice.style.display = 'none';

    if (badge && badgeName) {
      badgeName.textContent = meta.name;
      badge.classList.add('visible');
    }

    if (btnCover) {
      const isCoverable = ['cylinder', 'panel_round', 'panel_arch'].includes(meta.type);
      btnCover.innerHTML = isCoverable ? '🎨 Vestir Capa' : '🖼️ Imagem';
    }
  }
}
