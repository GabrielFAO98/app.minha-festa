// Gerador ParamǸtrico de Arco de Bales Desconstrudo com Sombreamento 3D Realista
import { svgToDataUrl } from './presets-data.js';

// Paletas Prontas Populares para Festas Brasileiras
export const BALLOON_PALETTES = [
  {
    id: 'rose-gold',
    name: 'Rose Gold & PǸrola',
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
    name: 'Chǭ Revelaǜo',
    colors: ['#ec4899', '#0284c7', '#ffffff', '#fde047']
  },
  {
    id: 'sereia',
    name: 'Sereia & Lilǭs',
    colors: ['#9333ea', '#06b6d4', '#f472b6', '#e0e7ff']
  }
];

/**
 * Converte cor hex para tons de highlight (iluminaǜo) e shadow (sombra)
 */
function adjustHex(hex, percent) {
  let num = parseInt(hex.replace('#', ''), 16);
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
 * Gera o SVG tridimensional de um arco orgnico de bales com base na paleta fornecida
 * @param {string[]} colors Array com 2 a 4 cores hexadecimais
 * @returns {string} Data URI do SVG gerado
 */
export function generateBalloonArchDataUrl(colors = ['#f472b6', '#fbcfe8', '#fbbf24', '#ffffff']) {
  if (!colors || colors.length === 0) {
    colors = ['#f472b6', '#fbcfe8', '#fbbf24', '#ffffff'];
  }

  // Gera os gradientes para cada cor da paleta
  const defsGradients = colors.map((col, idx) => {
    const highlight = adjustHex(col, 38);
    const midLight = adjustHex(col, 15);
    const shadow = adjustHex(col, -32);

    return `
      <radialGradient id="balGrad_${idx}" cx="35%" cy="32%" r="68%">
        <stop offset="0%" stop-color="${highlight}"/>
        <stop offset="25%" stop-color="${midLight}"/>
        <stop offset="70%" stop-color="${col}"/>
        <stop offset="100%" stop-color="${shadow}"/>
      </radialGradient>
    `;
  }).join('');

  // Lista com posies anatmicas de bales em curva orgnica (Curva L elegante em volta do painel)
  // [cx, cy, raio, indiceDaCor]
  const clusterDefinitions = [
    // 1. BASE INFERIOR (Canto inferior esquerdo, subindo)
    { cx: 38, cy: 260, r: 32, col: 0 },
    { cx: 62, cy: 248, r: 24, col: 1 },
    { cx: 30, cy: 215, r: 28, col: 2 },
    { cx: 58, cy: 198, r: 34, col: 3 % colors.length },
    { cx: 80, cy: 220, r: 20, col: 0 },

    // 2. CORPO VERTICAL (Meio da lateral esquerda)
    { cx: 36, cy: 160, r: 30, col: 1 },
    { cx: 66, cy: 152, r: 35, col: 2 },
    { cx: 92, cy: 168, r: 22, col: 3 % colors.length },
    { cx: 42, cy: 110, r: 33, col: 0 },
    { cx: 74, cy: 105, r: 38, col: 1 },

    // 3. CURVA DO TOPO (Transiǜo para horizontal)
    { cx: 62, cy: 62, r: 36, col: 2 },
    { cx: 104, cy: 72, r: 32, col: 3 % colors.length },
    { cx: 98, cy: 38, r: 35, col: 0 },
    { cx: 142, cy: 46, r: 38, col: 1 },
    { cx: 182, cy: 36, r: 33, col: 2 },
    { cx: 218, cy: 48, r: 28, col: 3 % colors.length },
    { cx: 246, cy: 62, r: 22, col: 0 },

    // 4. BAL ES DE ACABAMENTO / MINI BAL ES FRONTAIS (Volume 3D realista na frente)
    { cx: 48, cy: 235, r: 16, col: 1 },
    { cx: 75, cy: 185, r: 18, col: 0 },
    { cx: 48, cy: 135, r: 17, col: 3 % colors.length },
    { cx: 86, cy: 130, r: 15, col: 2 },
    { cx: 82, cy: 76, r: 18, col: 1 },
    { cx: 122, cy: 58, r: 20, col: 0 },
    { cx: 162, cy: 52, r: 18, col: 2 },
    { cx: 198, cy: 58, r: 16, col: 1 },
    { cx: 138, cy: 28, r: 15, col: 3 % colors.length }
  ];

  // Renderiza cada balo com sombreamento + brilho especular (highlight)
  const balloonElements = clusterDefinitions.map((b) => {
    const gradId = `balGrad_${b.col % colors.length}`;
    // Ponto de brilho especular sutil no topo do balo
    const specX = b.cx - b.r * 0.32;
    const specY = b.cy - b.r * 0.35;
    const specRx = Math.max(2, b.r * 0.28);
    const specRy = Math.max(1.5, b.r * 0.16);

    return `
      <g>
        <circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="url(#${gradId})" />
        <ellipse cx="${specX}" cy="${specY}" rx="${specRx}" ry="${specRy}" transform="rotate(-25 ${specX} ${specY})" fill="#ffffff" opacity="0.45" />
      </g>
    `;
  }).join('');

  const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 310" width="280" height="310">
  <defs>
    <filter id="balloonDropShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#090d16" flood-opacity="0.25"/>
    </filter>
    ${defsGradients}
  </defs>
  <g filter="url(#balloonDropShadow)">
    ${balloonElements}
  </g>
</svg>
`;

  return svgToDataUrl(svgString);
}

