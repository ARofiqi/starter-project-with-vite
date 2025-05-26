import HomePresenter from "./home-presenter.js";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
  }

  async render() {
    return `
      <section class="container home">
        <div class="header">
          <h1>Home Page</h1>
          <button id="add-story-btn" class="btn btn-primary">Tambah Cerita</button>
        </div>
        <br>
        <h2>Location of the story</h2>
        <div id="map" style="height: 400px;"></div>
        <br>
        <h2>Story List</h2>
        <div id="story-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    this.presenter.loadStories();

    const addStoryButton = document.querySelector("#add-story-btn");
    if (addStoryButton) {
      addStoryButton.addEventListener("click", this.goToAddStoryPage);
    }
  }

  showStories(stories) {
    const storyListElement = document.querySelector("#story-list");
    const mapElement = document.getElementById("map");

    if (!stories || stories.length === 0) {
      storyListElement.innerHTML = "<p>Tidak ada cerita untuk ditampilkan.</p>";
      if (mapElement) {
        mapElement.innerHTML = "";
      }
      return;
    }

    // Initialize map
    const map = L.map("map").setView([-6.2, 106.816666], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    let bounds = [];

    storyListElement.innerHTML = ""; // Clear previous content

    stories.forEach((story) => {
      const { lat, lon, name, description, id, photoUrl, createdAt } = story;

      if (lat && lon) {
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`
          <strong>${name}</strong><br />
          ${description}<br />
          <a href="#/detail/${id}">Lihat Detail</a>
        `);
        bounds.push([lat, lon]);
      }

      const storyItem = document.createElement("div");
      storyItem.classList.add("story-item");
      storyItem.setAttribute("data-id", id);

      storyItem.innerHTML = `
        <img src="${photoUrl}" alt="${name}" class="story-image" />
        <h2>${name}</h2>
        <p>${description}</p>
        <small>Dibuat pada: ${new Date(createdAt).toLocaleString()}</small>
      `;

      storyItem.addEventListener("click", () => {
        window.location.href = `#/detail/${id}`;
      });

      storyListElement.appendChild(storyItem);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds);
    }
  }

  showError(message) {
    const storyListElement = document.querySelector("#story-list");
    if (storyListElement) {
      storyListElement.innerHTML = `<p>${message}</p>`;
    }
  }

  redirectToLogin() {
    window.location.href = "#/login";
  }

  goToAddStoryPage() {
    window.location.href = "#/add-story";
  }
}
