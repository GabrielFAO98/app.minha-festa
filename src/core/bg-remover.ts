import {
  autoTrimImage,
  downscaleImageForInference,
  type ProcessedImageResult
} from './image-optimizer';

export type BgRemovalProgressHandler = (percent: number, stageLabel: string) => void;

const aiCutoutCache = new Map<string, ProcessedImageResult>();

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler imagem recortada.'));
    reader.readAsDataURL(blob);
  });
}

function makeCacheKey(src: string): string {
  const head = src.slice(0, 64);
  const tail = src.slice(-64);
  return `${src.length}:${head}:${tail}`;
}

/**
 * Executa remoção de fundo por IA 100% local no navegador (custo R$ 0,00) usando
 * @imgly/background-removal sob demanda com modelo quantizado leve (isnet_quint8).
 */
export async function removeBackgroundLocalAI(
  sourceDataUrl: string,
  onProgress?: BgRemovalProgressHandler
): Promise<ProcessedImageResult> {
  const cacheKey = makeCacheKey(sourceDataUrl);
  const cached = aiCutoutCache.get(cacheKey);
  if (cached) {
    onProgress?.(100, 'Pronto! Fundo removido.');
    return cached;
  }

  onProgress?.(5, 'Preparando sua foto...');
  const inputBlob = await downscaleImageForInference(sourceDataUrl, 800);

  onProgress?.(10, 'Preparando recorte automático...');
  const { removeBackground } = await import('@imgly/background-removal');

  const handleProgress = (key: string, current: number, total: number) => {
    if (!onProgress || total <= 0) return;
    const ratio = Math.max(0, Math.min(1, current / total));
    if (key.includes('fetch')) {
      const pct = 10 + Math.round(ratio * 55);
      onProgress(pct, `Preparando ferramenta (só na 1ª vez): ${Math.round(ratio * 100)}%`);
    } else {
      const pct = 65 + Math.round(ratio * 25);
      onProgress(pct, 'Recortando a peça...');
    }
  };

  let outputBlob: Blob;
  try {
    outputBlob = await removeBackground(inputBlob, {
      model: 'isnet_quint8',
      device: 'gpu',
      output: { format: 'image/png', quality: 0.9 },
      progress: handleProgress
    });
  } catch {
    // Fallback seguro caso WebGPU não esteja disponível no dispositivo
    onProgress?.(55, 'Recortando a peça...');
    outputBlob = await removeBackground(inputBlob, {
      model: 'isnet_quint8',
      device: 'cpu',
      output: { format: 'image/png', quality: 0.9 },
      progress: handleProgress
    });
  }

  onProgress?.(94, 'Dando o acabamento nas bordas...');
  const rawResultDataUrl = await blobToDataUrl(outputBlob);
  const trimmed = await autoTrimImage(rawResultDataUrl, 1024);

  aiCutoutCache.set(cacheKey, trimmed);
  onProgress?.(100, 'Pronto! Fundo removido com sucesso.');
  return trimmed;
}
