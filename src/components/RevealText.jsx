import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import styles from "../styles.module.scss";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

export const REVEAL_EASE = "expo.out";

/**
 * GSAP SplitText + ScrambleTextPlugin (locomotive.ca stack).
 * Letters slide up, then scramble while fully visible.
 */
export const RevealText = ({
  text,
  as: Tag = "span",
  className = "",
  delay = 0.1,
  stagger = 0.04,
  duration = 0.9,
  scrambleDuration = 0.55,
}) => {
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const split = SplitText.create(el, {
      type: "chars",
      charsClass: styles.revealChar,
      aria: "auto",
    });

    const masks = split.chars.map((char) => {
      const mask = document.createElement("span");
      mask.className = styles.revealMask;
      char.parentNode?.insertBefore(mask, char);
      mask.appendChild(char);
      return mask;
    });

    const glyphs = split.chars.filter((char) => Boolean(char.textContent?.trim()));

    gsap.set(split.chars, { yPercent: 120 });

    const tl = gsap.timeline({ delay });

    // 1) Bring letters into the mask (visible)
    tl.to(split.chars, {
      yPercent: 0,
      duration,
      ease: REVEAL_EASE,
      stagger,
      force3D: true,
    });

    // 2) Scramble while visible — chaotic glyph churn, then lock
    if (glyphs.length) {
      tl.to(
        glyphs,
        {
          duration: scrambleDuration,
          stagger: stagger * 0.75,
          scrambleText: {
            text: "{original}",
            chars: "upperCase",
            speed: 1.2,
            delimiter: "",
          },
        },
        // start once the first letters have mostly risen into view
        `-=${Math.max(0.35, duration - 0.25)}`
      );
    }

    return () => {
      tl.kill();
      masks.forEach((mask) => {
        const char = mask.firstChild;
        if (char && mask.parentNode) {
          mask.parentNode.insertBefore(char, mask);
          mask.remove();
        }
      });
      split.revert();
    };
  }, [text, delay, stagger, duration, scrambleDuration]);

  return (
    <Tag className={className} aria-label={text}>
      <span ref={textRef} className={styles.revealLine} aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
};
