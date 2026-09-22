import { useMemo } from "react";
import styles from "../styles.module.scss";

/**
 * PK-style hover: each glyph slides up via translate,
 * the duplicate comes from text-shadow below (osmo / PK button).
 */
export const HoverSlideText = ({
  text,
  className = "",
  as: Tag = "span",
  ...rest
}) => {
  const chars = useMemo(() => Array.from(text ?? ""), [text]);

  return (
    <Tag
      className={`${styles.hoverSlide} ${className}`.trim()}
      data-hover-slide=""
      aria-label={text}
      {...rest}
    >
      <span className={styles.hoverSlideTrack} aria-hidden="true">
        {chars.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={styles.hoverSlideChar}
            style={{ "--char": index + 1 }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </Tag>
  );
};
