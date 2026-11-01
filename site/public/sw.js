/* Only the empty offline shell is cached. Live HTML and data stay on the network. */
const SHELL_CACHE = 'monitora-timbo-shell-v2';
const SHELL_FILES = ['/offline.html', '/pwa/icon-192.png', '/pwa/icon-512.png', '/pwa/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('monitora-timbo-shell-') && key !== SHELL_CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || request.mode !== 'navigate' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return;
  event.respondWith(fetch(request, {cache: 'no-store'}).catch(async () => {
    const cache = await caches.open(SHELL_CACHE);
    return cache.match('/offline.html');
  }));
});
