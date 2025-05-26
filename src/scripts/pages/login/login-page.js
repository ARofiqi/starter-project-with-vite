import LoginPresenter from "./login-presenter";

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPresenter(this);
  }

  async render() {
    return `
      <section class="container login">
        <h1>Login</h1>
        <p id="loginMessage"></p>
        <form id="loginForm" class="login-form" method="POST">
          <div class="form-group">
            <label for="email">
              Email:
              <input type="email" id="email" name="email" placeholder="Username..." required />
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
          <button type="button" id="loginButton">Login</button>
        </form>
        <p id="registerBtn" class="link-button">Belum punya akun? Daftar</p>
      </section>
    `;
  }

  async afterRender() {
    const loginButton = document.getElementById("loginButton");
    // const message = document.getElementById("loginMessage");
    const registerBtn = document.getElementById("registerBtn");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    if (togglePassword) {
      togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        const icon = type === "password" ? "fa-eye" : "fa-eye-slash";
        togglePassword.innerHTML = `<i class="fas ${icon}"></i>`;
      });
    }

    if (loginButton) {
      loginButton.addEventListener("click", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        this.presenter.login(email, password);
      });
    }

    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        window.location.href = "#/register";
      });
    }
  }

  showMessage(text, color) {
    const message = document.getElementById("loginMessage");
    if (message) {
      message.textContent = text;
      message.style.color = color;
    }
  }

  setLoading(isLoading) {
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
      loginButton.disabled = isLoading;
      loginButton.textContent = isLoading ? "Loading..." : "Login";
    }
  }

  redirectToHome() {
    window.location.href = "#/";
  }
}
