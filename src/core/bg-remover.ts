import {
  autoTrimImage,
  downscaleImageForInference,
  type ProcessedImageResult
} from './image-optimizer';
import type { BgWorkerRequest, BgWorkerResponse } from './bg-remover.worker';

export type BgRemovalProgressHandler = (percent: number, stageLabel: string) => void;

const AI_CACHE_NAME = 'decoraly-ai-model-v1';
const aiCutoutCache = new Map<string, ProcessedImageResult>();

let resolvedPreferredDevice: 'gpu' | 'cpu' | null = null;
let isEngineWarmInSession = false;
let inFlightWarmup: Promise<void> | null = null;
let aiWorkerInstance: Worker | null = null;
let aiWorkerDisabled = false;
let nextJobId = 1;

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

function canUseAiWorker(): boolean {
  return (
    !aiWorkerDisabled &&
    typeof window !== 'undefined' &&
    typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined'
  );
}

function getAiWorker(): Worker | null {
  if (!canUseAiWorker()) return null;
  if (aiWorkerInstance) return aiWorkerInstance;
  try {
    aiWorkerInstance = new Worker(new URL('./bg-remover.worker.ts', import.meta.url), {
      type: 'module'
    });
    aiWorkerInstance.addEventListener('error', () => {
      aiWorkerDisabled = true;
      aiWorkerInstance?.terminate();
      aiWorkerInstance = null;
    });
    return aiWorkerInstance;
  } catch {
    aiWorkerDisabled = true;
    return null;
  }
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
      const worker = getAiWorker();

      if (worker) {
        await new Promise<void>((resolve) => {
          const onMsg = (ev: MessageEvent<BgWorkerResponse>) => {
            if (ev.data.type === 'preloaded') {
              worker.removeEventListener('message', onMsg);
              isEngineWarmInSession = true;
              resolve();
            }
          };
          worker.addEventListener('message', onMsg);
          worker.postMessage({ type: 'preload', device } satisfies BgWorkerRequest);
          setTimeout(() => {
            worker.removeEventListener('message', onMsg);
            resolve();
          }, 8000);
        });
        return;
      }

      const { preload } = await import('@imgly/background-removal');
      await preload({
        model: 'isnet_quint8',
        device,
        output: { format: 'image/png', quality: 0.9 }
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
 * Rastreador monotônico de progresso real: agrega múltiplos arquivos do download/cache
 * sem retroceder a barra e aplica avanço suave dentro do estágio ativo de compilação/inferência.
 */
function createProgressTracker(
  isWarmAtStart: boolean,
  isCachedLocally: boolean,
  onProgress?: BgRemovalProgressHandler
) {
  let bestPct = 0;
  let currentLabel = 'Preparando sua foto...';
  let softCeiling = isWarmAtStart ? 20 : 48;
  let easingTimer: ReturnType<typeof setInterval> | null = null;
  const fetchStats = new Map<string, { current: number; total: number }>();

  const emit = (pct: number, label: string) => {
    const clamped = Math.max(bestPct, Math.min(100, Math.round(pct)));
    bestPct = clamped;
    currentLabel = label;
    onProgress?.(clamped, label);
  };

  const startStageEase = (targetMax: number, stepRate: number, label: string) => {
    softCeiling = Math.max(softCeiling, targetMax);
    currentLabel = label;
    if (easingTimer) return;
    easingTimer = setInterval(() => {
      if (bestPct < softCeiling - 0.5) {
        const step = Math.max(0.4, (softCeiling - bestPct) * stepRate);
        emit(Math.min(softCeiling, bestPct + step), currentLabel);
      }
    }, 180);
  };

  const stop = () => {
    if (easingTimer) {
      clearInterval(easingTimer);
      easingTimer = null;
    }
  };

  const handleLibraryProgress = (key: string, current: number, total: number) => {
    if (total <= 0) return;

    if (key.includes('fetch')) {
      const prev = fetchStats.get(key);
      fetchStats.set(key, {
        current: Math.max(prev?.current || 0, Math.min(current, total)),
        total: Math.max(prev?.total || 0, total)
      });

      let sumCurrent = 0;
      let sumTotal = 0;
      fetchStats.forEach((entry) => {
        sumCurrent += entry.current;
        sumTotal += entry.total;
      });
      const ratio = sumTotal > 0 ? Math.max(0, Math.min(1, sumCurrent / sumTotal)) : 0;
      const pct = 10 + ratio * 38; // 10% -> 48%

      if (ratio >= 0.99) {
        emit(48, 'Inicializando motor de recorte...');
        startStageEase(60, 0.12, 'Inicializando motor de recorte...');
      } else if (isCachedLocally) {
        emit(pct, `Carregando motor em cache: ${Math.round(ratio * 100)}%`);
      } else {
        emit(pct, `Baixando ferramenta (só na 1ª vez): ${Math.round(ratio * 100)}%`);
      }
      return;
    }

    if (key.startsWith('compute:decode')) {
      const basePct = isWarmAtStart ? 18 : 62;
      emit(basePct, 'Analisando a foto...');
      startStageEase(isWarmAtStart ? 24 : 65, 0.18, 'Analisando a foto...');
      return;
    }

    if (key.startsWith('compute:inference')) {
      const basePct = isWarmAtStart ? 25 : 66;
      emit(basePct, 'Recortando a peça...');
      startStageEase(88, 0.14, 'Recortando a peça...');
      return;
    }

    if (key.startsWith('compute:mask')) {
      stop();
      emit(90, 'Refinando contornos...');
      return;
    }

    if (key.startsWith('compute:encode')) {
      stop();
      const ratio = Math.max(0, Math.min(1, current / total));
      emit(91 + ratio * 4, 'Dando o acabamento nas bordas...');
    }
  };

  return {
    emit,
    startStageEase,
    stop,
    handleLibraryProgress
  };
}

function runInWorker(
  worker: Worker,
  inputBlob: Blob,
  device: 'gpu' | 'cpu',
  onLibProgress: (key: string, current: number, total: number) => void,
  onFallbackCpu: () => void
): Promise<{ blob: Blob; deviceUsed: 'gpu' | 'cpu' }> {
  const jobId = nextJobId++;
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.removeEventListener('message', onMsg);
      worker.removeEventListener('error', onErr);
    };

    const onMsg = (ev: MessageEvent<BgWorkerResponse>) => {
      const data = ev.data;
      if (data.type === 'progress' && data.id === jobId) {
        onLibProgress(data.key, data.current, data.total);
      } else if (data.type === 'device-fallback' && data.id === jobId) {
        resolvedPreferredDevice = 'cpu';
        onFallbackCpu();
      } else if (data.type === 'result' && data.id === jobId) {
        cleanup();
        resolve({ blob: data.blob, deviceUsed: data.deviceUsed });
      } else if (data.type === 'error' && data.id === jobId) {
        cleanup();
        reject(new Error(data.message));
      }
    };

    const onErr = (err: ErrorEvent) => {
      cleanup();
      aiWorkerDisabled = true;
      reject(new Error(err.message || 'Worker error'));
    };

    worker.addEventListener('message', onMsg);
    worker.addEventListener('error', onErr);
    worker.postMessage({
      type: 'cutout',
      id: jobId,
      blob: inputBlob,
      device
    } satisfies BgWorkerRequest);
  });
}

/**
 * Executa remoção de fundo por IA 100% local no navegador (custo R$ 0,00) usando
 * @imgly/background-removal sob demanda em Web Worker (UI fluida + barra de progresso fiel).
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
  const isWarmAtStart = isEngineWarmInSession;
  const preferredDevice = await resolvePreferredDevice();

  const tracker = createProgressTracker(isWarmAtStart, isCachedLocally, onProgress);
  tracker.emit(
    isWarmAtStart ? 14 : 10,
    isWarmAtStart
      ? 'Analisando a foto...'
      : isCachedLocally
      ? 'Carregando motor em cache...'
      : 'Preparando recorte automático...'
  );

  if (isWarmAtStart) {
    tracker.startStageEase(88, 0.12, 'Recortando a peça...');
  } else if (isCachedLocally) {
    tracker.startStageEase(60, 0.1, 'Ativando motor de recorte...');
  }

  let outputBlob: Blob;
  try {
    const worker = getAiWorker();
    if (worker) {
      try {
        const res = await runInWorker(
          worker,
          inputBlob,
          preferredDevice,
          tracker.handleLibraryProgress,
          () => tracker.startStageEase(88, 0.14, 'Recortando a peça...')
        );
        outputBlob = res.blob;
        resolvedPreferredDevice = res.deviceUsed;
      } catch {
        // Fallback automático na thread principal se o Worker falhar em algum navegador restrito
        aiWorkerDisabled = true;
        outputBlob = await runOnMainThread(inputBlob, preferredDevice, tracker);
      }
    } else {
      outputBlob = await runOnMainThread(inputBlob, preferredDevice, tracker);
    }
  } finally {
    tracker.stop();
  }

  isEngineWarmInSession = true;
  if (!isCachedLocally) {
    void requestPersistentAiStorage();
  }

  tracker.emit(96, 'Dando o acabamento nas bordas...');
  const rawResultDataUrl = await blobToDataUrl(outputBlob);
  const trimmed = await autoTrimImage(rawResultDataUrl, 1024);

  aiCutoutCache.set(cacheKey, trimmed);
  tracker.emit(100, 'Pronto! Fundo removido com sucesso.');
  return trimmed;
}

async function runOnMainThread(
  inputBlob: Blob,
  preferredDevice: 'gpu' | 'cpu',
  tracker: ReturnType<typeof createProgressTracker>
): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal');
  try {
    return await removeBackground(inputBlob, {
      model: 'isnet_quint8',
      device: preferredDevice,
      output: { format: 'image/png', quality: 0.9 },
      progress: tracker.handleLibraryProgress
    });
  } catch {
    if (preferredDevice === 'gpu') {
      resolvedPreferredDevice = 'cpu';
      return await removeBackground(inputBlob, {
        model: 'isnet_quint8',
        device: 'cpu',
        output: { format: 'image/png', quality: 0.9 },
        progress: tracker.handleLibraryProgress
      });
    }
    throw new Error('Falha ao executar recorte neural no dispositivo.');
  }
}
