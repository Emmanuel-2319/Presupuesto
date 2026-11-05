// Cambia el número de versión cada vez que añadas o quites archivos de ASSETS.
const CACHE = 'presupuesto-v1';
const ASSETS = ['./', './index.html', './styles.css', './chart.min.js', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Responde desde la caché al instante y actualiza en segundo plano para la próxima visita.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request, { ignoreSearch: true }).then((hit) => {
        const network = fetch(e.request)
          .then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; })
          .catch(() => hit || (e.request.mode === 'navigate' ? cache.match('./index.html') : Response.error()));
        return hit || network;
      })
    )
  );
});
