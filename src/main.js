import { initDatabase, getItemsByCategory } from './core/db.js';
import { CanvasEngine } from './core/canvas-engine.js';
import { ItemToolbar } from './ui/item-toolbar.js';
import { BottomDock } from './ui/bottom-dock.js';
import { CoverModal } from './ui/cover-modal.js';
import { InventoryModal } from './ui/inventory-modal.js';
import { ExportModal } from './ui/export-modal.js';
import { ProjectsModal } from './ui/projects-modal.js';

async function bootstrap() {
  // 1. Inicializar Banco Local IndexedDB (Dexie)
  await initDatabase();

  // 2. Inicializar Motor Canvas Konva (Palco VERTICAL 9:16)
  const container = document.getElementById('konva-container');
  const canvasEngine = new CanvasEngine();
  canvasEngine.init(container);

  // 3. Inicializar Modais
  const coverModal = new CoverModal(canvasEngine);
  const exportModal = new ExportModal(canvasEngine);
  const projectsModal = new ProjectsModal(canvasEngine);

  let bottomDock = null;

  const inventoryModal = new InventoryModal(async (newItem) => {
    await canvasEngine.addItem(newItem);
    if (bottomDock && bottomDock.activeTab === 'my-items') {
      bottomDock.renderMyItemsTab();
    }
  });

  // 4. Barra de Ações Rápidas da Peça com Exclusão Direta
  new ItemToolbar(canvasEngine, (meta) => {
    coverModal.open(meta);
  });

  // 5. Barra Inferior com Seleção de Cenários por Imagem
  bottomDock = new BottomDock(
    canvasEngine,
    () => inventoryModal.open(),
    (meta) => coverModal.open(meta)
  );

  // 6. Header Actions
  const btnHeaderProjects = document.getElementById('btn-header-projects');
  const btnHeaderClear = document.getElementById('btn-header-clear');
  const btnHeaderExport = document.getElementById('btn-header-export');

  btnHeaderProjects?.addEventListener('click', () => {
    projectsModal.open();
  });

  btnHeaderClear?.addEventListener('click', () => {
    if (confirm('Deseja limpar todos os itens do cenário?')) {
      canvasEngine.clearScene();
    }
  });

  btnHeaderExport?.addEventListener('click', () => {
    exportModal.open();
  });

  // 7. Cenário Inicial Vertical 9:16 Centralizado
  await loadDefaultScene(canvasEngine);
}

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

    const centerX = 540;  // Centro exato de 1080
    const floorY = 1380;  // Linha exata do chão vertical 9:16

    // 1. Painel Redondo ao Centro
    if (panel) {
      await canvasEngine.addItem(panel, {
        x: centerX - 290,
        y: floorY - 600
      });
    }

    // 2. Arco de Balões no Canto Superior Esquerdo
    if (balloons) {
      await canvasEngine.addItem(balloons, {
        x: centerX - 480,
        y: floorY - 720
      });
    }

    // 3. Trio de Cilindros P, M, G à frente no piso
    if (cylG) {
      await canvasEngine.addItem(cylG, {
        x: centerX + 50,
        y: floorY - 320
      });
    }

    if (cylM) {
      await canvasEngine.addItem(cylM, {
        x: centerX - 140,
        y: floorY - 240
      });
    }

    if (cylP) {
      await canvasEngine.addItem(cylP, {
        x: centerX - 300,
        y: floorY - 180
      });
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
