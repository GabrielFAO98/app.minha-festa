// Texturas Realistas para Cenrio VERTICAL (Proporo 9:16  1080 x 1920)
import { svgToDataUrl } from './presets-data.js';

// 1. Parede Boiserie Clssica Branca Vertical (1080 x 1380)
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
  <rect x="0" y="30" width="1080" height="16" fill="#e2e8f0" opacity="0.6"/>
  <g filter="url(#moldingShadowVert)">
    <rect x="50" y="80" width="280" height="850" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="68" y="98" width="244" height="814" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="50" y="960" width="280" height="360" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="68" y="978" width="244" height="324" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>

    <rect x="400" y="80" width="280" height="850" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="418" y="98" width="244" height="814" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="400" y="960" width="280" height="360" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="418" y="978" width="244" height="324" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>

    <rect x="750" y="80" width="280" height="850" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="768" y="98" width="244" height="814" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <rect x="750" y="960" width="280" height="360" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="768" y="978" width="244" height="324" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
  </g>
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

// 3. Parede Cortina Voil Iluminada com Varal de Led (1080 x 1380)
export const TEXTURE_WALL_FAIRY_LIGHTS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <radialGradient id="curtainWarmGlow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="50%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </radialGradient>
    <filter id="fairyGlowVert" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="1080" height="1380" fill="url(#curtainWarmGlow)"/>
  <g opacity="0.25">
    <line x1="90" y1="0" x2="90" y2="1380" stroke="#f59e0b" stroke-width="14"/>
    <line x1="270" y1="0" x2="270" y2="1380" stroke="#f59e0b" stroke-width="14"/>
    <line x1="450" y1="0" x2="450" y2="1380" stroke="#f59e0b" stroke-width="14"/>
    <line x1="630" y1="0" x2="630" y2="1380" stroke="#f59e0b" stroke-width="14"/>
    <line x1="810" y1="0" x2="810" y2="1380" stroke="#f59e0b" stroke-width="14"/>
    <line x1="990" y1="0" x2="990" y2="1380" stroke="#f59e0b" stroke-width="14"/>
  </g>
  <!-- Cordões de Led com Pontos Brilhantes -->
  <g filter="url(#fairyGlowVert)" fill="#fef08a" opacity="0.9">
    <circle cx="90" cy="180" r="10"/><circle cx="90" cy="420" r="10"/><circle cx="90" cy="720" r="10"/><circle cx="90" cy="1020" r="10"/>
    <circle cx="270" cy="120" r="10"/><circle cx="270" cy="360" r="10"/><circle cx="270" cy="660" r="10"/><circle cx="270" cy="960" r="10"/>
    <circle cx="450" cy="220" r="10"/><circle cx="450" cy="500" r="10"/><circle cx="450" cy="800" r="10"/><circle cx="450" cy="1100" r="10"/>
    <circle cx="630" cy="150" r="10"/><circle cx="630" cy="400" r="10"/><circle cx="630" cy="700" r="10"/><circle cx="630" cy="1000" r="10"/>
    <circle cx="810" cy="240" r="10"/><circle cx="810" cy="520" r="10"/><circle cx="810" cy="820" r="10"/><circle cx="810" cy="1120" r="10"/>
    <circle cx="990" cy="170" r="10"/><circle cx="990" cy="440" r="10"/><circle cx="990" cy="740" r="10"/><circle cx="990" cy="1040" r="10"/>
  </g>
  <rect x="0" y="1350" width="1080" height="30" fill="#fde68a" opacity="0.7"/>
</svg>
`);

// 4. Parede Muro Inglês / Folhagens Ficus Verde (1080 x 1380)
export const TEXTURE_WALL_GREENERY = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <radialGradient id="greenVignette" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="60%" stop-color="#166534"/>
      <stop offset="100%" stop-color="#14532d"/>
    </radialGradient>
    <pattern id="leafPattern" width="60" height="60" patternUnits="userSpaceOnUse">
      <ellipse cx="15" cy="15" rx="12" ry="7" transform="rotate(30 15 15)" fill="#22c55e" opacity="0.4"/>
      <ellipse cx="45" cy="20" rx="14" ry="8" transform="rotate(-40 45 20)" fill="#16a34a" opacity="0.6"/>
      <ellipse cx="25" cy="45" rx="13" ry="7" transform="rotate(15 25 45)" fill="#4ade80" opacity="0.3"/>
      <ellipse cx="50" cy="48" rx="11" ry="6" transform="rotate(-25 50 48)" fill="#15803d" opacity="0.7"/>
    </pattern>
  </defs>
  <rect width="1080" height="1380" fill="url(#greenVignette)"/>
  <rect width="1080" height="1380" fill="url(#leafPattern)"/>
  <rect x="0" y="1355" width="1080" height="25" fill="#14532d" stroke="#166534" stroke-width="1"/>
</svg>
`);

// 5. Parede Ripado Madeira Vertical (1080 x 1380)
export const TEXTURE_WALL_WOOD_SLATS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <linearGradient id="slatWoodVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="50%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <pattern id="slatPatVert" width="72" height="1380" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="12" height="1380" fill="#451a03"/>
      <rect x="12" y="0" width="60" height="1380" fill="url(#slatWoodVert)"/>
      <line x1="12" y1="0" x2="12" y2="1380" stroke="#fef3c7" stroke-width="1" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="1080" height="1380" fill="url(#slatPatVert)"/>
  <rect x="0" y="1348" width="1080" height="32" fill="#451a03"/>
</svg>
`);

// 6. Parede Cimento Queimado Vertical (1080 x 1380)
export const TEXTURE_WALL_CONCRETE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1380" viewBox="0 0 1080 1380">
  <defs>
    <radialGradient id="loftCementVert" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="60%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1380" fill="url(#loftCementVert)"/>
  <rect x="0" y="1350" width="1080" height="30" fill="#1e293b"/>
</svg>
`);

// 7. Parede Estúdio Clean Off-White Vertical (1080 x 1380)
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
    <line x1="540" y1="0" x2="200" y2="540"/>
    <line x1="540" y1="0" x2="380" y2="540"/>
    <line x1="540" y1="0" x2="540" y2="540"/>
    <line x1="540" y1="0" x2="700" y2="540"/>
    <line x1="540" y1="0" x2="880" y2="540"/>
  </g>
  <line x1="0" y1="120" x2="1080" y2="120" stroke="#451a03" stroke-width="3" opacity="0.6"/>
  <line x1="0" y1="280" x2="1080" y2="280" stroke="#451a03" stroke-width="3" opacity="0.6"/>
  <line x1="0" y1="460" x2="1080" y2="460" stroke="#451a03" stroke-width="4" opacity="0.8"/>
  <rect width="1080" height="35" fill="#000000" opacity="0.35"/>
</svg>
`);

// 2. Piso Mármore Carrara Vertical
export const TEXTURE_FLOOR_MARBLE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="540" viewBox="0 0 1080 540">
  <defs>
    <linearGradient id="marbleGradVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="540" fill="url(#marbleGradVert)"/>
  <g stroke="#94a3b8" stroke-width="2" opacity="0.6">
    <line x1="540" y1="0" x2="140" y2="540"/>
    <line x1="540" y1="0" x2="340" y2="540"/>
    <line x1="540" y1="0" x2="540" y2="540"/>
    <line x1="540" y1="0" x2="740" y2="540"/>
    <line x1="540" y1="0" x2="940" y2="540"/>
  </g>
  <line x1="0" y1="130" x2="1080" y2="130" stroke="#cbd5e1" stroke-width="2.5"/>
  <line x1="0" y1="300" x2="1080" y2="300" stroke="#cbd5e1" stroke-width="3"/>
  <line x1="0" y1="480" x2="1080" y2="480" stroke="#94a3b8" stroke-width="3.5"/>
  <rect width="1080" height="30" fill="#000000" opacity="0.2"/>
</svg>
`);

// 3. Piso Grama / Jardim Vertical
export const TEXTURE_FLOOR_GRASS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="540" viewBox="0 0 1080 540">
  <defs>
    <linearGradient id="grassGradVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="60%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="540" fill="url(#grassGradVert)"/>
  <rect width="1080" height="35" fill="#000000" opacity="0.3"/>
</svg>
`);

// 4. Piso Cimento Polido Vertical
export const TEXTURE_FLOOR_CONCRETE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="540" viewBox="0 0 1080 540">
  <defs>
    <linearGradient id="floorConcGradVert" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="540" fill="url(#floorConcGradVert)"/>
  <rect width="1080" height="35" fill="#000000" opacity="0.3"/>
</svg>
`);

// Lista de Cenários Pré-Configurados Prontos
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
    id: 'fairy-wood',
    name: 'Cortina Luzes & Madeira',
    category: 'Festas',
    wallTexture: TEXTURE_WALL_FAIRY_LIGHTS,
    floorTexture: TEXTURE_FLOOR_WOOD,
    previewThumb: TEXTURE_WALL_FAIRY_LIGHTS
  },
  {
    id: 'greenery-grass',
    name: 'Muro Inglês & Gramado',
    category: 'Jardim',
    wallTexture: TEXTURE_WALL_GREENERY,
    floorTexture: TEXTURE_FLOOR_GRASS,
    previewThumb: TEXTURE_WALL_GREENERY
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
    id: 'slats-grass',
    name: 'Ripado & Gramado',
    category: 'Rústico',
    wallTexture: TEXTURE_WALL_WOOD_SLATS,
    floorTexture: TEXTURE_FLOOR_GRASS,
    previewThumb: TEXTURE_WALL_WOOD_SLATS
  },
  {
    id: 'clean-marble',
    name: 'Estúdio Clean',
    category: 'Minimalista',
    wallTexture: TEXTURE_WALL_CLEAN,
    floorTexture: TEXTURE_FLOOR_MARBLE,
    previewThumb: TEXTURE_WALL_CLEAN
  },
  {
    id: 'concrete-loft',
    name: 'Cimento Queimado',
    category: 'Industrial',
    wallTexture: TEXTURE_WALL_CONCRETE,
    floorTexture: TEXTURE_FLOOR_CONCRETE,
    previewThumb: TEXTURE_WALL_CONCRETE
  }
];

export const WALL_OPTIONS = [
  { id: 'wall-boiserie', name: 'Boiserie Branca', texture: TEXTURE_WALL_BOISERIE },
  { id: 'wall-fairy', name: 'Cortina Luzinhas', texture: TEXTURE_WALL_FAIRY_LIGHTS },
  { id: 'wall-greenery', name: 'Muro Inglês Verde', texture: TEXTURE_WALL_GREENERY },
  { id: 'wall-brick', name: 'Tijolinho Branco', texture: TEXTURE_WALL_BRICK },
  { id: 'wall-slats', name: 'Painel Ripado', texture: TEXTURE_WALL_WOOD_SLATS },
  { id: 'wall-clean', name: 'Estúdio Clean', texture: TEXTURE_WALL_CLEAN },
  { id: 'wall-concrete', name: 'Cimento Queimado', texture: TEXTURE_WALL_CONCRETE }
];

export const FLOOR_OPTIONS = [
  { id: 'floor-wood', name: 'Madeira Carvalho', texture: TEXTURE_FLOOR_WOOD },
  { id: 'floor-marble', name: 'Mármore Carrara', texture: TEXTURE_FLOOR_MARBLE },
  { id: 'floor-grass', name: 'Grama / Jardim', texture: TEXTURE_FLOOR_GRASS },
  { id: 'floor-concrete', name: 'Cimento Polido', texture: TEXTURE_FLOOR_CONCRETE }
];
