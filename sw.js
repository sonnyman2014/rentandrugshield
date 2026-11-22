/* Rent & Rug Shield - PWA Service Worker v25771 (1-Click Live Desktop & OS Bubbles) */
const CACHE_NAME = 'rent-shield-v25771-livealerts';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  const data = (event && event.data) || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (data.type === 'RRS_SHOW_OS_BUBBLE') {
    const title = String(data.title || 'Solana Rent & Rug Shield v5.1 Active').slice(0, 110);
    const targetUrl = String(data.url || '/');
    const options = {
      body: String(data.body || data.message || 'Live 12-Layer, DEX-6 Runner & News Alerts Armed').slice(0, 200),
      icon: String(data.icon || '/assets/rr_badge_exact.jpg'),
      badge: String(data.badge || '/assets/rr_badge_exact.jpg'),
      tag: String(data.tag || ('rrs-live-' + Date.now())),
      requireInteraction: false,
      data: { url: targetUrl }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client && client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return null;
    })
  );
});

self.addEventListener('fetch', () => {});
