// Modal Elegante de Confirmação para Ações Críticas e Salvamento Seguro

export type UnsavedChoice = 'save' | 'discard' | 'cancel';

export interface UnsavedPromptOptions {
  title?: string;
  message?: string;
  saveLabel?: string;
  discardLabel?: string;
  cancelLabel?: string;
}

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export class ConfirmModal {
  modalEl: HTMLElement | null;
  titleEl: HTMLElement | null;
  messageEl: HTMLElement | null;
  btnClose: HTMLElement | null;
  btnSave: HTMLElement | null;
  btnDiscard: HTMLElement | null;
  btnCancel: HTMLElement | null;

  private resolveChoice: ((choice: UnsavedChoice) => void) | null = null;
  private resolveBoolean: ((confirmed: boolean) => void) | null = null;

  constructor() {
    this.modalEl = document.getElementById('confirm-modal');
    this.titleEl = document.getElementById('confirm-modal-title');
    this.messageEl = document.getElementById('confirm-modal-message');
    this.btnClose = document.getElementById('btn-close-confirm-modal');
    this.btnSave = document.getElementById('btn-confirm-save');
    this.btnDiscard = document.getElementById('btn-confirm-discard');
    this.btnCancel = document.getElementById('btn-confirm-cancel');

    this.setupEvents();
  }

  private setupEvents(): void {
    this.btnSave?.addEventListener('click', () => {
      this.finishChoice('save');
    });

    this.btnDiscard?.addEventListener('click', () => {
      this.finishChoice('discard');
    });

    this.btnCancel?.addEventListener('click', () => {
      this.finishChoice('cancel');
    });

    this.btnClose?.addEventListener('click', () => {
      this.finishChoice('cancel');
    });

    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.finishChoice('cancel');
      }
    });
  }

  promptUnsaved(options: UnsavedPromptOptions): Promise<UnsavedChoice> {
    return new Promise((resolve) => {
      this.resolveChoice = resolve;
      this.resolveBoolean = null;

      if (this.titleEl) this.titleEl.textContent = options.title || 'Salvar Alterações';
      if (this.messageEl) this.messageEl.textContent = options.message || 'Você possui alterações não salvas. Deseja salvar antes de continuar?';

      if (this.btnSave) {
        this.btnSave.style.display = 'inline-flex';
        const span = this.btnSave.querySelector('span');
        if (span) span.textContent = options.saveLabel || 'Salvar e Continuar';
        else this.btnSave.textContent = options.saveLabel || 'Salvar e Continuar';
        this.btnSave.classList.remove('btn-danger');
      }
      if (this.btnDiscard) {
        this.btnDiscard.style.display = 'inline-flex';
        this.btnDiscard.textContent = options.discardLabel || 'Descartar Alterações';
      }
      if (this.btnCancel) {
        this.btnCancel.style.display = 'inline-flex';
        this.btnCancel.textContent = options.cancelLabel || 'Cancelar';
      }

      this.modalEl?.classList.add('open');
    });
  }

  ask(titleOrOptions?: string | ConfirmOptions, maybeMessage?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveBoolean = resolve;
      this.resolveChoice = null;

      const opts: ConfirmOptions = typeof titleOrOptions === 'object' && titleOrOptions !== null
        ? titleOrOptions
        : {
            title: typeof titleOrOptions === 'string' ? titleOrOptions : 'Confirmar Ação',
            message: maybeMessage || 'Tem certeza que deseja continuar?'
          };

      if (this.titleEl) this.titleEl.textContent = opts.title || 'Confirmar Ação';
      if (this.messageEl) this.messageEl.textContent = opts.message || 'Tem certeza que deseja continuar?';

      if (this.btnSave) {
        this.btnSave.style.display = 'inline-flex';
        const span = this.btnSave.querySelector('span');
        if (span) span.textContent = opts.confirmLabel || 'Confirmar';
        else this.btnSave.textContent = opts.confirmLabel || 'Confirmar';

        if (opts.danger) {
          this.btnSave.classList.add('btn-danger');
        } else {
          this.btnSave.classList.remove('btn-danger');
        }
      }
      if (this.btnDiscard) {
        this.btnDiscard.style.display = 'none';
      }
      if (this.btnCancel) {
        this.btnCancel.style.display = 'inline-flex';
        this.btnCancel.textContent = opts.cancelLabel || 'Cancelar';
      }

      this.modalEl?.classList.add('open');
    });
  }

  private finishChoice(choice: UnsavedChoice): void {
    this.modalEl?.classList.remove('open');
    if (this.btnSave) this.btnSave.classList.remove('btn-danger');

    if (this.resolveChoice) {
      this.resolveChoice(choice);
      this.resolveChoice = null;
    }
    if (this.resolveBoolean) {
      this.resolveBoolean(choice === 'save');
      this.resolveBoolean = null;
    }
  }

  close(): void {
    this.finishChoice('cancel');
  }

  get isOpen(): boolean {
    return this.modalEl?.classList.contains('open') || false;
  }
}
