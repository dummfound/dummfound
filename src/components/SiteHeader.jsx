import { Link, useLocation } from "react-router-dom";
import { HeaderMusicPlayer } from "./HeaderMusicPlayer";
import styles from "../styles.module.scss";

const scrollToTop = () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
};

export const SiteHeader = ({
  logoAria,
  navAria,
  langGroup,
  menuLabel,
  drawerBackdropLabel,
  navLinks,
  lang,
  onSetLang,
  playerGroup,
  playerPlay,
  playerPause,
  playerEmpty,
  menuOpen,
  onCloseMenu,
  onToggleMenu,
}) => {
  const location = useLocation();

  const handleLogoClick = () => {
    onCloseMenu();
    if (location.pathname === "/") {
      scrollToTop();
    }
  };

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        <Link
          className={styles.logo}
          to="/"
          onClick={handleLogoClick}
          aria-label={logoAria}
        >
          <span className={styles.logoMark} aria-hidden="true">
            <span className={styles.logoLetter}>D</span>
          </span>
        </Link>
        <div className={styles.headerTrail}>
          <nav className={styles.nav} aria-label={navAria}>
            {navLinks.map(({ href, label }) => (
              <Link key={href} to={href}>
                {label}
              </Link>
            ))}
          </nav>
          <div className={styles.langSwitch} role="group" aria-label={langGroup}>
            <button
              type="button"
              className={`${styles.langSwitchBtn} ${lang === "ru" ? styles.isActive : ""}`}
              onClick={() => onSetLang("ru")}
              aria-pressed={lang === "ru"}
            >
              RU
            </button>
            <button
              type="button"
              className={`${styles.langSwitchBtn} ${lang === "en" ? styles.isActive : ""}`}
              onClick={() => onSetLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
          <HeaderMusicPlayer
            groupLabel={playerGroup}
            playLabel={playerPlay}
            pauseLabel={playerPause}
            emptyLabel={playerEmpty}
          />
          <button
            type="button"
            className={styles.navToggle}
            aria-expanded={menuOpen}
            aria-controls="nav-panel"
            aria-label={menuLabel}
            onClick={onToggleMenu}
          >
            <span className={styles.navToggleBar} />
            <span className={styles.navToggleBar} />
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.navDrawerBackdrop} ${menuOpen ? styles.isVisible : ""}`}
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
        aria-label={navAria}
        aria-hidden={!menuOpen}
      >
        {navLinks.map(({ href, label }) => (
          <Link key={href} to={href} onClick={onCloseMenu}>
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
};
