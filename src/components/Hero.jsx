import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrandLoader } from "./BrandLoader";
import { HoverSlideText } from "./HoverSlideText";
import { RevealText, REVEAL_EASE } from "./RevealText";
import styles from "../styles.module.scss";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const HERO_VIDEO = "/video/IMG_6766.mov";
const HERO_VIDEO_MOBILE = "/video/mobile.MOV";
const BRAND = "DUMMFOUND";
const MOBILE_MQ = "(max-width: 768px)";
const VIDEO_LOAD_TIMEOUT_MS = 8000;

export const Hero = ({ ctaMusic, ctaBooking }) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_MQ).matches
      : false
  );
  const [videoReady, setVideoReady] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const fadeRef = useRef(null);
  const stampRef = useRef(null);
  const ctasScrollRef = useRef(null);
  const ctasRef = useRef(null);
  const videoRef = useRef(null);

  const videoSrc = isMobile ? HERO_VIDEO_MOBILE : HERO_VIDEO;
  const heroMediaReady = reduceMotion || videoReady || loadTimedOut;
  const showLoader = !heroMediaReady;
  const showHeroCopy = heroMediaReady;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const measureLvh = () => {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;left:0;top:0;width:0;height:100vh;height:100dvh;height:100lvh;visibility:hidden;pointer-events:none";
      document.documentElement.appendChild(probe);
      const h = probe.offsetHeight || 0;
      probe.remove();
      return h;
    };

    // Lock to the tallest seen height so Safari chrome hide/show never
    // shrinks the hero and lets About peek into the first viewport.
    let locked = 0;

    const lockHeight = ({ reset = false } = {}) => {
      if (reset) locked = 0;
      const lvh = measureLvh();
      const vv = window.visualViewport?.height ?? 0;
      const inner = window.innerHeight || 0;
      const client = document.documentElement.clientHeight || 0;
      const h = Math.round(Math.max(locked, lvh, vv, inner, client));
      if (h > 0) {
        locked = h;
        section.style.height = `${h}px`;
        section.style.minHeight = `${h}px`;
        document.documentElement.style.setProperty("--app-vh", `${h}px`);
      }
    };

    const onOrientation = () => {
      window.setTimeout(() => lockHeight({ reset: true }), 250);
    };

    lockHeight();
    window.addEventListener("resize", lockHeight);
    window.addEventListener("orientationchange", onOrientation);
    window.visualViewport?.addEventListener("resize", lockHeight);
    return () => {
      window.removeEventListener("resize", lockHeight);
      window.removeEventListener("orientationchange", onOrientation);
      window.visualViewport?.removeEventListener("resize", lockHeight);
      section.style.height = "";
      section.style.minHeight = "";
    };
  }, []);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMq = window.matchMedia(MOBILE_MQ);
    const syncMotion = () => setReduceMotion(motionMq.matches);
    const syncMobile = () => setIsMobile(mobileMq.matches);
    syncMotion();
    syncMobile();
    motionMq.addEventListener("change", syncMotion);
    mobileMq.addEventListener("change", syncMobile);
    return () => {
      motionMq.removeEventListener("change", syncMotion);
      mobileMq.removeEventListener("change", syncMobile);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setVideoReady(true);
      return undefined;
    }

    setVideoReady(false);
    setLoadTimedOut(false);

    const preload = document.createElement("video");
    preload.muted = true;
    preload.playsInline = true;
    preload.preload = "auto";
    preload.src = videoSrc;

    let settled = false;
    const markReady = () => {
      if (settled) return;
      settled = true;
      setVideoReady(true);
    };

    preload.addEventListener("canplaythrough", markReady);
    preload.addEventListener("loadeddata", markReady);
    preload.load();

    const timeoutId = window.setTimeout(() => {
      setLoadTimedOut(true);
    }, VIDEO_LOAD_TIMEOUT_MS);

    return () => {
      settled = true;
      window.clearTimeout(timeoutId);
      preload.removeEventListener("canplaythrough", markReady);
      preload.removeEventListener("loadeddata", markReady);
      preload.removeAttribute("src");
      preload.load();
    };
  }, [videoSrc, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !showHeroCopy) return undefined;

    const section = sectionRef.current;
    if (!section) return undefined;

    const heroMostlyGone = () => {
      const bottom = section.getBoundingClientRect().bottom;
      return bottom < window.innerHeight * 0.4;
    };

    const ctaDelay = 0.35 + BRAND.length * 0.04 + 0.4;
    const ctx = gsap.context(() => {
      gsap.set(bgRef.current, { transformOrigin: "50% 30%", scale: 1.12 });
      gsap.set(fadeRef.current, { autoAlpha: 0 });
      gsap.set(stampRef.current, { y: 28, autoAlpha: 0 });
      gsap.set(ctasScrollRef.current, { autoAlpha: 1, y: 0 });

      const intro = gsap.timeline({ defaults: { ease: REVEAL_EASE } });
      intro.to(
        bgRef.current,
        { scale: 1, duration: 1.35 },
        0
      );
      intro.to(
        stampRef.current,
        { y: 0, autoAlpha: 1, duration: 0.9 },
        0.25
      );

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
          { scale: 1.12, ease: "none", duration: 1 },
          0
        )
        .fromTo(
          fadeRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 0.55, ease: "none", duration: 1 },
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
  }, [reduceMotion, showHeroCopy]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showHeroCopy) return undefined;
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {});
    }
    return undefined;
  }, [showHeroCopy, videoSrc]);

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      className={`${styles.hero}${reduceMotion ? ` ${styles.heroStatic}` : ""}${
        showLoader ? ` ${styles.heroLoading}` : ""
      }`}
      aria-label={BRAND}
      aria-busy={showLoader || undefined}
    >
      <div ref={bgRef} className={styles.heroBg}>
        {!reduceMotion ? (
          <video
            key={videoSrc}
            ref={videoRef}
            className={`${styles.heroBgVideo} ${
              isMobile ? styles.heroBgVideoMobile : styles.heroBgVideoDesktop
            }${heroMediaReady ? ` ${styles.heroBgVideoReady}` : ""}`}
            src={videoSrc}
            muted
            loop
            playsInline
            preload="auto"
            onCanPlayThrough={handleVideoReady}
            onLoadedData={handleVideoReady}
            onPlaying={handleVideoReady}
          />
        ) : null}
      </div>

      {showLoader ? (
        <div className={styles.heroLoader}>
          <BrandLoader />
        </div>
      ) : null}

      <div className={styles.heroScrim} aria-hidden="true" />
      <div ref={fadeRef} className={styles.heroFade} aria-hidden="true" />

      <div
        className={styles.heroInner}
        aria-hidden={showLoader || undefined}
      >
        {showHeroCopy ? (
          <div className={styles.heroCopy}>
            <div ref={stampRef} className={styles.heroStamp}>
              <RevealText
                text={BRAND}
                as="h1"
                className={styles.heroTitle}
                delay={0.1}
                stagger={0.04}
                duration={0.9}
                scrambleDuration={0.6}
              />
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
                    <HoverSlideText text={label} />
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        ) : null}
      </div>
    </section>
  );
};
