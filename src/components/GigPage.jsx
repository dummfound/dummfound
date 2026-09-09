import { useLayoutEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { IosBackIcon } from "./IosBackIcon";
import { IosLinkIcon } from "./IosLinkIcon";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SkipLink } from "./SkipLink";
import styles from "../styles.module.scss";

const TOUR_BG = "/img/bratania-duo.jpg";

export const GigPage = ({
  gigs = [],
  backLabel,
  ticketsLabel,
  detailsSoon,
  skip,
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
  footerInstagramDisclaimer,
  socialLinks,
}) => {
  const { slug } = useParams();
  const gig = gigs.find((item) => item.slug === slug);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  if (!gig) {
    return <Navigate to="/gigs" replace />;
  }

  return (
    <>
      <SkipLink>{skip}</SkipLink>

      <SiteHeader
        logoAria={logoAria}
        navAria={navAria}
        langGroup={langGroup}
        menuLabel={menuLabel}
        drawerBackdropLabel={drawerBackdropLabel}
        navLinks={navLinks}
        tgAppLabel={tgAppLabel}
        lang={lang}
        onSetLang={onSetLang}
        radioOpen={radioOpen}
        radioTitle={radioTitle}
        radioClose={radioClose}
        radioPlay={radioPlay}
        radioPause={radioPause}
        radioVolume={radioVolume}
        menuOpen={menuOpen}
        onCloseMenu={onCloseMenu}
        onToggleMenu={onToggleMenu}
      />

      <main id="main" className={`${styles.gigPage} ${styles.gigPageWithBg}`}>
        <div className={styles.gigPageBg} aria-hidden="true">
          <img
            src={TOUR_BG}
            alt=""
            className={styles.gigPageBgImage}
            decoding="async"
          />
        </div>

        <div className={styles.gigPageInner}>
          <Link className={styles.gigBack} to="/gigs">
            <IosBackIcon className={styles.gigBackIcon} />
            <span>{backLabel}</span>
          </Link>

          <article className={styles.gigArticle}>
            <p className={styles.gigsType}>
              {gig.type}
              {gig.typeNote ? (
                <span className={styles.gigsTitleNote}> ({gig.typeNote})</span>
              ) : null}
            </p>
            <h1 className={styles.gigTitle}>{gig.title}</h1>
            <p className={styles.gigsMeta}>{gig.date}</p>
            <p className={styles.gigsLocation}>{gig.location}</p>

            {gig.body ? <p className={styles.gigBody}>{gig.body}</p> : null}

            {detailsSoon ? (
              <p className={styles.gigDetailsSoon}>{detailsSoon}</p>
            ) : null}

            {gig.href ? (
              <a
                className={styles.gigTickets}
                href={gig.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{ticketsLabel}</span>
                <IosLinkIcon className={styles.linkIcon} />
              </a>
            ) : null}
          </article>
        </div>
      </main>

      <SiteFooter
        instagramDisclaimer={footerInstagramDisclaimer}
        socialLinks={socialLinks}
      />
    </>
  );
};
