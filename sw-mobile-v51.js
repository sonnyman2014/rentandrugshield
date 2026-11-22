const CACHE_NAME = 'rrs-mobile-pwa-v51';
const OFFLINE_SHELL = ['/mobile.html', '/manifest-mobile.webmanifest'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(OFFLINE_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.url.includes('/api/') || e.request.url.includes('live_endpoint.json')) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
