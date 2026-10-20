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
    const btnToFront = document.getElementById('btn-action-to-front');
    const btnToBack = document.getElementById('btn-action-to-back');

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

    btnToFront?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.bringToFront();
    });

    btnFront?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.bringForward();
    });

    btnBack?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.sendBackward();
    });

    btnToBack?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.sendToBack();
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

    if (this.canvasEngine.isRepositioningCover) {
      this.toolbarEl?.classList.remove('active');
    } else {
      this.toolbarEl?.classList.add('active');
    }

    const mode = getItemCustomizationMode(meta);

    if (badge && badgeName) {
      badgeName.textContent = meta.name;
      badge.classList.add('visible');
    }

    const paletteSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z"/></svg>`;
    const cropSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;

    if (btnCover) {
      if (meta.type === 'moinho') {
        const colorLabel = (meta.currentColor || 'marrom').toUpperCase();
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `${paletteSvg} ${colorLabel}`;
        btnCover.title = 'Alternar Acabamento do Moinho';
      } else if (mode === 'structural') {
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `${paletteSvg} Capa / Cor`;
        btnCover.title = 'Vestir Capa ou Pintar Estrutura';
      } else if (mode === 'modular') {
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `${paletteSvg} Cores`;
        btnCover.title = 'Personalizar Cores dos Elementos SVG';
      } else {
        btnCover.style.display = 'none';
      }
    }

    if (btnReposition) {
      if (mode === 'structural' && meta.customCoverUrl) {
        btnReposition.style.display = 'inline-flex';
        btnReposition.innerHTML = `${cropSvg} Enquadrar`;
        btnReposition.title = 'Ajustar Enquadramento da Capa';
      } else {
        btnReposition.style.display = 'none';
      }
    }
  }
}
