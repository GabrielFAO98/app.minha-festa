// Motor de Criação, Renderização e Cálculo de Balões Orgânicos
// Padrão de Alto Nível para Decoração de Festas Profissionais

export type BalloonSizeInches = 5 | 10 | 12 | 18 | 24;
export type BalloonFinish = 'satin' | 'matte' | 'chrome' | 'crystal' | 'glitter';
export type BalloonSlot = 'A' | 'B' | 'C' | 'D' | 'custom';

export interface BalloonPiece {
  id: string;
  x: number;
  y: number;
  z?: number;
  sizeInches: BalloonSizeInches;
  slot: BalloonSlot;
  customColor?: string;
  finish: BalloonFinish;
  glitterColor?: string;
  rotation?: number;
}

export interface BalloonPaletteConfig {
  A: string;
  B: string;
  C: string;
  D: string;
  name?: string;
  names?: Record<'A' | 'B' | 'C' | 'D', string>;
  finishes?: Record<'A' | 'B' | 'C' | 'D', BalloonFinish>;
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
  10: 23,  // ~25cm
  12: 28,  // ~30cm
  18: 42,  // ~45cm
  24: 56   // ~60cm
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
  { name: 'Pink Chic', hex: '#ec4899', category: 'Rosas & Blush' },
  { name: 'Marsala Nobre', hex: '#831843', category: 'Rosas & Blush' },
  // Azuis & Celestes
  { name: 'Azul Bebê', hex: '#bfdbfe', category: 'Azuis & Celestes' },
  { name: 'Azul Celeste', hex: '#60a5fa', category: 'Azuis & Celestes' },
  { name: 'Azul Royal', hex: '#1d4ed8', category: 'Azuis & Celestes' },
  { name: 'Azul Marinho', hex: '#1e3a8a', category: 'Azuis & Celestes' },
  // Terrosos & Boho
  { name: 'Terracota', hex: '#c2410c', category: 'Terrosos & Boho' },
  { name: 'Caramelo Nude', hex: '#d97706', category: 'Terrosos & Boho' },
  { name: 'Areia Macaron', hex: '#fed7aa', category: 'Terrosos & Boho' },
  { name: 'Mostarda Vintage', hex: '#eab308', category: 'Terrosos & Boho' },
  // Verdes
  { name: 'Verde Eucalipto', hex: '#52796f', category: 'Verdes' },
  { name: 'Verde Oliva', hex: '#4d6b2c', category: 'Verdes' },
  { name: 'Menta Pastel', hex: '#a7f3d0', category: 'Verdes' },
  { name: 'Verde Floresta', hex: '#166534', category: 'Verdes' },
  // Neutros & Básicos
  { name: 'Branco Neve', hex: '#ffffff', category: 'Neutros & Básicos' },
  { name: 'Off-White Pérola', hex: '#fdfbf7', category: 'Neutros & Básicos' },
  { name: 'Cinza Prata', hex: '#cbd5e1', category: 'Neutros & Básicos' },
  { name: 'Preto Noite', hex: '#18181b', category: 'Neutros & Básicos' },
  // Metálicos
  { name: 'Ouro Nobre', hex: '#d4af37', category: 'Metálicos' },
  { name: 'Rose Gold', hex: '#b76e79', category: 'Metálicos' },
  { name: 'Cobre Brilhante', hex: '#b45309', category: 'Metálicos' },
  { name: 'Prata Espelhada', hex: '#e2e8f0', category: 'Metálicos' },
  // Doces & Candy
  { name: 'Lilás Lavanda', hex: '#d8b4fe', category: 'Doces & Candy' },
  { name: 'Amarelo Candy', hex: '#fef08a', category: 'Doces & Candy' },
  { name: 'Tiffany Suave', hex: '#14b8a6', category: 'Doces & Candy' }
];

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
export function generateStudioDefs(palette: BalloonPaletteConfig): string {
  let defs = `
    <filter id="balloonShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="1.6" dy="3.6" stdDeviation="3.2" flood-color="#090d16" flood-opacity="0.22"/>
    </filter>
    <filter id="floorShadowBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <radialGradient id="glare_soft" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="65%" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glare_chrome" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="75%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  `;

  const slots: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  for (const slot of slots) {
    const hex = palette[slot] || '#d4af37';
    const isLight = isLightColor(hex);

    // 1. SATIN
    const satLight = isLight ? '#ffffff' : adjustColorBrightness(hex, 0.42);
    const satMid = hex;
    const satShadow = isLight ? '#cbd5e1' : adjustColorBrightness(hex, -0.24);
    const satDeep = isLight ? '#94a3b8' : adjustColorBrightness(hex, -0.38);

    defs += `
    <radialGradient id="grad_satin_${slot}" cx="38%" cy="34%" r="65%" fx="32%" fy="28%">
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
    <radialGradient id="grad_matte_${slot}" cx="40%" cy="36%" r="68%" fx="36%" fy="32%">
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
    <radialGradient id="grad_chrome_${slot}" cx="36%" cy="30%" r="70%" fx="30%" fy="24%">
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
    <radialGradient id="grad_crystal_${slot}" cx="35%" cy="32%" r="68%" fx="28%" fy="24%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="12%" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="${hex}" stop-opacity="0.04"/>
      <stop offset="85%" stop-color="${hex}" stop-opacity="0.18"/>
      <stop offset="96%" stop-color="${adjustColorBrightness(hex, -0.3)}" stop-opacity="0.50"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.40"/>
    </radialGradient>
    `;
  }

  return defs;
}

// Renderiza uma peça de balão individual
export function renderBalloonPieceSvg(piece: BalloonPiece, palette: BalloonPaletteConfig): string {
  const { x, y, sizeInches = 12, slot = 'A', finish = 'satin', glitterColor = '#d4af37' } = piece;
  const r = BALLOON_SIZE_RADIUS_MAP[sizeInches] || 28;
  const rx = r * 0.97;
  const ry = r * 1.03;

  const effectiveSlot = (slot === 'custom' || !slot) ? 'A' : slot;
  const effectiveFinish: BalloonFinish = (slot && slot !== 'custom' && palette.finishes && palette.finishes[slot])
    ? palette.finishes[slot]
    : finish;
  const gradId = effectiveFinish === 'glitter' ? `grad_crystal_${effectiveSlot}` : `grad_${effectiveFinish}_${effectiveSlot}`;

  const gx = x - rx * 0.24;
  const gy = y - ry * 0.26;
  const gw = rx * 0.38;
  const gh = ry * 0.28;
  const dotX = x - rx * 0.16;
  const dotY = y - ry * 0.36;
  const dotR = Math.max(1, r * 0.055);

  let interior = '';
  const isCrystalOrGlitter = effectiveFinish === 'crystal' || effectiveFinish === 'glitter';
  const filterAttr = isCrystalOrGlitter ? '' : 'filter="url(#balloonShadow)"';

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

  const isMini = sizeInches === 5;
  const isMatte = effectiveFinish === 'matte';
  const isChrome = effectiveFinish === 'chrome';
  const glareGrad = isChrome ? 'url(#glare_chrome)' : 'url(#glare_soft)';

  return `
  <g id="piece-${piece.id}" class="balloon-piece" ${filterAttr}>
    ${isCrystalOrGlitter ? `<ellipse cx="${x + 2}" cy="${y + 4}" rx="${rx}" ry="${ry}" fill="#0f172a" opacity="0.12"/>` : ''}
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${gradId})"/>
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
  const bySize: Record<BalloonSizeInches, number> = { 5: 0, 10: 0, 12: 0, 18: 0, 24: 0 };
  const bySlot: Record<BalloonSlot, number> = { A: 0, B: 0, C: 0, D: 0, custom: 0 };
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
    // 5" balões de acabamento sempre na frente (pontos de luz)
    if (a.sizeInches === 5 && b.sizeInches !== 5) return 1;
    if (b.sizeInches === 5 && a.sizeInches !== 5) return -1;

    // 18" e 24" balões gigantes de base e impacto estrutural atrás
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
  mode: 'mesclado' | 'degrade' | 'blocos'
): BalloonPiece[] {
  if (pieces.length === 0) return [];
  const slots: BalloonSlot[] = ['A', 'B', 'C', 'D'];
  const total = pieces.length;

  if (mode === 'degrade') {
    const sortedIndices = pieces
      .map((p, idx) => ({ idx, val: p.x * 0.7 + p.y }))
      .sort((a, b) => a.val - b.val);

    const result = [...pieces];
    sortedIndices.forEach(({ idx }, i) => {
      const ratio = i / Math.max(1, total - 1);
      let s: BalloonSlot = 'A';
      if (ratio < 0.35) s = 'A';
      else if (ratio < 0.65) s = 'B';
      else if (ratio < 0.85) s = 'C';
      else s = 'D';
      result[idx] = { ...result[idx], slot: s };
    });
    return result;
  }

  if (mode === 'blocos') {
    const blockSize = Math.max(3, Math.round(total / 6));
    return pieces.map((p, i) => {
      const blockIdx = Math.floor(i / blockSize) % 4;
      return { ...p, slot: slots[blockIdx] };
    });
  }

  // Mesclado
  const weights = [0.40, 0.30, 0.18, 0.12];
  return pieces.map((p, i) => {
    const hash = Math.abs(Math.sin(p.x * 12.9898 + p.y * 78.233 + i) * 43758.5453) % 1;
    let acc = 0;
    let chosen: BalloonSlot = 'A';
    for (let s = 0; s < 4; s++) {
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
      finish: p.finish
    });
  }
  return [...templatePieces, ...extra];
}

// Renderiza o SVG completo da montagem recortado com precisão
export function renderArrangementSvg(
  pieces: BalloonPiece[],
  palette: BalloonPaletteConfig,
  options: { pad?: number; hasFloorShadow?: boolean } = {}
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

  const defs = generateStudioDefs(palette);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${bw}" height="${bh}">
    <defs>${defs}</defs>
  `;

  if (options.hasFloorShadow !== false) {
    const floorY = maxY + 6;
    svg += `<ellipse cx="${(minX + maxX) / 2}" cy="${floorY}" rx="${(maxX - minX) * 0.40}" ry="12" fill="#0f172a" opacity="0.22" filter="url(#floorShadowBlur)"/>`;
  }

  // Ordena por profundidade física automática (maiores atrás, pontos de luz 5" na frente)
  const sortedPieces = sortPiecesByDepth(pieces);
  for (const p of sortedPieces) {
    svg += renderBalloonPieceSvg(p, palette);
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
    palette: {"A":"#c97a8e","B":"#f7dbe1","C":"#d4af37","D":"#ffffff"},
    defaultWidthCm: 180,
    defaultHeightCm: 230,
    pieces: [
      { id: "p1", x: 383, y: 72, z: 10, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p2", x: 390, y: 107, z: 6, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p3", x: 380, y: 78, z: -7, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "p4", x: 380, y: 36, z: -5, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p5", x: 348, y: 77, z: 11, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p6", x: 355, y: 112, z: -8, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p7", x: 342, y: 71, z: -7, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "p8", x: 343, y: 41, z: 9, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p9", x: 320, y: 132, z: -8, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 313, y: 61, z: -14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p11", x: 306, y: 23, z: 7, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p12", x: 313, y: 94, z: 17, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 279, y: 84, z: -21, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p14", x: 270, y: 20, z: -3, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p15", x: 286, y: 52, z: 17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p16", x: 278, y: 121, z: 5, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p17", x: 230, y: 27, z: -15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p18", x: 248, y: 64, z: 19, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p19", x: 249, y: 148, z: 11, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p20", x: 240, y: 102, z: -18, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p21", x: 195, y: 17, z: 15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p22", x: 205, y: 102, z: 22, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p23", x: 218, y: 134, z: -10, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p24", x: 212, y: 67, z: -22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p25", x: 178, y: 58, z: 29, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p26", x: 181, y: 138, z: -2, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p27", x: 162, y: 99, z: -42, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p28", x: 158, y: -8, z: 3, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p29", x: 198, y: 179, z: 10, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p30", x: 156, y: 160, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p31", x: 52, y: 67, z: -18, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p32", x: 90, y: 88, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 170, y: 200, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p34", x: 66, y: 144, z: -21, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p35", x: 33, y: 117, z: 26, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p36", x: 122, y: 166, z: 20, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p37", x: 92, y: 172, z: -21, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p38", x: 45, y: 182, z: 4, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 85, y: 198, z: 21, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p40", x: 124, y: 199, z: -7, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p41", x: 21, y: 219, z: -5, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p42", x: 56, y: 227, z: 23, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p43", x: 150, y: 228, z: 6, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p44", x: 92, y: 227, z: -24, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p45", x: 71, y: 264, z: 15, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p46", x: 129, y: 256, z: 11, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p47", x: 97, y: 262, z: -15, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p48", x: 39, y: 259, z: -13, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p49", x: 105, y: 284, z: 15, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p50", x: 133, y: 300, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p51", x: 77, y: 291, z: -15, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p52", x: 44, y: 294, z: 16, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p53", x: 165, y: 331, z: -5, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p54", x: 59, y: 326, z: -24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p55", x: 27, y: 331, z: 4, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p56", x: 98, y: 318, z: 24, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p57", x: 95, y: 346, z: -21, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p58", x: 31, y: 371, z: -6, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p59", x: 67, y: 355, z: 20, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p60", x: 126, y: 352, z: 5, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p61", x: 84, y: 446, z: -20, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p62", x: 51, y: 424, z: 19, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p63", x: 164, y: 390, z: 27, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p64", x: 130, y: 418, z: -18, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p65", x: 77, y: 481, z: 9, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p66", x: 141, y: 453, z: 28, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p67", x: 184, y: 439, z: -18, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p68", x: 115, y: 478, z: -27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "big-69", x: 126, y: 49, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-70", x: 116, y: 123, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "big-71", x: 82, y: 392, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-72", x: 69, y: 178, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-73", x: 72, y: 190, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-74", x: 89, y: 256, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-75", x: 93, y: 268, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-76", x: 100, y: 331, z: 50, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "tufo-77", x: 79, y: 413, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-78", x: 77, y: 425, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-cascata-romana",
    name: "Cascata Romana em S",
    description: "Arranjo fluido descendo em curva orgânica elegante pelo topo e lateral do painel romano.",
    palette: {"A":"#4d6b2c","B":"#85512b","C":"#c59a3f","D":"#f7eed7"},
    defaultWidthCm: 140,
    defaultHeightCm: 220,
    pieces: [
      { id: "p1", x: 124, y: 52, z: 11, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p2", x: 152, y: 30, z: 5, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p3", x: 132, y: 54, z: -8, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "p4", x: 89, y: 55, z: -4, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p5", x: 185, y: 54, z: 13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 152, y: 69, z: -14, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 91, y: 91, z: -12, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p8", x: 123, y: 92, z: 15, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p9", x: 222, y: 79, z: -12, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 143, y: 120, z: -22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 112, y: 130, z: 8, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p12", x: 174, y: 96, z: 21, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p13", x: 203, y: 118, z: -27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p14", x: 133, y: 158, z: 0, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p15", x: 171, y: 133, z: 22, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p16", x: 237, y: 126, z: 2, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p17", x: 134, y: 197, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p18", x: 192, y: 211, z: 27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p19", x: 261, y: 176, z: 18, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p20", x: 226, y: 201, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 151, y: 227, z: 16, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 231, y: 234, z: 24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 274, y: 227, z: -24, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p24", x: 191, y: 243, z: -22, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 211, y: 272, z: 25, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p26", x: 247, y: 275, z: -10, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p27", x: 178, y: 279, z: -21, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p28", x: 147, y: 271, z: 10, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p29", x: 257, y: 318, z: 2, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p30", x: 219, y: 304, z: -21, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p31", x: 157, y: 309, z: -1, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p32", x: 187, y: 308, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 200, y: 339, z: -20, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p34", x: 118, y: 308, z: -13, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p35", x: 167, y: 343, z: 17, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p36", x: 233, y: 355, z: 14, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p37", x: 98, y: 346, z: -21, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p38", x: 130, y: 340, z: 15, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p39", x: 196, y: 370, z: 15, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p40", x: 222, y: 389, z: -18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p41", x: 85, y: 379, z: 9, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p42", x: 179, y: 443, z: 28, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p43", x: 224, y: 444, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p44", x: 92, y: 414, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p45", x: 120, y: 436, z: 30, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p46", x: 189, y: 487, z: 7, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p47", x: 146, y: 472, z: -44, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p48", x: 85, y: 458, z: -7, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "big-49", x: 182, y: 169, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "big-50", x: 155, y: 396, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "tufo-51", x: 166, y: 78, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-52", x: 199, y: 229, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-53", x: 206, y: 241, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-demi-arco",
    name: "Demi-Arco Desconstruído",
    description: "Semi-arco moderno que contorna 60% do painel com base volumosa no chão e caimento leve no topo.",
    palette: {"A":"#f8b4d9","B":"#d8b4fe","C":"#93c5fd","D":"#fef08a"},
    defaultWidthCm: 190,
    defaultHeightCm: 210,
    pieces: [
      { id: "p1", x: 106, y: 449, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p2", x: 75, y: 480, z: 17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p3", x: 33, y: 464, z: -36, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p4", x: 143, y: 449, z: -16, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 65, y: 433, z: 22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 18, y: 411, z: -19, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 166, y: 396, z: -34, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p8", x: 123, y: 408, z: 20, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 7, y: 367, z: -9, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 108, y: 322, z: -26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 144, y: 348, z: 11, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p12", x: 36, y: 348, z: 26, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 53, y: 321, z: -22, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p14", x: 142, y: 293, z: -3, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p15", x: 78, y: 335, z: 22, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p16", x: 11, y: 322, z: -1, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p17", x: 94, y: 284, z: -13, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p18", x: 77, y: 304, z: 17, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p19", x: 22, y: 283, z: 13, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p20", x: 55, y: 282, z: -22, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p21", x: 112, y: 260, z: 14, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 44, y: 249, z: 22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 12, y: 250, z: -12, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p24", x: 80, y: 244, z: -20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p25", x: 65, y: 210, z: 24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p26", x: 10, y: 210, z: -8, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p27", x: 96, y: 207, z: -20, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p28", x: 141, y: 228, z: 5, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p29", x: 36, y: 146, z: 7, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p30", x: 43, y: 182, z: -26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p31", x: 166, y: 197, z: -3, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p32", x: 122, y: 189, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 94, y: 101, z: -24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p34", x: 146, y: 163, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p35", x: 126, y: 137, z: 18, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p36", x: 59, y: 109, z: 12, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 151, y: 119, z: -21, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p38", x: 179, y: 150, z: 16, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p39", x: 125, y: 101, z: 17, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p40", x: 104, y: 58, z: -17, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p41", x: 180, y: 110, z: 4, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p42", x: 139, y: 64, z: 23, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p43", x: 139, y: 32, z: -6, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p44", x: 170, y: 79, z: -24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p45", x: 205, y: 79, z: 22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p46", x: 176, y: 15, z: 4, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p47", x: 198, y: 48, z: -18, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p48", x: 216, y: 124, z: -4, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p49", x: 231, y: 17, z: 10, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p50", x: 238, y: 53, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p51", x: 256, y: 123, z: -9, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p52", x: 245, y: 91, z: 17, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p53", x: 279, y: 15, z: -12, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p54", x: 280, y: 91, z: -16, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p55", x: 315, y: 73, z: 9, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p56", x: 274, y: 51, z: 15, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p57", x: 349, y: 66, z: -13, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p58", x: 323, y: 108, z: 2, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p59", x: 312, y: 67, z: 9, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "p60", x: 313, y: 38, z: -4, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "big-61", x: 77, y: 382, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-62", x: 91, y: 156, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-63", x: 79, y: 247, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-64", x: 82, y: 259, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-65", x: 151, y: 129, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-66", x: 157, y: 141, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-67", x: 195, y: 62, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-68", x: 202, y: 74, z: 52, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-69", x: 274, y: 55, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-70", x: 270, y: 67, z: 52, sizeInches: 5, slot: "A", finish: "satin" }
    ]
  },
  {
    id: "modelo-guirlanda-suspensa",
    name: "Guirlanda Orgânica Suspensa",
    description: "Faixa orgânica horizontal perfeita para topo de boiserie, mesas ou painéis retangulares.",
    palette: {"A":"#1e40af","B":"#60a5fa","C":"#cbd5e1","D":"#ffffff"},
    defaultWidthCm: 240,
    defaultHeightCm: 90,
    pieces: [
      { id: "p1", x: 62, y: 191, z: 10, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p2", x: 33, y: 119, z: 6, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p3", x: 59, y: 151, z: -7, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p4", x: 43, y: 160, z: -6, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p5", x: 71, y: 132, z: 13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 81, y: 97, z: -12, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 89, y: 168, z: -11, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p8", x: 102, y: 206, z: 11, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p9", x: 118, y: 81, z: -7, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p10", x: 126, y: 156, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p11", x: 138, y: 194, z: 5, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p12", x: 112, y: 113, z: 19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p13", x: 169, y: 149, z: -24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p14", x: 176, y: 184, z: 2, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p15", x: 146, y: 131, z: 19, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p16", x: 156, y: 93, z: 1, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p17", x: 213, y: 213, z: -7, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p18", x: 200, y: 135, z: 27, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p19", x: 198, y: 57, z: 11, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p20", x: 191, y: 101, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 238, y: 176, z: 20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p22", x: 246, y: 82, z: 23, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p23", x: 250, y: 39, z: -29, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p24", x: 206, y: 169, z: -25, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 284, y: 112, z: 30, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p26", x: 280, y: 76, z: -3, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p27", x: 278, y: 163, z: -44, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p28", x: 269, y: 207, z: 5, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p29", x: 344, y: 48, z: 4, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p30", x: 312, y: 62, z: -29, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p31", x: 323, y: 200, z: -4, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p32", x: 316, y: 156, z: 29, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p33", x: 382, y: 115, z: -25, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p34", x: 378, y: 205, z: -11, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p35", x: 367, y: 159, z: 38, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p36", x: 375, y: 80, z: 12, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 409, y: 153, z: -17, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p38", x: 411, y: 191, z: 17, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 412, y: 121, z: 15, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p40", x: 418, y: 88, z: -16, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p41", x: 454, y: 194, z: 9, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p42", x: 446, y: 123, z: 16, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p43", x: 458, y: 89, z: -7, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p44", x: 451, y: 159, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p45", x: 481, y: 142, z: 18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p46", x: 491, y: 103, z: -1, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p47", x: 513, y: 136, z: -15, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p48", x: 497, y: 183, z: 0, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "big-49", x: 242, y: 125, z: -10, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "big-50", x: 329, y: 114, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "tufo-51", x: 93, y: 130, z: 50, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "tufo-52", x: 99, y: 142, z: 52, sizeInches: 5, slot: "D", finish: "satin" },
      { id: "tufo-53", x: 247, y: 124, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-54", x: 396, y: 161, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-55", x: 389, y: 173, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-cluster-chao",
    name: "Cluster Orgânico de Chão",
    description: "Arranjo de chão poente de alto impacto com base em balão de 24\" e camadas de acabamento.",
    palette: {"A":"#c2410c","B":"#fed7aa","C":"#eab308","D":"#ffffff"},
    defaultWidthCm: 150,
    defaultHeightCm: 110,
    pieces: [
      { id: "p1", x: 85, y: 266, z: 22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p2", x: 44, y: 215, z: 11, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p3", x: 72, y: 237, z: -17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p4", x: 92, y: 302, z: -12, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 87, y: 208, z: 21, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 67, y: 179, z: -19, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 143, y: 281, z: -31, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p8", x: 121, y: 244, z: 18, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 76, y: 129, z: -2, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 159, y: 223, z: -30, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 195, y: 277, z: 9, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p12", x: 129, y: 204, z: 30, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p13", x: 162, y: 130, z: -31, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p14", x: 194, y: 224, z: -4, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p15", x: 170, y: 172, z: 45, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p16", x: 133, y: 109, z: 10, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p17", x: 208, y: 183, z: -15, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p18", x: 241, y: 172, z: 27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p19", x: 201, y: 65, z: 23, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p20", x: 162, y: 86, z: -29, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 236, y: 245, z: 19, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 275, y: 106, z: 25, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 270, y: 61, z: -32, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p24", x: 236, y: 211, z: -25, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 320, y: 134, z: 30, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p26", x: 310, y: 100, z: -9, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p27", x: 279, y: 151, z: -45, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p28", x: 267, y: 208, z: 7, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p29", x: 353, y: 108, z: 5, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p30", x: 354, y: 144, z: -29, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p31", x: 277, y: 261, z: -6, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p32", x: 358, y: 179, z: 29, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p33", x: 392, y: 180, z: -24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p34", x: 364, y: 215, z: -14, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p35", x: 327, y: 243, z: 33, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p36", x: 390, y: 144, z: 18, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 367, y: 254, z: -17, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p38", x: 364, y: 287, z: 14, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 389, y: 235, z: 17, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p40", x: 416, y: 217, z: -15, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "big-41", x: 225, y: 122, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-42", x: 119, y: 162, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "big-43", x: 316, y: 190, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-44", x: 188, y: 185, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-45", x: 189, y: 197, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-46", x: 329, y: 155, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-47", x: 325, y: 167, z: 52, sizeInches: 5, slot: "B", finish: "satin" }
    ]
  },
  {
    id: "modelo-totem-coluna",
    name: "Totem Orgânico / Coluna Moderna",
    description: "Coluna vertical esguia com curvas orgânicas para lateral de mesas ou entrada do evento.",
    palette: {"A":"#18181b","B":"#d4af37","C":"#ffffff","D":"#71717a"},
    defaultWidthCm: 100,
    defaultHeightCm: 220,
    pieces: [
      { id: "p1", x: 174, y: 466, z: 28, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p2", x: 97, y: 441, z: 19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p3", x: 127, y: 478, z: -39, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p4", x: 209, y: 457, z: -17, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 100, y: 396, z: 24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p6", x: 70, y: 416, z: -13, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p7", x: 195, y: 379, z: -37, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p8", x: 200, y: 423, z: 15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 72, y: 367, z: 0, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p10", x: 104, y: 360, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p11", x: 167, y: 352, z: 1, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p12", x: 139, y: 368, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p13", x: 136, y: 338, z: -18, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p14", x: 195, y: 324, z: -13, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p15", x: 157, y: 319, z: 19, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p16", x: 85, y: 330, z: 11, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p17", x: 166, y: 289, z: -23, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p18", x: 202, y: 289, z: 12, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p19", x: 121, y: 316, z: 18, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p20", x: 97, y: 287, z: -13, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 230, y: 253, z: 6, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 132, y: 281, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 88, y: 249, z: -5, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p24", x: 193, y: 254, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 171, y: 208, z: 26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p26", x: 94, y: 209, z: 1, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p27", x: 144, y: 189, z: -21, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p28", x: 204, y: 218, z: -1, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p29", x: 77, y: 168, z: 9, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p30", x: 113, y: 166, z: -23, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p31", x: 198, y: 178, z: -7, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p32", x: 169, y: 165, z: 23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p33", x: 146, y: 145, z: -13, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p34", x: 191, y: 142, z: -14, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p35", x: 167, y: 123, z: 14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p36", x: 110, y: 130, z: 18, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p37", x: 137, y: 113, z: -19, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p38", x: 203, y: 103, z: 4, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 123, y: 87, z: 19, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p40", x: 83, y: 92, z: -5, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "big-41", x: 147, y: 420, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-42", x: 140, y: 239, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "big-43", x: 160, y: 68, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "tufo-44", x: 115, y: 407, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-45", x: 112, y: 419, z: 52, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-46", x: 174, y: 253, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-47", x: 167, y: 265, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-arco-duplo",
    name: "Arco Orgânico Bicolor",
    description: "Harmonia contemporânea em blocos orgânicos contrastantes com transição elegante.",
    palette: {"A":"#c2410c","B":"#fed7aa","C":"#d4af37","D":"#ffffff"},
    defaultWidthCm: 180,
    defaultHeightCm: 220,
    pieces: [
      { id: "p1", x: 368, y: 56, z: 11, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p2", x: 383, y: 107, z: 7, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p3", x: 370, y: 82, z: -8, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "p4", x: 404, y: 62, z: -7, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p5", x: 354, y: 88, z: 14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p6", x: 339, y: 125, z: -9, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 331, y: 74, z: -14, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p8", x: 342, y: 25, z: 10, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 299, y: 144, z: -1, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 296, y: 94, z: -20, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 300, y: 14, z: -2, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p12", x: 309, y: 52, z: 20, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 258, y: 84, z: -16, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p14", x: 260, y: 15, z: -8, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p15", x: 275, y: 66, z: 17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p16", x: 266, y: 115, z: 11, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p17", x: 218, y: 36, z: -20, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p18", x: 245, y: 51, z: 14, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p19", x: 232, y: 80, z: 15, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p20", x: 230, y: 111, z: -15, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 185, y: 21, z: 6, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p22", x: 195, y: 86, z: 25, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p23", x: 212, y: 144, z: -2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p24", x: 179, y: 56, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 146, y: 44, z: 27, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p26", x: 203, y: 181, z: 11, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p27", x: 176, y: 124, z: -39, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p28", x: 115, y: 26, z: -10, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p29", x: 138, y: 146, z: 21, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p30", x: 169, y: 176, z: -22, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p31", x: 48, y: 90, z: -31, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p32", x: 80, y: 120, z: 23, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 127, y: 181, z: -12, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p34", x: 66, y: 152, z: -26, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p35", x: 25, y: 139, z: 19, sizeInches: 18, slot: "D", finish: "satin" },
      { id: "p36", x: 98, y: 163, z: 26, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 74, y: 195, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p38", x: 38, y: 193, z: 3, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 105, y: 202, z: 21, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p40", x: 156, y: 216, z: -2, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p41", x: 30, y: 232, z: -6, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p42", x: 67, y: 227, z: 19, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p43", x: 131, y: 243, z: 8, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p44", x: 100, y: 232, z: -23, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p45", x: 26, y: 269, z: 12, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p46", x: 88, y: 262, z: 15, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p47", x: 114, y: 269, z: -13, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p48", x: 57, y: 261, z: -20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p49", x: 106, y: 294, z: 20, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p50", x: 141, y: 291, z: -4, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p51", x: 76, y: 295, z: -20, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p52", x: 38, y: 308, z: 3, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p53", x: 157, y: 327, z: 4, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p54", x: 120, y: 325, z: -26, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p55", x: 17, y: 342, z: -2, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p56", x: 84, y: 325, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p57", x: 119, y: 370, z: -26, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p58", x: 31, y: 408, z: -9, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p59", x: 81, y: 413, z: 38, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p60", x: 156, y: 371, z: 10, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p61", x: 103, y: 452, z: -22, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p62", x: 70, y: 466, z: 20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p63", x: 169, y: 425, z: 33, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p64", x: 125, y: 413, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "big-65", x: 124, y: 92, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-66", x: 63, y: 363, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-67", x: 256, y: 69, z: 50, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-68", x: 262, y: 81, z: 52, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "tufo-69", x: 83, y: 268, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-70", x: 110, y: 341, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-71", x: 107, y: 353, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-moldura-redonda",
    name: "Moldura para Painel Redondo 270°",
    description: "Arco escultural que abraça 3/4 da circunferência do painel redondo de 150cm a 180cm.",
    palette: {"A":"#f472b6","B":"#38bdf8","C":"#ffffff","D":"#d4af37"},
    defaultWidthCm: 210,
    defaultHeightCm: 210,
    pieces: [
      { id: "p1", x: 148, y: 369, z: 27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p2", x: 55, y: 398, z: 13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p3", x: 103, y: 369, z: -40, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p4", x: 180, y: 351, z: -12, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 61, y: 354, z: 23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 26, y: 346, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 159, y: 300, z: -33, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p8", x: 126, y: 330, z: 17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p9", x: 12, y: 296, z: -11, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 116, y: 252, z: -27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 160, y: 247, z: 14, sizeInches: 18, slot: "A", finish: "satin" },
      { id: "p12", x: 39, y: 272, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p13", x: 50, y: 239, z: -27, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p14", x: 96, y: 223, z: 1, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p15", x: 76, y: 257, z: 22, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p16", x: 15, y: 245, z: 0, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p17", x: 137, y: 209, z: -14, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p18", x: 56, y: 205, z: 24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p19", x: -1, y: 208, z: 8, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p20", x: 26, y: 189, z: -23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p21", x: 109, y: 185, z: 11, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p22", x: 44, y: 158, z: 24, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 11, y: 153, z: -10, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p24", x: 78, y: 179, z: -22, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p25", x: 86, y: 147, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p26", x: 37, y: 123, z: -2, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p27", x: 79, y: 116, z: -21, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p28", x: 144, y: 166, z: 1, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p29", x: 66, y: 48, z: 7, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p30", x: 57, y: 83, z: -23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p31", x: 151, y: 129, z: -8, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p32", x: 120, y: 121, z: 23, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p33", x: 120, y: 24, z: -17, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p34", x: 180, y: 147, z: -14, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p35", x: 158, y: 96, z: 14, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p36", x: 147, y: 50, z: 18, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p37", x: 176, y: 70, z: -23, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p38", x: 195, y: 110, z: 4, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p39", x: 186, y: 39, z: 18, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p40", x: 161, y: 8, z: -4, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p41", x: 229, y: 138, z: -3, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p42", x: 211, y: 69, z: 22, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p43", x: 204, y: 8, z: 5, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p44", x: 223, y: 35, z: -22, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p45", x: 250, y: 64, z: 13, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p46", x: 251, y: 11, z: 12, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p47", x: 266, y: 40, z: -14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p48", x: 236, y: 94, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p49", x: 295, y: 56, z: 18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p50", x: 316, y: 27, z: -10, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p51", x: 273, y: 80, z: -14, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p52", x: 271, y: 120, z: 10, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p53", x: 353, y: 43, z: -2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p54", x: 307, y: 99, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p55", x: 300, y: 146, z: 2, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p56", x: 339, y: 81, z: 19, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p57", x: 359, y: 110, z: -18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p58", x: 329, y: 166, z: -5, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p59", x: 327, y: 123, z: 14, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p60", x: 401, y: 95, z: 5, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p61", x: 371, y: 171, z: -9, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p62", x: 355, y: 142, z: 10, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p63", x: 375, y: 150, z: 7, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p64", x: 391, y: 142, z: -11, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p65", x: 345, y: 197, z: 2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p66", x: 405, y: 183, z: 13, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p67", x: 386, y: 188, z: -3, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p68", x: 384, y: 202, z: -13, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p69", x: 384, y: 237, z: 12, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p70", x: 419, y: 231, z: 2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p71", x: 381, y: 228, z: -8, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p72", x: 348, y: 232, z: -2, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p73", x: 408, y: 280, z: 6, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p74", x: 374, y: 270, z: -10, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p75", x: 364, y: 262, z: -4, sizeInches: 5, slot: "C", finish: "satin" },
      { id: "p76", x: 338, y: 266, z: 10, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p77", x: 388, y: 313, z: -6, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p78", x: 318, y: 296, z: -8, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p79", x: 347, y: 297, z: 3, sizeInches: 5, slot: "B", finish: "satin" },
      { id: "p80", x: 354, y: 300, z: 9, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "big-81", x: 80, y: 305, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-82", x: 112, y: 78, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-83", x: 68, y: 328, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-84", x: 63, y: 340, z: 52, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-85", x: 93, y: 241, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-86", x: 79, y: 170, z: 50, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-87", x: 81, y: 182, z: 52, sizeInches: 5, slot: "A", finish: "satin" },
      { id: "tufo-88", x: 181, y: 84, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-89", x: 184, y: 96, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-cascata-mesa",
    name: "Cascata Mesa Cilindro & Chão",
    description: "Enfeite dinâmico que nasce no topo da mesa cilindro e escorre organicamente até o chão.",
    palette: {"A":"#52796f","B":"#84a98c","C":"#d4af37","D":"#f8fafc"},
    defaultWidthCm: 120,
    defaultHeightCm: 170,
    pieces: [
      { id: "p1", x: 82, y: 94, z: 18, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p2", x: 133, y: 48, z: 5, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p3", x: 111, y: 81, z: -14, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p4", x: 59, y: 137, z: -6, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p5", x: 188, y: 75, z: 14, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p6", x: 159, y: 96, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p7", x: 97, y: 124, z: -13, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p8", x: 125, y: 109, z: 18, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 209, y: 116, z: -8, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p10", x: 140, y: 140, z: -23, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p11", x: 112, y: 157, z: 6, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p12", x: 175, y: 129, z: 24, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 133, y: 184, z: -26, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p14", x: 90, y: 192, z: -1, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p15", x: 156, y: 166, z: 21, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p16", x: 250, y: 170, z: -1, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p17", x: 121, y: 224, z: -7, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p18", x: 161, y: 212, z: 26, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p19", x: 227, y: 208, z: 6, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p20", x: 198, y: 223, z: -25, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p21", x: 141, y: 253, z: 20, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p22", x: 224, y: 247, z: 14, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p23", x: 173, y: 253, z: -16, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p24", x: 100, y: 262, z: -17, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p25", x: 173, y: 281, z: 18, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p26", x: 205, y: 277, z: -12, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p27", x: 145, y: 285, z: -17, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p28", x: 113, y: 294, z: 11, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p29", x: 246, y: 296, z: -2, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p30", x: 181, y: 308, z: -21, sizeInches: 10, slot: "D", finish: "satin" },
      { id: "p31", x: 113, y: 333, z: 2, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p32", x: 151, y: 317, z: 26, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p33", x: 173, y: 347, z: -26, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p34", x: 87, y: 364, z: -14, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p35", x: 134, y: 369, z: 37, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p36", x: 204, y: 330, z: 12, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p37", x: 107, y: 404, z: -25, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p38", x: 121, y: 438, z: 15, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p39", x: 209, y: 374, z: 38, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p40", x: 238, y: 339, z: -15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p41", x: 185, y: 488, z: 1, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p42", x: 247, y: 429, z: 31, sizeInches: 12, slot: "D", finish: "satin" },
      { id: "p43", x: 263, y: 388, z: -1, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p44", x: 227, y: 460, z: -31, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "big-45", x: 195, y: 168, z: -10, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "big-46", x: 172, y: 424, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "tufo-47", x: 168, y: 251, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-48", x: 164, y: 263, z: 52, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-49", x: 155, y: 409, z: 50, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  },
  {
    id: "modelo-nuvem-suspensa",
    name: "Nuvem Orgânica Suspensa",
    description: "Composição aérea macia e volumosa com efeito visual fofo de nuvem de balões.",
    palette: {"A":"#f8b4d9","B":"#d8b4fe","C":"#93c5fd","D":"#fef08a"},
    defaultWidthCm: 190,
    defaultHeightCm: 120,
    pieces: [
      { id: "p1", x: 63, y: 182, z: 15, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p2", x: 35, y: 125, z: 8, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p3", x: 62, y: 149, z: -13, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p4", x: 91, y: 217, z: -9, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p5", x: 86, y: 134, z: 17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p6", x: 68, y: 112, z: -10, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p7", x: 96, y: 163, z: -17, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p8", x: 121, y: 185, z: 11, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p9", x: 98, y: 86, z: -1, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p10", x: 117, y: 128, z: -27, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p11", x: 140, y: 151, z: 2, sizeInches: 10, slot: "B", finish: "satin" },
      { id: "p12", x: 152, y: 122, z: 27, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p13", x: 142, y: 88, z: -25, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p14", x: 156, y: 212, z: -13, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p15", x: 174, y: 172, z: 35, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "p16", x: 134, y: 53, z: 14, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p17", x: 213, y: 193, z: -23, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p18", x: 226, y: 157, z: 20, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p19", x: 215, y: 50, z: 35, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p20", x: 170, y: 54, z: -19, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p21", x: 232, y: 224, z: 8, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p22", x: 252, y: 91, z: 30, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "p23", x: 268, y: 50, z: -7, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p24", x: 254, y: 176, z: -30, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p25", x: 290, y: 170, z: 29, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p26", x: 324, y: 43, z: 6, sizeInches: 12, slot: "B", finish: "satin" },
      { id: "p27", x: 309, y: 85, z: -43, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p28", x: 271, y: 206, z: -4, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p29", x: 354, y: 82, z: 18, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p30", x: 352, y: 117, z: -24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p31", x: 325, y: 200, z: -27, sizeInches: 18, slot: "C", finish: "satin" },
      { id: "p32", x: 325, y: 142, z: 24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p33", x: 388, y: 100, z: -11, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p34", x: 354, y: 156, z: -18, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p35", x: 360, y: 183, z: 8, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p36", x: 381, y: 137, z: 24, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p37", x: 392, y: 168, z: -16, sizeInches: 10, slot: "C", finish: "satin" },
      { id: "p38", x: 382, y: 216, z: 3, sizeInches: 12, slot: "C", finish: "satin" },
      { id: "p39", x: 418, y: 179, z: 17, sizeInches: 10, slot: "A", finish: "satin" },
      { id: "p40", x: 417, y: 133, z: -4, sizeInches: 12, slot: "A", finish: "satin" },
      { id: "big-41", x: 203, y: 110, z: -10, sizeInches: 24, slot: "A", finish: "satin" },
      { id: "big-42", x: 277, y: 127, z: -10, sizeInches: 18, slot: "B", finish: "satin" },
      { id: "tufo-43", x: 97, y: 123, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-44", x: 248, y: 141, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-45", x: 247, y: 153, z: 52, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-46", x: 328, y: 108, z: 50, sizeInches: 5, slot: "C", finish: "chrome" },
      { id: "tufo-47", x: 328, y: 120, z: 52, sizeInches: 5, slot: "C", finish: "chrome" }
    ]
  }
];
