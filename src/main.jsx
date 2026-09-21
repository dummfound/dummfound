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

const isiPhone = () => /iPhone|iPod/.test(navigator.userAgent);

const measureEnvSafeTop = () => {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;padding-top:constant(safe-area-inset-top);padding-top:env(safe-area-inset-top, 0px)";
  document.documentElement.appendChild(probe);
  const top = Number.parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  return top;
};

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

const syncChromeSafeTop = () => {
  let top = measureEnvSafeTop();
  if (isiPhone() && Math.max(screen.width, screen.height) >= 812) {
    const floor = Math.max(screen.width, screen.height) >= 852 ? 59 : 47;
    top = Math.max(top, floor);
  }
  document.documentElement.style.setProperty("--chrome-safe-top", `${top}px`);
};

const readViewportHeight = () => {
  const lvh = measureLvh();
  const vv = window.visualViewport?.height ?? 0;
  const inner = window.innerHeight || 0;
  const client = document.documentElement.clientHeight || 0;
  // Always prefer large viewport so About / drawer never peek under Safari UI
  return Math.round(Math.max(lvh, vv, inner, client));
};

const syncAppVh = () => {
  const h = readViewportHeight();
  if (h > 0) {
    document.documentElement.style.setProperty("--app-vh", `${h}px`);
  }
};

const syncViewportMetrics = () => {
  syncChromeSafeTop();
  syncAppVh();
};

syncViewportMetrics();
window.addEventListener("resize", syncViewportMetrics);
window.addEventListener("orientationchange", () => {
  window.setTimeout(syncViewportMetrics, 250);
});
window.visualViewport?.addEventListener("resize", syncViewportMetrics);

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
