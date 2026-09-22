import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { HoverSlideText } from "./HoverSlideText";
import { OsAppIcon } from "./OsAppIcon";
import { RadioTrigger } from "./Radio";
import styles from "../styles.module.scss";

const scrollToTop = () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
};

const TG_APP_HREF = "https://t.me/dummfoundOSbot/app";
const MOBILE_MQ = "(max-width: 768px)";
const SCROLL_SOLID_AT = 24;
const MENU_CLOSE_MS = 480;

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
  radioOpen,
  menuOpen,
  onCloseMenu,
  onToggleMenu,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const panelRef = useRef(null);
  const menuBtnRef = useRef(null);
  const linksRef = useRef(null);
  const tlRef = useRef(null);
  const openRef = useRef(false);
  const lastScrollY = useRef(0);
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);

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
    lastScrollY.current = window.scrollY || window.pageYOffset || 0;

    const sync = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      const prev = lastScrollY.current;
      setScrolled(y > SCROLL_SOLID_AT);

      // Scroll down → compact; scroll up (y decreases) → expand. At top → full.
      if (y <= SCROLL_SOLID_AT) {
        setCompact(false);
      } else if (y > prev + 6) {
        setCompact(true);
      } else if (y < prev - 6) {
        setCompact(false);
      }

      lastScrollY.current = y;
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [location.pathname]);

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
              <nav className={styles.navPanelNav} aria-label={navAria}>
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
        className={`${styles.siteHeader}${
          scrolled || menuOpen ? ` ${styles.siteHeaderSolid}` : ""
        }${compact && !menuOpen ? ` ${styles.siteHeaderCompact}` : ""}`}
      >
        <div className={styles.chromeBar}>
          <Link
            className={styles.chromeBrand}
            to="/"
            onClick={handleLogoClick}
            aria-label={logoAria}
          >
            <span className={styles.chromeBrandBadge} aria-hidden="true">
              df
            </span>
          </Link>

          <div className={styles.chromeTrail}>
            <div
              className={styles.langSwitch}
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

            <RadioTrigger openLabel={radioOpen} />
          </div>
        </div>
      </header>
      {drawer}
    </>
  );
};
