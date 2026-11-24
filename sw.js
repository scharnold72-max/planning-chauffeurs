const CACHE = 'planning-grillos-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(FILES.map(path => new Request(new URL(path, self.registration.scope), {cache: 'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('planning-grillos-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  event.respondWith(fetch(request, request.mode === 'navigate' ? {cache: 'reload'} : {}).catch(async error => {
    const cache = await caches.open(CACHE);
    const fallback = await cache.match(request) || (request.mode === 'navigate' && await cache.match('./index.html'));
    if (!fallback) throw error;
    return fallback;
  }));
});
