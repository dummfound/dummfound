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

const syncChromeSafeTop = () => {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top, 0px)";
  document.documentElement.appendChild(probe);
  let top = Number.parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();

  const isiPhone = /iPhone/.test(navigator.userAgent);
  const tallPhone = Math.max(screen.width, screen.height) >= 812;
  // iPhone X+ sometimes reports 0 without a reliable env() — keep island clear
  if (isiPhone && tallPhone && top < 20) top = 47;

  document.documentElement.style.setProperty("--chrome-safe-top", `${top}px`);
};

const syncAppVh = () => {
  const vv = window.visualViewport?.height ?? 0;
  const inner = window.innerHeight || 0;
  const client = document.documentElement.clientHeight || 0;
  // Never undershoot: short hero lets the next section peek on iOS Safari
  const h = Math.max(vv, inner, client);
  document.documentElement.style.setProperty("--app-vh", `${Math.round(h)}px`);
};

const syncViewportMetrics = () => {
  syncChromeSafeTop();
  syncAppVh();
};

syncViewportMetrics();
window.addEventListener("resize", syncViewportMetrics);
window.addEventListener("orientationchange", syncViewportMetrics);
window.visualViewport?.addEventListener("resize", syncViewportMetrics);
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
