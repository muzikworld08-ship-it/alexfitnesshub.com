// Clean PWA Pass-Through Service Worker
// Satisfies installation requirements without introduction of stale cache issues

const CACHE_NAME = "alex-fitness-hub-v1";

self.addEventListener("install", (event) => {
  // Activate service worker immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of all pages immediately and flush any old cache buckets
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log("[Service Worker] Invalidating cache bucket:", key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Simple pass-through fetch event handler to satisfy browser installation checks
  // but let all requests go directly to the server for live real-time updates.
  event.respondWith(
    fetch(event.request).catch(() => {
      // Offline fallback can be added here if needed in the future
      return caches.match(event.request);
    })
  );
});
