// Barra Flutuante de Ações da Peça no Cenário Mobile

export class ItemToolbar {
  constructor(canvasEngine, onOpenCoverModal) {
    this.canvasEngine = canvasEngine;
    this.onOpenCoverModal = onOpenCoverModal;
    this.toolbarEl = document.getElementById('item-toolbar');
    this.selectedMeta = null;

    this.setupUI();
  }

  setupUI() {
    if (!this.toolbarEl) return;

    const btnDelete = document.getElementById('btn-action-delete');
    const btnCover = document.getElementById('btn-action-cover');
    const btnFront = document.getElementById('btn-action-front');
    const btnBack = document.getElementById('btn-action-back');
    const btnFlip = document.getElementById('btn-action-flip');
    const btnDuplicate = document.getElementById('btn-action-duplicate');

    // EXCLUSÃO RÁPIDA E DIRETA
    btnDelete?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.selectedMeta) {
        this.canvasEngine.deleteSelected();
      }
    });

    btnCover?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onOpenCoverModal && this.selectedMeta) {
        this.onOpenCoverModal(this.selectedMeta);
      }
    });

    btnFront?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.bringForward();
    });

    btnBack?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.sendBackward();
    });

    btnFlip?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.flipHorizontal();
    });

    btnDuplicate?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.duplicateSelected();
    });

    this.canvasEngine.onSelectionChange = (meta, node) => {
      this.updateSelection(meta, node);
    };
  }

  updateSelection(meta, node) {
    this.selectedMeta = meta;
    const badge = document.getElementById('selection-badge');
    const badgeName = document.getElementById('selection-badge-name');
    const btnCover = document.getElementById('btn-action-cover');

    if (!node || !meta) {
      this.toolbarEl?.classList.remove('active');
      badge?.classList.remove('visible');
      return;
    }

    this.toolbarEl?.classList.add('active');

    if (badge && badgeName) {
      badgeName.textContent = meta.name;
      badge.classList.add('visible');
    }

    if (btnCover) {
      const isCoverable = ['cylinder', 'panel_round', 'panel_arch'].includes(meta.type);
      btnCover.innerHTML = isCoverable ? '🎨 Capa' : '🖼️ Imagem';
    }
  }
}
