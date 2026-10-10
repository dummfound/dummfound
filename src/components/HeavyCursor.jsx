import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import styles from "../styles.module.scss";

const DESKTOP_MQ = "(min-width: 769px) and (pointer: fine)";
const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor]';

/**
 * Heavy inertia cursor — difference disc + magnetic snap on interactive targets.
 */
export const HeavyCursor = () => {
  const rootRef = useRef(null);
  const discRef = useRef(null);
  const crossRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const disc = discRef.current;
    const cross = crossRef.current;
    if (!root || !disc || !cross) return undefined;

    const mq = window.matchMedia(DESKTOP_MQ);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let enabled = false;
    let hovering = false;
    let magnet = null;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const xTo = gsap.quickTo(disc, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(disc, "y", { duration: 0.55, ease: "power3.out" });
    const cxTo = gsap.quickTo(cross, "x", {
      duration: 0.28,
      ease: "power2.out",
    });
    const cyTo = gsap.quickTo(cross, "y", {
      duration: 0.28,
      ease: "power2.out",
    });

    const setEnabled = (on) => {
      enabled = on && !reduced.matches;
      document.documentElement.classList.toggle("df-heavy-cursor", enabled);
      gsap.set(root, { autoAlpha: enabled ? 1 : 0 });
    };

    const moveTo = (x, y) => {
      pos.x = x;
      pos.y = y;
      let tx = x;
      let ty = y;
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const mx = r.left + r.width / 2;
        const my = r.top + r.height / 2;
        // Pull toward target — metal snap
        tx = gsap.utils.interpolate(x, mx, 0.42);
        ty = gsap.utils.interpolate(y, my, 0.42);
      }
      xTo(tx);
      yTo(ty);
      cxTo(x);
      cyTo(y);
    };

    const onMove = (e) => {
      if (!enabled) return;
      moveTo(e.clientX, e.clientY);
    };

    const armTarget = (el) => {
      if (!el || el.closest("[data-cursor-ignore]")) {
        magnet = null;
        if (hovering) {
          hovering = false;
          root.classList.remove(styles.heavyCursorHot);
          gsap.to(disc, {
            scale: 1,
            duration: 0.45,
            ease: "elastic.out(1, 0.35)",
            overwrite: "auto",
          });
        }
        return;
      }
      magnet = el;
      if (!hovering) {
        hovering = true;
        root.classList.add(styles.heavyCursorHot);
        gsap.to(disc, {
          scale: 1.55,
          duration: 0.55,
          ease: "elastic.out(1, 0.3)",
          overwrite: "auto",
        });
      }
    };

    const onOver = (e) => {
      if (!enabled) return;
      const el = e.target?.closest?.(INTERACTIVE);
      armTarget(el || null);
    };

    const onOut = (e) => {
      if (!enabled) return;
      const next = e.relatedTarget?.closest?.(INTERACTIVE);
      if (!next) armTarget(null);
    };

    gsap.set([disc, cross], {
      xPercent: -50,
      yPercent: -50,
      x: pos.x,
      y: pos.y,
    });
    gsap.set(root, { autoAlpha: 0 });

    const syncMq = () => setEnabled(mq.matches);
    syncMq();
    mq.addEventListener("change", syncMq);
    reduced.addEventListener("change", syncMq);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointerout", onOut, true);

    return () => {
      document.documentElement.classList.remove("df-heavy-cursor");
      mq.removeEventListener("change", syncMq);
      reduced.removeEventListener("change", syncMq);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointerout", onOut, true);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div ref={rootRef} className={styles.heavyCursor} aria-hidden="true">
      <div ref={discRef} className={styles.heavyCursorDisc} />
      <div ref={crossRef} className={styles.heavyCursorCross} />
    </div>,
    document.body
  );
};
