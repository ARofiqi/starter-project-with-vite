const DB_NAME = "liked-story-db";
const DB_VERSION = 1;
const STORE_NAME = "stories";

function openDB() {
  return new Promise((resolve, reject) => {
    console.log("Opening IndexedDB...");
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function saveStory(story) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");

      tx.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
        reject(event.target.error);
      };

      const store = tx.objectStore(STORE_NAME);
      const request = store.put(story);

      request.onsuccess = () => {
        console.log("Data successfully saved to IndexedDB");
        resolve(true);
      };

      request.onerror = (event) => {
        console.error("Error saving data:", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("Failed to open DB:", error);
    throw error;
  }
}

export async function getStories() {
  const db = await openDB();
  console.log("Getting stories from IndexedDB...");
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function deleteStory(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function isStorySaved(storyId) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(storyId);
      
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error checking saved story:', error);
    throw error;
  }
}