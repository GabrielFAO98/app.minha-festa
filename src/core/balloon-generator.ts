// Gerador Paramétrico de Arco de Balões Desconstruído com Sombreamento 3D de Estúdio
import { svgToDataUrl } from './presets-data';

export interface BalloonPalette {
  id: string;
  name: string;
  colors: string[];
}

// Paletas Prontas Populares para Festas Brasileiras
export const BALLOON_PALETTES: BalloonPalette[] = [
  {
    id: 'rose-gold',
    name: 'Rose Gold & Pérola',
    colors: ['#db2777', '#fbcfe8', '#eab308', '#ffffff']
  },
  {
    id: 'safari',
    name: 'Safari & Floresta',
    colors: ['#4d7c0f', '#b45309', '#ca8a04', '#fef08a']
  },
  {
    id: 'candy-colors',
    name: 'Candy Colors Suave',
    colors: ['#f472b6', '#a855f7', '#38bdf8', '#fef08a']
  },
  {
    id: 'azul-prata',
    name: 'Azul Celeste & Prata',
    colors: ['#1d4ed8', '#60a5fa', '#94a3b8', '#ffffff']
  },
  {
    id: 'dourado-preto',
    name: 'Dourado Luxo & Preto',
    colors: ['#ca8a04', '#1e293b', '#fef08a', '#0f172a']
  },
  {
    id: 'boho-terracota',
    name: 'Boho Terracota & Eucalipto',
    colors: ['#c2410c', '#15803d', '#d97706', '#fef3c7']
  },
  {
    id: 'cha-revelacao',
    name: 'Chá Revelação',
    colors: ['#ec4899', '#0284c7', '#ffffff', '#fde047']
  },
  {
    id: 'sereia',
    name: 'Sereia & Lilás',
    colors: ['#9333ea', '#06b6d4', '#f472b6', '#e0e7ff']
  }
];

/**
 * Converte cor hex para tons de highlight (iluminação) e shadow (sombra)
 */
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
 * Gera o SVG tridimensional de um arco orgânico desconstruído de balões com oclusão individual
 * @param colors Array com 2 a 4 cores hexadecimais
 * @returns Data URI do SVG gerado
 */
export function generateBalloonArchDataUrl(colors: string[] = ['#db2777', '#fbcfe8', '#eab308', '#ffffff']): string {
  if (!colors || colors.length === 0) {
    colors = ['#db2777', '#fbcfe8', '#eab308', '#ffffff'];
  }

  // Gera gradientes multicamada de látex acetinado/perolado e cromado para cada cor
  const defsGradients = colors.map((col, idx) => {
    const specHighlight = adjustHex(col, 62);
    const midLight = adjustHex(col, 24);
    const coreShadow = adjustHex(col, -32);
    const deepShadow = adjustHex(col, -48);
    const rimLight = adjustHex(col, -12);

    return `
      <radialGradient id="balGrad_${idx}" cx="34%" cy="30%" r="68%" fx="30%" fy="26%">
        <stop offset="0%" stop-color="${specHighlight}"/>
        <stop offset="18%" stop-color="${midLight}"/>
        <stop offset="52%" stop-color="${col}"/>
        <stop offset="86%" stop-color="${coreShadow}"/>
        <stop offset="95%" stop-color="${deepShadow}"/>
        <stop offset="100%" stop-color="${rimLight}"/>
      </radialGradient>
    `;
  }).join('');

  // Camada 1: Balões Traseiros de Base e Preenchimento de Sombra (16" e 12")
  const backLayer = [
    { cx: 46, cy: 274, r: 30, col: 3 },
    { cx: 28, cy: 244, r: 28, col: 0 },
    { cx: 74, cy: 256, r: 26, col: 2 },
    { cx: 26, cy: 192, r: 32, col: 1 },
    { cx: 78, cy: 204, r: 28, col: 0 },
    { cx: 30, cy: 140, r: 34, col: 3 },
    { cx: 84, cy: 152, r: 29, col: 1 },
    { cx: 42, cy: 86, r: 35, col: 2 },
    { cx: 92, cy: 102, r: 31, col: 0 },
    { cx: 74, cy: 48, r: 36, col: 1 },
    { cx: 124, cy: 64, r: 32, col: 3 },
    { cx: 120, cy: 32, r: 34, col: 0 },
    { cx: 168, cy: 34, r: 33, col: 2 },
    { cx: 208, cy: 44, r: 28, col: 1 },
    { cx: 242, cy: 58, r: 24, col: 3 }
  ];

  // Camada 2: Balões Principais de Volume (11" e 16")
  const midLayer = [
    { cx: 38, cy: 262, r: 29, col: 0 },
    { cx: 64, cy: 244, r: 24, col: 1 },
    { cx: 34, cy: 218, r: 27, col: 2 },
    { cx: 60, cy: 196, r: 32, col: 3 },
    { cx: 36, cy: 166, r: 29, col: 1 },
    { cx: 68, cy: 150, r: 33, col: 2 },
    { cx: 92, cy: 172, r: 21, col: 0 },
    { cx: 42, cy: 116, r: 31, col: 0 },
    { cx: 76, cy: 108, r: 35, col: 1 },
    { cx: 58, cy: 68, r: 33, col: 2 },
    { cx: 102, cy: 76, r: 30, col: 3 },
    { cx: 96, cy: 42, r: 32, col: 0 },
    { cx: 142, cy: 48, r: 35, col: 1 },
    { cx: 184, cy: 40, r: 30, col: 2 },
    { cx: 220, cy: 50, r: 25, col: 3 },
    { cx: 248, cy: 66, r: 19, col: 0 }
  ];

  // Camada 3: Clusters Frontais de 9" e 5" (Mini Balões Orgânicos de Acabamento)
  const frontClusters = [
    // Cachos inferiores
    { cx: 52, cy: 268, r: 14, col: 2 },
    { cx: 48, cy: 236, r: 17, col: 1 },
    { cx: 24, cy: 234, r: 13, col: 3 },
    { cx: 76, cy: 224, r: 15, col: 0 },
    { cx: 74, cy: 184, r: 18, col: 0 },
    { cx: 46, cy: 182, r: 14, col: 2 },
    // Cachos centrais na curva
    { cx: 48, cy: 140, r: 18, col: 3 },
    { cx: 24, cy: 148, r: 13, col: 0 },
    { cx: 88, cy: 132, r: 16, col: 2 },
    { cx: 64, cy: 126, r: 14, col: 1 },
    { cx: 56, cy: 92, r: 17, col: 3 },
    { cx: 82, cy: 82, r: 19, col: 1 },
    { cx: 98, cy: 96, r: 13, col: 2 },
    // Cachos superiores do arco
    { cx: 78, cy: 52, r: 16, col: 3 },
    { cx: 118, cy: 58, r: 20, col: 0 },
    { cx: 114, cy: 36, r: 14, col: 2 },
    { cx: 138, cy: 28, r: 16, col: 3 },
    { cx: 162, cy: 54, r: 19, col: 2 },
    { cx: 160, cy: 32, r: 13, col: 0 },
    { cx: 198, cy: 56, r: 17, col: 1 },
    { cx: 204, cy: 36, r: 12, col: 0 },
    { cx: 234, cy: 56, r: 14, col: 2 },
    { cx: 258, cy: 74, r: 11, col: 1 }
  ];

  const renderBalloon = (b: { cx: number; cy: number; r: number; col: number }, isBack: boolean) => {
    const gradId = `balGrad_${b.col % colors.length}`;
    // Leve formato orgânico de gota de látex inflado (rx ligeiramente menor que ry)
    const rx = b.r * 0.96;
    const ry = b.r * 1.02;
    const specX = b.cx - b.r * 0.30;
    const specY = b.cy - b.r * 0.32;
    const specRx = Math.max(3, b.r * 0.34);
    const specRy = Math.max(2, b.r * 0.22);
    const dotX = b.cx - b.r * 0.14;
    const dotY = b.cy - b.r * 0.50;
    const dotR = Math.max(1, b.r * 0.07);

    return `
      <g filter="url(#singleBalOcclusion)" opacity="${isBack ? '0.92' : '1'}">
        <ellipse cx="${b.cx}" cy="${b.cy}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="url(#${gradId})" />
        <ellipse cx="${specX.toFixed(1)}" cy="${specY.toFixed(1)}" rx="${specRx.toFixed(1)}" ry="${specRy.toFixed(1)}" transform="rotate(-28 ${specX.toFixed(1)} ${specY.toFixed(1)})" fill="url(#softWindowHighlight)" />
        <circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="${dotR.toFixed(1)}" fill="#ffffff" opacity="0.55" />
      </g>
    `;
  };

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 285 315" width="285" height="315">
  <defs>
    <!-- Sombra Global do Arco na Parede -->
    <filter id="archWallShadow" x="-15%" y="-15%" width="135%" height="135%">
      <feDropShadow dx="3" dy="7" stdDeviation="5.5" flood-color="#090d16" flood-opacity="0.28"/>
    </filter>
    <!-- Oclusão de Ambiente Individual entre cada Balão do Cluster -->
    <filter id="singleBalOcclusion" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.2" flood-color="#020617" flood-opacity="0.26"/>
    </filter>
    <!-- Reflexo de Janela Difuso (Elimina aspecto de clipart) -->
    <radialGradient id="softWindowHighlight" cx="45%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    ${defsGradients}
  </defs>
  <g filter="url(#archWallShadow)">
    ${backLayer.map((b) => renderBalloon(b, true)).join('')}
    ${midLayer.map((b) => renderBalloon(b, false)).join('')}
    ${frontClusters.map((b) => renderBalloon(b, false)).join('')}
  </g>
</svg>`;

  return svgToDataUrl(svgString);
}
