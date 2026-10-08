import { getAllItems, getItemsByCategory, getAllCovers } from '../core/db.js';

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

    // Atualiza botões ativos no dock
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
          <div class="empty-state-text">Você ainda não tem peças personalizadas cadastradas no seu acervo. Toque no botão acima para fotografar ou cadastrar suas peças reais!</div>
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
        // Se houver item selecionado, aplica direto
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

  // ABA 4: Cenário (Parede e Piso)
  renderEnvironmentTab() {
    this.sheetTitle.innerHTML = '🏠 Ajustes do Cenário';
    this.categoriesBar.style.display = 'none';

    const wallColors = [
      { name: 'Cinza Estúdio', hex: '#1e293b' },
      { name: 'Rosa Suave', hex: '#4c1d3d' },
      { name: 'Azul Bebê Noite', hex: '#1e3a5f' },
      { name: 'Bege Areia', hex: '#453229' },
      { name: 'Verde Eucalipto', hex: '#14382c' },
      { name: 'Branco Puro', hex: '#334155' }
    ];

    const floorColors = [
      { name: 'Piso Escuro', hex: '#0f172a' },
      { name: 'Madeira Pinus', hex: '#78350f' },
      { name: 'Madeira Rústica', hex: '#451a03' },
      { name: 'Grama / Jardim', hex: '#14532d' },
      { name: 'Porcelanato Cinza', hex: '#1f2937' }
    ];

    let html = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <div class="form-label" style="margin-bottom: 8px;">Cor da Parede de Fundo</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            ${wallColors.map(c => `
              <button class="btn-secondary btn-wall-color" data-color="${c.hex}" style="height: 38px; font-size: 0.75rem; border-left: 6px solid ${c.hex};">
                ${c.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="form-label" style="margin-bottom: 8px;">Tipo / Cor do Piso</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            ${floorColors.map(f => `
              <button class="btn-secondary btn-floor-color" data-color="${f.hex}" style="height: 38px; font-size: 0.75rem; border-left: 6px solid ${f.hex};">
                ${f.name}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.sheetBody.innerHTML = html;

    // Eventos de clique nas cores
    this.sheetBody.querySelectorAll('.btn-wall-color').forEach((b) => {
      b.addEventListener('click', () => {
        this.canvasEngine.setEnvironment(b.dataset.color, this.canvasEngine.environment.floorColor);
      });
    });

    this.sheetBody.querySelectorAll('.btn-floor-color').forEach((b) => {
      b.addEventListener('click', () => {
        this.canvasEngine.setEnvironment(this.canvasEngine.environment.wallColor, b.dataset.color);
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
      // Adiciona o item no palco do canvas
      await this.canvasEngine.addItem(item);
      this.closeSheet();
    });

    return card;
  }
}
