import { getAllItems, getItemsByCategory, getAllCovers } from '../core/db.js';
import {
  REALISTIC_ENVIRONMENTS,
  TEXTURE_WALL_BOISERIE,
  TEXTURE_WALL_BRICK,
  TEXTURE_WALL_FAIRY_LIGHTS,
  TEXTURE_WALL_WOOD_SLATS,
  TEXTURE_WALL_CONCRETE,
  TEXTURE_WALL_CLEAN,
  TEXTURE_FLOOR_WOOD,
  TEXTURE_FLOOR_MARBLE,
  TEXTURE_FLOOR_GRASS,
  TEXTURE_FLOOR_CONCRETE
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
    this.btnCloseSheet = document.getElementById('btn-close-sheet');
    this.sheetHandle = document.getElementById('sheet-handle-bar');

    this.setupEvents();
  }

  setupEvents() {
    // Botões das abas da barra fixa inferior
    const dockButtons = document.querySelectorAll('.dock-tab-btn');
    dockButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (this.activeTab === tab && this.sheetEl.classList.contains('open')) {
          this.closeSheet();
        } else {
          this.openTab(tab);
        }
      });
    });

    this.btnCloseSheet?.addEventListener('click', () => this.closeSheet());
    this.sheetHandle?.addEventListener('click', () => this.closeSheet());
  }

  openTab(tabName) {
    this.activeTab = tabName;

    document.querySelectorAll('.dock-tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });

    this.sheetEl.classList.add('open');

    if (tabName === 'presets') {
      this.renderPresetsTab();
    } else if (tabName === 'my-items') {
      this.renderMyItemsTab();
    } else if (tabName === 'covers') {
      this.renderCoversTab();
    } else if (tabName === 'environment') {
      this.renderEnvironmentTab();
    }
  }

  closeSheet() {
    this.activeTab = null;
    this.sheetEl.classList.remove('open');
    document.querySelectorAll('.dock-tab-btn').forEach((b) => b.classList.remove('active'));
  }

  // ABA 1: Presets Base de Fábrica
  async renderPresetsTab() {
    this.sheetTitle.innerHTML = '✨ Peças Base (Presets)';
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
      { id: 'mesas', label: 'Mesas & Móveis' },
      { id: 'baloes', label: 'Balões' },
      { id: 'displays', label: 'Displays' },
      { id: 'acessorios', label: 'Peças & Mesa' }
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
      <div style="display: flex; gap: 10px; margin-bottom: 14px;">
        <button id="btn-add-inventory-item" class="btn-primary" style="flex: 1; height: 44px;">
          ➕ Cadastrar Nova Peça
        </button>
      </div>
    `;

    if (customItems.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">📸</div>
          <div class="empty-state-text">Você ainda não tem peças cadastradas no seu acervo. Toque no botão acima para fotografar suas peças reais!</div>
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
    this.sheetTitle.innerHTML = '🎨 Temas & Capas';
    this.categoriesBar.style.display = 'none';

    const covers = await getAllCovers();

    this.sheetBody.innerHTML = `
      <div style="display: flex; gap: 10px; margin-bottom: 14px;">
        <button id="btn-add-new-cover" class="btn-primary" style="flex: 1; height: 44px;">
          ➕ Adicionar Nova Estampa
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
          alert('Selecione primeiro um cilindro ou painel no cenário para vestir esta capa.');
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

  // ABA 4: Ambientes Realistas 4:3 (Paredes e Pisos)
  renderEnvironmentTab() {
    this.sheetTitle.innerHTML = '🏠 Fundos & Pisos Realistas (4:3)';
    this.categoriesBar.style.display = 'none';

    const walls = [
      { name: 'Boiserie Clássica', texture: TEXTURE_WALL_BOISERIE },
      { name: 'Tijolinho Branco', texture: TEXTURE_WALL_BRICK },
      { name: 'Cortina Luzinhas', texture: TEXTURE_WALL_FAIRY_LIGHTS },
      { name: 'Painel Ripado', texture: TEXTURE_WALL_WOOD_SLATS },
      { name: 'Cimento Queimado', texture: TEXTURE_WALL_CONCRETE },
      { name: 'Estúdio Clean', texture: TEXTURE_WALL_CLEAN }
    ];

    const floors = [
      { name: 'Madeira Carvalho', texture: TEXTURE_FLOOR_WOOD },
      { name: 'Mármore Carrara', texture: TEXTURE_FLOOR_MARBLE },
      { name: 'Grama / Jardim', texture: TEXTURE_FLOOR_GRASS },
      { name: 'Cimento Polido', texture: TEXTURE_FLOOR_CONCRETE }
    ];

    let html = `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <!-- Cenários Prontos -->
        <div>
          <div class="form-label" style="margin-bottom: 8px;">Cenários Completos Prontos</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            ${REALISTIC_ENVIRONMENTS.map(env => `
              <button class="btn-secondary btn-preset-env" data-wall="${env.wallTexture}" data-floor="${env.floorTexture}" style="height: 48px; text-align: left; padding: 6px 10px; font-size: 0.76rem; border-left: 4px solid var(--primary); display: flex; flex-direction: column; justify-content: center;">
                <span style="font-weight: 700; color: #fff;">${env.name}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">${env.category}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Parede Individual -->
        <div>
          <div class="form-label" style="margin-bottom: 8px;">Trocar Parede de Fundo</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            ${walls.map(w => `
              <button class="btn-secondary btn-custom-wall" data-wall="${w.texture}" style="height: 38px; font-size: 0.72rem; padding: 0 4px; text-align: center;">
                ${w.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Piso Individual -->
        <div>
          <div class="form-label" style="margin-bottom: 8px;">Trocar Piso (Perspectiva 2.5D)</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            ${floors.map(f => `
              <button class="btn-secondary btn-custom-floor" data-floor="${f.texture}" style="height: 38px; font-size: 0.74rem;">
                ${f.name}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.sheetBody.innerHTML = html;

    // Listeners
    this.sheetBody.querySelectorAll('.btn-preset-env').forEach((b) => {
      b.addEventListener('click', async () => {
        await this.canvasEngine.setEnvironmentTextures(b.dataset.wall, b.dataset.floor);
      });
    });

    this.sheetBody.querySelectorAll('.btn-custom-wall').forEach((b) => {
      b.addEventListener('click', async () => {
        await this.canvasEngine.setEnvironmentTextures(b.dataset.wall, null);
      });
    });

    this.sheetBody.querySelectorAll('.btn-custom-floor').forEach((b) => {
      b.addEventListener('click', async () => {
        await this.canvasEngine.setEnvironmentTextures(null, b.dataset.floor);
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
          <div class="empty-state-text">Nenhum item encontrado nesta categoria.</div>
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
      ${isCustom ? `<div class="item-card-badge">Estoque: ${item.stockQuantity}</div>` : ''}
    `;

    card.addEventListener('click', async () => {
      await this.canvasEngine.addItem(item);
      this.closeSheet();
    });

    return card;
  }
}
