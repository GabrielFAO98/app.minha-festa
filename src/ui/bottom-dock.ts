import { getAllItems, getAllCovers } from '../core/db';
import { getItemCustomizationMode } from '../core/modular-svg-generator';
import { REALISTIC_ENVIRONMENTS, WALL_OPTIONS, FLOOR_OPTIONS } from '../core/textures-data';
import { DEFAULT_PRESET_ITEMS } from '../core/presets-data';
import { createSearchBar, normalizeSearch } from './search-bar';
import type { CanvasEngine } from '../core/canvas-engine';
import type { PresetItem, ItemCategory } from '../types';
import { CANVA_LAYER_ICONS, setupLayersDragAndDrop } from './layers-drag-drop';

export class BottomDock {
  canvasEngine: CanvasEngine;
  onOpenInventoryModal: (itemToEdit?: PresetItem) => void;
  onOpenCoverModal: (meta: PresetItem | null) => void;
  activeTab: string | null;
  currentCategory: string;
  myItemsCategory: string;
  sheetEl: HTMLElement | null;
  sheetBody: HTMLElement | null;
  sheetTitle: HTMLElement | null;
  categoriesBar: HTMLElement | null;
  handleBar: HTMLElement | null;
  closeBtn: HTMLElement | null;
  tabButtons: NodeListOf<Element>;

  // Painéis cacheados no DOM para alternância instantânea (0ms)
  private panePresets: HTMLElement | null = null;
  private paneMyItems: HTMLElement | null = null;
  private paneCovers: HTMLElement | null = null;
  private paneEnvironment: HTMLElement | null = null;
  private paneLayers: HTMLElement | null = null;

  private presetsRendered = false;
  private myItemsRendered = false;
  private renderedMyItemsCategory: string | null = null;
  private coversRendered = false;
  private envRendered = false;
  private cachedCustomItems: PresetItem[] | null = null;
  private renderedPillsTab: 'presets' | 'my-items' | null = null;
  private presetsSearchTerm = '';
  private myItemsSearchTerm = '';
  private coversSearchTerm = '';

  constructor(
    canvasEngine: CanvasEngine,
    onOpenInventoryModal: (itemToEdit?: PresetItem) => void,
    onOpenCoverModal: (meta: PresetItem | null) => void
  ) {
    this.canvasEngine = canvasEngine;
    this.onOpenInventoryModal = onOpenInventoryModal;
    this.onOpenCoverModal = onOpenCoverModal;

    this.activeTab = null;
    this.currentCategory = 'todos';
    this.myItemsCategory = 'todos';

    this.sheetEl = document.getElementById('bottom-sheet');
    this.sheetBody = document.getElementById('sheet-body-content');
    this.sheetTitle = document.getElementById('sheet-current-title');
    this.categoriesBar = document.getElementById('sheet-categories-bar');
    this.handleBar = document.getElementById('sheet-handle-bar');
    this.closeBtn = document.getElementById('btn-close-sheet');
    this.tabButtons = document.querySelectorAll('.dock-tab-btn');

    this.setupEvents();
  }

  setupEvents(): void {
    this.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab;
        if (!tab) return;
        if (this.activeTab === tab && this.sheetEl?.classList.contains('open')) {
          this.closeSheet();
        } else {
          this.openTab(tab);
        }
      });
    });

    this.closeBtn?.addEventListener('click', () => this.closeSheet());
    this.handleBar?.addEventListener('click', () => {
      if (this.sheetEl?.classList.contains('open')) {
        this.closeSheet();
      }
    });

    // Pré-monta os painéis e pré-renderiza abas em segundo plano
    // para que qualquer toque do usuário no celular abra em 0ms
    setTimeout(async () => {
      this.initPanes();
      this.renderPresetsTab();
      try {
        await this.renderMyItemsTab();
        await this.renderCoversTab();
        this.renderEnvironmentTab();
      } catch (err) {
        // Silencia detalhes durante bootstrap
      }
    }, 80);
  }

  private initPanes(): void {
    if (!this.sheetBody || this.panePresets) return;

    this.panePresets = document.createElement('div');
    this.panePresets.className = 'sheet-tab-pane';
    this.panePresets.id = 'pane-presets';

    this.paneMyItems = document.createElement('div');
    this.paneMyItems.className = 'sheet-tab-pane';
    this.paneMyItems.id = 'pane-my-items';
    this.paneMyItems.style.display = 'none';

    this.paneCovers = document.createElement('div');
    this.paneCovers.className = 'sheet-tab-pane';
    this.paneCovers.id = 'pane-covers';
    this.paneCovers.style.display = 'none';

    this.paneEnvironment = document.createElement('div');
    this.paneEnvironment.className = 'sheet-tab-pane';
    this.paneEnvironment.id = 'pane-environment';
    this.paneEnvironment.style.display = 'none';

    this.paneLayers = document.createElement('div');
    this.paneLayers.className = 'sheet-tab-pane';
    this.paneLayers.id = 'pane-layers';
    this.paneLayers.style.display = 'none';

    this.sheetBody.replaceChildren(
      this.panePresets,
      this.paneMyItems,
      this.paneCovers,
      this.paneEnvironment,
      this.paneLayers
    );
  }

  private showPane(tabName: string): void {
    this.initPanes();
    if (this.panePresets) this.panePresets.style.display = tabName === 'presets' ? 'block' : 'none';
    if (this.paneMyItems) this.paneMyItems.style.display = tabName === 'my-items' ? 'block' : 'none';
    if (this.paneCovers) this.paneCovers.style.display = tabName === 'covers' ? 'block' : 'none';
    if (this.paneEnvironment) this.paneEnvironment.style.display = tabName === 'environment' ? 'block' : 'none';
    if (this.paneLayers) this.paneLayers.style.display = tabName === 'layers' ? 'block' : 'none';
  }

  invalidateCustomItemsCache(): void {
    this.cachedCustomItems = null;
    this.coversRendered = false;
    this.myItemsRendered = false;
  }

  async openTab(tabName: string): Promise<void> {
    this.activeTab = tabName;

    this.tabButtons.forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === tabName);
    });

    // Oculta a barra flutuante de ações da peça para não competir com a gaveta
    const floatingToolbar = document.getElementById('item-actions-floating');
    if (floatingToolbar) {
      floatingToolbar.classList.remove('active');
    }

    // 1. Abre a gaveta imediatamente no compositor de hardware (0ms)
    this.sheetEl?.classList.add('open');

    // 2. Alterna para o painel em memória (0ms)
    this.showPane(tabName);

    // 3. Popula / sincroniza dados do painel ativo
    if (tabName === 'presets') {
      this.renderPresetsTab();
    } else if (tabName === 'my-items') {
      await this.renderMyItemsTab();
    } else if (tabName === 'covers') {
      await this.renderCoversTab();
    } else if (tabName === 'environment') {
      this.renderEnvironmentTab();
    } else if (tabName === 'layers') {
      this.renderLayersTab();
    }
  }

  closeSheet(): void {
    this.sheetEl?.classList.remove('open');
    this.tabButtons.forEach((btn) => btn.classList.remove('active'));
    this.activeTab = null;

    // Se houver uma peça selecionada no palco, restaura a barra flutuante de ações
    if (this.canvasEngine.selectedNode && this.canvasEngine.onSelectionChange) {
      const meta = this.canvasEngine.selectedNode.getAttr('itemMeta') || null;
      this.canvasEngine.onSelectionChange(meta, this.canvasEngine.selectedNode);
    }
  }

  // ABA 1: Peças Base (Elementos) - Resposta Instantânea 0ms (In-Memory com Filtro O(1))
  renderPresetsTab(): void {
    if (this.sheetTitle) this.sheetTitle.textContent = 'Elementos';
    if (this.categoriesBar) this.categoriesBar.style.display = 'flex';
    this.renderCategoryPills('presets');

    if (!this.presetsRendered && this.panePresets) {
      this.buildPresetsGrid();
      this.presetsRendered = true;
    }

    this.filterPresetsGrid();
  }

  private buildPresetsGrid(): void {
    if (!this.panePresets) return;

    const searchBar = createSearchBar({
      placeholder: 'Buscar elementos...',
      initialValue: this.presetsSearchTerm,
      onSearch: (term) => {
        this.presetsSearchTerm = normalizeSearch(term);
        this.filterPresetsGrid();
      }
    });

    const grid = document.createElement('div');
    grid.className = 'items-grid';
    grid.id = 'sheet-items-grid';

    const fragment = document.createDocumentFragment();
    DEFAULT_PRESET_ITEMS.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'element-card';
      card.dataset.category = item.category;
      card.dataset.normalizedName = normalizeSearch(item.name);
      card.title = item.name;
      card.innerHTML = `
        <img src="${item.previewUrl}" alt="${item.name}" loading="lazy" decoding="async"/>
        <div class="element-card-overlay">${item.name}</div>
      `;

      card.addEventListener('click', async () => {
        await this.canvasEngine.addItem(item);
        this.closeSheet();
      });

      fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    const emptySearch = document.createElement('div');
    emptySearch.className = 'catalog-search-empty';
    emptySearch.id = 'presets-search-empty';
    emptySearch.style.display = 'none';
    emptySearch.innerHTML = `
      <div class="empty-state-title" style="font-size: 0.86rem;">Nenhum elemento encontrado</div>
      <div class="empty-state-text" style="font-size: 0.74rem;">Nenhum item corresponde à sua busca. Tente outro termo ou categoria.</div>
    `;

    this.panePresets.replaceChildren(searchBar, grid, emptySearch);
  }

  private filterPresetsGrid(): void {
    if (!this.panePresets) return;
    const cards = this.panePresets.querySelectorAll<HTMLElement>('.element-card');
    let visibleCount = 0;
    cards.forEach((card) => {
      const cat = card.dataset.category;
      const name = card.dataset.normalizedName || '';
      const matchCat = this.currentCategory === 'todos' || cat === this.currentCategory;
      const matchSearch = !this.presetsSearchTerm || name.includes(this.presetsSearchTerm);
      const visible = matchCat && matchSearch;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    const emptyEl = this.panePresets.querySelector<HTMLElement>('#presets-search-empty');
    if (emptyEl) {
      emptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  renderCategoryPills(tab: 'presets' | 'my-items'): void {
    if (!this.categoriesBar) return;
    const currentSelected = tab === 'presets' ? this.currentCategory : this.myItemsCategory;

    // Se as pílulas para esta aba já estão montadas no DOM, apenas atualiza a classe active instantaneamente
    if (this.renderedPillsTab === tab && this.categoriesBar.children.length > 0) {
      const buttons = this.categoriesBar.querySelectorAll<HTMLButtonElement>('.pill-btn');
      buttons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.catId === currentSelected);
      });
      return;
    }

    this.renderedPillsTab = tab;
    const categories: { id: ItemCategory | string; label: string }[] = [
      { id: 'todos', label: 'Todos' },
      { id: 'paineis', label: 'Painéis' },
      { id: 'cilindros', label: 'Cilindros' },
      { id: 'mesas', label: 'Mesas' },
      { id: 'tapetes', label: 'Tapetes' },
      { id: 'displays', label: 'Displays' },
      { id: 'acessorios', label: 'Acessórios' }
    ];

    const fragment = document.createDocumentFragment();
    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pill-btn ${currentSelected === cat.id ? 'active' : ''}`;
      btn.dataset.catId = cat.id;
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        if (tab === 'presets') {
          if (this.currentCategory === cat.id) return;
          this.currentCategory = cat.id;
          this.renderCategoryPills('presets');
          this.filterPresetsGrid();
        } else {
          if (this.myItemsCategory === cat.id) return;
          this.myItemsCategory = cat.id;
          this.renderCategoryPills('my-items');
          this.renderMyItemsTab();
        }
      });
      fragment.appendChild(btn);
    });

    this.categoriesBar.replaceChildren(fragment);
  }

  // ABA 2: Meu Acervo Pessoal (Com Cache em Memória)
  async renderMyItemsTab(forceReload = false): Promise<void> {
    if (this.sheetTitle) this.sheetTitle.textContent = 'Meu Acervo';
    if (this.categoriesBar) this.categoriesBar.style.display = 'flex';
    this.renderCategoryPills('my-items');
    if (!this.paneMyItems) return;

    if (!forceReload && this.myItemsRendered && this.renderedMyItemsCategory === this.myItemsCategory && this.paneMyItems.children.length > 0) {
      return;
    }
    this.myItemsRendered = true;
    this.renderedMyItemsCategory = this.myItemsCategory;

    if (forceReload || !this.cachedCustomItems) {
      const all = await getAllItems();
      this.cachedCustomItems = all.filter((i) => i.isCustom);
    }

    let customItems = this.cachedCustomItems;
    if (this.myItemsCategory !== 'todos') {
      customItems = customItems.filter((i) => i.category === this.myItemsCategory);
    }
    if (this.myItemsSearchTerm) {
      customItems = customItems.filter((i) => normalizeSearch(i.name).includes(this.myItemsSearchTerm));
    }

    const wrapper = document.createElement('div');

    const addHeader = document.createElement('div');
    addHeader.style.marginBottom = '8px';
    addHeader.innerHTML = `
      <button id="btn-add-inventory-item" class="btn-primary" style="width: 100%; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Cadastrar Nova Peça com Foto
      </button>
    `;
    wrapper.appendChild(addHeader);

    const searchBar = createSearchBar({
      placeholder: 'Buscar no meu acervo...',
      initialValue: this.myItemsSearchTerm,
      onSearch: (term) => {
        this.myItemsSearchTerm = normalizeSearch(term);
        this.renderMyItemsTab(true);
      }
    });
    wrapper.appendChild(searchBar);

    if (customItems.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state my-items-empty';
      emptyDiv.innerHTML = `
        <div class="empty-state-icon-badge">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <div class="empty-state-title">
          ${this.myItemsSearchTerm ? 'Nenhuma peça encontrada' : (this.myItemsCategory === 'todos' ? 'Seu acervo ainda está vazio' : 'Nenhuma peça nesta categoria')}
        </div>
        <div class="empty-state-text">
          ${this.myItemsSearchTerm
            ? 'Nenhuma peça corresponde à sua busca. Tente outro termo.'
            : (this.myItemsCategory === 'todos'
              ? 'Fotografe suas peças reais de decoração para compor cenários exclusivos e orçamentos automáticos!'
              : 'Nenhuma peça cadastrada nesta categoria. Toque no botão acima para adicionar!')}
        </div>
      `;
      wrapper.appendChild(emptyDiv);
    } else {
      const grid = document.createElement('div');
      grid.className = 'items-grid';
      grid.id = 'custom-items-grid';
      const fragment = document.createDocumentFragment();
      customItems.forEach((item) => {
        const card = this.createMyItemCard(item);
        fragment.appendChild(card);
      });
      grid.appendChild(fragment);
      wrapper.appendChild(grid);
    }

    this.paneMyItems.replaceChildren(wrapper);

    this.paneMyItems.querySelector('#btn-add-inventory-item')?.addEventListener('click', () => {
      if (this.onOpenInventoryModal) {
        this.onOpenInventoryModal();
      }
    });
  }

  createMyItemCard(item: PresetItem): HTMLElement {
    const card = document.createElement('div');
    card.className = 'my-item-card';

    const priceText = item.rentalPrice && item.rentalPrice > 0
      ? `R$ ${Number(item.rentalPrice).toFixed(2).replace('.', ',')}`
      : '';

    card.innerHTML = `
      <div class="my-item-card-preview">
        <img src="${item.previewUrl}" alt="${item.name}" loading="lazy" decoding="async"/>
      </div>
      <div class="my-item-card-title">${item.name}</div>
      <div class="my-item-card-meta">
        <span>${item.widthCm}x${item.heightCm} cm</span>
        <span>•</span>
        <span>Qtd: ${item.stockQuantity || 1}</span>
      </div>
      ${priceText ? `<div class="my-item-card-price">${priceText}</div>` : ''}
      <button type="button" class="btn-card-edit" data-edit-id="${item.id}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <span>Editar</span>
      </button>
    `;

    card.addEventListener('click', async (e) => {
      if ((e.target as HTMLElement).closest('.btn-card-edit')) return;
      await this.canvasEngine.addItem(item);
      this.closeSheet();
    });

    card.querySelector('.btn-card-edit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onOpenInventoryModal) {
        this.onOpenInventoryModal(item);
      }
    });

    return card;
  }

  // ABA 3: Catálogo de Capas e Estampas (Cacheado)
  async renderCoversTab(forceReload = false): Promise<void> {
    if (this.sheetTitle) this.sheetTitle.textContent = 'Temas e Capas Disponíveis';
    if (this.categoriesBar) this.categoriesBar.style.display = 'none';
    if (!this.paneCovers) return;

    if (!forceReload && this.coversRendered) return;
    this.coversRendered = true;

    const allCovers = await getAllCovers();
    const customCovers = allCovers.filter((c) => c.isCustom).reverse();
    const factoryCovers = allCovers.filter((c) => !c.isCustom);

    const wrapper = document.createElement('div');

    const addHeader = document.createElement('div');
    addHeader.style.marginBottom = '8px';
    addHeader.innerHTML = `
      <button id="btn-add-new-cover" class="btn-primary" style="width: 100%; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Subir nova estampa
      </button>
    `;
    wrapper.appendChild(addHeader);

    const searchBar = createSearchBar({
      placeholder: 'Buscar estampas ou temas...',
      initialValue: this.coversSearchTerm,
      onSearch: (term) => {
        this.coversSearchTerm = normalizeSearch(term);
        this.filterCoversInDock();
      }
    });
    wrapper.appendChild(searchBar);

    const attachCoverClick = (card: HTMLElement, coverUrl: string) => {
      card.addEventListener('click', async () => {
        const selected = this.canvasEngine.selectedNode;
        if (!selected) {
          alert('Toque primeiro em um painel, cilindro, cubo ou tapete no palco para vestir esta capa.');
          return;
        }
        const meta = selected.getAttr('itemMeta') as PresetItem | undefined;
        if (!meta || getItemCustomizationMode(meta) !== 'structural') {
          alert(`A peça "${meta?.name || 'selecionada'}" não utiliza capas de tecido.`);
          return;
        }
        await this.canvasEngine.applyCoverToSelected(coverUrl);
        this.closeSheet();
      });
    };

    if (customCovers.length > 0) {
      const heading = document.createElement('div');
      heading.className = 'covers-section-heading';
      heading.id = 'heading-my-covers';
      heading.style.marginTop = '10px';
      heading.style.marginBottom = '8px';
      heading.innerHTML = `<span>Estampas e Imagens</span>`;
      wrapper.appendChild(heading);

      const myGrid = document.createElement('div');
      myGrid.className = 'covers-grid';
      myGrid.id = 'sheet-my-covers-grid';
      myGrid.style.marginBottom = '16px';
      customCovers.forEach((cover) => {
        const card = document.createElement('div');
        card.className = 'cover-card';
        card.dataset.normalizedText = normalizeSearch(cover.name + ' ' + (cover.themeName || ''));
        card.innerHTML = `
          <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy" decoding="async"/>
          <div class="cover-card-label">${cover.name}</div>
        `;
        attachCoverClick(card, cover.imageUrl);
        myGrid.appendChild(card);
      });
      wrapper.appendChild(myGrid);
    }

    const factoryHeading = document.createElement('div');
    factoryHeading.className = 'covers-section-heading';
    factoryHeading.id = 'heading-factory-covers';
    factoryHeading.style.marginTop = '10px';
    factoryHeading.style.marginBottom = '8px';
    factoryHeading.innerHTML = `<span>Capas do Catálogo Padrão</span>`;
    wrapper.appendChild(factoryHeading);

    const factoryGrid = document.createElement('div');
    factoryGrid.className = 'covers-grid';
    factoryGrid.id = 'sheet-factory-covers-grid';
    factoryCovers.forEach((cover) => {
      const card = document.createElement('div');
      card.className = 'cover-card';
      card.dataset.normalizedText = normalizeSearch(cover.name + ' ' + (cover.themeName || ''));
      card.innerHTML = `
        <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy" decoding="async"/>
        <div class="cover-card-label">${cover.name}</div>
      `;
      attachCoverClick(card, cover.imageUrl);
      factoryGrid.appendChild(card);
    });
    wrapper.appendChild(factoryGrid);

    const emptySearch = document.createElement('div');
    emptySearch.className = 'catalog-search-empty';
    emptySearch.id = 'covers-search-empty';
    emptySearch.style.display = 'none';
    emptySearch.innerHTML = `
      <div class="empty-state-title" style="font-size: 0.86rem;">Nenhuma estampa encontrada</div>
      <div class="empty-state-text" style="font-size: 0.74rem;">Nenhuma estampa corresponde ao termo digitado.</div>
    `;
    wrapper.appendChild(emptySearch);

    this.paneCovers.replaceChildren(wrapper);

    wrapper.querySelector('#btn-add-new-cover')?.addEventListener('click', () => {
      if (this.onOpenCoverModal) {
        const meta = this.canvasEngine.selectedNode?.getAttr('itemMeta') || null;
        this.onOpenCoverModal(meta);
      }
    });

    this.filterCoversInDock();
  }

  private filterCoversInDock(): void {
    if (!this.paneCovers) return;
    const term = this.coversSearchTerm;
    const myCards = this.paneCovers.querySelectorAll<HTMLElement>('#sheet-my-covers-grid .cover-card');
    let myVisible = 0;
    myCards.forEach((c) => {
      const text = c.dataset.normalizedText || '';
      const match = !term || text.includes(term);
      c.style.display = match ? '' : 'none';
      if (match) myVisible++;
    });

    const factoryCards = this.paneCovers.querySelectorAll<HTMLElement>('#sheet-factory-covers-grid .cover-card');
    let factoryVisible = 0;
    factoryCards.forEach((c) => {
      const text = c.dataset.normalizedText || '';
      const match = !term || text.includes(term);
      c.style.display = match ? '' : 'none';
      if (match) factoryVisible++;
    });

    const myHeading = this.paneCovers.querySelector<HTMLElement>('#heading-my-covers');
    if (myHeading) myHeading.style.display = myVisible > 0 ? '' : 'none';

    const factoryHeading = this.paneCovers.querySelector<HTMLElement>('#heading-factory-covers');
    if (factoryHeading) factoryHeading.style.display = factoryVisible > 0 ? '' : 'none';

    const emptySearch = this.paneCovers.querySelector<HTMLElement>('#covers-search-empty');
    if (emptySearch) {
      emptySearch.style.display = (myVisible === 0 && factoryVisible === 0) ? 'block' : 'none';
    }
  }

  // ABA 4: Cenários Realistas COM ESCOLHA POR IMAGEM (Cacheado)
  renderEnvironmentTab(): void {
    if (this.sheetTitle) this.sheetTitle.textContent = 'Escolha do Cenário';
    if (this.categoriesBar) this.categoriesBar.style.display = 'none';
    if (!this.paneEnvironment) return;

    if (this.envRendered) return;
    this.envRendered = true;

    let html = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <div class="form-label" style="margin-bottom: 8px;">Cenários Fotográficos e Ambientes (Toque na Imagem)</div>
          <div class="scene-visual-grid">
            ${REALISTIC_ENVIRONMENTS.map(env => `
              <div class="scene-visual-card btn-preset-env" data-bg="${env.bgImageUrl || ''}" data-wall="${env.wallTexture || ''}" data-floor="${env.floorTexture || ''}">
                <img src="${env.previewThumb}" alt="${env.name}" loading="lazy" decoding="async"/>
                <div class="scene-visual-overlay">${env.name}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="form-label" style="margin-bottom: 8px;">Trocar Parede de Fundo (Toque na Imagem)</div>
          <div class="scene-visual-grid">
            ${WALL_OPTIONS.map(w => `
              <div class="scene-visual-card btn-custom-wall" data-wall="${w.texture}">
                <img src="${w.texture}" alt="${w.name}" loading="lazy" decoding="async"/>
                <div class="scene-visual-overlay">${w.name}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="form-label" style="margin-bottom: 8px;">Trocar Piso (Toque na Imagem)</div>
          <div class="scene-visual-grid">
            ${FLOOR_OPTIONS.map(f => `
              <div class="scene-visual-card btn-custom-floor" data-floor="${f.texture}">
                <img src="${f.texture}" alt="${f.name}" loading="lazy" decoding="async"/>
                <div class="scene-visual-overlay">${f.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.paneEnvironment.innerHTML = html;

    this.paneEnvironment.querySelectorAll('.btn-preset-env').forEach((card) => {
      card.addEventListener('click', async () => {
        const bg = (card as HTMLElement).dataset.bg;
        if (bg) {
          await this.canvasEngine.setEnvironmentScenario(bg);
        } else {
          const wall = (card as HTMLElement).dataset.wall || null;
          const floor = (card as HTMLElement).dataset.floor || null;
          await this.canvasEngine.setEnvironmentTextures(wall, floor);
        }
      });
    });

    this.paneEnvironment.querySelectorAll('.btn-custom-wall').forEach((card) => {
      card.addEventListener('click', async () => {
        const wall = (card as HTMLElement).dataset.wall || null;
        await this.canvasEngine.setEnvironmentTextures(wall, null);
      });
    });

    this.paneEnvironment.querySelectorAll('.btn-custom-floor').forEach((card) => {
      card.addEventListener('click', async () => {
        const floor = (card as HTMLElement).dataset.floor || null;
        await this.canvasEngine.setEnvironmentTextures(null, floor);
      });
    });
  }

  // ABA 5: Camadas no Palco (Mobile)
  renderLayersTab(): void {
    if (this.sheetTitle) this.sheetTitle.textContent = 'Camadas no Cenário';
    if (this.categoriesBar) this.categoriesBar.style.display = 'none';
    if (!this.paneLayers) return;

    const elements = this.canvasEngine.getSceneElements();
    if (!elements || elements.length === 0) {
      this.paneLayers.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--text-muted); font-size: 0.82rem;">
          <div style="margin-bottom: 8px; color: var(--text-muted); opacity: 0.6;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <div>Nenhuma peça no cenário ainda.</div>
          <div style="font-size: 0.72rem; margin-top: 4px;">Adicione peças da aba Elementos ou Meu Acervo!</div>
        </div>
      `;
      return;
    }

    const reversed = [...elements].reverse();
    const container = document.createElement('div');
    container.className = 'layers-mobile-container';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';

    reversed.forEach((elem) => {
      const row = document.createElement('div');
      row.className = 'layer-row-item';
      row.dataset.instanceId = elem.instanceId;

      const isSelected = (this.canvasEngine.selectedNode as any)?.getAttr('itemMeta')?.instanceId === elem.instanceId;
      if (isSelected) {
        row.classList.add('selected');
      }

      row.innerHTML = `
        <div class="layer-drag-handle" title="Arraste para reordenar a camada">${CANVA_LAYER_ICONS.grip}</div>
        <img class="layer-thumb" src="${elem.previewUrl}" alt="" loading="lazy" decoding="async"/>
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
        const targetNode = this.canvasEngine.decorLayer.getChildren().find(
          (c) => c.getAttr('itemMeta')?.instanceId === elem.instanceId
        );
        if (targetNode) {
          this.canvasEngine.selectNode(targetNode);
          this.renderLayersTab();
        }
      });

      row.querySelector('.layer-btn-to-front')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.canvasEngine.decorLayer.getChildren().find(
          (c) => c.getAttr('itemMeta')?.instanceId === elem.instanceId
        );
        if (targetNode) {
          this.canvasEngine.bringToFront(targetNode as any);
          this.renderLayersTab();
        }
      });

      row.querySelector('.layer-btn-front')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.canvasEngine.decorLayer.getChildren().find(
          (c) => c.getAttr('itemMeta')?.instanceId === elem.instanceId
        );
        if (targetNode) {
          this.canvasEngine.bringForward(targetNode as any);
          this.renderLayersTab();
        }
      });

      row.querySelector('.layer-btn-back')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.canvasEngine.decorLayer.getChildren().find(
          (c) => c.getAttr('itemMeta')?.instanceId === elem.instanceId
        );
        if (targetNode) {
          this.canvasEngine.sendBackward(targetNode as any);
          this.renderLayersTab();
        }
      });

      row.querySelector('.layer-btn-to-back')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.canvasEngine.decorLayer.getChildren().find(
          (c) => c.getAttr('itemMeta')?.instanceId === elem.instanceId
        );
        if (targetNode) {
          this.canvasEngine.sendToBack(targetNode as any);
          this.renderLayersTab();
        }
      });

      container.appendChild(row);
    });

    this.paneLayers.replaceChildren(container);

    setupLayersDragAndDrop(container, (newOrder) => {
      this.canvasEngine.reorderLayers(newOrder);
      this.renderLayersTab();
    });
  }

  syncLayerSelection(selectedId?: string | null): void {
    if (!this.paneLayers) return;
    this.paneLayers.querySelectorAll('.layer-row-item').forEach((r) => {
      const itemEl = r as HTMLElement;
      itemEl.classList.toggle('selected', Boolean(selectedId && itemEl.dataset.instanceId === selectedId));
    });
  }
}
