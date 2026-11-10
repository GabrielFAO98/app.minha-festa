/**
 * Pipeline de Aquisição Automatizada de Displays Reais do Mercado
 * Busca peças populares de MDF/acrílico em marketplaces (Shopee, Elo7, Mercado Livre),
 * baixa em alta resolução, remove o fundo com IA neural (@imgly),
 * preenche automaticamente furos internos em áreas claras (barriga, patas, focinho),
 * remove margens transparentes (Sharp trim), valida integridade das bordas (sem cortes)
 * e calcula proporções reais para totens de chão e displays de mesa.
 */

import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function fetchMarketImages(query) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(query);
    const req = https.get(`https://www.bing.com/images/search?q=${encoded}&form=HDRSC2&first=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [...data.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)];
        resolve(matches.map(m => m[1]));
      });
    });
    req.on('error', reject);
  });
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
      },
      timeout: 10000
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    });
    req.on('error', reject);
  });
}

/**
 * Preenche furos internos na máscara de opacidade via Flood Fill de bordas.
 * Qualquer pixel que não seja alcançável a partir das 4 bordas externas
 * pertence ao corpo do totem e recebe opacidade total (alpha = 255).
 */
function fillAlphaHoles(alphaChannel, width, height, alphaCutoff = 40) {
  const isOutside = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    const topIdx = 0 * width + x;
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
    const leftIdx = y * width + 0;
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

  // BFS Flood Fill
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1,
    ];

    for (const n of neighbors) {
      if (n >= 0 && !isOutside[n]) {
        if (alphaChannel[n] < alphaCutoff) {
          isOutside[n] = 1;
          queue.push(n);
        }
      }
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

async function checkTouch(buffer) {
  const image = sharp(buffer);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let topTouch = 0, bottomTouch = 0, leftTouch = 0, rightTouch = 0;

  for (let x = 0; x < width; x++) {
    if (data[(0 * width + x) * channels + (channels - 1)] > 50) topTouch++;
    if (data[((height - 1) * width + x) * channels + (channels - 1)] > 50) bottomTouch++;
  }

  for (let y = 0; y < height; y++) {
    if (data[(y * width + 0) * channels + (channels - 1)] > 50) leftTouch++;
    if (data[(y * width + (width - 1)) * channels + (channels - 1)] > 50) rightTouch++;
  }

  return {
    topTouchPercent: (topTouch / width) * 100,
    bottomTouchPercent: (bottomTouch / width) * 100,
    leftTouchPercent: (leftTouch / height) * 100,
    rightTouchPercent: (rightTouch / height) * 100,
  };
}

export async function processItem(searchQuery, itemSlug) {
  console.log(`\n🔍 Buscando itens reais: "${searchQuery}"...`);
  const urls = await fetchMarketImages(searchQuery);
  console.log(`   ${urls.length} imagens candidatas encontradas no mercado.`);

  const tmpDir = path.resolve('.tmp_downloads');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  for (let i = 0; i < Math.min(urls.length, 12); i++) {
    const url = urls[i];
    if (url.includes('.svg') || url.includes('.gif')) continue;

    const rawFile = path.join(tmpDir, `${itemSlug}_cand_${i}.raw`);
    try {
      console.log(`  [Candidato ${i + 1}] Baixando ${url.slice(0, 75)}...`);
      await downloadFile(url, rawFile);

      const stats = fs.statSync(rawFile);
      if (stats.size < 20000) {
        console.log(`    ❌ Arquivo muito pequeno ou corrompido (${stats.size} bytes)`);
        continue;
      }

      // 1. Extrai RGB original
      const origImage = sharp(rawFile);
      const origMeta = await origImage.metadata();
      const { data: origRgb } = await origImage.removeAlpha().raw().toBuffer({ resolveWithObject: true });

      // 2. Remoção de fundo neural (@imgly)
      console.log(`    Removendo fundo (IA neural @imgly)...`);
      const fileUrl = pathToFileURL(rawFile).href;
      const blob = await removeBackground(fileUrl);
      const bgRemovedBuffer = Buffer.from(await blob.arrayBuffer());

      // 3. Extrai canal alfa e preenche furos internos (barriga, patas, etc)
      const bgImage = sharp(bgRemovedBuffer).resize(origMeta.width, origMeta.height);
      const { data: bgRgba } = await bgImage.raw().toBuffer({ resolveWithObject: true });
      const alphaChannel = new Uint8Array(origMeta.width * origMeta.height);
      for (let j = 0; j < alphaChannel.length; j++) {
        alphaChannel[j] = bgRgba[j * 4 + 3];
      }

      const solidAlpha = fillAlphaHoles(alphaChannel, origMeta.width, origMeta.height, 40);

      // 4. Combina RGB original com Alpha sólido
      const combinedRgba = Buffer.alloc(origMeta.width * origMeta.height * 4);
      for (let j = 0; j < origMeta.width * origMeta.height; j++) {
        combinedRgba[j * 4 + 0] = origRgb[j * 3 + 0];
        combinedRgba[j * 4 + 1] = origRgb[j * 3 + 1];
        combinedRgba[j * 4 + 2] = origRgb[j * 3 + 2];
        combinedRgba[j * 4 + 3] = solidAlpha[j];
      }

      // 5. Trim automático de bordas transparentes
      const trimmedBuffer = await sharp(combinedRgba, {
        raw: {
          width: origMeta.width,
          height: origMeta.height,
          channels: 4
        }
      }).trim().toBuffer();

      const trimmedMeta = await sharp(trimmedBuffer).metadata();

      // 6. Checa se ficou cortado (orelhas, patas, etc)
      const touch = await checkTouch(trimmedBuffer);
      console.log(`    Dimensões: ${trimmedMeta.width}x${trimmedMeta.height}px | Topo: ${touch.topTouchPercent.toFixed(1)}% | Esquerda: ${touch.leftTouchPercent.toFixed(1)}% | Direita: ${touch.rightTouchPercent.toFixed(1)}%`);

      if (touch.topTouchPercent > 5 || touch.leftTouchPercent > 5 || touch.rightTouchPercent > 5) {
        console.log(`    ❌ Imagem cortada nas extremidades. Buscando próximo modelo...`);
        continue;
      }

      const aspect = trimmedMeta.width / trimmedMeta.height;
      if (aspect < 0.3 || aspect > 1.8) {
        console.log(`    ❌ Proporção atípica (${aspect.toFixed(2)}).`);
        continue;
      }

      // Salva arquivo otimizado
      const finalWebpPath = path.resolve('public', 'items', `${itemSlug}.webp`);
      await sharp(trimmedBuffer)
        .webp({ quality: 90 })
        .toFile(finalWebpPath);

      console.log(`    ✅ SUCESSO! Salvo em public/items/${itemSlug}.webp (${trimmedMeta.width}x${trimmedMeta.height}px)`);

      try { fs.unlinkSync(rawFile); } catch {}

      return {
        slug: itemSlug,
        widthPx: trimmedMeta.width,
        heightPx: trimmedMeta.height,
        aspectRatio: aspect,
        sourceUrl: url
      };
    } catch (err) {
      console.log(`    ❌ Erro no candidato ${i + 1}: ${err.message}`);
    }
  }

  throw new Error(`Não foi possível encontrar uma imagem válida e intacta para "${searchQuery}"`);
}

// Execução direta via CLI se chamado diretamente
if (process.argv[1] && process.argv[1].endsWith('fetch-theme-items.mjs')) {
  const theme = process.argv[2] || 'safari baby';
  const itemsArg = process.argv[3] || 'leao,girafa,elefante,zebra,macaco';
  const items = itemsArg.split(',').map(s => s.trim());

  console.log(`=== Pipeline de Itens de Decoração ===`);
  console.log(`Tema: ${theme}`);
  console.log(`Itens: ${items.join(', ')}`);

  (async () => {
    for (const item of items) {
      const slug = `display-${theme.toLowerCase().replace(/\s+/g, '-')}-${item.toLowerCase().replace(/\s+/g, '-')}`;
      const query = `display mdf ${theme} ${item}`;
      await processItem(query, slug);
    }
    console.log(`\n🎉 Processamento concluído com sucesso!`);
  })().catch(console.error);
}
