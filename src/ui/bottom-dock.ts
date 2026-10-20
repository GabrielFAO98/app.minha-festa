import { getItemsByCategory, getAllItems, getAllCovers } from '../core/db';
import { getItemCustomizationMode } from '../core/modular-svg-generator';
import { REALISTIC_ENVIRONMENTS, WALL_OPTIONS, FLOOR_OPTIONS } from '../core/textures-data';
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
  }

  async openTab(tabName: string): Promise<void> {
    this.activeTab = tabName;

    this.tabButtons.forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === tabName);
    });

    // Oculta a barra flutuante de ações da peça para não competir com o menu da gaveta
    const floatingToolbar = document.getElementById('item-actions-floating');
    if (floatingToolbar) {
      floatingToolbar.classList.remove('active');
    }

    this.sheetEl?.classList.add('open');

    if (tabName === 'presets') {
      await this.renderPresetsTab();
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

  // ABA 1: Peças Base (Elementos)
  async renderPresetsTab(): Promise<void> {
    if (this.sheetTitle) this.sheetTitle.textContent = 'Elementos';
    if (this.categoriesBar) this.categoriesBar.style.display = 'flex';
    this.renderCategoryPills('presets');

    const items = await getItemsByCategory(this.currentCategory);
    const presetItems = items.filter((i) => !i.isCustom);
    this.renderPresetsGrid(presetItems);
  }

  renderCategoryPills(tab: 'presets' | 'my-items'): void {
    if (!this.categoriesBar) return;
    const categories: { id: ItemCategory | string; label: string }[] = [
      { id: 'todos', label: 'Todos' },
      { id: 'paineis', label: 'Painéis' },
      { id: 'cilindros', label: 'Cilindros' },
      { id: 'mesas', label: 'Mesas' },
      { id: 'tapetes', label: 'Tapetes' },
      { id: 'displays', label: 'Displays' },
      { id: 'acessorios', label: 'Acessórios' }
    ];

    const currentSelected = tab === 'presets' ? this.currentCategory : this.myItemsCategory;

    this.categoriesBar.innerHTML = '';
    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pill-btn ${currentSelected === cat.id ? 'active' : ''}`;
      btn.textContent = cat.label;
      btn.addEventListener('click', async () => {
        if (tab === 'presets') {
          this.currentCategory = cat.id;
          await this.renderPresetsTab();
        } else {
          this.myItemsCategory = cat.id;
          await this.renderMyItemsTab();
        }
      });
      this.categoriesBar?.appendChild(btn);
    });
  }

  renderPresetsGrid(items: PresetItem[]): void {
    if (!this.sheetBody) return;
    this.sheetBody.innerHTML = '<div class="items-grid" id="sheet-items-grid"></div>';
    const grid = document.getElementById('sheet-items-grid');

    if (items.length === 0) {
      this.sheetBody.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div class="empty-state-title">Nenhum item nesta categoria</div>
          <div class="empty-state-text">Tente selecionar outra categoria ou buscar na aba "Todos".</div>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'element-card';
      card.title = item.name;
      card.innerHTML = `
        <img src="${item.previewUrl}" alt="${item.name}" loading="lazy"/>
        <div class="element-card-overlay">${item.name}</div>
      `;

      card.addEventListener('click', async () => {
        await this.canvasEngine.addItem(item);
        this.closeSheet();
      });

      grid?.appendChild(card);
    });
  }

  // ABA 2: Meu Acervo Pessoal
  async renderMyItemsTab(): Promise<void> {
    if (this.sheetTitle) this.sheetTitle.textContent = 'Meu Acervo';
    if (this.categoriesBar) this.categoriesBar.style.display = 'flex';
    this.renderCategoryPills('my-items');

    const all = await getAllItems();
    let customItems = all.filter((i) => i.isCustom);

    if (this.myItemsCategory !== 'todos') {
      customItems = customItems.filter((i) => i.category === this.myItemsCategory);
    }

    let html = `
      <div style="margin-bottom: 12px;">
        <button id="btn-add-inventory-item" class="btn-primary" style="width: 100%; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Cadastrar Nova Peça com Foto
        </button>
      </div>
    `;

    if (!this.sheetBody) return;

    if (customItems.length === 0) {
      html += `
        <div class="empty-state my-items-empty">
          <div class="empty-state-icon-badge">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div class="empty-state-title">
            ${this.myItemsCategory === 'todos' ? 'Seu acervo ainda está vazio' : 'Nenhuma peça nesta categoria'}
          </div>
          <div class="empty-state-text">
            ${this.myItemsCategory === 'todos'
              ? 'Fotografe suas peças reais de decoração para compor cenários exclusivos e orçamentos automáticos!'
              : 'Nenhuma peça cadastrada nesta categoria. Toque no botão acima para adicionar!'}
          </div>
          ${this.myItemsCategory === 'todos' ? `
            <div class="empty-state-features">
              <div class="empty-feature-item">
                <span class="empty-feature-icon">✨</span>
                <span>Remoção inteligente de fundo</span>
              </div>
              <div class="empty-feature-item">
                <span class="empty-feature-icon">📐</span>
                <span>Dimensões e proporções reais em cm</span>
              </div>
              <div class="empty-feature-item">
                <span class="empty-feature-icon">🎨</span>
                <span>Compatível com tecidos e estampas</span>
              </div>
            </div>
          ` : ''}
        </div>
      `;
      this.sheetBody.innerHTML = html;
    } else {
      this.sheetBody.innerHTML = html + '<div class="items-grid" id="custom-items-grid"></div>';
      const grid = document.getElementById('custom-items-grid');
      if (grid) {
        customItems.forEach((item) => {
          const card = this.createMyItemCard(item);
          grid.appendChild(card);
        });
      }
    }

    document.getElementById('btn-add-inventory-item')?.addEventListener('click', () => {
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
        <img src="${item.previewUrl}" alt="${item.name}" loading="lazy"/>
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

  // ABA 3: Catálogo de Capas e Estampas
  async renderCoversTab(): Promise<void> {
    if (this.sheetTitle) this.sheetTitle.textContent = 'Temas e Capas Disponíveis';
    if (this.categoriesBar) this.categoriesBar.style.display = 'none';

    const allCovers = await getAllCovers();
    const customCovers = allCovers.filter((c) => c.isCustom).reverse();
    const factoryCovers = allCovers.filter((c) => !c.isCustom);

    if (!this.sheetBody) return;

    this.sheetBody.innerHTML = `
      <div style="margin-bottom: 12px;">
        <button id="btn-add-new-cover" class="btn-primary" style="width: 100%; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Subir nova estampa
        </button>
      </div>
      ${customCovers.length > 0 ? `
        <div class="covers-section-heading" style="margin-top: 10px; margin-bottom: 8px;">
          <span>Estampas e minhas imagens</span>
          <span class="covers-count-badge">${customCovers.length}</span>
        </div>
        <div class="covers-grid" id="sheet-my-covers-grid" style="margin-bottom: 16px;"></div>
      ` : ''}
      <div class="covers-section-heading" style="margin-top: 10px; margin-bottom: 8px;">
        <span>Capas do Catálogo Padrão</span>
      </div>
      <div class="covers-grid" id="sheet-factory-covers-grid"></div>
    `;

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
      const myGrid = document.getElementById('sheet-my-covers-grid');
      customCovers.forEach((cover) => {
        const card = document.createElement('div');
        card.className = 'cover-card';
        card.innerHTML = `
          <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy"/>
          <div class="cover-card-label">${cover.name}</div>
        `;
        attachCoverClick(card, cover.imageUrl);
        myGrid?.appendChild(card);
      });
    }

    const factoryGrid = document.getElementById('sheet-factory-covers-grid');
    factoryCovers.forEach((cover) => {
      const card = document.createElement('div');
      card.className = 'cover-card';
      card.innerHTML = `
        <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy"/>
        <div class="cover-card-label">${cover.name}</div>
      `;
      attachCoverClick(card, cover.imageUrl);
      factoryGrid?.appendChild(card);
    });

    document.getElementById('btn-add-new-cover')?.addEventListener('click', () => {
      if (this.onOpenCoverModal) {
        const meta = this.canvasEngine.selectedNode?.getAttr('itemMeta') || null;
        this.onOpenCoverModal(meta);
      }
    });
  }

  // ABA 4: Cenários Realistas COM ESCOLHA POR IMAGEM
  renderEnvironmentTab(): void {
    if (this.sheetTitle) this.sheetTitle.textContent = 'Escolha do Cenário';
    if (this.categoriesBar) this.categoriesBar.style.display = 'none';
    if (!this.sheetBody) return;

    let html = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <div class="form-label" style="margin-bottom: 8px;">Cenários Fotográficos & Ambientes (Toque na Imagem)</div>
          <div class="scene-visual-grid">
            ${REALISTIC_ENVIRONMENTS.map(env => `
              <div class="scene-visual-card btn-preset-env" data-bg="${env.bgImageUrl || ''}" data-wall="${env.wallTexture || ''}" data-floor="${env.floorTexture || ''}">
                <img src="${env.previewThumb}" alt="${env.name}"/>
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
                <img src="${w.texture}" alt="${w.name}"/>
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
                <img src="${f.texture}" alt="${f.name}"/>
                <div class="scene-visual-overlay">${f.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.sheetBody.innerHTML = html;

    this.sheetBody.querySelectorAll('.btn-preset-env').forEach((card) => {
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

    this.sheetBody.querySelectorAll('.btn-custom-wall').forEach((card) => {
      card.addEventListener('click', async () => {
        const wall = (card as HTMLElement).dataset.wall || null;
        await this.canvasEngine.setEnvironmentTextures(wall, null);
      });
    });

    this.sheetBody.querySelectorAll('.btn-custom-floor').forEach((card) => {
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
    if (!this.sheetBody) return;

    const elements = this.canvasEngine.getSceneElements();
    if (!elements || elements.length === 0) {
      this.sheetBody.innerHTML = `
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

    this.sheetBody.innerHTML = '';
    this.sheetBody.appendChild(container);

    setupLayersDragAndDrop(container, (newOrder) => {
      this.canvasEngine.reorderLayers(newOrder);
      this.renderLayersTab();
    });
  }
}
