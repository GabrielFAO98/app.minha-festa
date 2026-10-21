// Utilitário de Extração de Paleta de Cores e Manipulação HSL para Seletor de Cores Profissional

export interface CuratedPaletteGroup {
  id: string;
  name: string;
  colors: { name: string; hex: string }[];
}

export const PARTY_PALETTE_GROUPS: CuratedPaletteGroup[] = [
  {
    id: 'candy',
    name: 'Tons Pastéis e Candy',
    colors: [
      { name: 'Rosa Bebê', hex: '#fbcfe8' },
      { name: 'Azul Serenity', hex: '#bae6fd' },
      { name: 'Lilás Suave', hex: '#e9d5ff' },
      { name: 'Amarelo Manteiga', hex: '#fef08a' },
      { name: 'Verde Menta', hex: '#a7f3d0' },
      { name: 'Pêssego Candy', hex: '#fed7aa' }
    ]
  },
  {
    id: 'boho',
    name: 'Boho e Terrosos',
    colors: [
      { name: 'Terracota Quente', hex: '#c2410c' },
      { name: 'Nude / Palha', hex: '#e6ccb2' },
      { name: 'Areia Off-White', hex: '#f5efe6' },
      { name: 'Verde Sálvia', hex: '#84a98c' },
      { name: 'Caramelo', hex: '#b45309' },
      { name: 'Marrom Cacau', hex: '#78350f' }
    ]
  },
  {
    id: 'safari',
    name: 'Safari e Selva',
    colors: [
      { name: 'Verde Floresta', hex: '#15803d' },
      { name: 'Verde Musgo', hex: '#3f6212' },
      { name: 'Laranja Solar', hex: '#ea580c' },
      { name: 'Mostarda Ocre', hex: '#ca8a04' },
      { name: 'Bege Savana', hex: '#d6c7a1' },
      { name: 'Marrom Madeira', hex: '#713f12' }
    ]
  },
  {
    id: 'jardim',
    name: 'Jardim Encantado e Floral',
    colors: [
      { name: 'Rosa Chá', hex: '#f472b6' },
      { name: 'Rosa Seco', hex: '#be185d' },
      { name: 'Verde Oliva Suave', hex: '#65a30d' },
      { name: 'Lavanda Floral', hex: '#c084fc' },
      { name: 'Amarelo Pólen', hex: '#fde047' },
      { name: 'Branco Lírio', hex: '#fdfbf7' }
    ]
  },
  {
    id: 'princesas',
    name: 'Princesas e Romântico',
    colors: [
      { name: 'Rosa Chiclete', hex: '#f43f5e' },
      { name: 'Dourado Real', hex: '#d4af37' },
      { name: 'Azul Cinderela', hex: '#7dd3fc' },
      { name: 'Lilás Rapunzel', hex: '#a855f7' },
      { name: 'Rosa Madrepérola', hex: '#fce7f3' },
      { name: 'Champagne Brilho', hex: '#fef3c7' }
    ]
  },
  {
    id: 'herois',
    name: 'Heróis e Aventura',
    colors: [
      { name: 'Azul Bic Heroico', hex: '#1d4ed8' },
      { name: 'Vermelho Escarlate', hex: '#dc2626' },
      { name: 'Amarelo Relâmpago', hex: '#eab308' },
      { name: 'Verde Gamer', hex: '#16a34a' },
      { name: 'Roxo Poder', hex: '#7e22ce' },
      { name: 'Preto Carbono', hex: '#0f172a' }
    ]
  },
  {
    id: 'mar',
    name: 'Fundo do Mar e Sereia',
    colors: [
      { name: 'Azul Turquesa', hex: '#06b6d4' },
      { name: 'Verde Água Marinha', hex: '#14b8a6' },
      { name: 'Lilás Concha', hex: '#c084fc' },
      { name: 'Coral Suave', hex: '#fb7185' },
      { name: 'Azul Oceano Profundo', hex: '#0369a1' },
      { name: 'Areia Perolada', hex: '#fef08a' }
    ]
  },
  {
    id: 'maternidade',
    name: 'Chá Revelação e Maternidade',
    colors: [
      { name: 'Rosa Nuvens', hex: '#f9a8d4' },
      { name: 'Azul Algodão', hex: '#93c5fd' },
      { name: 'Creme Vanilla', hex: '#fef9c3' },
      { name: 'Cinza Algodão', hex: '#cbd5e1' },
      { name: 'Verde Alecrim Bebê', hex: '#bbf7d0' },
      { name: 'Branco Puro', hex: '#ffffff' }
    ]
  },
  {
    id: 'tropical',
    name: 'Sunset e Tropical',
    colors: [
      { name: 'Laranja Pôr do Sol', hex: '#f97316' },
      { name: 'Rosa Flamingo', hex: '#fb7185' },
      { name: 'Amarelo Manga', hex: '#f59e0b' },
      { name: 'Verde Folha Tropical', hex: '#059669' },
      { name: 'Roxo Pitaya', hex: '#c026d3' },
      { name: 'Azul Piscina', hex: '#38bdf8' }
    ]
  },
  {
    id: 'luxo',
    name: 'Luxo e Neutros Clássicos',
    colors: [
      { name: 'Branco Neve', hex: '#ffffff' },
      { name: 'Off-White Editorial', hex: '#f8fafc' },
      { name: 'Dourado Metálico', hex: '#b58938' },
      { name: 'Rose Gold Glamour', hex: '#b76e79' },
      { name: 'Azul Marinho Noite', hex: '#1e3a8a' },
      { name: 'Preto Ônix', hex: '#18181b' }
    ]
  }
];

// Distância euclidiana entre duas cores no espaço RGB
function colorDistance(hex1: string, hex2: string): number {
  const clean1 = hex1.replace('#', '');
  const clean2 = hex2.replace('#', '');
  const r1 = parseInt(clean1.slice(0, 2), 16);
  const g1 = parseInt(clean1.slice(2, 4), 16);
  const b1 = parseInt(clean1.slice(4, 6), 16);
  const r2 = parseInt(clean2.slice(0, 2), 16);
  const g2 = parseInt(clean2.slice(2, 4), 16);
  const b2 = parseInt(clean2.slice(4, 6), 16);
  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

/**
 * Extrai até 5 cores dominantes e harmônicas a partir de uma imagem
 */
export function extractColorsFromImage(imageSrc: string, maxColors = 5): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve([]);

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size).data;
        const colorCounts: { [hex: string]: number } = {};

        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue;

          // Agrupamento de tons por quantização suave
          const qR = Math.round(r / 20) * 20;
          const qG = Math.round(g / 20) * 20;
          const qB = Math.round(b / 20) * 20;

          const brightness = (qR * 299 + qG * 587 + qB * 114) / 1000;
          // Ignora brancos e pretos absolutos para focar nos tons reais do tema
          if (brightness < 20 || brightness > 245) continue;

          const hex = `#${((1 << 24) + (qR << 16) + (qG << 8) + qB).toString(16).slice(1)}`;
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }

        const sorted = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([hex]) => hex);

        const distinct: string[] = [];
        for (const col of sorted) {
          if (distinct.length >= maxColors) break;
          const isTooClose = distinct.some((d) => colorDistance(col, d) < 42);
          if (!isTooClose) {
            distinct.push(col);
          }
        }

        if (distinct.length > 0) {
          resolve(distinct);
        } else {
          resolve(['#fbcfe8', '#ddd6fe', '#bae6fd', '#bbf7d0', '#fef08a']);
        }
      } catch (err) {
        console.warn('Erro ao processar imagem:', err);
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = imageSrc;
  });
}

// Conversões de HSL para HEX para o slider visual contínuo
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Conversão de HEX para HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

