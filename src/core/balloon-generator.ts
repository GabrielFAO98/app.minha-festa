// Gerador de Balões e Arcos Orgânicos Desconstruídos de Alto Padrão
import {
  BALLOON_STUDIO_TEMPLATES,
  renderArrangementSvg,
  arrangementSvgToDataUrl,
  type BalloonPaletteConfig
} from './balloon-studio-engine';

export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export interface BalloonPalette {
  id: string;
  name: string;
  colors: string[];
}

// Paletas Prontas Populares em Decorações Profissionais de Festa (Pegue e Monte)
export const BALLOON_PALETTES: BalloonPalette[] = [
  {
    id: 'rose-gold',
    name: 'Rose Gold, Blush e Pérola',
    colors: ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7']
  },
  {
    id: 'safari',
    name: 'Safari e Floresta Chic',
    colors: ['#4d6b2c', '#85512b', '#c59a3f', '#f7eed7']
  },
  {
    id: 'candy-colors',
    name: 'Candy Colors Pastel',
    colors: ['#f8b4d9', '#d8b4fe', '#93c5fd', '#fef08a']
  },
  {
    id: 'azul-prata',
    name: 'Azul Real, Celeste e Prata',
    colors: ['#1e40af', '#60a5fa', '#cbd5e1', '#ffffff']
  },
  {
    id: 'dourado-preto',
    name: 'Dourado Glamour e Preto',
    colors: ['#d4af37', '#1e293b', '#fde047', '#0f172a']
  },
  {
    id: 'boho-terracota',
    name: 'Boho Terracota e Nude',
    colors: ['#c2410c', '#d97706', '#fed7aa', '#fdfbf7']
  },
  {
    id: 'cha-revelacao',
    name: 'Chá Revelação Baby',
    colors: ['#f472b6', '#38bdf8', '#ffffff', '#fde047']
  },
  {
    id: 'sereia',
    name: 'Sereia, Lilás e Tiffany',
    colors: ['#9333ea', '#14b8a6', '#f472b6', '#e0e7ff']
  },
  {
    id: 'vermelho-luxo',
    name: 'Vermelho Luxo e Ouro',
    colors: ['#dc2626', '#eab308', '#fecaca', '#ffffff']
  },
  {
    id: 'verde-salvia',
    name: 'Verde Sálvia e Eucalipto',
    colors: ['#84a98c', '#52796f', '#cad2c5', '#ffffff']
  }
];

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

function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 220;
}

function generateLatexDefs(colors: string[]): string {
  let defs = `
    <filter id="balloonShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="1.5" dy="3.5" stdDeviation="3.0" flood-color="#0f172a" flood-opacity="0.20"/>
    </filter>
    <filter id="floorShadowBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
  `;

  for (let i = 0; i < colors.length; i++) {
    const hex = colors[i];
    const isLight = isLightColor(hex);

    const light = isLight ? '#ffffff' : adjustColorBrightness(hex, 0.42);
    const mid = hex;
    const shadow = isLight ? '#cbd5e1' : adjustColorBrightness(hex, -0.24);
    const deepShadow = isLight ? '#94a3b8' : adjustColorBrightness(hex, -0.38);

    defs += `
    <radialGradient id="latex_${i}" cx="38%" cy="34%" r="65%" fx="32%" fy="28%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${isLight ? 0.95 : 0.75}"/>
      <stop offset="16%" stop-color="${light}"/>
      <stop offset="52%" stop-color="${mid}"/>
      <stop offset="84%" stop-color="${shadow}"/>
      <stop offset="100%" stop-color="${deepShadow}"/>
    </radialGradient>

    <radialGradient id="glare_${i}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    `;
  }

  return defs;
}

function drawBalloon(x: number, y: number, r: number, cIdx: number, isMini = false): string {
  const rx = r * 0.97;
  const ry = r * 1.03;
  const gx = x - rx * 0.24;
  const gy = y - ry * 0.26;
  const gw = rx * 0.38;
  const gh = ry * 0.28;
  const dotX = x - rx * 0.16;
  const dotY = y - ry * 0.36;
  const dotR = Math.max(1, r * 0.055);

  return `
  <g filter="url(#balloonShadow)">
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#latex_${cIdx})"/>
    <ellipse cx="${gx}" cy="${gy}" rx="${gw}" ry="${gh}" transform="rotate(-25 ${gx} ${gy})" fill="url(#glare_${cIdx})"/>
    ${!isMini ? `<circle cx="${dotX}" cy="${dotY}" r="${dotR}" fill="#ffffff" opacity="0.6"/>` : ''}
  </g>`;
}

// ----------------------------------------------------------------------
// 1. ARCO EM L (170cm x 230cm) -> 340 x 460 (S-Curve Orgânica Realista)
// ----------------------------------------------------------------------
export function getArchLSvg(colors: string[]): string {
  const defs = generateLatexDefs(colors);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 460" width="340" height="460">
    <defs>${defs}</defs>
  `;

  // CAMADA 1: FUNDO / PROFUNDIDADE
  svg += drawBalloon(292, 68, 20, 1);
  svg += drawBalloon(265, 60, 25, 2);
  svg += drawBalloon(235, 56, 30, 0);
  svg += drawBalloon(202, 58, 34, 3);
  svg += drawBalloon(168, 62, 37, 1);
  svg += drawBalloon(135, 66, 39, 2);
  svg += drawBalloon(105, 65, 42, 0);

  svg += drawBalloon(72, 70, 46, 3);
  svg += drawBalloon(48, 102, 44, 1);
  svg += drawBalloon(52, 145, 42, 2);

  svg += drawBalloon(72, 185, 40, 0);
  svg += drawBalloon(78, 222, 38, 3);
  svg += drawBalloon(58, 258, 38, 1);
  svg += drawBalloon(52, 295, 40, 2);
  svg += drawBalloon(70, 335, 42, 0);
  svg += drawBalloon(75, 375, 41, 3);
  svg += drawBalloon(56, 408, 39, 1);
  svg += drawBalloon(92, 432, 36, 2);

  // CAMADA 2: CORPO PRINCIPAL E FRONTAL
  svg += drawBalloon(300, 80, 18, 0);
  svg += drawBalloon(278, 80, 22, 3);
  svg += drawBalloon(252, 75, 26, 1);

  svg += drawBalloon(228, 84, 32, 2);
  svg += drawBalloon(198, 72, 35, 0);
  svg += drawBalloon(174, 88, 36, 1);
  svg += drawBalloon(146, 76, 38, 3);
  svg += drawBalloon(122, 92, 40, 0);

  // Cotovelo statement 20"
  svg += drawBalloon(96, 74, 43, 1);
  svg += drawBalloon(66, 92, 49, 2);
  svg += drawBalloon(104, 116, 42, 3);
  svg += drawBalloon(55, 132, 43, 0);
  svg += drawBalloon(82, 145, 44, 1);

  // Coluna vertical com S-curve
  svg += drawBalloon(108, 180, 40, 2);
  svg += drawBalloon(65, 178, 38, 3);
  svg += drawBalloon(88, 205, 44, 0);

  svg += drawBalloon(98, 242, 37, 1);
  svg += drawBalloon(56, 238, 36, 2);
  svg += drawBalloon(75, 258, 41, 3);

  svg += drawBalloon(112, 298, 42, 1);
  svg += drawBalloon(62, 302, 40, 2);
  svg += drawBalloon(88, 318, 47, 0);
  svg += drawBalloon(58, 350, 39, 3);
  svg += drawBalloon(96, 362, 43, 1);

  svg += drawBalloon(74, 388, 44, 2);
  svg += drawBalloon(48, 405, 38, 0);

  // Base do chão
  svg += drawBalloon(118, 425, 41, 1);
  svg += drawBalloon(80, 424, 45, 3);
  svg += drawBalloon(46, 432, 36, 2);
  svg += drawBalloon(96, 440, 34, 0);

  // CAMADA 3: MINI BALÕES 5"
  svg += drawBalloon(212, 94, 12, 1, true);
  svg += drawBalloon(204, 102, 10, 2, true);

  svg += drawBalloon(92, 110, 14, 0, true);
  svg += drawBalloon(84, 122, 12, 1, true);
  svg += drawBalloon(98, 128, 11, 3, true);

  svg += drawBalloon(54, 285, 13, 2, true);
  svg += drawBalloon(46, 295, 11, 3, true);

  svg += drawBalloon(106, 398, 13, 1, true);
  svg += drawBalloon(116, 406, 11, 0, true);

  svg += `</svg>`;
  return svg;
}

// ----------------------------------------------------------------------
// 2. GUIRLANDA SUPERIOR MEIA-LUA / ARCO CURVO (200cm x 110cm) -> 420 x 220
// ----------------------------------------------------------------------
export function getArchDemiSvg(colors: string[]): string {
  const defs = generateLatexDefs(colors);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 220" width="420" height="220">
    <defs>${defs}</defs>
  `;

  // CAMADA 1: FUNDO
  svg += drawBalloon(38, 185, 20, 0);
  svg += drawBalloon(65, 160, 24, 1);
  svg += drawBalloon(98, 134, 29, 2);
  svg += drawBalloon(135, 110, 34, 3);
  svg += drawBalloon(175, 92, 38, 0);
  svg += drawBalloon(210, 82, 42, 1);
  svg += drawBalloon(245, 92, 38, 2);
  svg += drawBalloon(285, 110, 34, 3);
  svg += drawBalloon(322, 134, 29, 0);
  svg += drawBalloon(355, 160, 24, 1);
  svg += drawBalloon(382, 185, 20, 2);

  // CAMADA 2: CORPO PRINCIPAL E FRONTAL
  svg += drawBalloon(45, 175, 18, 2);
  svg += drawBalloon(70, 178, 22, 3);
  svg += drawBalloon(80, 150, 26, 0);

  svg += drawBalloon(108, 145, 30, 1);
  svg += drawBalloon(122, 125, 33, 2);
  svg += drawBalloon(145, 142, 35, 3);
  svg += drawBalloon(158, 115, 37, 0);

  svg += drawBalloon(185, 128, 40, 1);
  svg += drawBalloon(210, 108, 46, 2);
  svg += drawBalloon(235, 128, 40, 3);
  svg += drawBalloon(210, 72, 38, 0);

  svg += drawBalloon(262, 115, 37, 1);
  svg += drawBalloon(275, 142, 35, 2);
  svg += drawBalloon(298, 125, 33, 3);
  svg += drawBalloon(312, 145, 30, 0);

  svg += drawBalloon(340, 150, 26, 1);
  svg += drawBalloon(350, 178, 22, 2);
  svg += drawBalloon(375, 175, 18, 3);

  // CAMADA 3: MINI BALÕES 5"
  svg += drawBalloon(120, 140, 12, 0, true);
  svg += drawBalloon(112, 148, 10, 1, true);

  svg += drawBalloon(188, 115, 13, 3, true);
  svg += drawBalloon(180, 124, 11, 2, true);
  svg += drawBalloon(232, 115, 13, 0, true);
  svg += drawBalloon(240, 124, 11, 1, true);

  svg += drawBalloon(300, 140, 12, 2, true);
  svg += drawBalloon(308, 148, 10, 3, true);

  svg += `</svg>`;
  return svg;
}

// ----------------------------------------------------------------------
// 3. ARCO CASCATA DE CHÃO (180cm x 230cm) -> 360 x 460
// ----------------------------------------------------------------------
export function getArchCascadeSvg(colors: string[]): string {
  const defs = generateLatexDefs(colors);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 460" width="360" height="460">
    <defs>${defs}</defs>
  `;

  // CAMADA 1: FUNDO
  svg += drawBalloon(310, 78, 20, 1);
  svg += drawBalloon(282, 66, 24, 2);
  svg += drawBalloon(250, 58, 28, 0);
  svg += drawBalloon(215, 56, 32, 3);
  svg += drawBalloon(178, 62, 36, 1);
  svg += drawBalloon(140, 75, 39, 2);

  svg += drawBalloon(102, 102, 42, 0);
  svg += drawBalloon(68, 140, 44, 3);
  svg += drawBalloon(50, 188, 43, 1);
  svg += drawBalloon(52, 238, 40, 2);

  svg += drawBalloon(65, 285, 42, 0);
  svg += drawBalloon(82, 332, 44, 3);
  svg += drawBalloon(92, 378, 44, 1);

  svg += drawBalloon(122, 418, 41, 2);
  svg += drawBalloon(172, 426, 39, 0);
  svg += drawBalloon(225, 432, 37, 3);
  svg += drawBalloon(280, 438, 30, 1);

  // CAMADA 2: CORPO PRINCIPAL E FRONTAL
  svg += drawBalloon(318, 90, 18, 0);
  svg += drawBalloon(295, 84, 22, 3);
  svg += drawBalloon(268, 76, 26, 1);
  svg += drawBalloon(235, 84, 31, 2);
  svg += drawBalloon(205, 72, 34, 0);
  svg += drawBalloon(178, 90, 36, 1);
  svg += drawBalloon(148, 78, 38, 3);
  svg += drawBalloon(122, 100, 40, 0);

  // Bojo superior esquerdo
  svg += drawBalloon(88, 120, 43, 1);
  svg += drawBalloon(60, 150, 46, 2);
  svg += drawBalloon(98, 168, 42, 3);
  svg += drawBalloon(52, 205, 40, 0);
  svg += drawBalloon(78, 220, 44, 1);

  // Descida em cascata fluida
  svg += drawBalloon(98, 255, 41, 2);
  svg += drawBalloon(56, 272, 39, 3);
  svg += drawBalloon(84, 292, 46, 0);
  svg += drawBalloon(114, 322, 42, 1);
  svg += drawBalloon(68, 335, 41, 2);
  svg += drawBalloon(92, 358, 47, 3);

  // Transição para o chão
  svg += drawBalloon(54, 390, 40, 0);
  svg += drawBalloon(98, 402, 44, 1);
  svg += drawBalloon(75, 422, 45, 2);

  // Puddle horizontal no chão
  svg += drawBalloon(128, 425, 43, 3);
  svg += drawBalloon(172, 418, 46, 0);
  svg += drawBalloon(216, 424, 42, 1);
  svg += drawBalloon(260, 430, 36, 2);
  svg += drawBalloon(300, 438, 28, 3);
  svg += drawBalloon(148, 438, 36, 1);
  svg += drawBalloon(195, 438, 34, 2);

  // CAMADA 3: MINI BALÕES 5"
  svg += drawBalloon(222, 94, 12, 0, true);
  svg += drawBalloon(214, 104, 10, 3, true);

  svg += drawBalloon(84, 142, 13, 2, true);
  svg += drawBalloon(94, 150, 11, 0, true);
  svg += drawBalloon(86, 158, 10, 1, true);

  svg += drawBalloon(68, 280, 13, 1, true);
  svg += drawBalloon(60, 290, 11, 2, true);

  svg += drawBalloon(155, 405, 14, 0, true);
  svg += drawBalloon(165, 414, 12, 3, true);
  svg += drawBalloon(205, 412, 13, 1, true);

  svg += `</svg>`;
  return svg;
}

// ----------------------------------------------------------------------
// 4. CLUSTER ORGÂNICO DE CHÃO (90cm x 90cm) -> 240 x 240
// ----------------------------------------------------------------------
export function getClusterFloorSvg(colors: string[]): string {
  const defs = generateLatexDefs(colors);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
    <defs>${defs}</defs>
  `;

  // CAMADA 1: FUNDO
  svg += drawBalloon(75, 170, 42, 1);
  svg += drawBalloon(165, 168, 40, 2);
  svg += drawBalloon(118, 125, 45, 0);

  // CAMADA 2: MEIO
  svg += drawBalloon(60, 122, 34, 3);
  svg += drawBalloon(178, 120, 33, 1);
  svg += drawBalloon(142, 85, 28, 2);

  // CAMADA 3: FRENTE
  svg += drawBalloon(105, 178, 44, 0);
  svg += drawBalloon(125, 142, 38, 3);
  svg += drawBalloon(155, 175, 36, 1);

  // CAMADA 4: MINI BALÕES 5"
  svg += drawBalloon(82, 140, 13, 2, true);
  svg += drawBalloon(92, 132, 11, 1, true);
  svg += drawBalloon(76, 126, 10, 0, true);

  svg += drawBalloon(146, 112, 12, 3, true);
  svg += drawBalloon(156, 122, 11, 0, true);

  svg += `</svg>`;
  return svg;
}

// ----------------------------------------------------------------------
// 5. COLUNA TOTEM ORGÂNICA (75cm x 180cm) -> 200 x 480
// ----------------------------------------------------------------------
export function getClusterTotemSvg(colors: string[]): string {
  const defs = generateLatexDefs(colors);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 480" width="200" height="480">
    <defs>${defs}</defs>
  `;

  // CAMADA 1: FUNDO
  svg += drawBalloon(75, 435, 36, 1);
  svg += drawBalloon(125, 432, 35, 2);
  svg += drawBalloon(115, 365, 34, 0);
  svg += drawBalloon(70, 310, 36, 3);
  svg += drawBalloon(122, 255, 35, 1);
  svg += drawBalloon(78, 195, 34, 2);
  svg += drawBalloon(118, 140, 32, 0);
  svg += drawBalloon(85, 85, 28, 3);

  // CAMADA 2: CORPO PRINCIPAL E FRONTAL
  svg += drawBalloon(60, 442, 38, 0);
  svg += drawBalloon(140, 440, 37, 3);
  svg += drawBalloon(100, 428, 40, 2);

  svg += drawBalloon(65, 375, 35, 1);
  svg += drawBalloon(135, 372, 36, 0);
  svg += drawBalloon(98, 350, 37, 3);

  svg += drawBalloon(138, 305, 42, 2);
  svg += drawBalloon(62, 280, 38, 0);
  svg += drawBalloon(102, 268, 44, 1);

  svg += drawBalloon(132, 208, 36, 3);
  svg += drawBalloon(65, 202, 35, 2);
  svg += drawBalloon(96, 185, 38, 0);

  svg += drawBalloon(125, 135, 33, 1);
  svg += drawBalloon(72, 130, 32, 3);
  svg += drawBalloon(98, 105, 34, 2);
  svg += drawBalloon(92, 58, 28, 0);
  svg += drawBalloon(112, 70, 24, 1);

  // CAMADA 3: MINI BALÕES 5"
  svg += drawBalloon(78, 245, 13, 3, true);
  svg += drawBalloon(68, 255, 12, 2, true);
  svg += drawBalloon(86, 258, 11, 0, true);

  svg += drawBalloon(118, 172, 13, 1, true);
  svg += drawBalloon(128, 182, 11, 2, true);

  svg += drawBalloon(120, 405, 14, 0, true);
  svg += drawBalloon(132, 412, 12, 3, true);

  svg += `</svg>`;
  return svg;
}

// Dispatcher principal que atende tanto modelos do estúdio quanto legado
export function generateBalloonSVG(type: string, colors: string[] = ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7']): string {
  const norm = type.toLowerCase();

  // Verifica se corresponde a um dos 10 modelos do Estúdio
  const studioTmpl = BALLOON_STUDIO_TEMPLATES.find(
    (t) => t.id === type || norm.includes(t.id) || type === `preset-${t.id}`
  );
  if (studioTmpl) {
    const pal: BalloonPaletteConfig = {
      A: colors[0] || studioTmpl.palette.A,
      B: colors[1] || studioTmpl.palette.B,
      C: colors[2] || studioTmpl.palette.C,
      D: colors[3] || studioTmpl.palette.D
    };
    return renderArrangementSvg(studioTmpl.pieces, pal, { hasFloorShadow: false }).svg;
  }

  if (norm.includes('demi') || norm.includes('curvo') || norm.includes('guirlanda')) {
    return getArchDemiSvg(colors);
  }
  if (norm.includes('cascade') || norm.includes('cascata')) {
    return getArchCascadeSvg(colors);
  }
  if (norm.includes('totem') || norm.includes('coluna')) {
    return getClusterTotemSvg(colors);
  }
  if (norm.includes('chao') || norm.includes('floor') || norm.includes('cluster')) {
    return getClusterFloorSvg(colors);
  }
  return getArchLSvg(colors);
}

export function generateBalloonDataUrl(type: string, colors: string[]): string {
  return svgToDataUrl(generateBalloonSVG(type, colors));
}

export function generateBalloonArchDataUrl(colors?: string[]): string {
  const c = colors || ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7'];
  return svgToDataUrl(generateBalloonSVG('balloon_arch_l', c));
}

// Exportações pré-geradas para presets
export const SVG_BALLOON_ARCH_L = generateBalloonSVG('balloon_arch_l', ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7']);
export const SVG_BALLOON_ARCH_DEMI = generateBalloonSVG('balloon_arch_demi', ['#f8b4d9', '#d8b4fe', '#93c5fd', '#fef08a']);
export const SVG_BALLOON_ARCH_CASCADE = generateBalloonSVG('balloon_arch_cascade', ['#4d6b2c', '#85512b', '#c59a3f', '#f7eed7']);
export const SVG_BALLOON_CLUSTER_FLOOR = generateBalloonSVG('balloon_cluster_floor', ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7']);
export const SVG_BALLOON_CLUSTER_TOTEM = generateBalloonSVG('balloon_cluster_totem', ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7']);
