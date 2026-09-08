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

function trackUrl() {
  return `${audioBase()}music/${encodeURIComponent(TRACK.file)}`;
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
  const dialogRef = useRef(null);
  const volumeTrackRef = useRef(null);
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const bufferRef = useRef(null);
  const sourceRef = useRef(null);
  const prefetchRef = useRef(null);
  const startedAtRef = useRef(0);
  const rafRef = useRef(0);
  const volumeRef = useRef(0.75);
  const playingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(NaN);

  volumeRef.current = volume;
  playingRef.current = playing;

  const applyVolume = useCallback((value) => {
    const next = clamp01(value);
    const gain = gainRef.current;
    if (!gain) return;
    const ctx = ctxRef.current;
    try {
      if (ctx) {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(next, ctx.currentTime);
      } else {
        gain.gain.value = next;
      }
    } catch {
      gain.gain.value = next;
    }
  }, []);

  /*
   * На iPhone MediaElementSource часто НЕ ведёт звук через Web Audio:
   * GainNode крутится вхолостую, а играет сам <audio>.
   * Поэтому играем через AudioBufferSourceNode + GainNode.
   */
  const ensureContext = useCallback(() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;

    if (!ctxRef.current) {
      const ctx = new AC();
      const gain = ctx.createGain();
      gain.gain.value = volumeRef.current;
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = gain;
    }

    const ctx = ctxRef.current;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    return ctx;
  }, []);

  const stopSource = useCallback(() => {
    const source = sourceRef.current;
    if (!source) return;
    try {
      source.onended = null;
      source.stop();
    } catch {
      /* уже остановлен */
    }
    try {
      source.disconnect();
    } catch {
      /* ignore */
    }
    sourceRef.current = null;
  }, []);

  const stopClock = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const tick = useCallback(() => {
    if (!playingRef.current) return;
    const ctx = ctxRef.current;
    const buffer = bufferRef.current;
    if (ctx && buffer?.duration) {
      const elapsed =
        (ctx.currentTime - startedAtRef.current) % buffer.duration;
      setCurrentTime(elapsed);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startClock = useCallback(() => {
    stopClock();
    rafRef.current = requestAnimationFrame(tick);
  }, [stopClock, tick]);

  const loadBuffer = useCallback(async () => {
    if (bufferRef.current) return bufferRef.current;
    const ctx = ctxRef.current;
    if (!ctx) throw new Error("no audio context");

    if (!prefetchRef.current) {
      prefetchRef.current = fetch(trackUrl()).then((res) => {
        if (!res.ok) throw new Error("track fetch failed");
        return res.arrayBuffer();
      });
    }

    const bytes = await prefetchRef.current;
    const buffer = await ctx.decodeAudioData(bytes.slice(0));
    bufferRef.current = buffer;
    setDuration(buffer.duration);
    return buffer;
  }, []);

  const startSource = useCallback(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    const buffer = bufferRef.current;
    if (!ctx || !gain || !buffer) return;

    stopSource();
    applyVolume(volumeRef.current);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start(0);
    startedAtRef.current = ctx.currentTime;
    sourceRef.current = source;
    setCurrentTime(0);
    startClock();
  }, [applyVolume, startClock, stopSource]);

  const stopPlayback = useCallback(() => {
    stopClock();
    stopSource();
    setCurrentTime(0);
    setPlaying(false);
    playingRef.current = false;
  }, [stopClock, stopSource]);

  const startPlayback = useCallback(async () => {
    /* Контекст — синхронно в жесте, иначе iOS не unlock’нет звук. */
    const ctx = ensureContext();
    if (!ctx) return;

    setLoading(true);
    try {
      await loadBuffer();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      startSource();
      setPlaying(true);
      playingRef.current = true;
    } catch {
      stopPlayback();
    } finally {
      setLoading(false);
    }
  }, [ensureContext, loadBuffer, startSource, stopPlayback]);

  const togglePlay = () => {
    if (playing || loading) {
      stopPlayback();
      setLoading(false);
      return;
    }
    void startPlayback();
  };

  const setVolumeFromClientX = useCallback(
    (clientX) => {
      const track = volumeTrackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      const next = clamp01((clientX - rect.left) / rect.width);
      volumeRef.current = next;
      setVolume(next);
      ensureContext();
      applyVolume(next);
    },
    [applyVolume, ensureContext]
  );

  const bindVolume = useDrag(
    ({ xy: [x], first, event }) => {
      if (first) {
        event?.preventDefault?.();
        ensureContext();
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

  /* Подгружаем файл при открытии окна, чтобы play не ждал сеть. */
  useEffect(() => {
    if (!open || prefetchRef.current) return;
    prefetchRef.current = fetch(trackUrl())
      .then((res) => {
        if (!res.ok) throw new Error("track fetch failed");
        return res.arrayBuffer();
      })
      .catch(() => {
        prefetchRef.current = null;
      });
  }, [open]);

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

  useEffect(
    () => () => {
      stopClock();
      stopSource();
      const ctx = ctxRef.current;
      if (ctx) {
        void ctx.close();
        ctxRef.current = null;
        gainRef.current = null;
      }
    },
    [stopClock, stopSource]
  );

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
                          volumeRef.current = next;
                          setVolume(next);
                          ensureContext();
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
                    aria-label={
                      loading ? playLabel : playing ? pauseLabel : playLabel
                    }
                    aria-busy={loading || undefined}
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
