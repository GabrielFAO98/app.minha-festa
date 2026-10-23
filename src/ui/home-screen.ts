// Menu Inicial (Home Screen) e Controlador de Splash Screen
export interface HomeScreenCallbacks {
  onNewScene: () => Promise<void> | void;
  onOpenProjects: () => void;
  onBeforeExitToHome?: () => Promise<boolean>;
}

export class HomeScreen {
  homeEl: HTMLElement | null;
  cardNewScene: HTMLElement | null;
  cardSavedProjects: HTMLElement | null;
  btnHeaderHome: HTMLElement | null;
  brandHeaderClick: HTMLElement | null;

  private isVisible = true;
  private callbacks: HomeScreenCallbacks;

  constructor(callbacks: HomeScreenCallbacks) {
    this.callbacks = callbacks;
    this.homeEl = document.getElementById('home-screen');
    this.cardNewScene = document.getElementById('card-new-scene');
    this.cardSavedProjects = document.getElementById('card-saved-projects');
    this.btnHeaderHome = document.getElementById('btn-header-home');
    this.brandHeaderClick = document.getElementById('brand-header-click');

    this.setupEvents();
  }

  private setupEvents(): void {
    // 1. Card: Novo Cenário
    this.cardNewScene?.addEventListener('click', async () => {
      await this.callbacks.onNewScene();
    });

    // 2. Card: Projetos Salvos
    this.cardSavedProjects?.addEventListener('click', () => {
      this.callbacks.onOpenProjects();
    });

    // 3. Botão no Header para retornar ao Início
    this.btnHeaderHome?.addEventListener('click', async () => {
      await this.requestReturnToHome();
    });

    // 4. Clique na marca do app no header para retornar ao Início
    this.brandHeaderClick?.addEventListener('click', async () => {
      await this.requestReturnToHome();
    });

    // Acessibilidade via teclado (Enter / Space nos cards)
    [this.cardNewScene, this.cardSavedProjects].forEach((card) => {
      card?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (card as HTMLElement).click();
        }
      });
    });
  }

  async requestReturnToHome(): Promise<boolean> {
    if (this.callbacks.onBeforeExitToHome) {
      const allowed = await this.callbacks.onBeforeExitToHome();
      if (!allowed) return false;
    }
    this.show();
    return true;
  }

  show(): void {
    if (!this.homeEl) return;
    const projScreen = document.getElementById('projects-screen');
    projScreen?.classList.add('hidden');
    this.isVisible = true;
    this.homeEl.classList.remove('hidden');
  }

  hide(): void {
    if (!this.homeEl) return;
    this.isVisible = false;
    this.homeEl.classList.add('hidden');
  }

  get active(): boolean {
    return this.isVisible;
  }

  // Desativa suavemente a Splash Screen de carregamento
  static dismissSplashScreen(minDurationMs = 600, startTime = Date.now()): void {
    const splashEl = document.getElementById('app-splash-screen');
    if (!splashEl) return;

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDurationMs - elapsed);

    setTimeout(() => {
      splashEl.classList.add('fade-out');
      setTimeout(() => {
        splashEl.remove();
      }, 420);
    }, remaining);
  }
}
