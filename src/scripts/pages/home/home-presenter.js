import { getData } from "@/scripts/data/api";

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
}
