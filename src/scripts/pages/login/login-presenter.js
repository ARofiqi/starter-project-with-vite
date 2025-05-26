import { loginUser } from "@/scripts/data/api";

export default class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async login(email, password) {
    this.view.setLoading(true);
    try {
      const response = await loginUser({ email, password });
      if (!response.error) {
        const { userId, name, token } = response.loginResult;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", name);
        this.view.showMessage("Login berhasil!", "green");
        this.view.redirectToHome();
      } else {
        this.view.showMessage(response.message || "Login gagal.", "red");
      }
    } catch (error) {
      console.error(error);
      this.view.showMessage("Terjadi kesalahan saat login.", "red");
    } finally {
      this.view.setLoading(false);
    }
  }
}
