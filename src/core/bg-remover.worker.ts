import { preload, removeBackground } from '@imgly/background-removal';

export interface BgWorkerRequest {
  type: 'preload' | 'cutout';
  id?: number;
  blob?: Blob;
  device: 'gpu' | 'cpu';
}

export type BgWorkerResponse =
  | { type: 'preloaded'; device: 'gpu' | 'cpu' }
  | { type: 'progress'; id: number; key: string; current: number; total: number }
  | { type: 'device-fallback'; id: number; device: 'cpu' }
  | { type: 'result'; id: number; blob: Blob; deviceUsed: 'gpu' | 'cpu' }
  | { type: 'error'; id: number; message: string };

function buildBaseConfig(device: 'gpu' | 'cpu') {
  return {
    model: 'isnet_quint8' as const,
    device,
    output: { format: 'image/png' as const, quality: 0.9 }
  };
}

self.addEventListener('message', async (event: MessageEvent<BgWorkerRequest>) => {
  const msg = event.data;

  if (msg.type === 'preload') {
    try {
      await preload(buildBaseConfig(msg.device));
      self.postMessage({ type: 'preloaded', device: msg.device } satisfies BgWorkerResponse);
    } catch {
      // Pré-aquecimento silencioso: falha não impede execução posterior
    }
    return;
  }

  if (msg.type === 'cutout' && msg.id !== undefined && msg.blob) {
    const id = msg.id;
    const progressHandler = (key: string, current: number, total: number) => {
      self.postMessage({
        type: 'progress',
        id,
        key,
        current,
        total
      } satisfies BgWorkerResponse);
    };

    try {
      const outputBlob = await removeBackground(msg.blob, {
        ...buildBaseConfig(msg.device),
        progress: progressHandler
      });
      self.postMessage({
        type: 'result',
        id,
        blob: outputBlob,
        deviceUsed: msg.device
      } satisfies BgWorkerResponse);
    } catch {
      if (msg.device === 'gpu') {
        try {
          self.postMessage({ type: 'device-fallback', id, device: 'cpu' } satisfies BgWorkerResponse);
          const cpuBlob = await removeBackground(msg.blob, {
            ...buildBaseConfig('cpu'),
            progress: progressHandler
          });
          self.postMessage({
            type: 'result',
            id,
            blob: cpuBlob,
            deviceUsed: 'cpu'
          } satisfies BgWorkerResponse);
          return;
        } catch (cpuErr: any) {
          self.postMessage({
            type: 'error',
            id,
            message: cpuErr?.message || 'Falha ao executar recorte neural no dispositivo.'
          } satisfies BgWorkerResponse);
          return;
        }
      }
      self.postMessage({
        type: 'error',
        id,
        message: 'Falha ao executar recorte neural no dispositivo.'
      } satisfies BgWorkerResponse);
    }
  }
});
