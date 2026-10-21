import { generateMoinhoSVG, DEFAULT_PRESET_ITEMS } from '../core/presets-data';
import { getItemCustomizationMode } from '../core/modular-svg-generator';
import { getAllItems, getAllCovers } from '../core/db';
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

    let presetItems = DEFAULT_PRESET_ITEMS;
    if (this.currentPresetCategory !== 'todos') {
      presetItems = DEFAULT_PRESET_ITEMS.filter((i) => i.category === this.currentPresetCategory);
    }

    const grid = document.createElement('div');
    grid.className = 'desktop-catalog-grid';
    const frag = document.createDocumentFragment();

    presetItems.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'desktop-item-card';
      card.innerHTML = `
        <div class="card-thumb-wrap">
          <img src="${item.previewUrl}" alt="${item.name}" loading="lazy" decoding="async"/>
        </div>
        <div class="card-title">${item.name}</div>
        <div class="card-dimensions">${item.widthCm}x${item.heightCm}cm</div>
      `;
      card.addEventListener('click', async () => {
        await this.canvasEngine.addItem(item);
      });
      frag.appendChild(card);
    });

    grid.appendChild(frag);
    container.appendChild(grid);
  }

  // ABA 2: Meu Acervo
  async renderMyItems(container: HTMLElement): Promise<void> {
    const addHeader = document.createElement('div');
    addHeader.style.padding = '8px 12px';
    addHeader.innerHTML = `
      <button class="btn-primary" style="width: 100%; height: 42px; font-size: 0.84rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 8px;" id="btn-desktop-add-inventory">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Cadastrar Nova Peça com Foto
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
      empty.className = 'empty-state my-items-empty';
      empty.style.margin = '8px 12px 16px';
      empty.innerHTML = `
        <div class="empty-state-icon-badge">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <div class="empty-state-title">
          Seu acervo ainda está vazio
        </div>
        <div class="empty-state-text">
          Fotografe suas peças reais de decoração para compor cenários exclusivos e orçamentos automáticos!
        </div>
      `;
      container.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'desktop-catalog-grid';
    const myFrag = document.createDocumentFragment();

    customItems.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'desktop-item-card';
      const priceText = item.rentalPrice && item.rentalPrice > 0
        ? ` • R$ ${Number(item.rentalPrice).toFixed(2).replace('.', ',')}`
        : '';
      card.innerHTML = `
        <div class="card-thumb-wrap">
          <img src="${item.previewUrl}" alt="${item.name}" loading="lazy" decoding="async"/>
        </div>
        <div class="card-title">${item.name}</div>
        <div class="card-dimensions">${item.widthCm}x${item.heightCm}cm${priceText}</div>
      `;
      card.addEventListener('click', async () => {
        await this.canvasEngine.addItem(item);
      });
      myFrag.appendChild(card);
    });

    grid.appendChild(myFrag);
    container.appendChild(grid);
  }

  // ABA 3: Capas e Estampas
  async renderCovers(container: HTMLElement): Promise<void> {
    const covers = await getAllCovers();
    const grid = document.createElement('div');
    grid.className = 'desktop-catalog-grid';
    const coversFrag = document.createDocumentFragment();

    covers.forEach((cover) => {
      const card = document.createElement('div');
      card.className = 'desktop-item-card';
      card.innerHTML = `
        <div class="card-thumb-wrap">
          <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy" decoding="async"/>
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
      coversFrag.appendChild(card);
    });

    grid.appendChild(coversFrag);

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

    // Sincroniza o destaque de camada ativa na lista do painel
    const listEl = document.getElementById('desktop-layers-list');
    if (listEl) {
      const selectedId = meta?.instanceId || null;
      listEl.querySelectorAll('.layer-row-item').forEach((r) => {
        const itemEl = r as HTMLElement;
        itemEl.classList.toggle('selected', Boolean(selectedId && itemEl.dataset.instanceId === selectedId));
      });
    }

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

    const paletteSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z"/></svg>`;

    if (btnCover) {
      btnCover.style.alignItems = 'center';
      btnCover.style.justifyContent = 'center';
      btnCover.style.gap = '6px';
      if (meta.type === 'moinho') {
        const colorLabel = (meta.currentColor || 'marrom').toUpperCase();
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `${paletteSvg} Cor MDF: ${colorLabel}`;
      } else if (mode === 'structural') {
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `${paletteSvg} Capa ou Cor`;
      } else if (mode === 'modular') {
        btnCover.style.display = 'inline-flex';
        btnCover.innerHTML = `${paletteSvg} Personalizar Cores`;
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
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              Enquadramento da Capa
            </span>
            <span class="framing-zoom-tag">${Math.round(scaleVal * 100)}%</span>
          </div>
          <div class="framing-zoom-row">
            <span style="display: inline-flex; align-items: center; color: var(--text-muted);">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="range" id="inspector-cover-zoom-slider" min="0.4" max="3.0" step="0.02" value="${scaleVal}" style="flex: 1; accent-color: var(--primary);" />
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" id="btn-inspector-toggle-reposition" class="btn-inspector-action ${isRepositioning ? 'btn-inspector-highlight' : ''}" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
              ${isRepositioning ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Concluir Arrasto' : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> Arrastar Capa'}
            </button>
            <button type="button" id="btn-inspector-reset-cover" class="btn-inspector-action" title="Centralizar Capa" style="display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Resetar
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
          <button class="layer-mini-btn layer-btn-front" title="Trazer para frente">${CANVA_LAYER_ICONS.front}</button>
          <button class="layer-mini-btn layer-btn-back" title="Enviar para trás">${CANVA_LAYER_ICONS.back}</button>
          <button class="layer-mini-btn layer-btn-to-front" title="Trazer para o topo">${CANVA_LAYER_ICONS.toFront}</button>
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
