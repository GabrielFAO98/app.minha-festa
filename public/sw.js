const AI_CACHE_NAME = 'decoraly-ai-model-v1';

function isImmutableAiAsset(urlString) {
  try {
    const url = new URL(urlString);
    // Modelo e metadados do @imgly/background-removal na CDN oficial
    if (
      url.hostname.endsWith('staticimgly.com') &&
      url.pathname.includes('@imgly/background-removal-data')
    ) {
      return true;
    }
    // Binários WASM / ORT versionados pelo Vite com hash de conteúdo
    if (
      url.origin === self.location.origin &&
      /\/assets\/ort[^/]*\.(wasm|mjs|js)$/i.test(url.pathname)
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('decoraly-ai-model-') && key !== AI_CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !isImmutableAiAsset(req.url)) {
    return;
  }

  event.respondWith(
    caches.open(AI_CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached && cached.ok) {
        return cached;
      }

      const networkResponse = await fetch(req);
      if (networkResponse && networkResponse.ok && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
        cache.put(req, networkResponse.clone()).catch(() => {});
      }
      return networkResponse;
    })
  );
});
