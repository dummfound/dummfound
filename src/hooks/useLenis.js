import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/** @type {Lenis | null} */
let lenisInstance = null;
let lockCount = 0;

export const getLenis = () => lenisInstance;

/**
 * Programmatic scroll via Lenis when available, otherwise native window.
 * @param {number | HTMLElement | string} target
 * @param {{ immediate?: boolean; offset?: number; duration?: number }} [options]
 */
export const scrollTo = (target, options = {}) => {
  const { immediate = false, offset = 0, duration } = options;
  const lenis = lenisInstance;

  if (lenis) {
    lenis.scrollTo(target, {
      immediate,
      offset,
      ...(duration != null ? { duration } : {}),
      force: true,
      programmatic: true,
    });
    return;
  }

  let top = 0;
  if (typeof target === "number") {
    top = target;
  } else if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY + offset;
  } else if (target instanceof HTMLElement) {
    top = target.getBoundingClientRect().top + window.scrollY + offset;
  }

  window.scrollTo({
    top: Math.max(0, top),
    behavior: immediate ? "auto" : "smooth",
  });
};

/** Pause Lenis while overlays lock the page (menu / radio). Nested-safe. */
export const pauseLenis = () => {
  lockCount += 1;
  lenisInstance?.stop();
};

export const resumeLenis = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) lenisInstance?.start();
};

/**
 * Document-level Lenis driven by GSAP ticker; ScrollTrigger updates on Lenis scroll.
 * Mount once near the app root.
 */
export const useLenis = () => {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
      anchors: false,
      respectReducedMotion: true,
      // Nested overflow:auto panels keep native scroll
      prevent: (node) => node?.closest?.("[data-lenis-prevent]") != null,
    });

    lenisInstance = lenis;
    lockCount = 0;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
      lockCount = 0;
      ScrollTrigger.refresh();
    };
  }, []);
};
