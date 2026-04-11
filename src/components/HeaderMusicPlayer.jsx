import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles.module.scss";

function normalizeTracks(data) {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      if (typeof item === "string") return { file: item.trim() };
      const file = item?.file || item?.src;
      if (typeof file !== "string" || !file.trim()) return null;
      return { file: file.trim() };
    })
    .filter(Boolean);
}

const audioBase = () => import.meta.env.BASE_URL.replace(/\/?$/, "/");

export const HeaderMusicPlayer = ({
  playLabel,
  pauseLabel,
  groupLabel,
  emptyLabel,
}) => {
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${audioBase()}music/tracks.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setTracks(normalizeTracks(data));
      })
      .catch(() => {
        if (!cancelled) setTracks([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trackCount = tracks?.length ?? 0;
  const hasTracks = trackCount > 0;

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !hasTracks) return;
    const file = tracks[index]?.file;
    if (!file) return;
    a.src = `${audioBase()}music/${encodeURIComponent(file)}`;
  }, [tracks, index, hasTracks]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !hasTracks) return;
    if (playing) {
      const p = a.play();
      if (p !== undefined) p.catch(() => setPlaying(false));
    } else {
      a.pause();
    }
  }, [playing, hasTracks, index]);

  const handleEnded = useCallback(() => {
    if (trackCount < 1) return;
    setIndex((i) => (i + 1) % trackCount);
    setPlaying(true);
  }, [trackCount]);

  const toggle = () => {
    if (!hasTracks) return;
    setPlaying((p) => !p);
  };

  const loaded = tracks !== null;
  const disabled = !loaded || !hasTracks;

  return (
    <div className={styles.headerMusic} role="group" aria-label={groupLabel}>
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        preload="none"
      />
      <button
        type="button"
        className={styles.headerMusicBtn}
        disabled={disabled}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={disabled ? emptyLabel : playing ? pauseLabel : playLabel}
        title={disabled && loaded ? emptyLabel : undefined}
      >
        {playing ? (
          <svg
            className={styles.headerMusicIcon}
            viewBox="0 0 12 14"
            aria-hidden="true"
          >
            <rect x="0" y="0" width="4" height="14" rx="0.5" fill="currentColor" />
            <rect x="8" y="0" width="4" height="14" rx="0.5" fill="currentColor" />
          </svg>
        ) : (
          <svg
            className={styles.headerMusicIcon}
            viewBox="0 0 12 14"
            aria-hidden="true"
          >
            <path d="M0 0 L12 7 L0 14 Z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
};
