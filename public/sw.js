/* Loop Local PWA service worker.
 * Dynamic pages are always network-first and private/status routes are never cached.
 */
const CACHE_NAME = 'loop-local-static-v2';
const STATIC_ASSETS = ['/looplocal-icon-192.png', '/looplocal-icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

async function networkFirstNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response('Loop Local is temporarily offline. Reconnect and try again.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith('/api/')
    || url.pathname.startsWith('/auth/')
    || url.pathname.startsWith('/post-local/status/')
    || url.pathname.startsWith('/operator/')
  ) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
