import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDrag } from "@use-gesture/react";
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

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
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
  const volumeLabelId = `${titleId}-vol`;
  const audioRef = useRef(null);
  const dialogRef = useRef(null);
  const volumeTrackRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const volumeRef = useRef(0.75);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(NaN);

  volumeRef.current = volume;

  const applyVolume = useCallback((value) => {
    const next = clamp01(value);
    const gain = gainRef.current;
    const ctx = audioCtxRef.current;
    if (gain && ctx) {
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(next, ctx.currentTime);
      } catch {
        gain.gain.value = next;
      }
    }
    const a = audioRef.current;
    /* Пока нет GainNode — пробуем element.volume (на iOS всё равно no-op). */
    if (a && !gain) a.volume = next;
  }, []);

  /*
   * На iOS HTMLMediaElement.volume игнорируется.
   * Громкость только через GainNode; граф создаём синхронно в жесте.
   */
  const ensureAudioGraph = useCallback(() => {
    const a = audioRef.current;
    if (!a) return null;

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      a.volume = volumeRef.current;
      return null;
    }

    if (!audioCtxRef.current) {
      try {
        const ctx = new AC();
        const source = ctx.createMediaElementSource(a);
        const gain = ctx.createGain();
        gain.gain.value = volumeRef.current;
        source.connect(gain);
        gain.connect(ctx.destination);
        audioCtxRef.current = ctx;
        gainRef.current = gain;
        a.volume = 1;
      } catch {
        a.volume = volumeRef.current;
        return null;
      }
    }

    const ctx = audioCtxRef.current;
    if (ctx?.state === "suspended") {
      void ctx.resume();
    }
    return ctx;
  }, []);

  const setVolumeFromClientX = useCallback(
    (clientX) => {
      const track = volumeTrackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      const next = clamp01((clientX - rect.left) / rect.width);
      volumeRef.current = next;
      setVolume(next);
      applyVolume(next);
    },
    [applyVolume]
  );

  /* Touch-события + touch-action: none — стабильнее на iPhone, чем pointer. */
  const bindVolume = useDrag(
    ({ xy: [x], first, event }) => {
      if (first) {
        event?.preventDefault?.();
        ensureAudioGraph();
      }
      setVolumeFromClientX(x);
    },
    {
      axis: "x",
      filterTaps: false,
      pointer: { touch: true, capture: true },
      eventOptions: { passive: false },
    }
  );

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = `${audioBase()}music/${encodeURIComponent(TRACK.file)}`;
    a.volume = volumeRef.current;
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previouslyFocused = document.activeElement;
    const closeBtn = dialogRef.current?.querySelector(`[data-radio-close]`);
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
    ensureAudioGraph();
    const playPromise = a.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      setPlaying(true);
    }
  }, [ensureAudioGraph]);

  const stopPlayback = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
      setCurrentTime(0);
    }
    setPlaying(false);
  }, []);

  const startPlayback = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    /* Важно синхронно в клике — иначе iOS не даст resume/play. */
    ensureAudioGraph();
    const playPromise = a.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      setPlaying(true);
    }
  }, [ensureAudioGraph]);

  const togglePlay = () => {
    if (playing) {
      stopPlayback();
      return;
    }
    startPlayback();
  };

  const openRadio = () => setOpen(true);
  const closeRadio = () => setOpen(false);

  const volumePercent = `${Math.round(volume * 100)}%`;

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
                    <div className={styles.radioVolume}>
                      <span
                        className={styles.radioVolumeLabel}
                        id={volumeLabelId}
                      >
                        {volumeLabel}
                      </span>
                      <div
                        ref={volumeTrackRef}
                        className={styles.radioVolumeSlider}
                        role="slider"
                        tabIndex={0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(volume * 100)}
                        aria-valuetext={volumePercent}
                        aria-labelledby={volumeLabelId}
                        style={{ touchAction: "none" }}
                        {...bindVolume()}
                        onKeyDown={(event) => {
                          let next = volume;
                          if (
                            event.key === "ArrowRight" ||
                            event.key === "ArrowUp"
                          ) {
                            next = clamp01(volume + 0.05);
                          } else if (
                            event.key === "ArrowLeft" ||
                            event.key === "ArrowDown"
                          ) {
                            next = clamp01(volume - 0.05);
                          } else if (event.key === "Home") {
                            next = 0;
                          } else if (event.key === "End") {
                            next = 1;
                          } else {
                            return;
                          }
                          event.preventDefault();
                          ensureAudioGraph();
                          volumeRef.current = next;
                          setVolume(next);
                          applyVolume(next);
                        }}
                      >
                        <div
                          className={styles.radioVolumeTrack}
                          aria-hidden="true"
                        >
                          <div
                            className={styles.radioVolumeFill}
                            style={{ width: volumePercent }}
                          />
                          <div
                            className={styles.radioVolumeThumb}
                            style={{ left: volumePercent }}
                          />
                        </div>
                      </div>
                    </div>
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
        preload="auto"
        playsInline
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
