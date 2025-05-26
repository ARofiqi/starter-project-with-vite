import { registerUser } from "@/scripts/data/api";

export default class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  async register(name, email, password) {
    this.view.setLoading(true);
    try {
      const response = await registerUser({ name, email, password });
      if (!response.error) {
        this.view.showMessage("Registrasi berhasil! Silakan login.", "green");
        this.view.resetForm();
      } else {
        this.view.showMessage(response.message || "Registrasi gagal.", "red");
      }
    } catch (error) {
      console.error(error);
      this.view.showMessage("Terjadi kesalahan saat registrasi.", "red");
    } finally {
      this.view.setLoading(false);
    }
  }
}
