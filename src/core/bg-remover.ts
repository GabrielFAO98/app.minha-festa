import {
  autoTrimImage,
  downscaleImageForInference,
  type ProcessedImageResult
} from './image-optimizer';

export type BgRemovalProgressHandler = (percent: number, stageLabel: string) => void;

const AI_CACHE_NAME = 'decoraly-ai-model-v1';
const aiCutoutCache = new Map<string, ProcessedImageResult>();

let resolvedPreferredDevice: 'gpu' | 'cpu' | null = null;
let isEngineWarmInSession = false;
let inFlightWarmup: Promise<void> | null = null;

export function registerAiCacheServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.warn('[Decoraly] Falha ao registrar cache offline da IA:', err);
  });
}

async function requestPersistentAiStorage(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    // Opcional dependendo das permissões do navegador
  }
}

export async function hasCachedAiModel(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await caches.open(AI_CACHE_NAME);
    const keys = await cache.keys();
    const hasManifest = keys.some((req) => req.url.includes('resources.json'));
    const modelChunks = keys.filter((req) => req.url.includes('background-removal-data')).length;
    return hasManifest && modelChunks >= 3;
  } catch {
    return false;
  }
}

async function resolvePreferredDevice(): Promise<'gpu' | 'cpu'> {
  if (resolvedPreferredDevice) return resolvedPreferredDevice;
  try {
    const gpuApi = (navigator as any).gpu;
    if (gpuApi && typeof gpuApi.requestAdapter === 'function') {
      const adapter = await gpuApi.requestAdapter();
      if (adapter) {
        resolvedPreferredDevice = 'gpu';
        return 'gpu';
      }
    }
  } catch {
    // Sem suporte WebGPU válido neste aparelho
  }
  resolvedPreferredDevice = 'cpu';
  return 'cpu';
}

/**
 * Pré-aquece o motor ONNX em segundo plano apenas quando os arquivos do modelo
 * já estão salvos em CacheStorage no aparelho (custo zero de rede).
 */
export async function preloadBackgroundRemover(): Promise<void> {
  if (isEngineWarmInSession) return;
  if (inFlightWarmup) return inFlightWarmup;

  inFlightWarmup = (async () => {
    try {
      const isCached = await hasCachedAiModel();
      if (!isCached) return;

      const device = await resolvePreferredDevice();
      const { preload } = await import('@imgly/background-removal');
      await preload({
        model: 'isnet_quint8',
        device
      });
      isEngineWarmInSession = true;
    } catch {
      // Pré-aquecimento silencioso: nunca bloqueia a UX caso falhe
    } finally {
      inFlightWarmup = null;
    }
  })();

  return inFlightWarmup;
}

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

  if (inFlightWarmup) {
    onProgress?.(10, 'Ativando ferramenta de recorte...');
    await inFlightWarmup;
  }

  const isCachedLocally = isEngineWarmInSession || (await hasCachedAiModel());
  const preferredDevice = await resolvePreferredDevice();

  onProgress?.(12, isCachedLocally ? 'Ativando ferramenta de recorte...' : 'Preparando recorte automático...');
  const { removeBackground } = await import('@imgly/background-removal');

  const handleProgress = (key: string, current: number, total: number) => {
    if (!onProgress || total <= 0) return;
    const ratio = Math.max(0, Math.min(1, current / total));
    if (key.includes('fetch')) {
      const pct = 12 + Math.round(ratio * 53);
      if (isCachedLocally) {
        onProgress(pct, 'Ativando motor de recorte...');
      } else {
        onProgress(pct, `Baixando ferramenta (só na 1ª vez): ${Math.round(ratio * 100)}%`);
      }
    } else {
      const pct = 65 + Math.round(ratio * 25);
      onProgress(pct, 'Recortando a peça...');
    }
  };

  let outputBlob: Blob;
  try {
    outputBlob = await removeBackground(inputBlob, {
      model: 'isnet_quint8',
      device: preferredDevice,
      output: { format: 'image/png', quality: 0.9 },
      progress: handleProgress
    });
  } catch {
    if (preferredDevice === 'gpu') {
      // Fallback seguro caso a GPU falhe durante a inferência
      resolvedPreferredDevice = 'cpu';
      onProgress?.(55, 'Recortando a peça...');
      outputBlob = await removeBackground(inputBlob, {
        model: 'isnet_quint8',
        device: 'cpu',
        output: { format: 'image/png', quality: 0.9 },
        progress: handleProgress
      });
    } else {
      throw new Error('Falha ao executar recorte neural no dispositivo.');
    }
  }

  isEngineWarmInSession = true;
  if (!isCachedLocally) {
    void requestPersistentAiStorage();
  }

  onProgress?.(94, 'Dando o acabamento nas bordas...');
  const rawResultDataUrl = await blobToDataUrl(outputBlob);
  const trimmed = await autoTrimImage(rawResultDataUrl, 1024);

  aiCutoutCache.set(cacheKey, trimmed);
  onProgress?.(100, 'Pronto! Fundo removido com sucesso.');
  return trimmed;
}
