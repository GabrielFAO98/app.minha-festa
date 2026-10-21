import { initDatabase, getItemsByCategory } from './core/db';
import { DEFAULT_PRESET_ITEMS } from './core/presets-data';
import { CanvasEngine } from './core/canvas-engine';
import { ItemToolbar } from './ui/item-toolbar';
import { BottomDock } from './ui/bottom-dock';
import { CoverModal } from './ui/cover-modal';
import { BalloonModal } from './ui/balloon-modal';
import { InventoryModal } from './ui/inventory-modal';
import { ExportModal } from './ui/export-modal';
import { ProjectsModal } from './ui/projects-modal';
import { DesktopStudio } from './ui/desktop-studio';
import { HomeScreen } from './ui/home-screen';

async function bootstrap() {
  const splashStartTime = Date.now();

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
      if (bottomDock) {
        bottomDock.invalidateCustomItemsCache();
        if (bottomDock.activeTab === 'my-items') {
          await bottomDock.renderMyItemsTab(true);
        }
      }
      if (desktopStudio) {
        desktopStudio.renderCatalogContent();
      }
    },
    async (updatedItem) => {
      await canvasEngine.updateItemMeta(updatedItem);
      if (bottomDock) {
        bottomDock.invalidateCustomItemsCache();
        if (bottomDock.activeTab === 'my-items') {
          await bottomDock.renderMyItemsTab(true);
        }
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
    bottomDock?.syncLayerSelection(meta?.instanceId || null);
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
    projectsModal.openProjectsScreen(true);
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

  // 10. Menu Inicial (Home Screen) & Controlador de Splash Screen
  const homeScreen = new HomeScreen({
    onNewScene: () => {
      canvasEngine.fitToView();
    },
    onOpenProjects: () => {
      projectsModal.openProjectsScreen(false);
    }
  });

  projectsModal.onProjectLoaded = () => {
    homeScreen.hide();
    canvasEngine.fitToView();
  };

  // 11. Desativa a Splash Screen suavemente (tempo mínimo elegante de 650ms)
  HomeScreen.dismissSplashScreen(650, splashStartTime);
}

async function loadDefaultScene(canvasEngine: CanvasEngine) {
  try {
    const allPanels = await getItemsByCategory('paineis');
    const allCylinders = await getItemsByCategory('cilindros');

    const arch = allPanels.find((p) => p.id === 'preset-arco-romano') || DEFAULT_PRESET_ITEMS.find((p) => p.id === 'preset-arco-romano');
    const panel = allPanels.find((p) => p.id === 'preset-painel-redondo') || DEFAULT_PRESET_ITEMS.find((p) => p.id === 'preset-painel-redondo');
    const cylG = allCylinders.find((c) => c.id === 'preset-cilindro-g') || DEFAULT_PRESET_ITEMS.find((c) => c.id === 'preset-cilindro-g');
    const cylM = allCylinders.find((c) => c.id === 'preset-cilindro-m') || DEFAULT_PRESET_ITEMS.find((c) => c.id === 'preset-cilindro-m');
    const cylP = allCylinders.find((c) => c.id === 'preset-cilindro-p') || DEFAULT_PRESET_ITEMS.find((c) => c.id === 'preset-cilindro-p');

    const floorY = canvasEngine.WALL_HEIGHT; // 1147px (horizonte de encontro da parede com o piso)
    const pxPerCm = canvasEngine.pxPerCm;

    // 1. Painel Arco Romano 1,00x2,00m (Fundo Esquerda - painel alto e imponente)
    if (arch) {
      const archH = (arch.heightCm || 200) * pxPerCm;
      await canvasEngine.addItem(arch, {
        x: 160,
        y: Math.round(floorY + 45 - archH)
      }, false, false);
    }

    // 2. Painel Redondo 1,50m (Fundo Centro-Direita, sobrepondo o Arco com elegância)
    if (panel) {
      const panelH = (panel.heightCm || 190) * pxPerCm;
      await canvasEngine.addItem(panel, {
        x: 360,
        y: Math.round(floorY + 45 - panelH)
      }, false, false);
    }

    // 3. Trio de Cilindros P, M, G rigorosamente alinhados na mesma linha de base no piso
    // Larguras: P=147px, M=170px, G=193px. Espaçamento uniforme de 20px, perfeitamente centralizados no palco (x: 265 a 815)
    const baselineY = Math.round(floorY + 225); // 1372px (base comum horizontal no piso de madeira)

    if (cylP) {
      const cylPH = (cylP.heightCm || 45) * pxPerCm;
      await canvasEngine.addItem(cylP, {
        x: 265,
        y: Math.round(baselineY - cylPH)
      }, false, false);
    }

    if (cylM) {
      const cylMH = (cylM.heightCm || 60) * pxPerCm;
      await canvasEngine.addItem(cylM, {
        x: 432,
        y: Math.round(baselineY - cylMH)
      }, false, false);
    }

    if (cylG) {
      const cylGH = (cylG.heightCm || 80) * pxPerCm;
      await canvasEngine.addItem(cylG, {
        x: 622,
        y: Math.round(baselineY - cylGH)
      }, false, false);
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
