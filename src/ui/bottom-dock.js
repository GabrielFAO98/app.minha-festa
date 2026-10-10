import { getAllItems, getItemsByCategory, getAllCovers } from '../core/db.js';
import {
  REALISTIC_ENVIRONMENTS,
  WALL_OPTIONS,
  FLOOR_OPTIONS
} from '../core/textures-data.js';

export class BottomDock {
  constructor(canvasEngine, onOpenInventoryModal, onOpenCoverModal) {
    this.canvasEngine = canvasEngine;
    this.onOpenInventoryModal = onOpenInventoryModal;
    this.onOpenCoverModal = onOpenCoverModal;

    this.activeTab = null;
    this.currentCategory = 'todos';

    this.sheetEl = document.getElementById('bottom-sheet');
    this.sheetBody = document.getElementById('sheet-body-content');
    this.sheetTitle = document.getElementById('sheet-current-title');
    this.categoriesBar = document.getElementById('sheet-categories-bar');
    this.btnClose = document.getElementById('btn-close-sheet');
    this.handleBar = document.getElementById('sheet-handle-bar');

    this.setupEvents();
  }

  setupEvents() {
    const dockButtons = document.querySelectorAll('.dock-tab-btn');
    dockButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (this.activeTab === tab && this.sheetEl?.classList.contains('open')) {
          this.closeSheet();
        } else {
          this.openTab(tab);
        }
      });
    });

    this.btnClose?.addEventListener('click', () => this.closeSheet());
    this.handleBar?.addEventListener('click', () => this.closeSheet());
  }

  openTab(tabName) {
    this.activeTab = tabName;

    document.querySelectorAll('.dock-tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });

    this.sheetEl?.classList.add('open');

    if (tabName === 'presets') {
      this.renderPresetsTab();
    } else if (tabName === 'my-items') {
      this.renderMyItemsTab();
    } else if (tabName === 'covers') {
      this.renderCoversTab();
    } else if (tabName === 'environment') {
      this.renderEnvironmentTab();
    } else if (tabName === 'layers') {
      this.renderLayersTab();
    }
  }

  closeSheet() {
    this.activeTab = null;
    this.sheetEl?.classList.remove('open');
    document.querySelectorAll('.dock-tab-btn').forEach((b) => b.classList.remove('active'));
  }

  // ABA 1: Presets Base de Fábrica
  async renderPresetsTab() {
    this.sheetTitle.innerHTML = '✨ Peças Base para Adicionar';
    this.categoriesBar.style.display = 'flex';
    this.renderCategoryPills();

    const items = await getItemsByCategory(this.currentCategory);
    const presetItems = items.filter((i) => !i.isCustom);

    this.renderItemsGrid(presetItems, false);
  }

  renderCategoryPills() {
    const categories = [
      { id: 'todos', label: 'Todos' },
      { id: 'paineis', label: 'Painéis' },
      { id: 'cilindros', label: 'Cilindros' },
      { id: 'mesas', label: 'Mesas' },
      { id: 'baloes', label: 'Balões' },
      { id: 'tapetes', label: 'Tapetes' },
      { id: 'displays', label: 'Displays' },
      { id: 'acessorios', label: 'Acessórios' }
    ];

    this.categoriesBar.innerHTML = '';
    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = `pill-btn ${this.currentCategory === cat.id ? 'active' : ''}`;
      btn.textContent = cat.label;
      btn.addEventListener('click', async () => {
        this.currentCategory = cat.id;
        this.renderPresetsTab();
      });
      this.categoriesBar.appendChild(btn);
    });
  }

  // ABA 2: Meu Acervo Pessoal
  async renderMyItemsTab() {
    this.sheetTitle.innerHTML = '📦 Meu Acervo Próprio';
    this.categoriesBar.style.display = 'none';

    const all = await getAllItems();
    const customItems = all.filter((i) => i.isCustom);

    let html = `
      <div style="margin-bottom: 12px;">
        <button id="btn-add-inventory-item" class="btn-primary" style="width: 100%; height: 42px;">
          ➕ Cadastrar Nova Peça com Foto
        </button>
      </div>
    `;

    if (customItems.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">📸</div>
          <div class="empty-state-text">Você ainda não tem peças cadastradas. Toque no botão acima para fotografar suas peças reais!</div>
        </div>
      `;
      this.sheetBody.innerHTML = html;
    } else {
      this.sheetBody.innerHTML = html + '<div class="items-grid" id="custom-items-grid"></div>';
      const grid = document.getElementById('custom-items-grid');
      customItems.forEach((item) => {
        const card = this.createItemCard(item, true);
        grid.appendChild(card);
      });
    }

    document.getElementById('btn-add-inventory-item')?.addEventListener('click', () => {
      if (this.onOpenInventoryModal) {
        this.onOpenInventoryModal();
      }
    });
  }

  // ABA 3: Catálogo de Capas & Estampas
  async renderCoversTab() {
    this.sheetTitle.innerHTML = '🎨 Temas & Capas Disponíveis';
    this.categoriesBar.style.display = 'none';

    const covers = await getAllCovers();

    this.sheetBody.innerHTML = `
      <div style="margin-bottom: 12px;">
        <button id="btn-add-new-cover" class="btn-primary" style="width: 100%; height: 42px;">
          📸 Subir Estampa da Galeria
        </button>
      </div>
      <div class="covers-grid" id="sheet-covers-grid"></div>
    `;

    const grid = document.getElementById('sheet-covers-grid');
    covers.forEach((cover) => {
      const card = document.createElement('div');
      card.className = 'cover-card';
      card.innerHTML = `
        <img src="${cover.imageUrl}" alt="${cover.name}" loading="lazy"/>
        <div class="cover-card-label">${cover.name}</div>
      `;
      card.addEventListener('click', async () => {
        if (this.canvasEngine.selectedNode) {
          await this.canvasEngine.applyCoverToSelected(cover.imageUrl);
          this.closeSheet();
        } else {
          alert('Toque primeiro em um cilindro ou painel no cenário para vestir esta capa.');
        }
      });
      grid.appendChild(card);
    });

    document.getElementById('btn-add-new-cover')?.addEventListener('click', () => {
      if (this.onOpenCoverModal) {
        this.onOpenCoverModal(null);
      }
    });
  }

  // ABA 4: Cenários Realistas COM ESCOLHA POR IMAGEM
  renderEnvironmentTab() {
    this.sheetTitle.innerHTML = '🏠 Escolha do Cenário (Por Imagem)';
    this.categoriesBar.style.display = 'none';

    let html = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <div class="form-label" style="margin-bottom: 8px;">Cenários Completos (Toque na Imagem)</div>
          <div class="scene-visual-grid">
            ${REALISTIC_ENVIRONMENTS.map(env => `
              <div class="scene-visual-card btn-preset-env" data-wall="${env.wallTexture}" data-floor="${env.floorTexture}">
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
        await this.canvasEngine.setEnvironmentTextures(card.dataset.wall, card.dataset.floor);
      });
    });

    this.sheetBody.querySelectorAll('.btn-custom-wall').forEach((card) => {
      card.addEventListener('click', async () => {
        await this.canvasEngine.setEnvironmentTextures(card.dataset.wall, null);
      });
    });

    this.sheetBody.querySelectorAll('.btn-custom-floor').forEach((card) => {
      card.addEventListener('click', async () => {
        await this.canvasEngine.setEnvironmentTextures(null, card.dataset.floor);
      });
    });
  }

  renderItemsGrid(items, isCustom) {
    this.sheetBody.innerHTML = '<div class="items-grid" id="sheet-items-grid"></div>';
    const grid = document.getElementById('sheet-items-grid');

    if (items.length === 0) {
      this.sheetBody.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">Nenhum item nesta categoria.</div>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const card = this.createItemCard(item, isCustom);
      grid.appendChild(card);
    });
  }

  createItemCard(item, isCustom) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-preview">
        <img src="${item.previewUrl}" alt="${item.name}" loading="lazy"/>
      </div>
      <div class="item-card-title">${item.name}</div>
      <div class="item-card-dimensions">${item.widthCm} x ${item.heightCm} cm</div>
      ${isCustom ? `<div class="item-card-badge">Qtd: ${item.stockQuantity}</div>` : ''}
    `;

    card.addEventListener('click', async () => {
      await this.canvasEngine.addItem(item);
    });

    return card;
  }

  // ABA 5: Camadas no Palco (Mobile)
  renderLayersTab() {
    this.sheetTitle.innerHTML = '📑 Camadas no Cenário';
    this.categoriesBar.style.display = 'none';

    const elements = this.canvasEngine.getSceneElements();
    if (!elements || elements.length === 0) {
      this.sheetBody.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--text-muted); font-size: 0.82rem;">
          <div style="font-size: 2rem; margin-bottom: 8px;">🎯</div>
          <div>Nenhuma peça no cenário ainda.</div>
          <div style="font-size: 0.72rem; margin-top: 4px;">Adicione peças da aba Presets ou Meu Acervo!</div>
        </div>
      `;
      return;
    }

    const reversed = [...elements].reverse();
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';

    reversed.forEach((elem) => {
      const row = document.createElement('div');
      row.className = 'layer-row-item';
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '10px';
      row.style.padding = '8px 12px';
      row.style.background = 'rgba(255, 255, 255, 0.04)';
      row.style.border = '1px solid var(--border-subtle)';
      row.style.borderRadius = 'var(--radius-md)';
      row.style.cursor = 'pointer';

      const isSelected = this.canvasEngine.selectedNode?.getAttr('itemMeta')?.instanceId === elem.instanceId;
      if (isSelected) {
        row.style.borderColor = 'var(--primary)';
        row.style.background = 'rgba(236, 72, 153, 0.15)';
      }

      row.innerHTML = `
        <img src="${elem.previewUrl}" style="width: 38px; height: 38px; object-fit: contain; background: rgba(0,0,0,0.3); border-radius: 6px; padding: 2px;" alt="" />
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${elem.name}</div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">${elem.widthCm}x${elem.heightCm}cm</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="layer-action-btn layer-btn-front" style="width: 34px; height: 34px; border-radius: 6px; background: rgba(255,255,255,0.08); font-size: 0.85rem;" title="Trazer para Frente">⬆️</button>
          <button class="layer-action-btn layer-btn-back" style="width: 34px; height: 34px; border-radius: 6px; background: rgba(255,255,255,0.08); font-size: 0.85rem;" title="Enviar para Trás">⬇️</button>
        </div>
      `;

      row.addEventListener('click', (e) => {
        if (e.target.closest('.layer-action-btn')) return;
        const targetNode = this.canvasEngine.decorLayer.getChildren().find(
          (c) => c.getAttr('itemMeta')?.instanceId === elem.instanceId
        );
        if (targetNode) {
          this.canvasEngine.selectNode(targetNode);
          this.closeSheet();
        }
      });

      row.querySelector('.layer-btn-front')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.canvasEngine.decorLayer.getChildren().find(
          (c) => c.getAttr('itemMeta')?.instanceId === elem.instanceId
        );
        if (targetNode) {
          this.canvasEngine.selectNode(targetNode);
          this.canvasEngine.bringForward();
          this.renderLayersTab();
        }
      });

      row.querySelector('.layer-btn-back')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetNode = this.canvasEngine.decorLayer.getChildren().find(
          (c) => c.getAttr('itemMeta')?.instanceId === elem.instanceId
        );
        if (targetNode) {
          this.canvasEngine.selectNode(targetNode);
          this.canvasEngine.sendBackward();
          this.renderLayersTab();
        }
      });

      container.appendChild(row);
    });

    this.sheetBody.innerHTML = '';
    this.sheetBody.appendChild(container);
  }
}
