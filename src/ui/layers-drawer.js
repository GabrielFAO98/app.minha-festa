// Controle da Gaveta Oculta de Camadas (Estilo Canva)

export class LayersDrawer {
  constructor(canvasEngine, confirmModal) {
    this.canvasEngine = canvasEngine;
    this.confirmModal = confirmModal;
    this.drawerEl = document.getElementById('layers-drawer');
    this.listEl = document.getElementById('layers-list-items');
    this.countBadge = document.getElementById('layers-count-badge');
    this.btnClose = document.getElementById('btn-close-layers-drawer');

    this.setupEvents();
  }

  setupEvents() {
    this.btnClose?.addEventListener('click', () => {
      this.close();
    });

    // Atualiza a lista automaticamente quando houver mudança na seleção
    this.canvasEngine.onSelectionChange = (meta, node) => {
      this.highlightSelected(node);
    };

    // Botão de abrir camadas no header
    const btnToggle = document.getElementById('btn-header-layers');
    btnToggle?.addEventListener('click', () => {
      this.toggle();
    });
  }

  toggle() {
    if (this.drawerEl?.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.renderLayers();
    this.drawerEl?.classList.add('open');
  }

  close() {
    this.drawerEl?.classList.remove('open');
  }

  renderLayers() {
    if (!this.listEl) return;
    const elements = this.canvasEngine.getSceneNodes().slice().reverse(); // Exibe os mais altos primeiro

    if (this.countBadge) {
      this.countBadge.textContent = `${elements.length} itens`;
    }

    this.listEl.innerHTML = '';

    if (elements.length === 0) {
      this.listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📄</div>
          <div class="empty-state-text">Nenhuma peça na decoração ainda.</div>
        </div>
      `;
      return;
    }

    elements.forEach((node) => {
      const meta = node.getAttr('itemMeta');
      if (!meta) return;

      const isSelected = this.canvasEngine.selectedNode === node;
      const isLocked = !node.draggable();

      const row = document.createElement('div');
      row.className = `layer-item-row ${isSelected ? 'active' : ''}`;
      row.dataset.instanceId = meta.instanceId;

      row.innerHTML = `
        <div class="layer-item-thumb">
          <img src="${meta.customCoverUrl || meta.previewUrl}" alt="${meta.name}"/>
        </div>
        <div class="layer-item-info">
          <div class="layer-item-name">${meta.name}</div>
          <div class="layer-item-meta">${meta.widthCm}x${meta.heightCm}cm ${meta.customCoverUrl ? '• Capa aplicada' : ''}</div>
        </div>
        <div class="layer-item-actions">
          <button class="layer-btn btn-up" title="Avançar uma camada">⬆️</button>
          <button class="layer-btn btn-down" title="Recuar uma camada">⬇️</button>
          <button class="layer-btn btn-lock ${isLocked ? 'locked' : ''}" title="${isLocked ? 'Desbloquear' : 'Bloquear posição'}">
            ${isLocked ? '🔒' : '🔓'}
          </button>
          <button class="layer-btn btn-del" title="Excluir peça">🗑️</button>
        </div>
      `;

      // Selecionar ao clicar na linha
      row.addEventListener('click', (e) => {
        if (e.target.closest('.layer-btn')) return;
        this.canvasEngine.selectNode(node);
        this.highlightSelected(node);
      });

      // Ações dos botões da camada
      row.querySelector('.btn-up')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.canvasEngine.selectNode(node);
        this.canvasEngine.bringForward();
        this.renderLayers();
      });

      row.querySelector('.btn-down')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.canvasEngine.selectNode(node);
        this.canvasEngine.sendBackward();
        this.renderLayers();
      });

      row.querySelector('.btn-lock')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const nowLocked = this.canvasEngine.toggleLockNode(node);
        this.renderLayers();
      });

      row.querySelector('.btn-del')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = await this.confirmModal.ask(
          'Excluir Peça?',
          `Deseja realmente remover <strong>${meta.name}</strong> da decoração?`
        );
        if (confirmed) {
          this.canvasEngine.selectNode(node);
          this.canvasEngine.deleteSelected();
          this.renderLayers();
        }
      });

      this.listEl.appendChild(row);
    });
  }

  highlightSelected(node) {
    if (!this.listEl) return;
    const meta = node ? node.getAttr('itemMeta') : null;
    this.listEl.querySelectorAll('.layer-item-row').forEach((row) => {
      row.classList.toggle('active', meta && row.dataset.instanceId === meta.instanceId);
    });
  }
}

