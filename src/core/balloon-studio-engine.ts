// Motor de Criação, Renderização e Cálculo de Balões Orgânicos
// Padrão de Alto Nível para Decoração de Festas Profissionais

export type BalloonSizeInches = 5 | 10 | 12 | 18 | 24;
export type BalloonFinish = 'satin' | 'matte' | 'chrome' | 'crystal' | 'glitter';
export type BalloonSlot = 'A' | 'B' | 'C' | 'D' | 'custom';

export interface BalloonPiece {
  id: string;
  x: number;
  y: number;
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

// Paletas Prontas Populares de Inspiração para o Estúdio
export const STUDIO_PALETTE_PRESETS: { id: string; name: string; palette: BalloonPaletteConfig }[] = [
  {
    id: 'rose-gold-blush',
    name: 'Rose Gold, Blush & Pérola',
    palette: { A: '#c97a8e', B: '#f7dbe1', C: '#d4af37', D: '#ffffff' }
  },
  {
    id: 'candy-colors',
    name: 'Candy Colors Pastel',
    palette: { A: '#f8b4d9', B: '#d8b4fe', C: '#93c5fd', D: '#fef08a' }
  },
  {
    id: 'safari-chic',
    name: 'Safari & Floresta Chic',
    palette: { A: '#4d6b2c', B: '#85512b', C: '#c59a3f', D: '#f7eed7' }
  },
  {
    id: 'glamour-ouro-preto',
    name: 'Dourado Glamour & Preto',
    palette: { A: '#0f172a', B: '#d4af37', C: '#ffffff', D: '#334155' }
  },
  {
    id: 'azul-real-prata',
    name: 'Azul Real, Celeste & Prata',
    palette: { A: '#1e40af', B: '#60a5fa', C: '#cbd5e1', D: '#ffffff' }
  },
  {
    id: 'cha-revelacao',
    name: 'Chá Revelação Baby',
    palette: { A: '#f472b6', B: '#38bdf8', C: '#ffffff', D: '#d4af37' }
  },
  {
    id: 'boho-terracota',
    name: 'Boho Terracota & Nude',
    palette: { A: '#c2410c', B: '#d97706', C: '#fed7aa', D: '#fdfbf7' }
  },
  {
    id: 'sereia-magica',
    name: 'Sereia, Lilás & Tiffany',
    palette: { A: '#9333ea', B: '#14b8a6', C: '#f472b6', D: '#e0e7ff' }
  },
  {
    id: 'vermelho-luxo',
    name: 'Vermelho Luxo & Ouro',
    palette: { A: '#dc2626', B: '#eab308', C: '#fecaca', D: '#ffffff' }
  },
  {
    id: 'verde-eucalipto',
    name: 'Verde Eucalipto & Pérola',
    palette: { A: '#52796f', B: '#84a98c', C: '#d4af37', D: '#f8fafc' }
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
  const gradId = finish === 'glitter' ? `grad_crystal_${effectiveSlot}` : `grad_${finish}_${effectiveSlot}`;

  const gx = x - rx * 0.24;
  const gy = y - ry * 0.26;
  const gw = rx * 0.38;
  const gh = ry * 0.28;
  const dotX = x - rx * 0.16;
  const dotY = y - ry * 0.36;
  const dotR = Math.max(1, r * 0.055);

  let interior = '';
  const isCrystalOrGlitter = finish === 'crystal' || finish === 'glitter';
  const filterAttr = isCrystalOrGlitter ? '' : 'filter="url(#balloonShadow)"';

  if (finish === 'glitter') {
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
  const isMatte = finish === 'matte';
  const isChrome = finish === 'chrome';
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
export function calculateArrangementStats(pieces: BalloonPiece[]): ArrangementStats {
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

    bySize[p.sizeInches] = (bySize[p.sizeInches] || 0) + 1;
    bySlot[p.slot] = (bySlot[p.slot] || 0) + 1;
    byFinish[p.finish] = (byFinish[p.finish] || 0) + 1;
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

  for (const p of pieces) {
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
    id: 'modelo-arco-l-luxo',
    name: 'Arco Orgânico em L Luxo',
    description: 'Cotovelo com Big Balloon de 24", coluna sinuosa com balões de 18", cristais com glitter e tufos de acabamento.',
    palette: { A: '#c97a8e', B: '#f7dbe1', C: '#d4af37', D: '#ffffff' },
    defaultWidthCm: 180,
    defaultHeightCm: 230,
    pieces: [
      { id: 'p1', x: 300, y: 72, sizeInches: 10, slot: 'B', finish: 'satin' },
      { id: 'p2', x: 270, y: 64, sizeInches: 12, slot: 'C', finish: 'chrome' },
      { id: 'p3', x: 238, y: 60, sizeInches: 12, slot: 'A', finish: 'satin' },
      { id: 'p4', x: 202, y: 60, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'p5', x: 165, y: 64, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'p6', x: 128, y: 68, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p7', x: 80, y: 74, sizeInches: 24, slot: 'A', finish: 'satin' },
      { id: 'p8', x: 50, y: 110, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 'p9', x: 54, y: 155, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'p10', x: 74, y: 196, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p11', x: 78, y: 236, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 'p12', x: 56, y: 272, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'p13', x: 54, y: 312, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 'p14', x: 72, y: 355, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p15', x: 58, y: 420, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'p16', x: 96, y: 442, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 'p17', x: 308, y: 84, sizeInches: 10, slot: 'A', finish: 'satin' },
      { id: 'p18', x: 284, y: 84, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 'p19', x: 256, y: 78, sizeInches: 12, slot: 'B', finish: 'satin' },
      { id: 'p20', x: 230, y: 88, sizeInches: 12, slot: 'C', finish: 'chrome' },
      { id: 'p21', x: 200, y: 76, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p22', x: 172, y: 92, sizeInches: 18, slot: 'B', finish: 'crystal' },
      { id: 'p23', x: 142, y: 78, sizeInches: 18, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'p24', x: 118, y: 95, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p25', x: 98, y: 76, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'p26', x: 68, y: 94, sizeInches: 24, slot: 'C', finish: 'chrome' },
      { id: 'p27', x: 106, y: 120, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p28', x: 55, y: 138, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'p29', x: 84, y: 152, sizeInches: 18, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'p30', x: 110, y: 186, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 'p31', x: 64, y: 184, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 'p32', x: 88, y: 212, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p33', x: 98, y: 248, sizeInches: 12, slot: 'B', finish: 'satin' },
      { id: 'p34', x: 58, y: 245, sizeInches: 12, slot: 'C', finish: 'chrome' },
      { id: 'p35', x: 76, y: 268, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p36', x: 114, y: 305, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'p37', x: 62, y: 310, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 'p38', x: 88, y: 326, sizeInches: 18, slot: 'D', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'p39', x: 58, y: 360, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p40', x: 96, y: 372, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'p41', x: 75, y: 398, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 'p42', x: 122, y: 432, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'p43', x: 82, y: 432, sizeInches: 18, slot: 'D', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'p44', x: 45, y: 440, sizeInches: 12, slot: 'B', finish: 'satin' },
      { id: 'p45', x: 98, y: 448, sizeInches: 10, slot: 'C', finish: 'chrome' },
      // Tufos 5"
      { id: 'p46', x: 214, y: 96, sizeInches: 5, slot: 'B', finish: 'satin' },
      { id: 'p47', x: 206, y: 104, sizeInches: 5, slot: 'C', finish: 'chrome' },
      { id: 'p48', x: 94, y: 112, sizeInches: 5, slot: 'A', finish: 'satin' },
      { id: 'p49', x: 86, y: 124, sizeInches: 5, slot: 'B', finish: 'satin' },
      { id: 'p50', x: 100, y: 130, sizeInches: 5, slot: 'C', finish: 'chrome' },
      { id: 'p51', x: 54, y: 290, sizeInches: 5, slot: 'C', finish: 'chrome' },
      { id: 'p52', x: 46, y: 300, sizeInches: 5, slot: 'D', finish: 'matte' },
      { id: 'p53', x: 108, y: 405, sizeInches: 5, slot: 'B', finish: 'satin' },
      { id: 'p54', x: 118, y: 414, sizeInches: 5, slot: 'A', finish: 'satin' }
    ]
  },
  {
    id: 'modelo-guirlanda-candy',
    name: 'Guirlanda Curva Candy Colors',
    description: 'Curva superior orgânica para topo de painel redondo ou romano com transições de tons pastel.',
    palette: { A: '#f8b4d9', B: '#d8b4fe', C: '#93c5fd', D: '#fef08a' },
    defaultWidthCm: 210,
    defaultHeightCm: 115,
    pieces: [
      { id: 'c1', x: 40, y: 190, sizeInches: 10, slot: 'A', finish: 'matte' },
      { id: 'c2', x: 68, y: 162, sizeInches: 12, slot: 'B', finish: 'matte' },
      { id: 'c3', x: 102, y: 136, sizeInches: 12, slot: 'C', finish: 'matte' },
      { id: 'c4', x: 140, y: 112, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'c5', x: 180, y: 94, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'c6', x: 215, y: 84, sizeInches: 24, slot: 'B', finish: 'matte' },
      { id: 'c7', x: 250, y: 94, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'c8', x: 290, y: 112, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'c9', x: 328, y: 136, sizeInches: 12, slot: 'A', finish: 'matte' },
      { id: 'c10', x: 362, y: 162, sizeInches: 12, slot: 'B', finish: 'matte' },
      { id: 'c11', x: 390, y: 190, sizeInches: 10, slot: 'C', finish: 'matte' },
      { id: 'c12', x: 48, y: 180, sizeInches: 10, slot: 'C', finish: 'satin' },
      { id: 'c13', x: 74, y: 182, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 'c14', x: 84, y: 152, sizeInches: 12, slot: 'A', finish: 'matte' },
      { id: 'c15', x: 112, y: 148, sizeInches: 12, slot: 'B', finish: 'crystal' },
      { id: 'c16', x: 126, y: 128, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'c17', x: 150, y: 144, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'c18', x: 162, y: 118, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'c19', x: 190, y: 132, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'c20', x: 215, y: 110, sizeInches: 24, slot: 'A', finish: 'matte' },
      { id: 'c21', x: 240, y: 132, sizeInches: 18, slot: 'D', finish: 'crystal' },
      { id: 'c22', x: 215, y: 72, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'c23', x: 268, y: 118, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 'c24', x: 280, y: 144, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'c25', x: 304, y: 128, sizeInches: 18, slot: 'D', finish: 'satin' },
      { id: 'c26', x: 318, y: 148, sizeInches: 12, slot: 'A', finish: 'matte' },
      { id: 'c27', x: 346, y: 152, sizeInches: 12, slot: 'B', finish: 'matte' },
      { id: 'c28', x: 356, y: 182, sizeInches: 12, slot: 'C', finish: 'matte' },
      { id: 'c29', x: 382, y: 180, sizeInches: 10, slot: 'D', finish: 'satin' },
      { id: 'c30', x: 124, y: 142, sizeInches: 5, slot: 'A', finish: 'matte' },
      { id: 'c31', x: 116, y: 150, sizeInches: 5, slot: 'B', finish: 'matte' },
      { id: 'c32', x: 192, y: 118, sizeInches: 5, slot: 'D', finish: 'matte' },
      { id: 'c33', x: 184, y: 126, sizeInches: 5, slot: 'C', finish: 'matte' },
      { id: 'c34', x: 236, y: 118, sizeInches: 5, slot: 'A', finish: 'matte' },
      { id: 'c35', x: 244, y: 126, sizeInches: 5, slot: 'B', finish: 'matte' },
      { id: 'c36', x: 306, y: 142, sizeInches: 5, slot: 'C', finish: 'matte' },
      { id: 'c37', x: 314, y: 150, sizeInches: 5, slot: 'D', finish: 'matte' }
    ]
  },
  {
    id: 'modelo-cascata-safari',
    name: 'Arco Cascata de Chão Safari Chic',
    description: 'Cascata fluida que contorna o painel e derrama generosamente pelo piso com tons terrosos e dourado cromado.',
    palette: { A: '#4d6b2c', B: '#85512b', C: '#c59a3f', D: '#f7eed7' },
    defaultWidthCm: 180,
    defaultHeightCm: 235,
    pieces: [
      { id: 's1', x: 315, y: 80, sizeInches: 10, slot: 'B', finish: 'matte' },
      { id: 's2', x: 286, y: 68, sizeInches: 12, slot: 'C', finish: 'chrome' },
      { id: 's3', x: 252, y: 60, sizeInches: 12, slot: 'A', finish: 'matte' },
      { id: 's4', x: 216, y: 58, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 's5', x: 180, y: 64, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 's6', x: 142, y: 78, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 's7', x: 104, y: 104, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 's8', x: 70, y: 142, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 's9', x: 52, y: 190, sizeInches: 24, slot: 'A', finish: 'matte' },
      { id: 's10', x: 54, y: 240, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 's11', x: 68, y: 288, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 's12', x: 84, y: 334, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 's13', x: 94, y: 380, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 's14', x: 124, y: 420, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 's15', x: 174, y: 428, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 's16', x: 228, y: 434, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 's17', x: 282, y: 440, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 's18', x: 322, y: 92, sizeInches: 10, slot: 'A', finish: 'matte' },
      { id: 's19', x: 298, y: 86, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 's20', x: 270, y: 78, sizeInches: 12, slot: 'B', finish: 'matte' },
      { id: 's21', x: 238, y: 86, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 's22', x: 208, y: 74, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 's23', x: 180, y: 92, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 's24', x: 150, y: 80, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 's25', x: 124, y: 102, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 's26', x: 90, y: 122, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 's27', x: 62, y: 152, sizeInches: 24, slot: 'C', finish: 'chrome' },
      { id: 's28', x: 100, y: 170, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 's29', x: 54, y: 208, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 's30', x: 80, y: 222, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 's31', x: 100, y: 258, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 's32', x: 58, y: 274, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 's33', x: 86, y: 294, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 's34', x: 116, y: 324, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 's35', x: 70, y: 338, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 's36', x: 94, y: 360, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 's37', x: 56, y: 392, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 's38', x: 100, y: 404, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 's39', x: 76, y: 424, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 's40', x: 130, y: 428, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 's41', x: 174, y: 420, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 's42', x: 218, y: 426, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 's43', x: 262, y: 432, sizeInches: 12, slot: 'B', finish: 'matte' },
      { id: 's44', x: 302, y: 440, sizeInches: 10, slot: 'D', finish: 'matte' },
      { id: 's45', x: 150, y: 440, sizeInches: 12, slot: 'A', finish: 'matte' },
      { id: 's46', x: 196, y: 440, sizeInches: 12, slot: 'B', finish: 'matte' },
      { id: 's47', x: 86, y: 144, sizeInches: 5, slot: 'C', finish: 'chrome' },
      { id: 's48', x: 96, y: 152, sizeInches: 5, slot: 'D', finish: 'matte' },
      { id: 's49', x: 70, y: 282, sizeInches: 5, slot: 'B', finish: 'matte' },
      { id: 's50', x: 62, y: 292, sizeInches: 5, slot: 'C', finish: 'chrome' },
      { id: 's51', x: 156, y: 408, sizeInches: 5, slot: 'A', finish: 'matte' },
      { id: 's52', x: 166, y: 416, sizeInches: 5, slot: 'C', finish: 'chrome' }
    ]
  },
  {
    id: 'modelo-big-balloons-ouro',
    name: 'Arco Big Balloons Ouro & Cristal',
    description: 'Composição de vanguarda com 3 balões gigantes de 24", cromados e esferas cristal preenchidas com confetes.',
    palette: { A: '#d4af37', B: '#ffffff', C: '#1e293b', D: '#fef08a' },
    defaultWidthCm: 170,
    defaultHeightCm: 230,
    pieces: [
      { id: 'b1', x: 85, y: 90, sizeInches: 24, slot: 'A', finish: 'chrome' },
      { id: 'b2', x: 150, y: 120, sizeInches: 18, slot: 'B', finish: 'crystal' },
      { id: 'b3', x: 75, y: 220, sizeInches: 24, slot: 'C', finish: 'matte' },
      { id: 'b4', x: 110, y: 310, sizeInches: 18, slot: 'A', finish: 'chrome' },
      { id: 'b5', x: 85, y: 390, sizeInches: 24, slot: 'A', finish: 'chrome' },
      { id: 'b6', x: 195, y: 85, sizeInches: 18, slot: 'A', finish: 'chrome' },
      { id: 'b7', x: 235, y: 70, sizeInches: 12, slot: 'B', finish: 'satin' },
      { id: 'b8', x: 268, y: 75, sizeInches: 10, slot: 'A', finish: 'chrome' },
      { id: 'b9', x: 125, y: 80, sizeInches: 18, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'b10', x: 50, y: 145, sizeInches: 18, slot: 'A', finish: 'chrome' },
      { id: 'b11', x: 105, y: 165, sizeInches: 18, slot: 'B', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'b12', x: 55, y: 275, sizeInches: 18, slot: 'A', finish: 'chrome' },
      { id: 'b13', x: 100, y: 260, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'b14', x: 85, y: 345, sizeInches: 18, slot: 'B', finish: 'crystal' },
      { id: 'b15', x: 130, y: 375, sizeInches: 18, slot: 'A', finish: 'chrome' },
      { id: 'b16', x: 50, y: 425, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'b17', x: 125, y: 430, sizeInches: 18, slot: 'B', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'b18', x: 95, y: 125, sizeInches: 5, slot: 'A', finish: 'chrome' },
      { id: 'b19', x: 88, y: 135, sizeInches: 5, slot: 'B', finish: 'satin' },
      { id: 'b20', x: 102, y: 140, sizeInches: 5, slot: 'C', finish: 'matte' },
      { id: 'b21', x: 72, y: 295, sizeInches: 5, slot: 'A', finish: 'chrome' },
      { id: 'b22', x: 82, y: 300, sizeInches: 5, slot: 'B', finish: 'satin' }
    ]
  },
  {
    id: 'modelo-totem-azul-prata',
    name: 'Coluna Totem Azul & Prata',
    description: 'Torre autoportante vertical com base alargada para estabilidade, ondulação orgânica e ápice gracioso.',
    palette: { A: '#1e40af', B: '#60a5fa', C: '#cbd5e1', D: '#ffffff' },
    defaultWidthCm: 80,
    defaultHeightCm: 185,
    pieces: [
      { id: 't1', x: 75, y: 435, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 't2', x: 125, y: 432, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 't3', x: 115, y: 365, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 't4', x: 70, y: 310, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 't5', x: 122, y: 255, sizeInches: 18, slot: 'B', finish: 'crystal' },
      { id: 't6', x: 78, y: 195, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 't7', x: 118, y: 140, sizeInches: 12, slot: 'A', finish: 'satin' },
      { id: 't8', x: 85, y: 85, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 't9', x: 60, y: 442, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 't10', x: 140, y: 440, sizeInches: 18, slot: 'D', finish: 'glitter', glitterColor: '#cbd5e1' },
      { id: 't11', x: 100, y: 428, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 't12', x: 65, y: 375, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 't13', x: 135, y: 372, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 't14', x: 98, y: 350, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 't15', x: 138, y: 305, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 't16', x: 62, y: 280, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 't17', x: 102, y: 268, sizeInches: 24, slot: 'B', finish: 'satin' },
      { id: 't18', x: 132, y: 208, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 't19', x: 65, y: 202, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 't20', x: 96, y: 185, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 't21', x: 125, y: 135, sizeInches: 12, slot: 'B', finish: 'satin' },
      { id: 't22', x: 72, y: 130, sizeInches: 12, slot: 'D', finish: 'glitter', glitterColor: '#cbd5e1' },
      { id: 't23', x: 98, y: 105, sizeInches: 12, slot: 'C', finish: 'chrome' },
      { id: 't24', x: 92, y: 58, sizeInches: 10, slot: 'A', finish: 'satin' },
      { id: 't25', x: 112, y: 70, sizeInches: 10, slot: 'B', finish: 'satin' },
      { id: 't26', x: 78, y: 245, sizeInches: 5, slot: 'D', finish: 'matte' },
      { id: 't27', x: 68, y: 255, sizeInches: 5, slot: 'C', finish: 'chrome' },
      { id: 't28', x: 86, y: 258, sizeInches: 5, slot: 'A', finish: 'satin' },
      { id: 't29', x: 118, y: 172, sizeInches: 5, slot: 'B', finish: 'satin' },
      { id: 't30', x: 128, y: 182, sizeInches: 5, slot: 'C', finish: 'chrome' },
      { id: 't31', x: 120, y: 405, sizeInches: 5, slot: 'A', finish: 'satin' },
      { id: 't32', x: 132, y: 412, sizeInches: 5, slot: 'D', finish: 'matte' }
    ]
  },
  {
    id: 'modelo-cluster-chao-revelacao',
    name: 'Cluster Duplo Chá Revelação',
    description: 'Dois buquês orgânicos de apoio interligados com rosa, azul celeste, branco e toques dourados.',
    palette: { A: '#f472b6', B: '#38bdf8', C: '#ffffff', D: '#d4af37' },
    defaultWidthCm: 130,
    defaultHeightCm: 95,
    pieces: [
      { id: 'cr1', x: 70, y: 140, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'cr2', x: 120, y: 135, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'cr3', x: 90, y: 100, sizeInches: 24, slot: 'A', finish: 'satin' },
      { id: 'cr4', x: 50, y: 95, sizeInches: 12, slot: 'D', finish: 'chrome' },
      { id: 'cr5', x: 80, y: 155, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'cr6', x: 110, y: 150, sizeInches: 12, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'cr7', x: 150, y: 145, sizeInches: 12, slot: 'D', finish: 'chrome' },
      { id: 'cr8', x: 170, y: 120, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'cr9', x: 200, y: 140, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'cr10', x: 245, y: 135, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'cr11', x: 220, y: 100, sizeInches: 24, slot: 'B', finish: 'satin' },
      { id: 'cr12', x: 260, y: 95, sizeInches: 12, slot: 'D', finish: 'chrome' },
      { id: 'cr13', x: 225, y: 155, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'cr14', x: 190, y: 150, sizeInches: 12, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'cr15', x: 82, y: 120, sizeInches: 5, slot: 'D', finish: 'chrome' },
      { id: 'cr16', x: 92, y: 128, sizeInches: 5, slot: 'C', finish: 'matte' },
      { id: 'cr17', x: 218, y: 120, sizeInches: 5, slot: 'D', finish: 'chrome' },
      { id: 'cr18', x: 228, y: 128, sizeInches: 5, slot: 'C', finish: 'matte' }
    ]
  },
  {
    id: 'modelo-arco-romano-boho',
    name: 'Guirlanda Curva Painel Romano Boho',
    description: 'Arranjo com caimento sinuoso projetado especialmente para contornar a curva superior do painel romano.',
    palette: { A: '#c2410c', B: '#d97706', C: '#fed7aa', D: '#fdfbf7' },
    defaultWidthCm: 150,
    defaultHeightCm: 180,
    pieces: [
      { id: 'rb1', x: 220, y: 65, sizeInches: 10, slot: 'D', finish: 'matte' },
      { id: 'rb2', x: 190, y: 60, sizeInches: 12, slot: 'C', finish: 'matte' },
      { id: 'rb3', x: 155, y: 58, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'rb4', x: 118, y: 65, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 'rb5', x: 75, y: 78, sizeInches: 24, slot: 'A', finish: 'matte' },
      { id: 'rb6', x: 50, y: 115, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'rb7', x: 55, y: 160, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'rb8', x: 75, y: 205, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 'rb9', x: 60, y: 250, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'rb10', x: 65, y: 295, sizeInches: 12, slot: 'C', finish: 'matte' },
      { id: 'rb11', x: 225, y: 76, sizeInches: 10, slot: 'B', finish: 'matte' },
      { id: 'rb12', x: 200, y: 74, sizeInches: 12, slot: 'A', finish: 'matte' },
      { id: 'rb13', x: 172, y: 72, sizeInches: 12, slot: 'D', finish: 'matte' },
      { id: 'rb14', x: 138, y: 78, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'rb15', x: 100, y: 88, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 'rb16', x: 70, y: 102, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'rb17', x: 95, y: 130, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'rb18', x: 58, y: 145, sizeInches: 18, slot: 'C', finish: 'matte' },
      { id: 'rb19', x: 82, y: 175, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'rb20', x: 60, y: 215, sizeInches: 18, slot: 'B', finish: 'matte' },
      { id: 'rb21', x: 88, y: 235, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'rb22', x: 68, y: 275, sizeInches: 12, slot: 'A', finish: 'matte' },
      { id: 'rb23', x: 145, y: 90, sizeInches: 5, slot: 'A', finish: 'matte' },
      { id: 'rb24', x: 135, y: 98, sizeInches: 5, slot: 'B', finish: 'matte' },
      { id: 'rb25', x: 78, y: 122, sizeInches: 5, slot: 'C', finish: 'matte' },
      { id: 'rb26', x: 70, y: 132, sizeInches: 5, slot: 'D', finish: 'matte' }
    ]
  },
  {
    id: 'modelo-moldura-portal-sereia',
    name: 'Moldura Portal Completa Sereia',
    description: 'Moldura em portal cobrindo topo e ambas as laterais para criar um portal imersivo de balões.',
    palette: { A: '#9333ea', B: '#14b8a6', C: '#f472b6', D: '#e0e7ff' },
    defaultWidthCm: 220,
    defaultHeightCm: 230,
    pieces: [
      { id: 'm1', x: 80, y: 70, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'm2', x: 120, y: 65, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'm3', x: 160, y: 60, sizeInches: 18, slot: 'C', finish: 'satin' },
      { id: 'm4', x: 200, y: 60, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'm5', x: 240, y: 65, sizeInches: 18, slot: 'A', finish: 'chrome' },
      { id: 'm6', x: 280, y: 70, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'm7', x: 65, y: 115, sizeInches: 18, slot: 'C', finish: 'satin' },
      { id: 'm8', x: 60, y: 165, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'm9', x: 70, y: 215, sizeInches: 18, slot: 'A', finish: 'chrome' },
      { id: 'm10', x: 62, y: 265, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'm11', x: 72, y: 315, sizeInches: 18, slot: 'C', finish: 'satin' },
      { id: 'm12', x: 65, y: 365, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'm13', x: 75, y: 415, sizeInches: 24, slot: 'A', finish: 'chrome' },
      { id: 'm14', x: 295, y: 115, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'm15', x: 300, y: 165, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'm16', x: 290, y: 215, sizeInches: 18, slot: 'C', finish: 'satin' },
      { id: 'm17', x: 298, y: 265, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'm18', x: 288, y: 315, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'm19', x: 295, y: 365, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'm20', x: 285, y: 415, sizeInches: 24, slot: 'C', finish: 'satin' },
      { id: 'm21', x: 100, y: 75, sizeInches: 18, slot: 'D', finish: 'glitter', glitterColor: '#14b8a6' },
      { id: 'm22', x: 180, y: 72, sizeInches: 18, slot: 'B', finish: 'crystal' },
      { id: 'm23', x: 260, y: 75, sizeInches: 18, slot: 'C', finish: 'glitter', glitterColor: '#9333ea' },
      { id: 'm24', x: 80, y: 140, sizeInches: 18, slot: 'A', finish: 'chrome' },
      { id: 'm25', x: 75, y: 240, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'm26', x: 82, y: 340, sizeInches: 18, slot: 'C', finish: 'chrome' },
      { id: 'm27', x: 280, y: 140, sizeInches: 18, slot: 'C', finish: 'satin' },
      { id: 'm28', x: 285, y: 240, sizeInches: 18, slot: 'A', finish: 'chrome' },
      { id: 'm29', x: 278, y: 340, sizeInches: 18, slot: 'B', finish: 'satin' },
      { id: 'm30', x: 72, y: 92, sizeInches: 5, slot: 'B', finish: 'chrome' },
      { id: 'm31', x: 82, y: 98, sizeInches: 5, slot: 'C', finish: 'satin' },
      { id: 'm32', x: 288, y: 92, sizeInches: 5, slot: 'A', finish: 'chrome' },
      { id: 'm33', x: 278, y: 98, sizeInches: 5, slot: 'D', finish: 'matte' }
    ]
  },
  {
    id: 'modelo-glamour-preto-ouro',
    name: 'Arco Glamour Adulto Preto & Ouro',
    description: 'Paleta sofisticada para festas adultas e corporativas, com preto fosco aveludado, ouro cromado e glitter.',
    palette: { A: '#0f172a', B: '#d4af37', C: '#ffffff', D: '#334155' },
    defaultWidthCm: 175,
    defaultHeightCm: 235,
    pieces: [
      { id: 'g1', x: 280, y: 70, sizeInches: 12, slot: 'B', finish: 'chrome' },
      { id: 'g2', x: 245, y: 62, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g3', x: 205, y: 58, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'g4', x: 165, y: 62, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'g5', x: 125, y: 68, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g6', x: 80, y: 75, sizeInches: 24, slot: 'A', finish: 'matte' },
      { id: 'g7', x: 55, y: 110, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'g8', x: 55, y: 155, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'g9', x: 75, y: 195, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g10', x: 60, y: 245, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'g11', x: 65, y: 295, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g12', x: 75, y: 345, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'g13', x: 60, y: 395, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g14', x: 95, y: 435, sizeInches: 24, slot: 'B', finish: 'chrome' },
      { id: 'g15', x: 288, y: 82, sizeInches: 10, slot: 'B', finish: 'chrome' },
      { id: 'g16', x: 260, y: 80, sizeInches: 12, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'g17', x: 225, y: 82, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g18', x: 185, y: 78, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'g19', x: 145, y: 85, sizeInches: 18, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'g20', x: 102, y: 80, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g21', x: 70, y: 95, sizeInches: 24, slot: 'B', finish: 'chrome' },
      { id: 'g22', x: 98, y: 125, sizeInches: 18, slot: 'C', finish: 'crystal' },
      { id: 'g23', x: 58, y: 135, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g24', x: 85, y: 155, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'g25', x: 95, y: 185, sizeInches: 18, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'g26', x: 58, y: 220, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g27', x: 80, y: 250, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'g28', x: 65, y: 275, sizeInches: 18, slot: 'D', finish: 'matte' },
      { id: 'g29', x: 95, y: 305, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g30', x: 65, y: 345, sizeInches: 18, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'g31', x: 90, y: 375, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'g32', x: 60, y: 425, sizeInches: 18, slot: 'A', finish: 'matte' },
      { id: 'g33', x: 110, y: 442, sizeInches: 12, slot: 'C', finish: 'glitter', glitterColor: '#d4af37' },
      { id: 'g34', x: 92, y: 112, sizeInches: 5, slot: 'B', finish: 'chrome' },
      { id: 'g35', x: 84, y: 122, sizeInches: 5, slot: 'A', finish: 'matte' },
      { id: 'g36', x: 98, y: 128, sizeInches: 5, slot: 'B', finish: 'chrome' },
      { id: 'g37', x: 54, y: 265, sizeInches: 5, slot: 'B', finish: 'chrome' },
      { id: 'g38', x: 46, y: 275, sizeInches: 5, slot: 'A', finish: 'matte' }
    ]
  },
  {
    id: 'modelo-nuvem-aerea',
    name: 'Nuvem Orgânica Suspensa Pérola',
    description: 'Cluster aéreo horizontal estilo nuvem de balões para suspensão sobre a mesa ou topo de painel.',
    palette: { A: '#ffffff', B: '#cbd5e1', C: '#e2e8f0', D: '#94a3b8' },
    defaultWidthCm: 160,
    defaultHeightCm: 90,
    pieces: [
      { id: 'nv1', x: 60, y: 80, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'nv2', x: 105, y: 65, sizeInches: 24, slot: 'B', finish: 'chrome' },
      { id: 'nv3', x: 155, y: 60, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'nv4', x: 200, y: 65, sizeInches: 24, slot: 'A', finish: 'satin' },
      { id: 'nv5', x: 245, y: 75, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'nv6', x: 45, y: 95, sizeInches: 12, slot: 'C', finish: 'crystal' },
      { id: 'nv7', x: 80, y: 92, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'nv8', x: 125, y: 82, sizeInches: 18, slot: 'C', finish: 'glitter', glitterColor: '#cbd5e1' },
      { id: 'nv9', x: 165, y: 85, sizeInches: 18, slot: 'B', finish: 'chrome' },
      { id: 'nv10', x: 195, y: 90, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'nv11', x: 230, y: 95, sizeInches: 18, slot: 'C', finish: 'glitter', glitterColor: '#ffffff' },
      { id: 'nv12', x: 260, y: 95, sizeInches: 12, slot: 'A', finish: 'satin' },
      { id: 'nv13', x: 95, y: 110, sizeInches: 12, slot: 'B', finish: 'chrome' },
      { id: 'nv14', x: 145, y: 110, sizeInches: 18, slot: 'A', finish: 'satin' },
      { id: 'nv15', x: 185, y: 112, sizeInches: 12, slot: 'C', finish: 'crystal' },
      { id: 'nv16', x: 112, y: 78, sizeInches: 5, slot: 'B', finish: 'chrome' },
      { id: 'nv17', x: 120, y: 84, sizeInches: 5, slot: 'A', finish: 'satin' },
      { id: 'nv18', x: 178, y: 78, sizeInches: 5, slot: 'B', finish: 'chrome' },
      { id: 'nv19', x: 186, y: 84, sizeInches: 5, slot: 'A', finish: 'satin' }
    ]
  }
];

