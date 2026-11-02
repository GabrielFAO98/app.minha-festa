// Gerenciador de Projetos: Tela Exclusiva de Cenários e Modal de Salvar
import { getAllProjects, getScenarioProjects, saveProject, deleteProject } from '../core/db';
import { CanvasEngine, DEFAULT_SCENARIO_BG } from '../core/canvas-engine';
import type { ConfirmModal } from './confirm-modal';
import { renameModal } from './rename-modal';
import type { ProjectData } from '../types';

export class ProjectsModal {
  canvasEngine: CanvasEngine;
  confirmModal: ConfirmModal;

  currentProjectId: string | null;
  currentProjectTitle: string;
  hasCustomName = false;
  hasEverBeenSaved = false;
  isDirty = false;
  private autosaveTimer: any = null;

  // Tela Exclusiva de Projetos
  projectsScreenEl: HTMLElement | null;
  projectsGridEl: HTMLElement | null;
  projectsCountEl: HTMLElement | null;
  btnProjectsBack: HTMLElement | null;
  btnProjectsNewScene: HTMLElement | null;

  // Modal para Salvar Cenário Atual (Renomeação Manual)
  saveModalEl: HTMLElement | null;
  titleInput: HTMLInputElement | null;
  btnSave: HTMLElement | null;
  btnCloseSave: HTMLElement | null;
  private saveModalResolve: ((saved: boolean) => void) | null = null;

  // Header do Estúdio
  titleDisplay: HTMLElement | null;
  btnHeaderProjects: HTMLElement | null;

  onProjectLoaded?: (() => void) | null;
  onOpenBalloonProject?: ((project: ProjectData) => void) | null;
  onExitRequested?: (() => void) | null;
  private openedFromStudio = false;

  constructor(canvasEngine: CanvasEngine, confirmModal: ConfirmModal) {
    this.canvasEngine = canvasEngine;
    this.confirmModal = confirmModal;
    this.currentProjectId = null;
    this.currentProjectTitle = 'Novo Cenário';
    this.hasCustomName = false;

    // Tela Exclusiva
    this.projectsScreenEl = document.getElementById('projects-screen');
    this.projectsGridEl = document.getElementById('projects-screen-grid');
    this.projectsCountEl = document.getElementById('projects-screen-count');
    this.btnProjectsBack = document.getElementById('btn-projects-back');
    this.btnProjectsNewScene = document.getElementById('btn-projects-new-scene');

    // Modal Salvar
    this.saveModalEl = document.getElementById('save-project-modal');
    this.titleInput = document.getElementById('project-save-title') as HTMLInputElement | null;
    this.btnSave = document.getElementById('btn-save-project-action');
    this.btnCloseSave = document.getElementById('btn-close-save-project-modal');

    // Header
    this.titleDisplay = document.getElementById('project-title-display');
    this.btnHeaderProjects = document.getElementById('btn-header-projects');

    this.setupEvents();
  }

  setupEvents(): void {
    // Escuta alterações na cena para autosave contínuo
    this.canvasEngine.onSceneChange = () => {
      this.markDirtyAndScheduleAutosave();
    };

    // Tela de Projetos: Botão Voltar
    this.btnProjectsBack?.addEventListener('click', () => {
      this.closeProjectsScreen();
    });

    // Tela de Projetos: Botão Novo Cenário
    this.btnProjectsNewScene?.addEventListener('click', async () => {
      await this.createNewProject();
    });

    // Modal Salvar: Fechar
    this.btnCloseSave?.addEventListener('click', () => this.closeSaveModal(false));
    this.saveModalEl?.addEventListener('click', (e) => {
      if (e.target === this.saveModalEl) this.closeSaveModal(false);
    });

    // Modal Salvar: Confirmar Salvar
    this.btnSave?.addEventListener('click', async () => {
      await this.saveFromModal();
    });

    this.titleInput?.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        await this.saveFromModal();
      }
    });

    // Tecla Escape para fechar modais
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.saveModalEl?.classList.contains('open')) {
          this.closeSaveModal(false);
        } else if (this.isProjectsScreenOpen()) {
          this.closeProjectsScreen();
        }
      }
    });

    // Header: Botão Projetos
    this.btnHeaderProjects?.addEventListener('click', () => {
      this.openProjectsScreen(true);
    });
  }

  // ========================================================
  // AUTOSAVE CONTÍNUO (SALVAMENTO AUTOMÁTICO EM SEGUNDO PLANO)
  // ========================================================
  markDirtyAndScheduleAutosave(): void {
    const elements = this.canvasEngine.getSceneElements();
    if (elements.length === 0) return;

    this.isDirty = true;
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);

    this.autosaveTimer = setTimeout(async () => {
      await this.performAutosave();
    }, 800);
  }

  async performAutosave(): Promise<void> {
    const elements = this.canvasEngine.getSceneElements();
    if (elements.length === 0) return;

    if (!this.currentProjectId) {
      this.currentProjectId = 'proj-' + Date.now();
    }

    try {
      const thumb = this.canvasEngine.exportHDImage();
      await saveProject({
        id: this.currentProjectId,
        title: this.currentProjectTitle || 'Novo Cenário',
        projectType: 'scenario',
        elements: elements,
        wallTextureUrl: this.canvasEngine.wallTextureUrl,
        floorTextureUrl: this.canvasEngine.floorTextureUrl,
        bgImageUrl: this.canvasEngine.bgImageUrl || DEFAULT_SCENARIO_BG,
        thumbnailUrl: thumb
      });

      this.hasEverBeenSaved = true;
      this.isDirty = false;
    } catch (err) {
      console.warn('Erro ao salvar cenário automaticamente:', err);
    }
  }

  // Verificação Segura ao tentar sair da tela de Cenário
  async requestExit(): Promise<boolean> {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
      if (this.isDirty) {
        await this.performAutosave();
      }
    }

    // Se o usuário não incluiu nem alterou nada no cenário, sai direto sem prompt!
    if (!this.hasEverBeenSaved) {
      return true;
    }

    // Se o projeto já possui nome personalizado, salva em silêncio e sai direto SEM abrir o modal de renomear!
    if (this.hasCustomName || (this.currentProjectTitle && this.currentProjectTitle !== 'Novo Cenário')) {
      if (this.isDirty) {
        await this.performAutosave();
      }
      return true;
    }

    // Se e somente se o projeto ainda estiver com o nome padrão 'Novo Cenário', pergunta se quer renomear
    const result = await renameModal.prompt({
      currentTitle: this.currentProjectTitle,
      itemType: 'cenário'
    });

    if (result.action === 'cancel') {
      return false; // Cancela a saída, permanece editando
    }

    if (result.action === 'rename' && result.title) {
      this.currentProjectTitle = result.title;
      this.hasCustomName = true;
      if (this.titleDisplay) {
        this.titleDisplay.textContent = this.currentProjectTitle;
      }
      if (this.currentProjectId) {
        await saveProject({
          id: this.currentProjectId,
          title: this.currentProjectTitle,
          projectType: 'scenario',
          elements: this.canvasEngine.getSceneElements(),
          wallTextureUrl: this.canvasEngine.wallTextureUrl,
          floorTextureUrl: this.canvasEngine.floorTextureUrl,
          bgImageUrl: this.canvasEngine.bgImageUrl || undefined,
          thumbnailUrl: this.canvasEngine.exportHDImage()
        });
      }
    } else if (result.action === 'keep') {
      this.hasCustomName = true;
    }

    return true; // Prossegue com a saída
  }

  hasUnsavedChanges(): boolean {
    return this.isDirty;
  }

  markClean(): void {
    this.isDirty = false;
  }

  // ========================================================
  // TELA DE PROJETOS SALVOS (CENÁRIOS E ARRANJOS DE BALÕES)
  // ========================================================
  async openProjectsScreen(fromStudio = false): Promise<void> {
    this.openedFromStudio = fromStudio;
    await this.renderProjectsGrid();

    this.projectsScreenEl?.classList.remove('hidden');
    this.projectsScreenEl?.focus();
  }

  closeProjectsScreen(): void {
    this.projectsScreenEl?.classList.add('hidden');
    this.onExitRequested?.();
  }

  isProjectsScreenOpen(): boolean {
    return Boolean(this.projectsScreenEl && !this.projectsScreenEl.classList.contains('hidden'));
  }

  async renderProjectsGrid(): Promise<void> {
    if (!this.projectsGridEl) return;
    const projects = await getScenarioProjects();
    this.projectsGridEl.innerHTML = '';

    const countText = `${projects.length} ${projects.length === 1 ? 'cenário salvo' : 'cenários salvos'}`;
    if (this.projectsCountEl) {
      this.projectsCountEl.textContent = countText;
    }

    if (projects.length === 0) {
      this.projectsGridEl.innerHTML = `
        <div class="projects-empty-state">
          <div class="projects-empty-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2 class="projects-empty-title">Nenhum cenário salvo ainda</h2>
          <p class="projects-empty-desc">Crie decorações no estúdio e elas serão salvas automaticamente.</p>
          <button id="btn-empty-create-scene" class="btn-primary" style="margin-top: 6px; padding: 0 18px; height: 38px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Criar Novo Cenário</span>
          </button>
        </div>
      `;

      this.projectsGridEl.querySelector('#btn-empty-create-scene')?.addEventListener('click', async () => {
        await this.createNewProject();
      });
      return;
    }

    const fragment = document.createDocumentFragment();
    projects.forEach((proj) => {
      const isCurrentActive = proj.id === this.currentProjectId;
      const card = document.createElement('div');
      card.className = `project-card ${isCurrentActive ? 'active-project' : ''}`;

      const dateStr = new Date(proj.updatedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const countLabel = `${proj.elements?.length || 0} peças`;

      card.innerHTML = `
        <div class="project-card-thumb-wrap">
          <img src="${proj.thumbnailUrl || ''}" alt="${proj.title}" class="project-card-thumb" style="object-fit: contain; background: #FAF8F5;" />
          ${isCurrentActive ? '<span class="project-badge-active">Ativo</span>' : ''}
        </div>
        <div class="project-card-info">
          <h3 class="project-card-title">${proj.title}</h3>
          <div class="project-card-meta">
            <span>${countLabel}</span>
            <span class="meta-dot">•</span>
            <span>${dateStr}</span>
          </div>
          <div class="project-card-actions">
            <button class="btn-primary btn-proj-open" data-proj-id="${proj.id}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              <span>Abrir Cenário</span>
            </button>
            <button class="btn-proj-delete" data-proj-id="${proj.id}" title="Excluir este projeto">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      // Ação Abrir Projeto
      card.querySelector('.btn-proj-open')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.handleOpenProject(proj);
      });

      card.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.btn-proj-delete')) return;
        await this.handleOpenProject(proj);
      });

      // Ação Excluir Projeto com Confirmação
      card.querySelector('.btn-proj-delete')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = await this.confirmModal.ask({
          title: 'Excluir Cenário',
          message: `Deseja excluir permanentemente o cenário "${proj.title}"? Esta ação não pode ser desfeita.`,
          confirmLabel: 'Excluir Cenário',
          cancelLabel: 'Cancelar',
          danger: true
        });

        if (confirmed) {
          if (this.currentProjectId === proj.id) {
            this.currentProjectId = null;
            this.currentProjectTitle = 'Novo Cenário';
            this.hasEverBeenSaved = false;
            this.isDirty = false;
            if (this.titleDisplay) this.titleDisplay.textContent = 'Novo Cenário';
          }
          await deleteProject(proj.id);
          await this.renderProjectsGrid();
        }
      });

      fragment.appendChild(card);
    });

    this.projectsGridEl.appendChild(fragment);
  }

  // Abertura Segura: Salva cenário atual antes de carregar o escolhido
  async handleOpenProject(proj: ProjectData): Promise<void> {
    try {
      if (proj.projectType === 'balloon') {
        this.closeProjectsScreen();
        this.onOpenBalloonProject?.(proj);
        return;
      }

      // Se o projeto clicado já é o que está ativo, apenas entra diretamente
      if (this.currentProjectId === proj.id) {
        this.closeProjectsScreen();
        this.onProjectLoaded?.();
        this.canvasEngine.fitToView();
        return;
      }

      // Se há alterações no cenário atual, pergunta sobre renomear/salvar antes de trocar
      const canExit = await this.requestExit();
      if (!canExit) return;

      await this.loadProject(proj);
    } catch (err) {
      console.error('Erro ao abrir projeto:', err);
    }
  }

  async loadProject(proj: ProjectData): Promise<void> {
    try {
      await this.canvasEngine.loadSceneElements(proj.elements || []);

      if (proj.bgImageUrl) {
        await this.canvasEngine.setEnvironmentScenario(proj.bgImageUrl);
      } else {
        const wall = proj.wallTextureUrl || proj.wallTexture;
        const floor = proj.floorTextureUrl || proj.floorTexture;
        if (wall || floor) {
          await this.canvasEngine.setEnvironmentTextures(wall || null, floor || null);
        } else {
          await this.canvasEngine.setEnvironmentScenario(DEFAULT_SCENARIO_BG);
        }
      }

      this.currentProjectId = proj.id;
      this.currentProjectTitle = proj.title || 'Meu Cenário';
      this.hasCustomName = Boolean(proj.title && proj.title !== 'Novo Cenário');
      this.hasEverBeenSaved = true;
      this.isDirty = false;

      if (this.titleDisplay) {
        this.titleDisplay.textContent = this.currentProjectTitle;
      }
      if (this.titleInput) {
        this.titleInput.value = this.currentProjectTitle;
      }

      this.canvasEngine.saveSnapshot();
      this.markClean();
      this.closeProjectsScreen();

      this.onProjectLoaded?.();
      this.canvasEngine.fitToView();
    } catch (err) {
      console.error('Erro ao carregar cenário:', err);
    }
  }

  // Iniciar Novo Cenário com Verificação Prévia de Salvamento
  async createNewProject(): Promise<void> {
    const canExit = await this.requestExit();
    if (!canExit) return;

    this.executeNewProject();
  }

  executeNewProject(): void {
    this.canvasEngine.clearScene(true);
    this.currentProjectId = null;
    this.currentProjectTitle = 'Novo Cenário';
    this.hasCustomName = false;
    this.hasEverBeenSaved = false;
    this.isDirty = false;

    if (this.titleDisplay) {
      this.titleDisplay.textContent = 'Novo Cenário';
    }
    if (this.titleInput) {
      this.titleInput.value = '';
    }

    this.canvasEngine.saveSnapshot();
    this.markClean();
    this.closeProjectsScreen();

    this.onProjectLoaded?.();
    this.canvasEngine.fitToView();
  }

  // ========================================================
  // MODAL DE SALVAR CENÁRIO NO ESTÚDIO (RENOMEAÇÃO MANUAL)
  // ========================================================
  openSaveModal(): Promise<boolean> {
    return new Promise((resolve) => {
      this.saveModalResolve = resolve;
      if (this.titleInput) {
        this.titleInput.value = this.currentProjectId ? this.currentProjectTitle : '';
      }
      this.saveModalEl?.classList.add('open');
      setTimeout(() => this.titleInput?.focus(), 120);
    });
  }

  closeSaveModal(saved = false): void {
    this.saveModalEl?.classList.remove('open');
    if (this.saveModalResolve) {
      this.saveModalResolve(saved);
      this.saveModalResolve = null;
    }
  }

  async quickSave(): Promise<boolean> {
    const elements = this.canvasEngine.getSceneElements();

    if (elements.length === 0) {
      alert('Adicione ao menos uma peça no cenário antes de salvar.');
      return false;
    }

    if (!this.currentProjectId) {
      return await this.openSaveModal();
    }

    const thumb = this.canvasEngine.exportHDImage();

    await saveProject({
      id: this.currentProjectId,
      title: this.currentProjectTitle,
      projectType: 'scenario',
      elements: elements,
      wallTextureUrl: this.canvasEngine.wallTextureUrl,
      floorTextureUrl: this.canvasEngine.floorTextureUrl,
      bgImageUrl: this.canvasEngine.bgImageUrl || undefined,
      thumbnailUrl: thumb
    });

    this.hasEverBeenSaved = true;
    this.markClean();
    return true;
  }

  async saveFromModal(): Promise<boolean> {
    const title = this.titleInput?.value.trim() || this.currentProjectTitle || 'Novo Cenário';
    const elements = this.canvasEngine.getSceneElements();

    if (elements.length === 0) {
      alert('Adicione ao menos uma peça no cenário antes de salvar.');
      return false;
    }

    const thumb = this.canvasEngine.exportHDImage();

    const saved = await saveProject({
      id: this.currentProjectId || undefined,
      title: title,
      projectType: 'scenario',
      elements: elements,
      wallTextureUrl: this.canvasEngine.wallTextureUrl,
      floorTextureUrl: this.canvasEngine.floorTextureUrl,
      bgImageUrl: this.canvasEngine.bgImageUrl || undefined,
      thumbnailUrl: thumb
    });

    this.currentProjectId = saved.id;
    this.currentProjectTitle = saved.title;
    this.hasCustomName = Boolean(saved.title && saved.title !== 'Novo Cenário');
    this.hasEverBeenSaved = true;

    if (this.titleDisplay) {
      this.titleDisplay.textContent = this.currentProjectTitle;
    }

    this.markClean();
    this.closeSaveModal(true);
    return true;
  }
}
