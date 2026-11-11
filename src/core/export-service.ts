// Serviço de Exportação de Imagens e Geração de Romaneio para WhatsApp

import type { SceneElement } from '../types';

export interface RomaneioChecklistItem {
  name: string;
  category: string;
  categoryLabel: string;
  quantity: number;
  widthCm: number;
  heightCm: number;
}

export interface RomaneioCategorySummary {
  key: string;
  label: string;
  singular: string;
  plural: string;
  totalQty: number;
  uniqueCount: number;
  items: RomaneioChecklistItem[];
}

export interface RomaneioData {
  totalItems: number;
  uniqueItems: number;
  summaryText: string;
  categories: RomaneioCategorySummary[];
  checklist: RomaneioChecklistItem[];
  coversCount: number;
  coversList: Array<{ itemName: string; coverUrl: string }>;
}

export type WhatsAppMessageMode = 'summary' | 'detailed';

interface CategoryMeta {
  key: string;
  label: string;
  singular: string;
  plural: string;
}

const CATEGORY_ORDER: CategoryMeta[] = [
  { key: 'paineis', label: 'Painéis e Fundos', singular: 'painel', plural: 'painéis' },
  { key: 'cilindros', label: 'Cilindros e Cubos', singular: 'cilindro', plural: 'cilindros' },
  { key: 'mesas', label: 'Mesas e Móveis', singular: 'mesa', plural: 'mesas' },
  { key: 'tapetes', label: 'Tapetes e Pisos', singular: 'tapete', plural: 'tapetes' },
  { key: 'baloes', label: 'Balões e Arcos', singular: 'balão', plural: 'balões' },
  { key: 'displays', label: 'Displays', singular: 'display', plural: 'displays' },
  { key: 'acessorios', label: 'Acessórios e Enfeites', singular: 'acessório', plural: 'acessórios' }
];

const FALLBACK_CATEGORY: CategoryMeta = {
  key: 'outros',
  label: 'Outros Itens',
  singular: 'item',
  plural: 'itens'
};

const MAX_INLINE_SUMMARY_ITEMS = 3;

function resolveCategoryMeta(rawCategory?: string): CategoryMeta {
  const normalized = String(rawCategory || '').trim().toLowerCase();
  return CATEGORY_ORDER.find((c) => c.key === normalized) || FALLBACK_CATEGORY;
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/**
 * Agrupa os elementos da decoração por item e categoria para gerar o romaneio resumido e detalhado.
 */
export function generateRomaneio(elements: SceneElement[]): RomaneioData {
  const itemMap = new Map<string, RomaneioChecklistItem>();
  const coversList: Array<{ itemName: string; coverUrl: string }> = [];

  elements.forEach((item) => {
    const cleanName = (item.name || 'Peça Personalizada').trim();
    const catMeta = resolveCategoryMeta(item.category);
    const key = `${catMeta.key}::${cleanName}`;

    const existing = itemMap.get(key);
    if (existing) {
      existing.quantity += 1;
    } else {
      itemMap.set(key, {
        name: cleanName,
        category: catMeta.key,
        categoryLabel: catMeta.label,
        quantity: 1,
        widthCm: Math.round(Number(item.widthCm) || 0),
        heightCm: Math.round(Number(item.heightCm) || 0)
      });
    }

    if (item.customCoverUrl) {
      coversList.push({
        itemName: cleanName,
        coverUrl: item.customCoverUrl
      });
    }
  });

  const groupedByCategory = new Map<string, RomaneioChecklistItem[]>();
  itemMap.forEach((entry) => {
    const list = groupedByCategory.get(entry.category) || [];
    list.push(entry);
    groupedByCategory.set(entry.category, list);
  });

  const orderedMetas = [...CATEGORY_ORDER, FALLBACK_CATEGORY];
  const categories: RomaneioCategorySummary[] = [];

  orderedMetas.forEach((meta) => {
    const items = groupedByCategory.get(meta.key);
    if (!items || items.length === 0) return;

    items.sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, 'pt-BR'));
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

    categories.push({
      key: meta.key,
      label: meta.label,
      singular: meta.singular,
      plural: meta.plural,
      totalQty,
      uniqueCount: items.length,
      items
    });
  });

  const checklist = categories.flatMap((c) => c.items);
  const summaryText = categories
    .map((c) => `${c.totalQty} ${pluralize(c.totalQty, c.singular, c.plural)}`)
    .join(' • ');

  return {
    totalItems: elements.length,
    uniqueItems: checklist.length,
    summaryText,
    categories,
    checklist,
    coversCount: coversList.length,
    coversList
  };
}

function formatInlineCategorySummary(category: RomaneioCategorySummary): string {
  const shown = category.items.slice(0, MAX_INLINE_SUMMARY_ITEMS);
  const shownQty = shown.reduce((sum, item) => sum + item.quantity, 0);
  const parts = shown.map((item) => (item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name));

  if (category.items.length > MAX_INLINE_SUMMARY_ITEMS) {
    const extraQty = Math.max(1, category.totalQty - shownQty);
    return `${parts.join(', ')} e +${extraQty} ${pluralize(extraQty, 'item', 'itens')}`;
  }

  return parts.join(', ');
}

/**
 * Cria o texto formatado do romaneio para envio via WhatsApp (resumido ou detalhado).
 */
export function formatWhatsAppMessage(
  projectTitle: string,
  romaneio: RomaneioData,
  clientName = '',
  mode: WhatsAppMessageMode = 'summary'
): string {
  const cleanTitle = (projectTitle || 'Minha Decoração').trim();
  const cleanClient = clientName.trim();
  const totalLabel = `${romaneio.totalItems} ${pluralize(romaneio.totalItems, 'peça', 'peças')}`;

  const lines: string[] = [];

  if (cleanClient) {
    lines.push(`Olá, *${cleanClient}*! Tudo bem? ✨`);
    lines.push(`Preparei o projeto *${cleanTitle}* para você conferir:`);
  } else {
    lines.push(`*Projeto de Decoração — ${cleanTitle}* ✨`);
  }

  lines.push('');

  if (mode === 'summary') {
    lines.push(`*Resumo do cenário (${totalLabel}):*`);
    romaneio.categories.forEach((cat) => {
      lines.push(`• *${cat.label} (${cat.totalQty}):* ${formatInlineCategorySummary(cat)}`);
    });
    if (romaneio.coversCount > 0) {
      lines.push(
        `• *Capas personalizadas:* ${romaneio.coversCount} ${pluralize(romaneio.coversCount, 'peça', 'peças')}`
      );
    }
  } else {
    const modelsPart =
      romaneio.uniqueItems > 0 && romaneio.uniqueItems !== romaneio.totalItems
        ? ` • ${romaneio.uniqueItems} ${pluralize(romaneio.uniqueItems, 'modelo', 'modelos')}`
        : '';
    lines.push(`*Romaneio completo (${totalLabel}${modelsPart}):*`);

    romaneio.categories.forEach((cat) => {
      lines.push('');
      lines.push(`*${cat.label} (${cat.totalQty})*`);
      cat.items.forEach((item) => {
        const sizePart = item.widthCm > 0 && item.heightCm > 0 ? ` (${item.widthCm}x${item.heightCm}cm)` : '';
        lines.push(`• *${item.quantity}x* ${item.name}${sizePart}`);
      });
    });

    if (romaneio.coversCount > 0) {
      lines.push('');
      lines.push(
        `*Capas personalizadas:* ${romaneio.coversCount} ${pluralize(romaneio.coversCount, 'peça', 'peças')}`
      );
    }
  }

  lines.push('');
  lines.push('Se quiser ajustar cores, peças ou medidas, é só me responder por aqui! 🎈');

  return lines.join('\n');
}

/**
 * Abre o WhatsApp com a mensagem pré-formatada via api.whatsapp.com/send (preserva emojis UTF-8).
 */
export function shareViaWhatsApp(phone: string, text: string): void {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  // api.whatsapp.com/send evita o redirecionamento 302 do wa.me que corrompe emojis para U+FFFD em UTF-8
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(url, '_blank');
}

/**
 * Faz download da imagem gerada no dispositivo
 */
export function downloadImage(dataUrl: string, filename = 'decoracao-decoraly.png'): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
