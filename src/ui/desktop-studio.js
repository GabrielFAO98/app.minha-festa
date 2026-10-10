// Modo Desktop Studio  Painis Laterais de Catlogo, Inspetor e Camadas
import { getItemsByCategory, getAllItems, getAllCovers } from '../core/db.js';
import { REALISTIC_ENVIRONMENTS } from '../core/textures-data.js';

export class DesktopStudio {
  constructor(canvasEngine, onOpenInventoryModal, onOpenCoverModal, onOpenBalloonModal) {
    this.canvasEngine = canvasEngine;
    this.onOpenInventoryModal = onOpenInventoryModal;
    this.onOpenCoverModal = onOpenCoverModal;
    this.onOpenBalloonModal = onOpenBalloonModal;

    this.activeCatalogTab = 'presets';
    this.currentPresetCategory = 'todos';

    this.setupUI();
  }

  setupUI() {
    this.initCatalogTabs();
    this.renderCatalogContent();
    this.initInspectorListeners();
    this.updateInspector(null, null);
    this.renderLayersList([]);

    // Sincroniza seleo e camadas no painel desktop
    this.canvasEngine.onLayersChange = (elements) => {
      this.renderLayersList(elements);
    };
  }

  initCatalogTabs() {
    const tabButtons = document.querySelectorAll('.desktop-tab-btn');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.activeCatalogTab = tab;
        tabButtons.forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
        this.renderCatalogContent();
      });
    });
  }

  async renderCatalogContent() {
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
  async renderPresets(container) {
    // Categorias de Presets
    const catBar = document.createElement('div');
    catBar.className = 'desktop-category-pills';

    const categories = [
      { id: 'todos', label: 'Todos' },
      { id: 'paineis', label: 'Painis' },
      { id: 'cilindros', label: 'Cilindros' },
      { id: 'mesas', label: 'Mesas' },
      { id: 'baloes', label: 'Bales' },
      { id: 'displays', label: 'Displays' },
      { id: 'acessorios', label: 'Acessrios' }
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
  async renderMyItems(container) {
    const addHeader = document.createElement('div');
    addHeader.style.padding = '8px 12px';
    addHeader.innerHTML = `
      <button class="btn-primary" style="width: 100%; font-size: 0.82rem;" id="btn-desktop-add-inventory">
        ➕ Cadastrar Nova Pea no Acervo
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
        <div>Nenhuma pea cadastrada ainda.</div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Tire fotos das suas mesas e painis prprios!</div>
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
  async renderCovers(container) {
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
        if (this.canvasEngine.selectedNode) {
          await this.canvasEngine.applyCoverToSelected(cover.imageUrl);
        } else {
          alert('Selecione primeiro um cilindro ou painel no centro para vestir a capa.');
        }
      });
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // ABA 4: Cenrios
  async renderEnvironments(container) {
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
        await this.canvasEngine.setEnvironmentTextures(env.wallTexture, env.floorTexture);
      });
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // INSPETOR DA PEA SELECIONADA
  initInspectorListeners() {
    const btnDel = document.getElementById('btn-desktop-delete');
    const btnCover = document.getElementById('btn-desktop-cover');
    const btnDup = document.getElementById('btn-desktop-duplicate');
    const btnFlip = document.getElementById('btn-desktop-flip');
    const btnFront = document.getElementById('btn-desktop-front');
    const btnBack = document.getElementById('btn-desktop-back');

    btnDel?.addEventListener('click', () => this.canvasEngine.deleteSelected());
    btnDup?.addEventListener('click', () => this.canvasEngine.duplicateSelected());
    btnFlip?.addEventListener('click', () => this.canvasEngine.flipHorizontal());
    btnFront?.addEventListener('click', () => this.canvasEngine.bringForward());
    btnBack?.addEventListener('click', () => this.canvasEngine.sendBackward());

    btnCover?.addEventListener('click', () => {
      const node = this.canvasEngine.selectedNode;
      if (!node) return;
      const meta = node.getAttr('itemMeta') || {};

      if (meta.category === 'baloes' || meta.type === 'balloon_arch') {
        this.onOpenBalloonModal(node);
      } else {
        this.onOpenCoverModal(meta);
      }
    });
  }

  updateInspector(meta, node) {
    const box = document.getElementById('desktop-inspector-box');
    const emptyBox = document.getElementById('desktop-inspector-empty');
    const titleEl = document.getElementById('desktop-inspector-title');
    const sizeEl = document.getElementById('desktop-inspector-size');
    const thumbEl = document.getElementById('desktop-inspector-thumb');
    const btnCover = document.getElementById('btn-desktop-cover');

    if (!node || !meta) {
      if (box) box.style.display = 'none';
      if (emptyBox) emptyBox.style.display = 'flex';
      return;
    }

    if (box) box.style.display = 'flex';
    if (emptyBox) emptyBox.style.display = 'none';

    if (titleEl) titleEl.textContent = meta.name;
    if (sizeEl) sizeEl.textContent = `${meta.widthCm}cm de largura  ${meta.heightCm}cm de altura`;
    if (thumbEl) thumbEl.src = meta.previewUrl;

    if (btnCover) {
      const isBalloons = meta.category === 'baloes' || meta.type === 'balloon_arch';
      btnCover.textContent = isBalloons ? ' Cores dos Bales' : ' Vestir Capa';
    }
  }

  // LISTA DE CAMADAS (LAYERS)
  renderLayersList(elements) {
    const listEl = document.getElementById('desktop-layers-list');
    const badgeEl = document.getElementById('desktop-layers-count');
    if (!listEl) return;

    listEl.innerHTML = '';
    if (badgeEl) badgeEl.textContent = `${elements.length} peas`;

    if (elements.length === 0) {
      listEl.innerHTML = '<div style="font-size: 0.72rem; color: var(--text-muted); padding: 8px;">Nenhuma pea na decorao ainda.</div>';
      return;
    }

    // Renderiza do topo para a base (invertido para parecer camadas)
    const reversed = [...elements].reverse();

    reversed.forEach((elem) => {
      const row = document.createElement('div');
      row.className = 'layer-row-item';

      const isSelected = this.canvasEngine.selectedNode?.getAttr('itemMeta')?.instanceId === elem.instanceId;
      if (isSelected) row.classList.add('selected');

      row.innerHTML = `
        <img class="layer-thumb" src="${elem.previewUrl}" alt="" />
        <div class="layer-info">
          <div class="layer-title">${elem.name}</div>
          <div class="layer-sub">${elem.widthCm}x${elem.heightCm}cm</div>
        </div>
      `;

      row.addEventListener('click', () => {
        const nodes = this.canvasEngine.getSceneNodes();
        const targetNode = nodes.find((n) => n.getAttr('itemMeta')?.instanceId === elem.instanceId);
        if (targetNode) {
          this.canvasEngine.selectNode(targetNode);
        }
      });

      listEl.appendChild(row);
    });
  }
}

