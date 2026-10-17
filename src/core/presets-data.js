export const SVG_RUG_BOHO_SISAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" width="260" height="260">
  <defs>
    <radialGradient id="sisalFiberGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="40%" stop-color="#fde68a"/>
      <stop offset="75%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </radialGradient>
    <filter id="shadowSisal" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#451a03" flood-opacity="0.22"/>
    </filter>
  </defs>

  <!-- Base Circular Trançada -->
  <circle cx="130" cy="130" r="120" fill="url(#sisalFiberGrad)" stroke="#b45309" stroke-width="2" filter="url(#shadowSisal)"/>

  <!-- Tramas Circulares Concêntricas de Palha / Corda de Sisal -->
  <circle cx="130" cy="130" r="112" fill="none" stroke="#92400e" stroke-width="2" stroke-dasharray="5,3"/>
  <circle cx="130" cy="130" r="102" fill="none" stroke="#b45309" stroke-width="2.5" stroke-dasharray="6,4"/>
  <circle cx="130" cy="130" r="90" fill="none" stroke="#78350f" stroke-width="2" stroke-dasharray="5,3"/>
  <circle cx="130" cy="130" r="78" fill="none" stroke="#92400e" stroke-width="2.5" stroke-dasharray="6,4"/>
  <circle cx="130" cy="130" r="64" fill="none" stroke="#b45309" stroke-width="2" stroke-dasharray="5,3"/>
  <circle cx="130" cy="130" r="48" fill="none" stroke="#78350f" stroke-width="2.5" stroke-dasharray="5,4"/>
  <circle cx="130" cy="130" r="32" fill="none" stroke="#92400e" stroke-width="2" stroke-dasharray="4,3"/>
  <circle cx="130" cy="130" r="16" fill="none" stroke="#b45309" stroke-width="2.5"/>
  <circle cx="130" cy="130" r="6" fill="#78350f"/>

  <!-- Franjas Boho Externas Delicadas -->
  <circle cx="130" cy="130" r="122" fill="none" stroke="#ca8a04" stroke-width="2" stroke-dasharray="2,3"/>
</svg>`;

export const SVG_SWEET_TOWER_3TIER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200">
  <defs>
    <radialGradient id="platePorcelainGrad" cx="45%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="goldRodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="45%" stop-color="#fef08a"/>
      <stop offset="80%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <filter id="shadowTower" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4.5" stdDeviation="4.5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <!-- Haste Central Dourada com Alça de Coração/Argola no Topo -->
  <circle cx="80" cy="24" r="8" fill="none" stroke="url(#goldRodGrad)" stroke-width="2.5"/>
  <rect x="77.5" y="32" width="5" height="152" rx="2" fill="url(#goldRodGrad)" stroke="#854d0e" stroke-width="0.8"/>

  <!-- Prato 3 (Topo - Menor) -->
  <ellipse cx="80" cy="62" rx="36" ry="10" fill="url(#platePorcelainGrad)" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadowTower)"/>
  <ellipse cx="80" cy="62" rx="34" ry="8.5" fill="none" stroke="#eab308" stroke-width="0.8"/>

  <!-- Prato 2 (Meio - Médio) -->
  <ellipse cx="80" cy="115" rx="52" ry="13" fill="url(#platePorcelainGrad)" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadowTower)"/>
  <ellipse cx="80" cy="115" rx="49.5" ry="11" fill="none" stroke="#eab308" stroke-width="0.8"/>

  <!-- Prato 1 (Base - Grande) -->
  <ellipse cx="80" cy="172" rx="68" ry="16" fill="url(#platePorcelainGrad)" stroke="#cbd5e1" stroke-width="1.8" filter="url(#shadowTower)"/>
  <ellipse cx="80" cy="172" rx="65" ry="13.5" fill="none" stroke="#eab308" stroke-width="1"/>
</svg>`;

export const SVG_GIFT_BOX_LUXURY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" width="160" height="180">
  <defs>
    <linearGradient id="boxFrontGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fff1f2"/>
      <stop offset="45%" stop-color="#fbcfe8"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
    <linearGradient id="boxSideGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>
    <linearGradient id="ribbonGoldBox" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#fef08a"/>
      <stop offset="75%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <filter id="shadowGiftBox" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Sombra no Piso -->
  <ellipse cx="80" cy="172" rx="55" ry="7" fill="#0f172a" opacity="0.25"/>

  <!-- Caixa em Perspectiva Isométrica -->
  <g filter="url(#shadowGiftBox)">
    <!-- Face Esquerda -->
    <polygon points="20,65 80,85 80,165 20,145" fill="url(#boxFrontGrad)" stroke="#db2777" stroke-width="1"/>
    <!-- Fita Dourada Face Esquerda -->
    <polygon points="46,74 54,77 54,157 46,154" fill="url(#ribbonGoldBox)"/>

    <!-- Face Direita -->
    <polygon points="80,85 140,65 140,145 80,165" fill="url(#boxSideGrad)" stroke="#be185d" stroke-width="1"/>
    <!-- Fita Dourada Face Direita -->
    <polygon points="106,77 114,74 114,154 106,157" fill="url(#ribbonGoldBox)"/>

    <!-- Face Superior (Tampa) -->
    <polygon points="80,45 140,65 80,85 20,65" fill="#fff1f2" stroke="#db2777" stroke-width="1.2"/>
    <!-- Fitas Cruzadas no Topo -->
    <polygon points="46,74 54,77 114,57 106,54" fill="url(#ribbonGoldBox)"/>
    <polygon points="76,46 84,44 84,84 76,86" fill="url(#ribbonGoldBox)"/>

    <!-- Laço Gigante de Cetim no Topo -->
    <g transform="translate(80, 48)">
      <path d="M 0 0 C -22 -18 -32 5 -4 2 Z" fill="url(#ribbonGoldBox)" stroke="#854d0e" stroke-width="0.8"/>
      <path d="M 0 0 C 22 -18 32 5 4 2 Z" fill="url(#ribbonGoldBox)" stroke="#854d0e" stroke-width="0.8"/>
      <path d="M 0 0 C -16 -28 0 -24 0 -2 Z" fill="url(#ribbonGoldBox)"/>
      <path d="M 0 0 C 16 -28 0 -24 0 -2 Z" fill="url(#ribbonGoldBox)"/>
      <!-- Nó Central do Laço -->
      <circle cx="0" cy="1" r="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
      <!-- Pontas Fluidas da Fita Caindo -->
      <path d="M -2 3 Q -15 20 -8 32 L -3 30 Q -10 18 2 5 Z" fill="url(#ribbonGoldBox)"/>
      <path d="M 2 3 Q 15 20 8 32 L 3 30 Q 10 18 -2 5 Z" fill="url(#ribbonGoldBox)"/>
    </g>
  </g>
</svg>`;

export const SVG_DISPLAY_NEON_OH_BABY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 130" width="240" height="130">
  <defs>
    <filter id="neonOhBabyGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="7" result="wideBlur"/>
      <feMerge>
        <feMergeNode in="wideBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="neonOhBabyCore" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="coreBlur"/>
      <feMerge>
        <feMergeNode in="coreBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="chromeScrewOhBaby" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <linearGradient id="acrylicReflectionOhBaby" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>
  </defs>

  <!-- Placa de Acrílico Cristal Chanfrada -->
  <rect x="12" y="12" width="216" height="106" rx="16" fill="url(#acrylicReflectionOhBaby)" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.8"/>
  <rect x="15" y="15" width="210" height="100" rx="13" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1"/>

  <!-- 4 Parafusos Espaçadores Cromados -->
  <circle cx="26" cy="26" r="5" fill="url(#chromeScrewOhBaby)" stroke="#475569" stroke-width="0.8"/>
  <circle cx="214" cy="26" r="5" fill="url(#chromeScrewOhBaby)" stroke="#475569" stroke-width="0.8"/>
  <circle cx="26" cy="104" r="5" fill="url(#chromeScrewOhBaby)" stroke="#475569" stroke-width="0.8"/>
  <circle cx="214" cy="104" r="5" fill="url(#chromeScrewOhBaby)" stroke="#475569" stroke-width="0.8"/>

  <!-- Lettering Neon 'Oh Baby' Cursivo Fluido -->
  <!-- 1. Glow Difuso Quente -->
  <g filter="url(#neonOhBabyGlow)" opacity="0.9">
    <path d="M 50 68 C 42 68, 38 52, 50 42 C 62 32, 70 52, 60 68 C 54 74, 46 72, 50 68 Z
             M 76 34 L 76 74 M 76 56 C 82 48, 94 48, 94 62 L 94 74
             M 118 74 C 114 62, 114 42, 122 36 C 128 32, 134 38, 134 50 C 134 68, 116 74, 138 74
             M 152 74 C 146 74, 142 66, 148 56 C 154 48, 164 50, 164 64 L 164 74
             M 176 74 L 176 34 M 176 56 C 182 48, 194 48, 194 62 C 194 74, 180 74, 176 74
             M 204 54 L 204 74 C 204 84, 196 92, 186 92"
          fill="none" stroke="#f59e0b" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- 2. Tubo de Silicone Flex Dourado -->
  <g filter="url(#neonOhBabyCore)">
    <path d="M 50 68 C 42 68, 38 52, 50 42 C 62 32, 70 52, 60 68 C 54 74, 46 72, 50 68 Z
             M 76 34 L 76 74 M 76 56 C 82 48, 94 48, 94 62 L 94 74
             M 118 74 C 114 62, 114 42, 122 36 C 128 32, 134 38, 134 50 C 134 68, 116 74, 138 74
             M 152 74 C 146 74, 142 66, 148 56 C 154 48, 164 50, 164 64 L 164 74
             M 176 74 L 176 34 M 176 56 C 182 48, 194 48, 194 62 C 194 74, 180 74, 176 74
             M 204 54 L 204 74 C 204 84, 196 92, 186 92"
          fill="none" stroke="#fde047" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- 3. Filamento Central Emissivo Branco Quente -->
  <path d="M 50 68 C 42 68, 38 52, 50 42 C 62 32, 70 52, 60 68 C 54 74, 46 72, 50 68 Z
           M 76 34 L 76 74 M 76 56 C 82 48, 94 48, 94 62 L 94 74
           M 118 74 C 114 62, 114 42, 122 36 C 128 32, 134 38, 134 50 C 134 68, 116 74, 138 74
           M 152 74 C 146 74, 142 66, 148 56 C 154 48, 164 50, 164 64 L 164 74
           M 176 74 L 176 34 M 176 56 C 182 48, 194 48, 194 62 C 194 74, 180 74, 176 74
           M 204 54 L 204 74 C 204 84, 196 92, 186 92"
        fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Ilustraes SVG e dados tcnicos dos Presets de Fbrica do Pegue-Monte
import { generateBalloonArchDataUrl } from './balloon-generator.js';

// Funo auxiliar para gerar Data URI de SVG
export function svgToDataUrl(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

// 1. Painel Redondo (150cm)
export const SVG_PANEL_ROUND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="300" height="380">
  <defs>
    <radialGradient id="roundStudioGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f8fafc"/>
      <stop offset="85%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="metalLegGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="35%" stop-color="#334155"/>
      <stop offset="70%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <filter id="shadowCircleRealistic" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
    <filter id="footShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0"/>
    </filter>
  </defs>

  <!-- Sombra dos Pés no Piso -->
  <ellipse cx="80" cy="374" rx="28" ry="4.5" fill="#0f172a" opacity="0.25" filter="url(#footShadow)"/>
  <ellipse cx="220" cy="374" rx="28" ry="4.5" fill="#0f172a" opacity="0.25" filter="url(#footShadow)"/>

  <!-- Estrutura Tubular de Suporte em Ferro Grafite Fosco -->
  <!-- Coluna Central -->
  <rect x="146" y="275" width="8" height="95" rx="3" fill="url(#metalLegGrad)" stroke="#0f172a" stroke-width="0.8"/>
  <!-- Manípulo de Ajuste de Altura em Latão -->
  <rect x="142" y="322" width="16" height="6" rx="2" fill="#ca8a04" stroke="#854d0e" stroke-width="0.6"/>
  <circle cx="150" cy="325" r="2" fill="#fef08a"/>

  <!-- Braços Diagonais de Contraventamento -->
  <line x1="100" y1="370" x2="150" y2="330" stroke="url(#metalLegGrad)" stroke-width="4.5" stroke-linecap="round"/>
  <line x1="200" y1="370" x2="150" y2="330" stroke="url(#metalLegGrad)" stroke-width="4.5" stroke-linecap="round"/>

  <!-- Pés de Chão em T Invertido com Sapatas Emborrachadas -->
  <line x1="60" y1="370" x2="240" y2="370" stroke="url(#metalLegGrad)" stroke-width="6" stroke-linecap="round"/>
  <rect x="56" y="367" width="10" height="6" rx="2" fill="#020617"/>
  <rect x="234" y="367" width="10" height="6" rx="2" fill="#020617"/>

  <!-- Aro Circular com Tecido Tensionado e Luz de Estúdio Suave -->
  <circle cx="150" cy="150" r="140" fill="url(#roundStudioGrad)" stroke="#cbd5e1" stroke-width="3" filter="url(#shadowCircleRealistic)"/>
  <!-- Borda Perimetral com Efeito 3D de Elástico Tensionado -->
  <circle cx="150" cy="150" r="138" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/>
  <circle cx="150" cy="150" r="136" fill="none" stroke="rgba(203,213,225,0.4)" stroke-width="1"/>
</svg>`;

// 2. Painel Arco Romano (100x200cm)
export const SVG_PANEL_ARCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 380" width="200" height="380">
  <defs>
    <linearGradient id="archStudioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#f8fafc"/>
      <stop offset="80%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="metalLegArch" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="40%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <filter id="shadowArchRealistic" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
    <filter id="footShadowArch" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0"/>
    </filter>
  </defs>

  <!-- Sombra no Piso -->
  <ellipse cx="40" cy="374" rx="25" ry="4" fill="#0f172a" opacity="0.25" filter="url(#footShadowArch)"/>
  <ellipse cx="160" cy="374" rx="25" ry="4" fill="#0f172a" opacity="0.25" filter="url(#footShadowArch)"/>

  <!-- Pés Metálicos Estruturais -->
  <line x1="25" y1="370" x2="75" y2="370" stroke="url(#metalLegArch)" stroke-width="6" stroke-linecap="round"/>
  <line x1="125" y1="370" x2="175" y2="370" stroke="url(#metalLegArch)" stroke-width="6" stroke-linecap="round"/>
  <rect x="22" y="367" width="8" height="6" rx="2" fill="#020617"/>
  <rect x="70" y="367" width="8" height="6" rx="2" fill="#020617"/>
  <rect x="122" y="367" width="8" height="6" rx="2" fill="#020617"/>
  <rect x="170" y="367" width="8" height="6" rx="2" fill="#020617"/>

  <!-- Face do Arco Romano em Tecido Tensionado e Luz de Estúdio -->
  <path d="M 20 370 L 20 100 A 80 80 0 0 1 180 100 L 180 370 Z" fill="url(#archStudioGrad)" stroke="#cbd5e1" stroke-width="2.5" filter="url(#shadowArchRealistic)"/>
  <!-- Friso de Borda Acetinado e Bisotê -->
  <path d="M 22 368 L 22 101 A 78 78 0 0 1 178 101 L 178 368" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/>
  <path d="M 24 366 L 24 102 A 76 76 0 0 1 176 102 L 176 366" fill="none" stroke="rgba(203,213,225,0.4)" stroke-width="1"/>
</svg>`;

// 3. Painel Ripado Pinus (180x200cm)
export const SVG_PANEL_SLAT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 380" width="180" height="380">
  <defs>
    <!-- Gradiente de Madeira Freijó / Carvalho Realista -->
    <linearGradient id="slatWoodRealistic" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="25%" stop-color="#d97706"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="75%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="slatDarkEdge" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="slatDepthShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1.5" dy="5" stdDeviation="5" flood-color="#1c0b02" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Pés Metálicos Grafite -->
  <line x1="35" y1="340" x2="35" y2="372" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <line x1="15" y1="372" x2="60" y2="372" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <line x1="145" y1="340" x2="145" y2="372" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <line x1="120" y1="372" x2="165" y2="372" stroke="#334155" stroke-width="6" stroke-linecap="round"/>

  <!-- Fundo de Estrutura Traseira em Madeira Escura -->
  <rect x="15" y="15" width="150" height="330" rx="3" fill="#3b1904"/>
  <rect x="18" y="70" width="144" height="14" fill="#291102"/>
  <rect x="18" y="180" width="144" height="14" fill="#291102"/>
  <rect x="18" y="290" width="144" height="14" fill="#291102"/>

  <!-- Ripas de Madeira Verticais Volumétricas com Chanfro de Quina -->
  <g filter="url(#slatDepthShadow)">
    <!-- Ripa 1 -->
    <rect x="18" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="19.5" y1="16" x2="19.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 2 -->
    <rect x="39" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="40.5" y1="16" x2="40.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 3 -->
    <rect x="60" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="61.5" y1="16" x2="61.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 4 -->
    <rect x="81" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="82.5" y1="16" x2="82.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 5 -->
    <rect x="102" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="103.5" y1="16" x2="103.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 6 -->
    <rect x="123" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="124.5" y1="16" x2="124.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 7 -->
    <rect x="144" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="145.5" y1="16" x2="145.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
  </g>
</svg>`;

// // 4. Cilindro G (Grande 50x80cm)
export const SVG_CYLINDER_G = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 250" width="160" height="250">
  <defs>
    <linearGradient id="cylBodyGradG" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="30%" stop-color="#ffffff"/>
      <stop offset="75%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <radialGradient id="cylTopGradG" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <filter id="shadowCylG" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <!-- Corpo Cilíndrico 3D -->
  <path d="M 10 32 L 10 220 A 70 18 0 0 0 150 220 L 150 32 Z" fill="url(#cylBodyGradG)" stroke="#94a3b8" stroke-width="1.8" filter="url(#shadowCylG)"/>
  <!-- Tampo Superior Suave com Bisotê -->
  <ellipse cx="80" cy="32" rx="70" ry="18" fill="url(#cylTopGradG)" stroke="#94a3b8" stroke-width="1.8"/>
  <ellipse cx="80" cy="32" rx="68" ry="16.5" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.2"/>
</svg>`;

// 5. Cilindro M (Médio 44x58cm)
export const SVG_CYLINDER_M = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 220" width="140" height="220">
  <defs>
    <linearGradient id="cylBodyGradM" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="30%" stop-color="#ffffff"/>
      <stop offset="75%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <radialGradient id="cylTopGradM" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <filter id="shadowCylM" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <path d="M 10 28 L 10 195 A 60 16 0 0 0 130 195 L 130 28 Z" fill="url(#cylBodyGradM)" stroke="#94a3b8" stroke-width="1.8" filter="url(#shadowCylM)"/>
  <ellipse cx="70" cy="28" rx="60" ry="16" fill="url(#cylTopGradM)" stroke="#94a3b8" stroke-width="1.8"/>
  <ellipse cx="70" cy="28" rx="58" ry="14.5" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.2"/>
</svg>`;

// 6. Cilindro P (Pequeno 38x45cm)
export const SVG_CYLINDER_P = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 190" width="120" height="190">
  <defs>
    <linearGradient id="cylBodyGradP" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="30%" stop-color="#ffffff"/>
      <stop offset="75%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <radialGradient id="cylTopGradP" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <filter id="shadowCylP" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4.5" stdDeviation="4.5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <path d="M 10 24 L 10 168 A 50 14 0 0 0 110 168 L 110 24 Z" fill="url(#cylBodyGradP)" stroke="#94a3b8" stroke-width="1.8" filter="url(#shadowCylP)"/>
  <ellipse cx="60" cy="24" rx="50" ry="14" fill="url(#cylTopGradP)" stroke="#94a3b8" stroke-width="1.8"/>
  <ellipse cx="60" cy="24" rx="48" ry="12.5" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.2"/>
</svg>`;

// 7. Cilindro Canelado / Ripado Dourado Luxo (NOVO)
export const SVG_CYLINDER_FLUTED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 250" width="160" height="250">
  <defs>
    <linearGradient id="flutedGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#854d0e"/>
      <stop offset="15%" stop-color="#ca8a04"/>
      <stop offset="35%" stop-color="#fde047"/>
      <stop offset="60%" stop-color="#eab308"/>
      <stop offset="85%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>
    <radialGradient id="flutedMirrorTop" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#fef08a"/>
      <stop offset="80%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </radialGradient>
    <filter id="shadowFluted" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#020617" flood-opacity="0.22"/>
    </filter>
  </defs>

  <!-- Corpo com Relevo Canelado 3D -->
  <path d="M 10 32 L 10 220 A 70 18 0 0 0 150 220 L 150 32 Z" fill="url(#flutedGoldGrad)" stroke="#854d0e" stroke-width="1.8" filter="url(#shadowFluted)"/>
  <!-- Linhas Verticais de Relevo Canelado Iluminadas -->
  <g stroke="rgba(254, 240, 138, 0.45)" stroke-width="1.8">
    <line x1="22" y1="36" x2="22" y2="225"/>
    <line x1="34" y1="40" x2="34" y2="230"/>
    <line x1="46" y1="44" x2="46" y2="234"/>
    <line x1="58" y1="47" x2="58" y2="236"/>
    <line x1="70" y1="49" x2="70" y2="238"/>
    <line x1="82" y1="50" x2="82" y2="238"/>
    <line x1="94" y1="49" x2="94" y2="238"/>
    <line x1="106" y1="47" x2="106" y2="236"/>
    <line x1="118" y1="44" x2="118" y2="234"/>
    <line x1="130" y1="40" x2="130" y2="230"/>
    <line x1="142" y1="36" x2="142" y2="225"/>
  </g>
  <!-- Tampo Espelhado Dourado -->
  <ellipse cx="80" cy="32" rx="70" ry="18" fill="url(#flutedMirrorTop)" stroke="#a16207" stroke-width="1.8"/>
  <ellipse cx="80" cy="32" rx="66" ry="15.5" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.75"/>
</svg>`;

// 8. Mesa Cavalete Madeira Pinus (120x80cm)
export const SVG_TABLE_EASEL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
  <defs>
    <linearGradient id="easelWoodRealistic" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="35%" stop-color="#d97706"/>
      <stop offset="70%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="topPlankWood" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="30%" stop-color="#d97706"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <filter id="shadowEaselTable" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5.5" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Pés Cavalete em Madeira Maciça em V Invertido com Travessas -->
  <!-- Cavalete Esquerdo -->
  <line x1="45" y1="46" x2="25" y2="165" stroke="url(#easelWoodRealistic)" stroke-width="8" stroke-linecap="round"/>
  <line x1="45" y1="46" x2="65" y2="165" stroke="url(#easelWoodRealistic)" stroke-width="8" stroke-linecap="round"/>
  <rect x="26" y="116" width="38" height="9" rx="2" fill="url(#easelWoodRealistic)" stroke="#78350f" stroke-width="1"/>
  <circle cx="32" cy="120.5" r="2" fill="#451a03"/>
  <circle cx="58" cy="120.5" r="2" fill="#451a03"/>

  <!-- Cavalete Direito -->
  <line x1="235" y1="46" x2="215" y2="165" stroke="url(#easelWoodRealistic)" stroke-width="8" stroke-linecap="round"/>
  <line x1="235" y1="46" x2="255" y2="165" stroke="url(#easelWoodRealistic)" stroke-width="8" stroke-linecap="round"/>
  <rect x="216" y="116" width="38" height="9" rx="2" fill="url(#easelWoodRealistic)" stroke="#78350f" stroke-width="1"/>
  <circle cx="222" cy="120.5" r="2" fill="#451a03"/>
  <circle cx="248" cy="120.5" r="2" fill="#451a03"/>

  <!-- Pranchão de Tampo de Madeira com Espessura 3D -->
  <rect x="18" y="38" width="244" height="10" rx="2" fill="#5c2406"/>
  <rect x="18" y="28" width="244" height="14" rx="3" fill="url(#topPlankWood)" stroke="#78350f" stroke-width="1.5" filter="url(#shadowEaselTable)"/>
  <line x1="20" y1="30" x2="260" y2="30" stroke="rgba(254,243,199,0.7)" stroke-width="1"/>
</svg>`;

// 9. Cmoda Bomb Branca (90x80cm)
export const SVG_DRESSER_BOMBE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" width="200" height="180">
  <defs>
    <linearGradient id="bombeLacquered" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="35%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <radialGradient id="antiqueBrass" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#ca8a04"/>
      <stop offset="85%" stop-color="#854d0e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </radialGradient>
    <filter id="shadowBombe" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5.5" stdDeviation="5.5" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Pés Cabriolé Esculpidos Clássicos -->
  <path d="M 32 135 C 24 148, 18 160, 24 168 C 28 172, 34 168, 38 155 L 42 135 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.2"/>
  <path d="M 168 135 C 176 148, 182 160, 176 168 C 172 172, 166 168, 162 155 L 158 135 Z" fill="#94a3b8" stroke="#64748b" stroke-width="1.2"/>

  <!-- Corpo Curvilíneo Bombê com Volume 3D -->
  <path d="M 28 40 Q 12 85 24 135 L 176 135 Q 188 85 172 40 Z" fill="url(#bombeLacquered)" stroke="#94a3b8" stroke-width="1.8" filter="url(#shadowBombe)"/>

  <!-- Tampo Superior Moldurado em Madeira Laqueada com Borda Usinada -->
  <path d="M 22 28 L 178 28 C 182 28, 184 32, 182 36 L 176 42 L 24 42 L 18 36 C 16 32, 18 28, 22 28 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.8"/>
  <line x1="20" y1="31" x2="180" y2="31" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>

  <!-- Linhas Divisórias das 3 Gavetas Rebaixadas -->
  <!-- Gaveta 1 -->
  <rect x="32" y="46" width="136" height="26" rx="3" fill="none" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- Puxadores Concha Clássicos Gaveta 1 -->
  <g transform="translate(70, 59)">
    <path d="M -8 0 Q 0 -5 8 0 Q 0 6 -8 0 Z" fill="url(#antiqueBrass)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
  </g>
  <g transform="translate(130, 59)">
    <path d="M -8 0 Q 0 -5 8 0 Q 0 6 -8 0 Z" fill="url(#antiqueBrass)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
  </g>

  <!-- Gaveta 2 -->
  <rect x="30" y="76" width="140" height="26" rx="3" fill="none" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- Puxadores Concha Clássicos Gaveta 2 -->
  <g transform="translate(68, 89)">
    <path d="M -8 0 Q 0 -5 8 0 Q 0 6 -8 0 Z" fill="url(#antiqueBrass)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
  </g>
  <g transform="translate(132, 89)">
    <path d="M -8 0 Q 0 -5 8 0 Q 0 6 -8 0 Z" fill="url(#antiqueBrass)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
  </g>

  <!-- Gaveta 3 -->
  <rect x="28" y="106" width="144" height="25" rx="3" fill="none" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- Puxadores Concha Clássicos Gaveta 3 -->
  <g transform="translate(66, 118)">
    <path d="M -8 0 Q 0 -5 8 0 Q 0 6 -8 0 Z" fill="url(#antiqueBrass)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
  </g>
  <g transform="translate(134, 118)">
    <path d="M -8 0 Q 0 -5 8 0 Q 0 6 -8 0 Z" fill="url(#antiqueBrass)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
  </g>
</svg>`;

// 10. Bolo Fake Cenogrfico 3 Andares (NOVO)
export const SVG_CAKE_FAKE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 220" width="180" height="220">
  <defs>
    <linearGradient id="cakeFondantGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="30%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="goldCakeRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="35%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <radialGradient id="cakePlateGrad" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="75%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </radialGradient>
    <filter id="cakeDropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4.5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <!-- Prato de Bolo Espelhado / Vidro Lapidado -->
  <ellipse cx="90" cy="205" rx="80" ry="12" fill="url(#cakePlateGrad)" stroke="#cbd5e1" stroke-width="1.5"/>
  <ellipse cx="90" cy="203" rx="76" ry="10.5" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.8"/>

  <!-- Andar 1 (Inferior) -->
  <path d="M 30 150 L 30 195 A 60 14 0 0 0 150 195 L 150 150 Z" fill="url(#cakeFondantGrad)" stroke="#cbd5e1" stroke-width="1.2" filter="url(#cakeDropShadow)"/>
  <ellipse cx="90" cy="150" rx="60" ry="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <ellipse cx="90" cy="150" rx="58" ry="12.5" fill="none" stroke="#f1f5f9" stroke-width="1"/>
  <!-- Fita Dourada de Acabamento na Base -->
  <path d="M 30 188 L 30 195 A 60 14 0 0 0 150 195 L 150 188 A 60 14 0 0 1 30 188 Z" fill="url(#goldCakeRibbon)"/>

  <!-- Andar 2 (Meio) -->
  <path d="M 45 105 L 45 145 A 45 11 0 0 0 135 145 L 135 105 Z" fill="url(#cakeFondantGrad)" stroke="#cbd5e1" stroke-width="1.2" filter="url(#cakeDropShadow)"/>
  <ellipse cx="90" cy="105" rx="45" ry="11" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- Fita Dourada de Acabamento na Base -->
  <path d="M 45 139 L 45 145 A 45 11 0 0 0 135 145 L 135 139 A 45 11 0 0 1 45 139 Z" fill="url(#goldCakeRibbon)"/>

  <!-- Andar 3 (Topo) -->
  <path d="M 60 65 L 60 100 A 30 8 0 0 0 120 100 L 120 65 Z" fill="url(#cakeFondantGrad)" stroke="#cbd5e1" stroke-width="1.2" filter="url(#cakeDropShadow)"/>
  <ellipse cx="90" cy="65" rx="30" ry="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- Fita Dourada de Acabamento na Base -->
  <path d="M 60 95 L 60 100 A 30 8 0 0 0 120 100 L 120 95 A 30 8 0 0 1 60 95 Z" fill="url(#goldCakeRibbon)"/>

  <!-- Topo do Bolo: Rosa Nobre Dourada com Pérolas -->
  <g transform="translate(90, 52)">
    <circle cx="0" cy="0" r="10" fill="url(#goldCakeRibbon)" stroke="#854d0e" stroke-width="0.8"/>
    <circle cx="-1" cy="-1" r="5" fill="#fef08a"/>
    <circle cx="-1.5" cy="-1.5" r="2" fill="#ffffff"/>
  </g>
</svg>`;

// 11. Tapete Oval Juta / Boho em Perspectiva de Chão (160x70cm)
export const SVG_RUG_OVAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="280" height="120">
  <defs>
    <radialGradient id="rugOvalStudio" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </radialGradient>
    <filter id="shadowRugOvalRealistic" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#78350f" flood-opacity="0.18"/>
    </filter>
  </defs>
  <ellipse cx="140" cy="60" rx="133" ry="53" fill="url(#rugOvalStudio)" stroke="#d97706" stroke-width="1.8" filter="url(#shadowRugOvalRealistic)"/>
  <ellipse cx="140" cy="60" rx="127" ry="47" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.5"/>
  <ellipse cx="140" cy="60" rx="121" ry="41" fill="none" stroke="rgba(217,119,6,0.4)" stroke-width="1"/>
</svg>`;
export const SVG_RUG_ROUND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="280" height="280">
  <defs>
    <radialGradient id="rug200Studio" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f8fafc"/>
      <stop offset="85%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <filter id="shadowRug200Realistic" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <circle cx="140" cy="140" r="130" fill="url(#rug200Studio)" stroke="#94a3b8" stroke-width="2" filter="url(#shadowRug200Realistic)"/>
  <!-- Borda Pespontada de Alfaiataria sem Texto -->
  <circle cx="140" cy="140" r="126" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.8"/>
  <circle cx="140" cy="140" r="122" fill="none" stroke="rgba(203,213,225,0.6)" stroke-width="1"/>
</svg>`;

// 11b. Tapete Completamente Redondo Sublimado 1:1 (150x150cm)
export const SVG_RUG_ROUND_FLAT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="280" height="280">
  <defs>
    <radialGradient id="rug200Studio" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f8fafc"/>
      <stop offset="85%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <filter id="shadowRug200Realistic" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <circle cx="140" cy="140" r="130" fill="url(#rug200Studio)" stroke="#94a3b8" stroke-width="2" filter="url(#shadowRug200Realistic)"/>
  <!-- Borda Pespontada de Alfaiataria sem Texto -->
  <circle cx="140" cy="140" r="126" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.8"/>
  <circle cx="140" cy="140" r="122" fill="none" stroke="rgba(203,213,225,0.6)" stroke-width="1"/>
</svg>`;

// 11c. Tapete Retangular em Perspectiva 3D de Piso (200x120cm)
export const SVG_RUG_RECT_3D = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
  <defs>
    <linearGradient id="rugRectStudio" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="45%" stop-color="#ffffff"/>
      <stop offset="85%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="shadowRugRectRealistic" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="5.5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <polygon points="35,20 265,20 290,180 10,180" fill="url(#rugRectStudio)" stroke="#94a3b8" stroke-width="1.8" filter="url(#shadowRugRectRealistic)"/>
  <!-- Acabamento Perimetral sem Linhas Pontilhadas Tosca -->
  <polygon points="38,24 262,24 285,176 15,176" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
  <polygon points="41,28 259,28 280,172 20,172" fill="none" stroke="rgba(203,213,225,0.5)" stroke-width="1"/>
</svg>`;

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
export const SVG_CAKE_STAND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 140" width="160" height="140">
  <defs>
    <radialGradient id="porcelainTop" cx="45%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="porcelainFoot" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="40%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="shadowCakeStand" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4.5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <!-- Base / Pé Canelado no Prato -->
  <ellipse cx="80" cy="118" rx="35" ry="10" fill="url(#porcelainTop)" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadowCakeStand)"/>
  <!-- Haste Torneada Central -->
  <path d="M 72 45 L 68 115 L 92 115 L 88 45 Z" fill="url(#porcelainFoot)" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- Anel Decorativo na Haste -->
  <ellipse cx="80" cy="78" rx="14" ry="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>

  <!-- Prato Superior da Boleira com Borda em Relevo e Bisotê Vitrificado -->
  <ellipse cx="80" cy="36" rx="65" ry="16" fill="#cbd5e1"/>
  <ellipse cx="80" cy="32" rx="65" ry="16" fill="url(#porcelainTop)" stroke="#cbd5e1" stroke-width="1.8" filter="url(#shadowCakeStand)"/>
  <ellipse cx="80" cy="32" rx="63" ry="14.5" fill="none" stroke="#ffffff" stroke-width="1.5"/>
  <ellipse cx="80" cy="32" rx="58" ry="12.5" fill="none" stroke="#f1f5f9" stroke-width="1"/>
</svg>`;

// 14. Bandeja Provenal Retangular (25cm)
export const SVG_TRAY_RECT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" width="160" height="90">
  <defs>
    <linearGradient id="provencalLacquered" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <filter id="shadowTrayRect" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <!-- Borda Externa da Bandeja com Cantos Arredondados -->
  <rect x="20" y="25" width="120" height="50" rx="8" fill="url(#provencalLacquered)" stroke="#cbd5e1" stroke-width="1.8" filter="url(#shadowTrayRect)"/>
  <!-- Fundo Rebaixado da Bandeja com Espelho / Laca Branca -->
  <rect x="26" y="31" width="108" height="38" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="28" y="33" width="104" height="34" rx="3" fill="none" stroke="#f1f5f9" stroke-width="1"/>

  <!-- Alças Laterais Vazadas Ergonômicas -->
  <rect x="10" y="42" width="10" height="16" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.2"/>
  <rect x="140" y="42" width="10" height="16" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.2"/>
</svg>`;

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
export const SVG_VASE_FLOWERS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" width="120" height="180">
  <defs>
    <linearGradient id="vaseChampagne" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#854d0e"/>
      <stop offset="30%" stop-color="#ca8a04"/>
      <stop offset="65%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <linearGradient id="rosePetalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2"/>
      <stop offset="45%" stop-color="#fbcfe8"/>
      <stop offset="85%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
    <linearGradient id="rosePetalGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="50%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="shadowFloral" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#020617" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Folhagens de Eucalipto Acinzentadas e Ramos Traseiros -->
  <g opacity="0.85">
    <ellipse cx="38" cy="48" rx="14" ry="7" transform="rotate(-40 38 48)" fill="#64748b"/>
    <ellipse cx="82" cy="48" rx="14" ry="7" transform="rotate(40 82 48)" fill="#64748b"/>
    <ellipse cx="60" cy="28" rx="12" ry="6" fill="#475569"/>
    <ellipse cx="30" cy="70" rx="12" ry="6" transform="rotate(-20 30 70)" fill="#65a30d"/>
    <ellipse cx="90" cy="70" rx="12" ry="6" transform="rotate(20 90 70)" fill="#65a30d"/>
  </g>

  <!-- Rosas Nobres em Camadas Volumétricas -->
  <!-- Rosa Central Champagne/Blush -->
  <circle cx="60" cy="55" r="20" fill="url(#rosePetalGrad1)" filter="url(#shadowFloral)"/>
  <circle cx="59" cy="54" r="13" fill="#fff1f2"/>
  <circle cx="59" cy="53" r="7" fill="#f43f5e"/>
  <circle cx="58.5" cy="52.5" r="3" fill="#ffffff"/>

  <!-- Rosa Esquerda Blush -->
  <circle cx="40" cy="72" r="16" fill="url(#rosePetalGrad1)"/>
  <circle cx="39" cy="71" r="10" fill="#fbcfe8"/>
  <circle cx="39" cy="70.5" r="4" fill="#be123c"/>

  <!-- Rosa Direita Champagne -->
  <circle cx="80" cy="72" r="16" fill="url(#rosePetalGrad2)"/>
  <circle cx="81" cy="71" r="10" fill="#fffbeb"/>
  <circle cx="81" cy="70.5" r="4" fill="#d97706"/>

  <!-- Vaso de Cerâmica Esmaltada Champagne Lapidado -->
  <path d="M 45 92 L 38 165 A 22 7 0 0 0 82 165 L 75 92 Z" fill="url(#vaseChampagne)" stroke="#854d0e" stroke-width="1.2" filter="url(#shadowFloral)"/>
  <ellipse cx="60" cy="92" rx="15" ry="5.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
  <!-- Friso Lapidado do Vaso -->
  <ellipse cx="60" cy="125" rx="19" ry="4" fill="none" stroke="#fef08a" stroke-width="0.8" opacity="0.8"/>
</svg>`;

// 17. Painel Retangular 2,00m x 1,50m
export const SVG_PANEL_RECT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260" width="300" height="260">
  <defs>
    <linearGradient id="rectStudioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#f8fafc"/>
      <stop offset="85%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="trussLeg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="40%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <filter id="shadowRectRealistic" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
    <filter id="footShadowRect" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0"/>
    </filter>
  </defs>

  <!-- Sombras no Piso -->
  <ellipse cx="55" cy="254" rx="34" ry="4.5" fill="#0f172a" opacity="0.25" filter="url(#footShadowRect)"/>
  <ellipse cx="245" cy="254" rx="34" ry="4.5" fill="#0f172a" opacity="0.25" filter="url(#footShadowRect)"/>

  <!-- Pés Metálicos Estruturais -->
  <rect x="51" y="200" width="8" height="52" rx="3" fill="url(#trussLeg)"/>
  <line x1="22" y1="252" x2="88" y2="252" stroke="url(#trussLeg)" stroke-width="6.5" stroke-linecap="round"/>
  <rect x="241" y="200" width="8" height="52" rx="3" fill="url(#trussLeg)"/>
  <line x1="212" y1="252" x2="278" y2="252" stroke="url(#trussLeg)" stroke-width="6.5" stroke-linecap="round"/>

  <!-- Face do Painel com Tecido / Lona Tensionada Neutra -->
  <rect x="15" y="15" width="270" height="200" rx="4" fill="url(#rectStudioGrad)" stroke="#cbd5e1" stroke-width="2.5" filter="url(#shadowRectRealistic)"/>
  <!-- Friso de Borda e Costura Fina -->
  <rect x="18" y="18" width="264" height="194" rx="2.5" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/>
  <rect x="20" y="20" width="260" height="190" rx="2" fill="none" stroke="rgba(203,213,225,0.4)" stroke-width="1"/>
</svg>`;

// 18. Painel Ripado 1,00m x 2,20m
export const SVG_PANEL_SLAT_100x220 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 380" width="180" height="380">
  <defs>
    <!-- Gradiente de Madeira Freijó / Carvalho Realista -->
    <linearGradient id="slatWoodRealistic" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="25%" stop-color="#d97706"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="75%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="slatDarkEdge" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="slatDepthShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1.5" dy="5" stdDeviation="5" flood-color="#1c0b02" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Pés Metálicos Grafite -->
  <line x1="35" y1="340" x2="35" y2="372" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <line x1="15" y1="372" x2="60" y2="372" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <line x1="145" y1="340" x2="145" y2="372" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <line x1="120" y1="372" x2="165" y2="372" stroke="#334155" stroke-width="6" stroke-linecap="round"/>

  <!-- Fundo de Estrutura Traseira em Madeira Escura -->
  <rect x="15" y="15" width="150" height="330" rx="3" fill="#3b1904"/>
  <rect x="18" y="70" width="144" height="14" fill="#291102"/>
  <rect x="18" y="180" width="144" height="14" fill="#291102"/>
  <rect x="18" y="290" width="144" height="14" fill="#291102"/>

  <!-- Ripas de Madeira Verticais Volumétricas com Chanfro de Quina -->
  <g filter="url(#slatDepthShadow)">
    <!-- Ripa 1 -->
    <rect x="18" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="19.5" y1="16" x2="19.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 2 -->
    <rect x="39" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="40.5" y1="16" x2="40.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 3 -->
    <rect x="60" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="61.5" y1="16" x2="61.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 4 -->
    <rect x="81" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="82.5" y1="16" x2="82.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 5 -->
    <rect x="102" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="103.5" y1="16" x2="103.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 6 -->
    <rect x="123" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="124.5" y1="16" x2="124.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
    <!-- Ripa 7 -->
    <rect x="144" y="15" width="16" height="330" rx="2" fill="url(#slatWoodRealistic)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="145.5" y1="16" x2="145.5" y2="343" stroke="rgba(254,243,199,0.6)" stroke-width="1"/>
  </g>
</svg>`;

// 19. Painel Meia-lua / Assimétrico 1,20m x 2,00m
export const SVG_PANEL_HALF_MOON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 380" width="220" height="380">
  <defs>
    <linearGradient id="halfMoonStudioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fdf4ff"/>
      <stop offset="75%" stop-color="#fae8ff"/>
      <stop offset="100%" stop-color="#f5d0fe"/>
    </linearGradient>
    <linearGradient id="metalLegHalfMoon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="40%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <filter id="shadowHalfMoonRealistic" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <!-- Pés Metálicos -->
  <line x1="45" y1="340" x2="45" y2="372" stroke="url(#metalLegHalfMoon)" stroke-width="6" stroke-linecap="round"/>
  <line x1="20" y1="372" x2="70" y2="372" stroke="url(#metalLegHalfMoon)" stroke-width="6" stroke-linecap="round"/>
  <line x1="175" y1="340" x2="175" y2="372" stroke="url(#metalLegHalfMoon)" stroke-width="6" stroke-linecap="round"/>
  <line x1="150" y1="372" x2="200" y2="372" stroke="url(#metalLegHalfMoon)" stroke-width="6" stroke-linecap="round"/>

  <!-- Silhueta Assimétrica / Meia-Lua Esculpida com Luz de Estúdio -->
  <path d="M 20 345 L 20 150 C 20 35, 110 20, 200 25 L 200 345 Z" fill="url(#halfMoonStudioGrad)" stroke="#cbd5e1" stroke-width="2.5" filter="url(#shadowHalfMoonRealistic)"/>
  <!-- Friso de Borda Acetinado -->
  <path d="M 22 343 L 22 151 C 22 38, 109 23, 198 28 L 198 343" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/>
  <path d="M 24 341 L 24 152 C 24 42, 108 26, 196 31 L 196 341" fill="none" stroke="rgba(216,180,254,0.4)" stroke-width="1"/>
</svg>`;

// 20. Shimmer Wall (Paetê Dourado) 30x30cm (Placa Modular)
export const SVG_SHIMMER_WALL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="shimmerGold1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <linearGradient id="shimmerGold2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#fde047"/>
      <stop offset="75%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="shimmerGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#020617" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect x="5" y="5" width="150" height="150" rx="4" fill="#0f172a" stroke="#ca8a04" stroke-width="1.8" filter="url(#shimmerGlow)"/>

  <!-- Matriz de Placas Articuladas 4x4 com Reflexos de Luz Variados -->
  <!-- Linha 1 -->
  <rect x="12" y="12" width="30" height="30" rx="3.5" fill="url(#shimmerGold1)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="27" cy="15" r="1.5" fill="#334155"/>
  <rect x="47" y="12" width="30" height="30" rx="3.5" fill="url(#shimmerGold2)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="62" cy="15" r="1.5" fill="#334155"/>
  <rect x="82" y="12" width="30" height="30" rx="3.5" fill="url(#shimmerGold1)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="97" cy="15" r="1.5" fill="#334155"/>
  <rect x="117" y="12" width="30" height="30" rx="3.5" fill="url(#shimmerGold2)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="132" cy="15" r="1.5" fill="#334155"/>

  <!-- Linha 2 -->
  <rect x="12" y="47" width="30" height="30" rx="3.5" fill="url(#shimmerGold2)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="27" cy="50" r="1.5" fill="#334155"/>
  <rect x="47" y="47" width="30" height="30" rx="3.5" fill="url(#shimmerGold1)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="62" cy="50" r="1.5" fill="#334155"/>
  <rect x="82" y="47" width="30" height="30" rx="3.5" fill="url(#shimmerGold2)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="97" cy="50" r="1.5" fill="#334155"/>
  <rect x="117" y="47" width="30" height="30" rx="3.5" fill="url(#shimmerGold1)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="132" cy="50" r="1.5" fill="#334155"/>

  <!-- Linha 3 -->
  <rect x="12" y="82" width="30" height="30" rx="3.5" fill="url(#shimmerGold1)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="27" cy="85" r="1.5" fill="#334155"/>
  <rect x="47" y="82" width="30" height="30" rx="3.5" fill="url(#shimmerGold2)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="62" cy="85" r="1.5" fill="#334155"/>
  <rect x="82" y="82" width="30" height="30" rx="3.5" fill="url(#shimmerGold1)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="97" cy="85" r="1.5" fill="#334155"/>
  <rect x="117" y="82" width="30" height="30" rx="3.5" fill="url(#shimmerGold2)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="132" cy="85" r="1.5" fill="#334155"/>

  <!-- Linha 4 -->
  <rect x="12" y="117" width="30" height="30" rx="3.5" fill="url(#shimmerGold2)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="27" cy="120" r="1.5" fill="#334155"/>
  <rect x="47" y="117" width="30" height="30" rx="3.5" fill="url(#shimmerGold1)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="62" cy="120" r="1.5" fill="#334155"/>
  <rect x="82" y="117" width="30" height="30" rx="3.5" fill="url(#shimmerGold2)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="97" cy="120" r="1.5" fill="#334155"/>
  <rect x="117" y="117" width="30" height="30" rx="3.5" fill="url(#shimmerGold1)" stroke="#854d0e" stroke-width="0.8"/>
  <circle cx="132" cy="120" r="1.5" fill="#334155"/>
</svg>`;

// 21. Cubos P, M, G
export const SVG_CUBE_P = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 210" width="160" height="210">
  <defs>
    <linearGradient id="cubeTopGradP" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="cubeLeftGradP" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="cubeRightGradP" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="60%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <filter id="shadowCubeRealisticP" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <g filter="url(#shadowCubeRealisticP)">
    <!-- Face Esquerda (Iluminação Média) -->
    <polygon points="15,38 80,58 80,195 15,175" fill="url(#cubeLeftGradP)" stroke="#94a3b8" stroke-width="1.2"/>
    <!-- Face Direita (Oclusão / Sombra Própria) -->
    <polygon points="80,58 145,38 145,175 80,195" fill="url(#cubeRightGradP)" stroke="#94a3b8" stroke-width="1.2"/>
    <!-- Face Superior (Tampo Mais Iluminado) -->
    <polygon points="80,18 145,38 80,58 15,38" fill="url(#cubeTopGradP)" stroke="#cbd5e1" stroke-width="1.5"/>
    <polygon points="80,21 141,39 80,55 19,39" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1"/>
  </g>
</svg>`;

export const SVG_CUBE_M = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 230" width="170" height="230">
  <defs>
    <linearGradient id="cubeTopGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="cubeLeftGradM" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="cubeRightGradM" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="60%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <filter id="shadowCubeRealisticM" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5.5" stdDeviation="5.5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <g filter="url(#shadowCubeRealisticM)">
    <polygon points="15,40 85,62 85,212 15,190" fill="url(#cubeLeftGradM)" stroke="#94a3b8" stroke-width="1.2"/>
    <polygon points="85,62 155,40 155,190 85,212" fill="url(#cubeRightGradM)" stroke="#94a3b8" stroke-width="1.2"/>
    <polygon points="85,18 155,40 85,62 15,40" fill="url(#cubeTopGradM)" stroke="#cbd5e1" stroke-width="1.5"/>
    <polygon points="85,21 151,41 85,59 19,41" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1"/>
  </g>
</svg>`;

export const SVG_CUBE_G = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 250" width="180" height="250">
  <defs>
    <linearGradient id="cubeTopGradG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="cubeLeftGradG" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="cubeRightGradG" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="60%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <filter id="shadowCubeRealisticG" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <g filter="url(#shadowCubeRealisticG)">
    <polygon points="15,42 90,66 90,230 15,206" fill="url(#cubeLeftGradG)" stroke="#94a3b8" stroke-width="1.2"/>
    <polygon points="90,66 165,42 165,206 90,230" fill="url(#cubeRightGradG)" stroke="#94a3b8" stroke-width="1.2"/>
    <polygon points="90,18 165,42 90,66 15,42" fill="url(#cubeTopGradG)" stroke="#cbd5e1" stroke-width="1.5"/>
    <polygon points="90,21 161,43 90,63 19,43" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1"/>
  </g>
</svg>`;

// 22. Mesa Orgânica Feijão / Rim (1,50m x 80cm)
export const SVG_TABLE_ORGANIC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
  <defs>
    <linearGradient id="organicTopRealistic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#f8fafc"/>
      <stop offset="85%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="woodLegTurned" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="35%" stop-color="#b45309"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="brassTip" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <filter id="shadowOrganicRealistic" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6.5" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
    <filter id="legShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0"/>
    </filter>
  </defs>

  <!-- Sombras de Contato dos Pés no Piso -->
  <ellipse cx="64" cy="188" rx="14" ry="4" fill="#0f172a" opacity="0.25" filter="url(#legShadow)"/>
  <ellipse cx="160" cy="186" rx="14" ry="4" fill="#0f172a" opacity="0.25" filter="url(#legShadow)"/>
  <ellipse cx="256" cy="188" rx="14" ry="4" fill="#0f172a" opacity="0.25" filter="url(#legShadow)"/>

  <!-- Pés Cilíndricos em Madeira Maciça Torneada com Ponteira em Latão Dourado -->
  <!-- Pé 1 (Esquerdo) -->
  <rect x="52" y="65" width="24" height="120" rx="12" fill="url(#woodLegTurned)" stroke="#78350f" stroke-width="1"/>
  <rect x="52" y="165" width="24" height="20" rx="4" fill="url(#brassTip)" stroke="#854d0e" stroke-width="0.8"/>
  <line x1="56" y1="165" x2="72" y2="165" stroke="#fef08a" stroke-width="0.8"/>

  <!-- Pé 2 (Centro Traseiro) -->
  <rect x="148" y="68" width="24" height="116" rx="12" fill="url(#woodLegTurned)" stroke="#78350f" stroke-width="1"/>
  <rect x="148" y="164" width="24" height="20" rx="4" fill="url(#brassTip)" stroke="#854d0e" stroke-width="0.8"/>
  <line x1="152" y1="164" x2="168" y2="164" stroke="#fef08a" stroke-width="0.8"/>

  <!-- Pé 3 (Direito) -->
  <rect x="244" y="65" width="24" height="120" rx="12" fill="url(#woodLegTurned)" stroke="#78350f" stroke-width="1"/>
  <rect x="244" y="165" width="24" height="20" rx="4" fill="url(#brassTip)" stroke="#854d0e" stroke-width="0.8"/>
  <line x1="248" y1="165" x2="264" y2="165" stroke="#fef08a" stroke-width="0.8"/>

  <!-- Tampo Orgânico Curvilíneo Feijão com Bisotê e Luz Suave -->
  <!-- Espessura / Borda da Madeira 2.5D -->
  <path d="M 40 50 C 60 20, 200 20, 280 45 C 310 60, 305 95, 260 100 C 190 105, 160 80, 110 90 C 50 100, 20 75, 40 50 Z" fill="#cbd5e1"/>
  <!-- Tampo Superior Laqueado -->
  <path d="M 40 45 C 60 15, 200 15, 280 40 C 310 55, 305 90, 260 95 C 190 100, 160 75, 110 85 C 50 95, 20 70, 40 45 Z" fill="url(#organicTopRealistic)" stroke="#cbd5e1" stroke-width="2" filter="url(#shadowOrganicRealistic)"/>
  <path d="M 44 46 C 63 18, 198 18, 276 42 C 304 56, 300 88, 258 93 C 189 98, 160 74, 111 83 C 53 93, 25 69, 44 46 Z" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
</svg>`;

// 23. Mesa Orgânica Apoio Gota (80cm x 60cm)
export const SVG_TABLE_ORGANIC_DROP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" width="200" height="180">
  <defs>
    <linearGradient id="dropTopRealistic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="dropLegTurned" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="35%" stop-color="#b45309"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="brassTipDrop" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <filter id="shadowDropRealistic" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5.5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <!-- Pés Palito com Ponteiras Douradas -->
  <rect x="46" y="58" width="20" height="106" rx="10" fill="url(#dropLegTurned)" stroke="#78350f" stroke-width="1"/>
  <rect x="46" y="146" width="20" height="18" rx="3.5" fill="url(#brassTipDrop)" stroke="#854d0e" stroke-width="0.8"/>

  <rect x="134" y="58" width="20" height="106" rx="10" fill="url(#dropLegTurned)" stroke="#78350f" stroke-width="1"/>
  <rect x="134" y="146" width="20" height="18" rx="3.5" fill="url(#brassTipDrop)" stroke="#854d0e" stroke-width="0.8"/>

  <!-- Tampo Orgânico em Gota com Borda Usinada -->
  <path d="M 35 54 C 45 24, 150 19, 175 49 C 190 79, 130 99, 75 94 C 35 89, 20 69, 35 54 Z" fill="#cbd5e1"/>
  <path d="M 35 50 C 45 20, 150 15, 175 45 C 190 75, 130 95, 75 90 C 35 85, 20 65, 35 50 Z" fill="url(#dropTopRealistic)" stroke="#cbd5e1" stroke-width="2" filter="url(#shadowDropRealistic)"/>
  <path d="M 38 51 C 47 23, 148 18, 172 46 C 186 74, 128 92, 76 87 C 38 83, 24 65, 38 51 Z" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
</svg>`;

// 24. Mesa de Apoio Lateral (60cm x 60cm)
export const SVG_TABLE_SIDE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" width="160" height="180">
  <defs>
    <radialGradient id="marbleTopGrad" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="goldTulip" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a16207"/>
      <stop offset="35%" stop-color="#eab308"/>
      <stop offset="60%" stop-color="#fef08a"/>
      <stop offset="85%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>
    <filter id="shadowSideTable" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <!-- Base Circular Pesada no Piso -->
  <ellipse cx="80" cy="168" rx="42" ry="9" fill="url(#goldTulip)" stroke="#854d0e" stroke-width="1.2"/>
  <ellipse cx="80" cy="166" rx="39" ry="7.5" fill="none" stroke="#fef08a" stroke-width="1" opacity="0.8"/>

  <!-- Coluna Central Metálica Tulipa com Transição Curva -->
  <path d="M 75 48 L 76 145 C 76 155, 62 162, 50 166 L 110 166 C 98 162, 84 155, 84 145 L 85 48 Z" fill="url(#goldTulip)" stroke="#854d0e" stroke-width="1"/>

  <!-- Tampo Redondo 2.5D em Mármore Carrara / Laca Branca -->
  <ellipse cx="80" cy="42" rx="65" ry="16" fill="#cbd5e1"/>
  <ellipse cx="80" cy="38" rx="65" ry="16" fill="url(#marbleTopGrad)" stroke="#cbd5e1" stroke-width="2" filter="url(#shadowSideTable)"/>
  <ellipse cx="80" cy="38" rx="63" ry="14.5" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="1.2"/>
  <!-- Friso Dourado na Borda -->
  <ellipse cx="80" cy="40" rx="64.5" ry="15.5" fill="none" stroke="#eab308" stroke-width="0.8" opacity="0.85"/>
</svg>`;

// 25. Balões Unitários de Látex (5", 9", 11", 16")
export const SVG_BALLOON_5INCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" width="100" height="130">
  <defs>
    <radialGradient id="balloonGloss5" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#f472b6"/>
      <stop offset="80%" stop-color="#db2777"/>
      <stop offset="100%" stop-color="#9d174d"/>
    </radialGradient>
    <filter id="shadowBal5" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1.5" dy="3.5" stdDeviation="3.5" flood-color="#020617" flood-opacity="0.2"/>
    </filter>
  </defs>
  <!-- Corpo Orgânico Inflado do Balão -->
  <path d="M 50 12 C 22 12, 12 38, 18 68 C 24 95, 44 110, 48 116 L 52 116 C 56 110, 76 95, 82 68 C 88 38, 78 12, 50 12 Z" fill="url(#balloonGloss5)" filter="url(#shadowBal5)"/>
  <!-- Brilho Especular Curvo de Estúdio -->
  <ellipse cx="38" cy="38" rx="10" ry="18" transform="rotate(-30 38 38)" fill="#ffffff" opacity="0.65"/>
  <circle cx="34" cy="54" r="3" fill="#ffffff" opacity="0.45"/>
  <!-- Nó Franzido e Amarrado -->
  <polygon points="46,116 54,116 56,122 44,122" fill="#9d174d"/>
  <circle cx="50" cy="119" r="2.5" fill="#db2777"/>
</svg>`;

export const SVG_BALLOON_9INCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="120" height="150">
  <defs>
    <radialGradient id="balloonGloss9" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#38bdf8"/>
      <stop offset="80%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>
    <filter id="shadowBal9" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#020617" flood-opacity="0.2"/>
    </filter>
  </defs>
  <path d="M 60 14 C 26 14, 15 45, 22 78 C 28 110, 52 128, 57 134 L 63 134 C 68 128, 92 110, 98 78 C 105 45, 94 14, 60 14 Z" fill="url(#balloonGloss9)" filter="url(#shadowBal9)"/>
  <ellipse cx="46" cy="45" rx="12" ry="22" transform="rotate(-30 46 45)" fill="#ffffff" opacity="0.65"/>
  <circle cx="40" cy="64" r="3.5" fill="#ffffff" opacity="0.45"/>
  <polygon points="56,134 64,134 66,142 54,142" fill="#0369a1"/>
  <circle cx="60" cy="138" r="3" fill="#0284c7"/>
</svg>`;

export const SVG_BALLOON_11INCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 175" width="140" height="175">
  <defs>
    <radialGradient id="balloonGloss11" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#fde047"/>
      <stop offset="80%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </radialGradient>
    <filter id="shadowBal11" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4.5" stdDeviation="4.5" flood-color="#020617" flood-opacity="0.2"/>
    </filter>
  </defs>
  <path d="M 70 16 C 30 16, 18 52, 26 90 C 34 128, 62 148, 67 156 L 73 156 C 78 148, 106 128, 114 90 C 122 52, 110 16, 70 16 Z" fill="url(#balloonGloss11)" filter="url(#shadowBal11)"/>
  <ellipse cx="54" cy="52" rx="14" ry="26" transform="rotate(-30 54 52)" fill="#ffffff" opacity="0.65"/>
  <circle cx="48" cy="74" r="4" fill="#ffffff" opacity="0.45"/>
  <polygon points="65,156 75,156 77,165 63,165" fill="#a16207"/>
  <circle cx="70" cy="160" r="3.5" fill="#ca8a04"/>
</svg>`;

export const SVG_BALLOON_16INCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200">
  <defs>
    <radialGradient id="balloonGloss16" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#c084fc"/>
      <stop offset="80%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#6b21a8"/>
    </radialGradient>
    <filter id="shadowBal16" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="5" stdDeviation="5" flood-color="#020617" flood-opacity="0.2"/>
    </filter>
  </defs>
  <path d="M 80 18 C 34 18, 20 60, 30 102 C 38 146, 70 170, 76 178 L 84 178 C 90 170, 122 146, 130 102 C 140 60, 126 18, 80 18 Z" fill="url(#balloonGloss16)" filter="url(#shadowBal16)"/>
  <ellipse cx="62" cy="60" rx="16" ry="30" transform="rotate(-30 62 60)" fill="#ffffff" opacity="0.65"/>
  <circle cx="54" cy="85" r="4.5" fill="#ffffff" opacity="0.45"/>
  <polygon points="74,178 86,178 88,188 72,188" fill="#6b21a8"/>
  <circle cx="80" cy="183" r="4" fill="#9333ea"/>
</svg>`;

// 26. Balão Bubble (Silicone Transparente) 45cm / 18"
export const SVG_BALLOON_BUBBLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200">
  <defs>
    <radialGradient id="crystalBubbleGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="25%" stop-color="#e0f2fe" stop-opacity="0.25"/>
      <stop offset="65%" stop-color="#38bdf8" stop-opacity="0.12"/>
      <stop offset="90%" stop-color="#0284c7" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.5"/>
    </radialGradient>
    <filter id="shadowBubble" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="4" stdDeviation="4.5" flood-color="#020617" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Esfera de Silicone Cristal -->
  <circle cx="80" cy="85" r="68" fill="url(#crystalBubbleGrad)" stroke="rgba(56, 189, 248, 0.6)" stroke-width="1.8" filter="url(#shadowBubble)"/>

  <!-- Brilho Perimetral em Arco Superior (Reflexo Esférico) -->
  <path d="M 35 45 C 50 25, 105 25, 125 45" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.75"/>
  <!-- Destaque Especular Primário Curvo -->
  <ellipse cx="58" cy="52" rx="18" ry="8" transform="rotate(-35 58 52)" fill="#ffffff" opacity="0.85"/>
  <!-- Destaque Secundário Inferior -->
  <path d="M 45 125 C 60 142, 100 142, 115 125" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>

  <!-- Válvula / Gargalo com Laço de Fita de Cetim -->
  <polygon points="76,153 84,153 82,160 78,160" fill="#0284c7"/>
  <!-- Laço de Fita Delicado no Gargalo -->
  <path d="M 80 158 C 72 154, 68 162, 78 162 Z" fill="#38bdf8"/>
  <path d="M 80 158 C 88 154, 92 162, 82 162 Z" fill="#38bdf8"/>
  <circle cx="80" cy="159" r="2" fill="#ffffff"/>
  <!-- Fio Transparente -->
  <path d="M 80 162 Q 76 178 84 195" fill="none" stroke="rgba(148, 163, 184, 0.7)" stroke-width="1.2"/>
</svg>`;

// 27. Balão Metalizado Número 75cm / 32"
export const SVG_BALLOON_NUMBER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 240" width="160" height="240">
  <defs>
    <linearGradient id="foilChromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#eab308"/>
      <stop offset="70%" stop-color="#ffffff"/>
      <stop offset="85%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <filter id="foilGlowRealistic" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1.5" dy="5" stdDeviation="5" flood-color="#78350f" flood-opacity="0.25"/>
    </filter>
  </defs>

  <g filter="url(#foilGlowRealistic)">
    <!-- Silhueta Foil Metalizada Inflada com Relevo -->
    <path d="M 50 65 L 75 40 L 98 40 L 98 190 L 120 190 L 120 215 L 40 215 L 40 190 L 68 190 L 68 85 L 45 95 Z" fill="url(#foilChromeGrad)" stroke="#78350f" stroke-width="2.2" stroke-linejoin="round"/>
    <!-- Costura Perimetral de Solda de Fábrica -->
    <path d="M 53 67 L 76 43 L 95 43 L 95 187 L 117 187 L 117 212 L 43 212 L 43 187 L 71 187 L 71 83 L 48 93 Z" fill="none" stroke="rgba(254, 240, 138, 0.7)" stroke-width="1.2" stroke-linejoin="round"/>
    <!-- Dobras de Tensão e Reflexo Cromado Central -->
    <line x1="75" y1="40" x2="68" y2="85" stroke="#ffffff" stroke-width="2" opacity="0.75"/>
    <line x1="98" y1="40" x2="98" y2="190" stroke="#ffffff" stroke-width="2.5" opacity="0.75"/>
  </g>
  <!-- Válvula de Inflar Discreta -->
  <rect x="76" y="215" width="8" height="8" rx="1.5" fill="#ca8a04"/>
</svg>`;

// 28. Tapete Redondo 2,00m
export const SVG_RUG_ROUND_200 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="280" height="280">
  <defs>
    <radialGradient id="rug200Studio" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f8fafc"/>
      <stop offset="85%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <filter id="shadowRug200Realistic" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <circle cx="140" cy="140" r="130" fill="url(#rug200Studio)" stroke="#94a3b8" stroke-width="2" filter="url(#shadowRug200Realistic)"/>
  <!-- Borda Pespontada de Alfaiataria sem Texto -->
  <circle cx="140" cy="140" r="126" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.8"/>
  <circle cx="140" cy="140" r="122" fill="none" stroke="rgba(203,213,225,0.6)" stroke-width="1"/>
</svg>`;

// 29. Tapete Retangular / Lona 2,50m x 2,00m
export const SVG_RUG_RECT_250x200 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
  <defs>
    <linearGradient id="rugRectStudio" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="45%" stop-color="#ffffff"/>
      <stop offset="85%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="shadowRugRectRealistic" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="5.5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <polygon points="35,20 265,20 290,180 10,180" fill="url(#rugRectStudio)" stroke="#94a3b8" stroke-width="1.8" filter="url(#shadowRugRectRealistic)"/>
  <!-- Acabamento Perimetral sem Linhas Pontilhadas Tosca -->
  <polygon points="38,24 262,24 285,176 15,176" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
  <polygon points="41,28 259,28 280,172 20,172" fill="none" stroke="rgba(203,213,225,0.5)" stroke-width="1"/>
</svg>`;

// 30. Bandeja de Doces Baixa 20x5cm
export const SVG_TRAY_LOW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80" width="160" height="80">
  <defs>
    <linearGradient id="trayPorcelain" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="goldEdgeTray" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <filter id="shadowTrayLow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>

  <ellipse cx="80" cy="55" rx="70" ry="15" fill="#cbd5e1"/>
  <path d="M 12 40 L 12 50 A 68 15 0 0 0 148 50 L 148 40 Z" fill="url(#trayPorcelain)" stroke="#cbd5e1" stroke-width="1.2" filter="url(#shadowTrayLow)"/>
  <ellipse cx="80" cy="40" rx="68" ry="15" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Friso Nobre Dourado na Borda -->
  <ellipse cx="80" cy="40" rx="67" ry="14" fill="none" stroke="url(#goldEdgeTray)" stroke-width="1.2"/>
</svg>`;

// 31. Display de Mesa MDF 25cm
export const SVG_DISPLAY_TABLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180">
  <defs>
    <linearGradient id="photoFrameGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <linearGradient id="glassPhotoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <filter id="shadowDispTableRealistic" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Gravata de Apoio Traseira com Sombra de Piso -->
  <ellipse cx="70" cy="170" rx="42" ry="6" fill="#0f172a" opacity="0.25"/>
  <polygon points="62,70 78,70 86,168 54,168" fill="#451a03" stroke="#1c0b02" stroke-width="1"/>

  <!-- Moldura Bisotada Dourada de Mesa -->
  <rect x="22" y="16" width="96" height="146" rx="5" fill="url(#photoFrameGold)" stroke="#854d0e" stroke-width="1.8" filter="url(#shadowDispTableRealistic)"/>
  <!-- Passe-partout Interno Nobre -->
  <rect x="30" y="24" width="80" height="130" rx="3" fill="#ffffff" stroke="#ca8a04" stroke-width="1"/>
  <!-- Vidro de Proteção com Reflexo Diagonal Suave -->
  <rect x="34" y="28" width="72" height="122" rx="2" fill="url(#glassPhotoGrad)" stroke="#cbd5e1" stroke-width="0.8"/>
  <line x1="38" y1="32" x2="102" y2="96" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
  <!-- Ícone Cenográfico Minimalista / Monograma Decorativo -->
  <circle cx="70" cy="85" r="14" fill="none" stroke="#ca8a04" stroke-width="1.2"/>
  <circle cx="70" cy="85" r="10" fill="none" stroke="#eab308" stroke-width="0.8"/>
  <circle cx="70" cy="85" r="3" fill="#ca8a04"/>
</svg>`;

// Lista Principal de Presets de Fábrica
export const DEFAULT_PRESET_ITEMS = [
  // 1. PAINÉIS
  {
    id: 'preset-painel-redondo',
    name: 'Painel Redondo 1,50m',
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
    name: 'Painel Arco Romano 1,00x2,00m',
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
    id: 'preset-painel-retangular',
    name: 'Painel Retangular 2,00x1,50m',
    category: 'paineis',
    type: 'panel_rect',
    widthCm: 200,
    heightCm: 150,
    previewUrl: svgToDataUrl(SVG_PANEL_RECT),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 65
  },
  {
    id: 'preset-painel-ripado',
    name: 'Painel Ripado 1,00x2,20m',
    category: 'paineis',
    type: 'panel_rect',
    widthCm: 100,
    heightCm: 220,
    previewUrl: svgToDataUrl(SVG_PANEL_SLAT_100x220),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 70
  },
  {
    id: 'preset-painel-meia-lua',
    name: 'Painel Meia-lua / Assimétrico 1,20x2,00m',
    category: 'paineis',
    type: 'panel_half_moon',
    widthCm: 120,
    heightCm: 200,
    previewUrl: svgToDataUrl(SVG_PANEL_HALF_MOON),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 60
  },
  {
    id: 'preset-shimmer-wall',
    name: 'Shimmer Wall (Paetê Dourado) 30x30cm',
    category: 'paineis',
    type: 'shimmer_wall',
    widthCm: 30,
    heightCm: 30,
    previewUrl: svgToDataUrl(SVG_SHIMMER_WALL),
    isCustom: false,
    stockQuantity: 12,
    rentalPrice: 15
  },

  // 2. CILINDROS, CUBOS E MESAS
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
    name: 'Cilindro M (44x60cm)',
    category: 'cilindros',
    type: 'cylinder',
    widthCm: 44,
    heightCm: 60,
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
    id: 'preset-cubo-p',
    name: 'Cubo P (35x45cm)',
    category: 'cilindros',
    type: 'cube',
    widthCm: 35,
    heightCm: 45,
    previewUrl: svgToDataUrl(SVG_CUBE_P),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 22
  },
  {
    id: 'preset-cubo-m',
    name: 'Cubo M (40x60cm)',
    category: 'cilindros',
    type: 'cube',
    widthCm: 40,
    heightCm: 60,
    previewUrl: svgToDataUrl(SVG_CUBE_M),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 28
  },
  {
    id: 'preset-cubo-g',
    name: 'Cubo G (45x80cm)',
    category: 'cilindros',
    type: 'cube',
    widthCm: 45,
    heightCm: 80,
    previewUrl: svgToDataUrl(SVG_CUBE_G),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 35
  },
  {
    id: 'preset-mesa-organica-feijao',
    name: 'Mesa Orgânica (Feijão / Rim) 1,50m',
    category: 'mesas',
    type: 'table_organic',
    widthCm: 150,
    heightCm: 80,
    previewUrl: svgToDataUrl(SVG_TABLE_ORGANIC),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 55
  },
  {
    id: 'preset-mesa-organica-gota',
    name: 'Mesa Orgânica de Apoio (Gota) 80cm',
    category: 'mesas',
    type: 'table_drop',
    widthCm: 80,
    heightCm: 60,
    previewUrl: svgToDataUrl(SVG_TABLE_ORGANIC_DROP),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 35
  },
  {
    id: 'preset-mesa-cavalete',
    name: 'Mesa Tradicional / Cavalete 1,50m',
    category: 'mesas',
    type: 'table',
    widthCm: 150,
    heightCm: 80,
    previewUrl: svgToDataUrl(SVG_TABLE_EASEL),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 45
  },
  {
    id: 'preset-mesa-apoio-lateral',
    name: 'Mesa de Apoio Lateral 60x60cm',
    category: 'mesas',
    type: 'table_side',
    widthCm: 60,
    heightCm: 60,
    previewUrl: svgToDataUrl(SVG_TABLE_SIDE),
    isCustom: false,
    stockQuantity: 2,
    rentalPrice: 25
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

  // 3. BALÕES
  {
    id: 'preset-arco-baloes',
    name: 'Arco Desconstruído / Guirlanda 3,00m',
    category: 'baloes',
    type: 'balloon_arch',
    balloonColors: ['#db2777', '#fbcfe8', '#eab308', '#ffffff'],
    widthCm: 300,
    heightCm: 220,
    previewUrl: generateBalloonArchDataUrl(['#db2777', '#fbcfe8', '#eab308', '#ffffff']),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 120
  },
  {
    id: 'preset-balao-latex-5',
    name: 'Balão de Látex 5" (13cm)',
    category: 'baloes',
    type: 'balloon_single',
    widthCm: 13,
    heightCm: 17,
    previewUrl: svgToDataUrl(SVG_BALLOON_5INCH),
    isCustom: false,
    stockQuantity: 50,
    rentalPrice: 2
  },
  {
    id: 'preset-balao-latex-9',
    name: 'Balão de Látex 9" (23cm)',
    category: 'baloes',
    type: 'balloon_single',
    widthCm: 23,
    heightCm: 29,
    previewUrl: svgToDataUrl(SVG_BALLOON_9INCH),
    isCustom: false,
    stockQuantity: 50,
    rentalPrice: 3
  },
  {
    id: 'preset-balao-latex-11',
    name: 'Balão de Látex 11" (28cm)',
    category: 'baloes',
    type: 'balloon_single',
    widthCm: 28,
    heightCm: 35,
    previewUrl: svgToDataUrl(SVG_BALLOON_11INCH),
    isCustom: false,
    stockQuantity: 50,
    rentalPrice: 4
  },
  {
    id: 'preset-balao-latex-16',
    name: 'Balão de Látex 16" (40cm)',
    category: 'baloes',
    type: 'balloon_single',
    widthCm: 40,
    heightCm: 48,
    previewUrl: svgToDataUrl(SVG_BALLOON_16INCH),
    isCustom: false,
    stockQuantity: 20,
    rentalPrice: 8
  },
  {
    id: 'preset-balao-bubble-18',
    name: 'Balão Bubble (Silicone) 45cm / 18"',
    category: 'baloes',
    type: 'balloon_bubble',
    widthCm: 45,
    heightCm: 50,
    previewUrl: svgToDataUrl(SVG_BALLOON_BUBBLE),
    isCustom: false,
    stockQuantity: 10,
    rentalPrice: 25
  },
  {
    id: 'preset-balao-metalizado-numero',
    name: 'Balão Metalizado Número 75cm / 32"',
    category: 'baloes',
    type: 'balloon_number',
    widthCm: 50,
    heightCm: 75,
    previewUrl: svgToDataUrl(SVG_BALLOON_NUMBER),
    isCustom: false,
    stockQuantity: 5,
    rentalPrice: 30
  },

  // 4. PISO (TAPETES)
  {
    id: 'preset-tapete-redondo',
    name: 'Tapete Redondo Sublimado 2,00m',
    category: 'tapetes',
    type: 'rug_round',
    widthCm: 200,
    heightCm: 200,
    previewUrl: svgToDataUrl(SVG_RUG_ROUND_200),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 50
  },
  {
    id: 'preset-tapete-retangular-3d',
    name: 'Tapete Retangular / Lona 2,50x2,00m',
    category: 'tapetes',
    type: 'rug_rect_3d',
    widthCm: 250,
    heightCm: 200,
    previewUrl: svgToDataUrl(SVG_RUG_RECT_250x200),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 60
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

  // 5. BANCADA E DISPLAYS
  {
    id: 'preset-boleira',
    name: 'Boleira Cerâmica 30x20cm',
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
    id: 'preset-bandeja-baixa',
    name: 'Bandeja de Doces Baixa 20x5cm',
    category: 'acessorios',
    type: 'generic',
    widthCm: 20,
    heightCm: 5,
    previewUrl: svgToDataUrl(SVG_TRAY_LOW),
    isCustom: false,
    stockQuantity: 4,
    rentalPrice: 10
  },
  {
    id: 'preset-bandeja',
    name: 'Bandeja de Doces Alta 25x15cm',
    category: 'acessorios',
    type: 'generic',
    widthCm: 25,
    heightCm: 15,
    previewUrl: svgToDataUrl(SVG_TRAY_RECT),
    isCustom: false,
    stockQuantity: 4,
    rentalPrice: 12
  },
  {
    id: 'preset-vaso-flores',
    name: 'Vaso de Mesa com Arranjo Floral 15x35cm',
    category: 'acessorios',
    type: 'generic',
    widthCm: 15,
    heightCm: 35,
    previewUrl: svgToDataUrl(SVG_VASE_FLOWERS),
    isCustom: false,
    stockQuantity: 2,
    rentalPrice: 18
  },
  {
    id: 'preset-display-mesa',
    name: 'Display de Mesa MDF 25cm',
    category: 'displays',
    type: 'display',
    widthCm: 20,
    heightCm: 25,
    previewUrl: svgToDataUrl(SVG_DISPLAY_TABLE),
    isCustom: false,
    stockQuantity: 4,
    rentalPrice: 15
  },
  {
    id: 'preset-bolo-fake',
    name: 'Bolo Fake Cenográfico 3 Andares',
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
    id: 'preset-display-chao',
    name: 'Display MDF Ursinho Teddy com Balão',
    category: 'displays',
    type: 'display',
    widthCm: 50,
    heightCm: 75,
    previewUrl: svgToDataUrl(SVG_DISPLAY_TEDDY_BALLOON),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 25
  },
  {
    id: 'preset-display-leao-safari',
    name: 'Display MDF Leãozinho Safari Baby',
    category: 'displays',
    type: 'display',
    widthCm: 55,
    heightCm: 65,
    previewUrl: svgToDataUrl(SVG_DISPLAY_SAFARI_LION),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 25
  },
  {
    id: 'preset-display-borboleta-luxo',
    name: 'Display Borboleta Encantada Luxo 3D',
    category: 'displays',
    type: 'display',
    widthCm: 60,
    heightCm: 75,
    previewUrl: svgToDataUrl(SVG_DISPLAY_BUTTERFLY_3D),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 35
  },
  {
    id: 'preset-letreiro-neon-parabens',
    name: 'Letreiro LED Neon Parabéns em Acrílico',
    category: 'displays',
    type: 'display',
    widthCm: 70,
    heightCm: 35,
    previewUrl: svgToDataUrl(SVG_DISPLAY_NEON_PARABENS),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 40
  },
  {
    id: 'preset-cavalete-boas-vindas',
    name: 'Cavalete Boas-Vindas com Flores',
    category: 'displays',
    type: 'display',
    widthCm: 50,
    heightCm: 115,
    previewUrl: svgToDataUrl(SVG_DISPLAY_EASEL_WELCOME),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 45
  },
  {
    id: 'preset-luminoso-led',
    name: 'Luminoso LED Neon Número 1 Dourado',
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
    id: 'preset-display-astronauta',
    name: 'Display MDF Astronauta nas Estrelas',
    category: 'displays',
    type: 'display',
    widthCm: 50,
    heightCm: 70,
    previewUrl: svgToDataUrl(SVG_DISPLAY_ASTRONAUT_BABY),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 25
  },
  // --- NOVAS ADIÇÕES PREMIUM SUGERIDAS ---
  {
    id: 'preset-letreiro-neon-oh-baby',
    name: 'Letreiro LED Neon Oh Baby em Acrílico',
    category: 'displays',
    type: 'display',
    widthCm: 60,
    heightCm: 30,
    previewUrl: svgToDataUrl(SVG_DISPLAY_NEON_OH_BABY),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 35
  },
  {
    id: 'preset-caixa-presente-luxo',
    name: 'Caixa de Presente Cenográfica com Laço Luxo',
    category: 'displays',
    type: 'display',
    widthCm: 50,
    heightCm: 55,
    previewUrl: svgToDataUrl(SVG_GIFT_BOX_LUXURY),
    isCustom: false,
    stockQuantity: 2,
    rentalPrice: 25
  },
  {
    id: 'preset-torre-doces-3-andares',
    name: 'Torre de Doces 3 Andares em Porcelana',
    category: 'acessorios',
    type: 'generic',
    widthCm: 35,
    heightCm: 45,
    previewUrl: svgToDataUrl(SVG_SWEET_TOWER_3TIER),
    isCustom: false,
    stockQuantity: 2,
    rentalPrice: 20
  },
  {
    id: 'preset-tapete-boho-sisal',
    name: 'Tapete Redondo Boho Sisal Trançado 1,50m',
    category: 'tapetes',
    type: 'rug_round',
    widthCm: 150,
    heightCm: 150,
    previewUrl: svgToDataUrl(SVG_RUG_BOHO_SISAL),
    isCustom: false,
    stockQuantity: 1,
    rentalPrice: 35
  },
  ];

// Presets de Capas e Estampas de Demonstração (Imagens Realistas de Festas Reais)
export const DEFAULT_THEME_COVERS = [
  {
    id: 'cover-fazendinha',
    themeName: 'Fazendinha',
    name: 'Fazendinha Rústica dos Bichinhos',
    targetType: 'all',
    imageUrl: '/covers/fazendinha.jpg'
  },
  {
    id: 'cover-dinossauros',
    themeName: 'Dinossauros',
    name: 'Dinossauros & Floresta Jurássica',
    targetType: 'all',
    imageUrl: '/covers/dinossauros.jpg'
  },
  {
    id: 'cover-safari',
    themeName: 'Animais & Safári',
    name: 'Safári Baby & Animais da Savana',
    targetType: 'all',
    imageUrl: '/covers/safari.jpg'
  },
  {
    id: 'cover-fundo-do-mar',
    themeName: 'Fundo do Mar',
    name: 'Fundo do Mar & Oceano Encantado',
    targetType: 'all',
    imageUrl: '/covers/fundo-do-mar.jpg'
  },
  {
    id: 'cover-circo',
    themeName: 'Circo',
    name: 'Circo Mágico Tradicional',
    targetType: 'all',
    imageUrl: '/covers/circo.jpg'
  },
  {
    id: 'cover-princesas',
    themeName: 'Princesas',
    name: 'Castelo Encantado das Princesas',
    targetType: 'all',
    imageUrl: '/covers/princesas.jpg'
  },
  {
    id: 'cover-herois',
    themeName: 'Heróis',
    name: 'Metrópole dos Super-Heróis',
    targetType: 'all',
    imageUrl: '/covers/herois.jpg'
  },
  {
    id: 'cover-espaco',
    themeName: 'Espaço',
    name: 'Galáxia & Espaço Cósmico',
    targetType: 'all',
    imageUrl: '/covers/espaco.jpg'
  },
  {
    id: 'cover-batizado',
    themeName: 'Batizado',
    name: 'Batizado Celestial & Paz',
    targetType: 'all',
    imageUrl: '/covers/batizado.jpg'
  },
  {
    id: 'cover-aniversario',
    themeName: 'Aniversário',
    name: 'Aniversário Balões 3D & Confetes',
    targetType: 'all',
    imageUrl: '/covers/aniversario.jpg'
  }
];
