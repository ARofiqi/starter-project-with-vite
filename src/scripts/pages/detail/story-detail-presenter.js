import { getStoryById } from "@/scripts/data/api";

export default class DetailPresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStory(id) {
    try {
      const response = await getStoryById(id);
      const story = response.story;
      this.view.showStoryDetail(story);
    } catch (error) {
      console.error("Gagal memuat cerita:", error);
      this.view.showError("Gagal memuat cerita.");
    }
  }
}
