// Minimal pass-through service worker.
// Its ONLY job is to satisfy the browser's "installable / Add to Home Screen"
// requirement of having a registered service worker with a fetch handler.
// It never caches anything, so it can NEVER serve stale API/dashboard data —
// every request just goes straight to the network, as if there were no
// service worker at all.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});