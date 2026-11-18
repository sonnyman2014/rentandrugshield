/* Solana Rent & Rug Shield - 11-Layer Adaptive Self-Refreshing Service Worker v311 */
const CACHE_NAME = 'rent-shield-v311-11layer-carbon-high';
const IMMUTABLE_ICONS = ['/icon-192.png', '/icon-512.png', '/shield-app-icon.svg'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => cache.addAll(IMMUTABLE_ICONS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => {
        for (const client of clients) {
          try {
            client.postMessage({ type: 'RRS_SW_ACTIVATED', cache: CACHE_NAME, version: 311 });
          } catch (_e) {}
        }
      })
  );
});

self.addEventListener('message', (event) => {
  const data = (event && event.data) || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (data.type === 'PURGE_CACHES') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
    );
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  let url;
  try {
    url = new URL(req.url);
  } catch (_e) {
    return;
  }

  // Never intercept cross-origin requests (Cloudflare live tunnel APIs, Google Fonts, Solscan, RPCs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Never cache HTML documents, JSON manifests/live_endpoint, txt docs, JS bundles, or /api/* routes
  if (
    req.method !== 'GET' ||
    req.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/.well-known/') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.txt') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(fetch(req, { cache: 'no-store' }));
    return;
  }

  event.respondWith(
    fetch(req, { cache: 'no-cache' }).catch(() => caches.match(req))
  );
});
