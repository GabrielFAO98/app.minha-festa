// Texturas Realistas para Paredes e Pisos do Cenário 4:3 (1200 x 900)
import { svgToDataUrl } from './presets-data.js';

// 1. Parede Boiserie Clássica Branca / Off-White
export const TEXTURE_WALL_BOISERIE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
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
  <!-- Fundo da Parede -->
  <rect width="1200" height="630" fill="url(#wallLight)"/>
  <!-- Faixa de moldura superior -->
  <rect x="0" y="40" width="1200" height="12" fill="#e2e8f0" opacity="0.6"/>
  <rect x="0" y="42" width="1200" height="6" fill="#cbd5e1" opacity="0.4"/>
  <!-- Painéis Boiserie Grandes (Esquerdo, Centro-Esquerdo, Centro-Direito, Direito) -->
  <g filter="url(#moldingShadow)">
    <!-- Painel 1 -->
    <rect x="60" y="80" width="230" height="490" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="74" y="94" width="202" height="462" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <!-- Painel 2 -->
    <rect x="340" y="80" width="230" height="490" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="354" y="94" width="202" height="462" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <!-- Painel 3 -->
    <rect x="620" y="80" width="230" height="490" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="634" y="94" width="202" height="462" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
    <!-- Painel 4 -->
    <rect x="900" y="80" width="240" height="490" rx="4" fill="none" stroke="#cbd5e1" stroke-width="7"/>
    <rect x="914" y="94" width="212" height="462" rx="2" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.6"/>
  </g>
  <!-- Rodapé de Parede Clássico -->
  <rect x="0" y="605" width="1200" height="25" fill="#f1f5f9"/>
  <rect x="0" y="605" width="1200" height="5" fill="#cbd5e1"/>
</svg>
`);

// 2. Parede Tijolinho Branco / Subway Tile
export const TEXTURE_WALL_BRICK = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="brickPattern" width="120" height="60" patternUnits="userSpaceOnUse">
      <rect width="120" height="60" fill="#e2e8f0"/>
      <!-- Tijolo linha 1 -->
      <rect x="2" y="2" width="116" height="26" rx="2" fill="#ffffff"/>
      <rect x="4" y="4" width="112" height="22" rx="1" fill="#f8fafc" opacity="0.6"/>
      <!-- Tijolo linha 2 intercalado -->
      <rect x="-58" y="32" width="116" height="26" rx="2" fill="#ffffff"/>
      <rect x="62" y="32" width="116" height="26" rx="2" fill="#ffffff"/>
      <rect x="64" y="34" width="112" height="22" rx="1" fill="#f8fafc" opacity="0.6"/>
    </pattern>
    <radialGradient id="brickVignette" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="70%" stop-color="#64748b" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#334155" stop-opacity="0.3"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#brickPattern)"/>
  <rect width="1200" height="630" fill="url(#brickVignette)"/>
  <!-- Rodapé -->
  <rect x="0" y="612" width="1200" height="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
</svg>
`);

// 3. Parede Cortina Voil com Luzinhas / Fairy Lights
export const TEXTURE_WALL_FAIRY_LIGHTS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="curtainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#2e1065"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </linearGradient>
    <radialGradient id="lightBulb" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#eab308" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Tecido de Cortina Escura Aveludada -->
  <rect width="1200" height="630" fill="url(#curtainGrad)"/>
  <!-- Ondulações da Cortina Voil -->
  <g opacity="0.15">
    <path d="M 0 0 C 80 150 120 450 0 630 L 100 630 C 220 450 180 150 100 0 Z" fill="#ffffff"/>
    <path d="M 200 0 C 280 150 320 450 200 630 L 300 630 C 420 450 380 150 300 0 Z" fill="#ffffff"/>
    <path d="M 400 0 C 480 150 520 450 400 630 L 500 630 C 620 450 580 150 500 0 Z" fill="#ffffff"/>
    <path d="M 600 0 C 680 150 720 450 600 630 L 700 630 C 820 450 780 150 700 0 Z" fill="#ffffff"/>
    <path d="M 800 0 C 880 150 920 450 800 630 L 900 630 C 1020 450 980 150 900 0 Z" fill="#ffffff"/>
    <path d="M 1000 0 C 1080 150 1120 450 1000 630 L 1100 630 C 1220 450 1180 150 1100 0 Z" fill="#ffffff"/>
  </g>
  <!-- Cordões de Micro-Lâmpadas Suspensas (Fairy Lights) -->
  <g>
    <!-- Fios Verticais -->
    <line x1="120" y1="0" x2="120" y2="580" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="280" y1="0" x2="280" y2="600" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="440" y1="0" x2="440" y2="590" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="600" y1="0" x2="600" y2="570" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="760" y1="0" x2="760" y2="610" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="920" y1="0" x2="920" y2="580" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <line x1="1080" y1="0" x2="1080" y2="600" stroke="#fef08a" stroke-width="1" opacity="0.3"/>
    <!-- Lâmpadas Cintilantes -->
    <circle cx="120" cy="80" r="16" fill="url(#lightBulb)"/>
    <circle cx="120" cy="200" r="14" fill="url(#lightBulb)"/>
    <circle cx="120" cy="340" r="16" fill="url(#lightBulb)"/>
    <circle cx="120" cy="480" r="14" fill="url(#lightBulb)"/>

    <circle cx="280" cy="110" r="18" fill="url(#lightBulb)"/>
    <circle cx="280" cy="250" r="15" fill="url(#lightBulb)"/>
    <circle cx="280" cy="390" r="17" fill="url(#lightBulb)"/>
    <circle cx="280" cy="520" r="14" fill="url(#lightBulb)"/>

    <circle cx="440" cy="70" r="15" fill="url(#lightBulb)"/>
    <circle cx="440" cy="220" r="18" fill="url(#lightBulb)"/>
    <circle cx="440" cy="370" r="16" fill="url(#lightBulb)"/>
    <circle cx="440" cy="500" r="15" fill="url(#lightBulb)"/>

    <circle cx="600" cy="120" r="18" fill="url(#lightBulb)"/>
    <circle cx="600" cy="260" r="16" fill="url(#lightBulb)"/>
    <circle cx="600" cy="400" r="17" fill="url(#lightBulb)"/>

    <circle cx="760" cy="90" r="16" fill="url(#lightBulb)"/>
    <circle cx="760" cy="230" r="18" fill="url(#lightBulb)"/>
    <circle cx="760" cy="360" r="15" fill="url(#lightBulb)"/>
    <circle cx="760" cy="490" r="16" fill="url(#lightBulb)"/>

    <circle cx="920" cy="130" r="17" fill="url(#lightBulb)"/>
    <circle cx="920" cy="270" r="15" fill="url(#lightBulb)"/>
    <circle cx="920" cy="420" r="18" fill="url(#lightBulb)"/>

    <circle cx="1080" cy="100" r="16" fill="url(#lightBulb)"/>
    <circle cx="1080" cy="240" r="17" fill="url(#lightBulb)"/>
    <circle cx="1080" cy="380" r="15" fill="url(#lightBulb)"/>
  </g>
</svg>
`);

// 4. Parede Painel Ripado de Madeira Nobre
export const TEXTURE_WALL_WOOD_SLATS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="slatPattern" width="30" height="630" patternUnits="userSpaceOnUse">
      <rect width="30" height="630" fill="#1c1917"/>
      <!-- Ripa de madeira -->
      <rect x="2" y="0" width="22" height="630" fill="#78350f"/>
      <rect x="3" y="0" width="3" height="630" fill="#9a3412" opacity="0.6"/>
      <rect x="20" y="0" width="4" height="630" fill="#451a03" opacity="0.8"/>
    </pattern>
    <linearGradient id="slatLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#slatPattern)"/>
  <rect width="1200" height="630" fill="url(#slatLight)"/>
  <rect x="0" y="615" width="1200" height="15" fill="#451a03"/>
</svg>
`);

// 5. Parede Cimento Queimado
export const TEXTURE_WALL_CONCRETE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="concreteGrad" cx="45%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.5   0 0 0 0 0.5   0 0 0 0 0.5  0 0 0 0.08 0"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#concreteGrad)"/>
  <rect width="1200" height="630" filter="url(#noiseFilter)"/>
  <rect x="0" y="618" width="1200" height="12" fill="#1e293b"/>
</svg>
`);

// 6. Parede Estúdio Clean Off-White
export const TEXTURE_WALL_CLEAN = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="cleanStudio" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#fdf4ff"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#cleanStudio)"/>
  <rect x="0" y="615" width="1200" height="15" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
</svg>
`);

// --- PISOS COM PERSPECTIVA 2.5D (1200 x 270) ---

// 1. Piso Madeira Vinílica Carvalho Nobre (2.5D)
export const TEXTURE_FLOOR_WOOD = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="270" viewBox="0 0 1200 270">
  <defs>
    <linearGradient id="woodFloorLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="40%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
  </defs>
  <!-- Base Madeira -->
  <rect width="1200" height="270" fill="url(#woodFloorLight)"/>
  <!-- Linhas de perspectiva das tábuas corridas convergindo para o fundo -->
  <g stroke="#78350f" stroke-width="2" opacity="0.75">
    <line x1="50" y1="0" x2="-100" y2="270"/>
    <line x1="180" y1="0" x2="60" y2="270"/>
    <line x1="310" y1="0" x2="230" y2="270"/>
    <line x1="440" y1="0" x2="390" y2="270"/>
    <line x1="570" y1="0" x2="550" y2="270"/>
    <line x1="630" y1="0" x2="650" y2="270"/>
    <line x1="760" y1="0" x2="810" y2="270"/>
    <line x1="890" y1="0" x2="970" y2="270"/>
    <line x1="1020" y1="0" x2="1140" y2="270"/>
    <line x1="1150" y1="0" x2="1300" y2="270"/>
  </g>
  <!-- Tábuas horizontais com espaçamento de perspectiva -->
  <line x1="0" y1="35" x2="1200" y2="35" stroke="#451a03" stroke-width="1.5" opacity="0.4"/>
  <line x1="0" y1="85" x2="1200" y2="85" stroke="#451a03" stroke-width="2" opacity="0.5"/>
  <line x1="0" y1="150" x2="1200" y2="150" stroke="#451a03" stroke-width="2.5" opacity="0.6"/>
  <line x1="0" y1="230" x2="1200" y2="230" stroke="#451a03" stroke-width="3" opacity="0.7"/>
  <!-- Brilho de reflexo suave no piso de madeira -->
  <rect width="1200" height="50" fill="#fef3c7" opacity="0.08"/>
</svg>
`);

// 2. Piso Porcelanato Marmorizado Carrara Polido (2.5D)
export const TEXTURE_FLOOR_MARBLE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="270" viewBox="0 0 1200 270">
  <defs>
    <linearGradient id="marbleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="270" fill="url(#marbleGrad)"/>
  <!-- Veios de mármore cinza suaves -->
  <g stroke="#cbd5e1" stroke-width="3" fill="none" opacity="0.6">
    <path d="M 50 0 Q 120 80 80 180 T 150 270"/>
    <path d="M 400 0 Q 360 90 420 170 T 380 270"/>
    <path d="M 750 0 Q 820 100 780 190 T 840 270"/>
    <path d="M 1100 0 Q 1040 120 1120 270"/>
  </g>
  <!-- Rejuntes com perspectiva de grandes placas de porcelanato 120x120 -->
  <g stroke="#cbd5e1" stroke-width="1.5" opacity="0.8">
    <line x1="150" y1="0" x2="50" y2="270"/>
    <line x1="450" y1="0" x2="400" y2="270"/>
    <line x1="750" y1="0" x2="790" y2="270"/>
    <line x1="1050" y1="0" x2="1140" y2="270"/>
    <line x1="0" y1="70" x2="1200" y2="70"/>
    <line x1="0" y1="165" x2="1200" y2="165"/>
  </g>
  <!-- Reflexo de Luz Especular -->
  <ellipse cx="600" cy="50" rx="350" ry="25" fill="#ffffff" opacity="0.4"/>
</svg>
`);

// 3. Piso Grama Sintética Jardim (2.5D)
export const TEXTURE_FLOOR_GRASS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="270" viewBox="0 0 1200 270">
  <defs>
    <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="50%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <pattern id="grassBlades" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="3" fill="#22c55e" opacity="0.3"/>
      <circle cx="15" cy="15" r="2.5" fill="#15803d" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="1200" height="270" fill="url(#grassGrad)"/>
  <rect width="1200" height="270" fill="url(#grassBlades)"/>
  <!-- Sombra na junção do rodapé com o chão -->
  <rect width="1200" height="20" fill="#052e16" opacity="0.5"/>
</svg>
`);

// 4. Piso Cimento Queimado / Concreto Polido (2.5D)
export const TEXTURE_FLOOR_CONCRETE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="270" viewBox="0 0 1200 270">
  <defs>
    <linearGradient id="concreteFloorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="270" fill="url(#concreteFloorGrad)"/>
  <!-- Linhas sutis de dilatação de placas de concreto -->
  <line x1="300" y1="0" x2="220" y2="270" stroke="#334155" stroke-width="2"/>
  <line x1="600" y1="0" x2="600" y2="270" stroke="#334155" stroke-width="2"/>
  <line x1="900" y1="0" x2="980" y2="270" stroke="#334155" stroke-width="2"/>
  <line x1="0" y1="120" x2="1200" y2="120" stroke="#334155" stroke-width="2"/>
</svg>
`);

// Catálogo de Ambientes Prontos Realistas
export const REALISTIC_ENVIRONMENTS = [
  {
    id: 'boiserie-wood',
    name: 'Clássico Boiserie & Madeira',
    category: 'luxo',
    wallTexture: TEXTURE_WALL_BOISERIE,
    floorTexture: TEXTURE_FLOOR_WOOD,
    wallColor: '#f8fafc',
    floorColor: '#92400e'
  },
  {
    id: 'brick-marble',
    name: 'Tijolinho & Mármore Carrara',
    category: 'moderno',
    wallTexture: TEXTURE_WALL_BRICK,
    floorTexture: TEXTURE_FLOOR_MARBLE,
    wallColor: '#ffffff',
    floorColor: '#f1f5f9'
  },
  {
    id: 'fairy-wood',
    name: 'Cortina de Luzes & Madeira',
    category: 'festas',
    wallTexture: TEXTURE_WALL_FAIRY_LIGHTS,
    floorTexture: TEXTURE_FLOOR_WOOD,
    wallColor: '#1e1b4b',
    floorColor: '#78350f'
  },
  {
    id: 'slats-grass',
    name: 'Ripado Nobre & Jardim/Grama',
    category: 'rustico',
    wallTexture: TEXTURE_WALL_WOOD_SLATS,
    floorTexture: TEXTURE_FLOOR_GRASS,
    wallColor: '#78350f',
    floorColor: '#16a34a'
  },
  {
    id: 'concrete-loft',
    name: 'Loft Cimento Queimado',
    category: 'industrial',
    wallTexture: TEXTURE_WALL_CONCRETE,
    floorTexture: TEXTURE_FLOOR_CONCRETE,
    wallColor: '#64748b',
    floorColor: '#334155'
  },
  {
    id: 'clean-marble',
    name: 'Estúdio Clean & Mármore',
    category: 'clean',
    wallTexture: TEXTURE_WALL_CLEAN,
    floorTexture: TEXTURE_FLOOR_MARBLE,
    wallColor: '#fdf4ff',
    floorColor: '#ffffff'
  }
];
