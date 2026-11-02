import { initDatabase, getItemsByCategory } from './core/db';
import { DEFAULT_PRESET_ITEMS } from './core/presets-data';
import { CanvasEngine } from './core/canvas-engine';
import { ScreenManager } from './core/screen-manager';
import { ItemToolbar } from './ui/item-toolbar';
import { BottomDock } from './ui/bottom-dock';
import { CoverModal } from './ui/cover-modal';
import { BalloonModal } from './ui/balloon-modal';
import { InventoryModal } from './ui/inventory-modal';
import { ExportModal } from './ui/export-modal';
import { ConfirmModal } from './ui/confirm-modal';
import { RenameModal } from './ui/rename-modal';
import { ProjectsModal } from './ui/projects-modal';
import { DesktopStudio } from './ui/desktop-studio';
import { HomeScreen } from './ui/home-screen';
import { BalloonStudioModal } from './ui/balloon-studio-modal';

async function bootstrap() {
  const splashStartTime = Date.now();

  // 1. Inicializar Banco Local IndexedDB (Dexie)
  await initDatabase();

  // 2. Inicializar Motor Canvas Konva (Palco VERTICAL 9:16)
  const container = document.getElementById('konva-container');
  const canvasEngine = new CanvasEngine();
  canvasEngine.init(container);

  // 3. Inicializar Modais e Componentes de UI
  const confirmModal = new ConfirmModal();
  const renameModal = new RenameModal();
  const coverModal = new CoverModal(canvasEngine);
  const balloonModal = new BalloonModal(canvasEngine);
  const exportModal = new ExportModal(canvasEngine);
  const projectsModal = new ProjectsModal(canvasEngine, confirmModal);

  let bottomDock: BottomDock | null = null;
  let desktopStudio: DesktopStudio | null = null;

  // 4. Inicializar Estúdio de Balões com callbacks integrados
  const balloonStudioModal = new BalloonStudioModal(
    async (newItem) => {
      // Callback: Inserir no Cenário
      if (balloonStudioModal.openedFromScenario) {
        await canvasEngine.addItem(newItem);
        screenManager.navigateTo('scenario');
        canvasEngine.fitToView();
      } else {
        // Veio da Home: Inicia novo cenário com este arranjo
        projectsModal.executeNewProject();
        await canvasEngine.addItem(newItem);
        screenManager.navigateTo('scenario');
        canvasEngine.fitToView();
      }

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
    async (_savedItem) => {
      // Callback: Apenas Salvo no Acervo
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

  // 5. Gerenciador de Telas (Screen Manager) com controle rigoroso de estado
  let isExitingScreen = false;
  const screenManager = new ScreenManager({
    onBeforeExitScreen: async (fromScreen, toScreen) => {
      if (isExitingScreen) return true;
      isExitingScreen = true;
      try {
        if (fromScreen === 'scenario') {
          return await projectsModal.requestExit();
        }
        if (fromScreen === 'balloon-studio') {
          return await balloonStudioModal.requestExit();
        }
        return true;
      } finally {
        isExitingScreen = false;
      }
    },
    onScreenChange: (newScreen) => {
      if (newScreen === 'home') {
        homeScreen.show();
      } else {
        homeScreen.hide();
      }
      if (newScreen === 'scenario') {
        canvasEngine.fitToView();
      }
      history.pushState({ screen: newScreen }, '');
    }
  });

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

  // 6. Barra de Ações Mobile da Peça
  const itemToolbar = new ItemToolbar(
    canvasEngine,
    (meta) => coverModal.open(meta),
    (node) => balloonModal.open(node)
  );

  // 7. Barra Inferior Mobile (Dock)
  bottomDock = new BottomDock(
    canvasEngine,
    (item) => inventoryModal.open(item),
    (meta) => coverModal.open(meta)
  );

  // 8. Modo Desktop Studio (Sidebar Esquerda Catálogo + Sidebar Direita Inspetor/Camadas)
  desktopStudio = new DesktopStudio(
    canvasEngine,
    () => inventoryModal.open(),
    (meta) => coverModal.open(meta),
    (node) => balloonModal.open(node)
  );

  // Barra Flutuante para Enquadramento de Capa no Palco
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

  // 9. Header Actions, Salvar e Histórico (Desfazer / Refazer)
  const btnHeaderUndo = document.getElementById('btn-header-undo') as HTMLButtonElement | null;
  const btnHeaderRedo = document.getElementById('btn-header-redo') as HTMLButtonElement | null;
  const btnHeaderSave = document.getElementById('btn-header-save');
  const btnHeaderProjects = document.getElementById('btn-header-projects');
  const btnHeaderExport = document.getElementById('btn-header-export');
  const btnHeaderBalloonStudio = document.getElementById('btn-header-balloon-studio');

  // Abre o Estúdio a partir do Cenário (marcando fromScenario: true)
  btnHeaderBalloonStudio?.addEventListener('click', () => {
    balloonStudioModal.open({
      fromScenario: true,
      onExit: () => screenManager.forceNavigateTo('scenario')
    });
    screenManager.navigateTo('balloon-studio');
  });

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

  btnHeaderProjects?.addEventListener('click', async () => {
    const canExit = await projectsModal.requestExit();
    if (canExit) {
      projectsModal.openProjectsScreen(true);
      screenManager.navigateTo('projects');
    }
  });

  btnHeaderExport?.addEventListener('click', () => {
    exportModal.open();
  });

  // 10. Controles de Zoom do Projeto (+, -, 100%)
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

  stageZoomPercent?.addEventListener('click', (e) => {
    e.stopPropagation();
    canvasEngine.resetZoom();
  });

  canvasEngine.onZoomChange = (percent) => {
    if (stageZoomPercent) {
      stageZoomPercent.textContent = `${percent}%`;
    }
    const isZoomed = percent !== 100;
    if (btnZoomReset) {
      btnZoomReset.classList.toggle('active-zoom', isZoomed);
      (btnZoomReset as HTMLButtonElement).title = isZoomed
        ? `Resetar Zoom para 100% (atual: ${percent}%)`
        : 'Resetar Zoom para 100%';
    }
  };

  // 11. Menu Inicial (Home Screen) & Controlador de Splash Screen
  const homeScreen = new HomeScreen({
    onNewScene: async () => {
      projectsModal.executeNewProject();
      screenManager.navigateTo('scenario');
      canvasEngine.fitToView();
    },
    onOpenProjects: () => {
      projectsModal.openProjectsScreen(false);
      screenManager.navigateTo('projects');
    },
    onOpenBalloonStudio: () => {
      balloonStudioModal.open({
        fromScenario: false,
        onExit: () => screenManager.forceNavigateTo('home')
      });
      screenManager.navigateTo('balloon-studio');
    },
    onBeforeExitToHome: async () => {
      return await projectsModal.requestExit();
    },
    onReturnToHome: () => {
      screenManager.navigateTo('home');
    }
  });

  // Conexão de Projetos: ao carregar cenário ou arranjo
  projectsModal.onProjectLoaded = () => {
    screenManager.navigateTo('scenario');
    canvasEngine.fitToView();
  };

  projectsModal.onOpenBalloonProject = (balloonProj) => {
    balloonStudioModal.open({
      projectToLoad: balloonProj,
      fromScenario: false,
      onExit: () => screenManager.forceNavigateTo('projects')
    });
    screenManager.navigateTo('balloon-studio');
  };

  projectsModal.onExitRequested = () => {
    screenManager.navigateTo('home');
  };

  // Inicia rigorosamente na Home
  screenManager.forceNavigateTo('home');
  history.replaceState({ screen: 'home' }, '');

  // Interceptação global do Botão Voltar do Mobile / Navegador
  window.addEventListener('popstate', async () => {
    // 1. Se a gaveta inferior estiver aberta, fecha
    if (bottomDock?.sheetEl?.classList.contains('open')) {
      bottomDock.closeSheet();
      history.pushState({ screen: screenManager.activeScreen }, '');
      return;
    }

    // 2. Se o Estúdio de Balões estiver aberto, delega navegação com autosave/renomear
    if (screenManager.activeScreen === 'balloon-studio') {
      const handled = balloonStudioModal.handleBackNavigation();
      if (!handled) {
        screenManager.navigateTo('home');
      }
      return;
    }

    // 3. Se modal de confirmação estiver aberto, fecha
    if (confirmModal.isOpen) {
      confirmModal.close();
      return;
    }

    if (renameModal.isOpen) {
      renameModal.close();
      return;
    }

    // 4. Se outros modais flutuantes estiverem abertos, fecha
    const openModal = document.querySelector<HTMLElement>('.modal-backdrop.open');
    if (openModal) {
      openModal.classList.remove('open');
      return;
    }

    // 5. Se estiver na tela de projetos, volta para a home
    if (screenManager.activeScreen === 'projects') {
      projectsModal.closeProjectsScreen();
      screenManager.navigateTo('home');
      return;
    }

    // 6. Se estiver no cenário, pede confirmação de saída com renomeação se houver alterações
    if (screenManager.activeScreen === 'scenario') {
      const canExit = await projectsModal.requestExit();
      if (canExit) {
        screenManager.navigateTo('home');
      } else {
        history.pushState({ screen: 'scenario' }, '');
      }
      return;
    }
  });

  // Alerta nativo caso feche a aba com alterações pendentes
  window.addEventListener('beforeunload', (e) => {
    if (projectsModal.hasUnsavedChanges() || balloonStudioModal.isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // 12. Desativa a Splash Screen suavemente
  HomeScreen.dismissSplashScreen(650, splashStartTime);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
