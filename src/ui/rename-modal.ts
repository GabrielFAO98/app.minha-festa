// Modal de Saída com Opção de Renomeação e Confirmação de Salvamento Automático

export type RenameAction = 'rename' | 'keep' | 'cancel';

export interface RenameResult {
  action: RenameAction;
  title: string;
}

export interface RenamePromptOptions {
  title?: string;
  message?: string;
  currentTitle: string;
  itemType?: 'cenário' | 'arranjo';
}

export class RenameModal {
  private modalEl: HTMLElement | null = null;
  private titleEl: HTMLElement | null = null;
  private messageEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private btnSave: HTMLButtonElement | null = null;
  private btnKeep: HTMLButtonElement | null = null;
  private btnCancel: HTMLButtonElement | null = null;
  private btnClose: HTMLButtonElement | null = null;

  private resolvePromise: ((result: RenameResult) => void) | null = null;
  private currentTitle = '';

  constructor() {
    this.ensureDOM();
  }

  private ensureDOM(): void {
    let el = document.getElementById('rename-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'rename-modal';
      el.className = 'modal-backdrop';
      el.innerHTML = `
        <div class="modal-container" style="max-width: 440px;">
          <div class="modal-header">
            <div class="modal-title" id="rename-modal-title">Projeto Salvo</div>
            <button id="btn-close-rename-modal" class="modal-close-btn" aria-label="Fechar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="modal-body" style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(181, 137, 56, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary, #B58938); flex-shrink: 0;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <p id="rename-modal-message" class="confirm-modal-text" style="margin: 0; font-size: 13.5px; font-weight: 500; line-height: 1.4; color: var(--text-main, #1C1917);">
                Seu projeto foi salvo automaticamente. Gostaria de renomear?
              </p>
            </div>

            <div style="margin: 16px 0 20px 0;">
              <label for="rename-modal-input" style="display: block; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                Nome do Projeto
              </label>
              <input type="text" id="rename-modal-input" class="input-modern" style="width: 100%; height: 44px; font-size: 14px; font-weight: 600; padding: 0 14px; border-radius: 10px; box-sizing: border-box;" placeholder="Ex: Festa da Laura" />
            </div>

            <div class="confirm-actions-stack" style="display: flex; flex-direction: column; gap: 8px;">
              <button type="button" id="btn-rename-save" class="btn-primary" style="width: 100%; height: 44px; justify-content: center; font-weight: 700; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                <span>Salvar Nome e Sair</span>
              </button>
              <button type="button" id="btn-rename-keep" class="btn-secondary" style="width: 100%; height: 42px; justify-content: center; font-weight: 600;">
                Manter Nome e Sair
              </button>
              <button type="button" id="btn-rename-cancel" class="btn-ghost" style="width: 100%; height: 40px; justify-content: center; color: var(--text-muted); font-weight: 600;">
                Continuar Editando
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(el);
    }

    this.modalEl = el;
    this.titleEl = el.querySelector('#rename-modal-title');
    this.messageEl = el.querySelector('#rename-modal-message');
    this.inputEl = el.querySelector('#rename-modal-input');
    this.btnSave = el.querySelector('#btn-rename-save');
    this.btnKeep = el.querySelector('#btn-rename-keep');
    this.btnCancel = el.querySelector('#btn-rename-cancel');
    this.btnClose = el.querySelector('#btn-close-rename-modal');

    this.setupEvents();
  }

  private setupEvents(): void {
    this.btnSave?.addEventListener('click', () => {
      const val = this.inputEl?.value.trim() || this.currentTitle;
      this.finish({ action: 'rename', title: val });
    });

    this.btnKeep?.addEventListener('click', () => {
      this.finish({ action: 'keep', title: this.currentTitle });
    });

    this.btnCancel?.addEventListener('click', () => {
      this.finish({ action: 'cancel', title: this.currentTitle });
    });

    this.btnClose?.addEventListener('click', () => {
      this.finish({ action: 'cancel', title: this.currentTitle });
    });

    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.finish({ action: 'cancel', title: this.currentTitle });
      }
    });

    this.inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = this.inputEl?.value.trim() || this.currentTitle;
        this.finish({ action: 'rename', title: val });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.finish({ action: 'cancel', title: this.currentTitle });
      }
    });
  }

  prompt(options: RenamePromptOptions): Promise<RenameResult> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.currentTitle = options.currentTitle || (options.itemType === 'arranjo' ? 'Novo Arranjo' : 'Novo Cenário');

      const isArranjo = options.itemType === 'arranjo';
      const defaultHeaderTitle = isArranjo ? 'Arranjo Salvo' : 'Projeto Salvo';
      const defaultMsg = isArranjo
        ? 'Seu arranjo foi salvo automaticamente. Gostaria de renomear?'
        : 'Seu projeto foi salvo automaticamente. Gostaria de renomear?';

      if (this.titleEl) {
        this.titleEl.textContent = options.title || defaultHeaderTitle;
      }
      if (this.messageEl) {
        this.messageEl.textContent = options.message || defaultMsg;
      }
      if (this.inputEl) {
        this.inputEl.value = this.currentTitle;
      }

      this.modalEl?.classList.add('open');

      setTimeout(() => {
        if (this.inputEl) {
          this.inputEl.focus();
          this.inputEl.select();
        }
      }, 80);
    });
  }

  private finish(result: RenameResult): void {
    this.modalEl?.classList.remove('open');
    if (this.resolvePromise) {
      const res = this.resolvePromise;
      this.resolvePromise = null;
      res(result);
    }
  }

  close(): void {
    this.finish({ action: 'cancel', title: this.currentTitle });
  }

  get isOpen(): boolean {
    return this.modalEl?.classList.contains('open') || false;
  }
}

