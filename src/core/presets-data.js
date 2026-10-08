// Ilustrações SVG e dados técnicos dos Presets de Fábrica do Pegue-Monte

// Função auxiliar para gerar Data URI de SVG
export function svgToDataUrl(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

// 1. Painel Redondo (150cm)
export const SVG_PANEL_ROUND = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="300" height="380">
  <defs>
    <radialGradient id="roundBaseGrad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fdf4ff"/>
      <stop offset="70%" stop-color="#fae8ff"/>
      <stop offset="100%" stop-color="#f0abfc"/>
    </radialGradient>
    <filter id="shadowCircle" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>
  <!-- Pés do Painel em Ferro -->
  <line x1="150" y1="280" x2="150" y2="370" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
  <line x1="80" y1="370" x2="220" y2="370" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
  <line x1="100" y1="370" x2="150" y2="330" stroke="#475569" stroke-width="4"/>
  <line x1="200" y1="370" x2="150" y2="330" stroke="#475569" stroke-width="4"/>
  <!-- Aro Redondo -->
  <circle cx="150" cy="150" r="140" fill="url(#roundBaseGrad)" stroke="#cbd5e1" stroke-width="4" filter="url(#shadowCircle)"/>
  <circle cx="150" cy="150" r="136" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="150" y="155" font-family="sans-serif" font-size="14" font-weight="bold" fill="#a855f7" text-anchor="middle" opacity="0.6">PAINEL REDONDO 150cm</text>
</svg>
`;

// 2. Painel Arco Romano (100x200cm)
export const SVG_PANEL_ARCH = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 380" width="200" height="380">
  <defs>
    <linearGradient id="archGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </linearGradient>
    <filter id="shadowArch" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-opacity="0.15"/>
    </filter>
  </defs>
  <!-- Pé do Arco -->
  <line x1="30" y1="370" x2="170" y2="370" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
  <!-- Estrutura Arqueada -->
  <path d="M 20 370 L 20 100 A 80 80 0 0 1 180 100 L 180 370 Z" fill="url(#archGrad)" stroke="#f59e0b" stroke-width="3" filter="url(#shadowArch)"/>
  <path d="M 30 365 L 30 105 A 70 70 0 0 1 170 105 L 170 365" fill="none" stroke="#fcd34d" stroke-width="2" stroke-dasharray="5,4"/>
  <text x="100" y="180" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b45309" text-anchor="middle" opacity="0.6">ARCO ROMANO</text>
</svg>
`;

// 3. Painel Ripado / Pallet
export const SVG_PANEL_SLAT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 360" width="260" height="360">
  <defs>
    <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
  </defs>
  <!-- Ripas de Madeira Verticais -->
  <g fill="url(#woodGrad)" stroke="#78350f" stroke-width="1.5">
    <rect x="20" y="20" width="20" height="320" rx="3"/>
    <rect x="44" y="20" width="20" height="320" rx="3"/>
    <rect x="68" y="20" width="20" height="320" rx="3"/>
    <rect x="92" y="20" width="20" height="320" rx="3"/>
    <rect x="116" y="20" width="20" height="320" rx="3"/>
    <rect x="140" y="20" width="20" height="320" rx="3"/>
    <rect x="164" y="20" width="20" height="320" rx="3"/>
    <rect x="188" y="20" width="20" height="320" rx="3"/>
    <rect x="212" y="20" width="20" height="320" rx="3"/>
  </g>
  <!-- Travessas Horizontais Atrás -->
  <rect x="15" y="80" width="222" height="14" fill="#78350f" opacity="0.8"/>
  <rect x="15" y="260" width="222" height="14" fill="#78350f" opacity="0.8"/>
</svg>
`;

// 4. Cilindro G (Grande)
export const SVG_CYLINDER_G = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="160" height="220">
  <defs>
    <linearGradient id="cylGGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="25%" stop-color="#ffffff"/>
      <stop offset="80%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <!-- Corpo do Cilindro -->
  <path d="M 15 35 L 15 195 A 65 20 0 0 0 145 195 L 145 35 Z" fill="url(#cylGGrad)" stroke="#94a3b8" stroke-width="2"/>
  <!-- Tampo Superior Elipse -->
  <ellipse cx="80" cy="35" rx="65" ry="20" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
  <text x="80" y="115" font-family="sans-serif" font-size="13" font-weight="bold" fill="#64748b" text-anchor="middle">CILINDRO G</text>
  <text x="80" y="132" font-family="sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">50x80cm</text>
</svg>
`;

// 5. Cilindro M (Médio)
export const SVG_CYLINDER_M = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180">
  <defs>
    <linearGradient id="cylMGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fdf4ff"/>
      <stop offset="25%" stop-color="#ffffff"/>
      <stop offset="80%" stop-color="#f5d0fe"/>
      <stop offset="100%" stop-color="#e879f9"/>
    </linearGradient>
  </defs>
  <!-- Corpo do Cilindro -->
  <path d="M 15 30 L 15 155 A 55 16 0 0 0 125 155 L 125 30 Z" fill="url(#cylMGrad)" stroke="#c084fc" stroke-width="2"/>
  <!-- Tampo Superior Elipse -->
  <ellipse cx="70" cy="30" rx="55" ry="16" fill="#fae8ff" stroke="#c084fc" stroke-width="2"/>
  <text x="70" y="95" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9333ea" text-anchor="middle">CILINDRO M</text>
  <text x="70" y="112" font-family="sans-serif" font-size="9" fill="#a855f7" text-anchor="middle">44x58cm</text>
</svg>
`;

// 6. Cilindro P (Pequeno)
export const SVG_CYLINDER_P = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="120" height="150">
  <defs>
    <linearGradient id="cylPGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f0fdf4"/>
      <stop offset="25%" stop-color="#ffffff"/>
      <stop offset="80%" stop-color="#bbf7d0"/>
      <stop offset="100%" stop-color="#86efac"/>
    </linearGradient>
  </defs>
  <!-- Corpo do Cilindro -->
  <path d="M 15 25 L 15 130 A 45 14 0 0 0 105 130 L 105 25 Z" fill="url(#cylPGrad)" stroke="#4ade80" stroke-width="2"/>
  <!-- Tampo Superior Elipse -->
  <ellipse cx="60" cy="25" rx="45" ry="14" fill="#dcfce7" stroke="#4ade80" stroke-width="2"/>
  <text x="60" y="80" font-family="sans-serif" font-size="11" font-weight="bold" fill="#16a34a" text-anchor="middle">CILINDRO P</text>
  <text x="60" y="95" font-family="sans-serif" font-size="8" fill="#15803d" text-anchor="middle">38x45cm</text>
</svg>
`;

// 7. Mesa Cavalete Madeira Pinus
export const SVG_TABLE_EASEL = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 190" width="280" height="190">
  <defs>
    <linearGradient id="tableTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <!-- Cavalete Esquerdo -->
  <line x1="45" y1="35" x2="25" y2="180" stroke="#c2410c" stroke-width="7" stroke-linecap="round"/>
  <line x1="45" y1="35" x2="70" y2="180" stroke="#c2410c" stroke-width="7" stroke-linecap="round"/>
  <line x1="30" y1="120" x2="65" y2="120" stroke="#9a3412" stroke-width="5"/>
  <!-- Cavalete Direito -->
  <line x1="235" y1="35" x2="210" y2="180" stroke="#c2410c" stroke-width="7" stroke-linecap="round"/>
  <line x1="235" y1="35" x2="255" y2="180" stroke="#c2410c" stroke-width="7" stroke-linecap="round"/>
  <line x1="215" y1="120" x2="250" y2="120" stroke="#9a3412" stroke-width="5"/>
  <!-- Tampo da Mesa -->
  <rect x="10" y="20" width="260" height="20" rx="4" fill="url(#tableTopGrad)" stroke="#9a3412" stroke-width="2"/>
  <rect x="15" y="22" width="250" height="5" fill="#ffedd5" opacity="0.6"/>
  <text x="140" y="105" font-family="sans-serif" font-size="11" font-weight="bold" fill="#9a3412" text-anchor="middle">MESA CAVALETE 120cm</text>
</svg>
`;

// 8. Cômoda Bombê
export const SVG_DRESSER_BOMBE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180" width="220" height="180">
  <defs>
    <linearGradient id="bombeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
  </defs>
  <!-- Pés curvados -->
  <path d="M 30 140 Q 20 170 15 175" stroke="#64748b" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M 190 140 Q 200 170 205 175" stroke="#64748b" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- Corpo Bombê Arredondado -->
  <path d="M 25 35 Q 10 90 25 145 L 195 145 Q 210 90 195 35 Z" fill="url(#bombeGrad)" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Tampo Superior -->
  <path d="M 20 35 Q 110 30 200 35 L 195 24 Q 110 20 25 24 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
  <!-- Gavetas e Puxadores Dourados -->
  <line x1="32" y1="70" x2="188" y2="70" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="32" y1="108" x2="188" y2="108" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="90" cy="52" r="4" fill="#f59e0b"/>
  <circle cx="130" cy="52" r="4" fill="#f59e0b"/>
  <circle cx="90" cy="88" r="4" fill="#f59e0b"/>
  <circle cx="130" cy="88" r="4" fill="#f59e0b"/>
  <circle cx="90" cy="126" r="4" fill="#f59e0b"/>
  <circle cx="130" cy="126" r="4" fill="#f59e0b"/>
  <text x="110" y="165" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="middle">CÔMODA BOMBÊ</text>
</svg>
`;

// 9. Arco de Balões Orgânico Desconstruído
export const SVG_BALLOONS_ARCH = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" width="240" height="280">
  <defs>
    <radialGradient id="balloonPink" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fbcfe8"/>
      <stop offset="60%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#db2777"/>
    </radialGradient>
    <radialGradient id="balloonGold" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </radialGradient>
    <radialGradient id="balloonWhite" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
  </defs>
  <!-- Aglomerado Orgânico de Balões em Curva L -->
  <g>
    <!-- Balões de Fundo -->
    <circle cx="35" cy="240" r="28" fill="url(#balloonPink)"/>
    <circle cx="50" cy="190" r="32" fill="url(#balloonWhite)"/>
    <circle cx="45" cy="135" r="30" fill="url(#balloonGold)"/>
    <circle cx="65" cy="85" r="35" fill="url(#balloonPink)"/>
    <circle cx="115" cy="50" r="36" fill="url(#balloonWhite)"/>
    <circle cx="170" cy="40" r="32" fill="url(#balloonGold)"/>
    <circle cx="215" cy="55" r="24" fill="url(#balloonPink)"/>
    <!-- Balões Frontais Menores de Acabamento -->
    <circle cx="65" cy="225" r="18" fill="url(#balloonGold)"/>
    <circle cx="75" cy="165" r="19" fill="url(#balloonPink)"/>
    <circle cx="90" cy="115" r="22" fill="url(#balloonWhite)"/>
    <circle cx="145" cy="70" r="20" fill="url(#balloonPink)"/>
    <circle cx="190" cy="65" r="16" fill="url(#balloonWhite)"/>
    <circle cx="40" cy="100" r="14" fill="url(#balloonGold)"/>
    <circle cx="25" cy="160" r="15" fill="url(#balloonWhite)"/>
  </g>
</svg>
`;

// 10. Suporte de Bolo / Boleira Cerâmica
export const SVG_CAKE_STAND = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100" height="80">
  <defs>
    <linearGradient id="ceramicGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
  </defs>
  <!-- Pé da Boleira -->
  <ellipse cx="50" cy="72" rx="28" ry="7" fill="#fb923c"/>
  <path d="M 46 45 L 44 68 Q 50 72 56 68 L 54 45 Z" fill="#fdba74"/>
  <!-- Prato Superior -->
  <path d="M 8 40 Q 50 50 92 40 L 90 35 Q 50 44 10 35 Z" fill="#fb923c"/>
  <ellipse cx="50" cy="35" rx="42" ry="12" fill="url(#ceramicGrad)" stroke="#f97316" stroke-width="1.5"/>
</svg>
`;

// 11. Bandeja Provençal Retangular
export const SVG_TRAY_RECT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" width="120" height="60">
  <rect x="10" y="20" width="100" height="28" rx="6" fill="#fdf4ff" stroke="#d946ef" stroke-width="2"/>
  <rect x="14" y="24" width="92" height="20" rx="3" fill="#ffffff" stroke="#f0abfc" stroke-width="1"/>
  <circle cx="18" cy="34" r="3" fill="#c084fc"/>
  <circle cx="102" cy="34" r="3" fill="#c084fc"/>
  <!-- Pézinhos -->
  <circle cx="20" cy="48" r="3" fill="#d946ef"/>
  <circle cx="100" cy="48" r="3" fill="#d946ef"/>
</svg>
`;

// 12. Display de Chão - Personagem / Número
export const SVG_FLOOR_DISPLAY = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" width="120" height="180">
  <!-- Apoio Traseiro Pezinho MDF -->
  <path d="M 45 130 L 75 130 L 60 178 Z" fill="#b45309" opacity="0.4"/>
  <!-- Silhueta Personagem / Ursinho Estilizado -->
  <g fill="#f59e0b" stroke="#b45309" stroke-width="2">
    <!-- Orelhas -->
    <circle cx="42" cy="42" r="14" fill="#d97706"/>
    <circle cx="78" cy="42" r="14" fill="#d97706"/>
    <!-- Cabeça -->
    <circle cx="60" cy="65" r="30" fill="#fbbf24"/>
    <!-- Olhos e Focinho -->
    <circle cx="50" cy="60" r="3" fill="#451a03"/>
    <circle cx="70" cy="60" r="3" fill="#451a03"/>
    <ellipse cx="60" cy="72" rx="9" ry="6" fill="#fef3c7"/>
    <circle cx="60" cy="69" r="2.5" fill="#451a03"/>
    <!-- Gravatinha Borboleta -->
    <path d="M 52 92 L 68 100 L 68 84 Z" fill="#ec4899"/>
    <path d="M 68 92 L 52 100 L 52 84 Z" fill="#ec4899"/>
    <circle cx="60" cy="92" r="3" fill="#be185d"/>
    <!-- Corpo -->
    <ellipse cx="60" cy="125" rx="32" ry="35" fill="#fbbf24"/>
    <ellipse cx="60" cy="125" rx="20" ry="24" fill="#fef3c7"/>
  </g>
  <!-- Base de Apoio -->
  <rect x="25" y="172" width="70" height="6" rx="2" fill="#78350f"/>
</svg>
`;

// 13. Vaso com Arranjo de Flores
export const SVG_VASE_FLOWERS = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" width="100" height="130">
  <!-- Flores e Folhas no Topo -->
  <circle cx="40" cy="35" r="16" fill="#f43f5e"/>
  <circle cx="60" cy="30" r="18" fill="#fb7185"/>
  <circle cx="50" cy="45" r="15" fill="#fda4af"/>
  <circle cx="50" cy="35" r="7" fill="#fef08a"/>
  <!-- Folhinhas Verdes -->
  <path d="M 25 35 Q 20 20 30 15 Q 40 25 35 40 Z" fill="#22c55e"/>
  <path d="M 75 35 Q 85 20 75 15 Q 65 25 70 40 Z" fill="#16a34a"/>
  <!-- Vaso Cerâmica Dourado / Rosê -->
  <path d="M 38 60 L 62 60 L 68 115 Q 50 120 32 115 Z" fill="#d97706" stroke="#b45309" stroke-width="2"/>
  <ellipse cx="50" cy="60" rx="14" ry="4" fill="#f59e0b"/>
</svg>
`;

// Banco de Presets Base com Dados em CM
export const DEFAULT_PRESET_ITEMS = [
  {
    id: 'preset-painel-redondo',
    name: 'Painel Redondo 150cm',
    category: 'paineis',
    type: 'panel_round',
    widthCm: 150,
    heightCm: 150,
    previewUrl: svgToDataUrl(SVG_PANEL_ROUND),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 50
  },
  {
    id: 'preset-arco-romano',
    name: 'Painel Arco Romano 100x200cm',
    category: 'paineis',
    type: 'panel_arch',
    widthCm: 100,
    heightCm: 200,
    previewUrl: svgToDataUrl(SVG_PANEL_ARCH),
    isCustom: false,
    stockQuantity: 2,
    rentalPrice: 45
  },
  {
    id: 'preset-painel-ripado',
    name: 'Painel Ripado Pinus 180x200cm',
    category: 'paineis',
    type: 'generic',
    widthCm: 180,
    heightCm: 200,
    previewUrl: svgToDataUrl(SVG_PANEL_SLAT),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 60
  },
  {
    id: 'preset-cilindro-g',
    name: 'Cilindro G (50x80cm)',
    category: 'cilindros',
    type: 'cylinder',
    widthCm: 50,
    heightCm: 80,
    previewUrl: svgToDataUrl(SVG_CYLINDER_G),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 25
  },
  {
    id: 'preset-cilindro-m',
    name: 'Cilindro M (44x58cm)',
    category: 'cilindros',
    type: 'cylinder',
    widthCm: 44,
    heightCm: 58,
    previewUrl: svgToDataUrl(SVG_CYLINDER_M),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 20
  },
  {
    id: 'preset-cilindro-p',
    name: 'Cilindro P (38x45cm)',
    category: 'cilindros',
    type: 'cylinder',
    widthCm: 38,
    heightCm: 45,
    previewUrl: svgToDataUrl(SVG_CYLINDER_P),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 15
  },
  {
    id: 'preset-mesa-cavalete',
    name: 'Mesa Cavalete Pinus 120x80cm',
    category: 'mesas',
    type: 'table',
    widthCm: 120,
    heightCm: 80,
    previewUrl: svgToDataUrl(SVG_TABLE_EASEL),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 40
  },
  {
    id: 'preset-comoda-bombe',
    name: 'Cômoda Bombê Branca',
    category: 'mesas',
    type: 'table',
    widthCm: 90,
    heightCm: 80,
    previewUrl: svgToDataUrl(SVG_DRESSER_BOMBE),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 50
  },
  {
    id: 'preset-arco-baloes',
    name: 'Arco de Balões Desconstruído',
    category: 'baloes',
    type: 'generic',
    widthCm: 180,
    heightCm: 180,
    previewUrl: svgToDataUrl(SVG_BALLOONS_ARCH),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 80
  },
  {
    id: 'preset-boleira',
    name: 'Boleira Alta Cerâmica 30cm',
    category: 'acessorios',
    type: 'generic',
    widthCm: 30,
    heightCm: 20,
    previewUrl: svgToDataUrl(SVG_CAKE_STAND),
    isCustom: false,
    stockQuantity: 2,
    rentalPrice: 15
  },
  {
    id: 'preset-bandeja',
    name: 'Bandeja Provençal 25cm',
    category: 'acessorios',
    type: 'generic',
    widthCm: 25,
    heightCm: 15,
    previewUrl: svgToDataUrl(SVG_TRAY_RECT),
    isCustom: false,
    stockQuantity: 4,
    rentalPrice: 10
  },
  {
    id: 'preset-display-chao',
    name: 'Display de Chão MDF Ursinho',
    category: 'displays',
    type: 'display',
    widthCm: 45,
    heightCm: 70,
    previewUrl: svgToDataUrl(SVG_FLOOR_DISPLAY),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 20
  },
  {
    id: 'preset-vaso-flores',
    name: 'Vaso com Arranjo Floral',
    category: 'acessorios',
    type: 'generic',
    widthCm: 25,
    heightCm: 40,
    previewUrl: svgToDataUrl(SVG_VASE_FLOWERS),
    isCustom: false,
    stockQuantity: 2,
    rentalPrice: 18
  }
];

// Presets de Capas e Estampas de Demonstração
export const DEFAULT_THEME_COVERS = [
  {
    id: 'cover-safari-1',
    themeName: 'Safári Baby',
    name: 'Folhagens & Selva',
    targetType: 'all',
    imageUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#ecfdf5"/>
        <circle cx="200" cy="200" r="160" fill="#d1fae5"/>
        <path d="M 80 320 Q 140 220 200 320 Q 260 220 320 320 Z" fill="#059669" opacity="0.8"/>
        <path d="M 120 350 Q 200 240 280 350 Z" fill="#10b981"/>
        <circle cx="200" cy="160" r="50" fill="#f59e0b"/>
        <text x="200" y="270" font-family="sans-serif" font-size="24" font-weight="bold" fill="#065f46" text-anchor="middle">SAFÁRI BABY</text>
      </svg>
    `)
  },
  {
    id: 'cover-astronauta-1',
    themeName: 'Astronauta & Espaço',
    name: 'Galáxia Estrelada',
    targetType: 'all',
    imageUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#0f172a"/>
        <circle cx="120" cy="140" r="45" fill="#38bdf8" opacity="0.9"/>
        <circle cx="310" cy="260" r="28" fill="#f43f5e" opacity="0.8"/>
        <circle cx="80" cy="80" r="3" fill="#ffffff"/>
        <circle cx="300" cy="90" r="4" fill="#ffffff"/>
        <circle cx="200" cy="320" r="3" fill="#ffffff"/>
        <circle cx="340" cy="180" r="2" fill="#ffffff"/>
        <text x="200" y="220" font-family="sans-serif" font-size="24" font-weight="bold" fill="#e0f2fe" text-anchor="middle">GALAXY PARTY</text>
      </svg>
    `)
  },
  {
    id: 'cover-boho-1',
    themeName: 'Flores Boho',
    name: 'Aquarela Romântica',
    targetType: 'all',
    imageUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#fff1f2"/>
        <circle cx="200" cy="200" r="140" fill="#ffe4e6"/>
        <circle cx="160" cy="180" r="60" fill="#fb7185" opacity="0.6"/>
        <circle cx="230" cy="210" r="55" fill="#fda4af" opacity="0.7"/>
        <circle cx="200" cy="170" r="40" fill="#f43f5e" opacity="0.5"/>
        <text x="200" y="280" font-family="sans-serif" font-size="22" font-weight="bold" fill="#9f1239" text-anchor="middle">JARDIM BOHO</text>
      </svg>
    `)
  },
  {
    id: 'cover-candy-1',
    themeName: 'Candy Colors',
    name: 'Arco-Íris Pastel',
    targetType: 'all',
    imageUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#fdf4ff"/>
        <!-- Faixas arco-íris pastel -->
        <path d="M 40 400 A 180 180 0 0 1 360 400" fill="none" stroke="#fbcfe8" stroke-width="28"/>
        <path d="M 68 400 A 152 152 0 0 1 332 400" fill="none" stroke="#fed7aa" stroke-width="28"/>
        <path d="M 96 400 A 124 124 0 0 1 304 400" fill="none" stroke="#fef08a" stroke-width="28"/>
        <path d="M 124 400 A 96 96 0 0 1 276 400" fill="none" stroke="#bbf7d0" stroke-width="28"/>
        <path d="M 152 400 A 68 68 0 0 1 248 400" fill="none" stroke="#bae6fd" stroke-width="28"/>
        <text x="200" y="380" font-family="sans-serif" font-size="20" font-weight="bold" fill="#db2777" text-anchor="middle">CANDY COLORS</text>
      </svg>
    `)
  },
  {
    id: 'cover-dourado-1',
    themeName: 'Luxo Glamour',
    name: 'Glitter Dourado & Branco',
    targetType: 'all',
    imageUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <defs>
          <radialGradient id="glamGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="60%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#a16207"/>
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="#18181b"/>
        <circle cx="200" cy="200" r="160" fill="none" stroke="url(#glamGold)" stroke-width="8"/>
        <circle cx="200" cy="200" r="145" fill="none" stroke="#ca8a04" stroke-width="2" stroke-dasharray="8,6"/>
        <text x="200" y="208" font-family="sans-serif" font-size="26" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="4">GLAMOUR</text>
      </svg>
    `)
  }
];
