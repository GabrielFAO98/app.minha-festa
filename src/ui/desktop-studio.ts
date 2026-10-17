import { generateMoinhoSVG, svgToDataUrl } from '../core/presets-data';
// Modo Desktop Studio - Painéis Laterais de Catálogo, Inspetor e Camadas
import { getItemsByCategory, getAllItems, getAllCovers } from '../core/db';
import { REALISTIC_ENVIRONMENTS } from '../core/textures-data';
import type { CanvasEngine } from '../core/canvas-engine';
import type { PresetItem, SceneElement } from '../types';
import type Konva from 'konva';

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

    // Sincroniza seleção e camadas no painel desktop
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
    // Categorias de Presets
    const catBar = document.createElement('div');
    catBar.className = 'desktop-category-pills';

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
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Tire fotos das suas mesas e painéis próprios!</div>
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
        if (this.canvasEngine.selectedNode) {
          await this.canvasEngine.applyCoverToSelected(cover.imageUrl);
        } else {
          alert('Selecione primeiro um painel, cilindro ou tapete no centro para vestir a capa.');
        }
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
        await this.canvasEngine.setEnvironmentTextures(env.wallTexture, env.floorTexture);
      });
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // INSPETOR DA PEÇA SELECIONADA
  initInspectorListeners(): void {
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

    btnCover?.addEventListener('click', async () => {
      const node = this.canvasEngine.selectedNode;
      if (!node) return;
      const meta = (node.getAttr('itemMeta') || {}) as PresetItem;

      if (meta.type === 'moinho') {
        const order = ['marrom', 'branco', 'bege'];
        const current = meta.currentColor || 'marrom';
        const nextIdx = (order.indexOf(current) + 1) % order.length;
        const nextColor = order[nextIdx];
        const newSvg = generateMoinhoSVG(nextColor as any);
        const newUrl = svgToDataUrl(newSvg);
        await this.canvasEngine.changeItemImage(node as Konva.Group, newUrl, nextColor);
        const updatedMeta = node.getAttr('itemMeta');
        this.updateInspector(updatedMeta, node);
        return;
      }

      if (meta.category === 'baloes' || meta.type === 'balloon_arch') {
        this.onOpenBalloonModal(node);
      } else {
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

    if (!node || !meta) {
      if (box) box.style.display = 'none';
      if (emptyBox) emptyBox.style.display = 'flex';
      return;
    }

    if (box) box.style.display = 'flex';
    if (emptyBox) emptyBox.style.display = 'none';

    if (titleEl) titleEl.textContent = meta.name;
    if (sizeEl) sizeEl.textContent = `${meta.widthCm}cm de largura • ${meta.heightCm}cm de altura`;
    if (thumbEl) thumbEl.src = meta.previewUrl;

    if (btnCover) {
      const isBalloons = meta.category === 'baloes' || meta.type === 'balloon_arch';
      if (meta.type === 'moinho') {
        const colorLabel = (meta.currentColor || 'marrom').toUpperCase();
        btnCover.textContent = '🎨 Cor: ' + colorLabel;
      } else {
        btnCover.textContent = isBalloons ? '🎨 Cores dos Balões' : '🎨 Vestir Capa';
      }
    }
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

    // Renderiza do topo para a base (invertido para parecer camadas)
    const reversed = [...elements].reverse();

    reversed.forEach((elem) => {
      const row = document.createElement('div');
      row.className = 'layer-row-item';

      const isSelected = (this.canvasEngine.selectedNode as any)?.getAttr('itemMeta')?.instanceId === elem.instanceId;
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
        const targetNode = nodes.find((n) => (n as any).getAttr('itemMeta')?.instanceId === elem.instanceId);
        if (targetNode) {
          this.canvasEngine.selectNode(targetNode);
        }
      });

      listEl.appendChild(row);
    });
  }
}
