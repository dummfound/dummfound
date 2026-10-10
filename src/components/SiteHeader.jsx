import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { HoverSlideText } from "./HoverSlideText";
import { OsAppIcon } from "./OsAppIcon";
import { RadioTrigger } from "./Radio";
import { scrollTo } from "../hooks/useLenis";
import styles from "../styles.module.scss";

gsap.registerPlugin(CustomEase);
CustomEase.create("pk", "0.625, 0.05, 0, 1");

const scrollToTop = () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  scrollTo(0, { immediate: reduced });
};

const TG_APP_HREF = "https://t.me/dummfoundOSbot/app";
const MOBILE_MQ = "(max-width: 768px)";
const SCROLL_SOLID_AT = 24;
/** Expand when at/near top; compact only after scrolling past this (hysteresis). */
const COMPACT_OFF_AT = 20;
const COMPACT_ON_AT = 56;
const DIR_DELTA = 8;
const MENU_CLOSE_MS = 480;
const COMPACT_DURATION = 0.4;

const readScrollY = () => {
  if (typeof window === "undefined") return 0;
  const y =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;
  // iOS rubber-band can report tiny negatives
  return Math.max(0, y);
};

const readChromeMetrics = () => {
  const root = getComputedStyle(document.documentElement);
  const desktop = window.matchMedia("(min-width: 769px)").matches;
  return {
    desktop,
    fullH: root.getPropertyValue("--chrome-h").trim() || "3.35rem",
    compactH: root.getPropertyValue("--chrome-h-compact").trim() || "2.15rem",
    ctrl: root.getPropertyValue("--chrome-ctrl").trim() || "2.35rem",
    ctrlCompact:
      root.getPropertyValue("--chrome-ctrl-compact").trim() || "1.4rem",
    inset: root.getPropertyValue("--chrome-inset").trim() || "1.25rem",
  };
};

export const SiteHeader = ({
  logoAria,
  navAria,
  langGroup,
  menuLabel,
  drawerBackdropLabel,
  navLinks,
  tgAppLabel,
  lang,
  onSetLang,
  radioPlay,
  radioPause,
  menuOpen,
  onCloseMenu,
  onToggleMenu,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const headerRef = useRef(null);
  const barRef = useRef(null);
  const badgeRef = useRef(null);
  const langRef = useRef(null);
  const panelRef = useRef(null);
  const menuBtnRef = useRef(null);
  const linksRef = useRef(null);
  const tlRef = useRef(null);
  const openRef = useRef(false);
  const lastScrollY = useRef(0);
  const compactTweenRef = useRef(null);
  const compactSkipAnimRef = useRef(true);
  const [scrolled, setScrolled] = useState(() => location.pathname !== "/");
  const [compact, setCompact] = useState(() => location.pathname !== "/");
  const compactVisual = compact && !menuOpen;

  const handleLogoClick = () => {
    onCloseMenu();
    if (isHome) scrollToTop();
  };

  const handleNavClick = (event, href) => {
    event.preventDefault();
    if (menuOpen) {
      sessionStorage.setItem("df-nav-delay", String(MENU_CLOSE_MS));
      onCloseMenu();
      window.setTimeout(() => {
        navigate(href);
      }, MENU_CLOSE_MS);
      return;
    }
    navigate(href);
  };

  useEffect(() => {
    lastScrollY.current = readScrollY();

    const onSectionRoute = location.pathname !== "/";
    // Section routes land below the fold → compact bar from the start so
    // scroll offset matches the shrunk height (no gray gap under chrome).
    if (onSectionRoute) {
      setCompact(true);
      setScrolled(true);
    }

    let raf = 0;
    const sync = () => {
      const y = readScrollY();
      const prev = lastScrollY.current;
      setScrolled(y > SCROLL_SOLID_AT || onSectionRoute);

      // Always full chrome at the top on home (iOS momentum often skips
      // intermediate scroll events — force expand by position).
      if (y <= COMPACT_OFF_AT) {
        setCompact(onSectionRoute);
      } else if (y >= COMPACT_ON_AT && y > prev + DIR_DELTA) {
        setCompact(true);
      } else if (y < prev - DIR_DELTA) {
        setCompact(false);
      }

      lastScrollY.current = y;
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };

    // iOS: final position after inertia / URL-bar chrome show-hide
    const onSettle = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      sync();
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchend", onSettle, { passive: true });
    window.addEventListener("scrollend", onSettle, { passive: true });
    window.visualViewport?.addEventListener("resize", onSettle);
    window.visualViewport?.addEventListener("scroll", onSettle);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchend", onSettle);
      window.removeEventListener("scrollend", onSettle);
      window.visualViewport?.removeEventListener("resize", onSettle);
      window.visualViewport?.removeEventListener("scroll", onSettle);
    };
  }, [location.pathname]);

  useEffect(() => {
    const header = headerRef.current;
    const bar = barRef.current;
    const badge = badgeRef.current;
    const lang = langRef.current;
    const menuBtn = menuBtnRef.current;
    if (!header || !bar || !badge || !lang || !menuBtn) return undefined;

    const radio = bar.querySelector(`.${styles.radioTrigger}`);
    const trail = bar.querySelector(`.${styles.chromeTrail}`);
    const { desktop, fullH, compactH, ctrl, ctrlCompact, inset } =
      readChromeMetrics();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const immediate = compactSkipAnimRef.current || reduced;
    compactSkipAnimRef.current = false;

    const full = {
      bar: {
        height: fullH,
        minHeight: fullH,
        fontSize: "clamp(0.95rem, 1.35vw, 1.15rem)",
      },
      badge: {
        width: ctrl,
        height: ctrl,
        fontSize: "0.72em",
        borderWidth: "1.5px",
      },
      ctrl: { height: ctrl },
      radio: { width: ctrl, height: ctrl },
      trail: { height: ctrl },
      header: desktop
        ? { paddingTop: inset, paddingBottom: inset }
        : { paddingTop: 0, paddingBottom: 0 },
    };

    const shrunk = {
      bar: {
        height: compactH,
        minHeight: compactH,
        fontSize: "clamp(0.72rem, 1vw, 0.82rem)",
      },
      badge: {
        width: ctrlCompact,
        height: ctrlCompact,
        fontSize: "0.72em",
        borderWidth: "1px",
      },
      ctrl: { height: ctrlCompact },
      radio: { width: ctrlCompact, height: ctrlCompact },
      trail: { height: ctrlCompact },
      header: desktop
        ? { paddingTop: "0.25rem", paddingBottom: "0.25rem" }
        : { paddingTop: 0, paddingBottom: 0 },
    };

    const to = compactVisual ? shrunk : full;
    const duration = immediate ? 0 : COMPACT_DURATION;

    compactTweenRef.current?.kill();
    const tl = gsap.timeline({
      defaults: { duration, ease: "pk", overwrite: "auto" },
    });
    tl.to(bar, { ...to.bar }, 0);
    tl.to(badge, { ...to.badge }, 0);
    tl.to([lang, menuBtn], { ...to.ctrl }, 0);
    if (trail) tl.to(trail, { ...to.trail }, 0);
    if (radio) tl.to(radio, { ...to.radio }, 0);
    if (desktop) tl.to(header, { ...to.header }, 0);
    compactTweenRef.current = tl;

    return () => {
      tl.kill();
      if (compactTweenRef.current === tl) compactTweenRef.current = null;
    };
  }, [compactVisual]);

  useEffect(() => {
    document.documentElement.classList.toggle("nav-open", menuOpen);
    document.body.setAttribute("data-menu-status", menuOpen ? "open" : "");
  }, [menuOpen]);

  useEffect(() => {
    const panel = panelRef.current;
    const linksRoot = linksRef.current;
    if (!panel || !linksRoot) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const labels = linksRoot.querySelectorAll("[data-menu-label]");
    const lines = linksRoot.querySelectorAll("[data-menu-line]");
    const mm = gsap.matchMedia();

    mm.add(MOBILE_MQ, () => {
      const origin = "calc(100% - 1.55rem) 1.45rem";
      gsap.set(panel, {
        display: "flex",
        autoAlpha: 1,
        clipPath: `circle(0% at ${origin})`,
        visibility: "hidden",
        pointerEvents: "none",
      });
      gsap.set(labels, { yPercent: 110, x: 0, rotate: 0 });
      gsap.set(lines, { scaleX: 0, transformOrigin: "0% 50%" });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
        onComplete: () => {
          gsap.set(labels, { yPercent: 0, x: 0, rotate: 0 });
          gsap.set(lines, { scaleX: 1 });
        },
      });
      tl.set(panel, { visibility: "visible", pointerEvents: "auto" }, 0);
      tl.to(panel, { clipPath: `circle(150% at ${origin})`, duration: 0.5 }, 0);
      tl.fromTo(
        labels,
        { yPercent: 110 },
        { yPercent: 0, stagger: 0.035, duration: 0.42 },
        0.06
      );
      tl.fromTo(
        lines,
        { scaleX: 0 },
        { scaleX: 1, stagger: 0.035, duration: 0.3 },
        0.14
      );

      tlRef.current = { tl, mode: "circle", reduced };
      return () => {
        tl.kill();
        gsap.set([panel, labels, lines], { clearProps: "all" });
        if (tlRef.current?.mode === "circle") tlRef.current = null;
      };
    });

    mm.add("(min-width: 769px)", () => {
      gsap.set(panel, {
        clearProps: "clipPath",
        xPercent: -105,
        autoAlpha: 1,
        visibility: "hidden",
        pointerEvents: "none",
      });
      gsap.set(labels, { clearProps: "all" });
      gsap.set(lines, { clearProps: "all" });

      const tl = gsap.timeline({ paused: true });
      tl.set(panel, { visibility: "visible", pointerEvents: "auto" }, 0);
      tl.to(panel, { xPercent: 0, duration: 0.45, ease: "power2.out" }, 0);
      tl.fromTo(
        labels,
        { yPercent: 110 },
        { yPercent: 0, stagger: 0.03, duration: 0.4, ease: "power2.out" },
        0.05
      );

      tlRef.current = { tl, mode: "slide", reduced };
      return () => {
        tl.kill();
        gsap.set(panel, { clearProps: "all" });
        if (tlRef.current?.mode === "slide") tlRef.current = null;
      };
    });

    return () => {
      mm.revert();
      tlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const entry = tlRef.current;
    if (!entry) {
      openRef.current = menuOpen;
      return;
    }
    const { tl, reduced } = entry;
    const panel = panelRef.current;

    if (reduced) {
      if (menuOpen) tl.progress(1).pause();
      else {
        tl.progress(0).pause();
        if (panel) {
          gsap.set(panel, { visibility: "hidden", pointerEvents: "none" });
        }
      }
      openRef.current = menuOpen;
      return;
    }

    if (menuOpen) {
      tl.play();
    } else if (openRef.current) {
      tl.reverse();
      tl.eventCallback("onReverseComplete", () => {
        if (panel) {
          gsap.set(panel, { visibility: "hidden", pointerEvents: "none" });
        }
        tl.eventCallback("onReverseComplete", null);
      });
    }
    openRef.current = menuOpen;
  }, [menuOpen]);

  const drawer =
    typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              type="button"
              className={`${styles.navDrawerBackdrop} ${
                menuOpen ? styles.isVisible : ""
              }`}
              aria-label={drawerBackdropLabel}
              aria-hidden={!menuOpen}
              tabIndex={-1}
              onClick={onCloseMenu}
            />

            <div
              id="nav-panel"
              ref={panelRef}
              className={styles.navPanel}
              role={menuOpen ? "dialog" : undefined}
              aria-modal={menuOpen ? true : undefined}
              aria-hidden={!menuOpen}
            >
              <nav
                className={styles.navPanelNav}
                aria-label={navAria}
                data-lenis-prevent=""
              >
                <div className={styles.navPanelLinks} ref={linksRef}>
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      to={href}
                      className={styles.navPanelLink}
                      onClick={(event) => handleNavClick(event, href)}
                    >
                      <span className={styles.navPanelLinkMask}>
                        <HoverSlideText
                          text={label}
                          className={styles.navPanelLinkText}
                          data-menu-label=""
                        />
                      </span>
                      <span className={styles.navPanelUnderline} data-menu-line="" />
                    </Link>
                  ))}
                </div>

                <div className={styles.navPanelFooter}>
                  <div
                    className={styles.navPanelLang}
                    role="group"
                    aria-label={langGroup}
                  >
                    <button
                      type="button"
                      className={`${styles.navPanelLangBtn} ${
                        lang === "ru" ? styles.isActive : ""
                      }`}
                      onClick={() => onSetLang("ru")}
                      aria-pressed={lang === "ru"}
                    >
                      RU
                    </button>
                    <button
                      type="button"
                      className={`${styles.navPanelLangBtn} ${
                        lang === "en" ? styles.isActive : ""
                      }`}
                      onClick={() => onSetLang("en")}
                      aria-pressed={lang === "en"}
                    >
                      EN
                    </button>
                  </div>
                  {tgAppLabel ? (
                    <a
                      className={styles.navPanelApp}
                      href={TG_APP_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onCloseMenu}
                    >
                      <OsAppIcon className={styles.navPanelAppIcon} />
                      <span className={styles.navPanelAppLabel}>{tgAppLabel}</span>
                    </a>
                  ) : null}
                </div>
              </nav>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <header
        ref={headerRef}
        className={`${styles.siteHeader}${
          scrolled || menuOpen ? ` ${styles.siteHeaderSolid}` : ""
        }${compactVisual ? ` ${styles.siteHeaderCompact}` : ""}`}
      >
        <div className={styles.chromeBar} ref={barRef}>
          <Link
            className={styles.chromeBrand}
            to="/"
            onClick={handleLogoClick}
            aria-label={logoAria}
          >
            <span
              className={styles.chromeBrandBadge}
              ref={badgeRef}
              aria-hidden="true"
            >
              df
            </span>
          </Link>

          <div className={styles.chromeTrail}>
            <div
              className={styles.langSwitch}
              ref={langRef}
              role="group"
              aria-label={langGroup}
            >
              <button
                type="button"
                className={`${styles.langSwitchBtn} ${
                  lang === "ru" ? styles.isActive : ""
                }`}
                onClick={() => onSetLang("ru")}
                aria-pressed={lang === "ru"}
              >
                RU
              </button>
              <button
                type="button"
                className={`${styles.langSwitchBtn} ${
                  lang === "en" ? styles.isActive : ""
                }`}
                onClick={() => onSetLang("en")}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>

            <RadioTrigger playLabel={radioPlay} pauseLabel={radioPause} />

            <button
              ref={menuBtnRef}
              type="button"
              className={`${styles.chromeMenuBtn} ${
                menuOpen ? styles.chromeMenuBtnOpen : ""
              }`}
              aria-expanded={menuOpen}
              aria-controls="nav-panel"
              aria-label={menuOpen ? "Close menu" : menuLabel}
              onClick={onToggleMenu}
            >
              <span className={styles.chromeMenuDot} aria-hidden="true" />
              <span className={styles.chromeMenuText}>
                {menuOpen ? "CLOSE" : menuLabel}
              </span>
            </button>
          </div>
        </div>
      </header>
      {drawer}
    </>
  );
};
