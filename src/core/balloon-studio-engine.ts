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
    <radialGradient id="${idPrefix}glare_soft" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="65%" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${idPrefix}glare_chrome" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="75%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  `;

  const slots: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  for (const slot of slots) {
    const hex = palette[slot] || (slot === 'E' ? '#f8fafc' : '#d4af37');
    const isLight = isLightColor(hex);

    // 1. SATIN
    const satLight = isLight ? '#ffffff' : adjustColorBrightness(hex, 0.42);
    const satMid = hex;
    const satShadow = isLight ? '#cbd5e1' : adjustColorBrightness(hex, -0.24);
    const satDeep = isLight ? '#94a3b8' : adjustColorBrightness(hex, -0.38);

    defs += `
    <radialGradient id="${idPrefix}grad_satin_${slot}" cx="38%" cy="34%" r="65%" fx="32%" fy="28%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${isLight ? 0.95 : 0.75}"/>
      <stop offset="16%" stop-color="${satLight}"/>
      <stop offset="52%" stop-color="${satMid}"/>
      <stop offset="84%" stop-color="${satShadow}"/>
      <stop offset="100%" stop-color="${satDeep}"/>
    </radialGradient>
    `;

    // 2. MATTE
    const matLight = isLight ? '#ffffff' : adjustColorBrightness(hex, 0.28);
    const matMid = hex;
    const matShadow = isLight ? '#cbd5e1' : adjustColorBrightness(hex, -0.18);
    const matDeep = isLight ? '#94a3b8' : adjustColorBrightness(hex, -0.28);

    defs += `
    <radialGradient id="${idPrefix}grad_matte_${slot}" cx="40%" cy="36%" r="68%" fx="36%" fy="32%">
      <stop offset="0%" stop-color="${matLight}" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="${matMid}"/>
      <stop offset="80%" stop-color="${matShadow}"/>
      <stop offset="100%" stop-color="${matDeep}"/>
    </radialGradient>
    `;

    // 3. CHROME
    const chrHighlight = '#ffffff';
    const chrBright = adjustColorBrightness(hex, 0.55);
    const chrMid = hex;
    const chrDark = adjustColorBrightness(hex, -0.45);
    const chrRim = adjustColorBrightness(hex, 0.25);

    defs += `
    <radialGradient id="${idPrefix}grad_chrome_${slot}" cx="36%" cy="30%" r="70%" fx="30%" fy="24%">
      <stop offset="0%" stop-color="${chrHighlight}" stop-opacity="0.95"/>
      <stop offset="15%" stop-color="${chrBright}"/>
      <stop offset="42%" stop-color="${chrMid}"/>
      <stop offset="78%" stop-color="${chrDark}"/>
      <stop offset="94%" stop-color="${chrMid}"/>
      <stop offset="100%" stop-color="${chrRim}"/>
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
  const rx = r * 0.97;
  const ry = r * 1.03;

  const gx = x - rx * 0.24;
  const gy = y - ry * 0.26;
  const gw = rx * 0.38;
  const gh = ry * 0.28;
  const dotX = x - rx * 0.16;
  const dotY = y - ry * 0.36;
  const dotR = Math.max(1, r * 0.055);

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

  return `
  <g id="piece-${piece.id}" class="balloon-piece">
    <!-- Sombra vetorial leve de alto desempenho (zero overhead de filtro SVG) -->
    <ellipse cx="${(x + 1.4).toFixed(1)}" cy="${(y + 2.8).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#090d16" opacity="${isCrystalOrGlitter ? 0.10 : 0.14}"/>
    ${hasCover ? `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${idPrefix}pat_cover_${effectiveSlot})"/>` : `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${gradId})"/>`}
    ${hasCover ? `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${idPrefix}grad_satin_${effectiveSlot})" opacity="0.32"/>` : ''}
    ${interior}
    ${!isMatte ? `
      <ellipse cx="${gx}" cy="${gy}" rx="${gw}" ry="${gh}" transform="rotate(-25 ${gx} ${gy})" fill="${glareGrad}"/>
      ${!isMini ? `<circle cx="${dotX}" cy="${dotY}" r="${dotR}" fill="#ffffff" opacity="${isChrome ? 0.95 : (isCrystalOrGlitter ? 0.85 : 0.65)}"/>` : ''}
      ${isChrome ? `<ellipse cx="${x + rx * 0.22}" cy="${y + ry * 0.25}" rx="${rx * 0.26}" ry="${ry * 0.16}" transform="rotate(30 ${x + rx * 0.22} ${y + ry * 0.25})" fill="#ffffff" opacity="0.25"/>` : ''}
    ` : ''}
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

// Ordena balões por profundidade física automática (24" e 18" no fundo, 12"/10" no meio, 5" na frente)
export function sortPiecesByDepth(pieces: BalloonPiece[]): BalloonPiece[] {
  return [...pieces].sort((a, b) => {
    // Balões estrela (foil) e 5" balões de acabamento sempre na frente (pontos de luz/destaque)
    if (a.shape === 'star' && b.shape !== 'star') return 1;
    if (b.shape === 'star' && a.shape !== 'star') return -1;

    if (a.sizeInches === 5 && b.sizeInches !== 5) return 1;
    if (b.sizeInches === 5 && a.sizeInches !== 5) return -1;

    // Balões gigantes (18", 24", 36") de base e impacto estrutural atrás
    if (a.sizeInches >= 18 && b.sizeInches < 18) return -1;
    if (b.sizeInches >= 18 && a.sizeInches < 18) return 1;

    // Coordenada z 3D de profundidade no cluster
    if (a.z !== undefined && b.z !== undefined) {
      if (Math.abs(a.z - b.z) > 4) return a.z - b.z;
    }

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
    x: Math.round(midX - (p.x - midX))
  }));
}

// Distribui as cores da paleta no arranjo conforme o modo escolhido
export function distributeColors(
  pieces: BalloonPiece[],
  mode: 'mesclado' | 'degrade' | 'blocos',
  activeCount: number = 4
): BalloonPiece[] {
  if (pieces.length === 0) return [];
  const allSlots: BalloonSlot[] = ['A', 'B', 'C', 'D', 'E'];
  const count = Math.max(2, Math.min(5, activeCount));
  const slots = allSlots.slice(0, count);
  const total = pieces.length;

  if (mode === 'degrade') {
    const sortedIndices = pieces
      .map((p, idx) => ({ idx, val: p.x * 0.7 + p.y }))
      .sort((a, b) => a.val - b.val);

    const result = [...pieces];
    sortedIndices.forEach(({ idx }, i) => {
      const ratio = i / Math.max(1, total - 1);
      const slotIdx = Math.min(count - 1, Math.floor(ratio * count));
      result[idx] = { ...result[idx], slot: slots[slotIdx] };
    });
    return result;
  }

  if (mode === 'blocos') {
    const blockSize = Math.max(3, Math.round(total / (count * 1.5)));
    return pieces.map((p, i) => {
      const blockIdx = Math.floor(i / blockSize) % count;
      return { ...p, slot: slots[blockIdx] };
    });
  }

  // Mesclado proporcional
  const baseWeights = [0.38, 0.28, 0.18, 0.10, 0.06].slice(0, count);
  const sumWeights = baseWeights.reduce((a, b) => a + b, 0);
  const weights = baseWeights.map((w) => w / sumWeights);

  return pieces.map((p, i) => {
    const hash = Math.abs(Math.sin(p.x * 12.9898 + p.y * 78.233 + i) * 43758.5453) % 1;
    let acc = 0;
    let chosen: BalloonSlot = slots[0];
    for (let s = 0; s < count; s++) {
      acc += weights[s];
      if (hash <= acc) {
        chosen = slots[s];
        break;
      }
    }
    return { ...p, slot: chosen };
  });
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
    name: "Arco Orgânico em L Luxo",
    description: "Cotovelo com Big Balloon de 24\", coluna sinuosa com balões de 18\", cristais com glitter e tufos de acabamento.",
    palette: {"A":"#c97a8e","B":"#f7dbe1","C":"#d4af37","D":"#ffffff","names":{"A":"Rosa Quartzo","B":"Blush Suave","C":"Ouro Nobre","D":"Branco Neve","E":"Pérola"},"finishes":{"A":"satin","B":"satin","C":"chrome","D":"matte","E":"satin"}},
    defaultWidthCm: 175,
    defaultHeightCm: 215,
    pieces: [
      { id: "p1", x: 339, y: 163, z: 10, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p2", x: 345, y: 191, z: 6, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p3", x: 336, y: 168, z: -7, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "p4", x: 336, y: 135, z: -5, sizeInches: 18, slot: "C", finish: "chrome", shape: "star" },
      { id: "p5", x: 307, y: 167, z: 11, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p6", x: 314, y: 194, z: -8, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p7", x: 302, y: 162, z: -7, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "p8", x: 303, y: 139, z: 9, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p9", x: 282, y: 210, z: -8, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 276, y: 154, z: -14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p11", x: 270, y: 124, z: 7, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p12", x: 276, y: 180, z: 17, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 246, y: 172, z: -21, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p14", x: 238, y: 122, z: -3, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p15", x: 252, y: 147, z: 17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p16", x: 245, y: 202, z: 5, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p17", x: 202, y: 128, z: -15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p18", x: 218, y: 157, z: 19, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p19", x: 219, y: 223, z: 11, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p20", x: 211, y: 187, z: -18, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p21", x: 171, y: 120, z: 15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p22", x: 180, y: 187, z: 22, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p23", x: 191, y: 212, z: -10, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p24", x: 186, y: 159, z: -22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p25", x: 155, y: 152, z: 29, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p26", x: 158, y: 215, z: -2, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p27", x: 141, y: 184, z: -42, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p28", x: 138, y: 100, z: 3, sizeInches: 18, slot: "C", finish: "chrome", shape: "star" },
      { id: "p29", x: 173, y: 247, z: 10, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p30", x: 136, y: 232, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p31", x: 43, y: 159, z: -18, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p32", x: 77, y: 176, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 148, y: 264, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p34", x: 55, y: 220, z: -21, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p35", x: 26, y: 198, z: 26, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p36", x: 105, y: 237, z: 20, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p37", x: 78, y: 242, z: -21, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p38", x: 36, y: 250, z: 4, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 72, y: 262, z: 21, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p40", x: 107, y: 263, z: -7, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p41", x: 15, y: 279, z: -5, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p42", x: 46, y: 285, z: 23, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p43", x: 130, y: 286, z: 6, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p44", x: 78, y: 285, z: -24, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p45", x: 60, y: 314, z: 15, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p46", x: 112, y: 308, z: 11, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p47", x: 83, y: 313, z: -15, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p48", x: 31, y: 310, z: -13, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p49", x: 90, y: 330, z: 15, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p50", x: 115, y: 342, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p51", x: 65, y: 335, z: -15, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p52", x: 36, y: 338, z: 16, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p53", x: 144, y: 367, z: -5, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p54", x: 49, y: 363, z: -24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p55", x: 20, y: 367, z: 4, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p56", x: 84, y: 357, z: 24, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p57", x: 81, y: 379, z: -21, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p58", x: 24, y: 398, z: -6, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p59", x: 56, y: 386, z: 20, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p60", x: 109, y: 383, z: 5, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p61", x: 71, y: 457, z: -20, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p62", x: 42, y: 440, z: 19, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p63", x: 143, y: 413, z: 27, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p64", x: 112, y: 435, z: -18, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p65", x: 65, y: 485, z: 9, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p66", x: 122, y: 463, z: 28, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p67", x: 161, y: 452, z: -18, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p68", x: 99, y: 483, z: -27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "big-69", x: 109, y: 145, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-70", x: 100, y: 203, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "big-71", x: 70, y: 415, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-72", x: 58, y: 246, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-73", x: 61, y: 256, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-74", x: 76, y: 308, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-75", x: 79, y: 317, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-76", x: 86, y: 367, z: 50, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "tufo-77", x: 67, y: 431, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-78", x: 65, y: 441, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-cascata-romana",
    name: "Cascata Romana em S",
    description: "Arranjo fluido descendo em curva orgânica elegante pelo topo e lateral do painel romano.",
    palette: {"A":"#4d6b2c","B":"#85512b","C":"#c59a3f","D":"#f7eed7","names":{"A":"Verde Oliva","B":"Caramelo","C":"Ouro Velho","D":"Areia Nude","E":"Branco Neve"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"satin","E":"satin"}},
    defaultWidthCm: 130,
    defaultHeightCm: 200,
    pieces: [
      { id: "p1", x: 84, y: 138, z: 11, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p2", x: 112, y: 120, z: 5, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p3", x: 92, y: 139, z: -8, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "p4", x: 49, y: 140, z: -4, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p5", x: 146, y: 139, z: 13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 112, y: 151, z: -14, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 51, y: 169, z: -12, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p8", x: 83, y: 170, z: 15, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p9", x: 183, y: 159, z: -12, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 103, y: 192, z: -22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 72, y: 200, z: 8, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p12", x: 134, y: 173, z: 21, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p13", x: 164, y: 190, z: -27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p14", x: 93, y: 222, z: 0, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p15", x: 131, y: 202, z: 22, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p16", x: 198, y: 197, z: 2, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p17", x: 94, y: 253, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p18", x: 153, y: 265, z: 27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p19", x: 222, y: 237, z: 18, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p20", x: 187, y: 257, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 111, y: 277, z: 16, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 192, y: 283, z: 24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 235, y: 277, z: -24, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p24", x: 152, y: 290, z: -22, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 172, y: 313, z: 25, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p26", x: 208, y: 316, z: -10, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p27", x: 138, y: 319, z: -21, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p28", x: 107, y: 312, z: 10, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p29", x: 218, y: 350, z: 2, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p30", x: 180, y: 339, z: -21, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p31", x: 117, y: 343, z: -1, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p32", x: 148, y: 342, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 161, y: 367, z: -20, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p34", x: 78, y: 342, z: -13, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p35", x: 127, y: 370, z: 17, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p36", x: 194, y: 380, z: 14, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p37", x: 58, y: 372, z: -21, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p38", x: 90, y: 368, z: 15, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p39", x: 157, y: 392, z: 15, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p40", x: 183, y: 407, z: -18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p41", x: 45, y: 399, z: 9, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p42", x: 139, y: 450, z: 28, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p43", x: 185, y: 451, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p44", x: 52, y: 427, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p45", x: 80, y: 444, z: 30, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p46", x: 150, y: 485, z: 7, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p47", x: 106, y: 473, z: -44, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p48", x: 45, y: 462, z: -7, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "big-49", x: 143, y: 231, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "big-50", x: 115, y: 412, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "tufo-51", x: 126, y: 158, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-52", x: 160, y: 279, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-53", x: 167, y: 289, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-demi-arco",
    name: "Demi-Arco Desconstruído",
    description: "Semi-arco moderno que contorna 60% do painel com base volumosa no chão e caimento leve no topo.",
    palette: {"A":"#f8b4d9","B":"#d8b4fe","C":"#93c5fd","D":"#fef08a","names":{"A":"Rosa Doce","B":"Lilás Mágico","C":"Azul Céu","D":"Amarelo Candy","E":"Branco Neve"},"finishes":{"A":"matte","B":"matte","C":"satin","D":"matte","E":"satin"}},
    defaultWidthCm: 160,
    defaultHeightCm: 185,
    pieces: [
      { id: "p1", x: 103, y: 423, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p2", x: 77, y: 445, z: 17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p3", x: 42, y: 433, z: -36, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p4", x: 133, y: 423, z: -16, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 68, y: 411, z: 22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 29, y: 395, z: -19, sizeInches: 18, slot: "C", finish: "chrome", shape: "star" },
      { id: "p7", x: 153, y: 384, z: -34, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p8", x: 117, y: 393, z: 20, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 20, y: 364, z: -9, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 104, y: 331, z: -26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 134, y: 350, z: 11, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p12", x: 44, y: 350, z: 26, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 58, y: 330, z: -22, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p14", x: 133, y: 310, z: -3, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p15", x: 79, y: 341, z: 22, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p16", x: 23, y: 331, z: -1, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p17", x: 93, y: 304, z: -13, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p18", x: 78, y: 318, z: 17, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p19", x: 33, y: 303, z: 13, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p20", x: 60, y: 302, z: -22, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p21", x: 108, y: 287, z: 14, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 51, y: 279, z: 22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 24, y: 279, z: -12, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p24", x: 81, y: 275, z: -20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p25", x: 68, y: 250, z: 24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p26", x: 23, y: 250, z: -8, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p27", x: 94, y: 248, z: -20, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p28", x: 132, y: 263, z: 5, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p29", x: 44, y: 204, z: 7, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p30", x: 50, y: 230, z: -26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p31", x: 153, y: 241, z: -3, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p32", x: 116, y: 235, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 93, y: 172, z: -24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p34", x: 136, y: 217, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p35", x: 119, y: 198, z: 18, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p36", x: 63, y: 178, z: 12, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 140, y: 185, z: -21, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p38", x: 163, y: 207, z: 16, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p39", x: 118, y: 172, z: 17, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p40", x: 101, y: 141, z: -17, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p41", x: 164, y: 178, z: 4, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p42", x: 130, y: 145, z: 23, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p43", x: 130, y: 122, z: -6, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p44", x: 156, y: 156, z: -24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p45", x: 185, y: 156, z: 22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p46", x: 161, y: 110, z: 4, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p47", x: 179, y: 134, z: -18, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p48", x: 194, y: 189, z: -4, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p49", x: 207, y: 111, z: 10, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p50", x: 213, y: 137, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p51", x: 228, y: 188, z: -9, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p52", x: 218, y: 165, z: 17, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p53", x: 247, y: 110, z: -12, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p54", x: 248, y: 165, z: -16, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p55", x: 277, y: 152, z: 9, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p56", x: 243, y: 136, z: 15, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p57", x: 305, y: 147, z: -13, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p58", x: 283, y: 177, z: 2, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p59", x: 274, y: 147, z: 9, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "p60", x: 275, y: 127, z: -4, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "big-61", x: 78, y: 374, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-62", x: 90, y: 212, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-63", x: 80, y: 277, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-64", x: 83, y: 286, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-65", x: 140, y: 192, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-66", x: 145, y: 201, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-67", x: 177, y: 144, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-68", x: 183, y: 153, z: 52, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-69", x: 243, y: 139, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-70", x: 239, y: 147, z: 52, sizeInches: 5, slot: "A", finish: "satin" }
    ]
  },
  {
    id: "modelo-guirlanda-suspensa",
    name: "Guirlanda Orgânica Suspensa",
    description: "Faixa orgânica horizontal perfeita para topo de boiserie, mesas ou painéis retangulares.",
    palette: {"A":"#1e40af","B":"#60a5fa","C":"#cbd5e1","D":"#ffffff","names":{"A":"Azul Royal","B":"Azul Celeste","C":"Prata Espelho","D":"Branco Neve","E":"Azul Bebê"},"finishes":{"A":"satin","B":"satin","C":"chrome","D":"matte","E":"satin"}},
    defaultWidthCm: 180,
    defaultHeightCm: 80,
    pieces: [
      { id: "p1", x: 72, y: 171, z: 10, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p2", x: 55, y: 126, z: 6, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p3", x: 70, y: 146, z: -7, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p4", x: 61, y: 151, z: -6, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p5", x: 77, y: 134, z: 13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 83, y: 112, z: -12, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 88, y: 157, z: -11, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p8", x: 95, y: 181, z: 11, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p9", x: 105, y: 102, z: -7, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p10", x: 109, y: 149, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p11", x: 116, y: 173, z: 5, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p12", x: 101, y: 122, z: 19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p13", x: 134, y: 145, z: -24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p14", x: 138, y: 167, z: 2, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p15", x: 121, y: 133, z: 19, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p16", x: 127, y: 109, z: 1, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p17", x: 160, y: 185, z: -7, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p18", x: 152, y: 136, z: 27, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p19", x: 151, y: 86, z: 11, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p20", x: 147, y: 114, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 175, y: 162, z: 20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p22", x: 179, y: 102, z: 23, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p23", x: 182, y: 75, z: -29, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p24", x: 156, y: 157, z: -25, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 201, y: 121, z: 30, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p26", x: 199, y: 98, z: -3, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p27", x: 198, y: 153, z: -44, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p28", x: 193, y: 181, z: 5, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p29", x: 236, y: 81, z: 4, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p30", x: 218, y: 90, z: -29, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p31", x: 224, y: 177, z: -4, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p32", x: 220, y: 149, z: 29, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p33", x: 259, y: 123, z: -25, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p34", x: 256, y: 180, z: -11, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p35", x: 250, y: 151, z: 38, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p36", x: 255, y: 101, z: 12, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 274, y: 147, z: -17, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p38", x: 276, y: 171, z: 17, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 276, y: 127, z: 15, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p40", x: 280, y: 106, z: -16, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p41", x: 301, y: 173, z: 9, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p42", x: 296, y: 128, z: 16, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p43", x: 303, y: 107, z: -7, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p44", x: 299, y: 151, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p45", x: 316, y: 140, z: 18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p46", x: 322, y: 115, z: -1, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p47", x: 335, y: 136, z: -15, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p48", x: 326, y: 166, z: 0, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "big-49", x: 177, y: 129, z: -10, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "big-50", x: 228, y: 122, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "tufo-51", x: 90, y: 133, z: 50, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "tufo-52", x: 94, y: 140, z: 52, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "tufo-53", x: 180, y: 129, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-54", x: 267, y: 152, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-55", x: 263, y: 160, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-cluster-chao",
    name: "Cluster Orgânico de Chão",
    description: "Arranjo de chão poente de alto impacto com base em balão de 24\" e camadas de acabamento.",
    palette: {"A":"#c2410c","B":"#fed7aa","C":"#eab308","D":"#ffffff","names":{"A":"Terracota","B":"Areia Macaron","C":"Mostarda Vintage","D":"Branco Neve","E":"Caramelo"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"matte","E":"satin"}},
    defaultWidthCm: 160,
    defaultHeightCm: 130,
    pieces: [
      { id: "p1", x: 82, y: 450, z: 22, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "p2", x: 50, y: 400, z: 11, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p3", x: 72, y: 422, z: -17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p4", x: 87, y: 485, z: -12, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 84, y: 393, z: 21, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 68, y: 365, z: -19, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 127, y: 465, z: -31, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p8", x: 110, y: 428, z: 18, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 75, y: 316, z: -2, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 140, y: 408, z: -30, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 168, y: 461, z: 9, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p12", x: 116, y: 389, z: 30, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p13", x: 142, y: 317, z: -31, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p14", x: 167, y: 409, z: -4, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p15", x: 148, y: 358, z: 45, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p16", x: 119, y: 297, z: 10, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p17", x: 178, y: 369, z: -15, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p18", x: 204, y: 358, z: 27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p19", x: 172, y: 254, z: 23, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p20", x: 142, y: 274, z: -29, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 200, y: 429, z: 19, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 230, y: 294, z: 25, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 226, y: 250, z: -32, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p24", x: 200, y: 396, z: -25, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 265, y: 321, z: 30, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p26", x: 257, y: 288, z: -9, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p27", x: 233, y: 338, z: -45, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p28", x: 224, y: 393, z: 7, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p29", x: 291, y: 296, z: 5, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p30", x: 292, y: 331, z: -29, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p31", x: 232, y: 445, z: -6, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p32", x: 295, y: 365, z: 29, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p33", x: 321, y: 366, z: -24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p34", x: 299, y: 400, z: -14, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p35", x: 271, y: 427, z: 33, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p36", x: 320, y: 331, z: 18, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 302, y: 438, z: -17, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p38", x: 299, y: 470, z: 14, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 319, y: 420, z: 17, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p40", x: 340, y: 402, z: -15, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "big-41", x: 191, y: 309, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-42", x: 108, y: 348, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "big-43", x: 262, y: 376, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-44", x: 162, y: 371, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-45", x: 163, y: 383, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-46", x: 272, y: 342, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-47", x: 269, y: 353, z: 52, sizeInches: 5, slot: "B", finish: "satin" }
    ]
  },
  {
    id: "modelo-totem-coluna",
    name: "Totem Orgânico / Coluna Moderna",
    description: "Coluna vertical esguia com curvas orgânicas para lateral de mesas ou entrada do evento.",
    palette: {"A":"#18181b","B":"#d4af37","C":"#ffffff","D":"#71717a","names":{"A":"Preto Noite","B":"Ouro Nobre","C":"Branco Neve","D":"Cinza Grafite","E":"Prata Espelho"},"finishes":{"A":"matte","B":"chrome","C":"satin","D":"matte","E":"chrome"}},
    defaultWidthCm: 90,
    defaultHeightCm: 195,
    pieces: [
      { id: "p1", x: 150, y: 475, z: 28, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p2", x: 87, y: 454, z: 19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p3", x: 111, y: 485, z: -39, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p4", x: 178, y: 468, z: -17, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 89, y: 417, z: 24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p6", x: 65, y: 434, z: -13, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p7", x: 167, y: 403, z: -37, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p8", x: 171, y: 439, z: 15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 67, y: 393, z: 0, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p10", x: 93, y: 387, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p11", x: 144, y: 381, z: 1, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p12", x: 121, y: 394, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p13", x: 119, y: 369, z: -18, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p14", x: 167, y: 357, z: -13, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p15", x: 136, y: 353, z: 19, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p16", x: 77, y: 362, z: 11, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p17", x: 143, y: 328, z: -23, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p18", x: 172, y: 328, z: 12, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p19", x: 106, y: 351, z: 18, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p20", x: 87, y: 327, z: -13, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 195, y: 298, z: 6, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 115, y: 322, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 80, y: 295, z: -5, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p24", x: 165, y: 299, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 147, y: 261, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p26", x: 85, y: 262, z: 1, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p27", x: 125, y: 245, z: -21, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p28", x: 174, y: 269, z: -1, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p29", x: 71, y: 228, z: 9, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p30", x: 100, y: 226, z: -23, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p31", x: 169, y: 236, z: -7, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p32", x: 145, y: 225, z: 23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p33", x: 127, y: 209, z: -13, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p34", x: 163, y: 206, z: -14, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p35", x: 144, y: 191, z: 14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p36", x: 98, y: 196, z: 18, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p37", x: 119, y: 182, z: -19, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p38", x: 173, y: 174, z: 4, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 108, y: 161, z: 19, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p40", x: 76, y: 165, z: -5, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "big-41", x: 128, y: 437, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-42", x: 122, y: 287, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "big-43", x: 138, y: 145, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "tufo-44", x: 102, y: 426, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-45", x: 99, y: 436, z: 52, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-46", x: 150, y: 298, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-47", x: 144, y: 308, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-arco-duplo",
    name: "Arco Orgânico Bicolor",
    description: "Harmonia contemporânea em blocos orgânicos contrastantes com transição elegante.",
    palette: {"A":"#c2410c","B":"#fed7aa","C":"#d4af37","D":"#ffffff","names":{"A":"Terracota","B":"Nude Macaron","C":"Ouro Nobre","D":"Branco Neve","E":"Cobre"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"matte","E":"chrome"}},
    defaultWidthCm: 170,
    defaultHeightCm: 210,
    pieces: [
      { id: "p1", x: 310, y: 140, z: 11, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p2", x: 323, y: 183, z: 7, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p3", x: 312, y: 162, z: -8, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "p4", x: 340, y: 145, z: -7, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p5", x: 299, y: 167, z: 14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p6", x: 286, y: 198, z: -9, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 280, y: 155, z: -14, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p8", x: 289, y: 114, z: 10, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 253, y: 214, z: -1, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 251, y: 172, z: -20, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 254, y: 105, z: -2, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p12", x: 261, y: 137, z: 20, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 219, y: 164, z: -16, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p14", x: 221, y: 106, z: -8, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p15", x: 233, y: 149, z: 17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p16", x: 226, y: 190, z: 11, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p17", x: 186, y: 123, z: -20, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p18", x: 209, y: 136, z: 14, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p19", x: 198, y: 160, z: 15, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p20", x: 196, y: 187, z: -15, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 159, y: 111, z: 6, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p22", x: 167, y: 166, z: 25, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p23", x: 181, y: 214, z: -2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p24", x: 154, y: 140, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 127, y: 130, z: 27, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p26", x: 174, y: 245, z: 11, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p27", x: 151, y: 197, z: -39, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p28", x: 101, y: 115, z: -10, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p29", x: 120, y: 216, z: 21, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p30", x: 146, y: 241, z: -22, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p31", x: 46, y: 169, z: -31, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p32", x: 72, y: 194, z: 23, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 111, y: 245, z: -12, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p34", x: 61, y: 221, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p35", x: 27, y: 210, z: 19, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p36", x: 87, y: 230, z: 26, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 67, y: 257, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p38", x: 37, y: 255, z: 3, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 93, y: 263, z: 21, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p40", x: 135, y: 275, z: -2, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p41", x: 31, y: 288, z: -6, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p42", x: 61, y: 284, z: 19, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p43", x: 114, y: 298, z: 8, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p44", x: 89, y: 288, z: -23, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p45", x: 27, y: 319, z: 12, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p46", x: 79, y: 313, z: 15, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p47", x: 100, y: 319, z: -13, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p48", x: 53, y: 313, z: -20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p49", x: 94, y: 340, z: 20, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p50", x: 123, y: 338, z: -4, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p51", x: 69, y: 341, z: -20, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p52", x: 37, y: 352, z: 3, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p53", x: 136, y: 368, z: 4, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p54", x: 105, y: 366, z: -26, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p55", x: 20, y: 381, z: -2, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p56", x: 75, y: 366, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p57", x: 104, y: 404, z: -26, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p58", x: 32, y: 436, z: -9, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p59", x: 73, y: 440, z: 38, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p60", x: 135, y: 405, z: 10, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p61", x: 91, y: 473, z: -22, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p62", x: 64, y: 485, z: 20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p63", x: 146, y: 451, z: 33, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p64", x: 109, y: 440, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "big-65", x: 108, y: 171, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-66", x: 58, y: 398, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-67", x: 218, y: 151, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-68", x: 223, y: 161, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-69", x: 75, y: 319, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-70", x: 97, y: 380, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-71", x: 94, y: 390, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-moldura-redonda",
    name: "Moldura para Painel Redondo 270°",
    description: "Arco escultural que abraça 3/4 da circunferência do painel redondo de 150cm a 180cm.",
    palette: {"A":"#f472b6","B":"#38bdf8","C":"#ffffff","D":"#d4af37","names":{"A":"Rosa Chic","B":"Azul Turquesa","C":"Branco Neve","D":"Ouro Nobre","E":"Pérola"},"finishes":{"A":"satin","B":"satin","C":"matte","D":"chrome","E":"satin"}},
    defaultWidthCm: 170,
    defaultHeightCm: 160,
    pieces: [
      { id: "p1", x: 138, y: 417, z: 27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p2", x: 67, y: 439, z: 13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p3", x: 103, y: 417, z: -40, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p4", x: 163, y: 403, z: -12, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 71, y: 405, z: 23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 44, y: 399, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 147, y: 364, z: -33, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p8", x: 121, y: 387, z: 17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p9", x: 33, y: 361, z: -11, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 113, y: 327, z: -27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 147, y: 323, z: 14, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p12", x: 54, y: 342, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p13", x: 63, y: 317, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p14", x: 98, y: 304, z: 1, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p15", x: 83, y: 331, z: 22, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p16", x: 36, y: 321, z: 0, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p17", x: 130, y: 294, z: -14, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p18", x: 67, y: 291, z: 24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p19", x: 23, y: 293, z: 8, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p20", x: 44, y: 278, z: -23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p21", x: 108, y: 275, z: 11, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p22", x: 58, y: 254, z: 24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 33, y: 251, z: -10, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p24", x: 84, y: 271, z: -22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p25", x: 90, y: 246, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p26", x: 53, y: 227, z: -2, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p27", x: 85, y: 222, z: -21, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p28", x: 135, y: 261, z: 1, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p29", x: 75, y: 170, z: 7, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p30", x: 68, y: 197, z: -23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p31", x: 140, y: 232, z: -8, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p32", x: 117, y: 226, z: 23, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p33", x: 117, y: 151, z: -17, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p34", x: 163, y: 246, z: -14, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p35", x: 146, y: 207, z: 14, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p36", x: 137, y: 171, z: 18, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 160, y: 187, z: -23, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p38", x: 174, y: 217, z: 4, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p39", x: 167, y: 163, z: 18, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p40", x: 148, y: 139, z: -4, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p41", x: 200, y: 239, z: -3, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p42", x: 187, y: 186, z: 22, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p43", x: 181, y: 139, z: 5, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p44", x: 196, y: 160, z: -22, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p45", x: 217, y: 182, z: 13, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p46", x: 217, y: 141, z: 12, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p47", x: 229, y: 164, z: -14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p48", x: 206, y: 205, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p49", x: 251, y: 176, z: 18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p50", x: 267, y: 154, z: -10, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p51", x: 234, y: 194, z: -14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p52", x: 233, y: 225, z: 10, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p53", x: 296, y: 166, z: -2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p54", x: 260, y: 209, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p55", x: 255, y: 245, z: 2, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p56", x: 285, y: 195, z: 19, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p57", x: 300, y: 217, z: -18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p58", x: 277, y: 261, z: -5, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p59", x: 276, y: 227, z: 14, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p60", x: 333, y: 206, z: 5, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p61", x: 310, y: 264, z: -9, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p62", x: 297, y: 242, z: 10, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p63", x: 313, y: 248, z: 7, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p64", x: 325, y: 242, z: -11, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p65", x: 290, y: 284, z: 2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p66", x: 336, y: 274, z: 13, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p67", x: 321, y: 277, z: -3, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p68", x: 320, y: 288, z: -13, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p69", x: 320, y: 315, z: 12, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p70", x: 347, y: 311, z: 2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p71", x: 317, y: 308, z: -8, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p72", x: 292, y: 311, z: -2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p73", x: 338, y: 348, z: 6, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p74", x: 312, y: 341, z: -10, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p75", x: 304, y: 334, z: -4, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p76", x: 284, y: 337, z: 10, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p77", x: 323, y: 374, z: -6, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p78", x: 269, y: 361, z: -8, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p79", x: 291, y: 361, z: 3, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "p80", x: 297, y: 364, z: 9, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "big-81", x: 86, y: 367, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-82", x: 110, y: 193, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-83", x: 77, y: 385, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-84", x: 73, y: 394, z: 52, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-85", x: 96, y: 318, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-86", x: 85, y: 264, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-87", x: 87, y: 273, z: 52, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-88", x: 163, y: 197, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-89", x: 166, y: 207, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-cascata-mesa",
    name: "Cascata Mesa Cilindro & Chão",
    description: "Enfeite dinâmico que nasce no topo da mesa cilindro e escorre organicamente até o chão.",
    palette: {"A":"#52796f","B":"#84a98c","C":"#d4af37","D":"#f8fafc","names":{"A":"Verde Eucalipto","B":"Sálvia Suave","C":"Ouro Nobre","D":"Off-White Pérola","E":"Branco Neve"},"finishes":{"A":"matte","B":"matte","C":"chrome","D":"satin","E":"satin"}},
    defaultWidthCm: 110,
    defaultHeightCm: 95,
    pieces: [
      { id: "p1", x: 70, y: 351, z: 18, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p2", x: 115, y: 335, z: 5, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p3", x: 96, y: 346, z: -14, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p4", x: 50, y: 365, z: -6, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p5", x: 164, y: 344, z: 14, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 138, y: 351, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 84, y: 361, z: -13, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p8", x: 108, y: 356, z: 18, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 182, y: 358, z: -8, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p10", x: 121, y: 366, z: -23, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p11", x: 97, y: 372, z: 6, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p12", x: 152, y: 363, z: 24, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 115, y: 381, z: -26, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p14", x: 77, y: 384, z: -1, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p15", x: 136, y: 375, z: 21, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p16", x: 219, y: 377, z: -1, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p17", x: 105, y: 395, z: -7, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p18", x: 140, y: 391, z: 26, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p19", x: 198, y: 390, z: 6, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p20", x: 173, y: 395, z: -25, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p21", x: 122, y: 405, z: 20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p22", x: 196, y: 403, z: 14, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p23", x: 151, y: 405, z: -16, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p24", x: 86, y: 408, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p25", x: 151, y: 414, z: 18, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p26", x: 179, y: 413, z: -12, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p27", x: 126, y: 416, z: -17, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p28", x: 98, y: 419, z: 11, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p29", x: 215, y: 420, z: -2, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p30", x: 158, y: 424, z: -21, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p31", x: 98, y: 432, z: 2, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p32", x: 131, y: 427, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p33", x: 151, y: 437, z: -26, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p34", x: 75, y: 443, z: -14, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p35", x: 116, y: 444, z: 37, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p36", x: 178, y: 431, z: 12, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p37", x: 92, y: 456, z: -25, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p38", x: 105, y: 468, z: 15, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p39", x: 182, y: 446, z: 38, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p40", x: 208, y: 434, z: -15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p41", x: 161, y: 485, z: 1, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p42", x: 216, y: 465, z: 31, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p43", x: 230, y: 451, z: -1, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p44", x: 198, y: 475, z: -31, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "big-45", x: 170, y: 376, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "big-46", x: 150, y: 463, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "tufo-47", x: 146, y: 404, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-48", x: 143, y: 408, z: 52, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-49", x: 135, y: 458, z: 50, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-nuvem-suspensa",
    name: "Nuvem Orgânica Suspensa",
    description: "Composição aérea macia e volumosa com efeito visual fofo de nuvem de balões.",
    palette: {"A":"#f8b4d9","B":"#d8b4fe","C":"#93c5fd","D":"#fef08a","names":{"A":"Rosa Doce","B":"Lilás Mágico","C":"Azul Céu","D":"Amarelo Candy","E":"Branco Neve"},"finishes":{"A":"matte","B":"matte","C":"satin","D":"matte","E":"satin"}},
    defaultWidthCm: 160,
    defaultHeightCm: 80,
    pieces: [
      { id: "p1", x: 88, y: 158, z: 15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p2", x: 70, y: 122, z: 8, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p3", x: 88, y: 137, z: -13, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p4", x: 107, y: 181, z: -9, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 103, y: 128, z: 17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p6", x: 92, y: 114, z: -10, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p7", x: 110, y: 146, z: -17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p8", x: 126, y: 160, z: 11, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 111, y: 97, z: -1, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 124, y: 124, z: -27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 139, y: 139, z: 2, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p12", x: 146, y: 120, z: 27, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 140, y: 99, z: -25, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p14", x: 149, y: 177, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p15", x: 161, y: 152, z: 35, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p16", x: 135, y: 76, z: 14, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p17", x: 186, y: 165, z: -23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p18", x: 195, y: 142, z: 20, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p19", x: 187, y: 74, z: 35, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p20", x: 158, y: 77, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 199, y: 185, z: 8, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 212, y: 100, z: 30, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 222, y: 74, z: -7, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p24", x: 213, y: 155, z: -30, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 236, y: 151, z: 29, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p26", x: 259, y: 70, z: 6, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p27", x: 249, y: 97, z: -43, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p28", x: 224, y: 174, z: -4, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p29", x: 278, y: 95, z: 18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p30", x: 277, y: 117, z: -24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p31", x: 259, y: 170, z: -27, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p32", x: 259, y: 133, z: 24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 300, y: 106, z: -11, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p34", x: 278, y: 142, z: -18, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p35", x: 282, y: 159, z: 8, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p36", x: 296, y: 130, z: 24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p37", x: 303, y: 149, z: -16, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p38", x: 297, y: 180, z: 3, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 320, y: 156, z: 17, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p40", x: 319, y: 127, z: -4, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "big-41", x: 180, y: 113, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-42", x: 228, y: 123, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-43", x: 110, y: 121, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-44", x: 209, y: 132, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-45", x: 208, y: 140, z: 52, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-46", x: 261, y: 111, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-47", x: 261, y: 119, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  }
];
