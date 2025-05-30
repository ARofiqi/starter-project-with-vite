import { getStoryById } from "@/scripts/data/api";
import { saveStory, deleteStory, isStorySaved } from "../../data/IndexedDB.js";

export default class DetailPresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStory(id) {
    try {
      const response = await getStoryById(id);
      const story = response.story;

      this.view.showStoryDetail(story);

      this.view.isStorySaved = await this.isStorySaved(id);
      this.view.updateSaveButton();

      return story;
    } catch (error) {
      console.error("Gagal memuat cerita:", error);
      this.view.showError("Gagal memuat cerita.");
      return null;
    }
  }

  async deleteStory(storyId) {
    try {
      await deleteStory(storyId);
      return true;
    } catch (error) {
      console.error("Gagal menghapus cerita:", error);
      return false;
    }
  }

  async isStorySaved(storyId) {
    try {
      return await isStorySaved(storyId);
    } catch (error) {
      console.error("Gagal memeriksa status penyimpanan:", error);
      return false;
    }
  }

  async saveStory(storyId) {
    try {
      const response = await getStoryById(storyId);
      const story = response.story;

      await saveStory(story);
      return true;
    } catch (error) {
      console.error("Gagal menyimpan cerita:", error);
      return false;
    }
  }
}
