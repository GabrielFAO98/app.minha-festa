// Barra Flutuante Contextual de Ações do Item Selecionado

export class ItemToolbar {
  constructor(canvasEngine, onOpenCoverModal) {
    this.canvasEngine = canvasEngine;
    this.onOpenCoverModal = onOpenCoverModal;
    this.element = null;
    this.selectedMeta = null;
    this.setupUI();
  }

  setupUI() {
    this.element = document.getElementById('item-toolbar');
    if (!this.element) return;

    const btnCover = document.getElementById('btn-action-cover');
    const btnBringForward = document.getElementById('btn-action-forward');
    const btnSendBackward = document.getElementById('btn-action-backward');
    const btnFlip = document.getElementById('btn-action-flip');
    const btnDuplicate = document.getElementById('btn-action-duplicate');
    const btnDelete = document.getElementById('btn-action-delete');

    btnCover?.addEventListener('click', () => {
      if (this.onOpenCoverModal && this.selectedMeta) {
        this.onOpenCoverModal(this.selectedMeta);
      }
    });

    btnBringForward?.addEventListener('click', () => {
      this.canvasEngine.bringForward();
    });

    btnSendBackward?.addEventListener('click', () => {
      this.canvasEngine.sendBackward();
    });

    btnFlip?.addEventListener('click', () => {
      this.canvasEngine.flipHorizontal();
    });

    btnDuplicate?.addEventListener('click', () => {
      this.canvasEngine.duplicateSelected();
    });

    btnDelete?.addEventListener('click', () => {
      this.canvasEngine.deleteSelected();
    });

    // Escutar eventos de seleção no motor do canvas
    this.canvasEngine.onSelectionChange = (meta, node) => {
      this.updateSelection(meta, node);
    };
  }

  updateSelection(meta, node) {
    this.selectedMeta = meta;
    const badge = document.getElementById('selection-badge');
    const badgeName = document.getElementById('selection-badge-name');

    if (!node || !meta) {
      this.element.classList.remove('active');
      badge?.classList.remove('visible');
      return;
    }

    this.element.classList.add('active');

    if (badge && badgeName) {
      badgeName.textContent = meta.name;
      badge.classList.add('visible');
    }

    // Adaptar botão de capa dependendo do tipo de peça
    const btnCover = document.getElementById('btn-action-cover');
    if (btnCover) {
      const isCylinderOrPanel = ['cylinder', 'panel_round', 'panel_arch'].includes(meta.type);
      btnCover.innerHTML = isCylinderOrPanel ? '🎨 Capa / Estampa' : '🖼️ Trocar Imagem';
    }
  }
}
