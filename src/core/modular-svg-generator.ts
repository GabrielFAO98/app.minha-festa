import type { PresetItem, SvgRole } from '../types';
import { svgToDataUrl } from './presets-data';

// Utilitários de manipulação de cor Hex para gerar luzes e sombras 3D automaticamente
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = (hex || '#ffffff').replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0');
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function adjustColorBrightness(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  if (amount >= 0) {
    return rgbToHex(
      r + (255 - r) * amount,
      g + (255 - g) * amount,
      b + (255 - b) * amount
    );
  } else {
    const factor = 1 + amount;
    return rgbToHex(r * factor, g * factor, b * factor);
  }
}

// Cores sólidas curadas para pintura direta de estruturas SVG (Painéis, Cilindros, Cubos, Tapetes)
export const SOLID_STRUCTURAL_COLORS = [
  { name: 'Branco Neve', hex: '#ffffff' },
  { name: 'Off-White / Areia', hex: '#f5efe6' },
  { name: 'Bege Nude', hex: '#e6ccb2' },
  { name: 'Rosa Bebê', hex: '#fbcfe8' },
  { name: 'Rosa Blush / Chá', hex: '#f4acb7' },
  { name: 'Pink Vibrante', hex: '#ec4899' },
  { name: 'Lilás Lavanda', hex: '#ddd6fe' },
  { name: 'Azul Bebê', hex: '#bae6fd' },
  { name: 'Azul Serenity', hex: '#7dd3fc' },
  { name: 'Azul Marinho / Noite', hex: '#1e3a8a' },
  { name: 'Verde Sálvia / Boho', hex: '#bbf7d0' },
  { name: 'Verde Esmeralda / Safari', hex: '#15803d' },
  { name: 'Amarelo Candy', hex: '#fef08a' },
  { name: 'Terracota / Rústico', hex: '#c2410c' },
  { name: 'Marrom Cacau', hex: '#78350f' },
  { name: 'Preto Ônix', hex: '#1e293b' }
];

/**
 * Classifica cada item do acervo nas 3 categorias da Arquitetura Híbrida:
 * - 'structural': SVG Estrutural de Base (aceita Capa Sublimada com enquadramento/zoom OU Pintura em Cor Sólida)
 * - 'modular': SVG Autossuficiente (NÃO aceita capa, mas permite trocar as cores de seus elementos modularmente)
 * - 'photo': Peça Fotográfica / Acervo Real (NÃO aceita capa)
 */
export function getItemCustomizationMode(item: PresetItem | null | undefined): SvgRole {
  if (!item) return 'photo';
  if (item.isCustom) return 'photo';
  if (item.svgRole) return item.svgRole;

  const id = item.id || '';
  const type = item.type || '';

  // Peças fotográficas ou displays fechados que nunca levam capa nem pintura modular SVG
  if (
    type === 'moinho' ||
    type === 'display' ||
    id === 'preset-vaso-flores' ||
    id === 'preset-bolo-fake' ||
    id.startsWith('preset-moinho') ||
    id.startsWith('preset-display') ||
    id === 'preset-luminoso-led'
  ) {
    if (id === 'preset-caixa-presente-luxo') return 'modular';
    return 'photo';
  }

  // SVGs Autossuficientes Modulares (Ripado, Shimmer Wall, Cilindro Canelado, Mesas, Boleiras/Bandejas)
  if (
    type === 'panel_slat' ||
    type === 'shimmer_wall' ||
    type === 'cylinder_fluted' ||
    type === 'table' ||
    type === 'table_side' ||
    type === 'dresser_bombe' ||
    id === 'preset-painel-ripado' ||
    id === 'preset-shimmer-wall' ||
    id === 'preset-cilindro-canelado' ||
    id === 'preset-mesa-cavalete' ||
    id === 'preset-mesa-apoio-lateral' ||
    id === 'preset-comoda-bombe' ||
    id === 'preset-boleira' ||
    id === 'preset-bandeja-baixa' ||
    id === 'preset-bandeja' ||
    id === 'preset-torre-doces-3-andares' ||
    id === 'preset-caixa-presente-luxo'
  ) {
    return 'modular';
  }

  // SVGs Estruturais de Base (Painéis lisos, Cilindros lisos, Cubos, Tapetes/Lonas)
  if (
    type === 'panel_round' ||
    type === 'panel_arch' ||
    type === 'panel_rect' ||
    type === 'panel_half_moon' ||
    type === 'cylinder' ||
    type === 'cube' ||
    type === 'rug_rect_3d' ||
    type === 'rug_oval' ||
    type === 'rug_round'
  ) {
    return 'structural';
  }

  return 'photo';
}

export interface ModularPalette {
  name: string;
  colors: string[];
}

export interface ModularItemConfig {
  title: string;
  subtitle: string;
  slotLabels: string[];
  defaultColors: string[];
  palettes: ModularPalette[];
}

/**
 * Retorna a configuração modular de cores específica para cada peça SVG autossuficiente
 */
export function getModularConfigForItem(item: PresetItem): ModularItemConfig {
  const id = item.id || '';
  const type = item.type || '';

  if (type === 'panel_slat' || id === 'preset-painel-ripado') {
    return {
      title: 'Painel Ripado Modular',
      subtitle: 'Personalize a cor das ripas e do fundo entre os vãos',
      slotLabels: ['Cor das Ripas', 'Cor dos Vãos / Fundo'],
      defaultColors: ['#d97706', '#1c0a00'],
      palettes: [
        { name: 'Freijó Natural', colors: ['#d97706', '#1c0a00'] },
        { name: 'Pinus Claro Nórdico', colors: ['#e6c280', '#5c4018'] },
        { name: 'Branco Provençal', colors: ['#f8fafc', '#94a3b8'] },
        { name: 'Rosa Candy & Branco', colors: ['#f9a8d4', '#831843'] },
        { name: 'Azul Bebê Sereno', colors: ['#7dd3fc', '#0c4a6e'] },
        { name: 'Verde Sálvia Boho', colors: ['#86efac', '#14532d'] },
        { name: 'Nogueira Tabaco', colors: ['#78350f', '#090401'] },
        { name: 'Preto & Dourado Luxo', colors: ['#1e293b', '#ca8a04'] }
      ]
    };
  }

  if (type === 'shimmer_wall' || id === 'preset-shimmer-wall') {
    return {
      title: 'Shimmer Wall (Paetês)',
      subtitle: 'Altere o brilho metálico das lantejoulas e da grade',
      slotLabels: ['Paetê Principal', 'Brilho / Reflexo', 'Grade Traseira'],
      defaultColors: ['#eab308', '#fef08a', '#451a03'],
      palettes: [
        { name: 'Dourado Champagne', colors: ['#eab308', '#fef08a', '#451a03'] },
        { name: 'Rose Gold Luxo', colors: ['#e11d48', '#fecdd3', '#4c0519'] },
        { name: 'Prata Cristal', colors: ['#94a3b8', '#ffffff', '#1e293b'] },
        { name: 'Pink Barbie Glamour', colors: ['#ec4899', '#fbcfe8', '#500724'] },
        { name: 'Azul Tiffany / Sereia', colors: ['#06b6d4', '#cffafe', '#083344'] },
        { name: 'Lilás Furtacor', colors: ['#a855f7', '#f3e8ff', '#3b0764'] },
        { name: 'Verde Esmeralda', colors: ['#10b981', '#d1fae5', '#064e3b'] },
        { name: 'Preto Ônix', colors: ['#334155', '#94a3b8', '#020617'] }
      ]
    };
  }

  if (type === 'cylinder_fluted' || id === 'preset-cilindro-canelado') {
    return {
      title: 'Cilindro Canelado Luxo',
      subtitle: 'Personalize a pintura dos gomos canelados e do tampo',
      slotLabels: ['Corpo Canelado', 'Tampo Superior'],
      defaultColors: ['#eab308', '#fef9c3'],
      palettes: [
        { name: 'Dourado Imperial', colors: ['#eab308', '#fef9c3'] },
        { name: 'Branco Acetinado', colors: ['#f1f5f9', '#ffffff'] },
        { name: 'Rosa Blush', colors: ['#f4acb7', '#ffe5ec'] },
        { name: 'Bege Areia / Nude', colors: ['#d6bfa7', '#f5ebe0'] },
        { name: 'Verde Sálvia', colors: ['#86efac', '#dcfce7'] },
        { name: 'Azul Serenity', colors: ['#7dd3fc', '#e0f2fe'] },
        { name: 'Terracota Boho', colors: ['#c2410c', '#fed7aa'] },
        { name: 'Preto & Dourado', colors: ['#1e293b', '#eab308'] }
      ]
    };
  }

  if (id === 'preset-mesa-cavalete' || id === 'preset-mesa-apoio-lateral' || id === 'preset-comoda-bombe' || type === 'table' || type === 'table_side') {
    return {
      title: item.name,
      subtitle: 'Personalize a cor do tampo/corpo e dos pés/detalhes',
      slotLabels: ['Tampo / Corpo Principal', 'Pés / Detalhes'],
      defaultColors: id === 'preset-comoda-bombe' ? ['#f8fafc', '#eab308'] : ['#d97706', '#f8fafc'],
      palettes: [
        { name: 'Branco & Dourado', colors: ['#f8fafc', '#eab308'] },
        { name: 'Madeira Pinus & Branco', colors: ['#d97706', '#f8fafc'] },
        { name: 'Todo Madeira Rústica', colors: ['#b45309', '#78350f'] },
        { name: 'Todo Branco Provençal', colors: ['#ffffff', '#cbd5e1'] },
        { name: 'Rosa Pastel & Dourado', colors: ['#fbcfe8', '#eab308'] },
        { name: 'Azul Bebê & Branco', colors: ['#bae6fd', '#ffffff'] },
        { name: 'Verde Sálvia & Madeira', colors: ['#bbf7d0', '#b45309'] },
        { name: 'Preto & Madeira', colors: ['#1e293b', '#d97706'] }
      ]
    };
  }

  // Louças, Boleiras, Bandejas, Torre de Doces e Caixa de Presente
  return {
    title: item.name,
    subtitle: 'Personalize as cores da peça e do acabamento',
    slotLabels: ['Cor Principal', 'Acabamento / Detalhe'],
    defaultColors: ['#ffffff', '#eab308'],
    palettes: [
      { name: 'Branco & Dourado', colors: ['#ffffff', '#eab308'] },
      { name: 'Dourado Real', colors: ['#eab308', '#fef08a'] },
      { name: 'Rosa Porcelana & Ouro', colors: ['#fbcfe8', '#eab308'] },
      { name: 'Azul Candy & Prata', colors: ['#bae6fd', '#94a3b8'] },
      { name: 'Verde Menta & Ouro', colors: ['#bbf7d0', '#eab308'] },
      { name: 'Lilás Lavanda', colors: ['#e9d5ff', '#a855f7'] },
      { name: 'Vermelho Luxo & Ouro', colors: ['#dc2626', '#eab308'] },
      { name: 'Preto & Dourado', colors: ['#1e293b', '#eab308'] }
    ]
  };
}

/**
 * Gera dinamicamente o SVG DataURL para qualquer peça SVG Modular com as cores escolhidas
 */
export function generateModularSvgDataUrl(item: PresetItem, colors: string[]): string {
  const id = item.id || '';
  const type = item.type || '';
  const c1 = colors[0] || '#d97706';
  const c2 = colors[1] || '#1c0a00';
  const c3 = colors[2] || '#451a03';

  // 1. PAINEL RIPADO 1,00x2,20m (Com pés dourados discretos e ripas customizáveis)
  if (type === 'panel_slat' || id === 'preset-painel-ripado') {
    const slatLight = adjustColorBrightness(c1, 0.25);
    const slatMid = c1;
    const slatDark = adjustColorBrightness(c1, -0.25);
    const slatEdge = adjustColorBrightness(c1, -0.45);
    const slatHighlight = adjustColorBrightness(c1, 0.55);

    const slatsX = [17, 30.5, 44, 57.5, 71, 84.5, 98, 111.5, 125, 138.5, 152];
    const slatsSvg = slatsX.map((x, idx) => {
      const gradId = idx % 2 === 0 ? 'modSlatA' : 'modSlatB';
      return `<g>
        <rect x="${x}" y="14" width="10.5" height="332" rx="1.2" fill="url(#${gradId})" stroke="${slatEdge}" stroke-width="0.4"/>
        <line x1="${x + 1.2}" y1="15" x2="${x + 1.2}" y2="345" stroke="${slatHighlight}" stroke-width="0.6" opacity="0.45"/>
      </g>`;
    }).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 380" width="180" height="380">
      <defs>
        <linearGradient id="modSlatA" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${slatLight}"/>
          <stop offset="50%" stop-color="${slatMid}"/>
          <stop offset="100%" stop-color="${slatDark}"/>
        </linearGradient>
        <linearGradient id="modSlatB" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${slatMid}"/>
          <stop offset="50%" stop-color="${slatLight}"/>
          <stop offset="100%" stop-color="${slatDark}"/>
        </linearGradient>
        <linearGradient id="goldFootMod" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#9a6f0a"/>
          <stop offset="50%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#b4830e"/>
        </linearGradient>
        <filter id="slatModShadow" x="-15%" y="-10%" width="130%" height="125%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.22"/>
        </filter>
      </defs>
      <ellipse cx="90" cy="374" rx="76" ry="4" fill="#0f172a" opacity="0.22"/>
      <!-- Pés Dourados Discretos -->
      <rect x="33" y="346" width="4" height="25" rx="1" fill="url(#goldFootMod)"/>
      <path d="M 22 371 L 35 368 L 48 371 L 46 373.5 L 24 373.5 Z" fill="url(#goldFootMod)"/>
      <rect x="143" y="346" width="4" height="25" rx="1" fill="url(#goldFootMod)"/>
      <path d="M 132 371 L 145 368 L 158 371 L 156 373.5 L 134 373.5 Z" fill="url(#goldFootMod)"/>
      <!-- Estrutura do Painel Ripado -->
      <g filter="url(#slatModShadow)">
        <rect x="15" y="14" width="150" height="332" rx="2" fill="${c2}"/>
        ${slatsSvg}
        <rect x="14" y="12" width="152" height="4.5" rx="1.2" fill="url(#modSlatA)"/>
        <rect x="14" y="343.5" width="152" height="4.5" rx="1.2" fill="url(#modSlatA)"/>
      </g>
    </svg>`;
    return svgToDataUrl(svg);
  }

  // 2. SHIMMER WALL (Paetê 30x30cm com 64 lantejoulas metálicas)
  if (type === 'shimmer_wall' || id === 'preset-shimmer-wall') {
    const sDark = adjustColorBrightness(c1, -0.35);
    const sDeep = adjustColorBrightness(c1, -0.60);
    let sequins = '';
    const coords = [9.0, 26.8, 44.6, 62.4, 80.2, 98.0, 115.8, 133.6];
    coords.forEach((y, rIdx) => {
      coords.forEach((x, cIdx) => {
        const cx = (x + 8.2).toFixed(1);
        const cy = (y + 8.2).toFixed(1);
        const rot = ((rIdx + cIdx) % 3 === 0) ? -1.8 : ((rIdx + cIdx) % 3 === 1 ? 1.8 : 0);
        const grad = (rIdx + cIdx) % 3 === 0 ? 'seqModA' : ((rIdx + cIdx) % 3 === 1 ? 'seqModB' : 'seqModC');
        sequins += `<g transform="rotate(${rot} ${cx} ${cy})">
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="16.4" height="16.4" rx="2" fill="url(#${grad})" stroke="${sDark}" stroke-width="0.4"/>
          <polygon points="${x.toFixed(1)},${y.toFixed(1)} ${(x + 16.4).toFixed(1)},${y.toFixed(1)} ${cx},${cy}" fill="#ffffff" opacity="0.24"/>
          <circle cx="${cx}" cy="${(y + 2.2).toFixed(1)}" r="0.9" fill="${c3}"/>
        </g>`;
      });
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <linearGradient id="seqModA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="22%" stop-color="${c2}"/>
          <stop offset="55%" stop-color="${c1}"/>
          <stop offset="85%" stop-color="${sDark}"/>
          <stop offset="100%" stop-color="${sDeep}"/>
        </linearGradient>
        <linearGradient id="seqModB" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${c2}"/>
          <stop offset="35%" stop-color="${c1}"/>
          <stop offset="75%" stop-color="${sDark}"/>
          <stop offset="100%" stop-color="${sDeep}"/>
        </linearGradient>
        <linearGradient id="seqModC" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${sDark}"/>
          <stop offset="45%" stop-color="${c1}"/>
          <stop offset="78%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="${sDark}"/>
        </linearGradient>
        <filter id="shimmerModDrop" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#020617" flood-opacity="0.35"/>
        </filter>
      </defs>
      <rect x="6" y="6" width="148" height="148" rx="4" fill="${c3}" filter="url(#shimmerModDrop)"/>
      ${sequins}
    </svg>`;
    return svgToDataUrl(svg);
  }

  // 3. CILINDRO CANELADO LUXO
  if (type === 'cylinder_fluted' || id === 'preset-cilindro-canelado') {
    const bodyLight = adjustColorBrightness(c1, 0.35);
    const bodyMid = c1;
    const bodyDark = adjustColorBrightness(c1, -0.30);
    const bodyDeep = adjustColorBrightness(c1, -0.50);
    const topLight = adjustColorBrightness(c2, 0.30);
    const topDark = adjustColorBrightness(c2, -0.18);

    let flutes = '';
    for (let x = 20; x <= 134; x += 6) {
      flutes += `<line x1="${x}" y1="36" x2="${x}" y2="195" stroke="${bodyDeep}" stroke-width="1.1" opacity="0.45"/>`;
      flutes += `<line x1="${x + 2}" y1="36" x2="${x + 2}" y2="195" stroke="${bodyLight}" stroke-width="0.9" opacity="0.5"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="160" height="220">
      <defs>
        <linearGradient id="flutedBodyMod" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${bodyDark}"/>
          <stop offset="18%" stop-color="${bodyLight}"/>
          <stop offset="45%" stop-color="${bodyMid}"/>
          <stop offset="78%" stop-color="${bodyDark}"/>
          <stop offset="92%" stop-color="${bodyDeep}"/>
          <stop offset="100%" stop-color="${bodyDark}"/>
        </linearGradient>
        <radialGradient id="flutedTopMod" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stop-color="${topLight}"/>
          <stop offset="65%" stop-color="${c2}"/>
          <stop offset="100%" stop-color="${topDark}"/>
        </radialGradient>
        <filter id="flutedModShadow" x="-20%" y="-15%" width="140%" height="135%">
          <feDropShadow dx="0" dy="6" stdDeviation="5.5" flood-color="#0f172a" flood-opacity="0.24"/>
        </filter>
      </defs>
      <ellipse cx="80" cy="199" rx="68" ry="13" fill="#0f172a" opacity="0.24"/>
      <g filter="url(#flutedModShadow)">
        <path d="M 14.5 35 L 14.5 195 A 65.5 12.5 0 0 0 145.5 195 L 145.5 35 Z" fill="url(#flutedBodyMod)"/>
        ${flutes}
        <ellipse cx="80" cy="35" rx="65.5" ry="12.5" fill="url(#flutedTopMod)"/>
      </g>
    </svg>`;
    return svgToDataUrl(svg);
  }

  // 4. MESA CAVALETE 1,50m
  if (id === 'preset-mesa-cavalete') {
    const topLight = adjustColorBrightness(c1, 0.25);
    const topDark = adjustColorBrightness(c1, -0.25);
    const legDark = adjustColorBrightness(c2, -0.25);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
      <defs>
        <linearGradient id="tblTopMod" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${topLight}"/>
          <stop offset="55%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${topDark}"/>
        </linearGradient>
        <linearGradient id="tblLegMod" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${c2}"/>
          <stop offset="100%" stop-color="${legDark}"/>
        </linearGradient>
        <filter id="tblModShadow" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.22"/>
        </filter>
      </defs>
      <ellipse cx="62" cy="170" rx="36" ry="5" fill="#0f172a" opacity="0.22"/>
      <ellipse cx="218" cy="170" rx="36" ry="5" fill="#0f172a" opacity="0.22"/>
      <g filter="url(#tblModShadow)">
        <!-- Cavalete Esquerdo -->
        <polygon points="52,42 60,42 36,168 27,168" fill="url(#tblLegMod)"/>
        <polygon points="64,42 72,42 96,168 87,168" fill="url(#tblLegMod)"/>
        <rect x="38" y="118" width="48" height="6" rx="1.5" fill="url(#tblLegMod)"/>
        <rect x="44" y="82" width="36" height="5" rx="1.5" fill="url(#tblLegMod)"/>
        <!-- Cavalete Direito -->
        <polygon points="208,42 216,42 192,168 183,168" fill="url(#tblLegMod)"/>
        <polygon points="220,42 228,42 252,168 243,168" fill="url(#tblLegMod)"/>
        <rect x="194" y="118" width="48" height="6" rx="1.5" fill="url(#tblLegMod)"/>
        <rect x="200" y="82" width="36" height="5" rx="1.5" fill="url(#tblLegMod)"/>
        <!-- Tampo Superior -->
        <polygon points="24,22 256,22 268,36 12,36" fill="url(#tblTopMod)"/>
        <rect x="12" y="36" width="256" height="9" rx="2" fill="${topDark}"/>
      </g>
    </svg>`;
    return svgToDataUrl(svg);
  }

  // 5. MESA DE APOIO LATERAL 60x60cm
  if (id === 'preset-mesa-apoio-lateral' || type === 'table_side') {
    const topLight = adjustColorBrightness(c1, 0.25);
    const topDark = adjustColorBrightness(c1, -0.20);
    const legDark = adjustColorBrightness(c2, -0.25);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" width="160" height="180">
      <defs>
        <radialGradient id="sideTopMod" cx="45%" cy="38%" r="60%">
          <stop offset="0%" stop-color="${topLight}"/>
          <stop offset="70%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${topDark}"/>
        </radialGradient>
        <linearGradient id="sideLegMod" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${c2}"/>
          <stop offset="100%" stop-color="${legDark}"/>
        </linearGradient>
        <filter id="sideModShadow" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.22"/>
        </filter>
      </defs>
      <ellipse cx="80" cy="168" rx="52" ry="6" fill="#0f172a" opacity="0.22"/>
      <g filter="url(#sideModShadow)">
        <polygon points="56,42 64,42 38,166 32,166" fill="url(#sideLegMod)"/>
        <polygon points="77,44 83,44 83,162 77,162" fill="url(#sideLegMod)"/>
        <polygon points="96,42 104,42 128,166 122,166" fill="url(#sideLegMod)"/>
        <ellipse cx="80" cy="36" rx="64" ry="14" fill="${topDark}"/>
        <ellipse cx="80" cy="32" rx="64" ry="14" fill="url(#sideTopMod)"/>
      </g>
    </svg>`;
    return svgToDataUrl(svg);
  }

  // 6. CÔMODA BOMBÊ
  if (id === 'preset-comoda-bombe' || type === 'dresser_bombe') {
    const bodyLight = adjustColorBrightness(c1, 0.20);
    const bodyDark = adjustColorBrightness(c1, -0.18);
    const bodyDeep = adjustColorBrightness(c1, -0.32);
    const accentLight = adjustColorBrightness(c2, 0.30);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" width="200" height="180">
      <defs>
        <linearGradient id="bombeBodyMod" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bodyLight}"/>
          <stop offset="55%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${bodyDark}"/>
        </linearGradient>
        <linearGradient id="bombeAccentMod" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${c2}"/>
          <stop offset="50%" stop-color="${accentLight}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
        <filter id="bombeModShadow" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.24"/>
        </filter>
      </defs>
      <ellipse cx="100" cy="171" rx="76" ry="6" fill="#0f172a" opacity="0.24"/>
      <g filter="url(#bombeModShadow)">
        <path d="M 30 34 C 14 68, 16 112, 32 140 L 26 168 L 36 168 L 44 142 Q 100 152 156 142 L 164 168 L 174 168 L 168 140 C 184 112, 186 68, 170 34 Z" fill="url(#bombeBodyMod)" stroke="${bodyDeep}" stroke-width="1.2"/>
        <rect x="24" y="25" width="152" height="10" rx="3" fill="url(#bombeAccentMod)"/>
        <rect x="44" y="46" width="112" height="26" rx="3" fill="${bodyLight}" stroke="${bodyDeep}" stroke-width="1"/>
        <rect x="42" y="78" width="116" height="26" rx="3" fill="${bodyLight}" stroke="${bodyDeep}" stroke-width="1"/>
        <rect x="44" y="110" width="112" height="26" rx="3" fill="${bodyLight}" stroke="${bodyDeep}" stroke-width="1"/>
        <circle cx="82" cy="59" r="3.5" fill="url(#bombeAccentMod)"/>
        <circle cx="118" cy="59" r="3.5" fill="url(#bombeAccentMod)"/>
        <circle cx="82" cy="91" r="3.5" fill="url(#bombeAccentMod)"/>
        <circle cx="118" cy="91" r="3.5" fill="url(#bombeAccentMod)"/>
        <circle cx="82" cy="123" r="3.5" fill="url(#bombeAccentMod)"/>
        <circle cx="118" cy="123" r="3.5" fill="url(#bombeAccentMod)"/>
      </g>
    </svg>`;
    return svgToDataUrl(svg);
  }

  // 7. CAIXA DE PRESENTE LUXO
  if (id === 'preset-caixa-presente-luxo') {
    const boxLight = adjustColorBrightness(c1, 0.20);
    const boxDark = adjustColorBrightness(c1, -0.20);
    const ribbonLight = adjustColorBrightness(c2, 0.30);
    const ribbonDark = adjustColorBrightness(c2, -0.25);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" width="160" height="180">
      <defs>
        <linearGradient id="giftBoxMod" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${boxLight}"/>
          <stop offset="50%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${boxDark}"/>
        </linearGradient>
        <linearGradient id="giftRibMod" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${ribbonDark}"/>
          <stop offset="50%" stop-color="${ribbonLight}"/>
          <stop offset="100%" stop-color="${ribbonDark}"/>
        </linearGradient>
        <filter id="giftModDrop" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.24"/>
        </filter>
      </defs>
      <ellipse cx="80" cy="168" rx="58" ry="7" fill="#0f172a" opacity="0.22"/>
      <g filter="url(#giftModDrop)">
        <rect x="28" y="64" width="104" height="100" rx="4" fill="url(#giftBoxMod)"/>
        <rect x="68" y="64" width="24" height="100" fill="url(#giftRibMod)"/>
        <rect x="28" y="104" width="104" height="20" fill="url(#giftRibMod)"/>
        <rect x="22" y="46" width="116" height="22" rx="4" fill="url(#giftBoxMod)"/>
        <rect x="66" y="46" width="28" height="22" fill="url(#giftRibMod)"/>
        <path d="M 80 46 C 55 14, 30 28, 56 46 Z" fill="url(#giftRibMod)"/>
        <path d="M 80 46 C 105 14, 130 28, 104 46 Z" fill="url(#giftRibMod)"/>
        <circle cx="80" cy="44" r="7" fill="url(#giftRibMod)"/>
      </g>
    </svg>`;
    return svgToDataUrl(svg);
  }

  // 8. BOLEIRA / BANDEJAS / TORRE DE DOCES
  const mainLight = adjustColorBrightness(c1, 0.25);
  const mainDark = adjustColorBrightness(c1, -0.25);
  const accLight = adjustColorBrightness(c2, 0.30);
  const accDark = adjustColorBrightness(c2, -0.25);

  if (id === 'preset-torre-doces-3-andares') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200">
      <defs>
        <linearGradient id="twPlateMod" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${mainDark}"/>
          <stop offset="45%" stop-color="${mainLight}"/>
          <stop offset="100%" stop-color="${mainDark}"/>
        </linearGradient>
        <linearGradient id="twGoldMod" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${accDark}"/>
          <stop offset="50%" stop-color="${accLight}"/>
          <stop offset="100%" stop-color="${accDark}"/>
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="186" rx="48" ry="6" fill="#0f172a" opacity="0.22"/>
      <rect x="77" y="28" width="6" height="152" fill="url(#twGoldMod)"/>
      <circle cx="80" cy="22" r="8" fill="none" stroke="url(#twGoldMod)" stroke-width="3.5"/>
      <ellipse cx="80" cy="182" rx="34" ry="7" fill="url(#twGoldMod)"/>
      <ellipse cx="80" cy="148" rx="64" ry="12" fill="url(#twPlateMod)" stroke="url(#twGoldMod)" stroke-width="2"/>
      <ellipse cx="80" cy="100" rx="50" ry="10" fill="url(#twPlateMod)" stroke="url(#twGoldMod)" stroke-width="2"/>
      <ellipse cx="80" cy="56" rx="36" ry="8" fill="url(#twPlateMod)" stroke="url(#twGoldMod)" stroke-width="2"/>
    </svg>`;
    return svgToDataUrl(svg);
  }

  if (id === 'preset-bandeja-baixa') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80" width="160" height="80">
      <defs>
        <linearGradient id="trLowTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${mainLight}"/>
          <stop offset="100%" stop-color="${mainDark}"/>
        </linearGradient>
        <linearGradient id="trLowRim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${accDark}"/>
          <stop offset="50%" stop-color="${accLight}"/>
          <stop offset="100%" stop-color="${accDark}"/>
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="62" rx="70" ry="12" fill="#0f172a" opacity="0.22"/>
      <path d="M 12 44 L 12 56 A 68 13 0 0 0 148 56 L 148 44 Z" fill="url(#trLowRim)"/>
      <ellipse cx="80" cy="44" rx="68" ry="13" fill="url(#trLowTop)" stroke="url(#trLowRim)" stroke-width="2"/>
    </svg>`;
    return svgToDataUrl(svg);
  }

  // Padrão Boleira / Bandeja Alta
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 140" width="160" height="140">
    <defs>
      <linearGradient id="standMainMod" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${mainDark}"/>
        <stop offset="35%" stop-color="${mainLight}"/>
        <stop offset="65%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${mainDark}"/>
      </linearGradient>
      <linearGradient id="standAccMod" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accDark}"/>
        <stop offset="50%" stop-color="${accLight}"/>
        <stop offset="100%" stop-color="${accDark}"/>
      </linearGradient>
    </defs>
    <ellipse cx="80" cy="128" rx="44" ry="8" fill="#0f172a" opacity="0.22"/>
    <path d="M 68 46 Q 74 86 52 122 L 108 122 Q 86 86 92 46 Z" fill="url(#standMainMod)"/>
    <ellipse cx="80" cy="122" rx="28" ry="6" fill="url(#standAccMod)"/>
    <path d="M 12 34 L 12 44 A 68 12 0 0 0 148 44 L 148 34 Z" fill="url(#standMainMod)"/>
    <ellipse cx="80" cy="34" rx="68" ry="12" fill="url(#standMainMod)" stroke="url(#standAccMod)" stroke-width="2"/>
  </svg>`;
  return svgToDataUrl(svg);
}
