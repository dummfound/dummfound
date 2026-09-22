import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BrandLoader } from "./BrandLoader";
import { lockBodyScroll } from "../hooks/lockBodyScroll";
import { useRadio } from "../hooks/RadioContext";
import styles from "../styles.module.scss";

const RADIO_VIDEOS = ["/video/g1.mp4", "/video/g2.mp4"];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "–:––";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const RadioTrigger = ({ openLabel }) => {
  const { open, playing, openRadio } = useRadio();

  return (
    <button
      type="button"
      className={`${styles.radioTrigger}${
        playing ? ` ${styles.radioTriggerLive}` : ""
      }`}
      onClick={openRadio}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={openLabel}
    >
      <span className={styles.radioTriggerLabel}>{openLabel}</span>
      {playing ? (
        <span className={styles.radioTriggerDot} aria-hidden="true" />
      ) : null}
    </button>
  );
};

export const RadioOverlay = ({
  titleLabel,
  closeLabel,
  playLabel,
  pauseLabel,
  minimizeLabel = "Minimize",
}) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const [bgIndex, setBgIndex] = useState(0);
  const {
    open,
    playing,
    loading,
    reconnecting,
    currentTime,
    streamReady,
    minimizeRadio,
    closeRadio,
    togglePlay,
  } = useRadio();

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") minimizeRadio();
    };
    document.addEventListener("keydown", onKey);
    const unlockScroll = lockBodyScroll();
    document.documentElement.setAttribute("data-radio-open", "");

    const previouslyFocused = document.activeElement;
    const closeBtn = dialogRef.current?.querySelector(`[data-radio-close]`);
    closeBtn?.focus?.();

    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
      document.documentElement.removeAttribute("data-radio-open");
      if (
        previouslyFocused instanceof HTMLElement &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
    };
  }, [open, minimizeRadio]);

  // Loader only while user asked to play / reconnect — never block the Play button
  const showLoader =
    open && (reconnecting || (loading && !playing));
  const onAir = playing && streamReady && !reconnecting;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`${styles.radioLayer}${open ? ` ${styles.radioLayerOpen}` : ""}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={styles.radioBackdrop}
        tabIndex={open ? 0 : -1}
        aria-label={minimizeLabel}
        onClick={minimizeRadio}
      />

      <div
        ref={dialogRef}
        className={styles.radioWindow}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        hidden={!open}
      >
        <header className={styles.radioChrome}>
          <h2 id={titleId} className={styles.radioChromeTitle}>
            {titleLabel}
          </h2>
          <button
            type="button"
            className={styles.radioMinimize}
            data-radio-close
            aria-label={minimizeLabel}
            title={minimizeLabel}
            onClick={minimizeRadio}
          >
            <svg
              className={styles.radioMinimizeIcon}
              viewBox="0 0 12 12"
              aria-hidden="true"
            >
              <path
                d="M1 6.5 H11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
              />
            </svg>
          </button>
          <button
            type="button"
            className={styles.radioClose}
            aria-label={closeLabel}
            onClick={closeRadio}
          >
            <svg
              className={styles.radioCloseIcon}
              viewBox="0 0 12 12"
              aria-hidden="true"
            >
              <path
                d="M1 1 L11 11 M11 1 L1 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
              />
            </svg>
          </button>
        </header>

        <div className={styles.radioStage}>
          <div className={styles.radioMedia} aria-hidden="true">
            {open ? (
              <video
                key={RADIO_VIDEOS[bgIndex]}
                className={styles.radioVideo}
                src={RADIO_VIDEOS[bgIndex]}
                muted
                defaultMuted
                playsInline
                autoPlay
                preload="metadata"
                onEnded={() =>
                  setBgIndex((i) => (i + 1) % RADIO_VIDEOS.length)
                }
                onLoadedMetadata={(event) => {
                  event.currentTarget.muted = true;
                  event.currentTarget.volume = 0;
                }}
                onPlay={(event) => {
                  event.currentTarget.muted = true;
                  event.currentTarget.volume = 0;
                }}
              />
            ) : null}
          </div>

          <div className={styles.radioOverlay}>
            {!showLoader ? (
              <div
                className={`${styles.radioControls}${
                  onAir ? ` ${styles.radioControlsLive}` : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.radioPlayBtn}
                  onClick={togglePlay}
                  aria-label={
                    loading ? playLabel : playing ? pauseLabel : playLabel
                  }
                  aria-busy={loading || undefined}
                >
                  {playing ? (
                    <svg
                      className={styles.radioPlayIcon}
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <rect
                        x="1.5"
                        y="1.5"
                        width="13"
                        height="13"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg
                      className={`${styles.radioPlayIcon} ${styles.radioPlayIconPlay}`}
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.2 1.2 L14.2 8 L2.2 14.8 Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </button>

                <div
                  className={`${styles.radioMeta}${
                    onAir ? ` ${styles.radioMetaVisible}` : ""
                  }`}
                  aria-hidden={!onAir}
                >
                  <p className={styles.radioOnAir} aria-live="polite">
                    <span className={styles.radioLiveDot} aria-hidden="true" />
                    ON AIR
                  </p>
                  <p className={styles.radioTime}>
                    {playing || loading
                      ? formatTime(currentTime)
                      : streamReady
                        ? "RADIO"
                        : "…"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {showLoader ? (
            <div className={styles.radioLoader}>
              <BrandLoader
                label={reconnecting ? "RECONNECTING" : "LOADING"}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

/** @deprecated use RadioTrigger + RadioOverlay */
export const Radio = ({ openLabel }) => <RadioTrigger openLabel={openLabel} />;
