const CACHE = 'portal-smpbp-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(e.request).then((res) =>
          res || fetch(e.request).then((net) => {
            cache.put(e.request, net.clone());
            return net;
          })
        )
      )
    );
  }
});
