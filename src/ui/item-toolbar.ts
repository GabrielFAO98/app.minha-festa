// Barra Flutuante de Ações da Peça no Cenário Mobile
import type { CanvasEngine } from '../core/canvas-engine';
import type { PresetItem } from '../types';
import { generateMoinhoSVG } from '../core/presets-data';
import { getItemCustomizationMode } from '../core/modular-svg-generator';
import type Konva from 'konva';

export class ItemToolbar {
  canvasEngine: CanvasEngine;
  onOpenCoverModal?: ((meta: PresetItem) => void) | null;
  onOpenBalloonModal?: ((node: Konva.Group | Konva.Node) => void) | null;
  toolbarEl: HTMLElement | null;
  selectedMeta: PresetItem | null;
  selectedNode: Konva.Group | Konva.Node | null;

  constructor(
    canvasEngine: CanvasEngine,
    onOpenCoverModal?: ((meta: PresetItem) => void) | null,
    onOpenBalloonModal?: ((node: Konva.Group | Konva.Node) => void) | null
  ) {
    this.canvasEngine = canvasEngine;
    this.onOpenCoverModal = onOpenCoverModal;
    this.onOpenBalloonModal = onOpenBalloonModal;
    this.toolbarEl = document.getElementById('item-toolbar');
    this.selectedMeta = null;
    this.selectedNode = null;

    this.setupUI();
  }

  setupUI(): void {
    if (!this.toolbarEl) return;

    const btnDelete = document.getElementById('btn-action-delete');
    const btnCover = document.getElementById('btn-action-cover');
    const btnReposition = document.getElementById('btn-action-reposition');
    const btnFront = document.getElementById('btn-action-front');
    const btnBack = document.getElementById('btn-action-back');
    const btnFlip = document.getElementById('btn-action-flip');
    const btnDuplicate = document.getElementById('btn-action-duplicate');

    btnDelete?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.selectedNode) {
        this.canvasEngine.deleteSelected();
      }
    });

    btnCover?.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!this.selectedNode || !this.selectedMeta) return;

      if (this.selectedMeta.type === 'moinho') {
        const order = ['marrom', 'branco', 'bege'];
        const current = this.selectedMeta.currentColor || 'marrom';
        const nextIdx = (order.indexOf(current) + 1) % order.length;
        const nextColor = order[nextIdx];
        const newUrl = generateMoinhoSVG(nextColor as any);
        await this.canvasEngine.changeItemImage(this.selectedNode as Konva.Group, newUrl, nextColor);
        const updatedMeta = this.selectedNode.getAttr('itemMeta');
        this.updateSelection(updatedMeta, this.selectedNode);
        return;
      }

      const mode = getItemCustomizationMode(this.selectedMeta);
      if (mode === 'modular' && this.onOpenBalloonModal) {
        this.onOpenBalloonModal(this.selectedNode);
      } else if (mode === 'structural' && this.onOpenCoverModal) {
        this.onOpenCoverModal(this.selectedMeta);
      }
    });

    btnReposition?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.selectedNode || !this.selectedMeta?.customCoverUrl) return;
      if (this.canvasEngine.isRepositioningCover) {
        this.canvasEngine.exitCoverRepositionMode();
      } else {
        this.canvasEngine.enterCoverRepositionMode();
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
  }

  updateSelection(meta: PresetItem | null, node: Konva.Group | Konva.Node | null): void {
    this.selectedMeta = meta;
    this.selectedNode = node;

    const badge = document.getElementById('selection-badge');
    const badgeName = document.getElementById('selection-badge-name');
    const btnCover = document.getElementById('btn-action-cover');
    const btnReposition = document.getElementById('btn-action-reposition');

    if (!node || !meta) {
      this.toolbarEl?.classList.remove('active');
      badge?.classList.remove('visible');
      return;
    }

    this.toolbarEl?.classList.add('active');

    const mode = getItemCustomizationMode(meta);

    if (badge && badgeName) {
      badgeName.textContent = meta.name;
      badge.classList.add('visible');
    }

    if (btnCover) {
      if (meta.type === 'moinho') {
        const colorLabel = (meta.currentColor || 'marrom').toUpperCase();
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `🎨 ${colorLabel}`;
        btnCover.title = 'Alternar Acabamento do Moinho';
      } else if (mode === 'structural') {
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = '🎨 Capa / Cor';
        btnCover.title = 'Vestir Capa ou Pintar Estrutura';
      } else if (mode === 'modular') {
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = '🎨 Cores';
        btnCover.title = 'Personalizar Cores dos Elementos SVG';
      } else {
        btnCover.style.display = 'none';
      }
    }

    if (btnReposition) {
      if (mode === 'structural' && meta.customCoverUrl) {
        btnReposition.style.display = 'inline-flex';
        btnReposition.innerHTML = '✋ Enquadrar';
        btnReposition.title = 'Arrastar e Dar Zoom na Capa';
      } else {
        btnReposition.style.display = 'none';
      }
    }
  }
}
