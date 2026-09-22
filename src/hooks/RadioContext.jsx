import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Hls from "hls.js";

/** Live HLS from The Lot Radio (Livepeer) — https://www.thelotradio.com/ */
const LOT_STREAM_HLS =
  "https://playback.livepeer.studio/hls/85c28sa2o8wppm58/index.m3u8";
const RETRY_MS = 5000;
const BUFFER_LOADER_MS = 2500;

const RadioContext = createContext(null);

export const useRadio = () => {
  const ctx = useContext(RadioContext);
  if (!ctx) {
    throw new Error("useRadio must be used within RadioProvider");
  }
  return ctx;
};

export const RadioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const hlsRef = useRef(null);
  const retryRef = useRef(0);
  const bufferLoaderRef = useRef(0);
  const wantPlayRef = useRef(false);
  const playingRef = useRef(false);
  const attachStreamRef = useRef(() => {});

  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [streamReady, setStreamReady] = useState(false);

  playingRef.current = playing;

  const clearRetry = useCallback(() => {
    if (retryRef.current) {
      window.clearTimeout(retryRef.current);
      retryRef.current = 0;
    }
  }, []);

  const clearBufferLoader = useCallback(() => {
    if (bufferLoaderRef.current) {
      window.clearTimeout(bufferLoaderRef.current);
      bufferLoaderRef.current = 0;
    }
  }, []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
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
      attachStreamRef.current(audio);
      void audio.play().catch(() => {
        /* next retry / user */
      });
    }, RETRY_MS);
  }, [clearBufferLoader, clearRetry]);

  const attachStream = useCallback(
    (media) => {
      destroyHls();
      setStreamReady(false);
      setLoading(true);

      const tryPlayIfWanted = () => {
        setStreamReady(true);
        setReconnecting(false);
        if (!wantPlayRef.current) {
          setLoading(false);
          return;
        }
        void media
          .play()
          .then(() => {
            setPlaying(true);
            playingRef.current = true;
            setLoading(false);
            setReconnecting(false);
          })
          .catch((err) => {
            const name = err?.name || "";
            if (name === "AbortError" || name === "NotAllowedError") {
              setLoading(false);
              return;
            }
            scheduleReconnect();
          });
      };

      if (media.canPlayType("application/vnd.apple.mpegurl")) {
        media.onerror = () => {
          if (wantPlayRef.current) scheduleReconnect();
        };
        media.src = LOT_STREAM_HLS;
        media.addEventListener("loadedmetadata", tryPlayIfWanted, {
          once: true,
        });
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
        hls.on(Hls.Events.MANIFEST_PARSED, tryPlayIfWanted);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
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
    },
    [destroyHls, scheduleReconnect]
  );

  attachStreamRef.current = attachStream;

  const stopPlayback = useCallback(() => {
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
  }, [clearBufferLoader, clearRetry]);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    wantPlayRef.current = true;
    setLoading(true);
    setReconnecting(false);

    // Already attaching — MANIFEST_PARSED / loadedmetadata will call play
    if (!streamReady && hlsRef.current) {
      return;
    }

    // Fresh attach
    if (!streamReady && !audio.src && !hlsRef.current) {
      attachStream(audio);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
      playingRef.current = true;
      setReconnecting(false);
      setLoading(false);
    } catch (err) {
      const name = err?.name || "";
      if (name === "AbortError" || name === "NotAllowedError") {
        setLoading(false);
        return;
      }
      attachStream(audio);
    }
  }, [attachStream, streamReady]);

  const togglePlay = useCallback(() => {
    if (playing || (loading && wantPlayRef.current && !reconnecting)) {
      stopPlayback();
      return;
    }
    void startPlayback();
  }, [loading, playing, reconnecting, startPlayback, stopPlayback]);

  const openRadio = useCallback(() => {
    setOpen(true);
    const audio = audioRef.current;
    // Warm stream so play starts faster (does not autoplay)
    if (audio && !audio.src && !hlsRef.current) {
      attachStream(audio);
    }
  }, [attachStream]);

  const minimizeRadio = useCallback(() => setOpen(false), []);

  const closeRadio = useCallback(() => {
    stopPlayback();
    setOpen(false);
    destroyHls();
    const audio = audioRef.current;
    if (audio) {
      audio.removeAttribute("src");
      audio.load();
    }
    setStreamReady(false);
    setCurrentTime(0);
  }, [destroyHls, stopPlayback]);

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
      clearRetry();
      destroyHls();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [clearBufferLoader, clearRetry, destroyHls]);

  const active = playing || loading || reconnecting;

  const value = useMemo(
    () => ({
      open,
      playing,
      loading,
      reconnecting,
      currentTime,
      streamReady,
      active,
      openRadio,
      minimizeRadio,
      closeRadio,
      togglePlay,
      startPlayback,
      stopPlayback,
    }),
    [
      active,
      closeRadio,
      currentTime,
      loading,
      minimizeRadio,
      open,
      openRadio,
      playing,
      reconnecting,
      startPlayback,
      stopPlayback,
      streamReady,
      togglePlay,
    ]
  );

  const audioNode =
    typeof document !== "undefined"
      ? createPortal(
          <audio
            ref={audioRef}
            playsInline
            preload="none"
            style={{
              position: "fixed",
              width: 0,
              height: 0,
              opacity: 0,
              pointerEvents: "none",
            }}
          />,
          document.body
        )
      : null;

  return (
    <RadioContext.Provider value={value}>
      {children}
      {audioNode}
    </RadioContext.Provider>
  );
};
