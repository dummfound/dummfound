import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles.module.scss";

const TRACK = {
  file: "Together.mp3",
  title: "Lørean & DUMMFOUND — Together",
};

const RADIO_VIDEO = "/video/RADIO.MOV";

const audioBase = () => import.meta.env.BASE_URL.replace(/\/?$/, "/");

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "–:––";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const Radio = ({
  openLabel,
  titleLabel,
  closeLabel,
  playLabel,
  pauseLabel,
  volumeLabel,
}) => {
  const titleId = useId();
  const audioRef = useRef(null);
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(NaN);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = `${audioBase()}music/${encodeURIComponent(TRACK.file)}`;
    a.volume = volume;
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      const p = a.play();
      if (p !== undefined) p.catch(() => setPlaying(false));
    } else {
      a.pause();
    }
  }, [playing]);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previouslyFocused = document.activeElement;
    const closeBtn = dialogRef.current?.querySelector(
      `[data-radio-close]`
    );
    closeBtn?.focus?.();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (
        previouslyFocused instanceof HTMLElement &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  const handleEnded = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    setCurrentTime(0);
    setPlaying(true);
    a.play()?.catch(() => setPlaying(false));
  }, []);

  const togglePlay = () => {
    if (playing) {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.currentTime = 0;
        setCurrentTime(0);
      }
      setPlaying(false);
      return;
    }
    setPlaying(true);
  };

  const openRadio = () => setOpen(true);
  const closeRadio = () => setOpen(false);

  const windowNode =
    typeof document !== "undefined"
      ? createPortal(
          <div
            className={`${styles.radioLayer}${
              open ? ` ${styles.radioLayerOpen}` : ""
            }`}
            aria-hidden={!open}
          >
            <button
              type="button"
              className={styles.radioBackdrop}
              tabIndex={open ? 0 : -1}
              aria-label={closeLabel}
              onClick={closeRadio}
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
                  className={styles.radioClose}
                  data-radio-close
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
                      key={RADIO_VIDEO}
                      className={styles.radioVideo}
                      src={RADIO_VIDEO}
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                  ) : null}
                </div>

                <div className={styles.radioOverlay}>
                  <div className={styles.radioInfo}>
                    <p className={styles.radioTrack}>{TRACK.title}</p>
                    <p className={styles.radioTime}>
                      {formatTime(currentTime)}
                      <span aria-hidden="true"> / </span>
                      {formatTime(duration)}
                    </p>
                    <label className={styles.radioVolume}>
                      <span className={styles.radioVolumeLabel}>
                        {volumeLabel}
                      </span>
                      <input
                        className={styles.radioVolumeInput}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        aria-label={volumeLabel}
                        onChange={(event) =>
                          setVolume(Number(event.target.value))
                        }
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className={styles.radioPlayBtn}
                    onClick={togglePlay}
                    aria-label={playing ? pauseLabel : playLabel}
                  >
                    {playing ? (
                      <svg
                        className={styles.radioPlayIcon}
                        viewBox="0 0 14 14"
                        aria-hidden="true"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="12"
                          height="12"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      <svg
                        className={styles.radioPlayIcon}
                        viewBox="0 0 14 14"
                        aria-hidden="true"
                      >
                        <path d="M2 1 L13 7 L2 13 Z" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) =>
          setDuration(event.currentTarget.duration)
        }
      />

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

      {windowNode}
    </>
  );
};
