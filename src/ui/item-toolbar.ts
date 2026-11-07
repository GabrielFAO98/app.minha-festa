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
  stageMultiBtn: HTMLElement | null;
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
    this.stageMultiBtn = document.getElementById('btn-stage-multiselect');
    this.selectedMeta = null;
    this.selectedNode = null;

    this.setupUI();
  }

  setupUI(): void {
    if (!this.toolbarEl) return;

    // Botão de Seleção Múltipla no Topo Direito do Palco (junto com Desfazer / Refazer)
    this.stageMultiBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const active = this.canvasEngine.toggleMultiSelectMode();
      this.stageMultiBtn?.classList.toggle('active', active);
      const currentMeta = this.canvasEngine.selectedNode?.getAttr('itemMeta') as PresetItem | undefined;
      this.updateSelection(currentMeta || null, this.canvasEngine.selectedNode);
    });

    const btnDelete = document.getElementById('btn-action-delete');
    const btnCover = document.getElementById('btn-action-cover');
    const btnReposition = document.getElementById('btn-action-reposition');
    const btnFront = document.getElementById('btn-action-front');
    const btnBack = document.getElementById('btn-action-back');
    const btnToFront = document.getElementById('btn-action-to-front');
    const btnToBack = document.getElementById('btn-action-to-back');

    btnDelete?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.selectedNode || this.canvasEngine.selectedNodes.length > 0) {
        this.canvasEngine.deleteSelected();
      }
    });

    const btnGroup = document.getElementById('btn-action-group');
    btnGroup?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.canvasEngine.isGroupSelected()) {
        this.canvasEngine.ungroupSelected();
      } else {
        this.canvasEngine.groupSelected();
      }
    });

    const btnIsolate = document.getElementById('btn-action-isolate-item');
    btnIsolate?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.isolateGroupMember();
    });

    const btnExitIsolate = document.getElementById('btn-action-exit-isolation');
    btnExitIsolate?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.canvasEngine.exitGroupMemberIsolation();
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
      const hasAnyCover = Boolean(this.selectedMeta?.customCoverUrl || this.selectedMeta?.tabletopCoverUrl);
      if (!this.selectedNode || !hasAnyCover) return;
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

    // Sincroniza o botão de seleção múltipla do palco
    if (this.stageMultiBtn) {
      this.stageMultiBtn.classList.toggle('active', this.canvasEngine.isMultiSelectMode);
    }

    const groupRow = document.getElementById('item-toolbar-group-row');
    const badgeText = document.getElementById('group-toolbar-badge-text');
    const btnGroup = document.getElementById('btn-action-group');
    const labelGroup = document.getElementById('label-action-group');
    const btnIsolate = document.getElementById('btn-action-isolate-item');
    const btnExitIsolate = document.getElementById('btn-action-exit-isolation');

    const coverFrame = document.getElementById('cover-action-frame');
    const btnCover = document.getElementById('btn-action-cover');
    const btnReposition = document.getElementById('btn-action-reposition');

    const totalSelected = this.canvasEngine.selectedNodes.length;
    const isGroup = this.canvasEngine.isGroupSelected();
    const isIsolated = Boolean(this.canvasEngine.isolatedGroupId);

    if (!node || !meta || totalSelected === 0) {
      this.toolbarEl?.classList.remove('active');
      this.toolbarEl?.classList.remove('just-selected');
      if (groupRow) groupRow.style.display = 'none';
      return;
    }

    if (this.canvasEngine.isRepositioningCover) {
      this.toolbarEl?.classList.remove('active');
    } else {
      this.toolbarEl?.classList.add('active');
      // Pulso visual que vincula o clique da peça à barra
      this.toolbarEl?.classList.remove('just-selected');
      void this.toolbarEl?.offsetWidth;
      this.toolbarEl?.classList.add('just-selected');
    }

    // Gerencia a barra superior secundária (Agrupamento, Multi-Seleção e Isolamento)
    const showGroupRow = isGroup || totalSelected > 1 || isIsolated || this.canvasEngine.isMultiSelectMode;
    if (groupRow) {
      groupRow.style.display = showGroupRow ? 'flex' : 'none';
    }

    if (showGroupRow && badgeText) {
      if (isIsolated) {
        badgeText.textContent = 'Editando peça do grupo';
      } else if (isGroup) {
        badgeText.textContent = `Grupo (${totalSelected} peças)`;
      } else if (totalSelected > 1) {
        badgeText.textContent = `${totalSelected} peças selecionadas`;
      } else {
        badgeText.textContent = 'Seleção Múltipla';
      }
    }

    if (btnGroup && labelGroup) {
      if (isIsolated) {
        btnGroup.style.display = 'none';
      } else if (isGroup) {
        btnGroup.style.display = 'inline-flex';
        labelGroup.textContent = 'Desagrupar';
        btnGroup.title = 'Desvincular peças agrupadas';
      } else if (totalSelected > 1) {
        btnGroup.style.display = 'inline-flex';
        labelGroup.textContent = 'Agrupar';
        btnGroup.title = 'Vincular peças selecionadas (Estilo Canva)';
      } else {
        btnGroup.style.display = 'none';
      }
    }

    if (btnIsolate) {
      btnIsolate.style.display = isGroup && !isIsolated ? 'inline-flex' : 'none';
    }

    if (btnExitIsolate) {
      btnExitIsolate.style.display = isIsolated ? 'inline-flex' : 'none';
    }

    // Se múltiplos itens estiverem selecionados (e não estiver em modo edição de peça isolada)
    if (totalSelected > 1 && !isIsolated) {
      if (coverFrame) coverFrame.style.display = 'none';
      return;
    }

    if (coverFrame) {
      coverFrame.style.display = 'inline-flex';
    }

    const mode = getItemCustomizationMode(meta);
    const paletteSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z"/></svg>`;
    const cropSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;

    if (btnCover) {
      if (meta.type === 'moinho') {
        const colorLabel = (meta.currentColor || 'marrom').toUpperCase();
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `${paletteSvg} <span id="label-action-cover">${colorLabel}</span>`;
        btnCover.title = 'Alternar Acabamento do Moinho';
      } else if (mode === 'structural') {
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `${paletteSvg} <span id="label-action-cover">Capa / Cor</span>`;
        btnCover.title = 'Vestir Capa / Cor ou Pintar Peça';
      } else if (mode === 'modular') {
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `${paletteSvg} <span id="label-action-cover">Cores</span>`;
        btnCover.title = 'Personalizar Cores dos Elementos';
      } else {
        btnCover.style.display = 'none';
      }
    }

    const hasAnyCover = Boolean(meta.customCoverUrl || meta.tabletopCoverUrl);
    if (btnReposition) {
      if (mode === 'structural' && hasAnyCover) {
        btnReposition.style.display = 'inline-flex';
        btnReposition.innerHTML = `${cropSvg} <span>Enquadrar</span>`;
        btnReposition.title = 'Ajustar Enquadramento da Capa';
        coverFrame?.classList.add('has-reposition');
      } else {
        btnReposition.style.display = 'none';
        coverFrame?.classList.remove('has-reposition');
      }
    }
  }
}
