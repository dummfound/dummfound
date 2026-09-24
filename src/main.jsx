import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./global.scss";

{
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const svgHref = `${base}favicon.svg`;
  const pngHref = `${base}favicon.png`;

  let svg = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  if (!svg) {
    svg = document.createElement("link");
    svg.rel = "icon";
    svg.type = "image/svg+xml";
    document.head.appendChild(svg);
  }
  svg.href = svgHref;

  let png = document.querySelector('link[rel="icon"][type="image/png"]');
  if (!png) {
    png = document.createElement("link");
    png.rel = "icon";
    png.type = "image/png";
    document.head.appendChild(png);
  }
  png.href = pngHref;

  let apple = document.querySelector('link[rel="apple-touch-icon"]');
  if (!apple) {
    apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    document.head.appendChild(apple);
  }
  apple.href = pngHref;
}

/** Large viewport height — stays tall while Safari chrome is visible */
const isAppleTouch =
  typeof navigator !== "undefined" &&
  (/iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

const measureLvh = () => {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;left:0;top:0;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none";
  document.documentElement.appendChild(probe);
  const h = probe.getBoundingClientRect().height || probe.offsetHeight || 0;
  probe.remove();
  return h;
};

let lockedAppVh = 0;

const readViewportHeight = ({ reset = false } = {}) => {
  if (reset) lockedAppVh = 0;
  const lvh = measureLvh();
  const vv = window.visualViewport?.height ?? 0;
  const inner = window.innerHeight || 0;
  const client = document.documentElement.clientHeight || 0;
  // iOS Safari: lvh alone still undershoots (toolbar / Liquid Glass).
  // screen.height is the reliable full-device CSS-px floor.
  const screenH = isAppleTouch ? window.screen?.height ?? 0 : 0;
  const buffer = isAppleTouch ? 64 : 0;
  const base = Math.round(
    Math.max(lockedAppVh, lvh, vv, inner, client, screenH)
  );
  if (base > 0) lockedAppVh = base;
  return base > 0 ? base + buffer : 0;
};

const syncAppVh = (opts) => {
  const h = readViewportHeight(opts);
  if (h > 0) {
    document.documentElement.style.setProperty("--app-vh", `${h}px`);
  }
};

syncAppVh();
window.addEventListener("resize", () => syncAppVh());
window.addEventListener("orientationchange", () => {
  window.setTimeout(() => syncAppVh({ reset: true }), 250);
});
window.visualViewport?.addEventListener("resize", () => syncAppVh());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") syncAppVh();
});

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
