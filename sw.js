/* Solana Rent & Rug Shield - Institutional PWA Service Worker v6.9 (App Shell + Network-First RPC) */
const CACHE_NAME = 'rrs-pwa-shell-v70';
const APP_SHELL_ASSETS = [
  '/offline-shell.html',
  '/manifest.webmanifest',
  '/dex6-official-shield-192.png',
  '/dex6-official-shield-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/pwa_and_quota_upgrade.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache live /api/ mutations; keep live RPC & quota gate strictly real-time
  if (url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/', clone)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match('/') || caches.match('/offline-shell.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const netFetch = fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          }
          return resp;
        })
        .catch(() => cached);
      return cached || netFetch;
    })
  );
});

self.addEventListener('message', (event) => {
  const data = (event && event.data) || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (data.type === 'RRS_SHOW_OS_BUBBLE') {
    const title = String(data.title || 'Solana Rent & Rug Shield v6 Active').slice(0, 110);
    const targetUrl = String(data.url || '/');
    event.waitUntil(
      self.registration.showNotification(title, {
        body: String(data.body || '12-Layer Pre-Buy & 0x09 Rent Shield Armed').slice(0, 200),
        icon: '/dex6-official-shield-192.png',
        badge: '/dex6-official-shield-96.png',
        data: { url: targetUrl }
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.openWindow(targetUrl));
});
