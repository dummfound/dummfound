import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles.module.scss";

const HERO_VIDEO = "/video/IMG_6766.mov";
const HERO_VIDEO_MOBILE = "/video/mobile.MOV";
const BRAND = "DUMMFOUND";
const MOBILE_MQ = "(max-width: 768px)";
const PREORDER_HREF = "https://progressive.enhncd.co/0703";

export const Hero = ({
  introLabel,
  ctaMusic,
  ctaBooking,
  promoLabel,
  promoTitle,
  promoDate,
  promoCta,
}) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_MQ).matches
      : false
  );
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMq = window.matchMedia(MOBILE_MQ);
    const syncMotion = () => setReduceMotion(motionMq.matches);
    const syncMobile = () => setIsMobile(mobileMq.matches);
    syncMotion();
    syncMobile();
    setMediaReady(true);
    motionMq.addEventListener("change", syncMotion);
    mobileMq.addEventListener("change", syncMobile);
    return () => {
      motionMq.removeEventListener("change", syncMotion);
      mobileMq.removeEventListener("change", syncMobile);
    };
  }, []);

  return (
    <section
      id="top"
      className={`${styles.hero}${reduceMotion ? ` ${styles.heroStatic}` : ""}`}
      aria-label={introLabel}
    >
      <div className={styles.heroBg} aria-hidden="true">
        {mediaReady && !reduceMotion ? (
          <video
            key={isMobile ? "mobile" : "desktop"}
            className={`${styles.heroBgVideo} ${
              isMobile ? styles.heroBgVideoMobile : styles.heroBgVideoDesktop
            }`}
            src={isMobile ? HERO_VIDEO_MOBILE : HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : null}
      </div>
      <div className={styles.heroScrim} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>{BRAND}</h1>
          <div className={styles.heroCtas}>
            <Link className={styles.heroCta} to="/music">
              {ctaMusic}
            </Link>
            <Link className={`${styles.heroCta} ${styles.heroCtaGhost}`} to="/booking">
              {ctaBooking}
            </Link>
          </div>

          <aside className={styles.heroPromo} aria-label={promoTitle}>
            <div className={styles.heroPromoMedia} aria-hidden="true">
              <img
                className={styles.heroPromoLogoMark}
                src="/img/enhanced-logo.svg"
                alt=""
                decoding="async"
              />
            </div>
            <div className={styles.heroPromoContent}>
              <img
                className={styles.heroPromoLogo}
                src="/img/enhanced-logo.svg"
                alt={promoLabel}
                decoding="async"
              />
              <p className={styles.heroPromoTitle}>{promoTitle}</p>
              <p className={styles.heroPromoDate}>{promoDate}</p>
              <a
                className={styles.heroPromoCta}
                href={PREORDER_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                {promoCta}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
