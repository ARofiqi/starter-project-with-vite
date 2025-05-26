import CONFIG from "./config";

const CACHE_NAME = CONFIG.CACHE_NAME;
const DATA_CACHE_NAME = CONFIG.DATA_CACHE_NAME;
const OFFLINE_URL = "/index.html";

const PRECACHE_RESOURCES = ["/", "/index.html", "/styles/styles.css", "/scripts/index.js", "/scripts/app.js", "/scripts/api.js", "/public/images/logo.png", "/manifest.json"];

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

  if (request.method !== "GET" || url.protocol === "chrome-extension:") {
    return;
  }

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/stories")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          return new Response(
            JSON.stringify({
              message: "You are offline and no cached data available",
            }),
            {
              status: 200,
              statusText: "OK",
              headers: { "Content-Type": "application/json" },
            }
          );
        })
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          return cachedResponse || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    caches
      .match(request)
      .then((response) => {
        return response || fetch(request);
      })
      .catch(() => {
        if (request.url.match(/\.(js|css|png|jpg|jpeg|gif|ico)$/)) {
          return new Response("", { status: 404, statusText: "Not Found" });
        }
        return new Response("", { status: 500, statusText: "Service Worker Error" });
      })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/public/images/logo.png",
    badge: "/public/images/logo.png",
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
