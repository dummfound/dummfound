import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles.module.scss";

const LOCK_SECONDS = 10;
const MOBILE_MQ = "(max-width: 768px)";

const posterUrl = () => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}img/bratania-duo.jpg`;
};

const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches;

export const TourIntro = ({ titleLabel, closeLabel, waitLabel }) => {
  const titleId = useId();
  const [isMobile, setIsMobile] = useState(isMobileViewport);
  const [open, setOpen] = useState(isMobileViewport);
  const [secondsLeft, setSecondsLeft] = useState(LOCK_SECONDS);
  const canClose = secondsLeft <= 0;
  const visible = open && isMobile;

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (mobile) setOpen(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    setSecondsLeft(LOCK_SECONDS);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || canClose) return undefined;

    const id = window.setInterval(() => {
      setSecondsLeft((n) => Math.max(0, n - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [visible, canClose]);

  useEffect(() => {
    if (!visible) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape" && canClose) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, canClose]);

  const dismiss = () => {
    if (!canClose) return;
    setOpen(false);
  };

  if (!visible || typeof document === "undefined") return null;

  const closeText = canClose
    ? closeLabel
    : waitLabel.replace("{n}", String(secondsLeft));

  return createPortal(
    <div
      className={styles.tourIntro}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className={styles.tourIntroTitle}>
        {titleLabel}
      </h2>

      <div className={styles.tourIntroStage}>
        <img
          className={styles.tourIntroPoster}
          src={posterUrl()}
          alt=""
          decoding="async"
        />
      </div>

      <div className={styles.tourIntroBar}>
        <p className={styles.tourIntroTimer} aria-live="polite">
          {canClose ? null : (
            <>
              <span className={styles.tourIntroTimerCount}>{secondsLeft}</span>
              <span className={styles.tourIntroTimerUnit}>s</span>
            </>
          )}
        </p>
        <button
          type="button"
          className={styles.tourIntroClose}
          onClick={dismiss}
          disabled={!canClose}
          aria-disabled={!canClose}
        >
          {closeText}
        </button>
      </div>
    </div>,
    document.body
  );
};
