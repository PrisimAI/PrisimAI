const CACHE_NAME = "prisimai-cache-v5";

// Core files + offline fallback
const ASSETS = [
  "/PrisimAI/",
  "/PrisimAI/index.html",
  "/PrisimAI/offline.html",
  "/PrisimAI/manifest.json",

  // PWA icons
  "/PrisimAI/icons/icon-192.png",
  "/PrisimAI/icons/icon-512.png",

  // Apple & favicons
  "/PrisimAI/apple-touch-icon.png",
  "/PrisimAI/favicon-32x32.png",
  "/PrisimAI/favicon-16x16.png",

  // Fonts (served cross-origin, safer to let runtime caching handle them)
  // Don’t precache cdn.tailwindcss.com or google fonts, they can break install
];

// Install event with safe precaching
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS.map((url) =>
          fetch(url)
            .then((response) => {
              if (!response.ok) throw new Error(`Failed: ${url}`);
              return cache.put(url, response);
            })
            .catch((err) => console.warn("Skipping asset:", url, err))
          )
        )
      )
    );
  self.skipWaiting();
});

// Activate event → clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch event with network strategies
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Pollinations API → network first
  if (url.hostname.includes("pollinations.ai")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Google Fonts & Tailwind CDN → network first, cache fallback
  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("cdn.tailwindcss.com")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Default → cache first, then network, then offline.html
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("/PrisimAI/offline.html");
            }
          })
      );
    })
  );
});
