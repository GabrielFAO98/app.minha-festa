import { getAllProjects, saveProject, deleteProject } from '../core/db.js';

export class ProjectsModal {
  constructor(canvasEngine) {
    this.canvasEngine = canvasEngine;
    this.currentProjectId = null;
    this.modalEl = document.getElementById('projects-modal');
    this.titleInput = document.getElementById('project-save-title');
    this.btnSave = document.getElementById('btn-save-project-action');
    this.projectsListEl = document.getElementById('saved-projects-list');
    this.btnClose = document.getElementById('btn-close-projects-modal');

    this.setupEvents();
  }

  setupEvents() {
    this.btnClose?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.btnSave?.addEventListener('click', async () => {
      const title = this.titleInput?.value.trim() || 'Minha Decoração';
      const elements = this.canvasEngine.getSceneElements();

      if (elements.length === 0) {
        alert('Adicione ao menos uma peça no cenário antes de salvar.');
        return;
      }

      // Thumbnail rápida gerada do canvas
      const thumb = this.canvasEngine.exportHDImage();

      const saved = await saveProject({
        id: this.currentProjectId,
        title: title,
        elements: elements,
        thumbnailUrl: thumb
      });

      this.currentProjectId = saved.id;
      const titleDisplay = document.getElementById('project-title-display');
      if (titleDisplay) {
        titleDisplay.textContent = title;
      }

      alert('Projeto salvo com sucesso!');
      await this.loadProjectsList();
    });
  }

  async open() {
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

    if (projects.length === 0) {
      this.projectsListEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📂</div>
          <div class="empty-state-text">Nenhum projeto salvo ainda. Salve seu primeiro cenário acima!</div>
        </div>
      `;
      return;
    }

    projects.forEach((proj) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.style.flexDirection = 'row';
      card.style.gap = '12px';
      card.style.textAlign = 'left';
      card.style.padding = '10px';

      const dateStr = new Date(proj.updatedAt).toLocaleDateString('pt-BR');

      card.innerHTML = `
        <div style="width: 70px; height: 60px; border-radius: 8px; overflow: hidden; background: #000; flex-shrink: 0;">
          <img src="${proj.thumbnailUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${proj.title}"/>
        </div>
        <div style="flex: 1; overflow: hidden;">
          <div style="font-weight: 700; font-size: 0.85rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${proj.title}</div>
          <div style="font-size: 0.72rem; color: #94a3b8;">${proj.elements?.length || 0} peças • ${dateStr}</div>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            <button class="btn-load-proj" style="padding: 3px 10px; font-size: 0.72rem; border-radius: 6px; background: #ec4899; color: #fff; font-weight: 600;">Abrir</button>
            <button class="btn-del-proj" style="padding: 3px 10px; font-size: 0.72rem; border-radius: 6px; background: rgba(239, 68, 68, 0.2); color: #fca5a5;">Excluir</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-load-proj')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.canvasEngine.loadSceneElements(proj.elements);
        this.currentProjectId = proj.id;
        const titleDisplay = document.getElementById('project-title-display');
        if (titleDisplay) {
          titleDisplay.textContent = proj.title;
        }
        this.close();
      });

      card.querySelector('.btn-del-proj')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Deseja excluir o projeto "${proj.title}"?`)) {
          await deleteProject(proj.id);
          await this.loadProjectsList();
        }
      });

      this.projectsListEl.appendChild(card);
    });
  }
}

