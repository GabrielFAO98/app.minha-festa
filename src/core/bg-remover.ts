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
    onProgress?.(100, 'Recorte recuperado da memória.');
    return cached;
  }

  onProgress?.(5, 'Preparando imagem leve...');
  const inputBlob = await downscaleImageForInference(sourceDataUrl, 800);

  onProgress?.(10, 'Carregando motor IA local...');
  const { removeBackground } = await import('@imgly/background-removal');

  const handleProgress = (key: string, current: number, total: number) => {
    if (!onProgress || total <= 0) return;
    const ratio = Math.max(0, Math.min(1, current / total));
    if (key.includes('fetch')) {
      const pct = 10 + Math.round(ratio * 55);
      onProgress(pct, `Baixando modelo IA (1ª vez): ${Math.round(ratio * 100)}%`);
    } else {
      const pct = 65 + Math.round(ratio * 25);
      onProgress(pct, 'Recortando objeto no aparelho...');
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
  } catch (gpuErr) {
    // Fallback seguro para WASM CPU se o driver WebGPU falhar em algum dispositivo
    onProgress?.(55, 'Alternando para modo compatível (CPU)...');
    outputBlob = await removeBackground(inputBlob, {
      model: 'isnet_quint8',
      device: 'cpu',
      output: { format: 'image/png', quality: 0.9 },
      progress: handleProgress
    });
  }

  onProgress?.(94, 'Ajustando bordas e proporção...');
  const rawResultDataUrl = await blobToDataUrl(outputBlob);
  const trimmed = await autoTrimImage(rawResultDataUrl, 1024);

  aiCutoutCache.set(cacheKey, trimmed);
  onProgress?.(100, 'Fundo removido com sucesso!');
  return trimmed;
}
