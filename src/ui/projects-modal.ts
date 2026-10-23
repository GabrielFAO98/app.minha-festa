// Gerenciador de Projetos: Tela Exclusiva de Cenários e Modal de Salvar
import { getAllProjects, saveProject, deleteProject } from '../core/db';
import type { CanvasEngine } from '../core/canvas-engine';
import type { ConfirmModal } from './confirm-modal';
import type { ProjectData } from '../types';

export class ProjectsModal {
  canvasEngine: CanvasEngine;
  confirmModal: ConfirmModal;
  currentProjectId: string | null;
  currentProjectTitle: string;
  private lastSavedSnapshot: string = '';

  // Tela Exclusiva de Projetos
  projectsScreenEl: HTMLElement | null;
  projectsGridEl: HTMLElement | null;
  projectsCountEl: HTMLElement | null;
  btnProjectsBack: HTMLElement | null;
  btnProjectsNewScene: HTMLElement | null;

  // Modal para Salvar Cenário Atual
  saveModalEl: HTMLElement | null;
  titleInput: HTMLInputElement | null;
  btnSave: HTMLElement | null;
  btnCloseSave: HTMLElement | null;
  private saveModalResolve: ((saved: boolean) => void) | null = null;

  // Header do Estúdio
  titleDisplay: HTMLElement | null;
  btnHeaderSave: HTMLElement | null;
  btnHeaderProjects: HTMLElement | null;

  onProjectLoaded?: (() => void) | null;
  private openedFromStudio = false;

  constructor(canvasEngine: CanvasEngine, confirmModal: ConfirmModal) {
    this.canvasEngine = canvasEngine;
    this.confirmModal = confirmModal;
    this.currentProjectId = null;
    this.currentProjectTitle = 'Novo Cenário';

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
    this.btnHeaderSave = document.getElementById('btn-header-save');
    this.btnHeaderProjects = document.getElementById('btn-header-projects');

    this.setupEvents();
  }

  setupEvents(): void {
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

    // Header: Botão Projetos abre a Tela Exclusiva
    this.btnHeaderProjects?.addEventListener('click', () => {
      this.openProjectsScreen(true);
    });

    // Atalho Global Ctrl+S para Salvar Rápido
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.quickSave();
      }
    });
  }

  // ========================================================
  // RASTREAMENTO DE ALTERAÇÕES (DIRTY STATE)
  // ========================================================
  getSceneSnapshot(): string {
    return JSON.stringify({
      elements: this.canvasEngine.getSceneElements(),
      wall: this.canvasEngine.wallTextureUrl || '',
      floor: this.canvasEngine.floorTextureUrl || '',
      bg: this.canvasEngine.bgImageUrl || ''
    });
  }

  markClean(): void {
    this.lastSavedSnapshot = this.getSceneSnapshot();
  }

  hasUnsavedChanges(): boolean {
    const elements = this.canvasEngine.getSceneElements();
    if (!this.lastSavedSnapshot) {
      return elements.length > 0;
    }
    const current = this.getSceneSnapshot();
    return current !== this.lastSavedSnapshot;
  }

  // ========================================================
  // TELA EXCLUSIVA DE PROJETOS SALVOS
  // ========================================================
  async openProjectsScreen(fromStudio = false): Promise<void> {
    this.openedFromStudio = fromStudio;
    await this.renderProjectsGrid();

    // Se estiver na Home, oculta a Home temporariamente
    const homeEl = document.getElementById('home-screen');
    if (homeEl && !fromStudio) {
      homeEl.classList.add('hidden');
    }

    this.projectsScreenEl?.classList.remove('hidden');
  }

  closeProjectsScreen(): void {
    this.projectsScreenEl?.classList.add('hidden');

    // Se veio do menu inicial, restaura a exibição do menu inicial
    if (!this.openedFromStudio) {
      const homeEl = document.getElementById('home-screen');
      homeEl?.classList.remove('hidden');
    }
  }

  // Compatibilidade com chamadas diretas
  open(): void {
    this.openProjectsScreen(false);
  }

  close(): void {
    this.closeProjectsScreen();
    this.closeSaveModal(false);
  }

  async renderProjectsGrid(): Promise<void> {
    if (!this.projectsGridEl) return;
    const projects = await getAllProjects();
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
          <p class="projects-empty-desc">Crie decorações exclusivas no estúdio e salve para acessá-las quando quiser.</p>
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

      card.innerHTML = `
        <div class="project-card-thumb-wrap">
          <img src="${proj.thumbnailUrl || ''}" alt="${proj.title}" class="project-card-thumb" />
          ${isCurrentActive ? '<span class="project-badge-active">Ativo</span>' : ''}
        </div>
        <div class="project-card-info">
          <h3 class="project-card-title">${proj.title}</h3>
          <div class="project-card-meta">
            <span>${proj.elements?.length || 0} peças</span>
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
            <button class="btn-proj-delete" data-proj-id="${proj.id}" title="Excluir este cenário">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      // Ação Abrir Cenário com Verificação Segura de Salvamento
      card.querySelector('.btn-proj-open')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.handleOpenProject(proj);
      });

      // Ação Excluir Cenário com Modal Elegante de Confirmação
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
    if (this.currentProjectId === proj.id) {
      this.closeProjectsScreen();
      return;
    }

    if (this.hasUnsavedChanges()) {
      const choice = await this.confirmModal.promptUnsaved({
        title: 'Abrir Outro Cenário',
        message: `Você possui alterações não salvas no cenário atual. Deseja salvar antes de abrir "${proj.title}"?`,
        saveLabel: 'Salvar e Abrir',
        discardLabel: 'Descartar e Abrir',
        cancelLabel: 'Cancelar'
      });

      if (choice === 'cancel') return;

      if (choice === 'save') {
        const saved = await this.quickSave();
        if (!saved) return;
      }
    }

    await this.loadProject(proj);
  }

  async loadProject(proj: ProjectData): Promise<void> {
    await this.canvasEngine.loadSceneElements(proj.elements || []);

    if (proj.bgImageUrl) {
      await this.canvasEngine.setEnvironmentScenario(proj.bgImageUrl);
    } else {
      const wall = proj.wallTextureUrl || proj.wallTexture;
      const floor = proj.floorTextureUrl || proj.floorTexture;
      if (wall || floor) {
        await this.canvasEngine.setEnvironmentTextures(wall || null, floor || null);
      }
    }

    this.currentProjectId = proj.id;
    this.currentProjectTitle = proj.title;

    if (this.titleDisplay) {
      this.titleDisplay.textContent = proj.title;
    }
    if (this.titleInput) {
      this.titleInput.value = proj.title;
    }

    this.canvasEngine.saveSnapshot();
    this.markClean();
    this.closeProjectsScreen();
    this.onProjectLoaded?.();
    this.canvasEngine.fitToView();
  }

  // Iniciar Novo Cenário com Verificação Prévia de Salvamento
  async createNewProject(): Promise<void> {
    if (this.hasUnsavedChanges()) {
      const choice = await this.confirmModal.promptUnsaved({
        title: 'Criar Novo Cenário',
        message: 'Você possui alterações não salvas no cenário atual. Deseja salvar antes de iniciar um novo?',
        saveLabel: 'Salvar e Criar Novo',
        discardLabel: 'Descartar e Criar Novo',
        cancelLabel: 'Cancelar'
      });

      if (choice === 'cancel') return;

      if (choice === 'save') {
        const saved = await this.quickSave();
        if (!saved) return;
      }
    }

    this.executeNewProject();
  }

  executeNewProject(): void {
    this.canvasEngine.clearScene();
    this.currentProjectId = null;
    this.currentProjectTitle = 'Novo Cenário';

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
  // MODAL DE SALVAR CENÁRIO NO ESTÚDIO
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

  // Salvar Rápido (acionado pelo botão Salvar do Header ou Ctrl+S)
  async quickSave(): Promise<boolean> {
    const elements = this.canvasEngine.getSceneElements();

    if (elements.length === 0) {
      alert('Adicione ao menos uma peça no cenário antes de salvar.');
      return false;
    }

    // Se o projeto ainda não tem nome/ID, abre o modal para o usuário nomear
    if (!this.currentProjectId) {
      return await this.openSaveModal();
    }

    // Se já tem ID ativo, atualiza o projeto sem criar duplicatas
    const thumb = this.canvasEngine.exportHDImage();

    await saveProject({
      id: this.currentProjectId,
      title: this.currentProjectTitle,
      elements: elements,
      wallTexture: this.canvasEngine.wallTextureUrl,
      floorTexture: this.canvasEngine.floorTextureUrl,
      bgImageUrl: this.canvasEngine.bgImageUrl || undefined,
      thumbnailUrl: thumb
    });

    this.markClean();
    this.showSaveFeedback();
    return true;
  }

  // Salvar a partir do campo de texto do modal (permite nomear ou renomear)
  async saveFromModal(): Promise<boolean> {
    const title = this.titleInput?.value.trim() || this.currentProjectTitle || 'Minha Decoração';
    const elements = this.canvasEngine.getSceneElements();

    if (elements.length === 0) {
      alert('Adicione ao menos uma peça no cenário antes de salvar.');
      return false;
    }

    const thumb = this.canvasEngine.exportHDImage();

    const saved = await saveProject({
      id: this.currentProjectId || undefined,
      title: title,
      elements: elements,
      wallTexture: this.canvasEngine.wallTextureUrl,
      floorTexture: this.canvasEngine.floorTextureUrl,
      bgImageUrl: this.canvasEngine.bgImageUrl || undefined,
      thumbnailUrl: thumb
    });

    this.currentProjectId = saved.id;
    this.currentProjectTitle = saved.title;

    if (this.titleDisplay) {
      this.titleDisplay.textContent = saved.title;
    }

    this.markClean();
    this.showSaveFeedback();
    this.closeSaveModal(true);
    return true;
  }

  // Feedback visual discreto e elegante de "Salvo!"
  showSaveFeedback(): void {
    if (this.btnHeaderSave) {
      const originalHtml = this.btnHeaderSave.innerHTML;
      this.btnHeaderSave.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span class="header-btn-label">Salvo!</span>
      `;
      this.btnHeaderSave.classList.add('btn-header-save-success');

      setTimeout(() => {
        if (this.btnHeaderSave) {
          this.btnHeaderSave.innerHTML = originalHtml;
          this.btnHeaderSave.classList.remove('btn-header-save-success');
        }
      }, 1800);
    }
  }
}
