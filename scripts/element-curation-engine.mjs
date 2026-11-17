/**
 * Motor Inteligente de Curadoria, Pesquisa e Seleção de Elementos Decorativos
 *
 * Responsável por:
 * 1. Planejar itens aderentes às tendências atuais do mercado brasileiro de decoração de festas.
 * 2. Construir múltiplas queries otimizadas (priorizando PNG transparente nativo e estúdio isolado).
 * 3. Filtrar semanticamente kits, montagens compostas, marcas d'água e resultados fora de tema.
 * 4. Validar resolução, nitidez, ausência de cortes nas bordas e unicidade de objeto (componentes conexos).
 * 5. Ranquear os melhores candidatos para revisão visual antes da promoção para public/items/.
 */

import sharp from 'sharp';

export const BLOCKED_STOCK_DOMAINS = [
  'shutterstock.com',
  'istockphoto.com',
  'alamy.com',
  '123rf.com',
  'depositphotos.com',
  'dreamstime.com',
  'stock.adobe.com',
  'gettyimages.',
  'vectorstock.com',
  'bigstockphoto.com',
  'canstockphoto.com',
  'pond5.com',
  'megapixl.com',
  'plus.unsplash.com',
  // Agregadores PNG que bloqueiam download direto com HTTP 403 / Cloudflare
  'pngtree.com',
  'pngwing.com',
  'pngegg.com',
  'cleanpng.com',
  'favpng.com',
  'stickpng.com',
  'klipartz.com',
  'hiclipart.com',
  'freepnglogos.com',
  'freepngimg.com',
  'clipartmax.com',
  'vecteezy.com',
  'pnghut.com',
  'pngmart.com',
  'kindpng.com',
  'seekpng.com',
  'nicepng.com',
  'pngkey.com',
  'pngfind.com',
  'pngall.com',
  'pluspng.com'
];

export const PREFERRED_TRANSPARENT_DOMAINS = [
  'pngimg.com',
  'upload.wikimedia.org',
  'openclipart.org',
  'static.wixstatic.com'
];

export const TRUSTED_PRODUCT_CDNS = [
  'cloudfront.net',
  'mitiendanube.com',
  'tcdn.com.br',
  'mlstatic.com',
  'elo7.com.br',
  'wp-content/uploads',
  'shopify.com'
];

export const NEGATIVE_TITLE_PATTERNS = [
  /\bkit\b/i,
  /\bcombo\b/i,
  /\bconjunto\b/i,
  /\bpacote\s+(com|c\/)/i,
  /\b\d+\s*(pecas|peças|itens|unidades|displays|totens|modelos|apliques)\b/i,
  /\bmedidas\b/i,
  /\btamanhos\b/i,
  /\bregua\b/i,
  /\btabela\b/i,
  /\bdecoracao\s+completa\b/i,
  /\bfesta\s+completa\b/i,
  /\bmesa\s+decorada\b/i,
  /\bpainel\s+(redondo|romano|sublimado)/i,
  /\bcenario\s+completo\b/i,
  /\bpegue\s+e\s+monte\b/i,
  /\bantes\s+e\s+depois\b/i,
  /\bmockup\b/i,
  /\bconvite\b/i,
  /\badhesiv|adesivo\s+de\s+unha/i,
  /\bcamiseta|body\s+bebe|fantasia|roupinha|gravatinha\b/i,
  /\btopo\s+de\s+bolo\b/i,
  /\bfrete\s+gratis\b/i,
  /\bpromocao\b/i,
  /\bdesconto\b/i,
  /\bwhatsapp\b/i
];

/**
 * Catálogo de tendências populares do mercado de festas (Brasil) por tema.
 * Usado para sugerir peças coerentes, unitárias e com proporções reais de locação.
 */
export const THEME_CATALOG_PLANS = {
  'jardim-encantado': {
    title: 'Jardim Encantado',
    trendNotes: 'Tendência floral delicada em tons pastéis, boho e MDF recortado sem borda exagerada.',
    items: [
      {
        slug: 'display-jardim-cogumelo',
        name: 'Display Cogumelo Encantado',
        category: 'displays',
        type: 'display',
        placement: 'chao',
        widthCm: 48,
        heightCm: 62,
        searchTerms: ['cogumelo vermelho pintinhas decorativo', 'mushroom decor isolated'],
        requiredTerms: ['cogumelo', 'mushroom'],
        preferredStyle: 'photo',
        minAspect: 0.55,
        maxAspect: 1.35
      },
      {
        slug: 'display-jardim-borboleta',
        name: 'Display Borboleta Jardim',
        category: 'displays',
        type: 'display',
        placement: 'chao',
        widthCm: 58,
        heightCm: 55,
        searchTerms: ['borboleta rosa dourada decorativa', 'butterfly isolated'],
        requiredTerms: ['borboleta', 'butterfly'],
        preferredStyle: 'transparent',
        minAspect: 0.65,
        maxAspect: 1.6
      },
      {
        slug: 'display-jardim-regador-flores',
        name: 'Regador Vintage com Flores',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 28,
        heightCm: 28,
        searchTerms: ['regador metal flores decoracao', 'watering can flowers isolated'],
        requiredTerms: ['regador', 'watering'],
        preferredStyle: 'photo',
        minAspect: 0.6,
        maxAspect: 1.5
      }
    ]
  },
  'fazendinha': {
    title: 'Fazendinha',
    trendNotes: 'Estilo rústico alegre (celeiro vermelho, vaquinha baby, feno e madeira pinus).',
    items: [
      {
        slug: 'display-fazendinha-celeiro',
        name: 'Display Celeiro Vermelho',
        category: 'displays',
        type: 'display',
        placement: 'chao',
        widthCm: 64,
        heightCm: 68,
        searchTerms: ['celeiro vermelho fazendinha display', 'red barn isolated'],
        requiredTerms: ['celeiro', 'barn'],
        preferredStyle: 'photo',
        minAspect: 0.65,
        maxAspect: 1.45
      },
      {
        slug: 'display-fazendinha-vaquinha',
        name: 'Display Vaquinha Baby',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 26,
        heightCm: 30,
        searchTerms: ['vaquinha cute pelucia sentada', 'cute baby cow isolated'],
        requiredTerms: ['vaquinha', 'vaca', 'cow'],
        preferredStyle: 'photo',
        minAspect: 0.55,
        maxAspect: 1.35
      },
      {
        slug: 'display-fazendinha-cavalinho',
        name: 'Display Cavalinho Baby',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 26,
        heightCm: 30,
        searchTerms: ['cavalinho cute pelucia fazendinha', 'cute baby horse isolated'],
        requiredTerms: ['cavalo', 'cavalinho', 'horse', 'pony'],
        preferredStyle: 'photo',
        minAspect: 0.55,
        maxAspect: 1.35
      }
    ]
  },
  '1-ano': {
    title: 'Festa 1 Ano',
    trendNotes: 'Tendência clean & afetiva: números marquee/dourado, cubos e ursinho baloeiro.',
    items: [
      {
        slug: 'display-1ano-numero-marquee',
        name: 'Número 1 Luminoso LED',
        category: 'displays',
        type: 'display',
        placement: 'chao',
        widthCm: 42,
        heightCm: 76,
        searchTerms: ['numero 1 madeira led lampadas', 'marquee number 1 white bulbs'],
        requiredTerms: ['numero', 'number', 'marquee', 'luminoso', 'led'],
        preferredStyle: 'photo',
        minAspect: 0.32,
        maxAspect: 0.9
      },
      {
        slug: 'display-1ano-urso-balao',
        name: 'Ursinho no Balão Baloeiro',
        category: 'displays',
        type: 'display',
        placement: 'chao',
        widthCm: 52,
        heightCm: 80,
        searchTerms: ['ursinho balao ar quente pelucia decoracao', 'teddy bear hot air balloon isolated'],
        requiredTerms: ['urso', 'ursinho', 'bear', 'balao', 'balloon'],
        preferredStyle: 'photo',
        minAspect: 0.45,
        maxAspect: 1.15
      }
    ]
  },
  'cha-revelacao': {
    title: 'Chá Revelação',
    trendNotes: 'Minimalismo neutro (bege/off-white, nuvens, interrogação e ursinhos).',
    items: [
      {
        slug: 'display-revelacao-interrogacao',
        name: 'Totem Interrogação Neutro',
        category: 'displays',
        type: 'display',
        placement: 'chao',
        widthCm: 42,
        heightCm: 78,
        searchTerms: ['ponto de interrogacao mdf dourado branco', 'gold question mark 3d isolated'],
        requiredTerms: ['interrogacao', 'question'],
        preferredStyle: 'transparent',
        minAspect: 0.35,
        maxAspect: 1.1
      },
      {
        slug: 'display-revelacao-nuvem',
        name: 'Display Nuvem Decorativa',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 34,
        heightCm: 22,
        searchTerms: ['display mesa nuvem mdf branca', 'white cloud decor wood'],
        requiredTerms: ['nuvem', 'cloud'],
        preferredStyle: 'transparent',
        minAspect: 1.0,
        maxAspect: 2.2
      }
    ]
  },
  '15-anos': {
    title: '15 Anos e Parabéns Luxo',
    trendNotes: 'Acrílico espelhado dourado/rose, neon LED flutuante e medalhões clássicos.',
    items: [
      {
        slug: 'display-15anos-letreiro',
        name: 'Letreiro 15 Anos Dourado',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 48,
        heightCm: 22,
        searchTerms: ['letreiro 15 anos acrilico dourado mesa', '15 anos dourado decoracao'],
        requiredTerms: ['15', 'anos', 'debutante'],
        preferredStyle: 'transparent',
        minAspect: 1.0,
        maxAspect: 3.0
      },
      {
        slug: 'display-15anos-coroa',
        name: 'Coroa Princesa Dourada',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 24,
        heightCm: 20,
        searchTerms: ['coroa dourada realista decoracao', 'gold crown isolated'],
        requiredTerms: ['coroa', 'crown'],
        preferredStyle: 'transparent',
        minAspect: 0.7,
        maxAspect: 1.8
      }
    ]
  },
  'futebol': {
    title: 'Futebol',
    trendNotes: 'Estética campeonato/arena: bola 3D realista, taça dourada e chuteira.',
    items: [
      {
        slug: 'display-futebol-bola',
        name: 'Bola de Futebol Realista',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 26,
        heightCm: 26,
        searchTerms: ['bola de futebol classica realista', 'soccer ball isolated'],
        requiredTerms: ['bola', 'soccer', 'football'],
        preferredStyle: 'transparent',
        minAspect: 0.85,
        maxAspect: 1.18
      },
      {
        slug: 'display-futebol-trofeu',
        name: 'Troféu Campeão Dourado',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 22,
        heightCm: 36,
        searchTerms: ['trofeu dourado campeao realista', 'gold trophy cup isolated'],
        requiredTerms: ['trofeu', 'taca', 'trophy'],
        preferredStyle: 'transparent',
        minAspect: 0.45,
        maxAspect: 1.15
      }
    ]
  },
  'cerejinha': {
    title: 'Cerejinha / Coquette',
    trendNotes: 'Estética viral feminina/infantil: cerejas brilhantes, laços cetim e xadrez vichy.',
    items: [
      {
        slug: 'display-cerejinha-laco',
        name: 'Laço Coquette Vermelho/Rosa',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 32,
        heightCm: 26,
        searchTerms: ['laco cetim vermelho coquette', 'red satin bow ribbon isolated'],
        requiredTerms: ['laco', 'bow', 'ribbon'],
        preferredStyle: 'transparent',
        minAspect: 0.7,
        maxAspect: 1.65
      }
    ]
  },
  'safari-baby': {
    title: 'Safari Baby / Selva',
    trendNotes: 'Bichinhos cute em pelúcia/MDF, folhagens tropicais e caixotes pinus.',
    items: [
      {
        slug: 'display-safari-folhagem',
        name: 'Costela de Adão Decorativa',
        category: 'acessorios',
        type: 'generic',
        placement: 'mesa',
        widthCm: 35,
        heightCm: 45,
        searchTerms: ['folha costela de adao artificial verde', 'monstera leaf isolated'],
        requiredTerms: ['costela', 'monstera', 'folha'],
        preferredStyle: 'transparent',
        minAspect: 0.55,
        maxAspect: 1.35
      }
    ]
  },
  'fundo-do-mar': {
    title: 'Fundo do Mar / Sereia',
    trendNotes: 'Tons iridescentes e lavanda/turquesa: cauda de sereia, concha com pérola e polvo cute.',
    items: [
      {
        slug: 'display-sereia-cauda',
        name: 'Display Cauda de Sereia',
        category: 'displays',
        type: 'display',
        placement: 'chao',
        widthCm: 50,
        heightCm: 76,
        searchTerms: ['cauda de sereia decorativa festa', 'mermaid tail glitters isolated'],
        requiredTerms: ['cauda', 'sereia', 'mermaid'],
        preferredStyle: 'transparent',
        minAspect: 0.45,
        maxAspect: 1.2
      },
      {
        slug: 'display-sereia-concha',
        name: 'Concha com Pérola',
        category: 'displays',
        type: 'display',
        placement: 'mesa',
        widthCm: 28,
        heightCm: 25,
        searchTerms: ['concha com perola decoracao', 'seashell pearl isolated'],
        requiredTerms: ['concha', 'shell', 'seashell', 'perola'],
        preferredStyle: 'transparent',
        minAspect: 0.75,
        maxAspect: 1.5
      }
    ]
  },
  'boteco': {
    title: 'Boteco Adulto',
    trendNotes: 'Madeira rústica, barril de carvalho e caneca de chopp em vista frontal.',
    items: [
      {
        slug: 'display-boteco-barril',
        name: 'Barril de Madeira Rústico',
        category: 'mesas',
        type: 'generic',
        placement: 'chao',
        widthCm: 52,
        heightCm: 76,
        searchTerms: ['barril madeira decoracao festa boteco', 'wooden wine barrel front isolated'],
        requiredTerms: ['barril', 'barrel'],
        preferredStyle: 'photo',
        minAspect: 0.5,
        maxAspect: 1.15
      }
    ]
  },
  'acessorios-mesa': {
    title: 'Acessórios de Mesa (Universal)',
    trendNotes: 'Boleiras cerâmica/dourada, bandejas espelhadas e vasos cilíndricos em vista frontal limpa.',
    items: [
      {
        slug: 'acessorio-escadinha-doces',
        name: 'Escadinha de Doces Branca',
        category: 'acessorios',
        type: 'generic',
        placement: 'mesa',
        widthCm: 36,
        heightCm: 26,
        searchTerms: ['expositor escadinha mdf branco doces', 'wooden 3 tier cupcake riser display'],
        requiredTerms: ['escada', 'escadinha', 'expositor', 'riser', 'stand'],
        preferredStyle: 'photo',
        minAspect: 0.85,
        maxAspect: 1.85
      },
      {
        slug: 'acessorio-capim-pampas',
        name: 'Arranjo Capim dos Pampas',
        category: 'acessorios',
        type: 'generic',
        placement: 'mesa',
        widthCm: 36,
        heightCm: 48,
        searchTerms: ['arranjo capim dos pampas vaso decoracao', 'pampas grass vase bouquet'],
        requiredTerms: ['pampas', 'capim'],
        preferredStyle: 'photo',
        minAspect: 0.45,
        maxAspect: 1.35,
        maxComponents: 4,
        minMainShare: 0.55
      },
      {
        slug: 'acessorio-maleta-vintage',
        name: 'Maleta Decorativa Vintage',
        category: 'acessorios',
        type: 'generic',
        placement: 'mesa',
        widthCm: 35,
        heightCm: 22,
        searchTerms: ['maleta decorativa vintage festa mesa', 'vintage decorative suitcase isolated'],
        requiredTerms: ['maleta', 'mala', 'suitcase'],
        preferredStyle: 'photo',
        minAspect: 1.0,
        maxAspect: 2.1
      }
    ]
  }
};

export function normalizeText(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function slugify(str = '') {
  return normalizeText(str)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolve especificações inteligentes para um tema ou item avulso.
 */
export function resolveItemSpec(themeSlug, rawItemNameOrSlug, overrides = {}) {
  const normTheme = slugify(themeSlug || '');
  const normTarget = slugify(rawItemNameOrSlug || '');
  const themePlan = THEME_CATALOG_PLANS[normTheme];

  if (themePlan) {
    const matched = themePlan.items.find(
      (it) => it.slug === normTarget || slugify(it.name).includes(normTarget) || it.slug.endsWith(normTarget)
    );
    if (matched) {
      return { ...matched, ...overrides, themeTitle: themePlan.title };
    }
  }

  const cleanTopic = String(rawItemNameOrSlug || '').trim();
  const topicWords = normalizeText(cleanTopic)
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !['de', 'da', 'do', 'com', 'para', 'festa', 'decoracao', 'display'].includes(w));

  const category = overrides.category || 'displays';
  const type = overrides.type || (category === 'displays' ? 'display' : 'generic');
  const fullSlug = overrides.slug || (normTheme ? `display-${normTheme}-${normTarget}` : `item-${normTarget}`);

  return {
    slug: fullSlug,
    name: overrides.name || cleanTopic,
    category,
    type,
    placement: overrides.placement || (category === 'acessorios' ? 'mesa' : 'chao'),
    widthCm: overrides.widthCm || (category === 'acessorios' ? 28 : 48),
    heightCm: overrides.heightCm || (category === 'acessorios' ? 28 : 70),
    searchTerms: overrides.searchTerms || [
      `${cleanTopic}${themeSlug ? ' ' + themeSlug.replace(/-/g, ' ') : ''}`,
      `${cleanTopic} festa decoracao`
    ],
    requiredTerms: overrides.requiredTerms || (topicWords.length > 0 ? topicWords : [normalizeText(cleanTopic)]),
    preferredStyle: overrides.preferredStyle || 'transparent',
    minAspect: overrides.minAspect || 0.32,
    maxAspect: overrides.maxAspect || 1.9,
    maxComponents: overrides.maxComponents || 2,
    minMainShare: overrides.minMainShare || 0.72,
    themeTitle: themePlan?.title || themeSlug || 'Geral'
  };
}

/**
 * Constrói múltiplas estratégias de busca com filtros negativos anti-kit/anti-cenário.
 */
export function buildSmartQueries(spec) {
  const negatives = '-kit -combo -painel';
  const rawPrimary = spec.searchTerms[0] || spec.name;
  const rawSecondary = spec.searchTerms[1] || rawPrimary;
  // Remove palavras-ísca de bancos com marca d'água nas queries do Bing
  const cleanBing = (s) =>
    s.replace(/\b(isolated|realista|png|transparent)\b/gi, '').replace(/\s+/g, ' ').trim();

  const bingPrimary = cleanBing(rawPrimary) || spec.name;
  const bingSecondary = cleanBing(rawSecondary) || bingPrimary;

  return [
    {
      tier: 'wikimedia-png',
      label: 'PNG Transparente Aberto (Wikimedia)',
      engine: 'wikimedia',
      query: bingSecondary
    },
    {
      tier: 'loja-produto',
      label: 'Produto Unitário de Loja / Estúdio',
      engine: 'bing',
      qft: '+filterui:imagesize-large',
      query: `${bingPrimary} loja ${negatives}`
    },
    {
      tier: 'mercado-decoracao',
      label: 'Acervo Festa Unitário',
      engine: 'bing',
      qft: '+filterui:imagesize-large',
      query: `${bingPrimary} decoracao festa ${negatives}`
    },
    {
      tier: 'png-aberto',
      label: 'PNG Aberto Geral',
      engine: 'bing',
      qft: '+filterui:imagesize-large',
      query: `${bingSecondary} png ${negatives}`
    }
  ];
}

/**
 * Extrai candidatos estruturados do HTML do Bing Images (murl, purl, título e descrição).
 */
export function extractBingCandidates(html, tierMeta) {
  const results = [];
  const seenUrls = new Set();
  const seenMd5 = new Set();

  const matches = [...html.matchAll(/m="(\{[^"]*?murl[^"]*?\})"/g)];
  for (const m of matches) {
    try {
      const jsonStr = m[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'");
      const obj = JSON.parse(jsonStr);
      const url = obj.murl;
      if (!url || typeof url !== 'string' || !url.startsWith('http')) continue;
      if (seenUrls.has(url)) continue;
      if (obj.md5 && seenMd5.has(obj.md5)) continue;

      seenUrls.add(url);
      if (obj.md5) seenMd5.add(obj.md5);

      results.push({
        url,
        pageUrl: obj.purl || '',
        title: obj.t || '',
        desc: obj.desc || '',
        md5: obj.md5 || '',
        tier: tierMeta.tier,
        tierLabel: tierMeta.label
      });
    } catch {
      // Ignora entradas JSON malformadas
    }
  }

  // Fallback caso o markup retorne apenas murl escapado
  if (results.length === 0) {
    const rawMatches = [...html.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)];
    for (const rm of rawMatches) {
      const url = rm[1];
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        results.push({
          url,
          pageUrl: '',
          title: '',
          desc: '',
          md5: '',
          tier: tierMeta.tier,
          tierLabel: tierMeta.label
        });
      }
    }
  }

  return results;
}

/**
 * Pontua e filtra candidatos antes mesmo do download usando semântica de título, domínio e URL.
 */
export function scoreCandidateMetadata(candidate, spec) {
  const urlLower = candidate.url.toLowerCase();
  const pageLower = (candidate.pageUrl || '').toLowerCase();
  const normText = normalizeText(`${candidate.title} ${candidate.desc} ${candidate.url} ${candidate.pageUrl}`);

  if (urlLower.includes('.svg') || urlLower.includes('.gif') || urlLower.includes('.ico')) {
    return { accepted: false, score: -999, reason: 'formato-nao-suportado' };
  }

  if (/(?:fotos-premium|vetores-premium|premium-photo|premium-psd|premium-vector)/i.test(urlLower)) {
    return { accepted: false, score: -999, reason: 'conteudo-premium-freepik' };
  }

  if (/[?&](?:w|width)=(?:1\d\d|2\d\d|3\d\d)\b/i.test(urlLower)) {
    return { accepted: false, score: -999, reason: 'miniatura-url-pequena' };
  }

  for (const domain of BLOCKED_STOCK_DOMAINS) {
    if (urlLower.includes(domain.toLowerCase()) || pageLower.includes(domain.toLowerCase())) {
      return { accepted: false, score: -999, reason: `banco-com-marca-dagua (${domain})` };
    }
  }

  for (const pattern of NEGATIVE_TITLE_PATTERNS) {
    if (pattern.test(normText)) {
      return { accepted: false, score: -999, reason: `item-composto-ou-fora-padrao (${pattern.source})` };
    }
  }

  // Garante relevância semântica mínima (elimina resultados aleatórios que não têm o objeto buscado!)
  const reqTerms = (spec.requiredTerms || []).map(normalizeText).filter(Boolean);
  if (reqTerms.length > 0) {
    const hasRequired = reqTerms.some((term) => normText.includes(term));
    if (!hasRequired) {
      return { accepted: false, score: -999, reason: `sem-palavra-chave-obrigatoria (${reqTerms.join('/')})` };
    }
  }

  let score = 50;

  if (candidate.tier === 'png-transparente') score += 16;
  else if (candidate.tier === 'studio-isolado') score += 10;

  if (urlLower.includes('.png')) score += 14;
  if (urlLower.includes('.webp')) score += 8;

  for (const goodDomain of PREFERRED_TRANSPARENT_DOMAINS) {
    if (urlLower.includes(goodDomain) || pageLower.includes(goodDomain)) {
      score += 18;
      break;
    }
  }

  for (const cdn of TRUSTED_PRODUCT_CDNS) {
    if (urlLower.includes(cdn)) {
      score += 8;
      break;
    }
  }

  if (/\b(png|transparente|transparent|sem fundo|isolated|fundo branco)\b/.test(normText)) {
    score += 12;
  }

  if (/(_thumb|-150x150|-200x200|-300x300|thumbnail|w=150|w=200|h=150)/.test(urlLower)) {
    score -= 28;
  }

  // Quantos termos descritivos aparecem
  const extraMatches = reqTerms.filter((term) => normText.includes(term)).length;
  score += Math.min(12, extraMatches * 4);

  return { accepted: true, score, reason: 'ok' };
}

/**
 * Preenche furos internos na máscara alfa (áreas claras do objeto não devem ficar transparentes).
 */
export function fillAlphaHoles(alphaChannel, width, height, alphaCutoff = 40) {
  const isOutside = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    const topIdx = x;
    if (alphaChannel[topIdx] < alphaCutoff) {
      isOutside[topIdx] = 1;
      queue.push(topIdx);
    }
    const btmIdx = (height - 1) * width + x;
    if (alphaChannel[btmIdx] < alphaCutoff) {
      isOutside[btmIdx] = 1;
      queue.push(btmIdx);
    }
  }

  for (let y = 0; y < height; y++) {
    const leftIdx = y * width;
    if (!isOutside[leftIdx] && alphaChannel[leftIdx] < alphaCutoff) {
      isOutside[leftIdx] = 1;
      queue.push(leftIdx);
    }
    const rightIdx = y * width + (width - 1);
    if (!isOutside[rightIdx] && alphaChannel[rightIdx] < alphaCutoff) {
      isOutside[rightIdx] = 1;
      queue.push(rightIdx);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    if (cx > 0 && !isOutside[curr - 1] && alphaChannel[curr - 1] < alphaCutoff) {
      isOutside[curr - 1] = 1;
      queue.push(curr - 1);
    }
    if (cx < width - 1 && !isOutside[curr + 1] && alphaChannel[curr + 1] < alphaCutoff) {
      isOutside[curr + 1] = 1;
      queue.push(curr + 1);
    }
    if (cy > 0 && !isOutside[curr - width] && alphaChannel[curr - width] < alphaCutoff) {
      isOutside[curr - width] = 1;
      queue.push(curr - width);
    }
    if (cy < height - 1 && !isOutside[curr + width] && alphaChannel[curr + width] < alphaCutoff) {
      isOutside[curr + width] = 1;
      queue.push(curr + width);
    }
  }

  const newAlpha = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    if (isOutside[i]) {
      newAlpha[i] = alphaChannel[i] < alphaCutoff ? 0 : alphaChannel[i];
    } else {
      newAlpha[i] = 255;
    }
  }
  return newAlpha;
}

/**
 * Verifica se a imagem original já possui fundo nativamente transparente e limpo.
 */
async function detectNativeTransparency(rawBuffer, origMeta) {
  if (!origMeta.hasAlpha || origMeta.channels < 4) {
    return { isNativeTransparent: false };
  }

  const sampleSize = 128;
  const { data, info } = await sharp(rawBuffer)
    .ensureAlpha()
    .resize(sampleSize, sampleSize, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  let totalTransparent = 0;
  let totalOpaque = 0;
  let borderPixels = 0;
  let borderTransparent = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      const isBorder = x < 4 || x >= w - 4 || y < 4 || y >= h - 4;
      if (isBorder) {
        borderPixels++;
        if (a < 25) borderTransparent++;
      }
      if (a < 25) totalTransparent++;
      else if (a > 200) totalOpaque++;
    }
  }

  const borderTransRatio = borderTransparent / (borderPixels || 1);
  const opaqueRatio = totalOpaque / (w * h);
  const transRatio = totalTransparent / (w * h);

  // Precisa ter borda majoritariamente transparente e objeto real no interior
  const isNativeTransparent = borderTransRatio >= 0.52 && transRatio >= 0.12 && opaqueRatio >= 0.08 && opaqueRatio <= 0.88;
  return { isNativeTransparent, borderTransRatio, opaqueRatio };
}

/**
 * Avalia se o fundo opaco é limpo (estúdio branco/neutro) ou cenário caótico.
 */
async function analyzeOpaqueBackground(rawBuffer) {
  const sampleSize = 96;
  const { data, info } = await sharp(rawBuffer)
    .removeAlpha()
    .resize(sampleSize, sampleSize, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const samples = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const isBorder = x < 5 || x >= w - 5 || y < 5 || y >= h - 5;
      if (!isBorder) continue;
      const idx = (y * w + x) * 3;
      samples.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  }

  let meanR = 0, meanG = 0, meanB = 0;
  for (const [r, g, b] of samples) {
    meanR += r;
    meanG += g;
    meanB += b;
  }
  const n = samples.length || 1;
  meanR /= n;
  meanG /= n;
  meanB /= n;

  let variance = 0;
  for (const [r, g, b] of samples) {
    variance += ((r - meanR) ** 2 + (g - meanG) ** 2 + (b - meanB) ** 2) / 3;
  }
  const stdDev = Math.sqrt(variance / n);
  const avgLuma = 0.299 * meanR + 0.587 * meanG + 0.114 * meanB;

  return {
    avgLuma,
    stdDev,
    isCleanStudio: avgLuma >= 220 && stdDev <= 32,
    isVeryCluttered: stdDev > 68
  };
}

/**
 * Analisa componentes conexos da máscara final para detectar colagens / kits multi-itens,
 * além de medir preenchimento e nitidez.
 */
async function analyzeCutoutQuality(trimmedBuffer) {
  const size = 128;
  const { data, info } = await sharp(trimmedBuffer)
    .ensureAlpha()
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const mask = new Uint8Array(w * h);
  let fgCount = 0;

  // Para cálculo simples de nitidez (variância de gradiente dentro da área opaca)
  const luma = new Float32Array(w * h);

  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3];
    luma[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    if (a > 50) {
      mask[i] = 1;
      fgCount++;
    }
  }

  let edgeEnergySum = 0;
  let edgeSamples = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (!mask[idx]) continue;
      const lap = Math.abs(
        4 * luma[idx] - luma[idx - 1] - luma[idx + 1] - luma[idx - w] - luma[idx + w]
      );
      edgeEnergySum += lap;
      edgeSamples++;
    }
  }
  const sharpness = edgeSamples > 0 ? edgeEnergySum / edgeSamples : 0;

  // BFS 8-conectado para contar ilhas independentes (detecta kits / múltiplos itens soltos)
  const visited = new Uint8Array(w * h);
  const componentSizes = [];
  const queue = new Int32Array(w * h);

  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || visited[i]) continue;
    let head = 0;
    let tail = 0;
    queue[tail++] = i;
    visited[i] = 1;

    while (head < tail) {
      const curr = queue[head++];
      const cx = curr % w;
      const cy = Math.floor(curr / w);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const ni = ny * w + nx;
            if (mask[ni] && !visited[ni]) {
              visited[ni] = 1;
              queue[tail++] = ni;
            }
          }
        }
      }
    }
    componentSizes.push(tail);
  }

  componentSizes.sort((a, b) => b - a);
  const mainShare = fgCount > 0 && componentSizes.length > 0 ? componentSizes[0] / fgCount : 0;
  const significantComponents = componentSizes.filter((sz) => sz >= Math.max(18, fgCount * 0.04)).length;

  // Preenchimento real da caixa original (antes de fit: contain quadrado)
  const rawMeta = await sharp(trimmedBuffer).metadata();
  const origRaw = await sharp(trimmedBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let opaqueOrig = 0;
  for (let i = 3; i < origRaw.data.length; i += 4) {
    if (origRaw.data[i] > 50) opaqueOrig++;
  }
  const fillRatio = opaqueOrig / ((rawMeta.width * rawMeta.height) || 1);

  return {
    significantComponents,
    mainComponentShare: mainShare,
    fillRatio,
    sharpness
  };
}

export async function checkEdgeTouch(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let topTouch = 0, bottomTouch = 0, leftTouch = 0, rightTouch = 0;

  for (let x = 0; x < width; x++) {
    if (data[x * channels + 3] > 50) topTouch++;
    if (data[((height - 1) * width + x) * channels + 3] > 50) bottomTouch++;
  }
  for (let y = 0; y < height; y++) {
    if (data[(y * width) * channels + 3] > 50) leftTouch++;
    if (data[(y * width + (width - 1)) * channels + 3] > 50) rightTouch++;
  }

  return {
    topTouchPercent: (topTouch / width) * 100,
    bottomTouchPercent: (bottomTouch / width) * 100,
    leftTouchPercent: (leftTouch / height) * 100,
    rightTouchPercent: (rightTouch / height) * 100
  };
}

/**
 * Processa um candidato completo: valida resolução, preserva transparência nativa ou recorta via IA,
 * bloqueia compostos/cortes/borrões e devolve buffer WebP pronto + nota final.
 */
export async function evaluateAndProcessCandidate(rawBuffer, candidateMeta, metaScore, spec, removeBgFromBuffer) {
  let origImage = sharp(rawBuffer);
  let origMeta = await origImage.metadata();

  if (!origMeta.width || !origMeta.height) {
    return { accepted: false, reason: 'dimensoes-invalidas' };
  }

  const maxSide = Math.max(origMeta.width, origMeta.height);
  const minSide = Math.min(origMeta.width, origMeta.height);
  if (maxSide < 400 || minSide < 240) {
    return { accepted: false, reason: `baixa-resolucao (${origMeta.width}x${origMeta.height})` };
  }

  const nativeCheck = await detectNativeTransparency(rawBuffer, origMeta);
  let alphaSource = 'ia-recorte';
  let bgBonus = 0;
  let trimmedBuffer;

  if (nativeCheck.isNativeTransparent) {
    alphaSource = 'alpha-nativo';
    bgBonus = 26;
    trimmedBuffer = await sharp(rawBuffer)
      .rotate()
      .ensureAlpha()
      .trim({ threshold: 10 })
      .png()
      .toBuffer();
  } else {
    const bgStats = await analyzeOpaqueBackground(rawBuffer);
    if (bgStats.isCleanStudio) {
      bgBonus = 15;
    } else if (bgStats.isVeryCluttered) {
      bgBonus = -18;
    }

    const { data: origRgb, info: rgbInfo } = await sharp(rawBuffer)
      .rotate()
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const orientedPng = await sharp(origRgb, {
      raw: { width: rgbInfo.width, height: rgbInfo.height, channels: 3 }
    }).png().toBuffer();

    const bgRemovedBuffer = await removeBgFromBuffer(orientedPng);
    const { data: bgRgba } = await sharp(bgRemovedBuffer)
      .ensureAlpha()
      .resize(rgbInfo.width, rgbInfo.height)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const alphaChannel = new Uint8Array(rgbInfo.width * rgbInfo.height);
    for (let j = 0; j < alphaChannel.length; j++) {
      alphaChannel[j] = bgRgba[j * 4 + 3];
    }

    const solidAlpha = fillAlphaHoles(alphaChannel, rgbInfo.width, rgbInfo.height, 40);
    const combinedRgba = Buffer.alloc(rgbInfo.width * rgbInfo.height * 4);
    for (let j = 0; j < rgbInfo.width * rgbInfo.height; j++) {
      combinedRgba[j * 4] = origRgb[j * 3];
      combinedRgba[j * 4 + 1] = origRgb[j * 3 + 1];
      combinedRgba[j * 4 + 2] = origRgb[j * 3 + 2];
      combinedRgba[j * 4 + 3] = solidAlpha[j];
    }

    trimmedBuffer = await sharp(combinedRgba, {
      raw: { width: rgbInfo.width, height: rgbInfo.height, channels: 4 }
    })
      .trim()
      .png()
      .toBuffer();
  }

  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  if (!trimmedMeta.width || !trimmedMeta.height) {
    return { accepted: false, reason: 'recorte-vazio' };
  }

  const trimMax = Math.max(trimmedMeta.width, trimmedMeta.height);
  if (trimMax < 280) {
    return { accepted: false, reason: `objeto-muito-pequeno-apos-recorte (${trimmedMeta.width}x${trimmedMeta.height})` };
  }

  const touch = await checkEdgeTouch(trimmedBuffer);
  if (touch.topTouchPercent > 4.5 || touch.leftTouchPercent > 4.5 || touch.rightTouchPercent > 4.5) {
    return {
      accepted: false,
      reason: `cortado-nas-bordas (top:${touch.topTouchPercent.toFixed(1)}% L:${touch.leftTouchPercent.toFixed(1)}% R:${touch.rightTouchPercent.toFixed(1)}%)`
    };
  }

  const aspect = trimmedMeta.width / trimmedMeta.height;
  if (aspect < (spec.minAspect || 0.28) || aspect > (spec.maxAspect || 2.1)) {
    return { accepted: false, reason: `proporcao-incompativel (${aspect.toFixed(2)})` };
  }

  const quality = await analyzeCutoutQuality(trimmedBuffer);
  if (quality.significantComponents > (spec.maxComponents || 2) || quality.mainComponentShare < (spec.minMainShare || 0.72)) {
    return {
      accepted: false,
      reason: `imagem-composta-ou-fragmentada (${quality.significantComponents} ilhas, principal ${(quality.mainComponentShare * 100).toFixed(0)}%)`
    };
  }

  if (quality.fillRatio < 0.14 || quality.fillRatio > 0.94) {
    return { accepted: false, reason: `preenchimento-invalido (${(quality.fillRatio * 100).toFixed(0)}%)` };
  }

  if (quality.sharpness < 7.5) {
    return { accepted: false, reason: `imagem-borrada-ou-baixa-nitidez (${quality.sharpness.toFixed(1)})` };
  }

  // Otimiza tamanho mantendo alta nitidez (target max 1200px para catálogo web rápido)
  let pipeline = sharp(trimmedBuffer);
  if (trimMax > 1200) {
    pipeline = pipeline.resize(1200, 1200, { fit: 'inside', withoutEnlargement: true });
  }
  const webpBuffer = await pipeline.webp({ quality: 90 }).toBuffer();
  const finalMeta = await sharp(webpBuffer).metadata();

  const resScore = Math.min(18, Math.round((trimMax / 900) * 18));
  const sharpScore = Math.min(14, Math.round((quality.sharpness / 35) * 14));
  const isolationScore = quality.significantComponents === 1 ? 12 : 4;
  const totalScore = Math.max(
    0,
    Math.min(100, Math.round(metaScore * 0.45 + bgBonus + resScore + sharpScore + isolationScore))
  );

  return {
    accepted: true,
    score: totalScore,
    alphaSource,
    widthPx: finalMeta.width,
    heightPx: finalMeta.height,
    sizeKb: Number((webpBuffer.length / 1024).toFixed(1)),
    aspectRatio: Number(aspect.toFixed(3)),
    sharpness: Number(quality.sharpness.toFixed(1)),
    components: quality.significantComponents,
    fillRatio: Number(quality.fillRatio.toFixed(2)),
    url: candidateMeta.url,
    title: candidateMeta.title,
    tier: candidateMeta.tier,
    webpBuffer
  };
}

/**
 * Gera página HTML de revisão visual com fundo quadriculado de transparência.
 */
export function buildCurationHtml(themeTitle, itemReports) {
  const sections = itemReports
    .map((item) => {
      const cards = item.candidates
        .map((c, idx) => `
          <div class="card">
            <div class="badge-row">
              <span class="rank">#${idx + 1} • Nota ${c.score}/100</span>
              <span class="src ${c.alphaSource === 'alpha-nativo' ? 'native' : 'ai'}">${c.alphaSource}</span>
            </div>
            <div class="checker">
              <img src="./${item.slug}/${c.fileName}" alt="${c.title || item.name}" />
            </div>
            <div class="meta">
              <div><strong>${c.widthPx}×${c.heightPx}px</strong> • ${c.sizeKb} KB • ilhas: ${c.components}</div>
              <div class="title" title="${(c.title || '').replace(/"/g, '&quot;')}">${c.title || 'Sem título'}</div>
              <code>${c.fileName}</code>
            </div>
          </div>
        `)
        .join('\n');

      return `
        <section class="item-block">
          <h2>${item.name} <span>(${item.slug} • ${item.widthCm}×${item.heightCm} cm)</span></h2>
          ${item.candidates.length ? `<div class="grid">${cards}</div>` : '<p class="empty">Nenhum candidato atingiu o padrão mínimo de qualidade.</p>'}
        </section>
      `;
    })
    .join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Curadoria de Elementos — ${themeTitle}</title>
<style>
  body { font-family: system-ui, sans-serif; background: #18181b; color: #f4f4f5; margin: 0; padding: 24px; }
  h1 { margin-top: 0; color: #f59e0b; }
  .item-block { margin-bottom: 36px; border-top: 1px solid #27272a; padding-top: 20px; }
  h2 span { font-size: 0.85rem; font-weight: 400; color: #a1a1aa; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .card { background: #27272a; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
  .badge-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; font-weight: 700; }
  .rank { color: #fbbf24; }
  .src { padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; }
  .src.native { background: #14532d; color: #86efac; }
  .src.ai { background: #1e3a8a; color: #93c5fd; }
  .checker { height: 220px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 12px;
    background-color: #e5e7eb;
    background-image: linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%);
    background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0; }
  .checker img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .meta { font-size: 0.78rem; color: #d4d4d8; display: flex; flex-direction: column; gap: 4px; }
  .title { color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  code { color: #fbbf24; font-size: 0.75rem; }
</style>
</head>
<body>
  <h1>Curadoria Visual — ${themeTitle}</h1>
  ${sections}
</body>
</html>`;
}
