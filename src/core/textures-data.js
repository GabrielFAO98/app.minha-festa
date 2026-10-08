// Texturas Realistas para Paredes e Pisos no Formato 16:9 (1600 x 900)
import { svgToDataUrl } from './presets-data.js';

// 1. Parede Boiserie Clássica Branca (1600 x 640)
export const TEXTURE_WALL_BOISERIE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="640" viewBox="0 0 1600 640">
  <defs>
    <radialGradient id="wallLight" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <filter id="moldingShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#64748b" flood-opacity="0.18"/>
      <feDropShadow dx="-2" dy="-2" stdDeviation="2" flood-color="#ffffff" flood-opacity="0.9"/>
    </filter>
  </defs>
  <rect width="1600" height="640" fill="url(#wallLight)"/>
  <rect x="0" y="40" width="1600" height="12" fill="#e2e8f0" opacity="0.6"/>
  <g filter="url(#moldingShadow)">
    <rect x="60" y="80" width="260" height="500" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="76" y="96" width="228" height="468" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="370" y="80" width="260" height="500" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="386" y="96" width="228" height="468" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="680" y="80" width="260" height="500" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="696" y="96" width="228" height="468" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="990" y="80" width="260" height="500" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="1006" y="96" width="228" height="468" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="1300" y="80" width="240" height="500" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="1316" y="96" width="208" height="468" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
  </g>
  <rect x="0" y="618" width="1600" height="22" fill="#f1f5f9"/>
  <rect x="0" y="618" width="1600" height="4" fill="#cbd5e1"/>
</svg>
`);

// 2. Parede Tijolinho Branco / Subway Tile (1600 x 640)
export const TEXTURE_WALL_BRICK = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="640" viewBox="0 0 1600 640">
  <defs>
    <pattern id="brickPattern169" width="120" height="60" patternUnits="userSpaceOnUse">
      <rect width="120" height="60" fill="#e2e8f0"/>
      <rect x="2" y="2" width="116" height="26" rx="2" fill="#ffffff"/>
      <rect x="4" y="4" width="112" height="22" rx="1" fill="#f8fafc" opacity="0.6"/>
      <rect x="-58" y="32" width="116" height="26" rx="2" fill="#ffffff"/>
      <rect x="62" y="32" width="116" height="26" rx="2" fill="#ffffff"/>
      <rect x="64" y="34" width="112" height="22" rx="1" fill="#f8fafc" opacity="0.6"/>
    </pattern>
    <radialGradient id="brickVignette169" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="70%" stop-color="#64748b" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#334155" stop-opacity="0.25"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="640" fill="url(#brickPattern169)"/>
  <rect width="1600" height="640" fill="url(#brickVignette169)"/>
  <rect x="0" y="622" width="1600" height="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
</svg>
`);

// 3. Parede Cortina Voil com Luzinhas / Fairy Lights (1600 x 640)
export const TEXTURE_WALL_FAIRY_LIGHTS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="640" viewBox="0 0 1600 640">
  <defs>
    <linearGradient id="curtainGrad169" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#2e1065"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </linearGradient>
    <radialGradient id="lightBulb169" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#eab308" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="640" fill="url(#curtainGrad169)"/>
  <g opacity="0.15">
    <path d="M 0 0 C 80 150 120 450 0 640 L 120 640 C 240 450 200 150 120 0 Z" fill="#ffffff"/>
    <path d="M 240 0 C 320 150 360 450 240 640 L 360 640 C 480 450 440 150 360 0 Z" fill="#ffffff"/>
    <path d="M 480 0 C 560 150 600 450 480 640 L 600 640 C 720 450 680 150 600 0 Z" fill="#ffffff"/>
    <path d="M 720 0 C 800 150 840 450 720 640 L 840 640 C 960 450 920 150 840 0 Z" fill="#ffffff"/>
    <path d="M 960 0 C 1040 150 1080 450 960 640 L 1080 640 C 1200 450 1160 150 1080 0 Z" fill="#ffffff"/>
    <path d="M 1200 0 C 1280 150 1320 450 1200 640 L 1320 640 C 1440 450 1400 150 1320 0 Z" fill="#ffffff"/>
    <path d="M 1440 0 C 1520 150 1560 450 1440 640 L 1560 640 C 1680 450 1640 150 1560 0 Z" fill="#ffffff"/>
  </g>
  <g>
    <line x1="120" y1="0" x2="120" y2="600" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="280" y1="0" x2="280" y2="610" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="440" y1="0" x2="440" y2="590" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="600" y1="0" x2="600" y2="600" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="760" y1="0" x2="760" y2="610" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="920" y1="0" x2="920" y2="590" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="1080" y1="0" x2="1080" y2="600" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="1240" y1="0" x2="1240" y2="610" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="1400" y1="0" x2="1400" y2="590" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <circle cx="120" cy="90" r="16" fill="url(#lightBulb169)"/>
    <circle cx="120" cy="240" r="14" fill="url(#lightBulb169)"/>
    <circle cx="120" cy="390" r="16" fill="url(#lightBulb169)"/>
    <circle cx="280" cy="130" r="18" fill="url(#lightBulb169)"/>
    <circle cx="280" cy="290" r="15" fill="url(#lightBulb169)"/>
    <circle cx="440" cy="80" r="15" fill="url(#lightBulb169)"/>
    <circle cx="440" cy="230" r="17" fill="url(#lightBulb169)"/>
    <circle cx="600" cy="140" r="18" fill="url(#lightBulb169)"/>
    <circle cx="600" cy="300" r="16" fill="url(#lightBulb169)"/>
    <circle cx="760" cy="100" r="16" fill="url(#lightBulb169)"/>
    <circle cx="760" cy="260" r="18" fill="url(#lightBulb169)"/>
    <circle cx="920" cy="140" r="17" fill="url(#lightBulb169)"/>
    <circle cx="920" cy="310" r="15" fill="url(#lightBulb169)"/>
    <circle cx="1080" cy="110" r="16" fill="url(#lightBulb169)"/>
    <circle cx="1080" cy="270" r="17" fill="url(#lightBulb169)"/>
    <circle cx="1240" cy="130" r="18" fill="url(#lightBulb169)"/>
    <circle cx="1400" cy="100" r="16" fill="url(#lightBulb169)"/>
    <circle cx="1400" cy="270" r="17" fill="url(#lightBulb169)"/>
  </g>
</svg>
`);

// 4. Parede Painel Ripado de Madeira Nobre (1600 x 640)
export const TEXTURE_WALL_WOOD_SLATS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="640" viewBox="0 0 1600 640">
  <defs>
    <pattern id="slatPattern169" width="30" height="640" patternUnits="userSpaceOnUse">
      <rect width="30" height="640" fill="#1c1917"/>
      <rect x="2" y="0" width="22" height="640" fill="#78350f"/>
      <rect x="3" y="0" width="3" height="640" fill="#9a3412" opacity="0.6"/>
      <rect x="20" y="0" width="4" height="640" fill="#451a03" opacity="0.8"/>
    </pattern>
    <linearGradient id="slatLight169" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="640" fill="url(#slatPattern169)"/>
  <rect width="1600" height="640" fill="url(#slatLight169)"/>
  <rect x="0" y="625" width="1600" height="15" fill="#451a03"/>
</svg>
`);

// 5. Parede Cimento Queimado Moderno (1600 x 640)
export const TEXTURE_WALL_CONCRETE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="640" viewBox="0 0 1600 640">
  <defs>
    <radialGradient id="concreteGrad169" cx="45%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <filter id="noiseFilter169">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.5   0 0 0 0 0.5   0 0 0 0 0.5  0 0 0 0.08 0"/>
    </filter>
  </defs>
  <rect width="1600" height="640" fill="url(#concreteGrad169)"/>
  <rect width="1600" height="640" filter="url(#noiseFilter169)"/>
  <rect x="0" y="626" width="1600" height="14" fill="#1e293b"/>
</svg>
`);

// 6. Parede Estúdio Clean Off-White (1600 x 640)
export const TEXTURE_WALL_CLEAN = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="640" viewBox="0 0 1600 640">
  <defs>
    <radialGradient id="cleanStudio169" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#fdf4ff"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="640" fill="url(#cleanStudio169)"/>
  <rect x="0" y="624" width="1600" height="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
</svg>
`);

// --- PISOS COM PERSPECTIVA 2.5D (1600 x 260) ---

// 1. Piso Madeira Vinílica Carvalho Nobre
export const TEXTURE_FLOOR_WOOD = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="260" viewBox="0 0 1600 260">
  <defs>
    <linearGradient id="woodFloorLight169" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="40%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="260" fill="url(#woodFloorLight169)"/>
  <g stroke="#78350f" stroke-width="2" opacity="0.75">
    <line x1="50" y1="0" x2="-140" y2="260"/>
    <line x1="200" y1="0" x2="60" y2="260"/>
    <line x1="360" y1="0" x2="260" y2="260"/>
    <line x1="520" y1="0" x2="460" y2="260"/>
    <line x1="680" y1="0" x2="650" y2="260"/>
    <line x1="840" y1="0" x2="840" y2="260"/>
    <line x1="1000" y1="0" x2="1030" y2="260"/>
    <line x1="1160" y1="0" x2="1220" y2="260"/>
    <line x1="1320" y1="0" x2="1420" y2="260"/>
    <line x1="1480" y1="0" x2="1620" y2="260"/>
  </g>
  <line x1="0" y1="35" x2="1600" y2="35" stroke="#451a03" stroke-width="1.5" opacity="0.4"/>
  <line x1="0" y1="85" x2="1600" y2="85" stroke="#451a03" stroke-width="2" opacity="0.5"/>
  <line x1="0" y1="150" x2="1600" y2="150" stroke="#451a03" stroke-width="2.5" opacity="0.6"/>
  <line x1="0" y1="225" x2="1600" y2="225" stroke="#451a03" stroke-width="3" opacity="0.7"/>
  <rect width="1600" height="40" fill="#fef3c7" opacity="0.08"/>
</svg>
`);

// 2. Piso Porcelanato Marmorizado Carrara Polido
export const TEXTURE_FLOOR_MARBLE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="260" viewBox="0 0 1600 260">
  <defs>
    <linearGradient id="marbleGrad169" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="260" fill="url(#marbleGrad169)"/>
  <g stroke="#cbd5e1" stroke-width="3" fill="none" opacity="0.6">
    <path d="M 80 0 Q 160 80 120 180 T 200 260"/>
    <path d="M 500 0 Q 460 90 540 170 T 500 260"/>
    <path d="M 950 0 Q 1020 100 980 190 T 1060 260"/>
    <path d="M 1400 0 Q 1340 120 1440 260"/>
  </g>
  <g stroke="#cbd5e1" stroke-width="1.5" opacity="0.8">
    <line x1="200" y1="0" x2="80" y2="260"/>
    <line x1="560" y1="0" x2="500" y2="260"/>
    <line x1="920" y1="0" x2="960" y2="260"/>
    <line x1="1280" y1="0" x2="1380" y2="260"/>
    <line x1="0" y1="70" x2="1600" y2="70"/>
    <line x1="0" y1="165" x2="1600" y2="165"/>
  </g>
  <ellipse cx="800" cy="45" rx="450" ry="25" fill="#ffffff" opacity="0.4"/>
</svg>
`);

// 3. Piso Grama Sintética Jardim
export const TEXTURE_FLOOR_GRASS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="260" viewBox="0 0 1600 260">
  <defs>
    <linearGradient id="grassGrad169" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="50%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <pattern id="grassBlades169" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="3" fill="#22c55e" opacity="0.3"/>
      <circle cx="15" cy="15" r="2.5" fill="#15803d" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="1600" height="260" fill="url(#grassGrad169)"/>
  <rect width="1600" height="260" fill="url(#grassBlades169)"/>
  <rect width="1600" height="18" fill="#052e16" opacity="0.5"/>
</svg>
`);

// 4. Piso Cimento Polido / Concreto
export const TEXTURE_FLOOR_CONCRETE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="260" viewBox="0 0 1600 260">
  <defs>
    <linearGradient id="concreteFloorGrad169" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="260" fill="url(#concreteFloorGrad169)"/>
  <line x1="380" y1="0" x2="280" y2="260" stroke="#334155" stroke-width="2"/>
  <line x1="800" y1="0" x2="800" y2="260" stroke="#334155" stroke-width="2"/>
  <line x1="1220" y1="0" x2="1320" y2="260" stroke="#334155" stroke-width="2"/>
  <line x1="0" y1="120" x2="1600" y2="120" stroke="#334155" stroke-width="2"/>
</svg>
`);

// Miniaturas Visuais Prontas para Seleção
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
