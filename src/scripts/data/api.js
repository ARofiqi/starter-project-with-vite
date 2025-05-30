import CONFIG from "../config";

const CACHE_NAME = CONFIG.DATA_CACHE_NAME;

const ENDPOINTS = {
  ENDPOINT: `${CONFIG.BASE_URL}`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_BY_ID: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

async function cacheResponse(request, response) {
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

async function fetchWithCacheFallback(request) {
  try {
    const response = await fetch(request);
    await cacheResponse(request, response);
    return response;
  } catch (error) {
    console.log("Offline mode, trying cache...");
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function getAllCachedStories() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();

  const storiesResponses = await Promise.all(keys.filter((request) => request.url.includes("/v1/stories/")).map((request) => cache.match(request)));

  const stories = [];
  for (const response of storiesResponses) {
    if (response) {
      try {
        const data = await response.json();
        stories.push(data);
      } catch (e) {
        console.error("Error parsing cached story", e);
      }
    }
  }

  return stories;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function getData() {
  const token = localStorage.getItem("token");
  const request = new Request(ENDPOINTS.STORIES, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const response = await fetch(request);
    if (!response.ok) {
      throw new Error("Gagal memuat data dari API");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);

    const cachedStories = await getAllCachedStories();
    if (cachedStories.length > 0) {
      return cachedStories;
    }

    throw new Error("Gagal mengambil data dari API ");
  }
}

export async function getStoryById(id) {
  const token = localStorage.getItem("token");
  const request = new Request(ENDPOINTS.STORY_BY_ID(id), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const response = await fetchWithCacheFallback(request);

  if (!response.ok) {
    throw new Error("Gagal memuat data");
  }

  return await response.json();
}

export async function loginUser(credentials) {
  const request = new Request(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const response = await fetch(request);
  return await response.json();
}

export async function registerUser(userData) {
  const request = new Request(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const response = await fetch(request);
  return await response.json();
}

export async function addStory({ description, photo, lat, lon }) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);

  if (lat !== undefined) {
    formData.append("lat", lat);
  }
  if (lon !== undefined) {
    formData.append("lon", lon);
  }

  const request = new Request(ENDPOINTS.STORIES, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const response = await fetch(request);

  if (!response.ok) {
    throw new Error("Gagal menambahkan cerita");
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.delete(ENDPOINTS.STORIES);

  return await response.json();
}

export async function subscribePush() {
  const registration = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  const VAPID_PUBLIC_KEY = CONFIG.VAPID_PUBLIC_KEY;

  if (permission !== "granted") {
    alert("Izin notifikasi ditolak");
    return;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const body = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))),
      auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))),
    },
  };

  const token = localStorage.getItem("token");

  await fetch(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  alert("Berhasil subscribe notifikasi!");
}

export async function unsubscribePush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    const token = localStorage.getItem("token");

    await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint }),
    });

    alert("Berhasil unsubscribe notifikasi.");
  } else {
    alert("Kamu belum subscribe notifikasi.");
  }
}
