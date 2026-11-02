// Gerenciador Central de Telas e Navegação Exclusiva (View State Machine)
// Garante que NUNCA haja telas empilhadas ou rodando em plano de fundo.

export type AppScreen = 'home' | 'scenario' | 'balloon-studio' | 'projects';

export interface ScreenManagerDelegate {
  onBeforeExitScreen?: (fromScreen: AppScreen, toScreen: AppScreen) => Promise<boolean>;
  onScreenChange?: (newScreen: AppScreen, oldScreen: AppScreen) => void;
}

export class ScreenManager {
  private currentScreen: AppScreen = 'home';
  private delegate: ScreenManagerDelegate | null = null;
  private appShell: HTMLElement | null = null;

  constructor(delegate?: ScreenManagerDelegate) {
    this.delegate = delegate || null;
    this.appShell = document.querySelector('.app-shell');
    this.applyScreen('home');
  }

  setDelegate(delegate: ScreenManagerDelegate): void {
    this.delegate = delegate;
  }

  get activeScreen(): AppScreen {
    return this.currentScreen;
  }

  async navigateTo(target: AppScreen): Promise<boolean> {
    if (this.currentScreen === target) return true;

    if (this.delegate?.onBeforeExitScreen) {
      const canExit = await this.delegate.onBeforeExitScreen(this.currentScreen, target);
      if (!canExit) return false;
    }

    const oldScreen = this.currentScreen;
    this.currentScreen = target;
    this.applyScreen(target);

    this.delegate?.onScreenChange?.(target, oldScreen);
    return true;
  }

  // Aplicação forçada sem prompt (usada após salvar/descartar)
  forceNavigateTo(target: AppScreen): void {
    const oldScreen = this.currentScreen;
    this.currentScreen = target;
    this.applyScreen(target);
    this.delegate?.onScreenChange?.(target, oldScreen);
  }

  private applyScreen(screen: AppScreen): void {
    if (!this.appShell) {
      this.appShell = document.querySelector('.app-shell');
    }
    if (this.appShell) {
      this.appShell.setAttribute('data-screen', screen);
    }

    document.body.classList.toggle('screen-balloon-studio', screen === 'balloon-studio');
    document.body.classList.toggle('screen-scenario', screen === 'scenario');
    document.body.classList.toggle('screen-home', screen === 'home');
    document.body.classList.toggle('screen-projects', screen === 'projects');

    // Despacha evento de redimensionamento para o Konva se entrar em scenario
    if (screen === 'scenario') {
      window.dispatchEvent(new Event('resize'));
    }
  }
}

