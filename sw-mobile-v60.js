const CACHE_NAME = 'rrs-mobile-v60-carbon';
const CORE_ASSETS = [
  '/mobile.html',
  '/manifest-mobile.webmanifest',
  '/js/rpc_failover.js',
  '/js/mwa_wallet_core.bundle.js',
  '/chrome-extension/icon128.png'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS).catch(function () {});
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          return k !== CACHE_NAME ? caches.delete(k) : Promise.resolve();
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req).then(function (resp) {
      if (resp && resp.status === 200 && req.url.indexOf('/api/') === -1) {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(req, clone); }).catch(function () {});
      }
      return resp;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match('/mobile.html');
      });
    })
  );
});
