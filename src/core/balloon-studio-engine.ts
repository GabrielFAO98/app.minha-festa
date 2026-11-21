// Motor de Criação, Renderização e Cálculo de Balões Orgânicos
// Padrão de Alto Nível para Decoração de Festas Profissionais

export type BalloonSizeInches = 5 | 7 | 9 | 10 | 12 | 16 | 18 | 24 | 36;
export type BalloonShape = 'round' | 'star';
export type BalloonFinish = 'satin' | 'matte' | 'chrome' | 'crystal' | 'glitter';
export type BalloonSlot = 'A' | 'B' | 'C' | 'D' | 'E' | 'custom';

export interface BalloonPiece {
  id: string;
  x: number;
  y: number;
  z?: number;
  sizeInches: BalloonSizeInches;
  shape?: BalloonShape;
  slot: BalloonSlot;
  customColor?: string;
  finish: BalloonFinish;
  glitterColor?: string;
  rotation?: number;
  source?: 'model' | 'user';
  coverUrl?: string;
  groupId?: string;
}

export interface BalloonPaletteConfig {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
  colorCount?: number;
  name?: string;
  names?: Partial<Record<'A' | 'B' | 'C' | 'D' | 'E', string>>;
  finishes?: Partial<Record<'A' | 'B' | 'C' | 'D' | 'E', BalloonFinish>>;
  covers?: Partial<Record<BalloonSlot, string>>;
  coverNames?: Partial<Record<BalloonSlot, string>>;
}

export interface ArrangementStats {
  totalCount: number;
  bySize: Record<BalloonSizeInches, number>;
  bySlot: Record<BalloonSlot, number>;
  byFinish: Record<BalloonFinish, number>;
  widthCm: number;
  heightCm: number;
}

export interface BalloonModelTemplate {
  id: string;
  name: string;
  description: string;
  pieces: BalloonPiece[];
  palette: BalloonPaletteConfig;
  defaultWidthCm: number;
  defaultHeightCm: number;
}

// Conversão de polegadas para raio no canvas
export const BALLOON_SIZE_RADIUS_MAP: Record<BalloonSizeInches, number> = {
  5: 12,   // ~12.5cm
  7: 17,   // ~17.5cm
  9: 21,   // ~22.8cm (nº 9 padrão Brasil)
  10: 23,  // ~25cm
  12: 28,  // ~30cm
  16: 37,  // ~40cm
  18: 42,  // ~45cm
  24: 56,  // ~60cm
  36: 84   // ~90cm (Gigante 3ft)
};

export const CM_PER_PIXEL = 0.52; // Escala métrica (1px ≈ 0.52cm)

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
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

export function rgbToHex(r: number, g: number, b: number): string {
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

export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 220;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (pVal: number, qVal: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return pVal + (qVal - pVal) * 6 * t;
      if (t < 1 / 2) return qVal;
      if (t < 2 / 3) return pVal + (qVal - pVal) * (2 / 3 - t) * 6;
      return pVal;
    };
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

function shadeLatexColor(hex: string, lDelta: number, sBoost: number = 0): string {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  if (hsl.s < 0.08 && hsl.l > 0.88) {
    const nl = Math.max(0.05, Math.min(1, hsl.l + lDelta * 0.66));
    const rgb = hslToRgb(0.09, lDelta < 0 ? 0.08 : 0.02, nl);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }
  const rgb = hslToRgb(
    hsl.h,
    Math.max(0, Math.min(1, hsl.s + sBoost)),
    Math.max(0.04, Math.min(0.99, hsl.l + lDelta))
  );
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// Catálogo de Cores da Moda para Balões de Festa no Brasil
export interface FashionColor {
  name: string;
  hex: string;
  category: 'Rosas & Blush' | 'Azuis & Celestes' | 'Terrosos & Boho' | 'Verdes' | 'Neutros & Básicos' | 'Metálicos' | 'Doces & Candy';
}

export const FASHION_BALLOON_COLORS: FashionColor[] = [
  // Rosas & Blush
  { name: 'Rosa Quartzo', hex: '#c97a8e', category: 'Rosas & Blush' },
  { name: 'Blush Suave', hex: '#f7dbe1', category: 'Rosas & Blush' },
  { name: 'Rosa Bebê', hex: '#fbcfe8', category: 'Rosas & Blush' },
  { name: 'Rosa Doce', hex: '#f8b4d9', category: 'Rosas & Blush' },
  { name: 'Rosa Chic', hex: '#f472b6', category: 'Rosas & Blush' },
  { name: 'Pink Chic', hex: '#ec4899', category: 'Rosas & Blush' },
  { name: 'Marsala Nobre', hex: '#831843', category: 'Rosas & Blush' },
  // Azuis & Celestes
  { name: 'Azul Bebê', hex: '#bfdbfe', category: 'Azuis & Celestes' },
  { name: 'Azul Céu', hex: '#93c5fd', category: 'Azuis & Celestes' },
  { name: 'Azul Celeste', hex: '#60a5fa', category: 'Azuis & Celestes' },
  { name: 'Azul Turquesa', hex: '#38bdf8', category: 'Azuis & Celestes' },
  { name: 'Azul Royal', hex: '#1e40af', category: 'Azuis & Celestes' },
  { name: 'Azul Marinho', hex: '#1e3a8a', category: 'Azuis & Celestes' },
  // Terrosos & Boho
  { name: 'Terracota', hex: '#c2410c', category: 'Terrosos & Boho' },
  { name: 'Caramelo', hex: '#85512b', category: 'Terrosos & Boho' },
  { name: 'Caramelo Nude', hex: '#d97706', category: 'Terrosos & Boho' },
  { name: 'Areia Macaron', hex: '#fed7aa', category: 'Terrosos & Boho' },
  { name: 'Areia Nude', hex: '#f7eed7', category: 'Terrosos & Boho' },
  { name: 'Mostarda Vintage', hex: '#eab308', category: 'Terrosos & Boho' },
  // Verdes
  { name: 'Verde Eucalipto', hex: '#52796f', category: 'Verdes' },
  { name: 'Sálvia Suave', hex: '#84a98c', category: 'Verdes' },
  { name: 'Verde Oliva', hex: '#4d6b2c', category: 'Verdes' },
  { name: 'Menta Pastel', hex: '#a7f3d0', category: 'Verdes' },
  { name: 'Verde Floresta', hex: '#166534', category: 'Verdes' },
  // Neutros & Básicos
  { name: 'Branco Neve', hex: '#ffffff', category: 'Neutros & Básicos' },
  { name: 'Off-White Pérola', hex: '#fdfbf7', category: 'Neutros & Básicos' },
  { name: 'Off-White', hex: '#f8fafc', category: 'Neutros & Básicos' },
  { name: 'Cinza Prata', hex: '#cbd5e1', category: 'Neutros & Básicos' },
  { name: 'Cinza Grafite', hex: '#71717a', category: 'Neutros & Básicos' },
  { name: 'Preto Noite', hex: '#18181b', category: 'Neutros & Básicos' },
  // Metálicos
  { name: 'Ouro Nobre', hex: '#d4af37', category: 'Metálicos' },
  { name: 'Ouro Velho', hex: '#c59a3f', category: 'Metálicos' },
  { name: 'Rose Gold', hex: '#b76e79', category: 'Metálicos' },
  { name: 'Cobre Brilhante', hex: '#b45309', category: 'Metálicos' },
  { name: 'Prata Espelho', hex: '#e2e8f0', category: 'Metálicos' },
  // Doces & Candy
  { name: 'Lilás Lavanda', hex: '#d8b4fe', category: 'Doces & Candy' },
  { name: 'Lilás Mágico', hex: '#c084fc', category: 'Doces & Candy' },
  { name: 'Amarelo Candy', hex: '#fef08a', category: 'Doces & Candy' },
  { name: 'Tiffany Suave', hex: '#14b8a6', category: 'Doces & Candy' }
];

export function getFriendlyColorName(hex: string): string {
  if (!hex) return 'Cor Personalizada';
  const clean = hex.toLowerCase().trim();
  const exact = FASHION_BALLOON_COLORS.find(c => c.hex.toLowerCase() === clean);
  if (exact) return exact.name;

  const { r: r1, g: g1, b: b1 } = hexToRgb(clean);
  let closestName = 'Cor Personalizada';
  let minDistance = Infinity;

  for (const c of FASHION_BALLOON_COLORS) {
    const { r: r2, g: g2, b: b2 } = hexToRgb(c.hex);
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    const dist = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
    if (dist < minDistance) {
      minDistance = dist;
      closestName = c.name;
    }
  }

  return closestName;
}

// Paletas Prontas Populares de Inspiração para o Estúdio com Nomes e Acabamentos
export const STUDIO_PALETTE_PRESETS: { id: string; name: string; palette: BalloonPaletteConfig }[] = [
  {
    id: 'rose-gold-blush',
    name: 'Rose Gold, Blush & Pérola',
    palette: {
      A: '#c97a8e',
      B: '#f7dbe1',
      C: '#d4af37',
      D: '#ffffff',
      names: { A: 'Rosa Quartzo', B: 'Blush Suave', C: 'Ouro Cromo', D: 'Branco Neve' },
      finishes: { A: 'satin', B: 'satin', C: 'chrome', D: 'matte' }
    }
  },
  {
    id: 'candy-colors',
    name: 'Candy Colors Pastel',
    palette: {
      A: '#f8b4d9',
      B: '#d8b4fe',
      C: '#93c5fd',
      D: '#fef08a',
      names: { A: 'Rosa Doce', B: 'Lilás Mágico', C: 'Azul Céu', D: 'Amarelo Sol' },
      finishes: { A: 'matte', B: 'matte', C: 'satin', D: 'matte' }
    }
  },
  {
    id: 'safari-chic',
    name: 'Safari & Floresta Chic',
    palette: {
      A: '#4d6b2c',
      B: '#85512b',
      C: '#c59a3f',
      D: '#f7eed7',
      names: { A: 'Verde Oliva', B: 'Caramelo', C: 'Ouro Velho', D: 'Areia Nude' },
      finishes: { A: 'matte', B: 'matte', C: 'chrome', D: 'satin' }
    }
  },
  {
    id: 'boho-terracota',
    name: 'Boho Terracota & Nude',
    palette: {
      A: '#c2410c',
      B: '#d97706',
      C: '#fed7aa',
      D: '#fdfbf7',
      names: { A: 'Terracota', B: 'Caramelo Boho', C: 'Nude Macaron', D: 'Off-White' },
      finishes: { A: 'matte', B: 'matte', C: 'matte', D: 'satin' }
    }
  },
  {
    id: 'azul-real-prata',
    name: 'Azul Real, Celeste & Prata',
    palette: {
      A: '#1e40af',
      B: '#60a5fa',
      C: '#cbd5e1',
      D: '#ffffff',
      names: { A: 'Azul Real', B: 'Azul Celeste', C: 'Prata Espelho', D: 'Branco Neve' },
      finishes: { A: 'satin', B: 'satin', C: 'chrome', D: 'matte' }
    }
  },
  {
    id: 'cha-revelacao',
    name: 'Chá Revelação Baby',
    palette: {
      A: '#f472b6',
      B: '#38bdf8',
      C: '#ffffff',
      D: '#d4af37',
      names: { A: 'Rosa Bebê', B: 'Azul Bebê', C: 'Branco Neve', D: 'Ouro Nobre' },
      finishes: { A: 'satin', B: 'satin', C: 'matte', D: 'chrome' }
    }
  },
  {
    id: 'verde-eucalipto',
    name: 'Verde Eucalipto & Pérola',
    palette: {
      A: '#52796f',
      B: '#84a98c',
      C: '#d4af37',
      D: '#f8fafc',
      names: { A: 'Eucalipto', B: 'Sálvia Suave', C: 'Ouro Cromo', D: 'Pérola' },
      finishes: { A: 'matte', B: 'matte', C: 'chrome', D: 'satin' }
    }
  },
  {
    id: 'glamour-ouro-preto',
    name: 'Dourado Glamour & Preto',
    palette: {
      A: '#18181b',
      B: '#d4af37',
      C: '#ffffff',
      D: '#3f3f46',
      names: { A: 'Preto Noite', B: 'Ouro Nobre', C: 'Branco Neve', D: 'Chumbo' },
      finishes: { A: 'matte', B: 'chrome', C: 'satin', D: 'matte' }
    }
  }
];

// Gera definições SVG (filtros de sombra e gradientes de cada acabamento)
export function escapeXml(str: string): string {
  return (str || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function generateStudioDefs(palette: BalloonPaletteConfig, idPrefix: string = ""): string {
  let defs = `
    <radialGradient id="${idPrefix}floorShadowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="#0f172a" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${idPrefix}aoShadow" cx="50%" cy="50%" r="50%">
      <stop offset="52%" stop-color="#1c120e" stop-opacity="0.22"/>
      <stop offset="82%" stop-color="#1c120e" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#1c120e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${idPrefix}glare_soft" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.52"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${idPrefix}glare_chrome" cx="44%" cy="38%" r="54%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.94"/>
      <stop offset="35%" stop-color="#ffffff" stop-opacity="0.42"/>
      <stop offset="72%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  `;

  const slots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  for (const slot of slots) {
    const hex = palette[slot] || (slot === 'E' ? '#f8fafc' : '#d4af37');

    // 1. SATIN (preserva matiz em tons pastel + luz rebatida suave na borda)
    defs += `
    <radialGradient id="${idPrefix}grad_satin_${slot}" cx="36%" cy="32%" r="68%" fx="30%" fy="26%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.70"/>
      <stop offset="15%" stop-color="${shadeLatexColor(hex, 0.22, -0.04)}"/>
      <stop offset="48%" stop-color="${hex}"/>
      <stop offset="80%" stop-color="${shadeLatexColor(hex, -0.15, 0.08)}"/>
      <stop offset="94%" stop-color="${shadeLatexColor(hex, -0.26, 0.12)}"/>
      <stop offset="100%" stop-color="${shadeLatexColor(hex, -0.14, 0.05)}"/>
    </radialGradient>
    `;

    // 2. MATTE (aveludado natural sem sombra azul-acinzentada)
    defs += `
    <radialGradient id="${idPrefix}grad_matte_${slot}" cx="38%" cy="34%" r="68%" fx="34%" fy="29%">
      <stop offset="0%" stop-color="${shadeLatexColor(hex, 0.13, -0.04)}"/>
      <stop offset="36%" stop-color="${hex}"/>
      <stop offset="78%" stop-color="${shadeLatexColor(hex, -0.14, 0.07)}"/>
      <stop offset="100%" stop-color="${shadeLatexColor(hex, -0.23, 0.11)}"/>
    </radialGradient>
    `;

    // 3. CHROME (reflexo metálico realista)
    defs += `
    <radialGradient id="${idPrefix}grad_chrome_${slot}" cx="34%" cy="28%" r="72%" fx="28%" fy="22%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="14%" stop-color="${shadeLatexColor(hex, 0.32, 0.05)}"/>
      <stop offset="40%" stop-color="${hex}"/>
      <stop offset="76%" stop-color="${shadeLatexColor(hex, -0.34, 0.16)}"/>
      <stop offset="92%" stop-color="${hex}"/>
      <stop offset="100%" stop-color="${shadeLatexColor(hex, 0.16, 0.04)}"/>
    </radialGradient>
    `;

    // 4. CRYSTAL
    defs += `
    <radialGradient id="${idPrefix}grad_crystal_${slot}" cx="35%" cy="32%" r="68%" fx="28%" fy="24%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="12%" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="${hex}" stop-opacity="0.04"/>
      <stop offset="85%" stop-color="${hex}" stop-opacity="0.18"/>
      <stop offset="96%" stop-color="${adjustColorBrightness(hex, -0.3)}" stop-opacity="0.50"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.40"/>
    </radialGradient>
    `;

    if (palette.covers && palette.covers[slot]) {
      defs += `
    <pattern id="${idPrefix}pat_cover_${slot}" patternContentUnits="objectBoundingBox" width="1" height="1">
      <image href="${escapeXml(palette.covers[slot]!)}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/>
    </pattern>
      `;
    }
  }

  return defs;
}

// Renderiza uma peça de balão individual
export function generateStarPath(cx: number, cy: number, r: number): string {
  const outerR = r;
  const innerR = r * 0.48;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? outerR : innerR;
    points.push({
      x: cx + Math.cos(angle) * rad,
      y: cy + Math.sin(angle) * rad
    });
  }

  let d = '';
  for (let i = 0; i < 10; i++) {
    const curr = points[i];
    const prev = points[(i - 1 + 10) % 10];
    const next = points[(i + 1) % 10];

    if (i === 0) {
      const pStartX = curr.x + (prev.x - curr.x) * 0.15;
      const pStartY = curr.y + (prev.y - curr.y) * 0.15;
      d += `M ${pStartX.toFixed(1)} ${pStartY.toFixed(1)} `;
    }

    if (i % 2 === 0) {
      const p2X = curr.x + (next.x - curr.x) * 0.12;
      const p2Y = curr.y + (next.y - curr.y) * 0.12;
      d += `Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}, ${p2X.toFixed(1)} ${p2Y.toFixed(1)} `;
    } else {
      const p1X = curr.x + (prev.x - curr.x) * 0.25;
      const p1Y = curr.y + (prev.y - curr.y) * 0.25;
      const p2X = curr.x + (next.x - curr.x) * 0.25;
      const p2Y = curr.y + (next.y - curr.y) * 0.25;
      d += `L ${p1X.toFixed(1)} ${p1Y.toFixed(1)} Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}, ${p2X.toFixed(1)} ${p2Y.toFixed(1)} `;
    }
  }
  d += 'Z';
  return d;
}

export function renderBalloonPieceSvg(piece: BalloonPiece, palette: BalloonPaletteConfig, idPrefix: string = ""): string {
  const { x, y, sizeInches = 12, slot = 'A', finish = 'satin', glitterColor = '#d4af37' } = piece;
  const r = BALLOON_SIZE_RADIUS_MAP[sizeInches] || 28;

  const effectiveSlot = (slot === 'custom' || !slot) ? 'A' : slot;
  const effectiveFinish: BalloonFinish = (slot && slot !== 'custom' && palette.finishes && palette.finishes[slot])
    ? palette.finishes[slot]
    : finish;
  const gradId = effectiveFinish === 'glitter' ? `${idPrefix}grad_crystal_${effectiveSlot}` : `${idPrefix}grad_${effectiveFinish}_${effectiveSlot}`;

  if (piece.shape === 'star') {
    const starR = r;
    const baseHex = (palette as any)[effectiveSlot] || '#f59e0b';
    const darkEdge = adjustColorBrightness(baseHex, -0.32);
    const starPathOuter = generateStarPath(x, y, starR + 2);
    const starPathInner = generateStarPath(x, y, starR);
    const tabY = y + starR * 0.90;
    const tabW = Math.max(6, Math.round(starR * 0.20));
    const tabH = Math.max(7, Math.round(starR * 0.22));

    const hx = x - starR * 0.12;
    const hy = y - starR * 0.16;
    const hrx = starR * 0.42;
    const hry = starR * 0.32;

    let crimpLines = '';
    for (let i = 1; i < 10; i += 2) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const valleyX = x + Math.cos(angle) * (starR * 0.48);
      const valleyY = y + Math.sin(angle) * (starR * 0.48);
      const innerX = x + Math.cos(angle) * (starR * 0.22);
      const innerY = y + Math.sin(angle) * (starR * 0.22);
      crimpLines += `<line x1="${valleyX.toFixed(1)}" y1="${valleyY.toFixed(1)}" x2="${innerX.toFixed(1)}" y2="${innerY.toFixed(1)}" stroke="${darkEdge}" stroke-width="1.1" opacity="0.32"/>`;
    }

    return `
  <g id="piece-${piece.id}" class="balloon-piece balloon-piece-star">
    <!-- Sombra vetorial leve de alto desempenho (zero overhead de filtro SVG) -->
    <path d="${generateStarPath(x + 1.4, y + 2.8, starR + 1)}" fill="#090d16" opacity="0.14"/>
    <!-- Válvula inferior de enchimento -->
    <rect x="${(x - tabW / 2).toFixed(1)}" y="${tabY.toFixed(1)}" width="${tabW}" height="${tabH}" rx="1.5" fill="${darkEdge}" opacity="0.85"/>
    <!-- Borda perimetral térmica da costura do foil -->
    <path d="${starPathOuter}" fill="${darkEdge}" opacity="0.55"/>
    <!-- Corpo estufado da estrela metalizada -->
    <path d="${starPathInner}" fill="url(#${gradId})"/>
    <!-- Vincos de pressão do foil -->
    <g>${crimpLines}</g>
    <!-- Brilho central especular estufado -->
    <ellipse cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" rx="${hrx.toFixed(1)}" ry="${hry.toFixed(1)}" fill="url(#${idPrefix}glare_soft)" opacity="0.85"/>
    <!-- Reflexo estúdio -->
    <circle cx="${(x - starR * 0.18).toFixed(1)}" cy="${(y - starR * 0.28).toFixed(1)}" r="${Math.max(2, starR * 0.07)}" fill="#ffffff" opacity="0.8"/>
  </g>`;
  }
  const rx = r * 0.96;
  const ry = r * 1.04;

  const gx = x - rx * 0.25;
  const gy = y - ry * 0.27;
  const gw = rx * 0.36;
  const gh = ry * 0.24;
  const dotX = x - rx * 0.20;
  const dotY = y - ry * 0.37;
  const dotR = Math.max(1.2, r * 0.052);

  let interior = '';
  const isCrystalOrGlitter = effectiveFinish === 'crystal' || effectiveFinish === 'glitter';

  if (effectiveFinish === 'glitter') {
    const glt = glitterColor || palette.C || '#d4af37';
    const gltLight = adjustColorBrightness(glt, 0.45);
    const gltDark = adjustColorBrightness(glt, -0.3);
    const numSpecks = sizeInches >= 18 ? 32 : 18;
    let specks = '';

    let seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < numSpecks; i++) {
      const angle = rnd() * Math.PI * 2;
      const dist = (0.12 + rnd() * 0.72) * (rx * 0.85);
      const sx = x + Math.cos(angle) * dist;
      const yBias = (rnd() > 0.28) ? (ry * 0.15 + rnd() * ry * 0.52) : (-ry * 0.32 + rnd() * ry * 0.5);
      const sy = y + yBias;

      const sr = 1.8 + rnd() * (r >= 40 ? 3.4 : 2.2);
      const col = (i % 5 === 0) ? '#ffffff' : (i % 2 === 0 ? gltLight : (i % 3 === 0 ? gltDark : glt));
      const op = 0.80 + rnd() * 0.20;

      if (i % 4 === 0) {
        specks += `<polygon points="${sx},${sy - sr * 1.8} ${sx + sr * 0.4},${sy - sr * 0.4} ${sx + sr * 1.8},${sy} ${sx + sr * 0.4},${sy + sr * 0.4} ${sx},${sy + sr * 1.8} ${sx - sr * 0.4},${sy + sr * 0.4} ${sx - sr * 1.8},${sy} ${sx - sr * 0.4},${sy - sr * 0.4}" fill="${col}" opacity="${op}"/>`;
      } else {
        specks += `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${col}" opacity="${op}"/>`;
        specks += `<circle cx="${sx - sr * 0.28}" cy="${sy - sr * 0.28}" r="${sr * 0.38}" fill="#ffffff" opacity="${op * 0.85}"/>`;
      }
    }

    interior = `<g>${specks}</g>`;
  }

  const hasCover = Boolean(palette.covers && palette.covers[effectiveSlot]);
  const isMini = sizeInches === 5;
  const isMatte = !hasCover && effectiveFinish === 'matte';
  const isChrome = !hasCover && effectiveFinish === 'chrome';
  const glareGrad = isChrome ? `url(#${idPrefix}glare_chrome)` : `url(#${idPrefix}glare_soft)`;
  const rotAttr = piece.rotation ? ` transform="rotate(${piece.rotation} ${x} ${y})"` : '';

  return `
  <g id="piece-${piece.id}" class="balloon-piece">
    <!-- Oclusão ambiental radial leve de alto desempenho (zero overhead de filtro SVG) -->
    ${isCrystalOrGlitter
      ? `<ellipse cx="${(x + 1.4).toFixed(1)}" cy="${(y + 2.8).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#090d16" opacity="0.10"/>`
      : `<ellipse cx="${(x + 2.0).toFixed(1)}" cy="${(y + 3.4).toFixed(1)}" rx="${(rx * 1.12).toFixed(1)}" ry="${(ry * 1.12).toFixed(1)}" fill="url(#${idPrefix}aoShadow)"/>`
    }
    ${hasCover
      ? `<ellipse cx="${x}" cy="${y}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"${rotAttr} fill="url(#${idPrefix}pat_cover_${effectiveSlot})"/>`
      : `<ellipse cx="${x}" cy="${y}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"${rotAttr} fill="url(#${gradId})"/>`
    }
    ${hasCover ? `<ellipse cx="${x}" cy="${y}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"${rotAttr} fill="url(#${idPrefix}grad_satin_${effectiveSlot})" opacity="0.32"/>` : ''}
    ${interior}
    ${!isMatte ? `
      <ellipse cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" rx="${gw.toFixed(1)}" ry="${gh.toFixed(1)}" transform="rotate(-28 ${gx.toFixed(1)} ${gy.toFixed(1)})" fill="${glareGrad}"/>
      ${!isMini ? `<circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="${dotR.toFixed(1)}" fill="#ffffff" opacity="${isChrome ? 0.92 : (isCrystalOrGlitter ? 0.85 : 0.56)}"/>` : ''}
      ${isChrome ? `<ellipse cx="${(x + rx * 0.26).toFixed(1)}" cy="${(y + ry * 0.28).toFixed(1)}" rx="${(rx * 0.24).toFixed(1)}" ry="${(ry * 0.13).toFixed(1)}" transform="rotate(32 ${(x + rx * 0.26).toFixed(1)} ${(y + ry * 0.28).toFixed(1)})" fill="#ffffff" opacity="0.28"/>` : ''}
    ` : `<ellipse cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" rx="${(gw * 1.05).toFixed(1)}" ry="${(gh * 1.05).toFixed(1)}" transform="rotate(-28 ${gx.toFixed(1)} ${gy.toFixed(1)})" fill="${glareGrad}" opacity="0.26"/>`}
  </g>`;
}

// Calcula estatísticas inteligentes (lista de compras) da composição
export function calculateArrangementStats(pieces: BalloonPiece[], palette?: BalloonPaletteConfig): ArrangementStats {
  const bySize: Record<BalloonSizeInches, number> = { 5: 0, 7: 0, 9: 0, 10: 0, 12: 0, 16: 0, 18: 0, 24: 0, 36: 0 };
  const bySlot: Record<BalloonSlot, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, custom: 0 };
  const byFinish: Record<BalloonFinish, number> = { satin: 0, matte: 0, chrome: 0, crystal: 0, glitter: 0 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const p of pieces) {
    const r = BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28;
    if (p.x - r < minX) minX = p.x - r;
    if (p.x + r > maxX) maxX = p.x + r;
    if (p.y - r < minY) minY = p.y - r;
    if (p.y + r > maxY) maxY = p.y + r;

    const effFin: BalloonFinish = (p.slot && p.slot !== 'custom' && palette?.finishes && palette.finishes[p.slot])
      ? palette.finishes[p.slot]
      : p.finish;

    bySize[p.sizeInches] = (bySize[p.sizeInches] || 0) + 1;
    bySlot[p.slot] = (bySlot[p.slot] || 0) + 1;
    byFinish[effFin] = (byFinish[effFin] || 0) + 1;
  }

  const bw = isFinite(minX) ? (maxX - minX + 40) : 0;
  const bh = isFinite(minY) ? (maxY - minY + 40) : 0;

  return {
    totalCount: pieces.length,
    bySize,
    bySlot,
    byFinish,
    widthCm: Math.round(bw * CM_PER_PIXEL),
    heightCm: Math.round(bh * CM_PER_PIXEL)
  };
}

// Ordena balões por profundidade física 3D (respeitando coordenada z explícita e mantendo fallback automático para peças sem z)
export function sortPiecesByDepth(pieces: BalloonPiece[]): BalloonPiece[] {
  const getEffectiveZ = (p: BalloonPiece): number => {
    if (p.shape === 'star') return 100 + (p.z ?? 0);
    if (p.z !== undefined) return p.z;
    if (p.sizeInches === 5) return 45;
    if (p.sizeInches >= 18) return -15;
    return 10;
  };

  return [...pieces].sort((a, b) => {
    const za = getEffectiveZ(a);
    const zb = getEffectiveZ(b);
    if (za !== zb) return za - zb;
    return a.y - b.y;
  });
}

// Inverte o arranjo horizontalmente (espelhar L para esquerda/direita)
export function mirrorArrangementHorizontal(pieces: BalloonPiece[]): BalloonPiece[] {
  if (pieces.length === 0) return [];
  let minX = Infinity, maxX = -Infinity;
  pieces.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
  });
  const midX = (minX + maxX) / 2;
  return pieces.map((p) => ({
    ...p,
    x: Math.round(midX - (p.x - midX)),
    ...(p.rotation ? { rotation: -p.rotation } : {})
  }));
}

interface ColorMetaPiece {
  origIdx: number;
  piece: BalloonPiece;
  slot: BalloonSlot;
  r: number;
  t: number;
  sn: number;
  kind: 'big' | 'quad' | 'mini';
  clusterIdx: number;
  rosetteIdx: number;
  locked?: boolean;
}

// Helper: calcula luminância perceptual (0..255) para ordenação suave no Degradê
function getHexLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex || '#ffffff');
  return r * 0.299 + g * 0.587 + b * 0.114;
}

// Helper: limpa ilhas isoladas em Blocos e Degradê para nenhuma cor "pular" sozinha dentro de outra banda
function cleanIsolatedIslands(structural: ColorMetaPiece[]): void {
  for (let pass = 0; pass < 2; pass++) {
    for (const m of structural) {
      if (m.locked) continue;
      const neighs = structural.filter(
        (o) =>
          o.origIdx !== m.origIdx &&
          Math.hypot(o.piece.x - m.piece.x, o.piece.y - m.piece.y) < (m.r + o.r) * 1.12
      );
      if (neighs.length < 2) continue;
      const sameCount = neighs.filter((n) => n.slot === m.slot).length;
      if (sameCount === 0) {
        const freq: Record<string, number> = {};
        for (const n of neighs) {
          if (n.locked) continue;
          freq[n.slot] = (freq[n.slot] || 0) + (n.piece.sizeInches >= 16 ? 2 : 1);
        }
        let bestSlot: BalloonSlot | null = null;
        let bestScore = 0;
        for (const [sl, sc] of Object.entries(freq)) {
          if (sc > bestScore) {
            bestScore = sc;
            bestSlot = sl as BalloonSlot;
          }
        }
        if (bestSlot && bestScore >= 2) {
          m.slot = bestSlot;
        }
      }
    }
  }
}

// Helper: descobre a cor dominante dos balões grandes fisicamente encostados em uma roseta de 5"
function getDominantNeighborSlot(
  ros: ColorMetaPiece[],
  structural: ColorMetaPiece[],
  fallback: BalloonSlot
): BalloonSlot {
  const cx = ros.reduce((s, m) => s + m.piece.x, 0) / ros.length;
  const cy = ros.reduce((s, m) => s + m.piece.y, 0) / ros.length;
  const weights: Record<string, number> = {};
  for (const s of structural) {
    const d = Math.hypot(s.piece.x - cx, s.piece.y - cy);
    if (d < s.r + 36) {
      const w = (d < s.r + 22 ? 3.0 : 1.0) * (s.piece.sizeInches >= 16 ? 1.8 : 1.0);
      weights[s.slot] = (weights[s.slot] || 0) + w;
    }
  }
  let best = fallback;
  let bestW = -1;
  for (const [sl, w] of Object.entries(weights)) {
    if (w > bestW) {
      bestW = w;
      best = sl as BalloonSlot;
    }
  }
  return best;
}

// Distribui as cores da paleta no arranjo seguindo a geometria real da curva,
// sem cores pulando por cima de outras em Blocos/Degradê, com rosetas de 5" monocromáticas
// e ritmo equilibrado em Mesclado (2 a 5 cores)
export function distributeColors(
  pieces: BalloonPiece[],
  mode: 'mesclado' | 'degrade' | 'blocos',
  activeCount: number = 4,
  palette?: BalloonPaletteConfig
): BalloonPiece[] {
  if (pieces.length === 0) return [];
  const allSlots: BalloonSlot[] = ['A', 'B', 'C', 'D', 'E'];
  const count = Math.max(2, Math.min(5, activeCount));
  const activeSlots = allSlots.slice(0, count);

  const meta: ColorMetaPiece[] = pieces.map((p, idx) => ({
    origIdx: idx,
    piece: p,
    slot: p.slot,
    r: BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 23,
    t: 0,
    sn: 0,
    kind: p.sizeInches >= 16 ? 'big' : 'quad',
    clusterIdx: -1,
    rosetteIdx: -1
  }));

  // 1. Detectar rosetas compactas de 5" (grupos conectados de 3–6 balões de 5" encostados em balão >= 9")
  const minis = meta.filter((m) => m.piece.sizeInches === 5);
  const visited = new Set<number>();
  let rosId = 0;
  for (const m of minis) {
    if (visited.has(m.origIdx)) continue;
    const comp: ColorMetaPiece[] = [];
    const queue: ColorMetaPiece[] = [m];
    visited.add(m.origIdx);
    while (queue.length > 0) {
      const cur = queue.shift()!;
      comp.push(cur);
      for (const other of minis) {
        if (!visited.has(other.origIdx) && Math.hypot(cur.piece.x - other.piece.x, cur.piece.y - other.piece.y) < 32) {
          visited.add(other.origIdx);
          queue.push(other);
        }
      }
    }
    const cx = comp.reduce((s, b) => s + b.piece.x, 0) / comp.length;
    const cy = comp.reduce((s, b) => s + b.piece.y, 0) / comp.length;
    const nearBig = meta.some(
      (b) => b.piece.sizeInches >= 9 && Math.hypot(b.piece.x - cx, b.piece.y - cy) < b.r + 28
    );
    if (comp.length >= 3 && comp.length <= 6 && nearBig) {
      for (const b of comp) {
        b.kind = 'mini';
        b.rosetteIdx = rosId;
      }
      rosId++;
    }
  }

  // 2. Reconstruir progressão curvilínea t ∈ [0, 1] acompanhando o formato do arranjo
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const m of meta) {
    if (m.piece.x < minX) minX = m.piece.x;
    if (m.piece.x > maxX) maxX = m.piece.x;
    if (m.piece.y < minY) minY = m.piece.y;
    if (m.piece.y > maxY) maxY = m.piece.y;
  }
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  if (spanX > spanY * 1.45) {
    const midY = (minY + maxY) / 2;
    for (const m of meta) {
      m.t = (m.piece.x - minX) / spanX;
      m.sn = m.piece.y - midY;
    }
  } else if (spanY > spanX * 1.45) {
    const midX = (minX + maxX) / 2;
    for (const m of meta) {
      m.t = (maxY - m.piece.y) / spanY;
      m.sn = m.piece.x - midX;
    }
  } else {
    const cx = minX + spanX * 0.58;
    const cy = minY + spanY * 0.56;
    const angles = meta.map((m) => {
      let a = Math.atan2(m.piece.y - cy, m.piece.x - cx);
      if (a < Math.PI * 0.35) a += Math.PI * 2;
      return a;
    });
    const minA = Math.min(...angles);
    const maxA = Math.max(...angles);
    const spanA = Math.max(0.001, maxA - minA);
    const meanR = meta.reduce((s, m) => s + Math.hypot(m.piece.x - cx, m.piece.y - cy), 0) / meta.length;
    meta.forEach((m, i) => {
      m.t = (angles[i] - minA) / spanA;
      m.sn = Math.hypot(m.piece.x - cx, m.piece.y - cy) - meanR;
    });
  }

  const bigs = meta.filter((m) => m.kind === 'big').sort((a, b) => a.t - b.t);
  const quads = meta.filter((m) => m.kind === 'quad').sort((a, b) => a.t - b.t);
  const structural = [...quads, ...bigs];
  quads.forEach((q, i) => {
    q.clusterIdx = Math.floor(i / 4);
  });

  const rosettesMap = new Map<number, ColorMetaPiece[]>();
  for (const m of meta) {
    if (m.kind === 'mini' && m.rosetteIdx >= 0) {
      const list = rosettesMap.get(m.rosetteIdx) || [];
      list.push(m);
      rosettesMap.set(m.rosetteIdx, list);
    }
  }
  const rosettes = [...rosettesMap.values()].sort((a, b) => a[0].t - b[0].t);

  // =========================================================================
  // MODO 1: DEGRADÊ SUAVE (Ombré real do mais escuro ao mais claro, ZERO saltos!)
  // =========================================================================
  if (mode === 'degrade') {
    // Se a paleta for informada, ordena automaticamente da cor mais escura/intensa para a mais clara
    // (evitando saltos escuro -> claro -> escuro -> claro no meio do degradê!)
    const gradOrder: BalloonSlot[] = palette
      ? [...activeSlots].sort((sa, sb) => {
          const hexA = (palette as any)[sa] || '#ffffff';
          const hexB = (palette as any)[sb] || '#ffffff';
          return getHexLuminance(hexA) - getHexLuminance(hexB);
        })
      : activeSlots;

    // Fronteira limpa e contínua (micro-variação orgânica de 0.02 apenas na borda, nunca pulando no meio!)
    for (const b of structural) {
      const microOrganic = Math.sin(b.piece.x * 0.11 + b.piece.y * 0.13) * 0.018;
      const u = Math.max(0, Math.min(0.9999, b.t + microOrganic));
      b.slot = gradOrder[Math.min(gradOrder.length - 1, Math.floor(u * gradOrder.length))];
    }

    // Remover qualquer balão isolado que tenha pulado para dentro de outra banda
    cleanIsolatedIslands(structural);

    // Rosetas de 5" SEMPRE seguem exatamente a cor dominante dos balões grandes que as abraçam
    for (const ros of rosettes) {
      const avgT = ros.reduce((s, m) => s + m.t, 0) / ros.length;
      const fallback = gradOrder[Math.min(gradOrder.length - 1, Math.floor(Math.max(0, Math.min(0.9999, avgT)) * gradOrder.length))];
      const domSlot = getDominantNeighborSlot(ros, structural, fallback);
      for (const m of ros) m.slot = domSlot;
    }

    return meta.map((m) => ({ ...m.piece, slot: m.slot }));
  }

  // =========================================================================
  // MODO 2: BLOCOS ORGÂNICOS (Color Blocking real, ZERO rosetas intrusas!)
  // =========================================================================
  if (mode === 'blocos') {
    const isLarge = meta.length >= 65;
    let seq: BalloonSlot[];
    let cuts: number[];

    if (count === 2) {
      seq = isLarge ? ['A', 'B', 'A', 'B'] : ['A', 'B', 'A'];
      cuts = isLarge ? [0.25, 0.50, 0.75] : [0.34, 0.67];
    } else if (count === 3) {
      seq = isLarge ? ['A', 'B', 'C', 'A'] : ['A', 'B', 'C'];
      cuts = isLarge ? [0.26, 0.52, 0.77] : [0.34, 0.67];
    } else if (count === 4) {
      seq = isLarge ? ['A', 'D', 'B', 'A'] : ['A', 'D', 'B'];
      cuts = isLarge ? [0.23, 0.48, 0.74] : [0.34, 0.67];
    } else {
      seq = isLarge ? ['A', 'D', 'B', 'E', 'A'] : ['A', 'D', 'B', 'E'];
      cuts = isLarge ? [0.20, 0.40, 0.60, 0.80] : [0.25, 0.50, 0.75];
    }

    const blockFor = (tVal: number, snVal: number, zVal: number): BalloonSlot => {
      const seamTilt = snVal / 850;
      const organicWave = Math.sin(tVal * 17 + zVal * 0.09) * 0.012;
      const u = Math.max(0, Math.min(0.9999, tVal + seamTilt + organicWave));
      for (let i = 0; i < cuts.length; i++) {
        if (u < cuts[i]) return seq[i];
      }
      return seq[seq.length - 1];
    };

    for (const b of structural) {
      b.slot = blockFor(b.t, b.sn, b.piece.z ?? 0);
    }

    // Limpar eventuais balões soltos que tenham cruzado a linha do bloco
    cleanIsolatedIslands(structural);

    if (count >= 4) {
      // Em Color Blocking de 4–5 cores, 'C' (cromo/acento) entra EXCLUSIVAMENTE nas COSTURAS entre blocos!
      // Rosetas de 5" dentro de um bloco SEMPRE acompanham a cor do próprio bloco (ZERO manchas intrusas!).
      const cRosCenters: { cx: number; cy: number }[] = [];
      const maxCRosettes = isLarge ? 2 : 1;

      const rosInfo = rosettes.map((ros, rIdx) => {
        const avgT = ros.reduce((s, m) => s + m.t, 0) / ros.length;
        const cx = ros.reduce((s, m) => s + m.piece.x, 0) / ros.length;
        const cy = ros.reduce((s, m) => s + m.piece.y, 0) / ros.length;
        const minSeamDist = cuts.length ? Math.min(...cuts.map((st) => Math.abs(avgT - st))) : 1;
        return { ros, rIdx, avgT, cx, cy, minSeamDist };
      });

      const cRosSet = new Set<number>();
      for (const ri of [...rosInfo].sort((a, b) => a.minSeamDist - b.minSeamDist)) {
        if (cRosSet.size >= maxCRosettes) break;
        // Só vira roseta C se estiver REALMENTE na costura (<= 0.085 da divisória!)
        if (ri.minSeamDist > 0.085) continue;
        if (cRosCenters.some((c) => Math.hypot(c.cx - ri.cx, c.cy - ri.cy) < 115)) continue;
        cRosSet.add(ri.rIdx);
        cRosCenters.push({ cx: ri.cx, cy: ri.cy });
      }

      for (const ri of rosInfo) {
        let rosSlot: BalloonSlot;
        if (cRosSet.has(ri.rIdx)) {
          rosSlot = 'C';
        } else {
          // Acompanha fielmente a cor dominante dos vizinhos do bloco!
          const fallback = blockFor(ri.avgT, 0, 10);
          rosSlot = getDominantNeighborSlot(ri.ros, structural, fallback);
        }
        for (const m of ri.ros) m.slot = rosSlot;
      }

      // Balões médios de destaque C ESTRITAMENTE nas costuras (|t - seamT| <= 0.055)
      const chosenC: ColorMetaPiece[] = [];
      for (const st of cuts) {
        let best: ColorMetaPiece | null = null;
        let bestScore = Infinity;
        for (const q of quads) {
          if (q.piece.sizeInches < 7 || q.piece.sizeInches > 10 || (q.piece.z ?? 0) < 4) continue;
          const d = Math.abs(q.t - st);
          if (d > 0.055) continue;
          if (chosenC.some((c) => Math.hypot(c.piece.x - q.piece.x, c.piece.y - q.piece.y) < 82)) continue;
          if (cRosCenters.some((c) => Math.hypot(c.cx - q.piece.x, c.cy - q.piece.y) < 68)) continue;
          if (d < bestScore) { bestScore = d; best = q; }
        }
        if (best) {
          best.slot = 'C';
          chosenC.push(best);
        }
      }
    } else {
      // 2 ou 3 cores: cada roseta de 5" acompanha fielmente a cor do seu próprio bloco (ZERO cor intrusa!)
      for (const ros of rosettes) {
        const avgT = ros.reduce((s, m) => s + m.t, 0) / ros.length;
        const fallback = blockFor(avgT, 0, 10);
        const domSlot = getDominantNeighborSlot(ros, structural, fallback);
        for (const m of ros) m.slot = domSlot;
      }
    }

    return meta.map((m) => ({ ...m.piece, slot: m.slot }));
  }

  // =========================================================================
  // MODO 3: MESCLADO ORGÂNICO (Ritmo consistente por duplas + rosetas contrastantes limpas)
  // =========================================================================
  const isChromeSlot = (s: BalloonSlot): boolean =>
    Boolean(palette?.finishes && (palette.finishes as any)[s] === 'chrome');

  const bodySlots: BalloonSlot[] =
    count === 2 ? ['A', 'B']
    : count === 3 ? ['A', 'B', 'C']
    : count === 4 ? ['A', 'B', 'D']
    : ['A', 'B', 'D', 'E'];
  const accentSlot: BalloonSlot | null = count >= 4 ? 'C' : null;

  // Evitar colocar balão gigante 18" em cromo quando houver cores não-cromo disponíveis
  const bigCandidates = bodySlots.filter((s) => !isChromeSlot(s));
  const bigPool = bigCandidates.length > 0 ? bigCandidates : bodySlots;
  bigs.forEach((b, idx) => {
    b.slot = bigPool[idx % bigPool.length];
    b.locked = true;
  });

  const cIsChromeIn3 = count === 3 && isChromeSlot('C');
  const quadRecipes: BalloonSlot[][] =
    count === 2 ? [
      ['A', 'A', 'B', 'B'],
      ['B', 'A', 'A', 'B'],
      ['A', 'B', 'B', 'A']
    ] : count === 3 ? (
      cIsChromeIn3
        ? [
            ['A', 'A', 'B', 'B'],
            ['B', 'A', 'C', 'B'],
            ['A', 'B', 'A', 'B'],
            ['B', 'A', 'B', 'C']
          ]
        : [
            ['A', 'A', 'B', 'C'],
            ['B', 'B', 'C', 'A'],
            ['C', 'A', 'B', 'A'],
            ['B', 'C', 'A', 'B']
          ]
    ) : count === 4 ? [
      ['A', 'A', 'B', 'D'],
      ['B', 'B', 'D', 'A'],
      ['D', 'A', 'A', 'B'],
      ['B', 'D', 'A', 'B'],
      ['A', 'B', 'D', 'A']
    ] : [
      ['A', 'A', 'B', 'D'],
      ['B', 'E', 'D', 'A'],
      ['D', 'A', 'E', 'B'],
      ['E', 'B', 'A', 'D']
    ];

  const clusterGroups = new Map<number, ColorMetaPiece[]>();
  for (const q of quads) {
    const cid = q.clusterIdx >= 0 ? q.clusterIdx : Math.floor(q.t * 16);
    const list = clusterGroups.get(cid) || [];
    list.push(q);
    clusterGroups.set(cid, list);
  }
  [...clusterGroups.keys()].sort((a, b) => a - b).forEach((cid, seqIdx) => {
    const members = clusterGroups.get(cid)!;
    const cx = members.reduce((s, m) => s + m.piece.x, 0) / members.length;
    const cy = members.reduce((s, m) => s + m.piece.y, 0) / members.length;
    members.sort((a, b) => Math.atan2(a.piece.y - cy, a.piece.x - cx) - Math.atan2(b.piece.y - cy, b.piece.x - cx));
    const recipe = quadRecipes[seqIdx % quadRecipes.length];
    const rotShift = (seqIdx + Math.floor(seqIdx / 2)) % 4;
    members.forEach((m, k) => {
      m.slot = recipe[(k + rotShift) % 4];
    });
  });

  const getTouching = (target: ColorMetaPiece, list: ColorMetaPiece[], factor: number = 1.05): ColorMetaPiece[] =>
    list.filter((o) => o.origIdx !== target.origIdx && Math.hypot(o.piece.x - target.piece.x, o.piece.y - target.piece.y) < (target.r + o.r) * factor);

  // Moldura contrastante nos 16"/18" (apenas quando temos >= 3 cores de corpo, para não criar anel de 5 iguais em 2 cores!)
  if (bodySlots.length >= 3) {
    for (const big of bigs) {
      for (const q of getTouching(big, quads, 1.04).filter((x) => !x.locked && (x.piece.z ?? 0) >= -8)) {
        if (q.slot === big.slot) {
          const qn = getTouching(q, structural, 1.05);
          const cands = bodySlots.filter((s) => s !== big.slot);
          q.slot = cands.sort((a, b) => qn.filter((n) => n.slot === a).length - qn.filter((n) => n.slot === b).length)[0];
        }
      }
    }
  }

  // Anti-mancha pesada (2 passagens)
  const clumpLimit = count === 2 ? 4 : 3;
  for (let pass = 0; pass < 2; pass++) {
    for (const q of quads) {
      if (q.locked) continue;
      const neighs = getTouching(q, structural, 1.05).filter((n) => (n.piece.z ?? 0) >= -10);
      const sameCnt = neighs.filter((n) => n.slot === q.slot).length;
      if (sameCnt >= clumpLimit) {
        let bestS = q.slot;
        let bestCnt = sameCnt;
        for (const s of bodySlots) {
          if (s === q.slot) continue;
          const touchesSameBig = count >= 3 && neighs.some((n) => n.kind === 'big' && n.slot === s);
          const cnt = neighs.filter((n) => n.slot === s).length + (touchesSameBig ? 3 : 0);
          if (cnt < bestCnt) { bestCnt = cnt; bestS = s; }
        }
        q.slot = bestS;
      }
    }
  }

  // Rosetas de 5" monocromáticas com forte peso nos vizinhos fisicamente encostados
  const rosetteMeta = rosettes.map((ros, idx) => {
    const cx = ros.reduce((s, m) => s + m.piece.x, 0) / ros.length;
    const cy = ros.reduce((s, m) => s + m.piece.y, 0) / ros.length;
    const neighborCounts: Record<string, number> = {};
    for (const s of structural) {
      const d = Math.hypot(s.piece.x - cx, s.piece.y - cy);
      if (d < s.r + 44 && (s.piece.z ?? 0) >= -8) {
        const directTouch = d < s.r + 22;
        const w = directTouch ? (s.piece.sizeInches >= 16 ? 8.0 : 6.0) : (s.piece.sizeInches >= 16 ? 3.0 : 1.0);
        neighborCounts[s.slot] = (neighborCounts[s.slot] || 0) + w;
      }
    }
    return { ros, idx, cx, cy, neighborCounts };
  });

  const cRosetteSet = new Set<number>();
  const cRosetteCenters: { cx: number; cy: number }[] = [];
  if (accentSlot && rosetteMeta.length > 0) {
    const pickIndices =
      rosetteMeta.length >= 4 ? [1, rosetteMeta.length - 1]
      : rosetteMeta.length === 3 ? [2]
      : [0];
    for (const pi of pickIndices) {
      cRosetteSet.add(rosetteMeta[pi].idx);
      cRosetteCenters.push({ cx: rosetteMeta[pi].cx, cy: rosetteMeta[pi].cy });
    }
  }

  const usedBodyRosSlots: BalloonSlot[] = [];
  rosetteMeta.forEach((rm) => {
    let chosenSlot: BalloonSlot;
    if (accentSlot && cRosetteSet.has(rm.idx)) {
      chosenSlot = accentSlot;
    } else {
      const prefOrder: BalloonSlot[] = count >= 4 ? ['D', 'B', 'A'] : bodySlots;
      let bestS = prefOrder[0];
      let bestPenalty = Infinity;
      for (const s of prefOrder) {
        const neighPen = rm.neighborCounts[s] || 0;
        const repeatPen = usedBodyRosSlots[usedBodyRosSlots.length - 1] === s ? 3.0 : 0;
        const countPen = usedBodyRosSlots.filter((x) => x === s).length * 1.5;
        const pen = neighPen + repeatPen + countPen;
        if (pen < bestPenalty) { bestPenalty = pen; bestS = s; }
      }
      chosenSlot = bestS;
      usedBodyRosSlots.push(chosenSlot);
    }
    for (const m of rm.ros) m.slot = chosenSlot;
  });

  // Balões médios de acento C triangulados e BEM afastados das rosetas C (>= 78px!)
  if (accentSlot) {
    const accentPieces: ColorMetaPiece[] = [];
    const targetAccentTs = meta.length < 60 ? [0.22, 0.54, 0.85] : [0.16, 0.40, 0.62, 0.85];
    const desiredSides = [1, -1, 1, -1];

    targetAccentTs.forEach((targetT, idx) => {
      let best: ColorMetaPiece | null = null;
      let bestScore = -Infinity;
      const wantSide = desiredSides[idx % desiredSides.length];
      for (const q of quads) {
        if (q.locked) continue;
        if (q.piece.sizeInches !== 7 && q.piece.sizeInches !== 9 && q.piece.sizeInches !== 10) continue;
        if ((q.piece.z ?? 0) < 4) continue;
        if (accentPieces.some((a) => Math.hypot(a.piece.x - q.piece.x, a.piece.y - q.piece.y) < 88)) continue;
        if (cRosetteCenters.some((c) => Math.hypot(c.cx - q.piece.x, c.cy - q.piece.y) < 78)) continue;
        const dt = Math.abs(q.t - targetT);
        if (dt > 0.16) continue;
        const sideBonus = Math.sign(q.sn) === wantSide ? 0.04 : 0;
        const sizeBonus = q.piece.sizeInches === 9 ? 0.03 : q.piece.sizeInches === 10 ? 0.02 : 0.01;
        const score = -dt + sideBonus + sizeBonus;
        if (score > bestScore) { bestScore = score; best = q; }
      }
      if (best) {
        best.slot = accentSlot;
        best.locked = true;
        accentPieces.push(best);
      }
    });
  }

  return meta.map((m) => ({ ...m.piece, slot: m.slot }));
}

// Variação orgânica com semente nova mantendo a integridade do modelo
export function variateArrangement(pieces: BalloonPiece[]): BalloonPiece[] {
  if (pieces.length === 0) return [];
  const slots: BalloonSlot[] = ['A', 'B', 'C', 'D'];
  return pieces.map((p) => {
    let slot = p.slot;
    if (Math.random() < 0.38) {
      slot = slots[Math.floor(Math.random() * slots.length)];
    }
    const jx = Math.round((Math.random() - 0.5) * 6);
    const jy = Math.round((Math.random() - 0.5) * 6);
    return {
      ...p,
      x: p.x + jx,
      y: p.y + jy,
      slot
    };
  });
}

// Ajusta a densidade do volume do arranjo (Enxuto / Padrão / Super Cheio)
export function applyVolumeLevel(
  templatePieces: BalloonPiece[],
  volume: 'enxuto' | 'padrao' | 'cheio'
): BalloonPiece[] {
  if (volume === 'padrao') return JSON.parse(JSON.stringify(templatePieces));

  if (volume === 'enxuto') {
    return templatePieces.filter((_, idx) => idx % 4 !== 3);
  }

  // 'cheio'
  const extra: BalloonPiece[] = [];
  const baseId = Date.now();
  for (let i = 0; i < templatePieces.length; i += 3) {
    const p = templatePieces[i];
    extra.push({
      id: `vol-${baseId}-${i}`,
      x: p.x + Math.round(Math.sin(i) * 16),
      y: p.y + Math.round(Math.cos(i) * 16),
      sizeInches: p.sizeInches === 18 ? 10 : 5,
      slot: p.slot,
      finish: p.finish,
      source: 'model'
    });
  }
  return [...templatePieces, ...extra];
}

// Renderiza o SVG completo da montagem recortado com precisão
export function renderArrangementSvg(
  pieces: BalloonPiece[],
  palette: BalloonPaletteConfig,
  options: { pad?: number; hasFloorShadow?: boolean; idPrefix?: string } = {}
): { svg: string; widthCm: number; heightCm: number; viewBox: string; stats: ArrangementStats } {
  if (pieces.length === 0) {
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"></svg>`,
      widthCm: 50,
      heightCm: 50,
      viewBox: '0 0 200 200',
      stats: calculateArrangementStats([])
    };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pieces) {
    const r = BALLOON_SIZE_RADIUS_MAP[p.sizeInches] || 28;
    if (p.x - r < minX) minX = p.x - r;
    if (p.x + r > maxX) maxX = p.x + r;
    if (p.y - r < minY) minY = p.y - r;
    if (p.y + r > maxY) maxY = p.y + r;
  }

  const pad = options.pad ?? 20;
  const bx = Math.floor(minX - pad);
  const by = Math.floor(minY - pad);
  const bw = Math.ceil(maxX - minX + pad * 2);
  const bh = Math.ceil(maxY - minY + pad * 2);
  const viewBox = `${bx} ${by} ${bw} ${bh}`;

  const idPrefix = options.idPrefix || "";
  const defs = generateStudioDefs(palette, idPrefix);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${bw}" height="${bh}">
    <defs>${defs}</defs>
  `;

  if (options.hasFloorShadow === true) {
    const floorY = maxY + 6;
    svg += `<ellipse cx="${(minX + maxX) / 2}" cy="${floorY}" rx="${(maxX - minX) * 0.40}" ry="12" fill="url(#${idPrefix}floorShadowGrad)"/>`;
  }

  // Ordena por profundidade física automática (maiores atrás, pontos de luz 5" na frente)
  const sortedPieces = sortPiecesByDepth(pieces);
  for (const p of sortedPieces) {
    svg += renderBalloonPieceSvg(p, palette, idPrefix);
  }

  svg += `</svg>`;

  const stats = calculateArrangementStats(pieces);

  return {
    svg,
    widthCm: stats.widthCm || 50,
    heightCm: stats.heightCm || 50,
    viewBox,
    stats
  };
}

export function arrangementSvgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ----------------------------------------------------------------------
// OS 10 MODELOS REALISTAS PRÉ-CRIADOS BASEADOS EM ARRANJOS POPULARES
// ----------------------------------------------------------------------

export const BALLOON_STUDIO_TEMPLATES: BalloonModelTemplate[] = [
  {
    id: "modelo-arco-l-luxo",
    name: "Arco Orgânico em L (Romano / Retangular)",
    description: "Coluna volumosa apoiada no piso, quina superior esquerda cheia e braço horizontal afinado, com cores equilibradas por duplas e ouro cromo em 12–15%.",
    palette: {"A":"#c97a8e","B":"#f7dbe1","C":"#d4af37","D":"#fdfbf7","names":{"A":"Rosa Quartzo","B":"Blush Suave","C":"Ouro Nobre","D":"Off-White Pérola","E":"Pérola"},"finishes":{"A":"satin","B":"satin","C":"chrome","D":"matte","E":"satin"}},
    defaultWidthCm: 212,
    defaultHeightCm: 228,
    pieces: [
      { id: "q94", x: 331, y: 124, z: -16, sizeInches: 7, slot: "D", finish: "satin", rotation: -15 },
      { id: "q19", x: 80, y: 373, z: -13, sizeInches: 12, slot: "D", finish: "satin", rotation: 2 },
      { id: "q37", x: 76, y: 231, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 2 },
      { id: "q43", x: 78, y: 185, z: -13, sizeInches: 12, slot: "D", finish: "satin", rotation: 3 },
      { id: "q1", x: 138, y: 465, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: -9 },
      { id: "q25", x: 83, y: 324, z: -11, sizeInches: 12, slot: "B", finish: "satin", rotation: 2 },
      { id: "q75", x: 251, y: 107, z: -11, sizeInches: 7, slot: "D", finish: "satin", rotation: -14 },
      { id: "big102", x: 120, y: 118, z: -9, sizeInches: 16, slot: "D", finish: "satin", rotation: -5 },
      { id: "q67", x: 210, y: 147, z: -9, sizeInches: 9, slot: "A", finish: "satin", rotation: 15 },
      { id: "big100", x: 14, y: 466, z: -7, sizeInches: 18, slot: "A", finish: "satin", rotation: -2 },
      { id: "big101", x: 5, y: 201, z: -7, sizeInches: 18, slot: "B", finish: "satin", rotation: -3 },
      { id: "q23", x: 17, y: 348, z: -7, sizeInches: 12, slot: "A", finish: "satin", rotation: -24 },
      { id: "q31", x: 82, y: 276, z: -7, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "q13", x: 81, y: 419, z: -6, sizeInches: 12, slot: "D", finish: "satin", rotation: 1 },
      { id: "q82", x: 279, y: 105, z: -4, sizeInches: 7, slot: "B", finish: "satin", rotation: -14 },
      { id: "q73", x: 245, y: 150, z: -4, sizeInches: 9, slot: "D", finish: "satin", rotation: 15 },
      { id: "q65", x: 189, y: 98, z: -3, sizeInches: 9, slot: "D", finish: "satin", rotation: -12 },
      { id: "q80", x: 276, y: 150, z: -3, sizeInches: 7, slot: "B", finish: "satin", rotation: 16 },
      { id: "q71", x: 224, y: 98, z: -3, sizeInches: 9, slot: "A", finish: "satin", rotation: -12 },
      { id: "q55", x: 132, y: 165, z: -3, sizeInches: 12, slot: "A", finish: "satin", rotation: 14 },
      { id: "q29", x: 21, y: 301, z: -1, sizeInches: 12, slot: "B", finish: "satin", rotation: -27 },
      { id: "q88", x: 305, y: 152, z: 0, sizeInches: 7, slot: "D", finish: "satin", rotation: 17 },
      { id: "q98", x: 353, y: 124, z: 0, sizeInches: 7, slot: "A", finish: "satin", rotation: -13 },
      { id: "q90", x: 314, y: 110, z: 1, sizeInches: 7, slot: "A", finish: "satin", rotation: -13 },
      { id: "q96", x: 339, y: 153, z: 2, sizeInches: 5, slot: "B", finish: "satin", rotation: 17 },
      { id: "q35", x: 14, y: 257, z: 3, sizeInches: 12, slot: "A", finish: "satin", rotation: -27 },
      { id: "q17", x: 14, y: 397, z: 3, sizeInches: 12, slot: "B", finish: "satin", rotation: -25 },
      { id: "q61", x: 178, y: 152, z: 4, sizeInches: 9, slot: "D", finish: "satin", rotation: 15 },
      { id: "q53", x: 89, y: 99, z: 6, sizeInches: 9, slot: "A", finish: "satin", rotation: -14 },
      { id: "q77", x: 262, y: 115, z: 6, sizeInches: 5, slot: "A", finish: "satin", rotation: -11 },
      { id: "q85", x: 294, y: 119, z: 6, sizeInches: 5, slot: "D", finish: "satin", rotation: -12 },
      { id: "q93", x: 330, y: 126, z: 8, sizeInches: 5, slot: "A", finish: "satin", rotation: -9 },
      { id: "q4", x: 106, y: 457, z: 10, sizeInches: 10, slot: "B", finish: "satin", rotation: -10 },
      { id: "q92", x: 324, y: 143, z: 11, sizeInches: 5, slot: "B", finish: "satin", rotation: 19 },
      { id: "q89", x: 310, y: 130, z: 11, sizeInches: 5, slot: "B", finish: "satin", rotation: -6 },
      { id: "q44", x: 30, y: 157, z: 12, sizeInches: 10, slot: "A", finish: "satin", rotation: -22 },
      { id: "q59", x: 157, y: 103, z: 12, sizeInches: 9, slot: "A", finish: "satin", rotation: -13 },
      { id: "q97", x: 343, y: 140, z: 13, sizeInches: 5, slot: "D", finish: "satin", rotation: -6 },
      { id: "q57", x: 125, y: 91, z: 13, sizeInches: 9, slot: "B", finish: "satin", rotation: -17 },
      { id: "q62", x: 179, y: 122, z: 14, sizeInches: 7, slot: "B", finish: "satin", rotation: -10 },
      { id: "q46", x: 49, y: 125, z: 14, sizeInches: 10, slot: "C", finish: "satin", rotation: 9 },
      { id: "q70", x: 227, y: 133, z: 14, sizeInches: 7, slot: "B", finish: "satin", rotation: 15 },
      { id: "q81", x: 278, y: 118, z: 15, sizeInches: 5, slot: "A", finish: "satin", rotation: -12 },
      { id: "q74", x: 243, y: 111, z: 16, sizeInches: 7, slot: "C", finish: "satin", rotation: -10 },
      { id: "q68", x: 207, y: 113, z: 16, sizeInches: 7, slot: "A", finish: "satin", rotation: -8 },
      { id: "q64", x: 199, y: 136, z: 17, sizeInches: 7, slot: "B", finish: "satin", rotation: 15 },
      { id: "q40", x: 68, y: 206, z: 17, sizeInches: 10, slot: "A", finish: "satin", rotation: 3 },
      { id: "m109", x: 52, y: 314, z: 17, sizeInches: 5, slot: "C", finish: "satin", rotation: 4 },
      { id: "q84", x: 290, y: 138, z: 18, sizeInches: 7, slot: "A", finish: "satin", rotation: 18 },
      { id: "q8", x: 56, y: 486, z: 18, sizeInches: 10, slot: "B", finish: "satin", rotation: 21 },
      { id: "q2", x: 128, y: 486, z: 18, sizeInches: 10, slot: "A", finish: "satin", rotation: 20 },
      { id: "q10", x: 69, y: 449, z: 18, sizeInches: 10, slot: "B", finish: "satin", rotation: 2 },
      { id: "q22", x: 70, y: 350, z: 19, sizeInches: 10, slot: "B", finish: "satin", rotation: 3 },
      { id: "q76", x: 260, y: 135, z: 19, sizeInches: 7, slot: "D", finish: "satin", rotation: 17 },
      { id: "q14", x: 45, y: 419, z: 19, sizeInches: 10, slot: "C", finish: "satin", rotation: -25 },
      { id: "m119", x: 131, y: 133, z: 20, sizeInches: 5, slot: "C", finish: "satin", rotation: -3 },
      { id: "q16", x: 65, y: 390, z: 20, sizeInches: 10, slot: "D", finish: "satin", rotation: 2 },
      { id: "q28", x: 67, y: 304, z: 20, sizeInches: 10, slot: "D", finish: "satin", rotation: 3 },
      { id: "m107", x: 38, y: 302, z: 21, sizeInches: 5, slot: "C", finish: "satin", rotation: 2 },
      { id: "q50", x: 83, y: 126, z: 21, sizeInches: 9, slot: "A", finish: "satin", rotation: -13 },
      { id: "q38", x: 40, y: 231, z: 21, sizeInches: 10, slot: "C", finish: "satin", rotation: -22 },
      { id: "q26", x: 41, y: 330, z: 21, sizeInches: 10, slot: "D", finish: "satin", rotation: -24 },
      { id: "q20", x: 37, y: 369, z: 21, sizeInches: 10, slot: "B", finish: "satin", rotation: -23 },
      { id: "q49", x: 70, y: 160, z: 22, sizeInches: 12, slot: "B", finish: "satin", rotation: 12 },
      { id: "m114", x: 61, y: 180, z: 22, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "q34", x: 70, y: 246, z: 22, sizeInches: 10, slot: "B", finish: "satin", rotation: 2 },
      { id: "q58", x: 152, y: 137, z: 22, sizeInches: 10, slot: "B", finish: "satin", rotation: 16 },
      { id: "q32", x: 44, y: 275, z: 24, sizeInches: 10, slot: "D", finish: "satin", rotation: -25 },
      { id: "m112", x: 47, y: 168, z: 25, sizeInches: 5, slot: "D", finish: "satin", rotation: 6 },
      { id: "q52", x: 109, y: 149, z: 25, sizeInches: 10, slot: "A", finish: "satin", rotation: 16 },
      { id: "m117", x: 144, y: 121, z: 26, sizeInches: 5, slot: "C", finish: "satin", rotation: 8 },
      { id: "m105", x: 50, y: 437, z: 26, sizeInches: 5, slot: "A", finish: "satin", rotation: -7 },
      { id: "q56", x: 123, y: 119, z: 30, sizeInches: 9, slot: "B", finish: "satin", rotation: -12 },
      { id: "m103", x: 66, y: 430, z: 32, sizeInches: 5, slot: "A", finish: "satin", rotation: 1 },
      { id: "m110", x: 41, y: 317, z: 33, sizeInches: 5, slot: "C", finish: "satin", rotation: 6 },
      { id: "q5", x: 90, y: 481, z: 33, sizeInches: 12, slot: "D", finish: "satin", rotation: 17 },
      { id: "q41", x: 39, y: 190, z: 34, sizeInches: 12, slot: "D", finish: "satin", rotation: -25 },
      { id: "m108", x: 53, y: 303, z: 35, sizeInches: 5, slot: "C", finish: "satin", rotation: 5 },
      { id: "q11", x: 37, y: 452, z: 36, sizeInches: 12, slot: "D", finish: "satin", rotation: -27 },
      { id: "m115", x: 50, y: 183, z: 38, sizeInches: 5, slot: "D", finish: "satin", rotation: 6 },
      { id: "m120", x: 130, y: 122, z: 39, sizeInches: 5, slot: "C", finish: "satin", rotation: 5 },
      { id: "m113", x: 61, y: 169, z: 40, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "m118", x: 143, y: 134, z: 42, sizeInches: 5, slot: "C", finish: "satin", rotation: -12 },
      { id: "m106", x: 52, y: 427, z: 45, sizeInches: 5, slot: "A", finish: "satin", rotation: -10 },
      { id: "m104", x: 61, y: 442, z: 48, sizeInches: 5, slot: "A", finish: "satin", rotation: -7 },
      { id: "m111", x: 45, y: 309, z: 52, sizeInches: 5, slot: "C", finish: "satin", rotation: 2 },
      { id: "m116", x: 54, y: 175, z: 57, sizeInches: 5, slot: "D", finish: "satin", rotation: -3 }
    ]
  },
  {
    id: "modelo-cascata-romana",
    name: "Cascata Romana em S",
    description: "Cascata orgânica em S com quartetos reais descendo do topo esquerdo até base volumosa apoiada no piso, com rosetas monocromáticas de 5\" e ouro velho.",
    palette: {"A":"#4d6b2c","B":"#85512b","C":"#c59a3f","D":"#f7eed7","names":{"A":"Verde Oliva","B":"Caramelo","C":"Ouro Velho","D":"Areia Nude","E":"Branco Neve"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"satin","E":"satin"}},
    defaultWidthCm: 107,
    defaultHeightCm: 216,
    pieces: [
      { id: "q23", x: 159, y: 182, z: -15, sizeInches: 9, slot: "B", finish: "satin", rotation: -4 },
      { id: "q27", x: 107, y: 230, z: -13, sizeInches: 12, slot: "D", finish: "satin", rotation: -23 },
      { id: "q39", x: 64, y: 306, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: -23 },
      { id: "q67", x: 176, y: 456, z: -12, sizeInches: 12, slot: "A", finish: "satin", rotation: -11 },
      { id: "q3", x: 62, y: 109, z: -10, sizeInches: 7, slot: "A", finish: "satin", rotation: -12 },
      { id: "big69", x: 133, y: 303, z: -9, sizeInches: 16, slot: "A", finish: "satin", rotation: 2 },
      { id: "q45", x: 44, y: 361, z: -8, sizeInches: 12, slot: "B", finish: "satin", rotation: -25 },
      { id: "big70", x: 72, y: 466, z: -7, sizeInches: 18, slot: "B", finish: "satin", rotation: 4 },
      { id: "q25", x: 166, y: 213, z: -7, sizeInches: 9, slot: "B", finish: "satin", rotation: 2 },
      { id: "q51", x: 41, y: 419, z: -4, sizeInches: 12, slot: "A", finish: "satin", rotation: 26 },
      { id: "q11", x: 95, y: 111, z: -4, sizeInches: 7, slot: "B", finish: "satin", rotation: -12 },
      { id: "q9", x: 74, y: 153, z: -3, sizeInches: 9, slot: "A", finish: "satin", rotation: 17 },
      { id: "q43", x: 118, y: 357, z: -1, sizeInches: 12, slot: "D", finish: "satin", rotation: 4 },
      { id: "q21", x: 101, y: 188, z: 0, sizeInches: 12, slot: "B", finish: "satin", rotation: 26 },
      { id: "q13", x: 125, y: 118, z: 4, sizeInches: 9, slot: "B", finish: "satin", rotation: -6 },
      { id: "q33", x: 79, y: 260, z: 5, sizeInches: 12, slot: "D", finish: "satin", rotation: -22 },
      { id: "q19", x: 150, y: 156, z: 6, sizeInches: 9, slot: "D", finish: "satin", rotation: -3 },
      { id: "q66", x: 195, y: 485, z: 6, sizeInches: 10, slot: "C", finish: "satin", rotation: 17 },
      { id: "q49", x: 94, y: 385, z: 6, sizeInches: 9, slot: "B", finish: "satin", rotation: 1 },
      { id: "q1", x: 48, y: 136, z: 6, sizeInches: 7, slot: "B", finish: "satin", rotation: 17 },
      { id: "q6", x: 77, y: 116, z: 7, sizeInches: 5, slot: "B", finish: "satin", rotation: -11 },
      { id: "q55", x: 109, y: 418, z: 8, sizeInches: 9, slot: "A", finish: "satin", rotation: -3 },
      { id: "q16", x: 120, y: 144, z: 10, sizeInches: 7, slot: "A", finish: "satin", rotation: -2 },
      { id: "q2", x: 58, y: 117, z: 11, sizeInches: 5, slot: "A", finish: "satin", rotation: -7 },
      { id: "q12", x: 98, y: 153, z: 14, sizeInches: 7, slot: "D", finish: "satin", rotation: 21 },
      { id: "q31", x: 152, y: 263, z: 14, sizeInches: 12, slot: "D", finish: "satin", rotation: 6 },
      { id: "q22", x: 154, y: 190, z: 15, sizeInches: 9, slot: "D", finish: "satin", rotation: 3 },
      { id: "q28", x: 150, y: 226, z: 16, sizeInches: 9, slot: "B", finish: "satin", rotation: 7 },
      { id: "q10", x: 98, y: 127, z: 16, sizeInches: 7, slot: "D", finish: "satin", rotation: -8 },
      { id: "q54", x: 75, y: 421, z: 16, sizeInches: 10, slot: "A", finish: "satin", rotation: -27 },
      { id: "q42", x: 59, y: 333, z: 18, sizeInches: 10, slot: "A", finish: "satin", rotation: -22 },
      { id: "m73", x: 129, y: 194, z: 18, sizeInches: 5, slot: "D", finish: "satin", rotation: -10 },
      { id: "q40", x: 94, y: 331, z: 19, sizeInches: 10, slot: "B", finish: "satin", rotation: 7 },
      { id: "q48", x: 57, y: 389, z: 19, sizeInches: 10, slot: "D", finish: "satin", rotation: -26 },
      { id: "q36", x: 84, y: 297, z: 19, sizeInches: 10, slot: "D", finish: "satin", rotation: -22 },
      { id: "m77", x: 97, y: 306, z: 20, sizeInches: 5, slot: "A", finish: "satin", rotation: 10 },
      { id: "q5", x: 73, y: 134, z: 20, sizeInches: 7, slot: "D", finish: "satin", rotation: 19 },
      { id: "q64", x: 139, y: 452, z: 21, sizeInches: 10, slot: "B", finish: "satin", rotation: -7 },
      { id: "q63", x: 157, y: 480, z: 21, sizeInches: 12, slot: "D", finish: "satin", rotation: 17 },
      { id: "q30", x: 118, y: 241, z: 22, sizeInches: 10, slot: "B", finish: "satin", rotation: -19 },
      { id: "q24", x: 125, y: 207, z: 22, sizeInches: 10, slot: "A", finish: "satin", rotation: -25 },
      { id: "q60", x: 115, y: 483, z: 23, sizeInches: 10, slot: "A", finish: "satin", rotation: 20 },
      { id: "m75", x: 92, y: 323, z: 23, sizeInches: 5, slot: "A", finish: "satin", rotation: -3 },
      { id: "q46", x: 79, y: 362, z: 24, sizeInches: 10, slot: "C", finish: "satin", rotation: 4 },
      { id: "m71", x: 142, y: 183, z: 24, sizeInches: 5, slot: "D", finish: "satin", rotation: 11 },
      { id: "q58", x: 105, y: 445, z: 24, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "q34", x: 113, y: 274, z: 25, sizeInches: 10, slot: "C", finish: "satin", rotation: 9 },
      { id: "m82", x: 88, y: 448, z: 26, sizeInches: 5, slot: "C", finish: "satin", rotation: 10 },
      { id: "q18", x: 126, y: 169, z: 26, sizeInches: 10, slot: "C", finish: "satin", rotation: 27 },
      { id: "q52", x: 91, y: 402, z: 29, sizeInches: 9, slot: "B", finish: "satin", rotation: 4 },
      { id: "m80", x: 86, y: 431, z: 32, sizeInches: 5, slot: "C", finish: "satin", rotation: 9 },
      { id: "q37", x: 119, y: 311, z: 34, sizeInches: 12, slot: "B", finish: "satin", rotation: 4 },
      { id: "m78", x: 105, y: 315, z: 36, sizeInches: 5, slot: "A", finish: "satin", rotation: 5 },
      { id: "q57", x: 73, y: 458, z: 37, sizeInches: 12, slot: "D", finish: "satin", rotation: 23 },
      { id: "m74", x: 127, y: 183, z: 37, sizeInches: 5, slot: "D", finish: "satin", rotation: 7 },
      { id: "m76", x: 87, y: 309, z: 38, sizeInches: 5, slot: "A", finish: "satin", rotation: -8 },
      { id: "m72", x: 140, y: 196, z: 40, sizeInches: 5, slot: "D", finish: "satin", rotation: 8 },
      { id: "m83", x: 78, y: 444, z: 45, sizeInches: 5, slot: "C", finish: "satin", rotation: -4 },
      { id: "m81", x: 95, y: 440, z: 48, sizeInches: 5, slot: "C", finish: "satin", rotation: -2 },
      { id: "m79", x: 96, y: 314, z: 55, sizeInches: 5, slot: "A", finish: "satin", rotation: 8 }
    ]
  },
  {
    id: "modelo-demi-arco",
    name: "Arco Desconstruído Painel Redondo",
    description: "Quartetos encaixados a 45° no painel redondo Ø 1,50 m, cachos monocromáticos de 5\" nos bolsões reais e mesclado consistente por duplas do chão até a ponta.",
    palette: {"A":"#f8b4d9","B":"#d8b4fe","C":"#93c5fd","D":"#fef08a","names":{"A":"Rosa Doce","B":"Lilás Lavanda","C":"Azul Céu","D":"Amarelo Candy","E":"Branco Neve"},"finishes":{"A":"matte","B":"matte","C":"satin","D":"matte","E":"satin"}},
    defaultWidthCm: 197,
    defaultHeightCm: 225,
    pieces: [
      { id: "q57", x: 168, y: 118, z: -16, sizeInches: 9, slot: "B", finish: "satin", rotation: -17 },
      { id: "q13", x: 77, y: 412, z: -13, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "q31", x: 62, y: 273, z: -13, sizeInches: 12, slot: "D", finish: "satin", rotation: 3 },
      { id: "q43", x: 95, y: 203, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 8 },
      { id: "q1", x: 143, y: 468, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: -9 },
      { id: "q19", x: 70, y: 367, z: -13, sizeInches: 12, slot: "B", finish: "satin", rotation: 2 },
      { id: "q49", x: 135, y: 182, z: -13, sizeInches: 12, slot: "B", finish: "satin", rotation: 11 },
      { id: "q25", x: 68, y: 320, z: -12, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "q94", x: 332, y: 231, z: -11, sizeInches: 7, slot: "A", finish: "satin", rotation: -8 },
      { id: "big98", x: 122, y: 114, z: -9, sizeInches: 16, slot: "D", finish: "satin", rotation: 3 },
      { id: "q75", x: 280, y: 148, z: -9, sizeInches: 7, slot: "B", finish: "satin", rotation: -9 },
      { id: "q95", x: 310, y: 232, z: -7, sizeInches: 5, slot: "D", finish: "satin", rotation: 21 },
      { id: "big96", x: 16, y: 457, z: -7, sizeInches: 18, slot: "A", finish: "satin", rotation: -4 },
      { id: "big97", x: 39, y: 220, z: -7, sizeInches: 18, slot: "B", finish: "satin", rotation: -3 },
      { id: "q47", x: 75, y: 138, z: -5, sizeInches: 12, slot: "B", finish: "satin", rotation: -17 },
      { id: "q29", x: 0, y: 300, z: -5, sizeInches: 12, slot: "D", finish: "satin", rotation: -27 },
      { id: "q90", x: 333, y: 203, z: -4, sizeInches: 7, slot: "A", finish: "satin", rotation: -5 },
      { id: "q67", x: 233, y: 169, z: -3, sizeInches: 9, slot: "A", finish: "satin", rotation: 18 },
      { id: "q65", x: 231, y: 116, z: -3, sizeInches: 9, slot: "D", finish: "satin", rotation: -11 },
      { id: "q23", x: 6, y: 349, z: -2, sizeInches: 12, slot: "B", finish: "satin", rotation: -26 },
      { id: "q73", x: 260, y: 182, z: -1, sizeInches: 7, slot: "D", finish: "satin", rotation: 19 },
      { id: "q82", x: 313, y: 171, z: 3, sizeInches: 7, slot: "B", finish: "satin", rotation: -8 },
      { id: "q80", x: 280, y: 201, z: 3, sizeInches: 7, slot: "B", finish: "satin", rotation: 21 },
      { id: "q17", x: 9, y: 398, z: 4, sizeInches: 12, slot: "B", finish: "satin", rotation: -27 },
      { id: "q88", x: 303, y: 219, z: 4, sizeInches: 5, slot: "A", finish: "satin", rotation: 24 },
      { id: "q77", x: 290, y: 164, z: 5, sizeInches: 5, slot: "A", finish: "satin", rotation: -7 },
      { id: "q85", x: 315, y: 192, z: 6, sizeInches: 5, slot: "D", finish: "satin", rotation: -3 },
      { id: "q59", x: 190, y: 111, z: 7, sizeInches: 9, slot: "A", finish: "satin", rotation: -12 },
      { id: "q55", x: 176, y: 170, z: 7, sizeInches: 12, slot: "D", finish: "satin", rotation: 13 },
      { id: "q74", x: 271, y: 160, z: 7, sizeInches: 5, slot: "A", finish: "satin", rotation: -1 },
      { id: "q81", x: 296, y: 183, z: 8, sizeInches: 5, slot: "A", finish: "satin", rotation: -5 },
      { id: "q92", x: 318, y: 232, z: 9, sizeInches: 5, slot: "B", finish: "satin", rotation: 27 },
      { id: "q93", x: 334, y: 223, z: 9, sizeInches: 5, slot: "A", finish: "satin", rotation: -4 },
      { id: "q35", x: 1, y: 249, z: 10, sizeInches: 12, slot: "A", finish: "satin", rotation: -23 },
      { id: "q37", x: 83, y: 240, z: 10, sizeInches: 12, slot: "D", finish: "satin", rotation: 5 },
      { id: "q41", x: 39, y: 170, z: 10, sizeInches: 12, slot: "A", finish: "satin", rotation: -21 },
      { id: "q89", x: 318, y: 212, z: 11, sizeInches: 5, slot: "B", finish: "satin", rotation: -4 },
      { id: "q4", x: 114, y: 455, z: 12, sizeInches: 10, slot: "B", finish: "satin", rotation: -8 },
      { id: "q64", x: 213, y: 154, z: 13, sizeInches: 7, slot: "B", finish: "satin", rotation: 20 },
      { id: "q68", x: 237, y: 141, z: 14, sizeInches: 7, slot: "A", finish: "satin", rotation: -6 },
      { id: "q11", x: 52, y: 481, z: 15, sizeInches: 12, slot: "D", finish: "satin", rotation: 24 },
      { id: "q71", x: 268, y: 137, z: 15, sizeInches: 9, slot: "C", finish: "satin", rotation: -8 },
      { id: "q62", x: 212, y: 128, z: 16, sizeInches: 7, slot: "B", finish: "satin", rotation: -10 },
      { id: "q56", x: 162, y: 131, z: 17, sizeInches: 9, slot: "B", finish: "satin", rotation: -13 },
      { id: "q10", x: 76, y: 431, z: 17, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "q50", x: 105, y: 148, z: 17, sizeInches: 9, slot: "B", finish: "satin", rotation: -15 },
      { id: "q58", x: 190, y: 140, z: 17, sizeInches: 7, slot: "A", finish: "satin", rotation: 16 },
      { id: "m114", x: 171, y: 145, z: 18, sizeInches: 5, slot: "C", finish: "satin", rotation: -1 },
      { id: "q28", x: 53, y: 298, z: 18, sizeInches: 10, slot: "B", finish: "satin", rotation: 2 },
      { id: "q70", x: 253, y: 163, z: 19, sizeInches: 7, slot: "B", finish: "satin", rotation: 21 },
      { id: "q16", x: 62, y: 392, z: 19, sizeInches: 10, slot: "D", finish: "satin", rotation: 1 },
      { id: "q76", x: 279, y: 178, z: 19, sizeInches: 7, slot: "D", finish: "satin", rotation: 22 },
      { id: "q22", x: 57, y: 344, z: 19, sizeInches: 10, slot: "A", finish: "satin", rotation: 3 },
      { id: "q2", x: 133, y: 486, z: 20, sizeInches: 10, slot: "A", finish: "satin", rotation: 21 },
      { id: "q46", x: 109, y: 182, z: 20, sizeInches: 10, slot: "C", finish: "satin", rotation: 12 },
      { id: "q52", x: 139, y: 160, z: 20, sizeInches: 10, slot: "A", finish: "satin", rotation: 14 },
      { id: "q84", x: 301, y: 201, z: 20, sizeInches: 7, slot: "D", finish: "satin", rotation: 24 },
      { id: "q26", x: 27, y: 322, z: 21, sizeInches: 10, slot: "D", finish: "satin", rotation: -24 },
      { id: "m105", x: 38, y: 307, z: 22, sizeInches: 5, slot: "C", finish: "satin", rotation: -8 },
      { id: "q14", x: 41, y: 420, z: 22, sizeInches: 10, slot: "D", finish: "satin", rotation: -26 },
      { id: "q20", x: 32, y: 371, z: 22, sizeInches: 10, slot: "D", finish: "satin", rotation: -25 },
      { id: "q39", x: 18, y: 211, z: 22, sizeInches: 9, slot: "C", finish: "satin", rotation: -25 },
      { id: "m101", x: 58, y: 435, z: 23, sizeInches: 5, slot: "A", finish: "satin", rotation: 9 },
      { id: "m110", x: 68, y: 183, z: 23, sizeInches: 5, slot: "D", finish: "satin", rotation: -8 },
      { id: "q32", x: 21, y: 282, z: 23, sizeInches: 10, slot: "A", finish: "satin", rotation: -24 },
      { id: "m112", x: 188, y: 143, z: 24, sizeInches: 5, slot: "C", finish: "satin", rotation: -10 },
      { id: "q34", x: 51, y: 260, z: 25, sizeInches: 10, slot: "D", finish: "satin", rotation: 6 },
      { id: "m103", x: 25, y: 295, z: 25, sizeInches: 5, slot: "C", finish: "satin", rotation: 12 },
      { id: "q8", x: 61, y: 454, z: 25, sizeInches: 10, slot: "B", finish: "satin", rotation: 22 },
      { id: "q40", x: 77, y: 203, z: 25, sizeInches: 10, slot: "D", finish: "satin", rotation: 9 },
      { id: "q44", x: 75, y: 166, z: 26, sizeInches: 10, slot: "A", finish: "satin", rotation: -19 },
      { id: "q53", x: 134, y: 130, z: 27, sizeInches: 9, slot: "A", finish: "satin", rotation: -15 },
      { id: "m99", x: 42, y: 440, z: 29, sizeInches: 5, slot: "A", finish: "satin", rotation: -12 },
      { id: "m108", x: 85, y: 187, z: 29, sizeInches: 5, slot: "D", finish: "satin", rotation: -6 },
      { id: "q5", x: 94, y: 481, z: 31, sizeInches: 12, slot: "D", finish: "satin", rotation: 18 },
      { id: "q38", x: 49, y: 225, z: 34, sizeInches: 10, slot: "A", finish: "satin", rotation: -20 },
      { id: "m115", x: 176, y: 135, z: 37, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "m106", x: 27, y: 310, z: 38, sizeInches: 5, slot: "C", finish: "satin", rotation: 3 },
      { id: "m104", x: 40, y: 296, z: 39, sizeInches: 5, slot: "C", finish: "satin", rotation: -10 },
      { id: "m113", x: 179, y: 152, z: 40, sizeInches: 5, slot: "C", finish: "satin", rotation: 12 },
      { id: "m102", x: 56, y: 445, z: 42, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "m111", x: 76, y: 176, z: 42, sizeInches: 5, slot: "D", finish: "satin", rotation: -2 },
      { id: "m100", x: 49, y: 429, z: 45, sizeInches: 5, slot: "A", finish: "satin", rotation: -6 },
      { id: "m109", x: 74, y: 193, z: 45, sizeInches: 5, slot: "D", finish: "satin", rotation: -10 },
      { id: "m107", x: 31, y: 302, z: 56, sizeInches: 5, slot: "C", finish: "satin", rotation: -2 }
    ]
  },
  {
    id: "modelo-guirlanda-suspensa",
    name: "Guirlanda Orgânica de Topo",
    description: "Guirlanda volumosa assimétrica com pontas afinadas, 3 cachos monocromáticos de 5\" nos vales reais e ritmo cromático uniforme de ponta a ponta.",
    palette: {"A":"#52796f","B":"#84a98c","C":"#d4af37","D":"#fdfbf7","names":{"A":"Verde Eucalipto","B":"Sálvia Suave","C":"Ouro Nobre","D":"Off-White Pérola","E":"Branco Neve"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"satin","E":"satin"}},
    defaultWidthCm: 207,
    defaultHeightCm: 96,
    pieces: [
      { id: "q55", x: 362, y: 192, z: -16, sizeInches: 7, slot: "B", finish: "satin", rotation: -12 },
      { id: "q14", x: 82, y: 184, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 11 },
      { id: "q26", x: 166, y: 156, z: -13, sizeInches: 12, slot: "D", finish: "satin", rotation: 14 },
      { id: "q32", x: 211, y: 156, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 16 },
      { id: "q20", x: 122, y: 167, z: -11, sizeInches: 12, slot: "D", finish: "satin", rotation: 12 },
      { id: "big58", x: 259, y: 142, z: -9, sizeInches: 16, slot: "B", finish: "satin", rotation: -1 },
      { id: "q10", x: 22, y: 162, z: -9, sizeInches: 7, slot: "B", finish: "satin", rotation: -21 },
      { id: "q3", x: -3, y: 198, z: -8, sizeInches: 7, slot: "A", finish: "satin", rotation: -21 },
      { id: "q30", x: 189, y: 91, z: -7, sizeInches: 12, slot: "B", finish: "satin", rotation: -12 },
      { id: "big57", x: 126, y: 91, z: -7, sizeInches: 18, slot: "A", finish: "satin", rotation: 2 },
      { id: "q48", x: 339, y: 140, z: -6, sizeInches: 9, slot: "B", finish: "satin", rotation: -7 },
      { id: "q8", x: 46, y: 200, z: -5, sizeInches: 9, slot: "A", finish: "satin", rotation: 9 },
      { id: "q50", x: 332, y: 193, z: -4, sizeInches: 9, slot: "B", finish: "satin", rotation: 21 },
      { id: "q18", x: 73, y: 114, z: -3, sizeInches: 12, slot: "D", finish: "satin", rotation: -15 },
      { id: "q12", x: 41, y: 140, z: -1, sizeInches: 9, slot: "B", finish: "satin", rotation: -18 },
      { id: "q44", x: 292, y: 183, z: 1, sizeInches: 12, slot: "D", finish: "satin", rotation: 18 },
      { id: "q54", x: 365, y: 178, z: 1, sizeInches: 5, slot: "A", finish: "satin", rotation: -7 },
      { id: "q56", x: 358, y: 196, z: 3, sizeInches: 5, slot: "D", finish: "satin", rotation: 19 },
      { id: "q42", x: 289, y: 105, z: 6, sizeInches: 12, slot: "D", finish: "satin", rotation: -9 },
      { id: "q1", x: 24, y: 217, z: 7, sizeInches: 7, slot: "B", finish: "satin", rotation: 9 },
      { id: "q2", x: 9, y: 202, z: 9, sizeInches: 5, slot: "A", finish: "satin", rotation: -18 },
      { id: "q6", x: 7, y: 176, z: 10, sizeInches: 9, slot: "B", finish: "satin", rotation: -18 },
      { id: "q51", x: 354, y: 161, z: 10, sizeInches: 7, slot: "B", finish: "satin", rotation: -7 },
      { id: "q36", x: 236, y: 95, z: 12, sizeInches: 12, slot: "A", finish: "satin", rotation: -11 },
      { id: "q9", x: 35, y: 166, z: 14, sizeInches: 7, slot: "A", finish: "satin", rotation: -17 },
      { id: "q38", x: 247, y: 172, z: 17, sizeInches: 12, slot: "D", finish: "satin", rotation: 17 },
      { id: "q23", x: 144, y: 148, z: 17, sizeInches: 10, slot: "B", finish: "satin", rotation: 15 },
      { id: "m70", x: 269, y: 173, z: 18, sizeInches: 5, slot: "C", finish: "satin", rotation: -2 },
      { id: "q45", x: 316, y: 132, z: 18, sizeInches: 10, slot: "A", finish: "satin", rotation: -6 },
      { id: "q5", x: 30, y: 193, z: 18, sizeInches: 7, slot: "D", finish: "satin", rotation: 11 },
      { id: "q29", x: 187, y: 144, z: 18, sizeInches: 10, slot: "D", finish: "satin", rotation: 15 },
      { id: "q21", x: 102, y: 132, z: 18, sizeInches: 10, slot: "B", finish: "satin", rotation: -14 },
      { id: "q27", x: 166, y: 115, z: 19, sizeInches: 10, slot: "B", finish: "satin", rotation: -9 },
      { id: "m61", x: 96, y: 150, z: 19, sizeInches: 5, slot: "B", finish: "satin", rotation: 9 },
      { id: "q53", x: 352, y: 186, z: 19, sizeInches: 7, slot: "C", finish: "satin", rotation: 23 },
      { id: "q11", x: 61, y: 181, z: 20, sizeInches: 10, slot: "D", finish: "satin", rotation: 10 },
      { id: "q17", x: 98, y: 166, z: 21, sizeInches: 10, slot: "C", finish: "satin", rotation: 14 },
      { id: "q47", x: 324, y: 168, z: 22, sizeInches: 10, slot: "D", finish: "satin", rotation: 20 },
      { id: "m65", x: 177, y: 122, z: 23, sizeInches: 5, slot: "D", finish: "satin", rotation: 1 },
      { id: "q15", x: 65, y: 145, z: 24, sizeInches: 10, slot: "D", finish: "satin", rotation: -14 },
      { id: "m68", x: 277, y: 158, z: 24, sizeInches: 5, slot: "C", finish: "satin", rotation: -9 },
      { id: "q33", x: 201, y: 112, z: 24, sizeInches: 10, slot: "C", finish: "satin", rotation: -10 },
      { id: "m59", x: 80, y: 144, z: 25, sizeInches: 5, slot: "B", finish: "satin", rotation: -3 },
      { id: "q35", x: 226, y: 139, z: 25, sizeInches: 10, slot: "A", finish: "satin", rotation: 17 },
      { id: "m63", x: 194, y: 127, z: 26, sizeInches: 5, slot: "D", finish: "satin", rotation: 4 },
      { id: "q41", x: 284, y: 150, z: 28, sizeInches: 10, slot: "A", finish: "satin", rotation: 21 },
      { id: "q39", x: 258, y: 123, z: 29, sizeInches: 10, slot: "D", finish: "satin", rotation: -7 },
      { id: "m71", x: 263, y: 164, z: 37, sizeInches: 5, slot: "C", finish: "satin", rotation: 3 },
      { id: "q24", x: 134, y: 120, z: 37, sizeInches: 12, slot: "D", finish: "satin", rotation: -14 },
      { id: "m62", x: 88, y: 157, z: 38, sizeInches: 5, slot: "B", finish: "satin", rotation: 8 },
      { id: "m66", x: 186, y: 115, z: 39, sizeInches: 5, slot: "D", finish: "satin", rotation: -11 },
      { id: "m69", x: 280, y: 171, z: 40, sizeInches: 5, slot: "C", finish: "satin", rotation: -1 },
      { id: "m64", x: 180, y: 132, z: 40, sizeInches: 5, slot: "D", finish: "satin", rotation: 9 },
      { id: "m60", x: 92, y: 140, z: 41, sizeInches: 5, slot: "B", finish: "satin", rotation: -1 },
      { id: "m67", x: 185, y: 123, z: 57, sizeInches: 5, slot: "D", finish: "satin", rotation: -1 }
    ]
  },
  {
    id: "modelo-cluster-chao",
    name: "Cluster Orgânico de Chão",
    description: "Arranjo orgânico de chão volumoso e assimétrico apoiado no piso, com quartetos reais, balões focais de 16\"/18\" e rosetas de 5\" nas frestas.",
    palette: {"A":"#c2410c","B":"#fed7aa","C":"#eab308","D":"#fdfbf7","names":{"A":"Terracota","B":"Areia Macaron","C":"Mostarda Cromo","D":"Off-White","E":"Caramelo"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"matte","E":"satin"}},
    defaultWidthCm: 188,
    defaultHeightCm: 95,
    pieces: [
      { id: "q35", x: 300, y: 455, z: -15, sizeInches: 9, slot: "D", finish: "satin", rotation: -10 },
      { id: "big62", x: 255, y: 436, z: -9, sizeInches: 16, slot: "D", finish: "satin", rotation: -4 },
      { id: "big60", x: 85, y: 429, z: -7, sizeInches: 18, slot: "A", finish: "satin", rotation: -1 },
      { id: "big61", x: 191, y: 420, z: -7, sizeInches: 18, slot: "B", finish: "satin", rotation: 3 },
      { id: "q39", x: 325, y: 466, z: -7, sizeInches: 7, slot: "B", finish: "satin", rotation: -13 },
      { id: "q42", x: 338, y: 491, z: -5, sizeInches: 7, slot: "B", finish: "satin", rotation: -14 },
      { id: "q1", x: 22, y: 480, z: -5, sizeInches: 12, slot: "A", finish: "satin", rotation: 13 },
      { id: "q51", x: 190, y: 354, z: -3, sizeInches: 12, slot: "D", finish: "satin", rotation: 3 },
      { id: "q46", x: 97, y: 378, z: 1, sizeInches: 9, slot: "B", finish: "satin", rotation: 2 },
      { id: "q34", x: 295, y: 491, z: 6, sizeInches: 7, slot: "A", finish: "satin", rotation: 19 },
      { id: "q41", x: 331, y: 477, z: 9, sizeInches: 5, slot: "A", finish: "satin", rotation: -10 },
      { id: "q50", x: 153, y: 353, z: 10, sizeInches: 9, slot: "B", finish: "satin", rotation: 6 },
      { id: "q38", x: 309, y: 468, z: 12, sizeInches: 7, slot: "C", finish: "satin", rotation: -9 },
      { id: "q32", x: 286, y: 454, z: 13, sizeInches: 9, slot: "B", finish: "satin", rotation: -10 },
      { id: "q5", x: 52, y: 461, z: 13, sizeInches: 9, slot: "B", finish: "satin", rotation: -15 },
      { id: "q55", x: 221, y: 378, z: 15, sizeInches: 10, slot: "C", finish: "satin", rotation: -8 },
      { id: "q16", x: 169, y: 485, z: 16, sizeInches: 10, slot: "D", finish: "satin", rotation: 15 },
      { id: "q10", x: 114, y: 485, z: 17, sizeInches: 10, slot: "C", finish: "satin", rotation: 15 },
      { id: "q58", x: 131, y: 422, z: 19, sizeInches: 7, slot: "D", finish: "satin", rotation: 6 },
      { id: "q59", x: 154, y: 409, z: 20, sizeInches: 9, slot: "A", finish: "satin", rotation: -1 },
      { id: "q40", x: 321, y: 491, z: 20, sizeInches: 7, slot: "D", finish: "satin", rotation: 18 },
      { id: "q22", x: 205, y: 485, z: 22, sizeInches: 10, slot: "A", finish: "satin", rotation: 17 },
      { id: "q4", x: 77, y: 485, z: 22, sizeInches: 10, slot: "D", finish: "satin", rotation: 13 },
      { id: "q2", x: 45, y: 487, z: 22, sizeInches: 9, slot: "A", finish: "satin", rotation: -11 },
      { id: "q28", x: 242, y: 485, z: 23, sizeInches: 10, slot: "B", finish: "satin", rotation: 17 },
      { id: "q44", x: 127, y: 384, z: 23, sizeInches: 12, slot: "D", finish: "satin", rotation: 7 },
      { id: "q52", x: 245, y: 403, z: 23, sizeInches: 10, slot: "B", finish: "satin", rotation: -7 },
      { id: "q20", x: 179, y: 459, z: 27, sizeInches: 10, slot: "D", finish: "satin", rotation: -10 },
      { id: "q54", x: 218, y: 407, z: 28, sizeInches: 7, slot: "A", finish: "satin", rotation: -6 },
      { id: "q14", x: 143, y: 476, z: 29, sizeInches: 10, slot: "A", finish: "satin", rotation: -11 },
      { id: "q8", x: 81, y: 460, z: 29, sizeInches: 10, slot: "B", finish: "satin", rotation: -13 },
      { id: "q45", x: 93, y: 396, z: 30, sizeInches: 10, slot: "D", finish: "satin", rotation: 8 },
      { id: "m65", x: 124, y: 469, z: 30, sizeInches: 5, slot: "D", finish: "satin", rotation: -5 },
      { id: "m74", x: 240, y: 465, z: 30, sizeInches: 5, slot: "C", finish: "satin", rotation: 11 },
      { id: "m69", x: 165, y: 397, z: 30, sizeInches: 5, slot: "B", finish: "satin", rotation: -10 },
      { id: "q11", x: 115, y: 450, z: 34, sizeInches: 12, slot: "B", finish: "satin", rotation: -14 },
      { id: "q31", x: 283, y: 480, z: 34, sizeInches: 12, slot: "A", finish: "satin", rotation: 17 },
      { id: "m67", x: 181, y: 406, z: 34, sizeInches: 5, slot: "B", finish: "satin", rotation: -8 },
      { id: "q29", x: 252, y: 449, z: 34, sizeInches: 12, slot: "A", finish: "satin", rotation: -11 },
      { id: "q48", x: 175, y: 376, z: 34, sizeInches: 12, slot: "A", finish: "satin", rotation: 8 },
      { id: "m63", x: 139, y: 460, z: 36, sizeInches: 5, slot: "D", finish: "satin", rotation: 11 },
      { id: "m72", x: 255, y: 474, z: 36, sizeInches: 5, slot: "C", finish: "satin", rotation: -10 },
      { id: "q23", x: 209, y: 444, z: 39, sizeInches: 12, slot: "A", finish: "satin", rotation: -11 },
      { id: "q56", x: 156, y: 432, z: 40, sizeInches: 10, slot: "A", finish: "satin", rotation: 4 },
      { id: "m70", x: 175, y: 392, z: 47, sizeInches: 5, slot: "B", finish: "satin", rotation: 2 },
      { id: "m68", x: 167, y: 408, z: 48, sizeInches: 5, slot: "B", finish: "satin", rotation: 11 },
      { id: "m66", x: 124, y: 458, z: 49, sizeInches: 5, slot: "D", finish: "satin", rotation: 8 },
      { id: "m75", x: 249, y: 460, z: 49, sizeInches: 5, slot: "C", finish: "satin", rotation: 4 },
      { id: "m64", x: 135, y: 472, z: 52, sizeInches: 5, slot: "D", finish: "satin", rotation: 11 },
      { id: "m73", x: 242, y: 476, z: 52, sizeInches: 5, slot: "C", finish: "satin", rotation: -7 },
      { id: "m71", x: 173, y: 401, z: 65, sizeInches: 5, slot: "B", finish: "satin", rotation: 10 }
    ]
  },
  {
    id: "modelo-totem-coluna",
    name: "Totem Orgânico / Coluna Moderna",
    description: "Coluna vertical orgânica com base firme no chão, leve movimento em S e topo afinado, ideal para lateral de mesas e entradas.",
    palette: {"A":"#18181b","B":"#71717a","C":"#d4af37","D":"#fdfbf7","names":{"A":"Preto Noite","B":"Cinza Grafite","C":"Ouro Nobre","D":"Branco Pérola","E":"Prata Espelho"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"satin","E":"chrome"}},
    defaultWidthCm: 91,
    defaultHeightCm: 219,
    pieces: [
      { id: "q7", x: 225, y: 480, z: -13, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "q17", x: 143, y: 397, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: -24 },
      { id: "q23", x: 156, y: 352, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: -23 },
      { id: "q35", x: 144, y: 266, z: -13, sizeInches: 12, slot: "D", finish: "satin", rotation: 26 },
      { id: "q43", x: 219, y: 197, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 3 },
      { id: "q19", x: 213, y: 379, z: -13, sizeInches: 12, slot: "D", finish: "satin", rotation: 4 },
      { id: "q61", x: 166, y: 105, z: -10, sizeInches: 7, slot: "A", finish: "satin", rotation: 23 },
      { id: "q1", x: 123, y: 480, z: -8, sizeInches: 12, slot: "A", finish: "satin", rotation: 13 },
      { id: "big64", x: 228, y: 301, z: -7, sizeInches: 18, slot: "B", finish: "satin", rotation: 4 },
      { id: "q37", x: 212, y: 243, z: -5, sizeInches: 12, slot: "A", finish: "satin", rotation: 3 },
      { id: "q55", x: 203, y: 119, z: 0, sizeInches: 7, slot: "B", finish: "satin", rotation: -1 },
      { id: "q29", x: 151, y: 309, z: 0, sizeInches: 12, slot: "B", finish: "satin", rotation: 26 },
      { id: "q49", x: 215, y: 159, z: 3, sizeInches: 9, slot: "B", finish: "satin" },
      { id: "q11", x: 150, y: 449, z: 5, sizeInches: 12, slot: "D", finish: "satin", rotation: 25 },
      { id: "q9", x: 176, y: 487, z: 6, sizeInches: 9, slot: "A", finish: "satin", rotation: 24 },
      { id: "q60", x: 165, y: 119, z: 6, sizeInches: 5, slot: "D", finish: "satin", rotation: 27 },
      { id: "q56", x: 182, y: 125, z: 8, sizeInches: 5, slot: "B", finish: "satin", rotation: -25 },
      { id: "q59", x: 181, y: 103, z: 14, sizeInches: 7, slot: "C", finish: "satin" },
      { id: "q14", x: 161, y: 413, z: 14, sizeInches: 9, slot: "D", finish: "satin", rotation: -26 },
      { id: "q46", x: 201, y: 184, z: 14, sizeInches: 7, slot: "B", finish: "satin", rotation: 5 },
      { id: "q38", x: 147, y: 242, z: 14, sizeInches: 9, slot: "A", finish: "satin", rotation: -22 },
      { id: "q25", x: 227, y: 349, z: 15, sizeInches: 12, slot: "D", finish: "satin", rotation: 2 },
      { id: "q32", x: 181, y: 303, z: 15, sizeInches: 10, slot: "C", finish: "satin", rotation: -26 },
      { id: "q40", x: 180, y: 241, z: 15, sizeInches: 10, slot: "B", finish: "satin", rotation: 6 },
      { id: "q52", x: 197, y: 139, z: 16, sizeInches: 7, slot: "A", finish: "satin" },
      { id: "q44", x: 202, y: 213, z: 16, sizeInches: 9, slot: "A", finish: "satin", rotation: -23 },
      { id: "q53", x: 167, y: 144, z: 16, sizeInches: 9, slot: "A", finish: "satin", rotation: 26 },
      { id: "q20", x: 162, y: 377, z: 17, sizeInches: 10, slot: "B", finish: "satin", rotation: -22 },
      { id: "q4", x: 204, y: 485, z: 18, sizeInches: 10, slot: "B", finish: "satin", rotation: 15 },
      { id: "m77", x: 182, y: 167, z: 18, sizeInches: 5, slot: "C", finish: "satin", rotation: -7 },
      { id: "q50", x: 189, y: 163, z: 18, sizeInches: 7, slot: "B", finish: "satin", rotation: -21 },
      { id: "q16", x: 193, y: 401, z: 18, sizeInches: 10, slot: "D", finish: "satin", rotation: 4 },
      { id: "q26", x: 173, y: 339, z: 19, sizeInches: 10, slot: "D", finish: "satin", rotation: -25 },
      { id: "q34", x: 162, y: 273, z: 21, sizeInches: 10, slot: "B", finish: "satin", rotation: 1 },
      { id: "m68", x: 175, y: 400, z: 22, sizeInches: 5, slot: "D", finish: "satin", rotation: -6 },
      { id: "m72", x: 162, y: 245, z: 22, sizeInches: 5, slot: "A", finish: "satin", rotation: -12 },
      { id: "q22", x: 194, y: 365, z: 23, sizeInches: 10, slot: "B", finish: "satin", rotation: 6 },
      { id: "q2", x: 146, y: 485, z: 23, sizeInches: 10, slot: "A", finish: "satin", rotation: -11 },
      { id: "m75", x: 166, y: 161, z: 24, sizeInches: 5, slot: "C", finish: "satin", rotation: -2 },
      { id: "big65", x: 160, y: 198, z: 26, sizeInches: 16, slot: "D", finish: "satin", rotation: -2 },
      { id: "m70", x: 164, y: 262, z: 26, sizeInches: 5, slot: "A", finish: "satin", rotation: -9 },
      { id: "q8", x: 179, y: 467, z: 26, sizeInches: 10, slot: "B", finish: "satin", rotation: -26 },
      { id: "big63", x: 226, y: 444, z: 27, sizeInches: 18, slot: "A", finish: "satin", rotation: 3 },
      { id: "m66", x: 177, y: 417, z: 28, sizeInches: 5, slot: "D", finish: "satin", rotation: -8 },
      { id: "q31", x: 201, y: 272, z: 31, sizeInches: 12, slot: "D", finish: "satin", rotation: -2 },
      { id: "q28", x: 202, y: 318, z: 31, sizeInches: 10, slot: "A", finish: "satin", rotation: 1 },
      { id: "q10", x: 177, y: 433, z: 32, sizeInches: 10, slot: "C", finish: "satin", rotation: -1 },
      { id: "m78", x: 174, y: 174, z: 37, sizeInches: 5, slot: "C", finish: "satin", rotation: -10 },
      { id: "m73", x: 172, y: 250, z: 39, sizeInches: 5, slot: "A", finish: "satin", rotation: -2 },
      { id: "m71", x: 154, y: 252, z: 40, sizeInches: 5, slot: "A", finish: "satin", rotation: 1 },
      { id: "m76", x: 179, y: 157, z: 40, sizeInches: 5, slot: "C", finish: "satin", rotation: 1 },
      { id: "m69", x: 185, y: 404, z: 41, sizeInches: 5, slot: "D", finish: "satin", rotation: -9 },
      { id: "m67", x: 168, y: 408, z: 44, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "m74", x: 164, y: 253, z: 57, sizeInches: 5, slot: "A", finish: "satin", rotation: 11 }
    ]
  },
  {
    id: "modelo-arco-duplo",
    name: "Arco Orgânico em Blocos (Bicolor)",
    description: "Arco orgânico amplo em blocos transversais contemporâneos com transição natural e pontos de ouro cromo nas costuras entre cores.",
    palette: {"A":"#c2410c","B":"#fed7aa","C":"#d4af37","D":"#fdfbf7","names":{"A":"Terracota","B":"Nude Macaron","C":"Ouro Nobre","D":"Off-White","E":"Cobre"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"matte","E":"chrome"}},
    defaultWidthCm: 222,
    defaultHeightCm: 241,
    pieces: [
      { id: "q25", x: 85, y: 323, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 2 },
      { id: "q31", x: 88, y: 276, z: -13, sizeInches: 12, slot: "D", finish: "satin", rotation: 2 },
      { id: "q43", x: 104, y: 188, z: -13, sizeInches: 12, slot: "B", finish: "satin", rotation: 5 },
      { id: "q19", x: 84, y: 370, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 1 },
      { id: "q1", x: 142, y: 469, z: -12, sizeInches: 12, slot: "A", finish: "satin", rotation: -9 },
      { id: "q47", x: 65, y: 130, z: -10, sizeInches: 12, slot: "B", finish: "satin", rotation: -20 },
      { id: "q81", x: 331, y: 130, z: -10, sizeInches: 7, slot: "A", finish: "satin", rotation: -10 },
      { id: "big100", x: 166, y: 82, z: -9, sizeInches: 16, slot: "B", finish: "satin", rotation: -4 },
      { id: "q73", x: 277, y: 148, z: -9, sizeInches: 9, slot: "A", finish: "satin", rotation: 17 },
      { id: "q88", x: 355, y: 148, z: -8, sizeInches: 7, slot: "A", finish: "satin", rotation: -8 },
      { id: "big99", x: 30, y: 192, z: -7, sizeInches: 18, slot: "B", finish: "satin", rotation: -2 },
      { id: "q37", x: 95, y: 233, z: -7, sizeInches: 12, slot: "D", finish: "satin", rotation: 4 },
      { id: "q71", x: 274, y: 96, z: -6, sizeInches: 9, slot: "A", finish: "satin", rotation: -10 },
      { id: "q67", x: 244, y: 139, z: -6, sizeInches: 9, slot: "A", finish: "satin", rotation: 16 },
      { id: "q23", x: 18, y: 342, z: -6, sizeInches: 12, slot: "D", finish: "satin", rotation: -25 },
      { id: "q29", x: 23, y: 294, z: -4, sizeInches: 12, slot: "D", finish: "satin", rotation: -25 },
      { id: "q86", x: 331, y: 182, z: -3, sizeInches: 7, slot: "A", finish: "satin", rotation: 21 },
      { id: "q96", x: 381, y: 181, z: -2, sizeInches: 7, slot: "A", finish: "satin", rotation: -8 },
      { id: "q79", x: 304, y: 166, z: -1, sizeInches: 9, slot: "A", finish: "satin", rotation: 19 },
      { id: "q13", x: 84, y: 415, z: 1, sizeInches: 12, slot: "A", finish: "satin", rotation: 1 },
      { id: "q77", x: 311, y: 111, z: 2, sizeInches: 9, slot: "A", finish: "satin", rotation: -8 },
      { id: "q94", x: 351, y: 200, z: 3, sizeInches: 5, slot: "A", finish: "satin", rotation: 22 },
      { id: "q17", x: 22, y: 389, z: 3, sizeInches: 12, slot: "A", finish: "satin", rotation: -26 },
      { id: "q83", x: 337, y: 146, z: 4, sizeInches: 5, slot: "A", finish: "satin", rotation: -6 },
      { id: "q35", x: 26, y: 248, z: 4, sizeInches: 12, slot: "D", finish: "satin", rotation: -25 },
      { id: "q91", x: 363, y: 167, z: 4, sizeInches: 5, slot: "A", finish: "satin", rotation: -5 },
      { id: "q55", x: 164, y: 154, z: 5, sizeInches: 12, slot: "B", finish: "satin", rotation: 13 },
      { id: "q61", x: 209, y: 148, z: 5, sizeInches: 12, slot: "B", finish: "satin", rotation: 15 },
      { id: "q6", x: 105, y: 491, z: 7, sizeInches: 7, slot: "A", finish: "satin", rotation: -12 },
      { id: "q65", x: 236, y: 91, z: 8, sizeInches: 9, slot: "A", finish: "satin", rotation: -11 },
      { id: "q53", x: 116, y: 96, z: 8, sizeInches: 12, slot: "B", finish: "satin", rotation: -15 },
      { id: "big98", x: 14, y: 446, z: 8, sizeInches: 18, slot: "A", finish: "satin", rotation: -4 },
      { id: "q95", x: 367, y: 194, z: 10, sizeInches: 5, slot: "A", finish: "satin", rotation: -2 },
      { id: "q87", x: 349, y: 157, z: 13, sizeInches: 5, slot: "A", finish: "satin", rotation: -3 },
      { id: "q4", x: 111, y: 457, z: 13, sizeInches: 10, slot: "A", finish: "satin", rotation: -8 },
      { id: "q74", x: 284, y: 116, z: 14, sizeInches: 7, slot: "A", finish: "satin", rotation: -7 },
      { id: "q76", x: 297, y: 141, z: 15, sizeInches: 7, slot: "A", finish: "satin", rotation: 20 },
      { id: "q62", x: 209, y: 108, z: 15, sizeInches: 9, slot: "A", finish: "satin", rotation: -9 },
      { id: "q70", x: 267, y: 136, z: 16, sizeInches: 7, slot: "A", finish: "satin", rotation: 20 },
      { id: "q44", x: 68, y: 159, z: 17, sizeInches: 10, slot: "B", finish: "satin", rotation: -19 },
      { id: "q80", x: 324, y: 133, z: 17, sizeInches: 7, slot: "A", finish: "satin", rotation: -7 },
      { id: "q82", x: 327, y: 162, z: 17, sizeInches: 7, slot: "A", finish: "satin", rotation: 22 },
      { id: "q28", x: 74, y: 299, z: 18, sizeInches: 10, slot: "D", finish: "satin", rotation: 3 },
      { id: "m103", x: 64, y: 404, z: 18, sizeInches: 5, slot: "C", finish: "satin", rotation: 11 },
      { id: "q22", x: 72, y: 345, z: 18, sizeInches: 10, slot: "A", finish: "satin", rotation: 3 },
      { id: "q50", x: 94, y: 129, z: 18, sizeInches: 10, slot: "B", finish: "satin", rotation: -15 },
      { id: "q90", x: 349, y: 180, z: 18, sizeInches: 7, slot: "A", finish: "satin", rotation: 24 },
      { id: "q40", x: 89, y: 202, z: 18, sizeInches: 10, slot: "C", finish: "satin", rotation: 5 },
      { id: "m107", x: 56, y: 245, z: 18, sizeInches: 5, slot: "D", finish: "satin", rotation: -1 },
      { id: "q46", x: 104, y: 164, z: 19, sizeInches: 10, slot: "B", finish: "satin", rotation: 9 },
      { id: "m116", x: 254, y: 109, z: 19, sizeInches: 5, slot: "C", finish: "satin", rotation: -8 },
      { id: "q16", x: 65, y: 384, z: 19, sizeInches: 10, slot: "A", finish: "satin", rotation: 3 },
      { id: "q38", x: 60, y: 229, z: 19, sizeInches: 10, slot: "D", finish: "satin", rotation: -22 },
      { id: "q10", x: 67, y: 449, z: 20, sizeInches: 10, slot: "A", finish: "satin", rotation: 1 },
      { id: "q26", x: 43, y: 321, z: 21, sizeInches: 10, slot: "D", finish: "satin", rotation: -23 },
      { id: "q8", x: 52, y: 483, z: 21, sizeInches: 10, slot: "A", finish: "satin", rotation: 23 },
      { id: "m105", x: 55, y: 262, z: 22, sizeInches: 5, slot: "D", finish: "satin", rotation: 10 },
      { id: "q2", x: 131, y: 485, z: 22, sizeInches: 10, slot: "A", finish: "satin", rotation: 21 },
      { id: "m112", x: 149, y: 128, z: 23, sizeInches: 5, slot: "B", finish: "satin", rotation: -6 },
      { id: "q34", x: 81, y: 256, z: 23, sizeInches: 10, slot: "D", finish: "satin", rotation: 3 },
      { id: "q20", x: 39, y: 360, z: 23, sizeInches: 10, slot: "D", finish: "satin", rotation: -25 },
      { id: "q58", x: 180, y: 126, z: 23, sizeInches: 10, slot: "B", finish: "satin", rotation: 17 },
      { id: "q52", x: 130, y: 136, z: 23, sizeInches: 10, slot: "B", finish: "satin", rotation: 12 },
      { id: "m101", x: 51, y: 393, z: 24, sizeInches: 5, slot: "C", finish: "satin", rotation: -10 },
      { id: "q32", x: 48, y: 276, z: 24, sizeInches: 10, slot: "D", finish: "satin", rotation: -22 },
      { id: "q14", x: 51, y: 414, z: 24, sizeInches: 10, slot: "A", finish: "satin", rotation: -25 },
      { id: "q59", x: 186, y: 94, z: 25, sizeInches: 9, slot: "A", finish: "satin", rotation: -13 },
      { id: "m114", x: 238, y: 104, z: 25, sizeInches: 5, slot: "C", finish: "satin", rotation: -10 },
      { id: "q64", x: 236, y: 124, z: 25, sizeInches: 10, slot: "A", finish: "satin", rotation: 18 },
      { id: "q56", x: 151, y: 106, z: 27, sizeInches: 10, slot: "B", finish: "satin", rotation: -12 },
      { id: "m110", x: 166, y: 128, z: 29, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "q5", x: 90, y: 480, z: 34, sizeInches: 12, slot: "A", finish: "satin", rotation: 18 },
      { id: "m108", x: 65, y: 252, z: 35, sizeInches: 5, slot: "D", finish: "satin", rotation: -11 },
      { id: "m106", x: 47, y: 250, z: 36, sizeInches: 5, slot: "D", finish: "satin", rotation: 10 },
      { id: "q41", x: 60, y: 192, z: 37, sizeInches: 12, slot: "B", finish: "satin", rotation: -24 },
      { id: "m104", x: 54, y: 407, z: 37, sizeInches: 5, slot: "C", finish: "satin", rotation: 2 },
      { id: "m117", x: 247, y: 116, z: 38, sizeInches: 5, slot: "C", finish: "satin", rotation: 11 },
      { id: "m102", x: 64, y: 393, z: 40, sizeInches: 5, slot: "C", finish: "satin", rotation: 12 },
      { id: "m115", x: 250, y: 99, z: 41, sizeInches: 5, slot: "C", finish: "satin", rotation: -10 },
      { id: "m113", x: 154, y: 119, z: 42, sizeInches: 5, slot: "B", finish: "satin", rotation: 6 },
      { id: "m111", x: 156, y: 136, z: 45, sizeInches: 5, slot: "B", finish: "satin", rotation: -4 },
      { id: "m109", x: 57, y: 253, z: 53, sizeInches: 5, slot: "D", finish: "satin", rotation: 8 }
    ]
  },
  {
    id: "modelo-moldura-redonda",
    name: "Moldura para Painel Redondo 270°",
    description: "Arco escultural em quartetos reais que abraça 270° do painel redondo Ø 1,50 m com caimento elegante na lateral direita e rosetas de 5\".",
    palette: {"A":"#f472b6","B":"#38bdf8","C":"#d4af37","D":"#ffffff","names":{"A":"Rosa Chic","B":"Azul Turquesa","C":"Ouro Nobre","D":"Branco Neve","E":"Pérola"},"finishes":{"A":"satin","B":"satin","C":"chrome","D":"matte","E":"satin"}},
    defaultWidthCm: 216,
    defaultHeightCm: 189,
    pieces: [
      { id: "q31", x: 92, y: 210, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 7 },
      { id: "q37", x: 126, y: 180, z: -13, sizeInches: 12, slot: "B", finish: "satin", rotation: 10 },
      { id: "q49", x: 197, y: 167, z: -13, sizeInches: 12, slot: "B", finish: "satin", rotation: 16 },
      { id: "q55", x: 239, y: 176, z: -13, sizeInches: 12, slot: "B", finish: "satin", rotation: 19 },
      { id: "q3", x: 86, y: 421, z: -10, sizeInches: 7, slot: "A", finish: "satin", rotation: 20 },
      { id: "big107", x: 324, y: 163, z: -9, sizeInches: 16, slot: "D", finish: "satin", rotation: -2 },
      { id: "q61", x: 270, y: 207, z: -9, sizeInches: 12, slot: "D", finish: "satin", rotation: 22 },
      { id: "q29", x: 28, y: 188, z: -7, sizeInches: 12, slot: "B", finish: "satin", rotation: -21 },
      { id: "q7", x: 91, y: 359, z: -7, sizeInches: 12, slot: "B", finish: "satin", rotation: -4 },
      { id: "big105", x: 20, y: 279, z: -7, sizeInches: 18, slot: "A", finish: "satin", rotation: 3 },
      { id: "big106", x: 152, y: 129, z: -7, sizeInches: 18, slot: "B", finish: "satin", rotation: 4 },
      { id: "q35", x: 65, y: 147, z: -6, sizeInches: 12, slot: "B", finish: "satin", rotation: -18 },
      { id: "q11", x: 23, y: 366, z: -6, sizeInches: 9, slot: "D", finish: "satin", rotation: 25 },
      { id: "q53", x: 242, y: 112, z: -5, sizeInches: 12, slot: "A", finish: "satin", rotation: -9 },
      { id: "q77", x: 365, y: 279, z: -5, sizeInches: 9, slot: "B", finish: "satin" },
      { id: "q103", x: 312, y: 402, z: -4, sizeInches: 7, slot: "A", finish: "satin", rotation: 4 },
      { id: "q79", x: 311, y: 296, z: -1, sizeInches: 9, slot: "B", finish: "satin", rotation: -25 },
      { id: "q1", x: 107, y: 398, z: 0, sizeInches: 9, slot: "A", finish: "satin", rotation: -4 },
      { id: "q85", x: 311, y: 327, z: 0, sizeInches: 7, slot: "A", finish: "satin", rotation: -23 },
      { id: "q71", x: 354, y: 236, z: 2, sizeInches: 9, slot: "A", finish: "satin", rotation: -1 },
      { id: "q101", x: 287, y: 381, z: 2, sizeInches: 5, slot: "D", finish: "satin", rotation: -21 },
      { id: "q90", x: 340, y: 346, z: 3, sizeInches: 5, slot: "A", finish: "satin", rotation: 5 },
      { id: "q17", x: -2, y: 324, z: 3, sizeInches: 12, slot: "B", finish: "satin", rotation: -26 },
      { id: "q95", x: 337, y: 370, z: 4, sizeInches: 7, slot: "B", finish: "satin", rotation: 3 },
      { id: "q5", x: 60, y: 410, z: 6, sizeInches: 9, slot: "D", finish: "satin", rotation: 22 },
      { id: "q59", x: 285, y: 134, z: 6, sizeInches: 12, slot: "A", finish: "satin", rotation: -6 },
      { id: "q67", x: 296, y: 241, z: 7, sizeInches: 12, slot: "A", finish: "satin", rotation: 24 },
      { id: "q98", x: 317, y: 381, z: 7, sizeInches: 5, slot: "A", finish: "satin", rotation: 7 },
      { id: "q93", x: 301, y: 351, z: 8, sizeInches: 7, slot: "A", finish: "satin", rotation: -22 },
      { id: "q41", x: 106, y: 118, z: 10, sizeInches: 12, slot: "A", finish: "satin", rotation: -15 },
      { id: "q102", x: 299, y: 391, z: 11, sizeInches: 5, slot: "A", finish: "satin", rotation: 10 },
      { id: "q74", x: 348, y: 264, z: 11, sizeInches: 7, slot: "D", finish: "satin", rotation: 2 },
      { id: "q97", x: 302, y: 372, z: 11, sizeInches: 5, slot: "D", finish: "satin", rotation: -17 },
      { id: "q19", x: 70, y: 284, z: 12, sizeInches: 12, slot: "D", finish: "satin", rotation: 2 },
      { id: "q76", x: 324, y: 273, z: 13, sizeInches: 7, slot: "A", finish: "satin", rotation: -25 },
      { id: "q43", x: 163, y: 176, z: 13, sizeInches: 12, slot: "A", finish: "satin", rotation: 13 },
      { id: "q47", x: 190, y: 102, z: 14, sizeInches: 12, slot: "A", finish: "satin", rotation: -12 },
      { id: "q94", x: 319, y: 363, z: 14, sizeInches: 5, slot: "D", finish: "satin", rotation: 7 },
      { id: "q80", x: 344, y: 292, z: 14, sizeInches: 7, slot: "C", finish: "satin", rotation: 5 },
      { id: "q68", x: 328, y: 216, z: 15, sizeInches: 9, slot: "B", finish: "satin" },
      { id: "q2", x: 88, y: 416, z: 15, sizeInches: 7, slot: "B", finish: "satin", rotation: 24 },
      { id: "q83", x: 353, y: 323, z: 16, sizeInches: 9, slot: "B", finish: "satin", rotation: 3 },
      { id: "q8", x: 45, y: 380, z: 17, sizeInches: 9, slot: "A", finish: "satin", rotation: 25 },
      { id: "q34", x: 98, y: 188, z: 18, sizeInches: 10, slot: "B", finish: "satin", rotation: 12 },
      { id: "q23", x: 8, y: 237, z: 18, sizeInches: 12, slot: "D", finish: "satin", rotation: -23 },
      { id: "q10", x: 63, y: 349, z: 19, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "q52", x: 220, y: 162, z: 19, sizeInches: 10, slot: "A", finish: "satin", rotation: 18 },
      { id: "q89", x: 325, y: 340, z: 19, sizeInches: 7, slot: "B", finish: "satin", rotation: -20 },
      { id: "q28", x: 72, y: 218, z: 19, sizeInches: 10, slot: "D", finish: "satin", rotation: 9 },
      { id: "q82", x: 325, y: 312, z: 19, sizeInches: 7, slot: "D", finish: "satin", rotation: -22 },
      { id: "q32", x: 61, y: 181, z: 20, sizeInches: 10, slot: "D", finish: "satin", rotation: -18 },
      { id: "m123", x: 342, y: 222, z: 20, sizeInches: 5, slot: "C", finish: "satin", rotation: 2 },
      { id: "q14", x: 27, y: 346, z: 20, sizeInches: 10, slot: "D", finish: "satin", rotation: -25 },
      { id: "q26", x: 38, y: 214, z: 21, sizeInches: 10, slot: "B", finish: "satin", rotation: -21 },
      { id: "m114", x: 81, y: 182, z: 21, sizeInches: 5, slot: "C", finish: "satin", rotation: 6 },
      { id: "q58", x: 262, y: 178, z: 21, sizeInches: 10, slot: "C", finish: "satin", rotation: 22 },
      { id: "q56", x: 250, y: 143, z: 21, sizeInches: 10, slot: "B", finish: "satin", rotation: -5 },
      { id: "q38", x: 91, y: 154, z: 23, sizeInches: 10, slot: "A", finish: "satin", rotation: -14 },
      { id: "q4", x: 80, y: 386, z: 23, sizeInches: 10, slot: "D", finish: "satin", rotation: -4 },
      { id: "q50", x: 218, y: 126, z: 23, sizeInches: 10, slot: "D", finish: "satin", rotation: -9 },
      { id: "q45", x: 145, y: 109, z: 23, sizeInches: 9, slot: "C", finish: "satin", rotation: -17 },
      { id: "q64", x: 295, y: 205, z: 24, sizeInches: 10, slot: "B", finish: "satin", rotation: 24 },
      { id: "q65", x: 324, y: 190, z: 24, sizeInches: 9, slot: "A", finish: "satin", rotation: -4 },
      { id: "q40", x: 126, y: 163, z: 24, sizeInches: 10, slot: "D", finish: "satin", rotation: 12 },
      { id: "q16", x: 46, y: 315, z: 24, sizeInches: 10, slot: "C", finish: "satin", rotation: 2 },
      { id: "m112", x: 82, y: 164, z: 24, sizeInches: 5, slot: "C", finish: "satin", rotation: -3 },
      { id: "q21", x: 5, y: 290, z: 25, sizeInches: 9, slot: "D", finish: "satin", rotation: 26 },
      { id: "q22", x: 50, y: 250, z: 25, sizeInches: 10, slot: "B", finish: "satin", rotation: 5 },
      { id: "q62", x: 295, y: 169, z: 25, sizeInches: 9, slot: "B", finish: "satin", rotation: -2 },
      { id: "m119", x: 224, y: 150, z: 26, sizeInches: 5, slot: "D", finish: "satin", rotation: 10 },
      { id: "m121", x: 355, y: 211, z: 26, sizeInches: 5, slot: "C", finish: "satin", rotation: 1 },
      { id: "m110", x: 34, y: 298, z: 27, sizeInches: 5, slot: "A", finish: "satin", rotation: 8 },
      { id: "q70", x: 331, y: 246, z: 28, sizeInches: 10, slot: "B", finish: "satin", rotation: 26 },
      { id: "q46", x: 186, y: 144, z: 28, sizeInches: 10, slot: "D", finish: "satin", rotation: 17 },
      { id: "m117", x: 235, y: 137, z: 32, sizeInches: 5, slot: "D", finish: "satin", rotation: 3 },
      { id: "m108", x: 51, y: 298, z: 33, sizeInches: 5, slot: "A", finish: "satin", rotation: -5 },
      { id: "q44", x: 151, y: 142, z: 34, sizeInches: 10, slot: "A", finish: "satin", rotation: -10 },
      { id: "q20", x: 37, y: 281, z: 34, sizeInches: 10, slot: "B", finish: "satin", rotation: -22 },
      { id: "m115", x: 72, y: 174, z: 37, sizeInches: 5, slot: "C", finish: "satin", rotation: 6 },
      { id: "m113", x: 90, y: 176, z: 39, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "m124", x: 340, y: 211, z: 39, sizeInches: 5, slot: "C", finish: "satin", rotation: 7 },
      { id: "m122", x: 353, y: 224, z: 42, sizeInches: 5, slot: "C", finish: "satin", rotation: 6 },
      { id: "m120", x: 221, y: 140, z: 45, sizeInches: 5, slot: "D", finish: "satin", rotation: -1 },
      { id: "m111", x: 39, y: 289, z: 46, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "m118", x: 235, y: 150, z: 48, sizeInches: 5, slot: "D", finish: "satin", rotation: -8 },
      { id: "m109", x: 41, y: 307, z: 49, sizeInches: 5, slot: "A", finish: "satin", rotation: -2 },
      { id: "m116", x: 80, y: 173, z: 56, sizeInches: 5, slot: "C", finish: "satin", rotation: 4 }
    ]
  },
  {
    id: "modelo-cascata-mesa",
    name: "Cascata Mesa Cilindro & Chão",
    description: "Arranjo dinâmico que nasce leve no topo da mesa cilindro e escorre em curva orgânica até pousar suavemente no piso.",
    palette: {"A":"#52796f","B":"#84a98c","C":"#d4af37","D":"#fdfbf7","names":{"A":"Verde Eucalipto","B":"Sálvia Suave","C":"Ouro Nobre","D":"Off-White Pérola","E":"Branco Neve"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"satin","E":"satin"}},
    defaultWidthCm: 169,
    defaultHeightCm: 112,
    pieces: [
      { id: "q26", x: 172, y: 416, z: -13, sizeInches: 12, slot: "D", finish: "satin", rotation: 24 },
      { id: "q38", x: 214, y: 480, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 21 },
      { id: "q8", x: 87, y: 362, z: -12, sizeInches: 9, slot: "B", finish: "satin", rotation: 15 },
      { id: "big53", x: 227, y: 390, z: -9, sizeInches: 16, slot: "A", finish: "satin", rotation: 2 },
      { id: "q50", x: 342, y: 487, z: -5, sizeInches: 9, slot: "D", finish: "satin", rotation: 14 },
      { id: "q18", x: 171, y: 321, z: -4, sizeInches: 12, slot: "D", finish: "satin", rotation: -8 },
      { id: "q3", x: 55, y: 331, z: -2, sizeInches: 7, slot: "A", finish: "satin", rotation: -13 },
      { id: "q24", x: 205, y: 349, z: -2, sizeInches: 12, slot: "D", finish: "satin", rotation: -5 },
      { id: "q36", x: 262, y: 428, z: 0, sizeInches: 12, slot: "A", finish: "satin", rotation: -4 },
      { id: "q32", x: 183, y: 454, z: 4, sizeInches: 12, slot: "A", finish: "satin", rotation: 24 },
      { id: "q52", x: 328, y: 465, z: 4, sizeInches: 7, slot: "B", finish: "satin", rotation: -16 },
      { id: "q1", x: 60, y: 358, z: 5, sizeInches: 7, slot: "B", finish: "satin", rotation: 15 },
      { id: "q12", x: 115, y: 316, z: 5, sizeInches: 9, slot: "C", finish: "satin", rotation: -11 },
      { id: "q6", x: 81, y: 315, z: 6, sizeInches: 9, slot: "B", finish: "satin", rotation: -11 },
      { id: "q14", x: 114, y: 378, z: 11, sizeInches: 12, slot: "A", finish: "satin", rotation: 18 },
      { id: "q41", x: 244, y: 485, z: 11, sizeInches: 10, slot: "D", finish: "satin", rotation: 20 },
      { id: "q2", x: 70, y: 339, z: 13, sizeInches: 5, slot: "A", finish: "satin", rotation: -11 },
      { id: "q48", x: 302, y: 464, z: 17, sizeInches: 9, slot: "A", finish: "satin", rotation: -12 },
      { id: "q29", x: 193, y: 415, z: 17, sizeInches: 10, slot: "D", finish: "satin", rotation: 26 },
      { id: "q5", x: 83, y: 356, z: 18, sizeInches: 7, slot: "D", finish: "satin", rotation: 15 },
      { id: "q15", x: 142, y: 329, z: 18, sizeInches: 9, slot: "D", finish: "satin", rotation: -7 },
      { id: "q51", x: 326, y: 485, z: 19, sizeInches: 7, slot: "A", finish: "satin", rotation: -11 },
      { id: "q23", x: 166, y: 394, z: 20, sizeInches: 10, slot: "B", finish: "satin", rotation: 22 },
      { id: "m57", x: 164, y: 359, z: 21, sizeInches: 5, slot: "C", finish: "satin", rotation: -2 },
      { id: "q35", x: 213, y: 475, z: 23, sizeInches: 10, slot: "A", finish: "satin", rotation: 24 },
      { id: "q17", x: 145, y: 363, z: 24, sizeInches: 10, slot: "A", finish: "satin", rotation: 21 },
      { id: "q27", x: 199, y: 381, z: 24, sizeInches: 10, slot: "B", finish: "satin", rotation: -1 },
      { id: "q21", x: 177, y: 350, z: 24, sizeInches: 10, slot: "B", finish: "satin", rotation: -4 },
      { id: "m61", x: 223, y: 428, z: 26, sizeInches: 5, slot: "D", finish: "satin", rotation: 11 },
      { id: "m55", x: 167, y: 376, z: 27, sizeInches: 5, slot: "C", finish: "satin", rotation: 11 },
      { id: "q11", x: 112, y: 342, z: 27, sizeInches: 10, slot: "D", finish: "satin", rotation: 17 },
      { id: "q47", x: 303, y: 491, z: 28, sizeInches: 7, slot: "C", finish: "satin", rotation: 16 },
      { id: "q33", x: 213, y: 439, z: 28, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "m59", x: 240, y: 435, z: 29, sizeInches: 5, slot: "D", finish: "satin", rotation: 4 },
      { id: "q30", x: 232, y: 408, z: 32, sizeInches: 12, slot: "A", finish: "satin", rotation: -2 },
      { id: "m58", x: 174, y: 363, z: 40, sizeInches: 5, slot: "C", finish: "satin", rotation: -12 },
      { id: "m62", x: 233, y: 422, z: 42, sizeInches: 5, slot: "D", finish: "satin", rotation: -5 },
      { id: "m56", x: 157, y: 368, z: 43, sizeInches: 5, slot: "C", finish: "satin", rotation: 6 },
      { id: "m60", x: 225, y: 438, z: 43, sizeInches: 5, slot: "D", finish: "satin", rotation: 7 },
      { id: "big54", x: 259, y: 460, z: 46, sizeInches: 18, slot: "B", finish: "satin", rotation: -5 },
      { id: "m63", x: 231, y: 430, z: 61, sizeInches: 5, slot: "D", finish: "satin", rotation: -6 }
    ]
  },
  {
    id: "modelo-nuvem-suspensa",
    name: "Nuvem Orgânica Suspensa",
    description: "Composição aérea macia com silhueta fofa de nuvem, volume central em balões de 16\"/18\" e rosetas monocromáticas de 5\" nos encaixes.",
    palette: {"A":"#f8b4d9","B":"#d8b4fe","C":"#93c5fd","D":"#fef08a","names":{"A":"Rosa Doce","B":"Lilás Lavanda","C":"Azul Céu","D":"Amarelo Candy","E":"Branco Neve"},"finishes":{"A":"matte","B":"matte","C":"satin","D":"matte","E":"satin"}},
    defaultWidthCm: 174,
    defaultHeightCm: 90,
    pieces: [
      { id: "q13", x: 120, y: 181, z: -13, sizeInches: 12, slot: "B", finish: "satin", rotation: 13 },
      { id: "q37", x: 282, y: 192, z: -13, sizeInches: 12, slot: "A", finish: "satin", rotation: 18 },
      { id: "big55", x: 245, y: 153, z: -9, sizeInches: 16, slot: "D", finish: "satin", rotation: 1 },
      { id: "big54", x: 124, y: 108, z: -7, sizeInches: 18, slot: "A", finish: "satin", rotation: 1 },
      { id: "q45", x: 335, y: 169, z: -7, sizeInches: 7, slot: "B", finish: "satin", rotation: -12 },
      { id: "q1", x: 45, y: 200, z: -7, sizeInches: 9, slot: "A", finish: "satin", rotation: 11 },
      { id: "q43", x: 323, y: 198, z: -6, sizeInches: 9, slot: "D", finish: "satin", rotation: 18 },
      { id: "q7", x: 85, y: 202, z: -6, sizeInches: 12, slot: "D", finish: "satin", rotation: 11 },
      { id: "q31", x: 237, y: 195, z: -4, sizeInches: 12, slot: "B", finish: "satin", rotation: 16 },
      { id: "q53", x: 239, y: 89, z: 0, sizeInches: 9, slot: "B", finish: "satin", rotation: -3 },
      { id: "q48", x: 159, y: 77, z: 4, sizeInches: 9, slot: "B", finish: "satin", rotation: -4 },
      { id: "q5", x: 51, y: 155, z: 6, sizeInches: 9, slot: "B", finish: "satin", rotation: -17 },
      { id: "q2", x: 35, y: 177, z: 10, sizeInches: 7, slot: "A", finish: "satin", rotation: -15 },
      { id: "q41", x: 311, y: 151, z: 10, sizeInches: 9, slot: "C", finish: "satin", rotation: -9 },
      { id: "q11", x: 79, y: 126, z: 13, sizeInches: 12, slot: "B", finish: "satin", rotation: -15 },
      { id: "q35", x: 281, y: 124, z: 13, sizeInches: 12, slot: "B", finish: "satin", rotation: -9 },
      { id: "q44", x: 329, y: 176, z: 15, sizeInches: 7, slot: "A", finish: "satin", rotation: -6 },
      { id: "q14", x: 109, y: 152, z: 16, sizeInches: 10, slot: "C", finish: "satin", rotation: -12 },
      { id: "q22", x: 179, y: 173, z: 18, sizeInches: 10, slot: "D", finish: "satin", rotation: 16 },
      { id: "q40", x: 301, y: 185, z: 20, sizeInches: 10, slot: "B", finish: "satin", rotation: 20 },
      { id: "q34", x: 263, y: 181, z: 21, sizeInches: 10, slot: "B", finish: "satin", rotation: 18 },
      { id: "q4", x: 61, y: 186, z: 21, sizeInches: 10, slot: "D", finish: "satin", rotation: 13 },
      { id: "q16", x: 141, y: 174, z: 21, sizeInches: 10, slot: "A", finish: "satin", rotation: 15 },
      { id: "q28", x: 218, y: 171, z: 22, sizeInches: 10, slot: "A", finish: "satin", rotation: 18 },
      { id: "q10", x: 104, y: 181, z: 23, sizeInches: 10, slot: "A", finish: "satin", rotation: 12 },
      { id: "q50", x: 207, y: 90, z: 23, sizeInches: 10, slot: "C", finish: "satin", rotation: -4 },
      { id: "q29", x: 235, y: 119, z: 25, sizeInches: 12, slot: "A", finish: "satin", rotation: -11 },
      { id: "q8", x: 78, y: 160, z: 26, sizeInches: 9, slot: "B", finish: "satin", rotation: -13 },
      { id: "m63", x: 197, y: 106, z: 26, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "q38", x: 284, y: 157, z: 28, sizeInches: 9, slot: "A", finish: "satin", rotation: -8 },
      { id: "m68", x: 238, y: 174, z: 29, sizeInches: 5, slot: "C", finish: "satin", rotation: -2 },
      { id: "m59", x: 131, y: 156, z: 29, sizeInches: 5, slot: "D", finish: "satin", rotation: -3 },
      { id: "m61", x: 180, y: 101, z: 30, sizeInches: 5, slot: "D", finish: "satin", rotation: 11 },
      { id: "q32", x: 247, y: 152, z: 32, sizeInches: 10, slot: "A", finish: "satin", rotation: -7 },
      { id: "q46", x: 150, y: 96, z: 33, sizeInches: 10, slot: "A", finish: "satin", rotation: 6 },
      { id: "m66", x: 255, y: 170, z: 35, sizeInches: 5, slot: "C", finish: "satin", rotation: 11 },
      { id: "m57", x: 148, y: 158, z: 35, sizeInches: 5, slot: "D", finish: "satin", rotation: -3 },
      { id: "q17", x: 135, y: 136, z: 38, sizeInches: 12, slot: "D", finish: "satin", rotation: -14 },
      { id: "m64", x: 188, y: 113, z: 43, sizeInches: 5, slot: "D", finish: "satin", rotation: 8 },
      { id: "big56", x: 188, y: 138, z: 43, sizeInches: 16, slot: "B", finish: "satin", rotation: -2 },
      { id: "m62", x: 194, y: 96, z: 44, sizeInches: 5, slot: "D", finish: "satin", rotation: -6 },
      { id: "m69", x: 242, y: 164, z: 48, sizeInches: 5, slot: "C", finish: "satin", rotation: -4 },
      { id: "m60", x: 137, y: 148, z: 48, sizeInches: 5, slot: "D", finish: "satin", rotation: 10 },
      { id: "m67", x: 248, y: 180, z: 51, sizeInches: 5, slot: "C", finish: "satin", rotation: 5 },
      { id: "m58", x: 137, y: 165, z: 52, sizeInches: 5, slot: "D", finish: "satin", rotation: 8 },
      { id: "m65", x: 189, y: 105, z: 61, sizeInches: 5, slot: "D", finish: "satin", rotation: 11 }
    ]
  }
];
