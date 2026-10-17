// Gerador de Arco de Balões Orgânico Desconstruído de Alto Padrão (Base Fotográfica Real)

export interface BalloonPalette {
  id: string;
  name: string;
  colors: string[];
}

// Paletas Prontas Populares em Decorações Profissionais de Festa
export const BALLOON_PALETTES: BalloonPalette[] = [
  {
    id: 'rose-gold',
    name: 'Rose Gold, Blush & Pérola',
    colors: ['#c97a8e', '#f7dbe1', '#d4af37', '#fdfbf7']
  },
  {
    id: 'safari',
    name: 'Safari & Floresta Chic',
    colors: ['#4d6b2c', '#85512b', '#c59a3f', '#f7eed7']
  },
  {
    id: 'candy-colors',
    name: 'Candy Colors Pastel',
    colors: ['#f8b4d9', '#d8b4fe', '#93c5fd', '#fef08a']
  },
  {
    id: 'azul-prata',
    name: 'Azul Real, Celeste & Prata',
    colors: ['#1e40af', '#60a5fa', '#cbd5e1', '#ffffff']
  },
  {
    id: 'dourado-preto',
    name: 'Dourado Glamour & Preto',
    colors: ['#d4af37', '#1e293b', '#fde047', '#0f172a']
  },
  {
    id: 'boho-terracota',
    name: 'Boho Terracota & Eucalipto',
    colors: ['#c2410c', '#2d6a4f', '#d97706', '#fef3c7']
  },
  {
    id: 'cha-revelacao',
    name: 'Chá Revelação Baby',
    colors: ['#f472b6', '#38bdf8', '#ffffff', '#fde047']
  },
  {
    id: 'sereia',
    name: 'Sereia, Lilás & Tiffany',
    colors: ['#9333ea', '#14b8a6', '#f472b6', '#e0e7ff']
  }
];

/**
 * Retorna o asset fotográfico fotorrealista isolado em PNG de alta resolução
 * com canal alpha e sombreamento de estúdio profissional.
 */
export function generateBalloonArchDataUrl(_colors?: string[]): string {
  return '/assets/arco-baloes.png';
}
