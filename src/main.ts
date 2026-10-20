import { initDatabase, getItemsByCategory } from './core/db';
import { CanvasEngine } from './core/canvas-engine';
import { ItemToolbar } from './ui/item-toolbar';
import { BottomDock } from './ui/bottom-dock';
import { CoverModal } from './ui/cover-modal';
import { BalloonModal } from './ui/balloon-modal';
import { InventoryModal } from './ui/inventory-modal';
import { ExportModal } from './ui/export-modal';
import { ProjectsModal } from './ui/projects-modal';
import { DesktopStudio } from './ui/desktop-studio';

async function bootstrap() {
  // 1. Inicializar Banco Local IndexedDB (Dexie)
  await initDatabase();

  // 2. Inicializar Motor Canvas Konva (Palco VERTICAL 9:16)
  const container = document.getElementById('konva-container');
  const canvasEngine = new CanvasEngine();
  canvasEngine.init(container);

  // 3. Inicializar Modais
  const coverModal = new CoverModal(canvasEngine);
  const balloonModal = new BalloonModal(canvasEngine);
  const exportModal = new ExportModal(canvasEngine);
  const projectsModal = new ProjectsModal(canvasEngine);

  let bottomDock: BottomDock | null = null;
  let desktopStudio: DesktopStudio | null = null;

  const inventoryModal = new InventoryModal(
    async (newItem) => {
      await canvasEngine.addItem(newItem);
      if (bottomDock && bottomDock.activeTab === 'my-items') {
        bottomDock.renderMyItemsTab();
      }
      if (desktopStudio) {
        desktopStudio.renderCatalogContent();
      }
    },
    async (updatedItem) => {
      await canvasEngine.updateItemMeta(updatedItem);
      if (bottomDock && bottomDock.activeTab === 'my-items') {
        bottomDock.renderMyItemsTab();
      }
      if (desktopStudio) {
        desktopStudio.renderCatalogContent();
      }
    }
  );

  // 4. Barra de Ações Mobile da Peça
  const itemToolbar = new ItemToolbar(
    canvasEngine,
    (meta) => coverModal.open(meta),
    (node) => balloonModal.open(node)
  );

  // 5. Barra Inferior Mobile (Dock)
  bottomDock = new BottomDock(
    canvasEngine,
    (item) => inventoryModal.open(item),
    (meta) => coverModal.open(meta)
  );

  // 6. Modo Desktop Studio (Sidebar Esquerda Catálogo + Sidebar Direita Inspetor/Camadas)
  desktopStudio = new DesktopStudio(
    canvasEngine,
    () => inventoryModal.open(),
    (meta) => coverModal.open(meta),
    (node) => balloonModal.open(node)
  );

  // Barra Flutuante Estilo Facebook para Enquadramento de Capa no Palco
  const repositionBar = document.getElementById('cover-reposition-bar');
  const stageZoomSlider = document.getElementById('stage-cover-zoom-slider') as HTMLInputElement | null;
  const stageZoomValue = document.getElementById('stage-cover-zoom-value');
  const btnStageReset = document.getElementById('btn-stage-cover-reset');
  const btnStageDone = document.getElementById('btn-stage-cover-done');

  stageZoomSlider?.addEventListener('input', (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (stageZoomValue) stageZoomValue.textContent = `${Math.round(val * 100)}%`;
    canvasEngine.setCoverScale(val, false);
    if (desktopStudio && canvasEngine.selectedNode) {
      desktopStudio.updateInspector(canvasEngine.selectedNode.getAttr('itemMeta') || null, canvasEngine.selectedNode);
    }
  });

  stageZoomSlider?.addEventListener('change', (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    canvasEngine.setCoverScale(val, true);
  });

  btnStageReset?.addEventListener('click', () => {
    canvasEngine.resetCoverTransform();
    if (stageZoomSlider) stageZoomSlider.value = '1';
    if (stageZoomValue) stageZoomValue.textContent = '100%';
    if (desktopStudio && canvasEngine.selectedNode) {
      desktopStudio.updateInspector(canvasEngine.selectedNode.getAttr('itemMeta') || null, canvasEngine.selectedNode);
    }
  });

  btnStageDone?.addEventListener('click', () => {
    canvasEngine.exitCoverRepositionMode();
  });

  canvasEngine.onCoverRepositionChange = (active, meta) => {
    if (repositionBar) {
      repositionBar.style.display = active ? 'flex' : 'none';
    }
    if (active && meta) {
      const scaleVal = meta.coverScale || 1;
      if (stageZoomSlider) stageZoomSlider.value = String(scaleVal);
      if (stageZoomValue) stageZoomValue.textContent = `${Math.round(scaleVal * 100)}%`;
    }
    if (desktopStudio) {
      desktopStudio.updateInspector(meta, canvasEngine.selectedNode);
    }
    itemToolbar.updateSelection(meta, canvasEngine.selectedNode);
  };

  // Sincronização centralizada de seleção e camadas
  canvasEngine.onSelectionChange = (meta, node) => {
    itemToolbar.updateSelection(meta, node);
    desktopStudio?.updateInspector(meta, node);
    if (!canvasEngine.isRepositioningCover && repositionBar) {
      repositionBar.style.display = 'none';
    }
  };

  canvasEngine.onLayersChange = (elements) => {
    desktopStudio?.renderLayersList(elements);
    if (bottomDock?.activeTab === 'layers') {
      bottomDock.renderLayersTab();
    }
  };

  // 7. Header Actions, Salvar e Histórico (Desfazer / Refazer)
  const btnHeaderUndo = document.getElementById('btn-header-undo') as HTMLButtonElement | null;
  const btnHeaderRedo = document.getElementById('btn-header-redo') as HTMLButtonElement | null;
  const btnHeaderSave = document.getElementById('btn-header-save');
  const btnHeaderProjects = document.getElementById('btn-header-projects');
  const btnHeaderExport = document.getElementById('btn-header-export');

  btnHeaderUndo?.addEventListener('click', () => {
    canvasEngine.undo();
  });

  btnHeaderRedo?.addEventListener('click', () => {
    canvasEngine.redo();
  });

  canvasEngine.onHistoryChange = (canUndo, canRedo) => {
    if (btnHeaderUndo) btnHeaderUndo.disabled = !canUndo;
    if (btnHeaderRedo) btnHeaderRedo.disabled = !canRedo;
  };

  btnHeaderSave?.addEventListener('click', () => {
    projectsModal.quickSave();
  });

  btnHeaderProjects?.addEventListener('click', () => {
    projectsModal.open();
  });

  btnHeaderExport?.addEventListener('click', () => {
    exportModal.open();
  });

  // 8. Controles de Zoom do Projeto (+, -, 100%)
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomReset = document.getElementById('btn-zoom-reset');
  const stageZoomPercent = document.getElementById('stage-zoom-percent');

  btnZoomIn?.addEventListener('click', (e) => {
    e.stopPropagation();
    canvasEngine.zoomIn();
  });

  btnZoomOut?.addEventListener('click', (e) => {
    e.stopPropagation();
    canvasEngine.zoomOut();
  });

  btnZoomReset?.addEventListener('click', (e) => {
    e.stopPropagation();
    canvasEngine.resetZoom();
  });

  canvasEngine.onZoomChange = (percent) => {
    if (stageZoomPercent) {
      stageZoomPercent.textContent = `${percent}%`;
    }
  };

  // 9. Carrega Cenário Inicial e Salva Estado Base de Histórico
  await loadDefaultScene(canvasEngine);
  canvasEngine.saveSnapshot();
}

async function loadDefaultScene(canvasEngine: CanvasEngine) {
  try {
    const allPanels = await getItemsByCategory('paineis');
    const allCylinders = await getItemsByCategory('cilindros');

    const panel = allPanels.find((p) => p.id === 'preset-painel-redondo');
    const cylG = allCylinders.find((c) => c.id === 'preset-cilindro-g');
    const cylM = allCylinders.find((c) => c.id === 'preset-cilindro-m');
    const cylP = allCylinders.find((c) => c.id === 'preset-cilindro-p');

    const centerX = 540; // Centro exato de 1080
    const floorY = canvasEngine.WALL_HEIGHT; // Linha do chão padrão vertical 9:16 (1147)

    // 1. Painel Redondo ao Centro
    if (panel) {
      await canvasEngine.addItem(panel, {
        x: centerX - 290,
        y: floorY - 570
      }, false);
    }
    // 2. Trio de Cilindros P, M, G à frente no piso
    if (cylG) {
      await canvasEngine.addItem(cylG, {
        x: centerX + 50,
        y: floorY - 268
      }, false);
    }

    if (cylM) {
      await canvasEngine.addItem(cylM, {
        x: centerX - 140,
        y: floorY - 151
      }, false);
    }

    if (cylP) {
      await canvasEngine.addItem(cylP, {
        x: centerX - 300,
        y: floorY - 63
      }, false);
    }

    canvasEngine.deselect();
    canvasEngine.fitToView();
  } catch (err) {
    console.warn('Erro ao carregar elementos iniciais:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
