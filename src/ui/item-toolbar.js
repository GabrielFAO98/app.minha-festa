// Barra Flutuante de Aes da Pea no Cenrio Mobile

export class ItemToolbar {
  constructor(canvasEngine, onOpenCoverModal, onOpenBalloonModal) {
    this.canvasEngine = canvasEngine;
    this.onOpenCoverModal = onOpenCoverModal;
    this.onOpenBalloonModal = onOpenBalloonModal;
    this.toolbarEl = document.getElementById('item-toolbar');
    this.selectedMeta = null;
    this.selectedNode = null;

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

    // EXCLUSO RPIDA E DIRETA
    btnDelete?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.selectedNode) {
        this.canvasEngine.deleteSelected();
      }
    });

    btnCover?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.selectedNode || !this.selectedMeta) return;

      const isBalloons = this.selectedMeta.category === 'baloes' || this.selectedMeta.type === 'balloon_arch';
      if (isBalloons && this.onOpenBalloonModal) {
        this.onOpenBalloonModal(this.selectedNode);
      } else if (this.onOpenCoverModal) {
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
    this.selectedNode = node;

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
      const isBalloons = meta.category === 'baloes' || meta.type === 'balloon_arch';
      const isCoverable = [
        'cylinder', 'cube',
        'panel_round', 'panel_arch', 'panel_rect', 'panel_half_moon', 'shimmer_wall',
        'table', 'table_organic', 'table_drop', 'table_side',
        'rug_oval', 'rug_round', 'rug_rect_3d',
        'display'
      ].includes(meta.type) || (meta.type && (meta.type.startsWith('panel') || meta.type.startsWith('rug') || meta.type.startsWith('table') || meta.type.startsWith('cube')));

      if (isBalloons) {
        btnCover.innerHTML = '🎨 Cores';
        btnCover.title = 'Trocar Paleta de Balões';
      } else if (isCoverable) {
        btnCover.innerHTML = '🎨 Capa';
        btnCover.title = 'Vestir Capa / Estampa';
      } else {
        btnCover.innerHTML = '🖼️ Imagem';
        btnCover.title = 'Alterar Imagem';
      }
    }
  }
}
