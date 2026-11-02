// Modal de Saída com Opção de Renomeação e Confirmação de Salvamento Automático
// Singleton com Z-Index prioritário (100000) e suporte total a Mobile Touch

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
  private btnSave: HTMLElement | null = null;
  private btnKeep: HTMLElement | null = null;
  private btnCancel: HTMLElement | null = null;
  private btnClose: HTMLElement | null = null;

  private resolvePromise: ((result: RenameResult) => void) | null = null;
  private currentTitle = '';

  constructor() {
    this.ensureDOM();
  }

  private ensureDOM(): void {
    let el = document.getElementById('rename-modal');
    if (el) {
      el.remove(); // Garante recriação limpa sem duplicação de ouvintes
    }

    el = document.createElement('div');
    el.id = 'rename-modal';
    el.className = 'modal-backdrop';
    el.style.cssText = 'position: fixed; inset: 0; z-index: 100000 !important; background-color: rgba(0, 0, 0, 0.65); display: none; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);';
    el.innerHTML = `
      <div class="modal-container" style="width: 100%; max-width: 440px; background: #FFFFFF; border-top-left-radius: 20px; border-top-right-radius: 20px; box-shadow: 0 -10px 40px rgba(0,0,0,0.25); overflow: hidden; animation: slideUpModal 0.22s cubic-bezier(0.16, 1, 0.3, 1);">
        <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 14px; border-bottom: 1px solid #F0ECE6;">
          <div class="modal-title" id="rename-modal-title" style="font-size: 16px; font-weight: 700; color: #1C1917;">Projeto Salvo</div>
          <button type="button" id="btn-close-rename-modal" class="modal-close-btn" aria-label="Fechar" style="background: none; border: none; padding: 6px; cursor: pointer; color: #78716C; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body" style="padding: 20px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(181, 137, 56, 0.15); display: flex; align-items: center; justify-content: center; color: #B58938; flex-shrink: 0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <p id="rename-modal-message" style="margin: 0; font-size: 13.5px; font-weight: 500; line-height: 1.45; color: #1C1917;">
              Seu projeto foi salvo automaticamente. Gostaria de renomear?
            </p>
          </div>

          <div style="margin: 16px 0 22px 0;">
            <label for="rename-modal-input" style="display: block; font-size: 11px; font-weight: 700; color: #78716C; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
              Nome do Projeto
            </label>
            <input type="text" id="rename-modal-input" class="input-modern" style="width: 100%; height: 46px; font-size: 14.5px; font-weight: 600; padding: 0 14px; border-radius: 12px; border: 1.5px solid #E6E1DA; background: #FAF8F5; color: #1C1917; box-sizing: border-box; outline: none;" placeholder="Ex: Festa da Laura" />
          </div>

          <div class="confirm-actions-stack" style="display: flex; flex-direction: column; gap: 8px;">
            <button type="button" id="btn-rename-save" class="btn-primary" style="width: 100%; height: 46px; min-height: 44px; justify-content: center; font-weight: 700; font-size: 13.5px; gap: 8px; border-radius: 12px; cursor: pointer; touch-action: manipulation;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>Salvar Nome e Sair</span>
            </button>
            <button type="button" id="btn-rename-keep" class="btn-secondary" style="width: 100%; height: 44px; min-height: 44px; justify-content: center; font-weight: 600; font-size: 13px; border-radius: 12px; cursor: pointer; touch-action: manipulation; background: #FAF8F5; border: 1px solid #E6E1DA; color: #44403C;">
              Manter Nome e Sair
            </button>
            <button type="button" id="btn-rename-cancel" class="btn-ghost" style="width: 100%; height: 42px; min-height: 44px; justify-content: center; color: #78716C; font-weight: 600; font-size: 13px; cursor: pointer; touch-action: manipulation; background: transparent; border: none;">
              Continuar Editando
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);

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
    const handleSave = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      const val = this.inputEl?.value.trim() || this.currentTitle;
      this.finish({ action: 'rename', title: val });
    };

    const handleKeep = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      this.finish({ action: 'keep', title: this.currentTitle });
    };

    const handleCancel = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      this.finish({ action: 'cancel', title: this.currentTitle });
    };

    this.btnSave?.addEventListener('click', handleSave);
    this.btnKeep?.addEventListener('click', handleKeep);
    this.btnCancel?.addEventListener('click', handleCancel);
    this.btnClose?.addEventListener('click', handleCancel);

    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        handleCancel(e);
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
        // ATENÇÃO: NÃO chamar focus() nem select() aqui para não subir o teclado virtual no mobile!
        this.inputEl.blur();
      }

      if (this.modalEl) {
        this.modalEl.style.display = 'flex';
        this.modalEl.classList.add('open');
      }
    });
  }

  private finish(result: RenameResult): void {
    if (this.modalEl) {
      this.modalEl.style.display = 'none';
      this.modalEl.classList.remove('open');
    }

    if (this.inputEl) {
      this.inputEl.blur();
    }

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
    return Boolean(this.modalEl && this.modalEl.style.display === 'flex');
  }
}

// Instância Singleton compartilhada em todo o app
export const renameModal = new RenameModal();
