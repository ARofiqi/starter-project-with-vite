import RegisterPresenter from "./register-presenter.js";

export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPresenter(this);
  }

  async render() {
    return `
      <section class="container login">
        <h1>Register</h1>
        <p id="registerMessage"></p>
        <form id="registerForm" class="login-form">
          <div class="form-group">
            <label for="name">
              Nama:
              <input type="text" id="name" name="name" placeholder="Fullname..." required />
            </label>
          </div>
          <div class="form-group">
            <label for="email">
              Email:
              <input type="email" id="email" name="email" placeholder="Email..." required />
            </label>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <div style="position: relative;">
              <input type="password" id="password" name="password" placeholder="Password..." required />
              <span id="togglePassword">
                <i class="fas fa-eye"></i>
              </span>
            </div>
          </div>
          <button type="submit" id="registerButton">Daftar</button>
        </form>
        <p id="loginBtn" class="link-button">Sudah punya akun? Masuk</p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById("registerForm");
    const registerButton = document.getElementById("registerButton");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");

    if (togglePassword) {
      togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        const icon = type === "password" ? "fa-eye" : "fa-eye-slash";
        togglePassword.innerHTML = `<i class="fas ${icon}"></i>`;
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value.trim();
        this.presenter.register(name, email, password);
      });
    }

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        window.location.href = "#/login";
      });
    }
  }

  showMessage(text, color) {
    const message = document.getElementById("registerMessage");
    if (message) {
      message.textContent = text;
      message.style.color = color;
    }
  }

  setLoading(isLoading) {
    const registerButton = document.getElementById("registerButton");
    if (registerButton) {
      registerButton.disabled = isLoading;
      registerButton.textContent = isLoading ? "Loading..." : "Daftar";
    }
  }

  resetForm() {
    const form = document.getElementById("registerForm");
    if (form) {
      form.reset();
    }
  }
}
