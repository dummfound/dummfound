import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Hls from "hls.js";
import { BrandLoader } from "./BrandLoader";
import { lockBodyScroll } from "../hooks/lockBodyScroll";
import styles from "../styles.module.scss";

const RADIO_VIDEOS = ["/video/g1.mp4", "/video/g2.mp4"];
/** Live HLS from The Lot Radio (Livepeer) — https://www.thelotradio.com/ */
const LOT_STREAM_HLS =
  "https://livepeercdn.studio/hls/85c28sa2o8wppm58/index.m3u8";
const RETRY_MS = 5000;
const BUFFER_LOADER_MS = 2500;

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
}) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const audioRef = useRef(null);
  const hlsRef = useRef(null);
  const retryRef = useRef(0);
  const bufferLoaderRef = useRef(0);
  const wantPlayRef = useRef(false);
  const playingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [streamReady, setStreamReady] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  playingRef.current = playing;

  const clearRetry = () => {
    if (retryRef.current) {
      window.clearTimeout(retryRef.current);
      retryRef.current = 0;
    }
  };

  const clearBufferLoader = () => {
    if (bufferLoaderRef.current) {
      window.clearTimeout(bufferLoaderRef.current);
      bufferLoaderRef.current = 0;
    }
  };

  const destroyHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  const scheduleReconnect = () => {
    if (!wantPlayRef.current) {
      setLoading(false);
      setReconnecting(false);
      return;
    }
    clearRetry();
    clearBufferLoader();
    setReconnecting(true);
    setLoading(true);
    setPlaying(false);
    playingRef.current = false;
    retryRef.current = window.setTimeout(() => {
      const audio = audioRef.current;
      if (!audio || !wantPlayRef.current) return;
      attachStream(audio);
      void audio.play().catch(() => {
        /* next retry / user */
      });
    }, RETRY_MS);
  };

  const attachStream = (media) => {
    destroyHls();
    setStreamReady(false);
    setLoading(true);

    if (media.canPlayType("application/vnd.apple.mpegurl")) {
      media.onerror = () => {
        if (wantPlayRef.current) scheduleReconnect();
      };
      media.src = LOT_STREAM_HLS;
      const onReady = () => {
        setStreamReady(true);
        setReconnecting(false);
        setLoading(false);
      };
      media.addEventListener("loadedmetadata", onReady, { once: true });
      media.load();
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 45,
        maxMaxBufferLength: 90,
        manifestLoadingMaxRetry: 8,
        levelLoadingMaxRetry: 8,
        fragLoadingMaxRetry: 8,
      });
      hlsRef.current = hls;
      hls.loadSource(LOT_STREAM_HLS);
      hls.attachMedia(media);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStreamReady(true);
        setReconnecting(false);
        setLoading(false);
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          // Soft recover — no UI reconnect storm
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        destroyHls();
        scheduleReconnect();
      });
      return;
    }

    setStreamReady(false);
    scheduleReconnect();
  };

  const stopPlayback = () => {
    wantPlayRef.current = false;
    clearRetry();
    clearBufferLoader();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.onerror = null;
    }
    setPlaying(false);
    playingRef.current = false;
    setLoading(false);
    setReconnecting(false);
  };

  const startPlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    wantPlayRef.current = true;
    setLoading(true);
    setReconnecting(false);
    try {
      if (!audio.src && !hlsRef.current) {
        attachStream(audio);
      }
      await audio.play();
      setPlaying(true);
      playingRef.current = true;
      setReconnecting(false);
      setLoading(false);
    } catch (err) {
      // Abort/NotAllowed — not a dead stream
      const name = err?.name || "";
      if (name === "AbortError" || name === "NotAllowedError") {
        setLoading(false);
        return;
      }
      scheduleReconnect();
    }
  };

  const togglePlay = () => {
    if (playing || (loading && !reconnecting)) {
      stopPlayback();
      return;
    }
    void startPlayback();
  };

  const openRadio = () => {
    setBgIndex(0);
    setOpen(true);
  };
  const closeRadio = () => {
    stopPlayback();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const audio = audioRef.current;
    if (audio) attachStream(audio);

    return () => {
      wantPlayRef.current = false;
      clearRetry();
      clearBufferLoader();
      stopPlayback();
      destroyHls();
      if (audio) {
        audio.removeAttribute("src");
        audio.load();
      }
      setStreamReady(false);
      setCurrentTime(0);
      setReconnecting(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- attach once per open
  }, [open]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onPlaying = () => {
      clearBufferLoader();
      setPlaying(true);
      playingRef.current = true;
      setLoading(false);
      setReconnecting(false);
    };
    const onPause = () => {
      setPlaying(false);
      playingRef.current = false;
    };
    // Live HLS buffers often — only show loader after a long wait
    const onWaiting = () => {
      clearBufferLoader();
      bufferLoaderRef.current = window.setTimeout(() => {
        if (wantPlayRef.current) setLoading(true);
      }, BUFFER_LOADER_MS);
    };
    const onCanPlay = () => {
      clearBufferLoader();
      setLoading(false);
      setReconnecting(false);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      clearBufferLoader();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") closeRadio();
    };
    document.addEventListener("keydown", onKey);

    const unlockScroll = lockBodyScroll();

    const previouslyFocused = document.activeElement;
    const closeBtn = dialogRef.current?.querySelector(`[data-radio-close]`);
    closeBtn?.focus?.();

    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
      if (
        previouslyFocused instanceof HTMLElement &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  const showLoader =
    open && (reconnecting || (loading && !playing) || (!streamReady && !playing));
  const onAir = playing && streamReady && !reconnecting;

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
                {onAir ? (
                  <p className={styles.radioOnAir}>
                    <span
                      className={styles.radioLiveDot}
                      aria-hidden="true"
                    />
                    ON AIR
                  </p>
                ) : null}
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

                <audio
                  ref={audioRef}
                  className={styles.radioAudio}
                  playsInline
                  preload="none"
                />

                <div className={styles.radioOverlay}>
                  <div className={styles.radioInfo}>
                    <p className={styles.radioTime}>
                      {playing || loading
                        ? formatTime(currentTime)
                        : streamReady
                          ? "RADIO"
                          : "…"}
                    </p>
                  </div>

                  {!showLoader ? (
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
