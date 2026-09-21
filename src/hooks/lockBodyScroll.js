/**
 * iOS Safari ignores overflow:hidden on body while the page can still rubber-band.
 * Lock with position:fixed + restore scrollY (same idea as react-remove-scroll / dexclub).
 */
export const lockBodyScroll = () => {
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
