// Ilustraes SVG e dados tcnicos dos Presets de Fbrica do Pegue-Monte
import { generateBalloonArchDataUrl } from './balloon-generator.js';

// Funo auxiliar para gerar Data URI de SVG
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
  <line x1="150" y1="280" x2="150" y2="370" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
  <line x1="80" y1="370" x2="220" y2="370" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
  <line x1="100" y1="370" x2="150" y2="330" stroke="#475569" stroke-width="4"/>
  <line x1="200" y1="370" x2="150" y2="330" stroke="#475569" stroke-width="4"/>
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
  <line x1="30" y1="370" x2="170" y2="370" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
  <path d="M 20 370 L 20 100 A 80 80 0 0 1 180 100 L 180 370 Z" fill="url(#archGrad)" stroke="#f59e0b" stroke-width="3" filter="url(#shadowArch)"/>
  <path d="M 30 365 L 30 105 A 70 70 0 0 1 170 105 L 170 365" fill="none" stroke="#fcd34d" stroke-width="2" stroke-dasharray="5,4"/>
  <text x="100" y="180" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b45309" text-anchor="middle" opacity="0.6">ARCO ROMANO</text>
</svg>
`;

// 3. Painel Ripado Pinus (180x200cm)
export const SVG_PANEL_SLAT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 360" width="260" height="360">
  <defs>
    <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
  </defs>
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
  <rect x="15" y="80" width="222" height="14" fill="#78350f" opacity="0.8"/>
  <rect x="15" y="260" width="222" height="14" fill="#78350f" opacity="0.8"/>
</svg>
`;

// // 4. Cilindro G (Grande 50x80cm)
export const SVG_CYLINDER_G = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="160" height="220">
  <defs>
    <linearGradient id="cylGGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="25%" stop-color="#ffffff"/>
      <stop offset="80%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="shadowCylG" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-opacity="0.16"/>
    </filter>
  </defs>
  <path d="M 15 35 L 15 195 A 65 12 0 0 0 145 195 L 145 35 Z" fill="url(#cylGGrad)" stroke="#94a3b8" stroke-width="2" filter="url(#shadowCylG)"/>
  <ellipse cx="80" cy="35" rx="65" ry="12" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
  <text x="80" y="115" font-family="sans-serif" font-size="13" font-weight="bold" fill="#64748b" text-anchor="middle">CILINDRO G</text>
  <text x="80" y="132" font-family="sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">50x80cm</text>
</svg>
`;

// 5. Cilindro M (Médio 44x58cm)
export const SVG_CYLINDER_M = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 190" width="150" height="190">
  <defs>
    <linearGradient id="cylMGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="25%" stop-color="#ffffff"/>
      <stop offset="80%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="shadowCylM" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.16"/>
    </filter>
  </defs>
  <path d="M 15 30 L 15 165 A 60 11 0 0 0 135 165 L 135 30 Z" fill="url(#cylMGrad)" stroke="#94a3b8" stroke-width="2" filter="url(#shadowCylM)"/>
  <ellipse cx="75" cy="30" rx="60" ry="11" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
  <text x="75" y="100" font-family="sans-serif" font-size="12" font-weight="bold" fill="#64748b" text-anchor="middle">CILINDRO M</text>
  <text x="75" y="116" font-family="sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">44x58cm</text>
</svg>
`;

// 6. Cilindro P (Pequeno 38x45cm)
export const SVG_CYLINDER_P = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 160" width="140" height="160">
  <defs>
    <linearGradient id="cylPGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="25%" stop-color="#ffffff"/>
      <stop offset="80%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="shadowCylP" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.16"/>
    </filter>
  </defs>
  <path d="M 15 25 L 15 140 A 55 10 0 0 0 125 140 L 125 25 Z" fill="url(#cylPGrad)" stroke="#94a3b8" stroke-width="2" filter="url(#shadowCylP)"/>
  <ellipse cx="70" cy="25" rx="55" ry="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
  <text x="70" y="85" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">CILINDRO P</text>
  <text x="70" y="100" font-family="sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">38x45cm</text>
</svg>
`;

// 7. Cilindro Canelado / Ripado Dourado Luxo (NOVO)
export const SVG_CYLINDER_FLUTED = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="160" height="220">
  <defs>
    <linearGradient id="goldSlatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="20%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#eab308"/>
      <stop offset="70%" stop-color="#a16207"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>
    <filter id="shadowCylGold" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-opacity="0.2"/>
    </filter>
  </defs>
  <path d="M 15 35 L 15 195 A 65 12 0 0 0 145 195 L 145 35 Z" fill="url(#goldSlatGrad)" stroke="#854d0e" stroke-width="2" filter="url(#shadowCylGold)"/>
  <ellipse cx="80" cy="35" rx="65" ry="12" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <!-- Frisos canelados 3D -->
  <line x1="35" y1="42" x2="35" y2="199" stroke="#713f12" stroke-width="2" opacity="0.6"/>
  <line x1="55" y1="45" x2="55" y2="205" stroke="#713f12" stroke-width="2" opacity="0.6"/>
  <line x1="80" y1="47" x2="80" y2="207" stroke="#713f12" stroke-width="2" opacity="0.6"/>
  <line x1="105" y1="45" x2="105" y2="205" stroke="#713f12" stroke-width="2" opacity="0.6"/>
  <line x1="125" y1="42" x2="125" y2="199" stroke="#713f12" stroke-width="2" opacity="0.6"/>
  <text x="80" y="125" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle" style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);">CANELADO LUXO</text>
</svg>
`;

// 8. Mesa Cavalete Madeira Pinus (120x80cm)
export const SVG_TABLE_EASEL = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <defs>
    <linearGradient id="easelWood" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect x="20" y="30" width="240" height="16" rx="3" fill="url(#easelWood)" stroke="#78350f" stroke-width="2"/>
  <line x1="45" y1="46" x2="25" y2="165" stroke="#92400e" stroke-width="7" stroke-linecap="round"/>
  <line x1="45" y1="46" x2="65" y2="165" stroke="#92400e" stroke-width="7" stroke-linecap="round"/>
  <line x1="28" y1="120" x2="62" y2="120" stroke="#78350f" stroke-width="4"/>
  <line x1="235" y1="46" x2="215" y2="165" stroke="#92400e" stroke-width="7" stroke-linecap="round"/>
  <line x1="235" y1="46" x2="255" y2="165" stroke="#92400e" stroke-width="7" stroke-linecap="round"/>
  <line x1="218" y1="120" x2="252" y2="120" stroke="#78350f" stroke-width="4"/>
  <text x="140" y="42" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">MESA CAVALETE 120cm</text>
</svg>
`;

// 9. Cmoda Bomb Branca (90x80cm)
export const SVG_DRESSER_BOMBE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" width="200" height="180">
  <defs>
    <linearGradient id="bombeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect x="25" y="30" width="150" height="12" rx="3" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
  <path d="M 30 42 Q 15 85 25 135 L 175 135 Q 185 85 170 42 Z" fill="url(#bombeGrad)" stroke="#94a3b8" stroke-width="2"/>
  <path d="M 35 135 Q 30 165 20 170" fill="none" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
  <path d="M 165 135 Q 170 165 180 170" fill="none" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
  <line x1="30" y1="72" x2="170" y2="72" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="28" y1="104" x2="172" y2="104" stroke="#cbd5e1" stroke-width="1.5"/>
  <circle cx="100" cy="57" r="4" fill="#f59e0b"/>
  <circle cx="100" cy="88" r="4" fill="#f59e0b"/>
  <circle cx="100" cy="119" r="4" fill="#f59e0b"/>
  <text x="100" y="24" font-family="sans-serif" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle">CMODA BOMB</text>
</svg>
`;

// 10. Bolo Fake Cenogrfico 3 Andares (NOVO)
export const SVG_CAKE_FAKE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 220" width="180" height="220">
  <defs>
    <linearGradient id="cakeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fdf4ff"/>
      <stop offset="100%" stop-color="#f5d0fe"/>
    </linearGradient>
    <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
  </defs>
  <!-- Prato da base -->
  <ellipse cx="90" cy="205" rx="80" ry="12" fill="#cbd5e1"/>
  <!-- Andar 1 (Inferior) -->
  <path d="M 30 150 L 30 195 A 60 14 0 0 0 150 195 L 150 150 Z" fill="url(#cakeGrad)" stroke="#f0abfc" stroke-width="1.5"/>
  <ellipse cx="90" cy="150" rx="60" ry="14" fill="#ffffff" stroke="#f0abfc" stroke-width="1.5"/>
  <rect x="30" y="185" width="120" height="8" rx="2" fill="url(#goldRibbon)"/>
  <!-- Andar 2 (Meio) -->
  <path d="M 45 105 L 45 145 A 45 11 0 0 0 135 145 L 135 105 Z" fill="url(#cakeGrad)" stroke="#f0abfc" stroke-width="1.5"/>
  <ellipse cx="90" cy="105" rx="45" ry="11" fill="#ffffff" stroke="#f0abfc" stroke-width="1.5"/>
  <rect x="45" y="137" width="90" height="7" rx="2" fill="url(#goldRibbon)"/>
  <!-- Andar 3 (Topo) -->
  <path d="M 60 65 L 60 100 A 30 8 0 0 0 120 100 L 120 65 Z" fill="url(#cakeGrad)" stroke="#f0abfc" stroke-width="1.5"/>
  <ellipse cx="90" cy="65" rx="30" ry="8" fill="#ffffff" stroke="#f0abfc" stroke-width="1.5"/>
  <rect x="60" y="94" width="60" height="6" rx="2" fill="url(#goldRibbon)"/>
  <!-- Enfeite de Topo (Flor / Esfera Dourada) -->
  <circle cx="90" cy="50" r="10" fill="url(#goldRibbon)"/>
  <text x="90" y="175" font-family="sans-serif" font-size="9" font-weight="bold" fill="#c084fc" text-anchor="middle">BOLO FAKE</text>
</svg>
`;

// 11. Tapete Oval Juta / Boho em Perspectiva de Chão (160x70cm)
export const SVG_RUG_OVAL = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="280" height="120">
  <defs>
    <radialGradient id="rugOvalGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="65%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#d97706"/>
    </radialGradient>
    <filter id="shadowRugOval" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-opacity="0.18"/>
    </filter>
  </defs>
  <ellipse cx="140" cy="60" rx="133" ry="53" fill="url(#rugOvalGrad)" stroke="#b45309" stroke-width="2" filter="url(#shadowRugOval)"/>
  <ellipse cx="140" cy="60" rx="114" ry="44" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="6,4"/>
  <ellipse cx="140" cy="60" rx="90" ry="34" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4,3"/>
  <ellipse cx="140" cy="60" rx="60" ry="22" fill="none" stroke="#b45309" stroke-width="1"/>
  <text x="140" y="64" font-family="sans-serif" font-size="10" font-weight="bold" fill="#92400e" text-anchor="middle">TAPETE OVAL 160x70cm</text>
</svg>
`;
export const SVG_RUG_ROUND = SVG_RUG_OVAL;

// 11b. Tapete Completamente Redondo Sublimado 1:1 (150x150cm)
export const SVG_RUG_ROUND_FLAT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" width="260" height="260">
  <defs>
    <radialGradient id="rugRoundGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <filter id="shadowRugRound" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity="0.16"/>
    </filter>
  </defs>
  <circle cx="130" cy="130" r="126" fill="url(#rugRoundGrad)" stroke="#94a3b8" stroke-width="2" filter="url(#shadowRugRound)"/>
  <circle cx="130" cy="130" r="120" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6,4"/>
  <circle cx="130" cy="130" r="95" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="5,4"/>
  <circle cx="130" cy="130" r="60" fill="none" stroke="#cbd5e1" stroke-width="1"/>
  <text x="130" y="126" font-family="sans-serif" font-size="12" font-weight="bold" fill="#64748b" text-anchor="middle">TAPETE REDONDO</text>
  <text x="130" y="142" font-family="sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">150x150cm</text>
</svg>
`;

// 11c. Tapete Retangular em Perspectiva 3D de Piso (200x120cm)
export const SVG_RUG_RECT_3D = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 140" width="280" height="140">
  <defs>
    <linearGradient id="rug3DGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="40%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadowRug3D" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity="0.2"/>
    </filter>
  </defs>
  <!-- Base trapezoidal em perspectiva de chão -->
  <path d="M 10 125 L 35 15 L 245 15 L 270 125 Z" fill="url(#rug3DGrad)" stroke="#94a3b8" stroke-width="2" filter="url(#shadowRug3D)"/>
  <!-- Costura dupla em perspectiva -->
  <path d="M 18 118 L 40 22 L 240 22 L 262 118 Z" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Linhas decorativas transversais em perspectiva -->
  <line x1="28" y1="70" x2="252" y2="70" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="140" y="66" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">TAPETE RETANGULAR 3D</text>
  <text x="140" y="82" font-family="sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">200x120cm</text>
</svg>
`;

// 12. Luminoso LED Neon Nmero 1 Dourado (NOVO)
export const SVG_LED_NEON_1 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 220" width="140" height="220">
  <defs>
    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Base de Acrlico -->
  <rect x="25" y="195" width="90" height="15" rx="4" fill="#1e293b" stroke="#ca8a04" stroke-width="2"/>
  <!-- Fita Neon Nmero 1 com Glow Intenso -->
  <path d="M 45 60 L 75 35 L 75 195 M 50 195 L 100 195" 
        fill="none" stroke="#fde047" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" filter="url(#neonGlow)"/>
  <path d="M 45 60 L 75 35 L 75 195 M 50 195 L 100 195" 
        fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// 13. Boleira Alta de Cermica (30cm)
export const SVG_CAKE_STAND = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 140" width="160" height="140">
  <ellipse cx="80" cy="35" rx="65" ry="16" fill="#fdf4ff" stroke="#f0abfc" stroke-width="2"/>
  <ellipse cx="80" cy="32" rx="63" ry="14" fill="#ffffff"/>
  <path d="M 72 45 L 68 115 L 92 115 L 88 45 Z" fill="#f5d0fe" stroke="#e879f9" stroke-width="1.5"/>
  <ellipse cx="80" cy="118" rx="35" ry="10" fill="#fdf4ff" stroke="#f0abfc" stroke-width="2"/>
  <text x="80" y="37" font-family="sans-serif" font-size="8" font-weight="bold" fill="#c084fc" text-anchor="middle">BOLEIRA 30cm</text>
</svg>
`;

// 14. Bandeja Provenal Retangular (25cm)
export const SVG_TRAY_RECT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" width="160" height="90">
  <rect x="20" y="25" width="120" height="50" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
  <rect x="26" y="31" width="108" height="38" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <rect x="10" y="42" width="10" height="16" rx="3" fill="#cbd5e1"/>
  <rect x="140" y="42" width="10" height="16" rx="3" fill="#cbd5e1"/>
  <text x="80" y="54" font-family="sans-serif" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">BANDEJA 25cm</text>
</svg>
`;

// 15. Display de Cho MDF Ursinho (45x70cm)
export const SVG_FLOOR_DISPLAY = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 190" width="140" height="190">
  <defs>
    <linearGradient id="bearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>
  </defs>
  <line x1="30" y1="185" x2="110" y2="185" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="70" cy="120" rx="42" ry="50" fill="url(#bearGrad)" stroke="#c2410c" stroke-width="2"/>
  <circle cx="70" cy="65" r="34" fill="url(#bearGrad)" stroke="#c2410c" stroke-width="2"/>
  <circle cx="45" cy="40" r="12" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
  <circle cx="95" cy="40" r="12" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
  <circle cx="58" cy="60" r="4" fill="#431407"/>
  <circle cx="82" cy="60" r="4" fill="#431407"/>
  <ellipse cx="70" cy="74" rx="12" ry="9" fill="#ffedd5"/>
  <ellipse cx="70" cy="70" rx="5" ry="3" fill="#431407"/>
  <text x="70" y="130" font-family="sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">DISPLAY MDF</text>
</svg>
`;

// 16. Vaso com Arranjo Floral Alto (25x40cm)
export const SVG_VASE_FLOWERS = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" width="120" height="180">
  <defs>
    <linearGradient id="vaseGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
  </defs>
  <path d="M 45 95 L 40 165 A 20 6 0 0 0 80 165 L 75 95 Z" fill="url(#vaseGold)" stroke="#854d0e" stroke-width="1.5"/>
  <ellipse cx="60" cy="95" rx="16" ry="6" fill="#fef08a"/>
  <!-- Folhagens e Flores no Topo -->
  <circle cx="60" cy="60" r="22" fill="#f43f5e" opacity="0.9"/>
  <circle cx="42" cy="72" r="18" fill="#fb7185" opacity="0.9"/>
  <circle cx="78" cy="72" r="18" fill="#fda4af" opacity="0.9"/>
  <circle cx="60" cy="42" r="16" fill="#fbcfe8"/>
  <circle cx="60" cy="58" r="7" fill="#fbbf24"/>
  <text x="60" y="145" font-family="sans-serif" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">FLORAL</text>
</svg>
`;

// Lista Principal de Presets de Fbrica
export const DEFAULT_PRESET_ITEMS = [
  {
    id: 'preset-painel-redondo',
    name: 'Painel Redondo 150cm',
    category: 'paineis',
    type: 'panel_round',
    widthCm: 150,
    heightCm: 190,
    previewUrl: svgToDataUrl(SVG_PANEL_ROUND),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 60
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
    stockQuantity: 1,
    rentalPrice: 55
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
    rentalPrice: 70
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
    rentalPrice: 30
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
    rentalPrice: 25
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
    rentalPrice: 20
  },
  {
    id: 'preset-cilindro-canelado',
    name: 'Cilindro Canelado Dourado Luxo',
    category: 'cilindros',
    type: 'cylinder',
    widthCm: 50,
    heightCm: 80,
    previewUrl: svgToDataUrl(SVG_CYLINDER_FLUTED),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 40
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
    rentalPrice: 45
  },
  {
    id: 'preset-comoda-bombe',
    name: 'Cmoda Bomb Branca',
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
    name: 'Arco de Bales Desconstrudo',
    category: 'baloes',
    type: 'balloon_arch',
    balloonColors: ['#db2777', '#fbcfe8', '#eab308', '#ffffff'],
    widthCm: 180,
    heightCm: 190,
    previewUrl: generateBalloonArchDataUrl(['#db2777', '#fbcfe8', '#eab308', '#ffffff']),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 80
  },
  {
    id: 'preset-bolo-fake',
    name: 'Bolo Fake Cenogrfico 3 Andares',
    category: 'acessorios',
    type: 'generic',
    widthCm: 40,
    heightCm: 50,
    previewUrl: svgToDataUrl(SVG_CAKE_FAKE),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 45
  },
  {
    id: 'preset-tapete-oval',
    name: 'Tapete Oval em Perspectiva (160x70cm)',
    category: 'tapetes',
    type: 'rug_oval',
    widthCm: 160,
    heightCm: 70,
    previewUrl: svgToDataUrl(SVG_RUG_OVAL),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 35
  },
  {
    id: 'preset-tapete-redondo',
    name: 'Tapete Redondo Sublimado (150x150cm)',
    category: 'tapetes',
    type: 'rug_round',
    widthCm: 150,
    heightCm: 150,
    previewUrl: svgToDataUrl(SVG_RUG_ROUND_FLAT),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 40
  },
  {
    id: 'preset-tapete-retangular-3d',
    name: 'Tapete Retangular 3D Passadeira (200x120cm)',
    category: 'tapetes',
    type: 'rug_rect_3d',
    widthCm: 200,
    heightCm: 120,
    previewUrl: svgToDataUrl(SVG_RUG_RECT_3D),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 45
  },
  {
    id: 'preset-luminoso-led',
    name: 'Luminoso LED Neon Nmero 1 Dourado',
    category: 'displays',
    type: 'display',
    widthCm: 35,
    heightCm: 60,
    previewUrl: svgToDataUrl(SVG_LED_NEON_1),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 30
  },
  {
    id: 'preset-boleira',
    name: 'Boleira Alta Cermica 30cm',
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
    name: 'Bandeja Provenal 25cm',
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
    name: 'Display de Cho MDF Ursinho',
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

// Presets de Capas e Estampas de Demonstrao
export const DEFAULT_THEME_COVERS = [
  {
    id: 'cover-safari-1',
    themeName: 'Safri Baby',
    name: 'Folhagens & Selva',
    targetType: 'all',
    imageUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#ecfdf5"/>
        <circle cx="200" cy="200" r="160" fill="#d1fae5"/>
        <path d="M 80 320 Q 140 220 200 320 Q 260 220 320 320 Z" fill="#059669" opacity="0.8"/>
        <path d="M 120 350 Q 200 240 280 350 Z" fill="#10b981"/>
        <circle cx="200" cy="160" r="50" fill="#f59e0b"/>
        <text x="200" y="270" font-family="sans-serif" font-size="24" font-weight="bold" fill="#065f46" text-anchor="middle">SAFRI BABY</text>
      </svg>
    `)
  },
  {
    id: 'cover-astronauta-1',
    themeName: 'Astronauta & Espao',
    name: 'Galxia Estrelada',
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
    name: 'Aquarela Romntica',
    targetType: 'all',
    imageUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#fff7ed"/>
        <circle cx="200" cy="200" r="160" fill="#ffedd5"/>
        <circle cx="150" cy="170" r="35" fill="#fb7185" opacity="0.7"/>
        <circle cx="250" cy="170" r="40" fill="#f43f5e" opacity="0.6"/>
        <circle cx="200" cy="220" r="45" fill="#fda4af" opacity="0.7"/>
        <text x="200" y="290" font-family="sans-serif" font-size="22" font-weight="bold" fill="#9f1239" text-anchor="middle">JARDIM ENCANTADO</text>
      </svg>
    `)
  },
  {
    id: 'cover-candy-1',
    themeName: 'Candy Colors',
    name: 'Arco-ris Pastel',
    targetType: 'all',
    imageUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#f0fdf4"/>
        <circle cx="200" cy="200" r="160" fill="#fef9c3"/>
        <path d="M 80 260 A 120 120 0 0 1 320 260" fill="none" stroke="#f472b6" stroke-width="16"/>
        <path d="M 100 260 A 100 100 0 0 1 300 260" fill="none" stroke="#c084fc" stroke-width="16"/>
        <path d="M 120 260 A 80 80 0 0 1 280 260" fill="none" stroke="#38bdf8" stroke-width="16"/>
        <text x="200" y="295" font-family="sans-serif" font-size="22" font-weight="bold" fill="#7c3aed" text-anchor="middle">CANDY PARTY</text>
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
        <rect width="400" height="400" fill="#0f172a"/>
        <circle cx="200" cy="200" r="160" fill="#1e293b"/>
        <circle cx="200" cy="200" r="150" fill="none" stroke="#eab308" stroke-width="3" stroke-dasharray="8,6"/>
        <circle cx="160" cy="140" r="6" fill="#fef08a"/>
        <circle cx="240" cy="150" r="8" fill="#fef08a"/>
        <circle cx="180" cy="250" r="7" fill="#fef08a"/>
        <text x="200" y="210" font-family="sans-serif" font-size="24" font-weight="bold" fill="#fef08a" text-anchor="middle">LUXO & OURO</text>
      </svg>
    `)
  }
];
