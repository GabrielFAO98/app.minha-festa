import { initDatabase, getItemsByCategory } from './core/db.js';
import { CanvasEngine } from './core/canvas-engine.js';
import { ItemToolbar } from './ui/item-toolbar.js';
import { BottomDock } from './ui/bottom-dock.js';
import { CoverModal } from './ui/cover-modal.js';
import { InventoryModal } from './ui/inventory-modal.js';
import { ExportModal } from './ui/export-modal.js';
import { ProjectsModal } from './ui/projects-modal.js';

async function bootstrap() {
  // 1. Inicializar Banco de Dados Local (IndexedDB com Dexie)
  await initDatabase();

  // 2. Inicializar o Motor do Canvas Konva
  const container = document.getElementById('konva-container');
  const canvasEngine = new CanvasEngine();
  canvasEngine.init(container);

  // 3. Inicializar Modais
  const coverModal = new CoverModal(canvasEngine);
  const exportModal = new ExportModal(canvasEngine);
  const projectsModal = new ProjectsModal(canvasEngine);

  let bottomDock = null;

  const inventoryModal = new InventoryModal(async (newItem) => {
    // Quando uma nova peça é criada no acervo, adiciona ao cenário e recarrega a aba
    await canvasEngine.addItem(newItem);
    if (bottomDock && bottomDock.activeTab === 'my-items') {
      bottomDock.renderMyItemsTab();
    }
  });

  // 4. Inicializar Barra de Ferramentas do Item
  new ItemToolbar(canvasEngine, (meta) => {
    coverModal.open(meta);
  });

  // 5. Inicializar Gaveta Inferior Deslizante (Bottom Sheet & Dock)
  bottomDock = new BottomDock(
    canvasEngine,
    () => inventoryModal.open(),
    (meta) => coverModal.open(meta)
  );

  // 6. Configurar Eventos do Header Superior
  const btnHeaderProjects = document.getElementById('btn-header-projects');
  const btnHeaderClear = document.getElementById('btn-header-clear');
  const btnHeaderExport = document.getElementById('btn-header-export');

  btnHeaderProjects?.addEventListener('click', () => {
    projectsModal.open();
  });

  btnHeaderClear?.addEventListener('click', () => {
    if (confirm('Deseja realmente limpar todos os itens do cenário?')) {
      canvasEngine.clearScene();
    }
  });

  btnHeaderExport?.addEventListener('click', () => {
    exportModal.open();
  });

  // 7. Carregar um Cenário Inicial de Demonstração (Pegue-Monte clássico)
  await loadDefaultScene(canvasEngine);
}

// Monta um cenário inicial simpático para o decorador experimentar na hora
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

    const stageWidth = canvasEngine.stage.width();
    const stageHeight = canvasEngine.stage.height();
    const centerX = stageWidth / 2;
    const floorY = stageHeight * 0.72;

    // 1. Painel Redondo ao Centro
    if (panel) {
      const panelNode = await canvasEngine.addItem(panel, {
        x: centerX - 75,
        y: floorY - 170
      });
    }

    // 2. Arco de Balões no Canto Superior Esquerdo do Painel
    if (balloons) {
      await canvasEngine.addItem(balloons, {
        x: centerX - 140,
        y: floorY - 220
      });
    }

    // 3. Trio de Cilindros P, M, G à frente
    if (cylG) {
      await canvasEngine.addItem(cylG, {
        x: centerX + 10,
        y: floorY - 80
      });
    }

    if (cylM) {
      await canvasEngine.addItem(cylM, {
        x: centerX - 45,
        y: floorY - 60
      });
    }

    if (cylP) {
      await canvasEngine.addItem(cylP, {
        x: centerX - 90,
        y: floorY - 45
      });
    }

    // Desseleciona para ficar com a visão limpa
    canvasEngine.deselect();
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
