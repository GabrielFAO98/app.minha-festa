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

// 12. Luminoso LED Neon Número 1 Dourado Ultra-Realista (35x60cm)
export const SVG_LED_NEON_1 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 220" width="140" height="220">
  <defs>
    <filter id="neonOneGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="7" result="wideBlur"/>
      <feMerge>
        <feMergeNode in="wideBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="neonOneCore" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="coreBlur"/>
      <feMerge>
        <feMergeNode in="coreBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="screwGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <linearGradient id="neonBaseMetal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <!-- Sombra no Piso / Base -->
  <ellipse cx="70" cy="214" rx="46" ry="5.5" fill="#0f172a" opacity="0.3" filter="url(#neonOneCore)"/>

  <!-- Base de Apoio Metálica / Acrílico com Friso Dourado -->
  <rect x="24" y="202" width="92" height="12" rx="3.5" fill="url(#neonBaseMetal)" stroke="#ca8a04" stroke-width="1.5"/>
  <line x1="28" y1="204" x2="112" y2="204" stroke="#fef08a" stroke-width="0.8" opacity="0.6"/>

  <!-- Placa de Acrílico Cristal Silhuetada no Formato do Número 1 -->
  <path d="M 36 68 L 74 34 L 86 34 L 86 202 L 54 202 L 54 192 L 68 192 L 68 62 L 44 80 Z" 
        fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.45)" stroke-width="2" stroke-linejoin="round"/>

  <!-- Parafusos Cromados de Fixação da Fita -->
  <circle cx="68" cy="46" r="3.2" fill="url(#screwGrad)" stroke="#1e293b" stroke-width="0.6"/>
  <circle cx="78" cy="120" r="3.2" fill="url(#screwGrad)" stroke="#1e293b" stroke-width="0.6"/>
  <circle cx="78" cy="180" r="3.2" fill="url(#screwGrad)" stroke="#1e293b" stroke-width="0.6"/>

  <!-- Fita Neon Número 1: 1. Glow Difuso Amplo Quente (3000K) -->
  <g filter="url(#neonOneGlow)" opacity="0.9">
    <path d="M 44 66 L 74 42 L 74 200 M 52 200 L 96 200" 
          fill="none" stroke="#f59e0b" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Fita Neon: 2. Tubo de Silicone Flex Dourado -->
  <g filter="url(#neonOneCore)">
    <path d="M 44 66 L 74 42 L 74 200 M 52 200 L 96 200" 
          fill="none" stroke="#fde047" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Fita Neon: 3. Filamento Central Emissivo Branco Quente -->
  <path d="M 44 66 L 74 42 L 74 200 M 52 200 L 96 200" 
        fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
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

// 15. Display MDF Ursinho Teddy com Balão Metalizado (50x85cm)
export const SVG_DISPLAY_TEDDY_BALLOON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 260" width="180" height="260">
  <defs>
    <filter id="tdyShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.22 0"/>
    </filter>
    <filter id="balloonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#b45309" flood-opacity="0.25"/>
    </filter>
    <!-- Gradientes Pelúcia Urso -->
    <radialGradient id="tdyBodyGrad" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="45%" stop-color="#fba45c"/>
      <stop offset="85%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </radialGradient>
    <radialGradient id="tdyHeadGrad" cx="45%" cy="38%" r="55%">
      <stop offset="0%" stop-color="#ffedd5"/>
      <stop offset="45%" stop-color="#fba45c"/>
      <stop offset="85%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </radialGradient>
    <radialGradient id="tdySnoutGrad" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#fcd34d"/>
    </radialGradient>
    <radialGradient id="tdyCheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
    </radialGradient>
    <!-- Balão Dourado Metálico -->
    <radialGradient id="goldBalloonGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="55%" stop-color="#f59e0b"/>
      <stop offset="85%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </radialGradient>
    <!-- Fita de Cetim -->
    <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </linearGradient>
    <!-- Base MDF Madeira -->
    <linearGradient id="mdfBaseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="20%" stop-color="#92400e"/>
      <stop offset="50%" stop-color="#b45309"/>
      <stop offset="80%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
  </defs>

  <!-- Sombra Projetada no Chão -->
  <ellipse cx="90" cy="250" rx="68" ry="8" fill="#0f172a" opacity="0.22" filter="url(#tdyShadow)"/>
  <ellipse cx="90" cy="250" rx="42" ry="4.5" fill="#0f172a" opacity="0.3"/>

  <!-- Balão de Coração Flutuando -->
  <g filter="url(#balloonGlow)">
    <path d="M 142 62 Q 135 110 115 155" fill="none" stroke="#ca8a04" stroke-width="1.8" stroke-dasharray="4,2"/>
    <polygon points="142,62 138,67 146,67" fill="#b45309"/>
    <path d="M 142 58 C 142 58 116 38 116 22 C 116 11 126 3 137 3 C 141 3 145 6 147 9 C 149 6 153 3 157 3 C 168 3 178 11 178 22 C 178 38 152 58 152 58 Z" 
          fill="url(#goldBalloonGrad)" stroke="#b45309" stroke-width="0.8"/>
    <ellipse cx="132" cy="16" rx="6" ry="11" transform="rotate(-30 132 16)" fill="#ffffff" opacity="0.65"/>
    <circle cx="126" cy="27" r="2.5" fill="#ffffff" opacity="0.5"/>
  </g>

  <!-- Silhueta MDF com Borda Laser do Ursinho -->
  <g id="teddyTotem">
    <rect x="42" y="243" width="22" height="11" rx="2.5" fill="url(#mdfBaseGrad)" stroke="#451a03" stroke-width="1.2"/>
    <rect x="106" y="243" width="22" height="11" rx="2.5" fill="url(#mdfBaseGrad)" stroke="#451a03" stroke-width="1.2"/>

    <circle cx="56" cy="100" r="21" fill="url(#tdyHeadGrad)" stroke="#5c2e0b" stroke-width="2"/>
    <circle cx="56" cy="100" r="13" fill="#fdba74" opacity="0.85"/>
    <circle cx="114" cy="100" r="21" fill="url(#tdyHeadGrad)" stroke="#5c2e0b" stroke-width="2"/>
    <circle cx="114" cy="100" r="13" fill="#fdba74" opacity="0.85"/>

    <ellipse cx="50" cy="230" rx="20" ry="16" fill="url(#tdyBodyGrad)" stroke="#5c2e0b" stroke-width="2"/>
    <ellipse cx="50" cy="230" rx="12" ry="9" fill="#ffedd5" opacity="0.85"/>
    <circle cx="44" cy="222" r="3" fill="#d97706"/>
    <circle cx="50" cy="220" r="3" fill="#d97706"/>
    <circle cx="56" cy="222" r="3" fill="#d97706"/>

    <ellipse cx="120" cy="230" rx="20" ry="16" fill="url(#tdyBodyGrad)" stroke="#5c2e0b" stroke-width="2"/>
    <ellipse cx="120" cy="230" rx="12" ry="9" fill="#ffedd5" opacity="0.85"/>
    <circle cx="114" cy="222" r="3" fill="#d97706"/>
    <circle cx="120" cy="220" r="3" fill="#d97706"/>
    <circle cx="126" cy="222" r="3" fill="#d97706"/>

    <ellipse cx="85" cy="195" rx="44" ry="46" fill="url(#tdyBodyGrad)" stroke="#5c2e0b" stroke-width="2"/>
    <ellipse cx="85" cy="200" rx="28" ry="32" fill="#ffedd5" opacity="0.92"/>

    <ellipse cx="44" cy="180" rx="14" ry="24" transform="rotate(24 44 180)" fill="url(#tdyBodyGrad)" stroke="#5c2e0b" stroke-width="1.8"/>

    <ellipse cx="118" cy="168" rx="14" ry="24" transform="rotate(-32 118 168)" fill="url(#tdyBodyGrad)" stroke="#5c2e0b" stroke-width="1.8"/>
    <circle cx="126" cy="155" r="9" fill="#ffedd5"/>

    <ellipse cx="85" cy="132" rx="40" ry="36" fill="url(#tdyHeadGrad)" stroke="#5c2e0b" stroke-width="2"/>

    <circle cx="62" cy="142" r="11" fill="url(#tdyCheek)"/>
    <circle cx="108" cy="142" r="11" fill="url(#tdyCheek)"/>

    <ellipse cx="85" cy="145" rx="19" ry="14" fill="url(#tdySnoutGrad)" stroke="#d97706" stroke-width="1"/>
    <path d="M 80 137 Q 85 134 90 137 Q 92 143 85 146 Q 78 143 80 137 Z" fill="#451a03"/>
    <ellipse cx="83.5" cy="138" rx="2.2" ry="1.2" fill="#ffffff" opacity="0.6"/>
    <path d="M 85 146 L 85 151 M 81 150 Q 85 154 89 150" fill="none" stroke="#451a03" stroke-width="1.8" stroke-linecap="round"/>

    <ellipse cx="68" cy="126" rx="5" ry="6.5" fill="#261005"/>
    <circle cx="66.5" cy="124" r="2.2" fill="#ffffff"/>
    <circle cx="69.5" cy="127.5" r="1" fill="#ffffff"/>

    <ellipse cx="102" cy="126" rx="5" ry="6.5" fill="#261005"/>
    <circle cx="100.5" cy="124" r="2.2" fill="#ffffff"/>
    <circle cx="103.5" cy="127.5" r="1" fill="#ffffff"/>

    <g transform="translate(85, 164)">
      <path d="M -2 0 L -14 22 L -7 20 L 0 6 Z" fill="url(#ribbonGrad)"/>
      <path d="M 2 0 L 14 22 L 7 20 L 0 6 Z" fill="url(#ribbonGrad)"/>
      <path d="M 0 0 C -16 -12 -22 6 -4 4 Z" fill="url(#ribbonGrad)" stroke="#0891b2" stroke-width="0.8"/>
      <path d="M 0 0 C 16 -12 22 6 4 4 Z" fill="url(#ribbonGrad)" stroke="#0891b2" stroke-width="0.8"/>
      <circle cx="0" cy="1" r="4.5" fill="#cffafe" stroke="#0891b2" stroke-width="1"/>
    </g>
  </g>
</svg>
`;

// Retrocompatibilidade
export const SVG_FLOOR_DISPLAY = SVG_DISPLAY_TEDDY_BALLOON;

// 15B. Display MDF Leãozinho Safari Baby (55x75cm)
export const SVG_DISPLAY_SAFARI_LION = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <defs>
    <filter id="lionShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.22 0"/>
    </filter>
    <radialGradient id="lionBodyGrad" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#facc15"/>
      <stop offset="85%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </radialGradient>
    <radialGradient id="lionManeGrad" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="50%" stop-color="#ea580c"/>
      <stop offset="85%" stop-color="#c2410c"/>
      <stop offset="100%" stop-color="#7c2d12"/>
    </radialGradient>
    <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="50%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="60%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="mdfBaseGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="50%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
  </defs>

  <!-- Sombra no Piso -->
  <ellipse cx="100" cy="230" rx="76" ry="8" fill="#0f172a" opacity="0.22" filter="url(#lionShadow)"/>
  <ellipse cx="100" cy="230" rx="46" ry="4.5" fill="#0f172a" opacity="0.28"/>

  <!-- Base MDF -->
  <rect x="52" y="222" width="24" height="11" rx="2.5" fill="url(#mdfBaseGrad2)" stroke="#451a03" stroke-width="1.2"/>
  <rect x="124" y="222" width="24" height="11" rx="2.5" fill="url(#mdfBaseGrad2)" stroke="#451a03" stroke-width="1.2"/>

  <!-- Folhagens Tropicais Traseiras (Costela de Adão / Monstera) -->
  <g id="tropicalLeavesBack">
    <path d="M 52 225 C 20 215 10 185 18 160 C 26 138 52 146 58 175 C 62 195 56 220 52 225 Z" fill="url(#leafGrad1)" stroke="#14532d" stroke-width="1.2"/>
    <path d="M 28 170 C 22 168 20 178 30 182" fill="none" stroke="#14532d" stroke-width="1.5"/>
    <path d="M 32 155 C 28 152 24 162 36 166" fill="none" stroke="#14532d" stroke-width="1.5"/>
    <path d="M 148 225 C 180 215 190 185 182 160 C 174 138 148 146 142 175 C 138 195 144 220 148 225 Z" fill="url(#leafGrad2)" stroke="#14532d" stroke-width="1.2"/>
    <path d="M 172 170 C 178 168 180 178 170 182" fill="none" stroke="#14532d" stroke-width="1.5"/>
    <path d="M 168 155 C 172 152 176 162 164 166" fill="none" stroke="#14532d" stroke-width="1.5"/>
  </g>

  <!-- Corpo do Leãozinho -->
  <g id="lionBody">
    <ellipse cx="64" cy="208" rx="19" ry="14" fill="url(#lionBodyGrad)" stroke="#78350f" stroke-width="1.8"/>
    <circle cx="64" cy="209" r="8" fill="#fef9c3"/>
    <ellipse cx="136" cy="208" rx="19" ry="14" fill="url(#lionBodyGrad)" stroke="#78350f" stroke-width="1.8"/>
    <circle cx="136" cy="209" r="8" fill="#fef9c3"/>

    <ellipse cx="100" cy="180" rx="36" ry="38" fill="url(#lionBodyGrad)" stroke="#78350f" stroke-width="2"/>
    <ellipse cx="100" cy="186" rx="22" ry="26" fill="#fef9c3" opacity="0.95"/>

    <ellipse cx="82" cy="195" rx="11" ry="18" fill="url(#lionBodyGrad)" stroke="#78350f" stroke-width="1.8"/>
    <ellipse cx="82" cy="208" rx="9" ry="6" fill="#fef9c3"/>
    <ellipse cx="118" cy="195" rx="11" ry="18" fill="url(#lionBodyGrad)" stroke="#78350f" stroke-width="1.8"/>
    <ellipse cx="118" cy="208" rx="9" ry="6" fill="#fef9c3"/>
  </g>

  <!-- Juba Imponente e Fofa em Camadas -->
  <g id="lionMane">
    <circle cx="100" cy="98" r="54" fill="url(#lionManeGrad)" stroke="#7c2d12" stroke-width="2.2"/>
    <circle cx="62" cy="68" r="16" fill="url(#lionManeGrad)"/>
    <circle cx="100" cy="48" r="17" fill="url(#lionManeGrad)"/>
    <circle cx="138" cy="68" r="16" fill="url(#lionManeGrad)"/>
    <circle cx="152" cy="98" r="16" fill="url(#lionManeGrad)"/>
    <circle cx="140" cy="130" r="16" fill="url(#lionManeGrad)"/>
    <circle cx="100" cy="148" r="17" fill="url(#lionManeGrad)"/>
    <circle cx="60" cy="130" r="16" fill="url(#lionManeGrad)"/>
    <circle cx="48" cy="98" r="16" fill="url(#lionManeGrad)"/>
  </g>

  <!-- Orelhas do Leãozinho -->
  <circle cx="68" cy="64" r="15" fill="url(#lionBodyGrad)" stroke="#78350f" stroke-width="1.8"/>
  <circle cx="68" cy="64" r="8" fill="#fb923c"/>
  <circle cx="132" cy="64" r="15" fill="url(#lionBodyGrad)" stroke="#78350f" stroke-width="1.8"/>
  <circle cx="132" cy="64" r="8" fill="#fb923c"/>

  <!-- Cabeça do Leãozinho -->
  <circle cx="100" cy="98" r="38" fill="url(#lionBodyGrad)" stroke="#78350f" stroke-width="2"/>

  <!-- Focinho Saliente -->
  <ellipse cx="100" cy="110" rx="20" ry="14" fill="#fef9c3" stroke="#ca8a04" stroke-width="1"/>
  <path d="M 94 102 Q 100 99 106 102 Q 108 107 100 110 Q 92 107 94 102 Z" fill="#78350f"/>
  <ellipse cx="98.5" cy="103" rx="2" ry="1" fill="#ffffff" opacity="0.6"/>
  <path d="M 100 110 L 100 116 M 95 115 Q 100 119 105 115" fill="none" stroke="#78350f" stroke-width="1.8" stroke-linecap="round"/>

  <!-- Bochechinhas Rosadas -->
  <circle cx="78" cy="108" r="8" fill="#f43f5e" opacity="0.25"/>
  <circle cx="122" cy="108" r="8" fill="#f43f5e" opacity="0.25"/>

  <!-- Olhos com Profundidade e Ponto de Luz Duplo -->
  <ellipse cx="85" cy="92" rx="4.8" ry="6.2" fill="#291305"/>
  <circle cx="83.5" cy="90" r="2.2" fill="#ffffff"/>
  <circle cx="86.5" cy="93.5" r="1" fill="#ffffff"/>

  <ellipse cx="115" cy="92" rx="4.8" ry="6.2" fill="#291305"/>
  <circle cx="113.5" cy="90" r="2.2" fill="#ffffff"/>
  <circle cx="116.5" cy="93.5" r="1" fill="#ffffff"/>

  <!-- Coroa Dourada Real Baby -->
  <g transform="translate(100, 56)">
    <polygon points="-16,4 -10,-10 0,-3 10,-10 16,4" fill="#facc15" stroke="#b45309" stroke-width="1.2"/>
    <circle cx="-10" cy="-10" r="2" fill="#ffffff"/>
    <circle cx="0" cy="-3" r="2" fill="#ffffff"/>
    <circle cx="10" cy="-10" r="2" fill="#ffffff"/>
  </g>
</svg>
`;

// 15C. Display de Chão Borboleta Encantada Luxo 3D (60x80cm)
export const SVG_DISPLAY_BUTTERFLY_3D = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250" width="200" height="250">
  <defs>
    <filter id="bfShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0"/>
    </filter>
    <radialGradient id="wingGradBack" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fae8ff"/>
      <stop offset="50%" stop-color="#d8b4fe"/>
      <stop offset="100%" stop-color="#9333ea"/>
    </radialGradient>
    <radialGradient id="wingGradFront1" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fff1f2"/>
      <stop offset="35%" stop-color="#fbcfe8"/>
      <stop offset="75%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#db2777"/>
    </radialGradient>
    <radialGradient id="wingGradFront2" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fdf4ff"/>
      <stop offset="45%" stop-color="#e879f9"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </radialGradient>
    <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#facc15"/>
      <stop offset="70%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <linearGradient id="pedestalGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
  </defs>

  <!-- Sombra no Piso -->
  <ellipse cx="100" cy="242" rx="45" ry="6" fill="#0f172a" opacity="0.22" filter="url(#bfShadow)"/>
  <ellipse cx="100" cy="242" rx="25" ry="3.5" fill="#0f172a" opacity="0.3"/>

  <!-- Pedestal Metálico Dourado de Apoio ao Piso -->
  <g id="pedestal">
    <ellipse cx="100" cy="240" rx="36" ry="6" fill="url(#pedestalGold)" stroke="#854d0e" stroke-width="1.2"/>
    <ellipse cx="100" cy="238.5" rx="33" ry="5" fill="#fef08a" opacity="0.6"/>
    <rect x="97.5" y="145" width="5" height="94" rx="2" fill="url(#pedestalGold)" stroke="#854d0e" stroke-width="0.8"/>
  </g>

  <!-- Asas Traseiras em Perspectiva -->
  <g opacity="0.85" transform="rotate(-6 100 110)">
    <path d="M 98 105 C 80 50 25 35 15 75 C 5 110 50 140 98 122 Z" fill="url(#wingGradBack)" stroke="url(#goldFoil)" stroke-width="1.5"/>
    <path d="M 98 120 C 75 140 25 155 30 185 C 35 210 75 185 98 135 Z" fill="url(#wingGradBack)" stroke="url(#goldFoil)" stroke-width="1.5"/>
  </g>

  <!-- Asas Principais 2.5D com Recortes de Alta Precisão e Foil Dourado -->
  <g id="frontWings">
    <path d="M 100 105 C 75 40 20 45 22 92 C 24 130 70 145 100 120 Z" fill="url(#wingGradFront1)" stroke="url(#goldFoil)" stroke-width="2"/>
    <path d="M 45 78 C 38 95 50 115 72 110 C 65 92 52 82 45 78 Z" fill="#ffffff" opacity="0.45"/>
    <path d="M 58 65 C 48 72 56 88 74 85 C 68 75 62 68 58 65 Z" fill="#ffffff" opacity="0.35"/>

    <path d="M 100 120 C 70 135 28 155 35 190 C 42 220 82 195 100 138 Z" fill="url(#wingGradFront2)" stroke="url(#goldFoil)" stroke-width="1.8"/>
    <ellipse cx="60" cy="178" rx="14" ry="9" transform="rotate(25 60 178)" fill="#ffffff" opacity="0.4"/>

    <path d="M 100 105 C 125 35 185 40 182 90 C 180 130 130 145 100 120 Z" fill="url(#wingGradFront1)" stroke="url(#goldFoil)" stroke-width="2"/>
    <path d="M 155 78 C 162 95 150 115 128 110 C 135 92 148 82 155 78 Z" fill="#ffffff" opacity="0.45"/>
    <path d="M 142 65 C 152 72 144 88 126 85 C 132 75 138 68 142 65 Z" fill="#ffffff" opacity="0.35"/>

    <path d="M 100 120 C 130 135 172 155 165 190 C 158 220 118 195 100 138 Z" fill="url(#wingGradFront2)" stroke="url(#goldFoil)" stroke-width="1.8"/>
    <ellipse cx="140" cy="178" rx="14" ry="9" transform="rotate(-25 140 178)" fill="#ffffff" opacity="0.4"/>

    <path d="M 100 112 Q 135 95 168 72" fill="none" stroke="url(#goldFoil)" stroke-width="2" stroke-linecap="round"/>
    <path d="M 100 112 Q 65 95 32 72" fill="none" stroke="url(#goldFoil)" stroke-width="2" stroke-linecap="round"/>
    <path d="M 100 124 Q 135 150 152 185" fill="none" stroke="url(#goldFoil)" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M 100 124 Q 65 150 48 185" fill="none" stroke="url(#goldFoil)" stroke-width="1.8" stroke-linecap="round"/>
  </g>

  <!-- Corpo da Borboleta em Contas Esculpidas Douradas e Pérola -->
  <g id="bodyPearl">
    <path d="M 100 80 Q 90 55 78 52 Q 74 58 84 64" fill="none" stroke="url(#goldFoil)" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="76" cy="52" r="2.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>

    <path d="M 100 80 Q 110 55 122 52 Q 126 58 116 64" fill="none" stroke="url(#goldFoil)" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="124" cy="52" r="2.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>

    <circle cx="100" cy="84" r="5.5" fill="#ffffff" stroke="url(#goldFoil)" stroke-width="1.5"/>
    <circle cx="98.5" cy="82.5" r="1.5" fill="#ffffff"/>

    <ellipse cx="100" cy="98" rx="4.5" ry="8" fill="#ffffff" stroke="url(#goldFoil)" stroke-width="1.5"/>

    <ellipse cx="100" cy="112" rx="4" ry="6" fill="#fef08a" stroke="url(#goldFoil)" stroke-width="1.2"/>
    <ellipse cx="100" cy="124" rx="3.5" ry="6" fill="#fef08a" stroke="url(#goldFoil)" stroke-width="1.2"/>
    <ellipse cx="100" cy="134" rx="2.5" ry="5" fill="#fef08a" stroke="url(#goldFoil)" stroke-width="1.2"/>
    <circle cx="100" cy="141" r="1.8" fill="#ca8a04"/>
  </g>
</svg>
`;

// 15D. Letreiro LED Neon 'Parabéns' em Acrílico Cristal (70x35cm)
export const SVG_DISPLAY_NEON_PARABENS = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 140" width="280" height="140">
  <defs>
    <filter id="neonParabensWideGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="wideBlur"/>
      <feMerge>
        <feMergeNode in="wideBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="neonParabensCore" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="coreBlur"/>
      <feMerge>
        <feMergeNode in="coreBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="chromeScrew" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#cbd5e1"/>
      <stop offset="80%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <linearGradient id="acrylicReflection" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.0"/>
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>
  </defs>

  <!-- Sombra Suave da Placa -->
  <rect x="14" y="16" width="252" height="110" rx="18" fill="#020617" opacity="0.25" filter="url(#neonParabensCore)"/>

  <!-- Placa de Acrílico Cristal Chanfrada (4mm) -->
  <rect x="10" y="12" width="260" height="114" rx="16" fill="url(#acrylicReflection)" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.8"/>
  <rect x="12" y="14" width="256" height="110" rx="14" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1"/>

  <!-- Espaçadores / Parafusos Cromados nos 4 Cantos -->
  <g id="screws">
    <circle cx="26" cy="26" r="6" fill="url(#chromeScrew)" stroke="#475569" stroke-width="0.8"/>
    <circle cx="26" cy="26" r="2.5" fill="#334155"/>
    <line x1="24" y1="26" x2="28" y2="26" stroke="#94a3b8" stroke-width="0.8"/>

    <circle cx="254" cy="26" r="6" fill="url(#chromeScrew)" stroke="#475569" stroke-width="0.8"/>
    <circle cx="254" cy="26" r="2.5" fill="#334155"/>
    <line x1="252" y1="26" x2="256" y2="26" stroke="#94a3b8" stroke-width="0.8"/>

    <circle cx="26" cy="112" r="6" fill="url(#chromeScrew)" stroke="#475569" stroke-width="0.8"/>
    <circle cx="26" cy="112" r="2.5" fill="#334155"/>
    <line x1="24" y1="112" x2="28" y2="112" stroke="#94a3b8" stroke-width="0.8"/>

    <circle cx="254" cy="112" r="6" fill="url(#chromeScrew)" stroke="#475569" stroke-width="0.8"/>
    <circle cx="254" cy="112" r="2.5" fill="#334155"/>
    <line x1="252" y1="112" x2="256" y2="112" stroke="#94a3b8" stroke-width="0.8"/>
  </g>

  <!-- Lettering Neon 'Parabéns' -->
  <g filter="url(#neonParabensWideGlow)" opacity="0.85">
    <path d="M 36 86 C 34 60 46 38 64 38 C 76 38 84 46 84 58 C 84 74 68 82 50 82 M 50 48 L 50 102
             M 82 82 C 86 72 96 64 106 64 C 114 64 118 70 118 80 L 118 90 C 118 95 124 96 128 92
             M 106 78 C 96 78 92 84 92 90 C 92 96 98 100 106 100 C 114 100 118 94 118 90
             M 132 90 L 132 72 C 132 66 138 64 144 64 C 148 64 154 68 154 74
             M 158 90 C 162 72 172 64 182 64 C 190 64 194 70 194 80 L 194 90 C 194 95 200 96 204 92
             M 182 78 C 172 78 168 84 168 90 C 168 96 174 100 182 100 C 190 100 194 94 194 90
             M 206 90 L 206 60 C 206 50 216 46 226 46 C 234 46 240 52 240 62 C 240 76 226 84 212 84 M 212 84 L 238 100
             M 172 48 Q 182 42 192 48"
          fill="none" stroke="#f59e0b" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <g filter="url(#neonParabensCore)">
    <path d="M 36 86 C 34 60 46 38 64 38 C 76 38 84 46 84 58 C 84 74 68 82 50 82 M 50 48 L 50 102
             M 82 82 C 86 72 96 64 106 64 C 114 64 118 70 118 80 L 118 90 C 118 95 124 96 128 92
             M 106 78 C 96 78 92 84 92 90 C 92 96 98 100 106 100 C 114 100 118 94 118 90
             M 132 90 L 132 72 C 132 66 138 64 144 64 C 148 64 154 68 154 74
             M 158 90 C 162 72 172 64 182 64 C 190 64 194 70 194 80 L 194 90 C 194 95 200 96 204 92
             M 182 78 C 172 78 168 84 168 90 C 168 96 174 100 182 100 C 190 100 194 94 194 90
             M 206 90 L 206 60 C 206 50 216 46 226 46 C 234 46 240 52 240 62 C 240 76 226 84 212 84 M 212 84 L 238 100
             M 172 48 Q 182 42 192 48"
          fill="none" stroke="#fde047" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <path d="M 36 86 C 34 60 46 38 64 38 C 76 38 84 46 84 58 C 84 74 68 82 50 82 M 50 48 L 50 102
           M 82 82 C 86 72 96 64 106 64 C 114 64 118 70 118 80 L 118 90 C 118 95 124 96 128 92
           M 106 78 C 96 78 92 84 92 90 C 92 96 98 100 106 100 C 114 100 118 94 118 90
           M 132 90 L 132 72 C 132 66 138 64 144 64 C 148 64 154 68 154 74
           M 158 90 C 162 72 172 64 182 64 C 190 64 194 70 194 80 L 194 90 C 194 95 200 96 204 92
           M 182 78 C 172 78 168 84 168 90 C 168 96 174 100 182 100 C 190 100 194 94 194 90
           M 206 90 L 206 60 C 206 50 216 46 226 46 C 234 46 240 52 240 62 C 240 76 226 84 212 84 M 212 84 L 238 100
           M 172 48 Q 182 42 192 48"
        fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// 15E. Cavalete Pinus com Placa de Boas-Vindas & Flores (50x120cm)
export const SVG_DISPLAY_EASEL_WELCOME = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 270" width="180" height="270">
  <defs>
    <filter id="easelShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0"/>
    </filter>
    <filter id="boardDrop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="4" stdDeviation="4" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="pinusLeg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="35%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="pinusBackLeg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="boardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fecdd3"/>
      <stop offset="50%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
  </defs>

  <!-- Sombras dos 3 Pés no Chão -->
  <ellipse cx="28" cy="262" rx="14" ry="4" fill="#0f172a" opacity="0.3" filter="url(#easelShadow)"/>
  <ellipse cx="152" cy="262" rx="14" ry="4" fill="#0f172a" opacity="0.3" filter="url(#easelShadow)"/>
  <ellipse cx="90" cy="254" rx="16" ry="3.5" fill="#0f172a" opacity="0.25" filter="url(#easelShadow)"/>

  <!-- Perna Traseira do Cavalete -->
  <polygon points="87,18 93,18 93,254 87,254" fill="url(#pinusBackLeg)"/>

  <!-- Pernas Dianteiras do Tripé Pinus -->
  <polygon points="88,14 93,14 32,262 26,260" fill="url(#pinusLeg)" stroke="#78350f" stroke-width="0.8"/>
  <polygon points="87,14 92,14 154,260 148,262" fill="url(#pinusLeg)" stroke="#78350f" stroke-width="0.8"/>

  <!-- Topo do Cavalete -->
  <rect x="85" y="14" width="10" height="12" rx="2" fill="#d97706" stroke="#451a03" stroke-width="1"/>
  <circle cx="90" cy="20" r="2" fill="#451a03"/>

  <!-- Barra Horizontal de Apoio do Quadro -->
  <rect x="22" y="162" width="136" height="8" rx="2" fill="url(#pinusLeg)" stroke="#78350f" stroke-width="0.8"/>
  <circle cx="38" cy="166" r="3" fill="#78350f"/>
  <circle cx="142" cy="166" r="3" fill="#78350f"/>

  <!-- Placa de Boas-Vindas Apoiada no Cavalete -->
  <g filter="url(#boardDrop)">
    <rect x="34" y="66" width="112" height="100" rx="6" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
    <rect x="38" y="70" width="104" height="92" rx="4" fill="url(#boardBg)"/>

    <text x="90" y="92" font-family="'Brush Script MT', 'Dancing Script', cursive, sans-serif" font-size="13" font-style="italic" fill="#fef08a" text-anchor="middle">Bem-vindos</text>
    <line x1="58" y1="98" x2="122" y2="98" stroke="#ca8a04" stroke-width="0.8" opacity="0.7"/>
    <circle cx="90" cy="98" r="1.8" fill="#fef08a"/>

    <text x="90" y="116" font-family="'Cinzel', 'Playfair Display', serif" font-size="8" letter-spacing="2" fill="#ffffff" text-anchor="middle" font-weight="bold">À NOSSA</text>
    <text x="90" y="132" font-family="'Cinzel', 'Playfair Display', serif" font-size="11" letter-spacing="3" fill="#fef08a" text-anchor="middle" font-weight="bold">FESTA</text>
    
    <path d="M 68 146 Q 90 142 112 146" fill="none" stroke="#ca8a04" stroke-width="0.8"/>
  </g>

  <!-- Arranjo Floral Luxo no Canto Superior Esquerdo -->
  <g id="floralBouquet">
    <ellipse cx="36" cy="62" rx="9" ry="5" transform="rotate(-35 36 62)" fill="#64748b" opacity="0.8"/>
    <ellipse cx="30" cy="74" rx="8" ry="4" transform="rotate(40 30 74)" fill="#475569" opacity="0.8"/>
    <ellipse cx="50" cy="54" rx="10" ry="5" transform="rotate(-15 50 54)" fill="#334155" opacity="0.85"/>
    <ellipse cx="44" cy="66" rx="9" ry="5" transform="rotate(-60 44 66)" fill="#65a30d"/>

    <circle cx="42" cy="70" r="10" fill="url(#roseGrad)" stroke="#be123c" stroke-width="0.8"/>
    <circle cx="41" cy="69" r="6" fill="#fecdd3"/>
    <circle cx="41.5" cy="68.5" r="3" fill="#be123c"/>

    <circle cx="54" cy="64" r="7" fill="#fda4af" stroke="#e11d48" stroke-width="0.8"/>
    <circle cx="53.5" cy="63.5" r="3.5" fill="#fff1f2"/>

    <circle cx="32" cy="80" r="4.5" fill="#fde047" stroke="#ca8a04" stroke-width="0.6"/>
  </g>
</svg>
`;

// 15F. Display MDF Astronauta Baby nas Estrelas (45x75cm)
export const SVG_DISPLAY_ASTRONAUT_BABY = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 250" width="180" height="250">
  <defs>
    <filter id="astroShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.22 0"/>
    </filter>
    <radialGradient id="visorGold" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </radialGradient>
    <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <radialGradient id="starGrad" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </radialGradient>
    <linearGradient id="mdfAstro" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="50%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
  </defs>

  <!-- Sombra no Chão -->
  <ellipse cx="90" cy="240" rx="65" ry="8" fill="#0f172a" opacity="0.22" filter="url(#astroShadow)"/>
  <ellipse cx="90" cy="240" rx="38" ry="4.5" fill="#0f172a" opacity="0.3"/>

  <!-- Base MDF -->
  <rect x="48" y="233" width="22" height="10" rx="2.5" fill="url(#mdfAstro)" stroke="#451a03" stroke-width="1.2"/>
  <rect x="110" y="233" width="22" height="10" rx="2.5" fill="url(#mdfAstro)" stroke="#451a03" stroke-width="1.2"/>

  <!-- Nuvem Cósmica / Fumaça na Base -->
  <g id="cloudBase" opacity="0.95">
    <circle cx="54" cy="224" r="16" fill="#e2e8f0"/>
    <circle cx="76" cy="218" r="20" fill="#f1f5f9"/>
    <circle cx="104" cy="218" r="20" fill="#f1f5f9"/>
    <circle cx="126" cy="224" r="16" fill="#e2e8f0"/>
    <circle cx="90" cy="224" r="18" fill="#ffffff"/>
    <polygon points="58,220 60,224 64,225 61,228 62,232 58,229 54,232 55,228 52,225 56,224" fill="#eab308"/>
    <polygon points="122,220 124,224 128,225 125,228 126,232 122,229 118,232 119,228 116,225 120,224" fill="#eab308"/>
  </g>

  <!-- Balão Estrela Metalizada Segurado na Mão -->
  <g id="starBalloon">
    <path d="M 142 42 Q 132 85 116 138" fill="none" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="3,2"/>
    <polygon points="142,16 148,32 165,33 151,44 156,60 142,50 128,60 133,44 119,33 136,32" fill="url(#starGrad)" stroke="#ca8a04" stroke-width="1.2"/>
    <circle cx="138" cy="28" r="3" fill="#ffffff" opacity="0.7"/>
  </g>

  <!-- Astronauta Baby em Traje Espacial 3D -->
  <ellipse cx="68" cy="214" rx="14" ry="11" fill="url(#suitGrad)" stroke="#334155" stroke-width="1.8"/>
  <rect x="58" y="216" width="20" height="4" rx="1.5" fill="#38bdf8"/>
  <ellipse cx="112" cy="214" rx="14" ry="11" fill="url(#suitGrad)" stroke="#334155" stroke-width="1.8"/>
  <rect x="102" y="216" width="20" height="4" rx="1.5" fill="#38bdf8"/>

  <ellipse cx="90" cy="172" rx="34" ry="36" fill="url(#suitGrad)" stroke="#334155" stroke-width="2"/>
  <rect x="74" y="160" width="32" height="22" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>
  <circle cx="82" cy="168" r="3" fill="#38bdf8"/>
  <circle cx="90" cy="168" r="3" fill="#4ade80"/>
  <circle cx="98" cy="168" r="3" fill="#f43f5e"/>
  <line x1="78" y1="176" x2="102" y2="176" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>

  <ellipse cx="56" cy="165" rx="11" ry="18" transform="rotate(20 56 165)" fill="url(#suitGrad)" stroke="#334155" stroke-width="1.8"/>
  <circle cx="50" cy="178" r="7" fill="#64748b"/>

  <ellipse cx="122" cy="152" rx="11" ry="18" transform="rotate(-30 122 152)" fill="url(#suitGrad)" stroke="#334155" stroke-width="1.8"/>
  <circle cx="116" cy="138" r="7" fill="#64748b"/>

  <rect x="54" y="108" width="72" height="40" rx="8" fill="#94a3b8" stroke="#334155" stroke-width="1.8"/>

  <circle cx="90" cy="105" r="42" fill="url(#suitGrad)" stroke="#334155" stroke-width="2.2"/>

  <ellipse cx="90" cy="105" rx="30" ry="24" fill="url(#visorGold)" stroke="#78350f" stroke-width="1.5"/>
  <ellipse cx="80" cy="96" rx="14" ry="6" transform="rotate(-20 80 96)" fill="#ffffff" opacity="0.75"/>
  <circle cx="98" cy="112" r="2.5" fill="#ffffff" opacity="0.5"/>
  <circle cx="104" cy="115" r="1.5" fill="#ffffff" opacity="0.4"/>
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
