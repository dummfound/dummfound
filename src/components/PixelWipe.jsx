import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles.module.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * PK-style pixelated section transition: a grid of squares that
 * cover/reveal as you scroll into the next block.
 */
export const PixelWipe = ({ theme = "gray" }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.style.display = "none";
      return undefined;
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const cols = isMobile ? 8 : 20;
    const rows = isMobile ? 3 : 4;

    root.style.setProperty("--pixel-cols", String(cols));
    root.style.setProperty("--pixel-rows", String(rows));
    root.replaceChildren();

    const pixels = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cell = document.createElement("span");
        cell.className = styles.pixelWipeCell;
        cell.style.setProperty("--c", String(c));
        cell.style.setProperty("--r", String(r));
        root.appendChild(cell);
        pixels.push(cell);
      }
    }

    gsap.set(pixels, { scaleY: 0, transformOrigin: "50% 100%" });

    const ctx = gsap.context(() => {
      gsap.to(pixels, {
        scaleY: 1,
        ease: "none",
        stagger: {
          each: 0.012,
          from: "end",
          grid: [rows, cols],
        },
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.4,
        },
      });
    }, root);

    return () => {
      ctx.revert();
      root.replaceChildren();
    };
  }, [theme]);

  return (
    <div
      ref={rootRef}
      className={styles.pixelWipe}
      data-theme={theme}
      aria-hidden="true"
    />
  );
};
