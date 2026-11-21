/* Rent & Rug Shield - PWA Service Worker v25767 (Pre-Launch Surgical Polish: Single Header, Badge Separation & Shadow 403) */
const CACHE_NAME = 'rent-shield-v25767-prelaunch';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('message', (event) => { if (((event && event.data) || {}).type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', () => {});
