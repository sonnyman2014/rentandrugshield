/* Rent & Rug Shield - Wealthsimple PWA Service Worker v320 */
const CACHE_NAME = 'rent-shield-v320-wealthsimple';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });
self.addEventListener('message', (event) => { if (((event && event.data) || {}).type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', () => {});
