/**
 * Pipeline Inteligente de Pesquisa, Curadoria e Aquisição de Elementos Reais
 *
 * Modos de uso:
 * 1) Listar temas e tendências planejadas:
 *    node scripts/fetch-theme-items.mjs --list-themes
 *    node scripts/fetch-theme-items.mjs --plan jardim-encantado
 *
 * 2) Pesquisar e curar Top-3 candidatos por peça (NÃO grava em public/items até aprovação visual):
 *    node scripts/fetch-theme-items.mjs --theme=jardim-encantado
 *    node scripts/fetch-theme-items.mjs --theme="pascoa" --items="coelhinho pelucia,cesta ovos"
 *
 * 3) Promover candidatos aprovados visualmente para public/items/ + gerar snippets de presets-data.ts:
 *    node scripts/fetch-theme-items.mjs --promote=jardim-encantado --pick=display-jardim-cogumelo:1,display-jardim-borboleta:2
 */

import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  THEME_CATALOG_PLANS,
  resolveItemSpec,
  buildSmartQueries,
  extractBingCandidates,
  scoreCandidateMetadata,
  evaluateAndProcessCandidate,
  buildCurationHtml,
  slugify
} from './element-curation-engine.mjs';

const CURATED_ROOT = path.resolve('.tmp_curated');
const DOWNLOAD_TMP_ROOT = path.resolve('.tmp_downloads');
const PUBLIC_ITEMS_DIR = path.resolve('public', 'items');

async function fetchWikimediaPngs(query, tierMeta) {
  const searchTerm = `${query} filemime:image/png`;
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(searchTerm)}&gsrlimit=12&prop=imageinfo&iiprop=url|size|mime&format=json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MinhaFestaCurator/1.0 (https://app.minha-festa.local)' },
      signal: controller.signal
    });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});
    const candidates = [];
    for (const p of pages) {
      const info = p?.imageinfo?.[0];
      if (!info?.url || info.mime !== 'image/png') continue;
      if (Math.max(info.width || 0, info.height || 0) < 400) continue;
      candidates.push({
        url: info.url.split('?')[0],
        pageUrl: info.descriptionurl || '',
        title: (p.title || '').replace(/^File:/i, ''),
        desc: 'Wikimedia Commons PNG',
        md5: '',
        tier: tierMeta.tier,
        tierLabel: tierMeta.label
      });
    }
    return candidates;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function fetchBingSearchHtml(query, qft = '') {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(query);
    const qftParam = qft ? `&qft=${encodeURIComponent(qft)}` : '';
    const url = `https://www.bing.com/images/search?q=${encoded}${qftParam}&form=HDRSC2&first=1`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 12000
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    );
    req.on('timeout', () => req.destroy(new Error('Search timeout')));
    req.on('error', reject);
  });
}

async function downloadBuffer(url, destPath, referer = '') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8'
    };
    if (referer) {
      headers.Referer = referer;
    }
    const res = await fetch(url, { headers, redirect: 'follow', signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (contentType && !contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
      throw new Error(`Tipo não-imagem (${contentType.split(';')[0]})`);
    }
    if (contentType.includes('svg') || contentType.includes('gif')) {
      throw new Error(`Formato ignorado (${contentType.split(';')[0]})`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (destPath) fs.writeFileSync(destPath, buf);
    return buf;
  } finally {
    clearTimeout(timer);
  }
}

async function removeBgViaBuffer(rawBuffer, tempPath) {
  const pngPath = `${tempPath}.png`;
  try {
    const normalizedPng = await sharp(rawBuffer).ensureAlpha().png().toBuffer();
    fs.writeFileSync(pngPath, normalizedPng);
    const blob = await removeBackground(pathToFileURL(pngPath).href);
    return Buffer.from(await blob.arrayBuffer());
  } finally {
    try {
      if (fs.existsSync(pngPath)) fs.unlinkSync(pngPath);
    } catch {}
  }
}

/**
 * Pesquisa multi-tier, filtra semanticamente e ranqueia até Top-N candidatos limpos por elemento.
 */
export async function curateCandidatesForSpec(spec, options = {}) {
  const topN = options.topN || 3;
  const maxDownloads = options.maxDownloads || 14;
  const queries = buildSmartQueries(spec);

  console.log(`\n🔍 Curando "${spec.name}" (${spec.slug})...`);
  const allCandidates = [];
  const seenUrls = new Set();

  for (const q of queries) {
    try {
      console.log(`   [${q.tier}] Buscando: "${q.query}"`);
      const parsed =
        q.engine === 'wikimedia'
          ? await fetchWikimediaPngs(q.query, q)
          : extractBingCandidates(await fetchBingSearchHtml(q.query, q.qft), q);
      for (const c of parsed) {
        if (!seenUrls.has(c.url)) {
          seenUrls.add(c.url);
          allCandidates.push(c);
        }
      }
    } catch (err) {
      console.log(`   ⚠️ Falha na busca [${q.tier}]: ${err.message}`);
    }
  }

  // Pré-seleção e ranqueamento semântico ANTES de baixar imagens
  const preFiltered = [];
  let rejectedMetaCount = 0;

  for (const cand of allCandidates) {
    const verdict = scoreCandidateMetadata(cand, spec);
    if (verdict.accepted) {
      preFiltered.push({ cand, metaScore: verdict.score });
    } else {
      rejectedMetaCount++;
    }
  }

  // Intercala os melhores candidatos de cada tier (PNG nativo, estúdio isolado, mercado real)
  // para evitar que miniaturas 360x360 de um único tier consumam todo o orçamento de downloads.
  const byTier = new Map();
  for (const item of preFiltered) {
    const t = item.cand.tier || 'other';
    if (!byTier.has(t)) byTier.set(t, []);
    byTier.get(t).push(item);
  }
  const orderedQueue = [];
  const tierQueues = [...byTier.values()].map((list) => list.sort((a, b) => b.metaScore - a.metaScore));
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const q of tierQueues) {
      if (q.length > 0) {
        orderedQueue.push(q.shift());
        remaining = true;
      }
    }
  }

  console.log(
    `   📊 ${allCandidates.length} URLs encontradas -> ${orderedQueue.length} passaram no filtro semântico (${rejectedMetaCount} kits/marcas/ruído descartados).`
  );

  if (!fs.existsSync(DOWNLOAD_TMP_ROOT)) fs.mkdirSync(DOWNLOAD_TMP_ROOT, { recursive: true });
  const approved = [];
  let processedImages = 0;
  const maxAttempts = Math.min(orderedQueue.length, 45);

  for (let i = 0; i < maxAttempts; i++) {
    if (processedImages >= maxDownloads || approved.length >= topN * 2) break;
    const { cand, metaScore } = orderedQueue[i];
    const tmpRawPath = path.join(DOWNLOAD_TMP_ROOT, `${spec.slug}_${i}.tmp`);

    try {
      const rawBuf = await downloadBuffer(cand.url, tmpRawPath, cand.pageUrl);
      if (rawBuf.length < 15000) {
        console.log(`   [${i + 1}] ❌ Arquivo pequeno (${rawBuf.length} B)`);
        continue;
      }

      // Garante que o buffer é uma imagem real decodificável antes de contabilizar no orçamento
      await sharp(rawBuf).metadata();
      processedImages++;

      const result = await evaluateAndProcessCandidate(
        rawBuf,
        cand,
        metaScore,
        spec,
        (buf) => removeBgViaBuffer(buf, tmpRawPath)
      );

      if (!result.accepted) {
        console.log(`   [${i + 1}] ❌ Rejeitado: ${result.reason}`);
        continue;
      }

      console.log(
        `   [${i + 1}] ✅ Nota ${result.score}/100 | ${result.alphaSource} | ${result.widthPx}x${result.heightPx}px (${result.sizeKb} KB) | ilhas: ${result.components}`
      );
      approved.push(result);
    } catch (err) {
      console.log(`   [${i + 1}] ⚠️ Pulado (${err.message})`);
    } finally {
      try {
        if (fs.existsSync(tmpRawPath)) fs.unlinkSync(tmpRawPath);
      } catch {}
    }
  }

  approved.sort((a, b) => b.score - a.score);
  return approved.slice(0, topN);
}

/**
 * Retrocompatibilidade com chamadas diretas `processItem(query, slug)` usando curadoria inteligente.
 */
export async function processItem(searchQuery, itemSlug) {
  const spec = resolveItemSpec('', searchQuery, { slug: itemSlug, searchTerms: [searchQuery] });
  const winners = await curateCandidatesForSpec(spec, { topN: 1, maxDownloads: 10 });
  if (winners.length === 0) {
    throw new Error(`Nenhum candidato de alta qualidade encontrado para "${searchQuery}"`);
  }
  const best = winners[0];
  if (!fs.existsSync(PUBLIC_ITEMS_DIR)) fs.mkdirSync(PUBLIC_ITEMS_DIR, { recursive: true });
  const finalWebpPath = path.join(PUBLIC_ITEMS_DIR, `${itemSlug}.webp`);
  fs.writeFileSync(finalWebpPath, best.webpBuffer);
  console.log(`   🎯 Promovido vencedor (nota ${best.score}/100, ${best.alphaSource}) -> public/items/${itemSlug}.webp`);

  return {
    slug: itemSlug,
    widthPx: best.widthPx,
    heightPx: best.heightPx,
    aspectRatio: best.aspectRatio,
    sourceUrl: best.url,
    score: best.score,
    alphaSource: best.alphaSource
  };
}

function parseCliArgs(argv) {
  const opts = {
    listThemes: false,
    plan: '',
    theme: '',
    items: [],
    top: 3,
    auto: false,
    promote: '',
    pick: {},
    category: '',
    type: ''
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--list-themes') opts.listThemes = true;
    else if (arg === '--auto') opts.auto = true;
    else if (arg === '--plan' && argv[i + 1]) opts.plan = argv[++i];
    else if (arg.startsWith('--plan=')) opts.plan = arg.slice(7);
    else if (arg.startsWith('--theme=')) opts.theme = arg.slice(8);
    else if (arg === '--theme' && argv[i + 1]) opts.theme = argv[++i];
    else if (arg.startsWith('--items=')) opts.items = arg.slice(8).split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg.startsWith('--top=')) opts.top = Math.max(1, Math.min(5, Number(arg.slice(6)) || 3));
    else if (arg.startsWith('--promote=')) opts.promote = arg.slice(10);
    else if (arg.startsWith('--category=')) opts.category = arg.slice(11);
    else if (arg.startsWith('--type=')) opts.type = arg.slice(7);
    else if (arg.startsWith('--pick=')) {
      const pairs = arg.slice(7).split(',').map((s) => s.trim()).filter(Boolean);
      for (const p of pairs) {
        const [k, v] = p.split(':');
        if (k) opts.pick[k.trim()] = Number(v) || 1;
      }
    }
  }
  return opts;
}

function printThemePlan(themeSlug) {
  const key = slugify(themeSlug);
  const plan = THEME_CATALOG_PLANS[key];
  if (!plan) {
    console.log(`\nTema "${themeSlug}" ainda não possui blueprint pré-cadastrado.`);
    console.log(`Temas disponíveis: ${Object.keys(THEME_CATALOG_PLANS).join(', ')}\n`);
    return;
  }
  console.log(`\n=== Plano Curado de Tendências: ${plan.title} ===`);
  console.log(`Tendência: ${plan.trendNotes}\n`);
  for (const it of plan.items) {
    console.log(
      `- [${it.slug}] ${it.name} | Cat: ${it.category} | Pos: ${it.placement} | ${it.widthCm}×${it.heightCm} cm`
    );
  }
  console.log('');
}

async function promoteCuratedItems(themeSlug, pickMap) {
  const normTheme = slugify(themeSlug);
  const themeDir = path.join(CURATED_ROOT, normTheme);
  const reportPath = path.join(themeDir, 'curation-report.json');
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Relatório de curadoria não encontrado em ${reportPath}`);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  if (!fs.existsSync(PUBLIC_ITEMS_DIR)) fs.mkdirSync(PUBLIC_ITEMS_DIR, { recursive: true });

  console.log(`\n📦 Promovendo itens aprovados de "${report.themeTitle}" para public/items/...\n`);
  const presetSnippets = [];

  for (const item of report.items) {
    if (!item.candidates.length) continue;
    const chosenRank = pickMap[item.slug] || (Object.keys(pickMap).length === 0 ? 1 : 0);
    if (!chosenRank) continue;

    const candidate = item.candidates[chosenRank - 1];
    if (!candidate) {
      console.log(`⚠️ Candidato #${chosenRank} inexistente para ${item.slug}`);
      continue;
    }

    const srcFile = path.join(themeDir, item.slug, candidate.fileName);
    const destFile = path.join(PUBLIC_ITEMS_DIR, `${item.slug}.webp`);

    // Garante otimização final (< 120 KB quando possível mantendo qualidade)
    let buf = fs.readFileSync(srcFile);
    if (buf.length > 120 * 1024) {
      buf = await sharp(buf).resize(900, 900, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    }
    fs.writeFileSync(destFile, buf);

    const calcWidth = item.heightCm ? Math.max(10, Math.round(candidate.aspectRatio * item.heightCm)) : item.widthCm;
    const entry = {
      id: `preset-${item.slug}`,
      name: item.name,
      category: item.category,
      type: item.type,
      svgRole: 'photo',
      widthCm: calcWidth,
      heightCm: item.heightCm,
      previewUrl: `/items/${item.slug}.webp`,
      isCustom: false,
      stockQuantity: 1,
      rentalPrice: item.category === 'acessorios' ? 20 : item.placement === 'chao' ? 35 : 22
    };
    presetSnippets.push(entry);
    console.log(`✅ public/items/${item.slug}.webp (${(buf.length / 1024).toFixed(1)} KB, ${calcWidth}×${item.heightCm} cm)`);
  }

  console.log('\n📋 Snippets prontos para src/core/presets-data.ts:\n');
  console.log(JSON.stringify(presetSnippets, null, 2));
}

async function runCli() {
  const opts = parseCliArgs(process.argv.slice(2));

  if (opts.listThemes) {
    console.log('\nTemas curados disponíveis:\n');
    for (const [k, v] of Object.entries(THEME_CATALOG_PLANS)) {
      console.log(`- ${k}: ${v.title} (${v.items.length} peças) — ${v.trendNotes}`);
    }
    console.log('');
    return;
  }

  if (opts.plan) {
    printThemePlan(opts.plan);
    return;
  }

  if (opts.promote) {
    await promoteCuratedItems(opts.promote, opts.pick);
    return;
  }

  const themeArg = opts.theme || 'safari-baby';
  const normTheme = slugify(themeArg);
  const plan = THEME_CATALOG_PLANS[normTheme];

  const specs =
    opts.items.length > 0
      ? opts.items.map((name) =>
          resolveItemSpec(normTheme, name, {
            ...(opts.category ? { category: opts.category } : {}),
            ...(opts.type ? { type: opts.type } : {})
          })
        )
      : plan
      ? plan.items
      : [resolveItemSpec(normTheme, themeArg)];

  const themeDir = path.join(CURATED_ROOT, normTheme || 'geral');
  fs.mkdirSync(themeDir, { recursive: true });

  const itemReports = [];

  for (const spec of specs) {
    const winners = await curateCandidatesForSpec(spec, { topN: opts.top, maxDownloads: 14 });
    const itemDir = path.join(themeDir, spec.slug);
    fs.mkdirSync(itemDir, { recursive: true });

    const serializedCandidates = [];
    for (let idx = 0; idx < winners.length; idx++) {
      const w = winners[idx];
      const fileName = `cand_${idx + 1}.webp`;
      fs.writeFileSync(path.join(itemDir, fileName), w.webpBuffer);

      serializedCandidates.push({
        rank: idx + 1,
        fileName,
        score: w.score,
        alphaSource: w.alphaSource,
        widthPx: w.widthPx,
        heightPx: w.heightPx,
        sizeKb: w.sizeKb,
        aspectRatio: w.aspectRatio,
        sharpness: w.sharpness,
        components: w.components,
        fillRatio: w.fillRatio,
        title: w.title,
        tier: w.tier,
        url: w.url
      });

      if (opts.auto && idx === 0) {
        if (!fs.existsSync(PUBLIC_ITEMS_DIR)) fs.mkdirSync(PUBLIC_ITEMS_DIR, { recursive: true });
        fs.writeFileSync(path.join(PUBLIC_ITEMS_DIR, `${spec.slug}.webp`), w.webpBuffer);
      }
    }

    itemReports.push({
      slug: spec.slug,
      name: spec.name,
      category: spec.category,
      type: spec.type,
      placement: spec.placement,
      widthCm: spec.widthCm,
      heightCm: spec.heightCm,
      candidates: serializedCandidates
    });
  }

  const reportPayload = {
    themeSlug: normTheme,
    themeTitle: plan?.title || themeArg,
    generatedAt: new Date().toISOString(),
    items: itemReports
  };

  fs.writeFileSync(path.join(themeDir, 'curation-report.json'), JSON.stringify(reportPayload, null, 2));
  fs.writeFileSync(path.join(themeDir, 'preview.html'), buildCurationHtml(reportPayload.themeTitle, itemReports));

  console.log(`\n✨ Curadoria salva em ${themeDir}`);
  console.log(`   Abra os .webp candidatos ou preview.html para inspeção visual antes de promover:`);
  console.log(`   node scripts/fetch-theme-items.mjs --promote=${normTheme} --pick=slug:1,...\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
  runCli().catch((err) => {
    console.error('❌ Erro no pipeline de curadoria:', err);
    process.exit(1);
  });
}
