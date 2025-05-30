export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function isServiceWorkerAvailable() {
  return "serviceWorker" in navigator;
}

export async function registerServiceWorker() {
  if (isServiceWorkerAvailable()) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/sw.js", { type: "module" })
        .then(function (registration) {
          console.log("ServiceWorker registration successful with scope: ", registration.scope);
        })
        .catch(function (err) {
          console.log("ServiceWorker registration failed: ", err);
        });
    });
  }
}
