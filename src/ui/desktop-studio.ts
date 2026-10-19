import { generateMoinhoSVG } from '../core/presets-data';
import { getItemCustomizationMode } from '../core/modular-svg-generator';
import { getItemsByCategory, getAllItems, getAllCovers } from '../core/db';
import { REALISTIC_ENVIRONMENTS } from '../core/textures-data';
import type { CanvasEngine } from '../core/canvas-engine';
import type { PresetItem, SceneElement } from '../types';
import type Konva from 'konva';
import { CANVA_LAYER_ICONS, setupLayersDragAndDrop } from './layers-drag-drop';

export class DesktopStudio {
  canvasEngine: CanvasEngine;
  onOpenInventoryModal: () => void;
  onOpenCoverModal: (meta: PresetItem) => void;
  onOpenBalloonModal: (node: Konva.Group | Konva.Node) => void;

  activeCatalogTab: string;
  currentPresetCategory: string;

  constructor(
    canvasEngine: CanvasEngine,
    onOpenInventoryModal: () => void,
    onOpenCoverModal: (meta: PresetItem) => void,
    onOpenBalloonModal: (node: Konva.Group | Konva.Node) => void
  ) {
    this.canvasEngine = canvasEngine;
    this.onOpenInventoryModal = onOpenInventoryModal;
    this.onOpenCoverModal = onOpenCoverModal;
    this.onOpenBalloonModal = onOpenBalloonModal;

    this.activeCatalogTab = 'presets';
    this.currentPresetCategory = 'todos';

    this.setupUI();
  }

  setupUI(): void {
    this.initCatalogTabs();
    this.renderCatalogContent();
    this.initInspectorListeners();
    this.updateInspector(null, null);
    this.renderLayersList([]);

    this.canvasEngine.onLayersChange = (elements) => {
      this.renderLayersList(elements);
    };
  }

  initCatalogTabs(): void {
    const tabButtons = document.querySelectorAll('.desktop-tab-btn');
    tabButtons.forEach((btnNode) => {
      const btn = btnNode as HTMLElement;
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab || 'presets';
        this.activeCatalogTab = tab;
        tabButtons.forEach((b) => (b as HTMLElement).classList.toggle('active', (b as HTMLElement).dataset.tab === tab));
        this.renderCatalogContent();
      });
    });
  }

  async renderCatalogContent(): Promise<void> {
    const container = document.getElementById('desktop-catalog-content');
    if (!container) return;

    container.innerHTML = '';

    if (this.activeCatalogTab === 'presets') {
      await this.renderPresets(container);
    } else if (this.activeCatalogTab === 'my-items') {
      await this.renderMyItems(container);
    } else if (this.activeCatalogTab === 'covers') {
      await this.renderCovers(container);
    } else if (this.activeCatalogTab === 'environment') {
      await this.renderEnvironments(container);
    }
  }

  // ABA 1: Presets Base
  async renderPresets(container: HTMLElement): Promise<void> {
    const catBar = document.createElement('div');
    catBar.className = 'desktop-category-pills';

    const categories = [
      { id: 'todos', label: 'Todos' },
      { id: 'paineis', label: 'Painéis' },
      { id: 'cilindros', label: 'Cilindros' },
      { id: 'mesas', label: 'Mesas' },
      { id: 'tapetes', label: 'Tapetes' },
      { id: 'displays', label: 'Displays' },
      { id: 'acessorios', label: 'Acessórios' }
    ];

    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = `pill-btn ${this.currentPresetCategory === cat.id ? 'active' : ''}`;
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        this.currentPresetCategory = cat.id;
        this.renderCatalogContent();
      });
      catBar.appendChild(btn);
    });

    container.appendChild(catBar);

    const items = await getItemsByCategory(this.currentPresetCategory);
    const presetItems = items.filter((i) => !i.isCustom);

    const grid = document.createElement('div');
    grid.className = 'desktop-catalog-grid';

    presetItems.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'desktop-item-card';
      card.innerHTML = `
        <div class="card-thumb-wrap">
          <img src="${item.previewUrl}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="card-title">${item.name}</div>
        <div class="card-dimensions">${item.widthCm}x${item.heightCm}cm</div>
      `;
      card.addEventListener('click', async () => {
        await this.canvasEngine.addItem(item);
      });
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // ABA 2: Meu Acervo
  async renderMyItems(container: HTMLElement): Promise<void> {
    const addHeader = document.createElement('div');
    addHeader.style.padding = '8px 12px';
    addHeader.innerHTML = `
      <button class="btn-primary" style="width: 100%; font-size: 0.82rem;" id="btn-desktop-add-inventory">
        ➕ Cadastrar Nova Peça no Acervo
      </button>
    `;
    container.appendChild(addHeader);

    addHeader.querySelector('#btn-desktop-add-inventory')?.addEventListener('click', () => {
      this.onOpenInventoryModal();
    });

    const allItems = await getAllItems();
    const customItems = allItems.filter((i) => i.isCustom);

    if (customItems.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-catalog-box';
      empty.innerHTML = `
        <div style="font-size: 1.8rem; margin-bottom: 6px;">📦</div>
        <div>Nenhuma peça cadastrada ainda.</div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Tire fotos das suas mesas e peças reais em WebP/PNG!</div>
      `;
      container.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'desktop-catalog-grid';

    customItems.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'desktop-item-card';
      card.innerHTML = `
        <div class="card-thumb-wrap">
          <img src="${item.previewUrl}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="card-title">${item.name}</div>
        <div class="card-dimensions">${item.widthCm}x${item.heightCm}cm • R$ ${item.rentalPrice || 0}</div>
      `;
      card.addEventListener('click', async () => {
        await this.canvasEngine.addItem(item);
      });
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // ABA 3: Capas e Estampas
  async renderCovers(container: HTMLElement): Promise<void> {
    const covers = await getAllCovers();
    const grid = document.createElement('div');
    grid.className = 'desktop-catalog-grid';

    covers.forEach((cover) => {
      const card = document.createElement('div');
      card.className = 'desktop-item-card';
      card.innerHTML = `
        <div class="card-thumb-wrap">
          <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy" />
        </div>
        <div class="card-title">${cover.name}</div>
        <div class="card-dimensions">${cover.themeName}</div>
      `;
      card.addEventListener('click', async () => {
        const node = this.canvasEngine.selectedNode;
        if (!node) {
          alert('Selecione primeiro um painel, cilindro, cubo ou tapete no palco para vestir a capa.');
          return;
        }
        const meta = node.getAttr('itemMeta') as PresetItem;
        if (getItemCustomizationMode(meta) !== 'structural') {
          alert(`A peça "${meta.name}" não utiliza capas de tecido.`);
          return;
        }
        await this.canvasEngine.applyCoverToSelected(cover.imageUrl);
      });
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // ABA 4: Cenários
  async renderEnvironments(container: HTMLElement): Promise<void> {
    const grid = document.createElement('div');
    grid.className = 'desktop-catalog-grid';

    REALISTIC_ENVIRONMENTS.forEach((env) => {
      const card = document.createElement('div');
      card.className = 'desktop-item-card';
      card.innerHTML = `
        <div class="card-thumb-wrap" style="aspect-ratio: 9/16; max-height: 140px;">
          <img src="${env.previewThumb}" alt="${env.name}" style="object-fit: cover;" />
        </div>
        <div class="card-title">${env.name}</div>
        <div class="card-dimensions">${env.category}</div>
      `;
      card.addEventListener('click', async () => {
        if (env.bgImageUrl) {
          await this.canvasEngine.setEnvironmentScenario(env.bgImageUrl);
        } else if (env.wallTexture && env.floorTexture) {
          await this.canvasEngine.setEnvironmentTextures(env.wallTexture, env.floorTexture);
        }
      });
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // INSPETOR DA PEÇA SELECIONADA
  initInspectorListeners(): void {
    const btnDel = document.getElementById('btn-desktop-delete');
    const btnCover = document.getElementById('btn-desktop-cover');
    const btnFront = document.getElementById('btn-desktop-front');
    const btnBack = document.getElementById('btn-desktop-back');
    const btnToFront = document.getElementById('btn-desktop-to-front');
    const btnToBack = document.getElementById('btn-desktop-to-back');

    btnDel?.addEventListener('click', () => this.canvasEngine.deleteSelected());
    btnFront?.addEventListener('click', () => this.canvasEngine.bringForward());
    btnBack?.addEventListener('click', () => this.canvasEngine.sendBackward());
    btnToFront?.addEventListener('click', () => this.canvasEngine.bringToFront());
    btnToBack?.addEventListener('click', () => this.canvasEngine.sendToBack());

    btnCover?.addEventListener('click', async () => {
      const node = this.canvasEngine.selectedNode;
      if (!node) return;
      const meta = (node.getAttr('itemMeta') || {}) as PresetItem;

      if (meta.type === 'moinho') {
        const order = ['marrom', 'branco', 'bege'];
        const current = meta.currentColor || 'marrom';
        const nextIdx = (order.indexOf(current) + 1) % order.length;
        const nextColor = order[nextIdx];
        const newUrl = generateMoinhoSVG(nextColor as any);
        await this.canvasEngine.changeItemImage(node as Konva.Group, newUrl, nextColor);
        const updatedMeta = node.getAttr('itemMeta');
        this.updateInspector(updatedMeta, node);
        return;
      }

      const mode = getItemCustomizationMode(meta);
      if (mode === 'modular') {
        this.onOpenBalloonModal(node);
      } else if (mode === 'structural') {
        this.onOpenCoverModal(meta);
      }
    });
  }

  updateInspector(meta: PresetItem | null, node: Konva.Group | Konva.Node | null): void {
    const box = document.getElementById('desktop-inspector-box');
    const emptyBox = document.getElementById('desktop-inspector-empty');
    const titleEl = document.getElementById('desktop-inspector-title');
    const sizeEl = document.getElementById('desktop-inspector-size');
    const thumbEl = document.getElementById('desktop-inspector-thumb') as HTMLImageElement | null;
    const btnCover = document.getElementById('btn-desktop-cover');
    const framingPanel = document.getElementById('desktop-cover-framing-panel');

    if (!node || !meta) {
      if (box) box.style.display = 'none';
      if (emptyBox) emptyBox.style.display = 'flex';
      return;
    }

    if (box) box.style.display = 'flex';
    if (emptyBox) emptyBox.style.display = 'none';

    const mode = getItemCustomizationMode(meta);

    if (titleEl) titleEl.textContent = meta.name;
    if (sizeEl) sizeEl.textContent = `${meta.widthCm}cm × ${meta.heightCm}cm`;
    if (thumbEl) thumbEl.src = meta.previewUrl;

    if (btnCover) {
      if (meta.type === 'moinho') {
        const colorLabel = (meta.currentColor || 'marrom').toUpperCase();
        btnCover.style.display = 'inline-flex';
        btnCover.textContent = `🎨 Cor MDF: ${colorLabel}`;
      } else if (mode === 'structural') {
        btnCover.style.display = 'inline-flex';
        btnCover.textContent = '🎨 Capa ou Cor';
      } else if (mode === 'modular') {
        btnCover.style.display = 'inline-flex';
        btnCover.textContent = '🎨 Personalizar Cores';
      } else {
        btnCover.style.display = 'none';
      }
    }

    if (framingPanel) {
      if (mode === 'structural' && meta.customCoverUrl) {
        framingPanel.style.display = 'flex';
        const isRepositioning = this.canvasEngine.isRepositioningCover;
        const scaleVal = meta.coverScale || 1;
        framingPanel.innerHTML = `
          <div class="framing-panel-header">
            <span>✋ Enquadramento da Capa</span>
            <span class="framing-zoom-tag">${Math.round(scaleVal * 100)}%</span>
          </div>
          <div class="framing-zoom-row">
            <span style="font-size: 0.72rem; color: var(--text-muted);">🔍</span>
            <input type="range" id="inspector-cover-zoom-slider" min="0.4" max="3.0" step="0.02" value="${scaleVal}" style="flex: 1; accent-color: var(--primary);" />
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" id="btn-inspector-toggle-reposition" class="btn-inspector-action ${isRepositioning ? 'btn-inspector-highlight' : ''}" style="flex: 1;">
              ${isRepositioning ? '✓ Concluir Arrasto' : '✋ Arrastar Capa'}
            </button>
            <button type="button" id="btn-inspector-reset-cover" class="btn-inspector-action" title="Centralizar Capa">
              ↺ Resetar
            </button>
          </div>
        `;

        const slider = framingPanel.querySelector('#inspector-cover-zoom-slider') as HTMLInputElement | null;
        const zoomTag = framingPanel.querySelector('.framing-zoom-tag');
        slider?.addEventListener('input', (e) => {
          const val = parseFloat((e.target as HTMLInputElement).value);
          if (zoomTag) zoomTag.textContent = `${Math.round(val * 100)}%`;
          this.canvasEngine.setCoverScale(val, false);
        });
        slider?.addEventListener('change', (e) => {
          const val = parseFloat((e.target as HTMLInputElement).value);
          this.canvasEngine.setCoverScale(val, true);
        });

        framingPanel.querySelector('#btn-inspector-toggle-reposition')?.addEventListener('click', () => {
          if (this.canvasEngine.isRepositioningCover) {
            this.canvasEngine.exitCoverRepositionMode();
          } else {
            this.canvasEngine.enterCoverRepositionMode();
          }
          this.updateInspector(this.canvasEngine.selectedNode?.getAttr('itemMeta') || meta, node);
        });

        framingPanel.querySelector('#btn-inspector-reset-cover')?.addEventListener('click', () => {
          this.canvasEngine.resetCoverTransform();
          this.updateInspector(this.canvasEngine.selectedNode?.getAttr('itemMeta') || meta, node);
        });
      } else {
        framingPanel.style.display = 'none';
        framingPanel.innerHTML = '';
      }
    }
  }

  // Helper para buscar o Konva.Group no decorLayer pelo instanceId
  getNodeByInstanceId(instanceId: string): Konva.Group | null {
    const nodes = this.canvasEngine.getSceneNodes();
    const found = nodes.find((n) => (n as any).getAttr('itemMeta')?.instanceId === instanceId);
    return (found as Konva.Group) || null;
  }

  // LISTA DE CAMADAS (LAYERS)
  renderLayersList(elements: (SceneElement | PresetItem)[]): void {
    const listEl = document.getElementById('desktop-layers-list');
    const badgeEl = document.getElementById('desktop-layers-count');
    if (!listEl) return;

    listEl.innerHTML = '';
    if (badgeEl) badgeEl.textContent = `${elements.length} peças`;

    if (elements.length === 0) {
      listEl.innerHTML = '<div style="font-size: 0.72rem; color: var(--text-muted); padding: 8px;">Nenhuma peça na decoração ainda.</div>';
      return;
    }

    const reversed = [...elements].reverse();

    reversed.forEach((elem) => {
      const row = document.createElement('div');
      row.className = 'layer-row-item';
      row.dataset.instanceId = elem.instanceId;

      const isSelected = (this.canvasEngine.selectedNode as any)?.getAttr('itemMeta')?.instanceId === elem.instanceId;
      if (isSelected) row.classList.add('selected');

      row.innerHTML = `
        <div class="layer-drag-handle" title="Arraste para reordenar a camada">${CANVA_LAYER_ICONS.grip}</div>
        <img class="layer-thumb" src="${elem.previewUrl}" alt="" />
        <div class="layer-info">
          <div class="layer-title">${elem.name}</div>
          <div class="layer-sub">${elem.widthCm}x${elem.heightCm}cm</div>
        </div>
        <div class="layer-item-actions">
          <button class="layer-mini-btn layer-btn-to-front" title="Trazer para o topo">${CANVA_LAYER_ICONS.toFront}</button>
          <button class="layer-mini-btn layer-btn-front" title="Trazer para frente">${CANVA_LAYER_ICONS.front}</button>
          <button class="layer-mini-btn layer-btn-back" title="Enviar para trás">${CANVA_LAYER_ICONS.back}</button>
          <button class="layer-mini-btn layer-btn-to-back" title="Enviar para o fundo">${CANVA_LAYER_ICONS.toBack}</button>
        </div>
      `;

      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.layer-mini-btn, .layer-drag-handle')) return;
        const targetNode = this.getNodeByInstanceId(elem.instanceId);
        if (targetNode) {
          this.canvasEngine.selectNode(targetNode);
        }
      });

      row.querySelector('.layer-btn-to-front')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.getNodeByInstanceId(elem.instanceId);
        if (targetNode) this.canvasEngine.bringToFront(targetNode);
      });

      row.querySelector('.layer-btn-front')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.getNodeByInstanceId(elem.instanceId);
        if (targetNode) this.canvasEngine.bringForward(targetNode);
      });

      row.querySelector('.layer-btn-back')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.getNodeByInstanceId(elem.instanceId);
        if (targetNode) this.canvasEngine.sendBackward(targetNode);
      });

      row.querySelector('.layer-btn-to-back')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.getNodeByInstanceId(elem.instanceId);
        if (targetNode) this.canvasEngine.sendToBack(targetNode);
      });

      listEl.appendChild(row);
    });

    setupLayersDragAndDrop(listEl, (newOrder) => {
      this.canvasEngine.reorderLayers(newOrder);
    });
  }
}
