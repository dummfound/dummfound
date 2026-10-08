import { useRadio } from "../hooks/RadioContext";
import styles from "../styles.module.scss";

export const RadioTrigger = ({ playLabel, pauseLabel }) => {
  const { playing, loading, togglePlay } = useRadio();
  const live = playing || loading;

  return (
    <button
      type="button"
      className={`${styles.radioTrigger}${
        live ? ` ${styles.radioTriggerLive}` : ""
      }`}
      onClick={togglePlay}
      aria-label={playing ? pauseLabel : playLabel}
      aria-pressed={playing}
      aria-busy={loading || undefined}
      title="Enjoy the music"
    >
      {playing ? (
        <svg
          className={styles.radioTriggerIcon}
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <rect x="3.25" y="2.75" width="3.25" height="10.5" fill="currentColor" />
          <rect x="9.5" y="2.75" width="3.25" height="10.5" fill="currentColor" />
        </svg>
      ) : (
        <svg
          className={`${styles.radioTriggerIcon} ${styles.radioTriggerIconPlay}`}
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M4 2.2 L13.2 8 L4 13.8 Z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
};

/** @deprecated use RadioTrigger */
export const Radio = ({ playLabel, pauseLabel }) => (
  <RadioTrigger playLabel={playLabel} pauseLabel={pauseLabel} />
);
