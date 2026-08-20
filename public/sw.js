const CACHE_NAME = "aifoundry-cache-v1";

const PRECACHE_URLS = [
  "/",
  "/about",
  "/events",
  "/team",
  "/gallery",
  "/recruit",
  "/images/architectural-bg.jpg",
  "/club-logo.png",
  "/fonts/helveticanowdisplay-medium.ttf",
  "/fonts/helvetica-now-display-regular.ttf",
  "/css/website-base.css",
  "/css/styles.css",
];

// Install: precache key shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("ServiceWorker precache partial skip:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-First for static assets, Network-First for API/admin routes
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache admin routes or api mutations
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/")) {
    return;
  }

  // Cache static assets (images, fonts, scripts, css, models)
  if (
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/css/") ||
    url.pathname.startsWith("/js/") ||
    url.pathname.endsWith(".glb") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ttf")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network first with cache fallback for pages
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && event.request.method === "GET") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
