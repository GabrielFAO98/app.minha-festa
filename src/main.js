import { initDatabase, getItemsByCategory } from './core/db.js';
import { CanvasEngine } from './core/canvas-engine.js';
import { ItemToolbar } from './ui/item-toolbar.js';
import { BottomDock } from './ui/bottom-dock.js';
import { CoverModal } from './ui/cover-modal.js';
import { InventoryModal } from './ui/inventory-modal.js';
import { ExportModal } from './ui/export-modal.js';
import { ProjectsModal } from './ui/projects-modal.js';
import { LayersDrawer } from './ui/layers-drawer.js';
import { ConfirmModal } from './ui/confirm-modal.js';

async function bootstrap() {
  // 1. Inicializar Banco de Dados Local (IndexedDB com Dexie)
  await initDatabase();

  // 2. Inicializar o Motor do Canvas Konva (Espaço 4:3)
  const container = document.getElementById('konva-container');
  const canvasEngine = new CanvasEngine();
  canvasEngine.init(container);

  // 3. Inicializar Modais
  const confirmModal = new ConfirmModal();
  const coverModal = new CoverModal(canvasEngine);
  const exportModal = new ExportModal(canvasEngine);
  const projectsModal = new ProjectsModal(canvasEngine);
  const layersDrawer = new LayersDrawer(canvasEngine, confirmModal);

  let bottomDock = null;

  const inventoryModal = new InventoryModal(async (newItem) => {
    await canvasEngine.addItem(newItem);
    if (bottomDock && bottomDock.activeTab === 'my-items') {
      bottomDock.renderMyItemsTab();
    }
    layersDrawer.renderLayers();
  });

  // 4. Inicializar Barra de Ferramentas do Item
  new ItemToolbar(
    canvasEngine,
    (meta) => coverModal.open(meta),
    () => layersDrawer.open(),
    confirmModal
  );

  // 5. Inicializar Gaveta Inferior Deslizante (Bottom Sheet & Dock)
  bottomDock = new BottomDock(
    canvasEngine,
    () => inventoryModal.open(),
    (meta) => coverModal.open(meta)
  );

  // Atualizar lista de camadas quando a cena mudar
  canvasEngine.onLayersChange = () => {
    layersDrawer.renderLayers();
  };

  // 6. Controles de Câmera e Navegação
  const btnCamReset = document.getElementById('btn-cam-reset');
  const btnCamPan = document.getElementById('btn-cam-pan');
  const btnCamZoomIn = document.getElementById('btn-cam-zoom-in');
  const btnCamZoomOut = document.getElementById('btn-cam-zoom-out');

  btnCamReset?.addEventListener('click', () => {
    canvasEngine.fitToView();
  });

  btnCamPan?.addEventListener('click', () => {
    canvasEngine.togglePanMode();
    btnCamPan.classList.toggle('active', canvasEngine.isPanMode);
  });

  btnCamZoomIn?.addEventListener('click', () => {
    canvasEngine.setZoom(1.2);
  });

  btnCamZoomOut?.addEventListener('click', () => {
    canvasEngine.setZoom(0.8);
  });

  // 7. Configurar Eventos do Header Superior
  const btnHeaderProjects = document.getElementById('btn-header-projects');
  const btnHeaderClear = document.getElementById('btn-header-clear');
  const btnHeaderExport = document.getElementById('btn-header-export');

  btnHeaderProjects?.addEventListener('click', () => {
    projectsModal.open();
  });

  btnHeaderClear?.addEventListener('click', async () => {
    const confirmed = await confirmModal.ask(
      'Limpar Todo o Cenário?',
      'Esta ação removerá todas as peças colocadas na decoração.'
    );
    if (confirmed) {
      canvasEngine.clearScene();
    }
  });

  btnHeaderExport?.addEventListener('click', () => {
    exportModal.open();
  });

  // 8. Carregar um Cenário Inicial de Demonstração (Enquadrado perfeitamente em 4:3)
  await loadDefaultScene(canvasEngine);
}

// Monta um cenário inicial de pegue-monte centralizado no espaço 4:3 (1200 x 900)
async function loadDefaultScene(canvasEngine) {
  try {
    const allPanels = await getItemsByCategory('paineis');
    const allCylinders = await getItemsByCategory('cilindros');
    const allBalloons = await getItemsByCategory('baloes');

    const panel = allPanels.find(p => p.id === 'preset-painel-redondo');
    const cylG = allCylinders.find(c => c.id === 'preset-cilindro-g');
    const cylM = allCylinders.find(c => c.id === 'preset-cilindro-m');
    const cylP = allCylinders.find(c => c.id === 'preset-cilindro-p');
    const balloons = allBalloons.find(b => b.id === 'preset-arco-baloes');

    const centerX = 600; // Centro exato de 1200
    const floorY = 630;   // Linha exata do chão

    // 1. Painel Redondo ao Centro
    if (panel) {
      await canvasEngine.addItem(panel, {
        x: centerX - 250,
        y: floorY - 480
      });
    }

    // 2. Arco de Balões no Canto Superior Esquerdo do Painel
    if (balloons) {
      await canvasEngine.addItem(balloons, {
        x: centerX - 420,
        y: floorY - 570
      });
    }

    // 3. Trio de Cilindros P, M, G à frente
    if (cylG) {
      await canvasEngine.addItem(cylG, {
        x: centerX + 40,
        y: floorY - 220
      });
    }

    if (cylM) {
      await canvasEngine.addItem(cylM, {
        x: centerX - 120,
        y: floorY - 170
      });
    }

    if (cylP) {
      await canvasEngine.addItem(cylP, {
        x: centerX - 250,
        y: floorY - 130
      });
    }

    // Desseleciona e enquadra perfeitamente
    canvasEngine.deselect();
    canvasEngine.fitToView();
  } catch (err) {
    console.warn('Erro ao carregar elementos iniciais:', err);
  }
}

// Inicia a aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
