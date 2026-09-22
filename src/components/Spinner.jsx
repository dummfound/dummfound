import styles from "../styles.module.scss";

/**
 * Circular staggered spinner (21st.dev / Efferd Spinner-1 style).
 * Dynamic size via `size` prop (px).
 */
export const Spinner = ({ size = 28, className = "", bars = 12 }) => {
  const items = Array.from({ length: bars }, (_, i) => i);

  return (
    <div
      className={`${styles.spinner} ${className}`.trim()}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      {items.map((i) => (
        <span
          key={i}
          className={styles.spinnerBar}
          style={{
            transform: `rotate(${(360 / bars) * i}deg)`,
            animationDelay: `${(-(bars - 1 - i) * (0.8 / bars)).toFixed(3)}s`,
          }}
        />
      ))}
    </div>
  );
};
