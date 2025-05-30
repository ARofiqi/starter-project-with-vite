import DetailPresenter from "./story-detail-presenter.js";

export default class DetailPage {
  constructor() {
    this.presenter = new DetailPresenter(this);
    this.currentStoryId = null;
    this.isStorySaved = false;
    this.currentStory = null;
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
        <div class="action-buttons">
          <button id="saveStory" class="btn-save">
            ${this.isStorySaved ? "✓ Tersimpan" : "Simpan Cerita"}
          </button>
          <button id="deleteStory" class="btn-delete" style="display: none;">
            Hapus dari Penyimpanan
          </button>
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

    const saveButton = document.getElementById("saveStory");
    const deleteButton = document.getElementById("deleteStory");

    saveButton.addEventListener("click", async () => {
      if (this.currentStoryId) {
        const success = await this.presenter.saveStory(this.currentStoryId);
        if (success) {
          this.isStorySaved = true;
          this.updateSaveButton();
          alert("Cerita berhasil disimpan!");
        }
      }
    });

    deleteButton.addEventListener("click", async () => {
      if (this.currentStoryId) {
        const success = await this.presenter.deleteStory(this.currentStoryId);
        if (success) {
          this.isStorySaved = false;
          this.updateSaveButton();
          alert("Cerita dihapus dari penyimpanan!");
        }
      }
    });

    const url = window.location.hash;
    const id = url.split("/")[2];
    if (id) {
      this.currentStoryId = id;
      this.currentStory = await this.presenter.loadStory(id);
      this.isStorySaved = await this.presenter.isStorySaved(id);
      this.updateSaveButton();
    } else {
      this.showError("ID cerita tidak ditemukan.");
    }
  }

  updateSaveButton() {
    const saveButton = document.getElementById("saveStory");
    const deleteButton = document.getElementById("deleteStory");

    if (this.isStorySaved) {
      saveButton.textContent = "✓ Tersimpan";
      saveButton.style.display = "none";
      deleteButton.style.display = "block";
    } else {
      saveButton.textContent = "Simpan Cerita";
      saveButton.style.display = "block";
      deleteButton.style.display = "none";
    }
  }

  showStoryDetail(story) {
    const detailElement = document.getElementById("story-detail");
    const mapElement = document.getElementById("map");

    if (!story) {
      this.showError("Cerita tidak ditemukan.");
      return;
    }

    const locationInfo = story.lat != null && story.lon != null ? `<small>Lokasi: ${story.lat}, ${story.lon}</small>` : `<small>Lokasi tidak tersedia</small>`;

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
