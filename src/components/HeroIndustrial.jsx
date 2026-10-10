import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles.module.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * Desktop industrial field: mercury blobs + SVG displacement glitch on scroll.
 */
export const HeroIndustrial = ({
  active = true,
  sectionRef,
  titleRef,
}) => {
  const rootRef = useRef(null);
  const mercuryRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !active) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const section = sectionRef?.current;
    const title = titleRef?.current;
    const turb = root.querySelector("#df-hero-glitch-turb");
    const disp = root.querySelector("#df-hero-glitch-disp");
    const softTurb = root.querySelector("#df-hero-glitch-soft-turb");
    const softDisp = root.querySelector("#df-hero-glitch-soft-disp");
    const mercury = mercuryRef.current;

    let onMercuryMove = null;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
      );

      if (mercury) {
        const blobs = mercury.querySelectorAll("[data-blob]");
        blobs.forEach((blob, i) => {
          gsap.to(blob, {
            x: i % 2 === 0 ? 28 : -22,
            y: i % 2 === 0 ? -18 : 26,
            scale: 1.06 + i * 0.02,
            duration: 7 + i * 1.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
          gsap.to(blob, {
            rotate: i % 2 === 0 ? 8 : -10,
            duration: 11 + i,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });

        onMercuryMove = (e) => {
          const r = root.getBoundingClientRect();
          const nx = (e.clientX - r.left) / Math.max(r.width, 1) - 0.5;
          const ny = (e.clientY - r.top) / Math.max(r.height, 1) - 0.5;
          gsap.to(mercury, {
            x: nx * 18,
            y: ny * 12,
            duration: 1.1,
            ease: "power2.out",
            overwrite: "auto",
          });
        };
        window.addEventListener("pointermove", onMercuryMove, { passive: true });
      }

      if (turb && disp && section) {
        const state = { freq: 0.008, scale: 0 };
        const apply = () => {
          turb.setAttribute("baseFrequency", String(state.freq));
          disp.setAttribute("scale", String(state.scale));
          if (softTurb) {
            softTurb.setAttribute(
              "baseFrequency",
              String(0.012 + (state.scale / 18) * 0.03)
            );
          }
          if (softDisp) {
            softDisp.setAttribute("scale", String((state.scale / 18) * 6));
          }
        };
        apply();

        if (title) {
          title.style.filter = "url(#df-hero-glitch)";
        }
        root.style.filter = "url(#df-hero-glitch-soft)";

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            state.freq = 0.008 + p * 0.045;
            state.scale = p * 18;
            apply();
          },
        });
      }
    }, root);

    return () => {
      if (onMercuryMove) {
        window.removeEventListener("pointermove", onMercuryMove);
      }
      if (title) title.style.filter = "";
      if (root) root.style.filter = "";
      ctx.revert();
    };
  }, [active, sectionRef, titleRef]);

  if (!active) return null;

  return (
    <div ref={rootRef} className={styles.heroIndustrial} aria-hidden="true">
      <svg className={styles.heroIndustrialDefs} aria-hidden="true">
        <defs>
          <filter
            id="df-hero-glitch"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              id="df-hero-glitch-turb"
              type="fractalNoise"
              baseFrequency="0.008"
              numOctaves="2"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              id="df-hero-glitch-disp"
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter
            id="df-hero-glitch-soft"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              id="df-hero-glitch-soft-turb"
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              id="df-hero-glitch-soft-disp"
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="df-mercury" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 22 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" mode="normal" />
          </filter>
        </defs>
      </svg>

      <div
        ref={mercuryRef}
        className={styles.heroMercury}
        style={{ filter: "url(#df-mercury)" }}
      >
        <span
          data-blob=""
          className={styles.heroMercuryBlob}
          style={{ "--bx": "18%", "--by": "32%" }}
        />
        <span
          data-blob=""
          className={styles.heroMercuryBlob}
          style={{ "--bx": "42%", "--by": "58%" }}
        />
        <span
          data-blob=""
          className={styles.heroMercuryBlob}
          style={{ "--bx": "28%", "--by": "72%" }}
        />
      </div>
    </div>
  );
};
