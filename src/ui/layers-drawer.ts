// Controle da Gaveta Oculta de Camadas (Estilo Canva)
import type { CanvasEngine } from '../core/canvas-engine';
import type { ConfirmModal } from './confirm-modal';
import type Konva from 'konva';

export class LayersDrawer {
  canvasEngine: CanvasEngine;
  confirmModal: ConfirmModal;
  drawerEl: HTMLElement | null;
  listEl: HTMLElement | null;
  countBadge: HTMLElement | null;
  btnClose: HTMLElement | null;

  constructor(canvasEngine: CanvasEngine, confirmModal: ConfirmModal) {
    this.canvasEngine = canvasEngine;
    this.confirmModal = confirmModal;
    this.drawerEl = document.getElementById('layers-drawer');
    this.listEl = document.getElementById('layers-list-items');
    this.countBadge = document.getElementById('layers-count-badge');
    this.btnClose = document.getElementById('btn-close-layers-drawer');

    this.setupEvents();
  }

  setupEvents(): void {
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

  toggle(): void {
    if (this.drawerEl?.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.renderLayers();
    this.drawerEl?.classList.add('open');
  }

  close(): void {
    this.drawerEl?.classList.remove('open');
  }

  renderLayers(): void {
    if (!this.listEl) return;
    const elements = this.canvasEngine.getSceneNodes().slice().reverse(); // Exibe os mais altos primeiro

    if (this.countBadge) {
      this.countBadge.textContent = `${elements.length} itens`;
    }

    this.listEl.innerHTML = '';

    if (elements.length === 0) {
      this.listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color: var(--text-muted); opacity: 0.6;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
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

      const lockIcon = isLocked
        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
        : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';

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
          <button class="layer-btn btn-up" title="Avançar uma camada"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg></button>
          <button class="layer-btn btn-down" title="Recuar uma camada"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>
          <button class="layer-btn btn-lock ${isLocked ? 'locked' : ''}" title="${isLocked ? 'Desbloquear' : 'Bloquear posição'}">
            ${lockIcon}
          </button>
          <button class="layer-btn btn-del" title="Excluir peça"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      `;

      // Selecionar ao clicar na linha
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.layer-btn')) return;
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
        this.canvasEngine.toggleLockNode(node);
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

      this.listEl?.appendChild(row);
    });
  }

  highlightSelected(node: Konva.Group | Konva.Node | null): void {
    if (!this.listEl) return;
    const meta = node ? node.getAttr('itemMeta') : null;
    this.listEl.querySelectorAll('.layer-item-row').forEach((row) => {
      const htmlRow = row as HTMLElement;
      htmlRow.classList.toggle('active', !!(meta && htmlRow.dataset.instanceId === meta.instanceId));
    });
  }
}

