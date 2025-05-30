import CONFIG from "./scripts/config";

const CACHE_NAME = CONFIG.CACHE_NAME;
const DATA_CACHE_NAME = CONFIG.DATA_CACHE_NAME;
const OFFLINE_URL = "/index.html";

const PRECACHE_RESOURCES = [
  "/",
  "/index.html",
  "/styles/styles.css",
  "/scripts/index.js",
  "/scripts/config.js",
  "/scripts/pages/app.js",
  "/scripts/data/api.js",
  "/images/logo.png",
  "https://unpkg.com/leaflet/dist/leaflet.css",
  "/favicon.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(event));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  event.respondWith(handleAssetRequest(event));

  // if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/stories")) {
  //   event.respondWith(
  //     fetch(request)
  //       .then((response) => {
  //         if (response.ok) {
  //           const responseToCache = response.clone();
  //           caches.open(DATA_CACHE_NAME).then((cache) => cache.put(request, responseToCache));
  //         }
  //         return response;
  //       })
  //       .catch(async () => {
  //         const cachedResponse = await caches.match(request);
  //         if (cachedResponse) {
  //           return cachedResponse;
  //         }

  //         return new Response(
  //           JSON.stringify({
  //             message: "You are offline and no cached data available",
  //           }),
  //           {
  //             status: 200,
  //             statusText: "OK",
  //             headers: { "Content-Type": "application/json" },
  //           }
  //         );
  //       })
  //   );
  //   return;
  // }

  // if (request.mode === "navigate") {
  //   event.respondWith(
  //     fetch(request)
  //       .then((response) => {
  //         const responseToCache = response.clone();
  //         caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
  //         return response;
  //       })
  //       .catch(async () => {
  //         const cachedResponse = await caches.match(request);
  //         return cachedResponse || caches.match(OFFLINE_URL);
  //       })
  //   );
  //   return;
  // }

  // event.respondWith(
  //   caches
  //     .match(request)
  //     .then((response) => {
  //       return response || fetch(request);
  //     })
  //     .catch(() => {
  //       if (request.url.match(/\.(js|css|png|jpg|jpeg|gif|ico)$/)) {
  //         return new Response("", { status: 404, statusText: "Not Found" });
  //       }
  //       return new Response("", { status: 500, statusText: "Service Worker Error" });
  //     })
  // );
});

self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/images/logo.png",
    badge: "/images/logo.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});

async function handleAssetRequest(event) {
  try {
    // Cache First strategy
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return cachedResponse;

    // Network fallback
    const response = await fetch(event.request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, response.clone());
    }
    return response;
  } catch {
    // Better fallbacks for different file types
    if (event.request.url.endsWith(".css")) {
      return new Response("/* Offline */", { headers: { "Content-Type": "text/css" } });
    }
    if (event.request.url.endsWith(".js")) {
      return new Response('console.log("Offline");', { headers: { "Content-Type": "application/javascript" } });
    }
    return new Response("Offline", { status: 503 });
  }
}

async function handleApiRequest(event) {
  try {
    const response = await fetch(event.request);
    if (response.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      await cache.put(event.request, response.clone());
    }
    return response;
  } catch {
    const cachedResponse = await caches.match(event.request);
    return cachedResponse || jsonResponse({ error: "Offline" }, 200);
  }
}

async function handleNavigationRequest(event) {
  try {
    const response = await fetch(event.request);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(event.request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(event.request);
    return cached || caches.match(OFFLINE_URL);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
