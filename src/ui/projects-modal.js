// Gerenciador de Projetos e Cenrios com Salvar Inteligente e Sem Duplicao
import { getAllProjects, saveProject, deleteProject } from '../core/db.js';

export class ProjectsModal {
  constructor(canvasEngine) {
    this.canvasEngine = canvasEngine;
    this.currentProjectId = null;
    this.currentProjectTitle = 'Novo Cenrio';

    this.modalEl = document.getElementById('projects-modal');
    this.titleInput = document.getElementById('project-save-title');
    this.btnSave = document.getElementById('btn-save-project-action');
    this.btnNewProject = document.getElementById('btn-new-project-action');
    this.projectsListEl = document.getElementById('saved-projects-list');
    this.countBadge = document.getElementById('projects-count-badge');
    this.btnClose = document.getElementById('btn-close-projects-modal');
    this.titleDisplay = document.getElementById('project-title-display');
    this.btnHeaderSave = document.getElementById('btn-header-save');

    this.setupEvents();
  }

  setupEvents() {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Salvar no Modal
    this.btnSave?.addEventListener('click', async () => {
      await this.saveFromModal();
    });

    // Iniciar Novo Cenrio do Zero
    this.btnNewProject?.addEventListener('click', () => {
      this.createNewProject();
    });

    // Atalho Global Ctrl+S para Salvar Rpido
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.quickSave();
      }
    });
  }

  // Salvar Rpido (acionado pelo boto do Header ou Ctrl+S)
  async quickSave() {
    const elements = this.canvasEngine.getSceneElements();

    if (elements.length === 0) {
      alert('Adicione ao menos uma pea no cenrio antes de salvar.');
      return;
    }

    // Se o projeto ainda no tem nome/ID, abre o modal para o usurio nomear
    if (!this.currentProjectId) {
      this.open();
      setTimeout(() => this.titleInput?.focus(), 150);
      return;
    }

    // Se j tem ID ativo, atualiza exatamente o mesmo projeto sem criar duplicatas!
    const thumb = this.canvasEngine.exportHDImage();

    await saveProject({
      id: this.currentProjectId,
      title: this.currentProjectTitle,
      elements: elements,
      wallTexture: this.canvasEngine.wallTextureUrl,
      floorTexture: this.canvasEngine.floorTextureUrl,
      thumbnailUrl: thumb
    });

    this.showSaveFeedback();
  }

  // Salvar a partir do campo de texto do modal (permite nomear ou renomear)
  async saveFromModal() {
    const title = this.titleInput?.value.trim() || this.currentProjectTitle || 'Minha Decorao';
    const elements = this.canvasEngine.getSceneElements();

    if (elements.length === 0) {
      alert('Adicione ao menos uma pea no cenrio antes de salvar.');
      return;
    }

    const thumb = this.canvasEngine.exportHDImage();

    const saved = await saveProject({
      id: this.currentProjectId, // Se j tiver ID, atualiza o mesmo projeto!
      title: title,
      elements: elements,
      wallTexture: this.canvasEngine.wallTextureUrl,
      floorTexture: this.canvasEngine.floorTextureUrl,
      thumbnailUrl: thumb
    });

    this.currentProjectId = saved.id;
    this.currentProjectTitle = saved.title;

    if (this.titleDisplay) {
      this.titleDisplay.textContent = saved.title;
    }

    this.showSaveFeedback();
    await this.loadProjectsList();
    this.close();
  }

  // Iniciar Novo Cenrio Limpo
  createNewProject() {
    const elements = this.canvasEngine.getSceneElements();
    if (elements.length > 0) {
      if (!confirm('Deseja iniciar um novo cenrio do zero? O cenrio atual ser limpo.')) {
        return;
      }
    }

    this.canvasEngine.clearScene();
    this.currentProjectId = null;
    this.currentProjectTitle = 'Novo Cenrio';

    if (this.titleDisplay) {
      this.titleDisplay.textContent = 'Novo Cenrio';
    }
    if (this.titleInput) {
      this.titleInput.value = '';
    }

    this.close();
  }

  // Feedback visual discreto e elegante de "Salvo!"
  showSaveFeedback() {
    if (this.btnHeaderSave) {
      const originalHtml = this.btnHeaderSave.innerHTML;
      this.btnHeaderSave.innerHTML = '✓ <span>Salvo!</span>';
      this.btnHeaderSave.classList.add('btn-header-save-success');

      setTimeout(() => {
        this.btnHeaderSave.innerHTML = originalHtml;
        this.btnHeaderSave.classList.remove('btn-header-save-success');
      }, 1800);
    }
  }

  async open() {
    if (this.titleInput) {
      this.titleInput.value = this.currentProjectId ? this.currentProjectTitle : '';
    }
    await this.loadProjectsList();
    this.modalEl?.classList.add('open');
  }

  close() {
    this.modalEl?.classList.remove('open');
  }

  async loadProjectsList() {
    if (!this.projectsListEl) return;
    const projects = await getAllProjects();
    this.projectsListEl.innerHTML = '';

    if (this.countBadge) {
      this.countBadge.textContent = `${projects.length}`;
    }

    if (projects.length === 0) {
      this.projectsListEl.innerHTML = `
        <div class="empty-state" style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
          <div style="font-size: 1.8rem; margin-bottom: 6px;">📁</div>
          <div>Nenhum cenrio salvo ainda no dispositivo.</div>
        </div>
      `;
      return;
    }

    projects.forEach((proj) => {
      const card = document.createElement('div');
      card.className = 'layer-row-item';
      card.style.padding = '8px';
      card.style.gap = '10px';

      const isCurrentActive = proj.id === this.currentProjectId;
      if (isCurrentActive) {
        card.style.borderColor = 'var(--primary)';
        card.style.background = 'rgba(236, 72, 153, 0.1)';
      }

      const dateStr = new Date(proj.updatedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      card.innerHTML = `
        <div style="width: 54px; height: 54px; border-radius: 6px; overflow: hidden; background: #000; flex-shrink: 0; border: 1px solid var(--border-subtle);">
          <img src="${proj.thumbnailUrl || ''}" style="width: 100%; height: 100%; object-fit: cover;" alt="${proj.title}" />
        </div>
        <div style="flex: 1; overflow: hidden;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; font-size: 0.82rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${proj.title}</span>
            ${isCurrentActive ? '<span style="font-size: 0.62rem; color: #4ade80; font-weight: 700; background: rgba(34, 197, 94, 0.15); padding: 1px 6px; border-radius: 10px;">Ativo</span>' : ''}
          </div>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">${proj.elements?.length || 0} peas • ${dateStr}</div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <button class="btn-load-proj btn-primary" style="height: 24px; padding: 0 10px; font-size: 0.68rem; border-radius: 4px;">Abrir</button>
            <button class="btn-del-proj btn-secondary" style="height: 24px; padding: 0 8px; font-size: 0.68rem; border-radius: 4px; color: #f87171;">Excluir</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-load-proj')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.loadProject(proj);
      });

      card.querySelector('.btn-del-proj')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Deseja excluir o cenrio "${proj.title}"?`)) {
          if (this.currentProjectId === proj.id) {
            this.currentProjectId = null;
            this.currentProjectTitle = 'Novo Cenrio';
            if (this.titleDisplay) this.titleDisplay.textContent = 'Novo Cenrio';
          }
          await deleteProject(proj.id);
          await this.loadProjectsList();
        }
      });

      this.projectsListEl.appendChild(card);
    });
  }

  async loadProject(proj) {
    await this.canvasEngine.loadSceneElements(proj.elements || []);

    if (proj.wallTexture || proj.floorTexture) {
      await this.canvasEngine.setEnvironmentTextures(proj.wallTexture, proj.floorTexture);
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
    this.close();
  }
}
