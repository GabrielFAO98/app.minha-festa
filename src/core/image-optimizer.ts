/**
 * Utilitários locais (100% no navegador, custo R$ 0,00) para otimização,
 * detecção de transparência, auto-trim e WebP Alpha.
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
        else reject(new Error('Não foi possível preparar a foto para recorte.'));
      },
      'image/png',
      0.92
    );
  });
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
