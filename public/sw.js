// Retired service worker. Browsers that installed the old caching worker fetch this update,
// drop every cache, unregister, and reload open tabs so they get the live site again.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) await caches.delete(key);
      await self.registration.unregister();
      for (const client of await self.clients.matchAll({ type: "window" })) client.navigate(client.url);
    })()
  );
});
