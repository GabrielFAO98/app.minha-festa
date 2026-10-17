// Gerador Paramétrico de Arco de Balões Orgânico Desconstruído de Alto Padrão
import { svgToDataUrl } from './presets-data';

export interface BalloonPalette {
  id: string;
  name: string;
  colors: string[];
}

// Paletas Prontas Populares em Decorações Profissionais de Festa
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

  // Gradientes de acabamento látex acetinado / perolado com sombreamento esférico suave
  const defsGradients = colors.map((col, idx) => {
    const spec = adjustHex(col, 46);
    const midLight = adjustHex(col, 18);
    const coreShadow = adjustHex(col, -32);
    const deepShadow = adjustHex(col, -48);
    const rimLight = adjustHex(col, -12);

    return `
      <radialGradient id="balGrad_${idx}" cx="35%" cy="30%" r="68%" fx="32%" fy="27%">
        <stop offset="0%" stop-color="${spec}"/>
        <stop offset="22%" stop-color="${midLight}"/>
        <stop offset="56%" stop-color="${col}"/>
        <stop offset="85%" stop-color="${coreShadow}"/>
        <stop offset="96%" stop-color="${deepShadow}"/>
        <stop offset="100%" stop-color="${rimLight}"/>
      </radialGradient>
    `;
  }).join('');

  // 1. ESPINHA DORSAL E FUNDO: Balões de 12" e 16" que formam o corpo denso e vedam vazios
  const backBalloons = [
    // Base inferior
    { cx: 105, cy: 530, r: 38, col: 0 },
    { cx: 148, cy: 515, r: 34, col: 1 },
    { cx: 88, cy: 465, r: 38, col: 2 },
    { cx: 142, cy: 450, r: 36, col: 3 },
    // Coluna vertical esquerda
    { cx: 92, cy: 395, r: 38, col: 0 },
    { cx: 145, cy: 385, r: 36, col: 1 },
    { cx: 95, cy: 325, r: 40, col: 2 },
    { cx: 148, cy: 315, r: 37, col: 3 },
    // Transição do ombro / curva
    { cx: 112, cy: 250, r: 42, col: 0 },
    { cx: 168, cy: 235, r: 39, col: 1 },
    { cx: 152, cy: 170, r: 42, col: 2 },
    { cx: 212, cy: 165, r: 38, col: 3 },
    // Travessia do topo
    { cx: 228, cy: 110, r: 40, col: 0 },
    { cx: 288, cy: 98, r: 42, col: 1 },
    { cx: 348, cy: 86, r: 40, col: 2 },
    { cx: 408, cy: 84, r: 38, col: 3 },
    // Drapeamento no topo direito
    { cx: 462, cy: 96, r: 36, col: 0 },
    { cx: 512, cy: 120, r: 32, col: 1 },
    { cx: 546, cy: 158, r: 28, col: 2 }
  ];

  // 2. CORPO PRINCIPAL INTERCALADO: Balões volumosos de 11", 16" e Jumbos de 24"
  // Intertravados organicamente na frente da camada de fundo
  const midBalloons = [
    // Base
    { cx: 126, cy: 545, r: 36, col: 1 },
    { cx: 78, cy: 510, r: 34, col: 2 },
    { cx: 124, cy: 485, r: 44, col: 3 }, // Volume na base
    { cx: 74, cy: 430, r: 36, col: 1 },
    { cx: 126, cy: 420, r: 42, col: 0 },
    // Coluna
    { cx: 76, cy: 358, r: 38, col: 3 },
    { cx: 128, cy: 348, r: 46, col: 2 }, // Jumbo vertical
    { cx: 80, cy: 285, r: 40, col: 1 },
    { cx: 135, cy: 270, r: 44, col: 0 },
    // Ombro (Ponto nobre de maior volume)
    { cx: 102, cy: 198, r: 44, col: 2 },
    { cx: 162, cy: 192, r: 50, col: 1 }, // Jumbo 24" no ombro
    { cx: 178, cy: 128, r: 42, col: 0 },
    { cx: 235, cy: 135, r: 44, col: 3 },
    // Topo
    { cx: 254, cy: 82, r: 40, col: 2 },
    { cx: 312, cy: 78, r: 46, col: 0 }, // Jumbo de topo
    { cx: 370, cy: 75, r: 42, col: 1 },
    { cx: 428, cy: 82, r: 40, col: 2 },
    { cx: 480, cy: 102, r: 36, col: 3 },
    { cx: 524, cy: 135, r: 32, col: 0 },
    { cx: 555, cy: 178, r: 25, col: 1 }
  ];

  // 3. CACHOS DE MINI BALÕES DE 5 POLEGADAS (Trios e duplas estritamente aninhados nos VALES)
  // Em decorações reais, mini-balões NUNCA ficam soltos no meio do balão grande.
  // Eles são amarrados em duplas/trios e encaixados na reentrância entre dois ou três balões grandes.
  const miniClusters = [
    // Cacho 1: Vale entre os balões da base inferior
    [
      { cx: 104, cy: 512, r: 16, col: 0 },
      { cx: 92, cy: 526, r: 15, col: 3 },
      { cx: 116, cy: 528, r: 14, col: 1 }
    ],
    // Cacho 2: Vale entre base e coluna média
    [
      { cx: 102, cy: 450, r: 17, col: 2 },
      { cx: 118, cy: 442, r: 15, col: 1 },
      { cx: 110, cy: 460, r: 14, col: 0 }
    ],
    // Cacho 3: Vale na coluna vertical
    [
      { cx: 106, cy: 378, r: 18, col: 1 },
      { cx: 94, cy: 390, r: 15, col: 2 },
      { cx: 118, cy: 392, r: 15, col: 3 }
    ],
    // Cacho 4: Vale abaixo do ombro
    [
      { cx: 108, cy: 308, r: 18, col: 3 },
      { cx: 122, cy: 298, r: 16, col: 0 },
      { cx: 124, cy: 316, r: 14, col: 2 }
    ],
    // Cacho 5: Vale nobre na curva do ombro (aninhado entre os jumbos)
    [
      { cx: 138, cy: 228, r: 19, col: 0 },
      { cx: 154, cy: 218, r: 17, col: 3 },
      { cx: 148, cy: 240, r: 16, col: 2 }
    ],
    // Cacho 6: Vale no início do arco superior
    [
      { cx: 204, cy: 150, r: 18, col: 1 },
      { cx: 218, cy: 142, r: 16, col: 2 },
      { cx: 212, cy: 160, r: 15, col: 0 }
    ],
    // Cacho 7: Vale no centro do topo
    [
      { cx: 338, cy: 96, r: 18, col: 3 },
      { cx: 352, cy: 88, r: 16, col: 1 },
      { cx: 346, cy: 106, r: 15, col: 0 }
    ],
    // Cacho 8: Vale na curva de descida à direita
    [
      { cx: 450, cy: 110, r: 17, col: 1 },
      { cx: 464, cy: 104, r: 15, col: 2 },
      { cx: 458, cy: 122, r: 14, col: 0 }
    ],
    // Cacho 9: Vale na ponta final
    [
      { cx: 536, cy: 150, r: 15, col: 3 },
      { cx: 548, cy: 142, r: 13, col: 1 }
    ]
  ];

  const renderBalloon = (
    b: { cx: number; cy: number; r: number; col: number },
    filterId: string
  ) => {
    const gradId = `balGrad_${b.col % colors.length}`;
    return `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="url(#${gradId})" filter="url(#${filterId})" />`;
  };

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <!-- Sombra Suave Global Projetada na Parede / Painel -->
    <filter id="archWallShadow" x="-15%" y="-15%" width="135%" height="135%">
      <feDropShadow dx="6" dy="12" stdDeviation="9" flood-color="#020617" flood-opacity="0.22"/>
    </filter>
    <!-- Oclusão de Contato Intermediária entre os Balões -->
    <filter id="balOcclusion" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" flood-color="#020617" flood-opacity="0.20"/>
    </filter>
    <!-- Oclusão Suave dos Cachos de 5 Polegadas nos Vales -->
    <filter id="miniOcclusion" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="1.2" dy="2.2" stdDeviation="2.0" flood-color="#020617" flood-opacity="0.24"/>
    </filter>
    ${defsGradients}
  </defs>
  <g filter="url(#archWallShadow)">
    <g id="layer-back">
      ${backBalloons.map((b) => renderBalloon(b, 'balOcclusion')).join('')}
    </g>
    <g id="layer-mid">
      ${midBalloons.map((b) => renderBalloon(b, 'balOcclusion')).join('')}
    </g>
    <g id="layer-front-clusters">
      ${miniClusters.map((cluster) => cluster.map((b) => renderBalloon(b, 'miniOcclusion')).join('')).join('')}
    </g>
  </g>
</svg>`;

  return svgToDataUrl(svgString);
}
