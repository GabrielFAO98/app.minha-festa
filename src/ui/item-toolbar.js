// Barra Flutuante Contextual de Ações do Item Selecionado (Com Camadas estilo Canva e Exclusão Segura)

export class ItemToolbar {
  constructor(canvasEngine, onOpenCoverModal, onOpenLayersDrawer, confirmModal) {
    this.canvasEngine = canvasEngine;
    this.onOpenCoverModal = onOpenCoverModal;
    this.onOpenLayersDrawer = onOpenLayersDrawer;
    this.confirmModal = confirmModal;
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
    const btnBringToFront = document.getElementById('btn-action-front');
    const btnSendToBack = document.getElementById('btn-action-back');
    const btnFlip = document.getElementById('btn-action-flip');
    const btnDuplicate = document.getElementById('btn-action-duplicate');
    const btnLock = document.getElementById('btn-action-lock');
    const btnOpenLayers = document.getElementById('btn-action-layers');
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

    btnBringToFront?.addEventListener('click', () => {
      this.canvasEngine.bringToFront();
    });

    btnSendToBack?.addEventListener('click', () => {
      this.canvasEngine.sendToBack();
    });

    btnFlip?.addEventListener('click', () => {
      this.canvasEngine.flipHorizontal();
    });

    btnDuplicate?.addEventListener('click', () => {
      this.canvasEngine.duplicateSelected();
    });

    btnLock?.addEventListener('click', () => {
      const isLocked = this.canvasEngine.toggleLockNode();
      btnLock.textContent = isLocked ? '🔒' : '🔓';
      btnLock.title = isLocked ? 'Destravar Peça' : 'Bloquear Posição';
    });

    btnOpenLayers?.addEventListener('click', () => {
      if (this.onOpenLayersDrawer) {
        this.onOpenLayersDrawer();
      }
    });

    btnDelete?.addEventListener('click', async () => {
      if (!this.selectedMeta) return;

      const confirmed = await this.confirmModal.ask(
        'Excluir Peça?',
        `Deseja realmente remover <strong>${this.selectedMeta.name}</strong> da decoração?`
      );

      if (confirmed) {
        this.canvasEngine.deleteSelected();
      }
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
    const btnLock = document.getElementById('btn-action-lock');

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

    if (btnLock) {
      const isLocked = !node.draggable();
      btnLock.textContent = isLocked ? '🔒' : '🔓';
    }

    // Adaptar botão de capa dependendo do tipo de peça
    const btnCover = document.getElementById('btn-action-cover');
    if (btnCover) {
      const isCylinderOrPanel = ['cylinder', 'panel_round', 'panel_arch'].includes(meta.type);
      btnCover.innerHTML = isCylinderOrPanel ? '🎨 Capa' : '🖼️ Imagem';
    }
  }
}
