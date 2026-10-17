// Gerador Paramétrico de Arco de Balões Orgânico Desconstruído de Alto Padrão
import { svgToDataUrl } from './presets-data';

export interface BalloonPalette {
  id: string;
  name: string;
  colors: string[];
}

// Paletas Prontas Populares em Festas e Eventos de Luxo
export const BALLOON_PALETTES: BalloonPalette[] = [
  {
    id: 'rose-gold',
    name: 'Rose Gold, Blush & Pérola',
    colors: ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7']
  },
  {
    id: 'safari',
    name: 'Safari & Floresta Chic',
    colors: ['#4d6b2c', '#85512b', '#c59a3f', '#f7eed7']
  },
  {
    id: 'candy-colors',
    name: 'Candy Colors Pastel',
    colors: ['#f8b4d9', '#d8b4fe', '#93c5fd', '#fef08a']
  },
  {
    id: 'azul-prata',
    name: 'Azul Real, Celeste & Prata',
    colors: ['#1e40af', '#60a5fa', '#cbd5e1', '#ffffff']
  },
  {
    id: 'dourado-preto',
    name: 'Dourado Glamour & Preto',
    colors: ['#d4af37', '#1e293b', '#fde047', '#0f172a']
  },
  {
    id: 'boho-terracota',
    name: 'Boho Terracota & Eucalipto',
    colors: ['#c2410c', '#2d6a4f', '#d97706', '#fef3c7']
  },
  {
    id: 'cha-revelacao',
    name: 'Chá Revelação Baby',
    colors: ['#f472b6', '#38bdf8', '#ffffff', '#fde047']
  },
  {
    id: 'sereia',
    name: 'Sereia, Lilás & Tiffany',
    colors: ['#9333ea', '#14b8a6', '#f472b6', '#e0e7ff']
  }
];

function adjustHex(hex: string, percent: number): string {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  let num = parseInt(clean, 16);
  if (isNaN(num)) num = 0xcccccc;

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Gera o SVG tridimensional de um arco orgânico desconstruído de balões com esfericidade real e acabamento látex
 * @param colors Array com 2 a 4 cores hexadecimais
 * @returns Data URI do SVG gerado
 */
export function generateBalloonArchDataUrl(
  colors: string[] = ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7']
): string {
  if (!colors || colors.length === 0) {
    colors = ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7'];
  }

  // Gradientes de acabamento látex acetinado / perolado de estúdio fotográfico
  const defsGradients = colors.map((col, idx) => {
    const spec = adjustHex(col, 55);
    const midLight = adjustHex(col, 22);
    const coreShadow = adjustHex(col, -36);
    const deepShadow = adjustHex(col, -52);
    const rimLight = adjustHex(col, -14);

    return `
      <radialGradient id="balGrad_${idx}" cx="35%" cy="30%" r="68%" fx="32%" fy="27%">
        <stop offset="0%" stop-color="${spec}"/>
        <stop offset="20%" stop-color="${midLight}"/>
        <stop offset="55%" stop-color="${col}"/>
        <stop offset="86%" stop-color="${coreShadow}"/>
        <stop offset="96%" stop-color="${deepShadow}"/>
        <stop offset="100%" stop-color="${rimLight}"/>
      </radialGradient>
    `;
  }).join('');

  // 1. CAMADA DE FUNDO (12" e 16" - Fundo denso de sustentação da guirlanda)
  const backLayer = [
    // Base inferior (solo)
    { cx: 96, cy: 535, r: 35, col: 0 },
    { cx: 140, cy: 520, r: 33, col: 1 },
    { cx: 78, cy: 468, r: 37, col: 2 },
    { cx: 132, cy: 456, r: 35, col: 3 },
    // Coluna vertical esquerda
    { cx: 82, cy: 395, r: 38, col: 0 },
    { cx: 135, cy: 388, r: 34, col: 1 },
    { cx: 88, cy: 322, r: 39, col: 2 },
    { cx: 138, cy: 312, r: 36, col: 3 },
    // Transição da curva / ombro do painel
    { cx: 105, cy: 245, r: 40, col: 0 },
    { cx: 158, cy: 232, r: 37, col: 1 },
    { cx: 145, cy: 168, r: 40, col: 2 },
    { cx: 202, cy: 165, r: 36, col: 3 },
    // Curva superior do topo
    { cx: 218, cy: 112, r: 38, col: 0 },
    { cx: 275, cy: 102, r: 39, col: 1 },
    { cx: 332, cy: 88, r: 38, col: 2 },
    { cx: 390, cy: 86, r: 37, col: 3 },
    // Cauda / drapeamento no topo direito
    { cx: 446, cy: 98, r: 35, col: 0 },
    { cx: 498, cy: 122, r: 32, col: 1 },
    { cx: 535, cy: 160, r: 28, col: 2 }
  ];

  // 2. CAMADA PRINCIPAL DE VOLUME (11", 16" e Jumbos de 24" - Corpo orgânico)
  const midLayer = [
    // Base inferior
    { cx: 115, cy: 546, r: 36, col: 1 },
    { cx: 72, cy: 508, r: 32, col: 2 },
    { cx: 118, cy: 486, r: 42, col: 3 }, // Volume encorpado
    { cx: 68, cy: 432, r: 35, col: 1 },
    { cx: 120, cy: 420, r: 40, col: 0 },
    // Coluna vertical média
    { cx: 72, cy: 358, r: 37, col: 3 },
    { cx: 124, cy: 348, r: 44, col: 2 }, // Jumbo intermediário
    { cx: 76, cy: 282, r: 38, col: 1 },
    { cx: 130, cy: 270, r: 42, col: 0 },
    // Ombro principal da curva (ponto focal)
    { cx: 98, cy: 198, r: 42, col: 2 },
    { cx: 156, cy: 195, r: 48, col: 1 }, // Jumbo 24" no ombro do painel
    { cx: 172, cy: 132, r: 40, col: 0 },
    { cx: 228, cy: 138, r: 42, col: 3 },
    // Topo em cascata suave
    { cx: 248, cy: 85, r: 38, col: 2 },
    { cx: 304, cy: 82, r: 44, col: 0 }, // Jumbo de topo
    { cx: 360, cy: 78, r: 39, col: 1 },
    { cx: 416, cy: 84, r: 40, col: 2 },
    { cx: 468, cy: 104, r: 36, col: 3 },
    { cx: 512, cy: 138, r: 31, col: 0 },
    { cx: 545, cy: 182, r: 24, col: 1 }
  ];

  // 3. CAMADA FRONTAL DE ACABAMENTO: Cachos de Mini Balões (5" e 9")
  // Clusters orgânicos colocados nos vãos entre os balões maiores
  const frontClusters = [
    // Cachos na base (Y = 480 a 550)
    { cx: 94, cy: 555, r: 16, col: 2 },
    { cx: 138, cy: 550, r: 18, col: 0 },
    { cx: 102, cy: 518, r: 19, col: 1 },
    { cx: 138, cy: 482, r: 17, col: 2 },
    { cx: 88, cy: 472, r: 15, col: 3 },
    // Cachos na coluna vertical (Y = 320 a 460)
    { cx: 98, cy: 428, r: 18, col: 2 },
    { cx: 128, cy: 402, r: 16, col: 3 },
    { cx: 68, cy: 392, r: 15, col: 1 },
    { cx: 95, cy: 362, r: 20, col: 0 },
    { cx: 132, cy: 342, r: 17, col: 1 },
    { cx: 82, cy: 318, r: 16, col: 0 },
    { cx: 106, cy: 295, r: 21, col: 3 },
    { cx: 142, cy: 290, r: 15, col: 2 },
    // Cachos no ombro da curva (Y = 160 a 260 - Ponto nobre)
    { cx: 88, cy: 235, r: 18, col: 1 },
    { cx: 128, cy: 228, r: 22, col: 3 },
    { cx: 158, cy: 242, r: 16, col: 0 },
    { cx: 122, cy: 175, r: 19, col: 2 },
    { cx: 178, cy: 178, r: 23, col: 1 },
    { cx: 204, cy: 184, r: 15, col: 0 },
    { cx: 152, cy: 118, r: 17, col: 3 },
    { cx: 196, cy: 124, r: 20, col: 2 },
    // Cachos na travessia do topo (X = 220 a 480)
    { cx: 252, cy: 122, r: 18, col: 1 },
    { cx: 284, cy: 114, r: 21, col: 2 },
    { cx: 326, cy: 106, r: 19, col: 3 },
    { cx: 372, cy: 102, r: 22, col: 0 },
    { cx: 412, cy: 112, r: 18, col: 1 },
    { cx: 448, cy: 126, r: 20, col: 2 },
    // Cachos na ponta direita (X = 470 a 550)
    { cx: 486, cy: 142, r: 16, col: 0 },
    { cx: 522, cy: 162, r: 15, col: 3 },
    { cx: 546, cy: 198, r: 13, col: 2 }
  ];

  const renderBalloon = (
    b: { cx: number; cy: number; r: number; col: number },
    filterId: string,
    showGlow: boolean
  ) => {
    const gradId = `balGrad_${b.col % colors.length}`;
    const specX = b.cx - b.r * 0.30;
    const specY = b.cy - b.r * 0.32;
    const specR = Math.max(3, b.r * 0.32);

    return `
      <g filter="url(#${filterId})">
        <circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="url(#${gradId})" />
        ${showGlow ? `
          <circle cx="${specX.toFixed(1)}" cy="${specY.toFixed(1)}" r="${specR.toFixed(1)}" fill="#ffffff" opacity="0.28" filter="url(#balSoftGlow)" />
        ` : ''}
      </g>
    `;
  };

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <!-- Sombra Macia Global Projetada na Parede / Painel -->
    <filter id="archWallShadow" x="-15%" y="-15%" width="135%" height="135%">
      <feDropShadow dx="6" dy="14" stdDeviation="10" flood-color="#020617" flood-opacity="0.25"/>
    </filter>
    <!-- Oclusão de Contato entre Balões do Corpo Médio -->
    <filter id="midBalOcclusion" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3.5" flood-color="#020617" flood-opacity="0.24"/>
    </filter>
    <!-- Oclusão dos Cachos Frontais de 5 polegadas -->
    <filter id="frontBalOcclusion" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="2" dy="3.5" stdDeviation="2.8" flood-color="#020617" flood-opacity="0.28"/>
    </filter>
    <!-- Brilho Difuso Suave de Estúdio (Sem aspecto de plástico duro) -->
    <filter id="balSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.0"/>
    </filter>
    ${defsGradients}
  </defs>
  <g filter="url(#archWallShadow)">
    <g id="layer-back">
      ${backLayer.map((b) => renderBalloon(b, 'midBalOcclusion', false)).join('')}
    </g>
    <g id="layer-mid">
      ${midLayer.map((b) => renderBalloon(b, 'midBalOcclusion', true)).join('')}
    </g>
    <g id="layer-front">
      ${frontClusters.map((b) => renderBalloon(b, 'frontBalOcclusion', true)).join('')}
    </g>
  </g>
</svg>`;

  return svgToDataUrl(svgString);
}
