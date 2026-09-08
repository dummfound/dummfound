import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { RevealText, REVEAL_EASE } from "./RevealText";
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
  promoClose,
}) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_MQ).matches
      : false
  );
  const [mediaReady, setMediaReady] = useState(false);
  const [promoClosed, setPromoClosed] = useState(false);
  const [promoEntered, setPromoEntered] = useState(false);
  const [promoClosing, setPromoClosing] = useState(false);
  const ctasRef = useRef(null);
  const promoRef = useRef(null);

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

  useEffect(() => {
    if (promoClosed) return undefined;
    if (reduceMotion) {
      setPromoEntered(true);
      return undefined;
    }

    setPromoEntered(false);
    let cancelled = false;
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) setPromoEntered(true);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(id);
    };
  }, [promoClosed, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return undefined;

    const ctaDelay = 0.1 + BRAND.length * 0.04 + 0.55;
    const ctx = gsap.context(() => {
      if (ctasRef.current) {
        gsap.fromTo(
          ctasRef.current,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: REVEAL_EASE,
            delay: ctaDelay,
          }
        );
      }
    });

    return () => ctx.revert();
  }, [reduceMotion]);

  const dismissPromo = () => {
    if (promoClosing || promoClosed) return;
    if (reduceMotion) {
      setPromoClosed(true);
      return;
    }
    // Сброс инлайн-opacity, чтобы CSS-fade шёл на месте
    if (promoRef.current) {
      gsap.set(promoRef.current, { clearProps: "opacity" });
    }
    setPromoClosing(true);
  };

  const handlePromoTransitionEnd = (event) => {
    if (!promoClosing) return;
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "opacity") return;
    setPromoClosed(true);
    setPromoClosing(false);
  };

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
          <RevealText
            text={BRAND}
            as="h1"
            className={styles.heroTitle}
            delay={0.1}
            stagger={0.04}
            duration={0.9}
            scrambleDuration={0.6}
          />

          <div
            ref={ctasRef}
            className={styles.heroCtas}
            style={reduceMotion ? undefined : { opacity: 0 }}
          >
            <Link className={styles.heroCta} to="/music">
              {ctaMusic}
            </Link>
            <Link
              className={`${styles.heroCta} ${styles.heroCtaGhost}`}
              to="/booking"
            >
              {ctaBooking}
            </Link>
          </div>

          {!promoClosed ? (
            <aside
              ref={promoRef}
              className={`${styles.heroPromo}${
                promoEntered ? ` ${styles.heroPromoEntered}` : ""
              }${promoClosing ? ` ${styles.heroPromoClosing}` : ""}`}
              aria-label={promoTitle}
              onTransitionEnd={handlePromoTransitionEnd}
            >
              <div className={styles.heroPromoMedia} aria-hidden="true">
                <img
                  className={styles.heroPromoLogoMark}
                  src="/img/enhanced-logo.svg"
                  alt=""
                  decoding="async"
                />
              </div>
              <button
                type="button"
                className={styles.heroPromoClose}
                aria-label={promoClose}
                onClick={dismissPromo}
              >
                <svg
                  className={styles.heroPromoCloseIcon}
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M4 4l8 8M12 4L4 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
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
          ) : null}
        </div>
      </div>
    </section>
  );
};
