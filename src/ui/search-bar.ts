// Componente reutilizável de busca para catálogos, acervo e capas

export interface SearchBarOptions {
  placeholder: string;
  initialValue?: string;
  onSearch: (term: string) => void;
  style?: string;
}

export function normalizeSearch(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function createSearchBar(options: SearchBarOptions): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'catalog-search-wrap';
  if (options.style) {
    wrap.style.cssText = options.style;
  }

  wrap.innerHTML = `
    <span class="catalog-search-icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </span>
    <input
      type="text"
      class="catalog-search-input"
      placeholder="${options.placeholder}"
      value="${options.initialValue || ''}"
      autocomplete="off"
      spellcheck="false"
      aria-label="${options.placeholder}"
    />
    <button
      type="button"
      class="catalog-search-clear"
      title="Limpar busca"
      aria-label="Limpar busca"
      style="${options.initialValue ? 'display: flex;' : 'display: none;'}"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  const input = wrap.querySelector('.catalog-search-input') as HTMLInputElement;
  const clearBtn = wrap.querySelector('.catalog-search-clear') as HTMLButtonElement;

  input.addEventListener('input', () => {
    const val = input.value;
    clearBtn.style.display = val.length > 0 ? 'flex' : 'none';
    options.onSearch(val);
  });

  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    input.value = '';
    clearBtn.style.display = 'none';
    input.focus();
    options.onSearch('');
  });

  return wrap;
}
