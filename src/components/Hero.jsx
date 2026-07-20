import { useEffect, useRef } from "react";
import styles from "../styles.module.scss";

const HERO_VIDEO = "/video/IMG_6766.mov";

export const Hero = ({ introLabel }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (mq.matches) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section id="top" className={styles.hero} aria-label={introLabel}>
      <div className={styles.heroBg} aria-hidden="true">
        <video
          ref={videoRef}
          className={styles.heroBgVideo}
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
      <div className={styles.heroScrim} aria-hidden="true" />
    </section>
  );
};
