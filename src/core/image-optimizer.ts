/**
 * Utilitários locais (100% no navegador, custo R$ 0,00) para otimização,
 * detecção de transparência, auto-trim, remoção rápida de fundo claro e WebP Alpha.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function createSizedCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Contexto 2D indisponível no navegador.');
  }
  return { canvas, ctx };
}

/**
 * Codifica canvas transparente priorizando WebP Alpha (menor uso de IndexedDB)
 * com fallback seguro para PNG se o navegador não suportar codificação WebP.
 */
export function encodeTransparentCanvas(canvas: HTMLCanvasElement, quality = 0.9): string {
  const webp = canvas.toDataURL('image/webp', quality);
  if (webp.startsWith('data:image/webp')) {
    return webp;
  }
  return canvas.toDataURL('image/png');
}

function encodeOpaqueOrTransparentCanvas(canvas: HTMLCanvasElement, preserveAlpha: boolean): string {
  if (preserveAlpha) {
    return encodeTransparentCanvas(canvas, 0.9);
  }
  return canvas.toDataURL('image/jpeg', 0.86);
}

/**
 * Verifica rapidamente se uma imagem possui canal alpha transparente útil.
 */
export async function analyzeImageTransparency(src: string): Promise<{
  hasTransparency: boolean;
  width: number;
  height: number;
}> {
  const img = await loadHtmlImage(src);
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;

  // Amostragem leve até 256px para detecção instantânea (< 5ms)
  const scale = Math.min(1, 256 / Math.max(natW, natH));
  const w = Math.max(1, Math.round(natW * scale));
  const h = Math.max(1, Math.round(natH * scale));

  const { ctx } = createSizedCanvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let transparentCount = 0;
  let borderTransparentCount = 0;
  const totalPixels = w * h;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha < 245) {
        transparentCount++;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
          borderTransparentCount++;
        }
      }
    }
  }

  const borderTotal = w * 2 + Math.max(0, h - 2) * 2;
  const hasTransparency =
    transparentCount / Math.max(1, totalPixels) >= 0.015 ||
    borderTransparentCount / Math.max(1, borderTotal) >= 0.15;

  return { hasTransparency, width: natW, height: natH };
}

/**
 * Remove margens transparentes vazias ao redor da peça (`alpha > 15`) para garantir
 * proporção exata em centímetros no palco Konva e salva em formato leve (WebP Alpha / PNG).
 */
export async function autoTrimImage(src: string, maxDim = 1024): Promise<ProcessedImageResult> {
  const img = await loadHtmlImage(src);
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;

  const { canvas: srcCanvas, ctx: srcCtx } = createSizedCanvas(natW, natH);
  srcCtx.drawImage(img, 0, 0, natW, natH);
  const { data } = srcCtx.getImageData(0, 0, natW, natH);

  let minX = natW;
  let minY = natH;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < natH; y++) {
    const rowOffset = y * natW * 4;
    for (let x = 0; x < natW; x++) {
      if (data[rowOffset + x * 4 + 3] > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return {
      dataUrl: encodeTransparentCanvas(srcCanvas),
      width: natW,
      height: natH,
      aspectRatio: natW / Math.max(1, natH)
    };
  }

  const pad = 2;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(natW - cropX, maxX - minX + 1 + pad * 2);
  const cropH = Math.min(natH - cropY, maxY - minY + 1 + pad * 2);

  const scale = Math.min(1, maxDim / Math.max(cropW, cropH));
  const outW = Math.max(1, Math.round(cropW * scale));
  const outH = Math.max(1, Math.round(cropH * scale));

  const { canvas: outCanvas, ctx: outCtx } = createSizedCanvas(outW, outH);
  outCtx.drawImage(srcCanvas, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

  return {
    dataUrl: encodeTransparentCanvas(outCanvas),
    width: outW,
    height: outH,
    aspectRatio: outW / Math.max(1, outH)
  };
}

/**
 * Redimensiona imagem qualquer em cópia leve (até maxDim px) para envio à inferência local.
 */
export async function downscaleImageForInference(src: string, maxDim = 800): Promise<Blob> {
  const img = await loadHtmlImage(src);
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  const scale = Math.min(1, maxDim / Math.max(natW, natH));
  const w = Math.max(1, Math.round(natW * scale));
  const h = Math.max(1, Math.round(natH * scale));

  const { canvas, ctx } = createSizedCanvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Falha ao preparar imagem para recorte.'));
      },
      'image/png',
      0.92
    );
  });
}

function colorDistSq(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

function extractCornerPalette(data: Uint8ClampedArray, w: number, h: number): Array<[number, number, number]> {
  const insetX = Math.min(4, Math.floor(w * 0.05));
  const insetY = Math.min(4, Math.floor(h * 0.05));
  const sampleCoords = [
    [insetX, insetY],
    [w - 1 - insetX, insetY],
    [insetX, h - 1 - insetY],
    [w - 1 - insetX, h - 1 - insetY],
    [Math.floor(w / 2), insetY],
    [Math.floor(w / 2), h - 1 - insetY]
  ];

  const palette: Array<[number, number, number]> = [];
  for (const [sx, sy] of sampleCoords) {
    const idx = (sy * w + sx) * 4;
    if (data[idx + 3] < 200) continue;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const duplicate = palette.some(([pr, pg, pb]) => colorDistSq(r, g, b, pr, pg, pb) < 18 * 18);
    if (!duplicate) palette.push([r, g, b]);
  }
  return palette.length > 0 ? palette : [[255, 255, 255]];
}

function minPaletteDistSq(r: number, g: number, b: number, palette: Array<[number, number, number]>): number {
  let minSq = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const d = colorDistSq(r, g, b, palette[i][0], palette[i][1], palette[i][2]);
    if (d < minSq) minSq = d;
  }
  return minSq;
}

/**
 * Motor instantâneo (0 MB extra, ~20ms): Flood-Fill a partir das bordas no Canvas 2D.
 * Ideal para fotos de catálogo/fornecedor em fundo branco, cinza ou parede uniforme,
 * preservando áreas internas da peça sem conexão com as bordas.
 */
export async function removeLightBackgroundFast(
  src: string,
  tolerance = 28,
  maxDim = 1024
): Promise<ProcessedImageResult> {
  const img = await loadHtmlImage(src);
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  const scale = Math.min(1, maxDim / Math.max(natW, natH));
  const w = Math.max(1, Math.round(natW * scale));
  const h = Math.max(1, Math.round(natH * scale));

  const { canvas, ctx } = createSizedCanvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const palette = extractCornerPalette(data, w, h);
  const baseTol = 14 + Math.max(0, Math.min(80, tolerance)) * 1.15;
  const baseTolSq = baseTol * baseTol;
  const stepTolSq = Math.pow(Math.max(20, baseTol * 0.65), 2);
  const featherTolSq = Math.pow(baseTol * 1.38, 2);

  const total = w * h;
  const removed = new Uint8Array(total);
  const queued = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const trySeed = (idx: number) => {
    if (queued[idx]) return;
    const p = idx * 4;
    if (data[p + 3] < 25 || minPaletteDistSq(data[p], data[p + 1], data[p + 2], palette) <= baseTolSq) {
      queued[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    trySeed(x);
    trySeed((h - 1) * w + x);
  }
  for (let y = 1; y < h - 1; y++) {
    trySeed(y * w);
    trySeed(y * w + (w - 1));
  }

  while (head < tail) {
    const idx = queue[head++];
    removed[idx] = 1;

    const p = idx * 4;
    const pr = data[p];
    const pg = data[p + 1];
    const pb = data[p + 2];
    const x = idx % w;
    const y = (idx - x) / w;

    const checkNeighbor = (nIdx: number) => {
      if (queued[nIdx]) return;
      const np = nIdx * 4;
      const nr = data[np];
      const ng = data[np + 1];
      const nb = data[np + 2];
      if (data[np + 3] < 25) {
        queued[nIdx] = 1;
        queue[tail++] = nIdx;
        return;
      }
      if (
        minPaletteDistSq(nr, ng, nb, palette) <= baseTolSq &&
        colorDistSq(pr, pg, pb, nr, ng, nb) <= stepTolSq
      ) {
        queued[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    };

    if (x > 0) checkNeighbor(idx - 1);
    if (x < w - 1) checkNeighbor(idx + 1);
    if (y > 0) checkNeighbor(idx - w);
    if (y < h - 1) checkNeighbor(idx + w);
  }

  for (let idx = 0; idx < total; idx++) {
    if (removed[idx]) {
      data[idx * 4 + 3] = 0;
    }
  }

  // Suavização anti-serrilhado de 1px apenas nos pixels de borda tocando a área removida
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (removed[idx]) continue;
      if (!removed[idx - 1] && !removed[idx + 1] && !removed[idx - w] && !removed[idx + w]) {
        continue;
      }
      const p = idx * 4;
      const dSq = minPaletteDistSq(data[p], data[p + 1], data[p + 2], palette);
      if (dSq < featherTolSq) {
        const d = Math.sqrt(dSq);
        const low = baseTol * 0.85;
        const high = baseTol * 1.38;
        const t = Math.max(0, Math.min(1, (d - low) / Math.max(1, high - low)));
        data[p + 3] = Math.round(data[p + 3] * t);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return await autoTrimImage(encodeTransparentCanvas(canvas), maxDim);
}

/**
 * Otimiza e redimensiona fotos carregadas pelo usuário (para peças do acervo ou capas).
 * Reduz fotos de celulares de 10-20MB (4000x3000px) para tamanho ideal (~1200px max, ~150-250KB),
 * preservando canal alpha (transparência) quando PNG/WebP, ou comprimindo JPEG 86% para fotos normais.
 */
export async function optimizeUserUploadedImage(file: File, maxDim = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('Falha ao ler o arquivo de imagem'));

      try {
        const img = await loadHtmlImage(src);
        const natW = img.naturalWidth || img.width;
        const natH = img.naturalHeight || img.height;

        if (natW <= maxDim && natH <= maxDim && file.size < 500 * 1024) {
          resolve(src);
          return;
        }

        const scale = Math.min(1, maxDim / Math.max(natW, natH));
        const targetW = Math.max(1, Math.round(natW * scale));
        const targetH = Math.max(1, Math.round(natH * scale));

        const { canvas, ctx } = createSizedCanvas(targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const mayHaveAlpha = file.type === 'image/png' || file.type === 'image/webp';
        resolve(encodeOpaqueOrTransparentCanvas(canvas, mayHaveAlpha));
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(file);
  });
}
