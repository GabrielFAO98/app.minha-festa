import { initDatabase, getItemsByCategory } from './core/db.js';
import { CanvasEngine } from './core/canvas-engine.js';
import { ItemToolbar } from './ui/item-toolbar.js';
import { BottomDock } from './ui/bottom-dock.js';
import { CoverModal } from './ui/cover-modal.js';
import { BalloonModal } from './ui/balloon-modal.js';
import { InventoryModal } from './ui/inventory-modal.js';
import { ExportModal } from './ui/export-modal.js';
import { ProjectsModal } from './ui/projects-modal.js';
import { DesktopStudio } from './ui/desktop-studio.js';

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

  let bottomDock = null;
  let desktopStudio = null;

  const inventoryModal = new InventoryModal(async (newItem) => {
    await canvasEngine.addItem(newItem);
    if (bottomDock && bottomDock.activeTab === 'my-items') {
      bottomDock.renderMyItemsTab();
    }
    if (desktopStudio) {
      desktopStudio.renderCatalogContent();
    }
  });

  // 4. Barra de Aes Mobile da Pea
  const itemToolbar = new ItemToolbar(
    canvasEngine,
    (meta) => coverModal.open(meta),
    (node) => balloonModal.open(node)
  );

  // 5. Barra Inferior Mobile (Dock)
  bottomDock = new BottomDock(
    canvasEngine,
    () => inventoryModal.open(),
    (meta) => coverModal.open(meta)
  );

  // 6. Modo Desktop Studio (Sidebar Esquerda Catlogo + Sidebar Direita Inspetor/Camadas)
  desktopStudio = new DesktopStudio(
    canvasEngine,
    () => inventoryModal.open(),
    (meta) => coverModal.open(meta),
    (node) => balloonModal.open(node)
  );

  // Sincronizao centralizada de seleo e camadas
  canvasEngine.onSelectionChange = (meta, node) => {
    itemToolbar.updateSelection(meta, node);
    desktopStudio.updateInspector(meta, node);
  };

  canvasEngine.onLayersChange = (elements) => {
    desktopStudio.renderLayersList(elements);
  };

  // 7. Header Actions e Histrico (Desfazer / Refazer)
  const btnHeaderUndo = document.getElementById('btn-header-undo');
  const btnHeaderRedo = document.getElementById('btn-header-redo');
  const btnHeaderProjects = document.getElementById('btn-header-projects');
  const btnHeaderClear = document.getElementById('btn-header-clear');
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

  btnHeaderProjects?.addEventListener('click', () => {
    projectsModal.open();
  });

  btnHeaderClear?.addEventListener('click', () => {
    if (confirm('Deseja limpar todos os itens do cenrio?')) {
      canvasEngine.clearScene();
    }
  });

  btnHeaderExport?.addEventListener('click', () => {
    exportModal.open();
  });

  // 8. Carrega Cenrio Inicial e Salva Estado Base de Histrico
  await loadDefaultScene(canvasEngine);
  canvasEngine.saveSnapshot();
}

async function loadDefaultScene(canvasEngine) {
  try {
    const allPanels = await getItemsByCategory('paineis');
    const allCylinders = await getItemsByCategory('cilindros');
    const allBalloons = await getItemsByCategory('baloes');

    const panel = allPanels.find((p) => p.id === 'preset-painel-redondo');
    const cylG = allCylinders.find((c) => c.id === 'preset-cilindro-g');
    const cylM = allCylinders.find((c) => c.id === 'preset-cilindro-m');
    const cylP = allCylinders.find((c) => c.id === 'preset-cilindro-p');
    const balloons = allBalloons.find((b) => b.id === 'preset-arco-baloes');

    const centerX = 540; // Centro exato de 1080
    const floorY = 1380; // Linha do cho vertical 9:16

    // 1. Painel Redondo ao Centro
    if (panel) {
      await canvasEngine.addItem(panel, {
        x: centerX - 290,
        y: floorY - 600
      }, false);
    }

    // 2. Arco de Bales no Canto Superior Esquerdo
    if (balloons) {
      await canvasEngine.addItem(balloons, {
        x: centerX - 480,
        y: floorY - 720
      }, false);
    }

    // 3. Trio de Cilindros P, M, G  frente no piso
    if (cylG) {
      await canvasEngine.addItem(cylG, {
        x: centerX + 50,
        y: floorY - 320
      }, false);
    }

    if (cylM) {
      await canvasEngine.addItem(cylM, {
        x: centerX - 140,
        y: floorY - 240
      }, false);
    }

    if (cylP) {
      await canvasEngine.addItem(cylP, {
        x: centerX - 300,
        y: floorY - 180
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
