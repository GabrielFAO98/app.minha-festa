// Icones canonicos inspirados no Canva para manipulacao de camadas
export const CANVA_LAYER_ICONS = {
  front: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 11 20 15 12 19 4 15"></polygon>
    <line x1="12" y1="17" x2="12" y2="4"></line>
    <polyline points="7.5 8 12 3.5 16.5 8"></polyline>
  </svg>`,
  back: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 7 20 11 12 15 4 11"></polygon>
    <line x1="12" y1="5" x2="12" y2="18"></line>
    <polyline points="7.5 14 12 18.5 16.5 14"></polyline>
  </svg>`,
  toFront: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 10 20 14 12 18 4 14"></polygon>
    <polyline points="4 18 12 22 20 18"></polyline>
    <line x1="12" y1="20" x2="12" y2="3"></line>
    <polyline points="7.5 7 12 2.5 16.5 7"></polyline>
  </svg>`,
  toBack: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 6 20 10 12 14 4 10"></polygon>
    <polyline points="4 14 12 18 20 14"></polyline>
    <line x1="12" y1="4" x2="12" y2="21"></line>
    <polyline points="7.5 17 12 21.5 16.5 17"></polyline>
  </svg>`,
  grip: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.8"/>
    <circle cx="15" cy="6" r="1.8"/>
    <circle cx="9" cy="12" r="1.8"/>
    <circle cx="15" cy="12" r="1.8"/>
    <circle cx="9" cy="18" r="1.8"/>
    <circle cx="15" cy="18" r="1.8"/>
  </svg>`
};

/**
 * Ativa ordenacao fluida por Drag and Drop na lista de camadas (funciona em Desktop e Mobile).
 * @param container Elemento container que abriga os .layer-row-item com data-instance-id
 * @param onReorder Callback disparado ao soltar o item com a nova lista de IDs (do topo para o fundo)
 */
export function setupLayersDragAndDrop(
  container: HTMLElement,
  onReorder: (newOrderInstanceIds: string[]) => void
): void {
  const rows = Array.from(container.querySelectorAll<HTMLElement>('.layer-row-item'));
  if (rows.length <= 1) return;

  let draggedRow: HTMLElement | null = null;
  let touchStartY = 0;
  let hasMoved = false;

  const getNewOrder = (): string[] => {
    const currentRows = Array.from(container.querySelectorAll<HTMLElement>('.layer-row-item'));
    return currentRows
      .map((r) => r.dataset.instanceId || '')
      .filter((id) => Boolean(id));
  };

  rows.forEach((row) => {
    const handle = row.querySelector<HTMLElement>('.layer-drag-handle') || row;

    // --- 1. DESKTOP: HTML5 Drag & Drop ---
    row.setAttribute('draggable', 'true');

    row.addEventListener('dragstart', (e) => {
      // Nao inicia arrasto se o clique foi em um botao de acao
      const target = e.target as HTMLElement;
      if (target.closest('button, .layer-mini-btn, .layer-action-btn')) {
        e.preventDefault();
        return;
      }

      draggedRow = row;
      row.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', row.dataset.instanceId || '');
      }
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggedRow || draggedRow === row) return;

      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      row.classList.remove('drag-over-top', 'drag-over-bottom');
      if (e.clientY < midY) {
        row.classList.add('drag-over-top');
      } else {
        row.classList.add('drag-over-bottom');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('drag-over-top', 'drag-over-bottom');
      if (!draggedRow || draggedRow === row) return;

      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      if (e.clientY < midY) {
        container.insertBefore(draggedRow, row);
      } else {
        container.insertBefore(draggedRow, row.nextSibling);
      }

      onReorder(getNewOrder());
    });

    row.addEventListener('dragend', () => {
      if (draggedRow) draggedRow.classList.remove('dragging');
      rows.forEach((r) => r.classList.remove('drag-over-top', 'drag-over-bottom'));
      draggedRow = null;
    });

    // --- 2. MOBILE: Touch Drag & Drop via Handle dedicado ---
    const touchTarget = row.querySelector<HTMLElement>('.layer-drag-handle') || row;

    touchTarget.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      draggedRow = row;
      touchStartY = e.touches[0].clientY;
      hasMoved = false;

      row.classList.add('touch-dragging');
    }, { passive: true });

    touchTarget.addEventListener('touchmove', (e) => {
      if (!draggedRow || draggedRow !== row || e.touches.length !== 1) return;
      if (e.cancelable) e.preventDefault();

      hasMoved = true;
      const clientY = e.touches[0].clientY;
      const deltaY = clientY - touchStartY;
      row.style.transform = `translateY(${deltaY}px) scale(1.02)`;
      row.style.zIndex = '999';

      // Verifica elementos vizinhos para reposicionamento dinamico no DOM
      const allRows = Array.from(container.querySelectorAll<HTMLElement>('.layer-row-item'));
      for (const target of allRows) {
        if (target === row) continue;
        const rect = target.getBoundingClientRect();
        if (clientY > rect.top && clientY < rect.bottom) {
          const midY = rect.top + rect.height / 2;
          if (clientY < midY) {
            container.insertBefore(row, target);
          } else {
            container.insertBefore(row, target.nextSibling);
          }
          touchStartY = clientY;
          row.style.transform = 'translateY(0px) scale(1.02)';
          break;
        }
      }
    }, { passive: false });

    const handleTouchEnd = () => {
      if (!draggedRow || draggedRow !== row) return;
      row.classList.remove('touch-dragging');
      row.style.transform = '';
      row.style.zIndex = '';

      if (hasMoved) {
        onReorder(getNewOrder());
      }
      draggedRow = null;
      hasMoved = false;
    };

    touchTarget.addEventListener('touchend', handleTouchEnd);
    touchTarget.addEventListener('touchcancel', handleTouchEnd);
  });
}
