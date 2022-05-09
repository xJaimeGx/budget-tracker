const CACHED_FILES = [
    './',
    './public/index.html',
    './public/css/styles.css',
    './public/js/idb.js',
    './public/js/index.js',
    './public/icons/icon-144x144.png',
    './public/icons/icon-384x384.png'
];

const STATIC = "static-cache-v2";
const DATA = "data-cache-v1";
const RUNTIME = "runtime-cache";

// Add lifecycle method
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC)
      .then(cache => cache.addAll(CACHED_FILES))
      .then(self.skipWaiting())
  );
});

// Add activate handler.
self.addEventListener("activate", event => {
    const savedCaches = [STATIC, RUNTIME];
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return cacheNames.filter(cacheName => !savedCaches.includes(cacheName));
      }).then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          return caches.delete(cacheToDelete);
        }));
      }).then(() => self.clients.claim())
    );
  });
  
// Add fetch
self.addEventListener("fetch", event => {
    // Not cached if not a get request
    if (
        event.request.method !== "GET" ||
        !event.request.url.startsWith(self.location.origin)
    ) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Runtime handler for api route
    if (event.request.url.includes("/api/transaction")) {
        // Make network request, go to cache if no connection
        event.respondWith(
            caches.open(RUNTIME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                    .catch(() => caches.match(event.request));
            })
        );
        return;
    }

    // Use cache for specific requests
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return caches.open(RUNTIME).then(cache => {
                return fetch(event.request).then(response => {
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
    );
});