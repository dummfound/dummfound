import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./global.scss";

{
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const href = `${base}favicon.svg`;
  let link = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    document.head.appendChild(link);
  }
  link.href = href;
}

const syncAppVh = () => {
  const h = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty("--app-vh", `${Math.round(h)}px`);
};
syncAppVh();
window.addEventListener("resize", syncAppVh);
window.addEventListener("orientationchange", syncAppVh);
window.visualViewport?.addEventListener("resize", syncAppVh);
window.visualViewport?.addEventListener("scroll", syncAppVh);

try {
  localStorage.removeItem("dummfound-theme");
} catch {
  /* ignore */
}
document.documentElement.dataset.theme = "light";

const base = import.meta.env.BASE_URL;
const routerBasename =
  base === "/" ? undefined : base.endsWith("/") ? base.slice(0, -1) : base;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
