import { Link, useLocation } from "react-router-dom";
import { OsAppIcon } from "./OsAppIcon";
import { Radio } from "./Radio";
import { ScrambleLink } from "./ScrambleLink";
import styles from "../styles.module.scss";

const scrollToTop = () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
};

const TG_APP_HREF = "https://t.me/dummfoundOSbot/app";

const pathAccent = (pathname) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/music")) return "music";
  if (pathname.startsWith("/booking")) return "booking";
  if (pathname.startsWith("/gigs")) return "gigs";
  if (pathname.startsWith("/contact")) return "contact";
  return "home";
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
  radioOpen,
  radioTitle,
  radioClose,
  radioPlay,
  radioPause,
  radioVolume,
  menuOpen,
  onCloseMenu,
  onToggleMenu,
}) => {
  const location = useLocation();
  const accent = pathAccent(location.pathname);
  const isHome = location.pathname === "/";

  const handleLogoClick = () => {
    onCloseMenu();
    if (isHome) {
      scrollToTop();
    }
  };

  return (
    <header className={styles.siteHeader} data-accent={accent}>
      <div className={styles.chromeSafeTop} aria-hidden="true">
        <span className={styles.chromeSafeTopBrand} />
        <span className={styles.chromeSafeTopMenu} />
        <span className={styles.chromeSafeTopRest} />
      </div>
      <div className={styles.chromeBar}>
        <Link
          className={styles.chromeBrand}
          to="/"
          onClick={handleLogoClick}
          aria-label={logoAria}
        >
          DUMMFOUND
        </Link>

        <button
          type="button"
          className={styles.chromeMenuBtn}
          aria-expanded={menuOpen}
          aria-controls="nav-panel"
          aria-label={menuLabel}
          onClick={onToggleMenu}
        >
          {menuLabel}
        </button>

        <div className={styles.chromeSpacers} aria-hidden="true">
          <span className={styles.chromeSpacer} />
          <span className={`${styles.chromeSpacer} ${styles.chromeSpacerDim}`} />
          <span className={`${styles.chromeSpacer} ${styles.chromeSpacerDim}`} />
        </div>

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
          <Radio
            openLabel={radioOpen}
            titleLabel={radioTitle}
            closeLabel={radioClose}
            playLabel={radioPlay}
            pauseLabel={radioPause}
            volumeLabel={radioVolume}
          />
        </div>
      </div>

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
        className={`${styles.navPanel} ${menuOpen ? styles.navPanelOpen : ""}`}
        role={menuOpen ? "dialog" : undefined}
        aria-modal={menuOpen ? true : undefined}
        aria-hidden={!menuOpen}
      >
        <nav className={styles.navPanelNav} aria-label={navAria}>
          {navLinks.map(({ href, label }) => (
            <ScrambleLink
              key={href}
              text={label}
              to={href}
              className={styles.navPanelLink}
              data-section={href === "/" ? "home" : href.slice(1)}
              onClick={onCloseMenu}
              end={
                <span className={styles.navPanelArrow} aria-hidden="true">
                  ↗
                </span>
              }
            />
          ))}
          <div className={styles.navPanelLang} role="group" aria-label={langGroup}>
            <button
              type="button"
              className={`${styles.navPanelLangBtn} ${
                lang === "ru" ? styles.isActive : ""
              }`}
              onClick={() => {
                onSetLang("ru");
              }}
              aria-pressed={lang === "ru"}
            >
              RU
            </button>
            <button
              type="button"
              className={`${styles.navPanelLangBtn} ${
                lang === "en" ? styles.isActive : ""
              }`}
              onClick={() => {
                onSetLang("en");
              }}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
          {tgAppLabel ? (
            <ScrambleLink
              external
              text={tgAppLabel}
              href={TG_APP_HREF}
              className={styles.navPanelLinkExternal}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onCloseMenu}
              end={<OsAppIcon className={styles.navPanelAppIcon} />}
            />
          ) : null}
        </nav>
      </div>
    </header>
  );
};
