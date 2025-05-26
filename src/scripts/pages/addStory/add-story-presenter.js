import { addStory } from "@/scripts/data/api";

export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
  }

  async loadAndSubmitStory({ description, photo, lat, lon }) {
    this.view.setLoading(true);
    this.view.showMessage("");
    try {
      const response = await addStory({ description, photo, lat, lon });
      if (!response.error) {
        this.view.showMessage(response.message || "Story added successfully!", "green");
        this.view.resetForm();
      } else {
        this.view.showMessage(response.message || "Failed to add story.", "red");
      }
    } catch (error) {
      console.error(error);
      this.view.showMessage("Failed to add story: " + error.message, "red");
    } finally {
      this.view.setLoading(false);
    }
  }
}
