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

/** Large viewport height — stays tall while Safari chrome is visible */
const measureLvh = () => {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;left:0;top:0;width:0;height:100vh;height:100dvh;height:100lvh;visibility:hidden;pointer-events:none";
  document.documentElement.appendChild(probe);
  const h = probe.offsetHeight || 0;
  probe.remove();
  return h;
};

const readViewportHeight = () => {
  const lvh = measureLvh();
  const vv = window.visualViewport?.height ?? 0;
  const inner = window.innerHeight || 0;
  const client = document.documentElement.clientHeight || 0;
  return Math.round(Math.max(lvh, vv, inner, client));
};

const syncAppVh = () => {
  const h = readViewportHeight();
  if (h > 0) {
    document.documentElement.style.setProperty("--app-vh", `${h}px`);
  }
};

syncAppVh();
window.addEventListener("resize", syncAppVh);
window.addEventListener("orientationchange", () => {
  window.setTimeout(syncAppVh, 250);
});
window.visualViewport?.addEventListener("resize", syncAppVh);

try {
  localStorage.removeItem("dummfound-theme");
} catch {
  /* ignore */
}
document.documentElement.dataset.theme = "dark";
document.documentElement.style.colorScheme = "dark";
document.documentElement.style.background = "#000";

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
