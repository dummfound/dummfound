import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealText, REVEAL_EASE } from "./RevealText";
import styles from "../styles.module.scss";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const HERO_VIDEO = "/video/IMG_6766.mov";
const HERO_VIDEO_MOBILE = "/video/mobile.MOV";
const BRAND = "DUMMFOUND";
const MOBILE_MQ = "(max-width: 768px)";
const TOUR_POSTER = "/img/brataniya-tour-poster.jpg";
const PROMO_SECONDS = 10;

export const Hero = ({
  introLabel,
  ctaMusic,
  ctaBooking,
  promoTitle,
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
  const [promoSeconds, setPromoSeconds] = useState(PROMO_SECONDS);
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const fadeRef = useRef(null);
  const stampRef = useRef(null);
  const ctasScrollRef = useRef(null);
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
    if (promoClosed || promoClosing || !promoEntered) return undefined;

    setPromoSeconds(PROMO_SECONDS);
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.max(
        0,
        PROMO_SECONDS - Math.floor((Date.now() - started) / 1000)
      );
      setPromoSeconds(left);
      if (left <= 0) {
        window.clearInterval(tick);
        if (reduceMotion) {
          setPromoClosed(true);
        } else {
          setPromoClosing(true);
        }
      }
    }, 250);

    return () => window.clearInterval(tick);
  }, [promoClosed, promoClosing, promoEntered, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !promoClosed) return undefined;

    const section = sectionRef.current;
    if (!section) return undefined;

    const heroMostlyGone = () => {
      const bottom = section.getBoundingClientRect().bottom;
      return bottom < window.innerHeight * 0.4;
    };

    const ctaDelay = 0.1 + BRAND.length * 0.04 + 0.55;
    const ctx = gsap.context(() => {
      gsap.set(bgRef.current, { transformOrigin: "50% 30%", scale: 1 });
      gsap.set(fadeRef.current, { autoAlpha: 0 });
      gsap.set(stampRef.current, { y: 0, scale: 1 });
      gsap.set(ctasScrollRef.current, { autoAlpha: 1, y: 0 });

      if (ctasRef.current) {
        if (heroMostlyGone()) {
          gsap.set(ctasRef.current, { autoAlpha: 1, y: 0 });
        } else {
          gsap.fromTo(
            ctasRef.current,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: REVEAL_EASE,
              delay: ctaDelay,
            }
          );
        }
      }

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 26px",
            end: "+=80%",
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          bgRef.current,
          { scale: 1 },
          { scale: 1.18, ease: "none", duration: 1 },
          0
        )
        .fromTo(
          fadeRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 0.92, ease: "none", duration: 1 },
          0
        )
        .fromTo(
          stampRef.current,
          { scale: 1, y: 0 },
          { scale: 0.985, y: -6, ease: "none", duration: 1 },
          0
        )
        .fromTo(
          ctasScrollRef.current,
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: 10, ease: "none", duration: 0.4 },
          0
        );

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, section);

    return () => ctx.revert();
  }, [reduceMotion, promoClosed]);

  const dismissPromo = () => {
    if (promoClosing || promoClosed) return;
    if (reduceMotion) {
      setPromoClosed(true);
      return;
    }
    setPromoClosing(true);
  };

  const handlePromoTransitionEnd = (event) => {
    if (!promoClosing) return;
    if (event.target !== event.currentTarget) return;
    if (
      event.propertyName !== "opacity" &&
      event.propertyName !== "transform"
    ) {
      return;
    }
    setPromoClosed(true);
    setPromoClosing(false);
  };

  const showPromo = !promoClosed;

  return (
    <section
      id="top"
      ref={sectionRef}
      className={`${styles.hero}${reduceMotion ? ` ${styles.heroStatic}` : ""}${
        showPromo ? ` ${styles.heroPromoActive}` : ""
      }`}
      aria-label={introLabel}
    >
      <div ref={bgRef} className={styles.heroBg} aria-hidden={!showPromo}>
        {showPromo ? (
          <div
            ref={promoRef}
            className={`${styles.heroPromo}${
              promoEntered ? ` ${styles.heroPromoEntered}` : ""
            }${promoClosing ? ` ${styles.heroPromoClosing}` : ""}`}
            role="img"
            aria-label={promoTitle}
            onTransitionEnd={handlePromoTransitionEnd}
          >
            <div className={styles.heroPromoFrame}>
              <span className={styles.heroPromoSeamLeft} aria-hidden="true" />
              <img
                className={styles.heroPromoPoster}
                src={TOUR_POSTER}
                alt=""
                decoding="async"
              />
              <span className={styles.heroPromoSeamRight} aria-hidden="true" />
            </div>
          </div>
        ) : mediaReady && !reduceMotion ? (
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

      {showPromo ? (
        <div className={styles.heroPromoChrome}>
          <span className={styles.heroPromoTimer} aria-hidden="true">
            {promoSeconds}
          </span>
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
        </div>
      ) : null}

      <div className={styles.heroScrim} aria-hidden="true" />
      <div ref={fadeRef} className={styles.heroFade} aria-hidden="true" />

      <div
        className={styles.heroInner}
        aria-hidden={showPromo || undefined}
      >
        <div className={styles.heroCopy}>
            <div ref={stampRef} className={styles.heroStamp}>
              {promoClosed ? (
                <RevealText
                  text={BRAND}
                  as="h1"
                  className={styles.heroTitle}
                  delay={0.1}
                  stagger={0.04}
                  duration={0.9}
                  scrambleDuration={0.6}
                />
              ) : (
                <h1 className={styles.heroTitle}>{BRAND}</h1>
              )}
            </div>

          <nav ref={ctasScrollRef} className={styles.heroCtasScroll}>
            <div
              ref={ctasRef}
              className={styles.heroCtas}
              style={reduceMotion ? undefined : { opacity: 0 }}
            >
              {[
                { to: "/music", label: ctaMusic },
                { to: "/booking", label: ctaBooking },
              ].map(({ to, label }) => (
                <Link key={to} className={styles.heroCtaBtn} to={to}>
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
};
