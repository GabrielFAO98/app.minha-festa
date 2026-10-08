// Modal Elegante de Confirmação para Ações Críticas (Exclusão Segura)

export class ConfirmModal {
  constructor() {
    this.modalEl = document.getElementById('confirm-modal');
    this.messageEl = document.getElementById('confirm-modal-message');
    this.btnCancel = document.getElementById('btn-confirm-cancel');
    this.btnConfirm = document.getElementById('btn-confirm-ok');
    this.resolvePromise = null;

    this.setupEvents();
  }

  setupEvents() {
    this.btnCancel?.addEventListener('click', () => {
      this.close(false);
    });

    this.btnConfirm?.addEventListener('click', () => {
      this.close(true);
    });

    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close(false);
      }
    });
  }

  ask(title, message) {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;

      const titleEl = document.getElementById('confirm-modal-title');
      if (titleEl) titleEl.textContent = title || 'Confirmar Ação';
      if (this.messageEl) this.messageEl.innerHTML = message || 'Tem certeza que deseja continuar?';

      this.modalEl?.classList.add('open');
    });
  }

  close(result) {
    this.modalEl?.classList.remove('open');
    if (this.resolvePromise) {
      this.resolvePromise(result);
      this.resolvePromise = null;
    }
  }
}

