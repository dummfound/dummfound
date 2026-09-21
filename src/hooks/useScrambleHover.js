import { useRef } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * Scrambles label glyphs on hover (font glitch).
 */
export const useScrambleHover = (text) => {
  const textRef = useRef(null);
  const busyRef = useRef(false);

  const onMouseEnter = () => {
    const el = textRef.current;
    if (!el || busyRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    busyRef.current = true;
    gsap.to(el, {
      duration: 0.42,
      scrambleText: {
        text,
        chars: "upperCase",
        speed: 1.2,
        delimiter: "",
      },
      onComplete: () => {
        busyRef.current = false;
      },
    });
  };

  return { textRef, onMouseEnter };
};
