// Texturas Realistas para Cenário VERTICAL (Proporção 9:16 — 1080 x 1920)
import { svgToDataUrl } from './presets-data.js';

// 1. Parede Boiserie Clássica Branca Vertical (1080 x 1380)
export const TEXTURE_WALL_BOISERIE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <radialGradient id="wallLightVert" cx="50%" cy="25%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <filter id="moldingShadowVert" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#64748b" flood-opacity="0.16"/>
      <feDropShadow dx="-2" dy="-2" stdDeviation="2" flood-color="#ffffff" flood-opacity="0.9"/>
    </filter>
  </defs>
  <rect width="1080" height="1380" fill="url(#wallLightVert)"/>
  <!-- Faixa de sanca no teto -->
  <rect x="0" y="30" width="1080" height="16" fill="#e2e8f0" opacity="0.6"/>
  <!-- Painéis Boiserie Verticais Imponentes -->
  <g filter="url(#moldingShadowVert)">
    <!-- Painel Alto Esquerdo -->
    <rect x="50" y="80" width="280" height="850" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="68" y="98" width="244" height="814" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="50" y="960" width="280" height="360" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="68" y="978" width="244" height="324" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>

    <!-- Painel Alto Central -->
    <rect x="400" y="80" width="280" height="850" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="418" y="98" width="244" height="814" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="400" y="960" width="280" height="360" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="418" y="978" width="244" height="324" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>

    <!-- Painel Alto Direito -->
    <rect x="750" y="80" width="280" height="850" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="768" y="98" width="244" height="814" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="750" y="960" width="280" height="360" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="768" y="978" width="244" height="324" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
  </g>
  <!-- Rodapé de Parede Alto -->
  <rect x="0" y="1348" width="1080" height="32" fill="#f1f5f9"/>
  <rect x="0" y="1348" width="1080" height="6" fill="#cbd5e1"/>
</svg>
`);

// 2. Parede Tijolinho Branco Vertical (1080 x 1380)
export const TEXTURE_WALL_BRICK = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <pattern id="brickPatternVert" width="120" height="60" patternUnits="userSpaceOnUse">
      <rect width="120" height="60" fill="#e2e8f0"/>
      <rect x="2" y="2" width="116" height="26" rx="2" fill="#ffffff"/>
      <rect x="4" y="4" width="112" height="22" rx="1" fill="#f8fafc" opacity="0.6"/>
      <rect x="-58" y="32" width="116" height="26" rx="2" fill="#ffffff"/>
      <rect x="62" y="32" width="116" height="26" rx="2" fill="#ffffff"/>
      <rect x="64" y="34" width="112" height="22" rx="1" fill="#f8fafc" opacity="0.6"/>
    </pattern>
    <radialGradient id="brickVignetteVert" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="70%" stop-color="#64748b" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#334155" stop-opacity="0.25"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1380" fill="url(#brickPatternVert)"/>
  <rect width="1080" height="1380" fill="url(#brickVignetteVert)"/>
  <rect x="0" y="1352" width="1080" height="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
</svg>
`);

// 3. Parede Cortina Voil com Luzinhas Vertical (1080 x 1380)
export const TEXTURE_WALL_FAIRY_LIGHTS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <linearGradient id="curtainGradVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#2e1065"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </linearGradient>
    <radialGradient id="lightBulbVert" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#eab308" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1380" fill="url(#curtainGradVert)"/>
  <g opacity="0.14">
    <path d="M 0 0 C 80 300 120 900 0 1380 L 120 1380 C 240 900 200 300 120 0 Z" fill="#ffffff"/>
    <path d="M 240 0 C 320 300 360 900 240 1380 L 360 1380 C 480 900 440 300 360 0 Z" fill="#ffffff"/>
    <path d="M 480 0 C 560 300 600 900 480 1380 L 600 1380 C 720 900 680 300 600 0 Z" fill="#ffffff"/>
    <path d="M 720 0 C 800 300 840 900 720 1380 L 840 1380 C 960 900 920 300 840 0 Z" fill="#ffffff"/>
    <path d="M 960 0 C 1040 300 1080 900 960 1380 L 1080 1380 C 1200 900 1160 300 1080 0 Z" fill="#ffffff"/>
  </g>
  <g>
    <line x1="120" y1="0" x2="120" y2="1340" stroke="#fef08a" stroke-width="1.2" opacity="0.3"/>
    <line x1="300" y1="0" x2="300" y2="1350" stroke="#fef08a" stroke-width="1.2" opacity="0.3"/>
    <line x1="480" y1="0" x2="480" y2="1330" stroke="#fef08a" stroke-width="1.2" opacity="0.3"/>
    <line x1="660" y1="0" x2="660" y2="1360" stroke="#fef08a" stroke-width="1.2" opacity="0.3"/>
    <line x1="840" y1="0" x2="840" y2="1340" stroke="#fef08a" stroke-width="1.2" opacity="0.3"/>
    <line x1="1000" y1="0" x2="1000" y2="1350" stroke="#fef08a" stroke-width="1.2" opacity="0.3"/>

    <!-- Lâmpadas no fio vertical -->
    <circle cx="120" cy="120" r="18" fill="url(#lightBulbVert)"/>
    <circle cx="120" cy="380" r="16" fill="url(#lightBulbVert)"/>
    <circle cx="120" cy="650" r="18" fill="url(#lightBulbVert)"/>
    <circle cx="120" cy="920" r="16" fill="url(#lightBulbVert)"/>
    <circle cx="120" cy="1180" r="18" fill="url(#lightBulbVert)"/>

    <circle cx="300" cy="180" r="20" fill="url(#lightBulbVert)"/>
    <circle cx="300" cy="460" r="17" fill="url(#lightBulbVert)"/>
    <circle cx="300" cy="740" r="19" fill="url(#lightBulbVert)"/>
    <circle cx="300" cy="1020" r="17" fill="url(#lightBulbVert)"/>
    <circle cx="300" cy="1250" r="18" fill="url(#lightBulbVert)"/>

    <circle cx="480" cy="100" r="17" fill="url(#lightBulbVert)"/>
    <circle cx="480" cy="340" r="19" fill="url(#lightBulbVert)"/>
    <circle cx="480" cy="600" r="18" fill="url(#lightBulbVert)"/>
    <circle cx="480" cy="860" r="19" fill="url(#lightBulbVert)"/>
    <circle cx="480" cy="1120" r="18" fill="url(#lightBulbVert)"/>

    <circle cx="660" cy="200" r="19" fill="url(#lightBulbVert)"/>
    <circle cx="660" cy="490" r="17" fill="url(#lightBulbVert)"/>
    <circle cx="660" cy="780" r="19" fill="url(#lightBulbVert)"/>
    <circle cx="660" cy="1050" r="18" fill="url(#lightBulbVert)"/>

    <circle cx="840" cy="140" r="18" fill="url(#lightBulbVert)"/>
    <circle cx="840" cy="420" r="19" fill="url(#lightBulbVert)"/>
    <circle cx="840" cy="700" r="17" fill="url(#lightBulbVert)"/>
    <circle cx="840" cy="980" r="19" fill="url(#lightBulbVert)"/>
    <circle cx="840" cy="1220" r="18" fill="url(#lightBulbVert)"/>

    <circle cx="1000" cy="220" r="17" fill="url(#lightBulbVert)"/>
    <circle cx="1000" cy="520" r="19" fill="url(#lightBulbVert)"/>
    <circle cx="1000" cy="820" r="18" fill="url(#lightBulbVert)"/>
    <circle cx="1000" cy="1100" r="17" fill="url(#lightBulbVert)"/>
  </g>
</svg>
`);

// 4. Parede Painel Ripado Vertical (1080 x 1380)
export const TEXTURE_WALL_WOOD_SLATS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <pattern id="slatPatternVert" width="30" height="1380" patternUnits="userSpaceOnUse">
      <rect width="30" height="1380" fill="#1c1917"/>
      <rect x="2" y="0" width="22" height="1380" fill="#78350f"/>
      <rect x="3" y="0" width="3" height="1380" fill="#9a3412" opacity="0.6"/>
      <rect x="20" y="0" width="4" height="1380" fill="#451a03" opacity="0.8"/>
    </pattern>
    <linearGradient id="slatLightVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1380" fill="url(#slatPatternVert)"/>
  <rect width="1080" height="1380" fill="url(#slatLightVert)"/>
  <rect x="0" y="1355" width="1080" height="25" fill="#451a03"/>
</svg>
`);

// 5. Parede Cimento Queimado Vertical (1080 x 1380)
export const TEXTURE_WALL_CONCRETE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <radialGradient id="concreteGradVert" cx="45%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <filter id="noiseFilterVert">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.5   0 0 0 0 0.5   0 0 0 0 0.5  0 0 0 0.08 0"/>
    </filter>
  </defs>
  <rect width="1080" height="1380" fill="url(#concreteGradVert)"/>
  <rect width="1080" height="1380" filter="url(#noiseFilterVert)"/>
  <rect x="0" y="1358" width="1080" height="22" fill="#1e293b"/>
</svg>
`);

// 6. Parede Estúdio Clean Off-White Vertical (1080 x 1380)
export const TEXTURE_WALL_CLEAN = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <radialGradient id="cleanStudioVert" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#fdf4ff"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1380" fill="url(#cleanStudioVert)"/>
  <rect x="0" y="1355" width="1080" height="25" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
</svg>
`);

// --- PISOS VERTICAIS COM PERSPECTIVA 2.5D (1080 x 540) ---

// 1. Piso Madeira Carvalho Nobre Vertical
export const TEXTURE_FLOOR_WOOD = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="540" viewBox="0 0 1080 540">
  <defs>
    <linearGradient id="woodFloorVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="40%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="540" fill="url(#woodFloorVert)"/>
  <g stroke="#78350f" stroke-width="2.5" opacity="0.8">
    <line x1="60" y1="0" x2="-120" y2="540"/>
    <line x1="220" y1="0" x2="80" y2="540"/>
    <line x1="380" y1="0" x2="280" y2="540"/>
    <line x1="540" y1="0" x2="540" y2="540"/>
    <line x1="700" y1="0" x2="800" y2="540"/>
    <line x1="860" y1="0" x2="1000" y2="540"/>
    <line x1="1020" y1="0" x2="1200" y2="540"/>
  </g>
  <line x1="0" y1="70" x2="1080" y2="70" stroke="#451a03" stroke-width="2" opacity="0.4"/>
  <line x1="0" y1="170" x2="1080" y2="170" stroke="#451a03" stroke-width="2.5" opacity="0.5"/>
  <line x1="0" y1="310" x2="1080" y2="310" stroke="#451a03" stroke-width="3" opacity="0.6"/>
  <line x1="0" y1="470" x2="1080" y2="470" stroke="#451a03" stroke-width="3.5" opacity="0.7"/>
  <rect width="1080" height="70" fill="#fef3c7" opacity="0.08"/>
</svg>
`);

// 2. Piso Porcelanato Marmorizado Carrara Vertical
export const TEXTURE_FLOOR_MARBLE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="540" viewBox="0 0 1080 540">
  <defs>
    <linearGradient id="marbleGradVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="540" fill="url(#marbleGradVert)"/>
  <g stroke="#cbd5e1" stroke-width="3.5" fill="none" opacity="0.6">
    <path d="M 120 0 Q 200 160 150 360 T 260 540"/>
    <path d="M 500 0 Q 450 180 550 340 T 480 540"/>
    <path d="M 880 0 Q 960 200 900 380 T 980 540"/>
  </g>
  <g stroke="#cbd5e1" stroke-width="2" opacity="0.8">
    <line x1="180" y1="0" x2="80" y2="540"/>
    <line x1="540" y1="0" x2="540" y2="540"/>
    <line x1="900" y1="0" x2="1000" y2="540"/>
    <line x1="0" y1="140" x2="1080" y2="140"/>
    <line x1="0" y1="330" x2="1080" y2="330"/>
  </g>
  <ellipse cx="540" cy="90" rx="400" ry="40" fill="#ffffff" opacity="0.4"/>
</svg>
`);

// 3. Piso Grama Sintética Jardim Vertical
export const TEXTURE_FLOOR_GRASS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="540" viewBox="0 0 1080 540">
  <defs>
    <linearGradient id="grassGradVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="50%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <pattern id="grassBladesVert" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="6" cy="6" r="3.5" fill="#22c55e" opacity="0.3"/>
      <circle cx="18" cy="18" r="3" fill="#15803d" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="1080" height="540" fill="url(#grassGradVert)"/>
  <rect width="1080" height="540" fill="url(#grassBladesVert)"/>
  <rect width="1080" height="35" fill="#052e16" opacity="0.5"/>
</svg>
`);

// 4. Piso Cimento Polido Vertical
export const TEXTURE_FLOOR_CONCRETE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="540" viewBox="0 0 1080 540">
  <defs>
    <linearGradient id="concreteFloorGradVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="540" fill="url(#concreteFloorGradVert)"/>
  <line x1="300" y1="0" x2="200" y2="540" stroke="#334155" stroke-width="2.5"/>
  <line x1="780" y1="0" x2="880" y2="540" stroke="#334155" stroke-width="2.5"/>
  <line x1="0" y1="240" x2="1080" y2="240" stroke="#334155" stroke-width="2.5"/>
</svg>
`);

// Miniaturas Visuais Verticais para Seleção
export const REALISTIC_ENVIRONMENTS = [
  {
    id: 'boiserie-wood',
    name: 'Boiserie & Madeira',
    category: 'Clássico',
    wallTexture: TEXTURE_WALL_BOISERIE,
    floorTexture: TEXTURE_FLOOR_WOOD,
    previewThumb: TEXTURE_WALL_BOISERIE
  },
  {
    id: 'brick-marble',
    name: 'Tijolinho & Mármore',
    category: 'Moderno',
    wallTexture: TEXTURE_WALL_BRICK,
    floorTexture: TEXTURE_FLOOR_MARBLE,
    previewThumb: TEXTURE_WALL_BRICK
  },
  {
    id: 'fairy-wood',
    name: 'Cortina Luzes & Madeira',
    category: 'Festas',
    wallTexture: TEXTURE_WALL_FAIRY_LIGHTS,
    floorTexture: TEXTURE_FLOOR_WOOD,
    previewThumb: TEXTURE_WALL_FAIRY_LIGHTS
  },
  {
    id: 'slats-grass',
    name: 'Ripado & Gramado',
    category: 'Rústico',
    wallTexture: TEXTURE_WALL_WOOD_SLATS,
    floorTexture: TEXTURE_FLOOR_GRASS,
    previewThumb: TEXTURE_WALL_WOOD_SLATS
  },
  {
    id: 'concrete-loft',
    name: 'Cimento Queimado',
    category: 'Industrial',
    wallTexture: TEXTURE_WALL_CONCRETE,
    floorTexture: TEXTURE_FLOOR_CONCRETE,
    previewThumb: TEXTURE_WALL_CONCRETE
  },
  {
    id: 'clean-marble',
    name: 'Estúdio Clean',
    category: 'Minimalista',
    wallTexture: TEXTURE_WALL_CLEAN,
    floorTexture: TEXTURE_FLOOR_MARBLE,
    previewThumb: TEXTURE_WALL_CLEAN
  }
];

export const WALL_OPTIONS = [
  { id: 'wall-boiserie', name: 'Boiserie Branca', texture: TEXTURE_WALL_BOISERIE },
  { id: 'wall-brick', name: 'Tijolinho Branco', texture: TEXTURE_WALL_BRICK },
  { id: 'wall-fairy', name: 'Cortina Luzinhas', texture: TEXTURE_WALL_FAIRY_LIGHTS },
  { id: 'wall-slats', name: 'Painel Ripado', texture: TEXTURE_WALL_WOOD_SLATS },
  { id: 'wall-concrete', name: 'Cimento Queimado', texture: TEXTURE_WALL_CONCRETE },
  { id: 'wall-clean', name: 'Estúdio Clean', texture: TEXTURE_WALL_CLEAN }
];

export const FLOOR_OPTIONS = [
  { id: 'floor-wood', name: 'Madeira Carvalho', texture: TEXTURE_FLOOR_WOOD },
  { id: 'floor-marble', name: 'Mármore Carrara', texture: TEXTURE_FLOOR_MARBLE },
  { id: 'floor-grass', name: 'Grama / Jardim', texture: TEXTURE_FLOOR_GRASS },
  { id: 'floor-concrete', name: 'Cimento Polido', texture: TEXTURE_FLOOR_CONCRETE }
];
