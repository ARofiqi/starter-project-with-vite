// CSS imports
import "../styles/styles.css";
import "leaflet/dist/leaflet.css";

import App from "./pages/app";
import { registerServiceWorker } from "./utils";
import { subscribePush, unsubscribePush } from "./data/api";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await registerServiceWorker();
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  const skipLink = document.querySelector(".skip-link");
  const mainContent = document.querySelector("#main-content");

  skipLink.addEventListener("click", function (e) {
    e.preventDefault();

    mainContent.focus();

    mainContent.scrollIntoView({
      behavior: "smooth",
    });

    setTimeout(() => {
      skipLink.blur();
    }, 1000);
  });

  document.getElementById("subscribe-btn").addEventListener("click", subscribePush);
  document.getElementById("unsubscribe-btn").addEventListener("click", unsubscribePush);
});
