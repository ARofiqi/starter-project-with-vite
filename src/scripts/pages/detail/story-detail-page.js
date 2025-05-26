import DetailPresenter from "./story-detail-presenter.js";

export default class DetailPage {
  constructor() {
    this.presenter = new DetailPresenter(this);
  }

  async render() {
    return `
      <section class="container detail">
        <div class="header">
          <button id="backButton" class="btn">← Back</button>
          <h1>Detail Story</h1>
        </div>
        <div id="story-detail" class="story-detail">
          <p>Memuat cerita...</p>
        </div>
        <div id="map" style="height: 400px;"></div>
      </section>
    `;
  }

  async afterRender() {
    const backButton = document.getElementById("backButton");
    if (backButton) {
      backButton.addEventListener("click", () => {
        this.back();
      });
    }

    const url = window.location.hash;
    const id = url.split("/")[2];
    if (id) {
      this.presenter.loadStory(id);
    } else {
      this.showError("ID cerita tidak ditemukan.");
    }
  }

  showStoryDetail(story) {
    const detailElement = document.getElementById("story-detail");
    const mapElement = document.getElementById("map");

    if (!story) {
      this.showError("Cerita tidak ditemukan.");
      return;
    }

    const locationInfo = story.lat != null && story.lon != null
      ? `<small>Lokasi: ${story.lat}, ${story.lon}</small>`
      : `<small>Lokasi tidak tersedia</small>`;

    detailElement.innerHTML = `
      <img src="${story.photoUrl}" alt="${story.name}" class="story-image" />
      <h2>${story.name}</h2>
      <p>${story.description}</p>
      <small>Dibuat pada: ${new Date(story.createdAt).toLocaleString()}</small>
      <br />
      ${locationInfo}
    `;

    if (story.lat != null && story.lon != null) {
      const map = L.map("map").setView([story.lat, story.lon], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.marker([story.lat, story.lon]).addTo(map).bindPopup(`<b>${story.name}</b>`).openPopup();
      mapElement.style.display = "block";
    } else {
      mapElement.innerHTML = "<p>Peta tidak tersedia karena lokasi tidak diketahui.</p>";
    }
  }

  showError(message) {
    const detailElement = document.getElementById("story-detail");
    const mapElement = document.getElementById("map");
    if (detailElement) {
      detailElement.innerHTML = `<p>${message}</p>`;
    }
    if (mapElement) {
      mapElement.style.display = "none";
    }
  }

  back() {
    window.location.href = "#/";
  }
}
