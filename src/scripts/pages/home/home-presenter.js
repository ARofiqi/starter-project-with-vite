import { getData } from "@/scripts/data/api";

import { getStories } from "../../data/IndexedDB.js";

export default class HomePresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStories() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.view.redirectToLogin();
      return;
    }

    try {
      const response = await getData();
      const stories = response.listStory || [];
      this.view.showStories(stories);
    } catch (error) {
      console.error("Gagal memuat cerita:", error);
      this.view.showError("Gagal memuat cerita. Silakan coba lagi nanti.");
    }
  }

  async loadStoriesFromDB() {
    try {
      const stories = await getStories();
      this.view.showStoriesLiked(stories);
    } catch (error) {
      console.error("Gagal memuat cerita dari IndexedDB:", error);
      this.view.showErrorLiked("Gagal memuat cerita dari penyimpanan lokal.");
    }
  }
}
