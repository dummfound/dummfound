import { useCallback, useEffect, useState } from "react";

/** Десктоп от 769px: ниже и на 768px — мобильное меню (кнопка-бургер) */
const DESKTOP_NAV_MATCH = "(min-width: 769px)";
const MOBILE_NAV_MATCH = "(max-width: 768px)";

/**
 * iOS Safari ignores overflow:hidden on body while the page can still rubber-band.
 * Lock with position:fixed + restore scrollY (same idea as react-remove-scroll / dexclub).
 */
const lockBodyScroll = () => {
  const { body, documentElement } = document;
  const scrollY = window.scrollY;
  const prev = {
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    htmlOverflow: documentElement.style.overflow,
    htmlOverscroll: documentElement.style.overscrollBehavior,
  };

  body.classList.add("nav-open");
  documentElement.classList.add("nav-open");
  documentElement.style.overflow = "hidden";
  documentElement.style.overscrollBehavior = "none";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";

  return () => {
    body.classList.remove("nav-open");
    documentElement.classList.remove("nav-open");
    body.style.overflow = prev.bodyOverflow;
    body.style.position = prev.bodyPosition;
    body.style.top = prev.bodyTop;
    body.style.left = prev.bodyLeft;
    body.style.right = prev.bodyRight;
    body.style.width = prev.bodyWidth;
    documentElement.style.overflow = prev.htmlOverflow;
    documentElement.style.overscrollBehavior = prev.htmlOverscroll;
    window.scrollTo(0, scrollY);
  };
};

export const useNavMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_NAV_MATCH);
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia(MOBILE_NAV_MATCH);
    if (!mq.matches) return;
    return lockBodyScroll();
  }, [menuOpen]);

  return { menuOpen, closeMenu, toggleMenu };
};
