import AddStoryPresenter from "./add-story-presenter.js";
import L from "leaflet";

export default class AddStoryView {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.cameraStream = null;
    this.capturedFile = null;
    this.selectedLat = undefined;
    this.selectedLon = undefined;
    this.marker = null;
    this.map = null;
  }

  async render() {
    return `
      <section class="container add-story">
        <div class="heeader">
            <div>
                <button id="backButton" class="btn">← Back</button>
            </div>
            <h1>Add Your Story</h1>
        </div>
        <form id="storyForm" enctype="multipart/form-data">
          <div>
            <label for="description">Description:</label><br />
            <textarea id="description" name="description" required></textarea>
          </div>
          <div>
            <label>Photo (max 1MB):</label><br />
            <input type="file" id="photoInput" name="photo" accept="image/*" style="display: none;" />
            <input type="file" id="cameraInput" accept="image/*" capture="environment" style="display: none;" />
            <div class="btn-list">
              <button class="btn" type="button" id="uploadButton">Upload from Gallery</button>
              <button class="btn btn-primary" type="button" id="cameraButton">Use Camera</button>
            </div>
            <div>
              <img id="photoPreview" src="" alt="Preview" style="display:none;" />
            </div>
            <div id="cameraContainer" style="display: none;">
                <video id="cameraPreview" autoplay playsinline width="100%"></video>
                <div>
                    <label for="cameraSelect">Choose Camera:</label>
                    <select id="cameraSelect"></select>
                </div>
                <div class="btn-list-camera">
                    <button class="btn btn-primary" type="button" id="captureButton">Capture</button>
                    <button type="button" id="refresh" class="btn btn-secondary">refresh</button>
                </div>
            </div>
          </div>
          <div>
            <label>Select Location on Map:</label>
            <div id="map" style="height: 400px;"></div>
            <p>Selected: <span id="locationDisplay">None</span></p>
          </div>
          <button class="btn" type="submit" id="submitButton">Submit Story</button>
        </form>
        <p id="message"></p>
      </section>
    `;
  }

  async afterRender() {
    this.cacheElements();
    this.initMap();
    await this.populateCameraDevices();
    this.bindEvents();

    window.addEventListener("beforeunload", () => {
      this.stopCameraStream();
    });
  }

  stopCameraStream() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }
  }

  cacheElements() {
    this.form = document.getElementById("storyForm");
    this.message = document.getElementById("message");
    this.locationDisplay = document.getElementById("locationDisplay");
    this.photoInput = document.getElementById("photoInput");
    this.cameraInput = document.getElementById("cameraInput");
    this.photoPreview = document.getElementById("photoPreview");
    this.uploadButton = document.getElementById("uploadButton");
    this.cameraButton = document.getElementById("cameraButton");
    this.refreshButton = document.getElementById("refresh");
    this.backButton = document.getElementById("backButton");
    this.cameraContainer = document.getElementById("cameraContainer");
    this.cameraPreview = document.getElementById("cameraPreview");
    this.captureButton = document.getElementById("captureButton");
    this.cameraSelect = document.getElementById("cameraSelect");
    this.submitButton = document.getElementById("submitButton");
  }

  initMap() {
    this.map = L.map("map").setView([-7.797068, 110.370529], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.map);

    this.map.on("click", (e) => {
      this.selectedLat = e.latlng.lat;
      this.selectedLon = e.latlng.lng;
      this.locationDisplay.textContent = `${this.selectedLat.toFixed(5)}, ${this.selectedLon.toFixed(5)}`;

      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = L.marker(e.latlng).addTo(this.map);
      }
    });
  }

  async populateCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      this.cameraSelect.innerHTML = "";
      videoDevices.forEach((device, index) => {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.text = device.label || `Camera ${index + 1}`;
        this.cameraSelect.appendChild(option);
      });
    } catch (error) {
      this.showMessage("Failed to enumerate devices: " + error.message, "red");
    }
  }

  bindEvents() {
    this.uploadButton.addEventListener("click", () => {
      this.photoInput.click();
    });

    this.photoInput.addEventListener("change", () => {
      this.handleFile(this.photoInput.files[0]);
    });

    this.cameraButton.addEventListener("click", async () => {
      await this.startCamera("environment");
    });

    this.refreshButton.addEventListener("click", async () => {
      const selectedDeviceId = this.cameraSelect.value;
      await this.startCamera(selectedDeviceId);
    });

    this.cameraSelect.addEventListener("change", async () => {
      const selectedDeviceId = this.cameraSelect.value;
      await this.startCamera(selectedDeviceId);
    });

    this.captureButton.addEventListener("click", () => {
      this.capturePhoto();
    });

    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const description = this.form.description.value.trim();
      const photo = this.photoInput.files[0] || this.capturedFile;

      if (!photo) {
        this.showMessage("Please select a photo using Upload or Camera.", "red");
        return;
      }

      if (this.selectedLat === undefined || this.selectedLon === undefined) {
        this.showMessage("Please select a location on the map.", "red");
        return;
      }

      await this.presenter.loadAndSubmitStory({
        description,
        photo,
        lat: this.selectedLat,
        lon: this.selectedLon,
      });
    });

    this.backButton.addEventListener("click", () => {
      this.back();
    });
  }

  async startCamera(deviceIdOrFacingMode) {
    try {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach((track) => track.stop());
      }
      const constraints =
        typeof deviceIdOrFacingMode === "string" && (deviceIdOrFacingMode === "environment" || deviceIdOrFacingMode === "user") ? { video: { facingMode: deviceIdOrFacingMode } } : { video: { deviceId: { exact: deviceIdOrFacingMode } } };

      this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.cameraPreview.srcObject = this.cameraStream;
      this.cameraContainer.style.display = "block";
      this.photoPreview.style.display = "none";
    } catch (err) {
      this.showMessage("Camera access failed: " + err.message, "red");
    }
  }

  capturePhoto() {
    if (!this.cameraPreview.videoWidth || !this.cameraPreview.videoHeight) {
      this.showMessage("Camera not ready.", "red");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = this.cameraPreview.videoWidth;
    canvas.height = this.cameraPreview.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(this.cameraPreview, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
        this.capturedFile = file;
        this.handleFile(file);
      },
      "image/jpeg",
      0.95
    );

    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraPreview.srcObject = null;
      this.cameraContainer.style.display = "none";
    }
  }

  handleFile(file) {
    if (!file) {
      this.photoPreview.style.display = "none";
      this.photoPreview.src = "";
      return;
    }

    const maxSizeMB = 1;
    if (file.size > maxSizeMB * 1024 * 1024) {
      this.showMessage(`File size exceeds ${maxSizeMB}MB. Please upload a smaller file.`, "red");
      this.photoInput.value = "";
      this.cameraInput.value = "";
      this.photoPreview.src = "";
      this.photoPreview.style.display = "none";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview.src = e.target.result;
      this.photoPreview.style.display = "block";
      this.showMessage("");
    };
    reader.readAsDataURL(file);
  }

  showMessage(text, color = "black") {
    if (this.message) {
      this.message.textContent = text;
      this.message.style.color = color;
    }
  }

  setLoading(isLoading) {
    if (this.submitButton) {
      this.submitButton.disabled = isLoading;
      this.submitButton.textContent = isLoading ? "Loading..." : "Submit Story";
    }
  }

  resetForm() {
    if (this.form) {
      this.form.reset();
    }
    this.photoInput.value = "";
    this.cameraInput.value = "";
    this.photoPreview.src = "";
    this.photoPreview.style.display = "none";
    this.locationDisplay.textContent = "None";
    this.capturedFile = null;
    this.selectedLat = undefined;
    this.selectedLon = undefined;
    if (this.marker && this.map) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }

  back() {
    this.stopCameraStream();
    window.location.href = "#/";
  }
}
