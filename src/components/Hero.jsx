import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrandLoader } from "./BrandLoader";
import { HeroIndustrial } from "./HeroIndustrial";
import { HoverSlideText } from "./HoverSlideText";
import { RevealText, REVEAL_EASE } from "./RevealText";
import styles from "../styles.module.scss";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const HERO_IMAGE = "/img/mainhero2.jpg";
const BRAND = "DUMMFOUND";
const IMAGE_LOAD_TIMEOUT_MS = 8000;
const DESKTOP_MQ = "(min-width: 769px)";

export const Hero = ({ ctaMusic, ctaBooking }) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(DESKTOP_MQ).matches
      : true
  );
  const [imageReady, setImageReady] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const fadeRef = useRef(null);
  const stampRef = useRef(null);
  const ctasScrollRef = useRef(null);
  const ctasRef = useRef(null);

  const heroMediaReady = reduceMotion || imageReady || loadTimedOut;
  const showLoader = !heroMediaReady;
  const showHeroCopy = heroMediaReady;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const isAppleTouch =
      /iP(hone|od|ad)/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const measureLvh = () => {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;left:0;top:0;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none";
      document.documentElement.appendChild(probe);
      const h = probe.getBoundingClientRect().height || probe.offsetHeight || 0;
      probe.remove();
      return h;
    };

    let locked = 0;

    const lockHeight = ({ reset = false } = {}) => {
      if (reset) locked = 0;
      const lvh = measureLvh();
      const vv = window.visualViewport?.height ?? 0;
      const inner = window.innerHeight || 0;
      const client = document.documentElement.clientHeight || 0;
      const screenH = isAppleTouch ? window.screen?.height ?? 0 : 0;
      const buffer = isAppleTouch ? 64 : 0;
      const base = Math.round(
        Math.max(locked, lvh, vv, inner, client, screenH)
      );
      if (base <= 0) return;
      locked = base;
      const h = base + buffer;
      document.documentElement.style.setProperty("--app-vh", `${h}px`);
      section.style.setProperty("height", `${h}px`);
      section.style.setProperty("min-height", `${h}px`);
    };

    const onOrientation = () => {
      window.setTimeout(() => lockHeight({ reset: true }), 250);
    };

    lockHeight();
    window.addEventListener("resize", lockHeight);
    window.addEventListener("orientationchange", onOrientation);
    window.visualViewport?.addEventListener("resize", lockHeight);
    const onVisible = () => {
      if (document.visibilityState === "visible") lockHeight();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("resize", lockHeight);
      window.removeEventListener("orientationchange", onOrientation);
      window.visualViewport?.removeEventListener("resize", lockHeight);
      document.removeEventListener("visibilitychange", onVisible);
      section.style.removeProperty("height");
      section.style.removeProperty("min-height");
    };
  }, []);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopMq = window.matchMedia(DESKTOP_MQ);
    const syncMotion = () => setReduceMotion(motionMq.matches);
    const syncDesktop = () => setIsDesktop(desktopMq.matches);
    syncMotion();
    syncDesktop();
    motionMq.addEventListener("change", syncMotion);
    desktopMq.addEventListener("change", syncDesktop);
    return () => {
      motionMq.removeEventListener("change", syncMotion);
      desktopMq.removeEventListener("change", syncDesktop);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setImageReady(true);
      return undefined;
    }

    setImageReady(false);
    setLoadTimedOut(false);

    const preload = new Image();
    let settled = false;
    const markReady = () => {
      if (settled) return;
      settled = true;
      setImageReady(true);
    };

    preload.addEventListener("load", markReady);
    preload.addEventListener("error", markReady);
    preload.src = HERO_IMAGE;
    if (preload.complete) markReady();

    const timeoutId = window.setTimeout(() => {
      setLoadTimedOut(true);
    }, IMAGE_LOAD_TIMEOUT_MS);

    return () => {
      settled = true;
      window.clearTimeout(timeoutId);
      preload.removeEventListener("load", markReady);
      preload.removeEventListener("error", markReady);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !showHeroCopy) return undefined;

    const section = sectionRef.current;
    if (!section) return undefined;

    const heroMostlyGone = () => {
      const bottom = section.getBoundingClientRect().bottom;
      return bottom < window.innerHeight * 0.4;
    };

    const ctaDelay = 0.35 + BRAND.length * 0.04 + 0.4;
    const bgScale = isDesktop ? 1.025 : 1.05;

    const ctx = gsap.context(() => {
      gsap.set(bgRef.current, { transformOrigin: "70% 40%", scale: bgScale });
      gsap.set(fadeRef.current, { autoAlpha: 0 });
      gsap.set(stampRef.current, { y: 28, autoAlpha: 0 });
      gsap.set(ctasScrollRef.current, { autoAlpha: 1, y: 0 });

      const introTl = gsap.timeline({ defaults: { ease: REVEAL_EASE } });
      introTl.to(bgRef.current, { scale: 1, duration: 1.4 }, 0);
      introTl.to(
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
          { scale: bgScale, ease: "none", duration: 1 },
          0
        )
        .fromTo(
          fadeRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 0.35, ease: "none", duration: 1 },
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
  }, [reduceMotion, showHeroCopy, isDesktop]);

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
      <div
        ref={bgRef}
        className={`${styles.heroBg}${
          heroMediaReady ? ` ${styles.heroBgReady}` : ""
        }`}
        aria-hidden="true"
      >
        {/* Black field + multiply grain. Photo sits above — no grain on it. */}
        <div className={styles.heroBgField} aria-hidden="true">
          <svg className={styles.heroBgFieldFilter} aria-hidden="true">
            <filter
              id="df-hero-grain"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="1.6"
                numOctaves="2"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="0 0 0 0 0.5
                        0 0 0 0 0.5
                        0 0 0 0 0.5
                        0 0 0 0.4 0"
                result="grain"
              />
              <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
            </filter>
          </svg>
          <HeroIndustrial
            active={heroMediaReady && !reduceMotion && isDesktop}
            sectionRef={sectionRef}
            titleRef={stampRef}
          />
        </div>
        <img
          className={styles.heroPhoto}
          src={HERO_IMAGE}
          alt=""
          decoding="async"
          fetchPriority="high"
          onLoad={() => setImageReady(true)}
        />
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
                  <Link
                    key={to}
                    className={styles.heroCtaBtn}
                    to={to}
                    data-cursor=""
                  >
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
