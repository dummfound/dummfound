import { useLayoutEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { IosBackIcon } from "./IosBackIcon";
import { IosLinkIcon } from "./IosLinkIcon";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SkipLink } from "./SkipLink";
import styles from "../styles.module.scss";

export const GigPage = ({
  gigs = [],
  backLabel,
  ticketsLabel,
  skip,
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
        lang={lang}
        onSetLang={onSetLang}
        playerGroup={playerGroup}
        playerPlay={playerPlay}
        playerPause={playerPause}
        playerEmpty={playerEmpty}
        menuOpen={menuOpen}
        onCloseMenu={onCloseMenu}
        onToggleMenu={onToggleMenu}
      />

      <main
        id="main"
        className={
          gig.image ? `${styles.gigPage} ${styles.gigPageWithBg}` : styles.gigPage
        }
      >
        {gig.image ? (
          <div className={styles.gigPageBg} aria-hidden="true">
            <img
              src={gig.image}
              alt=""
              className={styles.gigPageBgImage}
              decoding="async"
            />
          </div>
        ) : null}

        <div className={styles.gigPageInner}>
          <Link className={styles.gigBack} to="/gigs">
            <IosBackIcon className={styles.gigBackIcon} />
            <span>{backLabel}</span>
          </Link>

          <article className={styles.gigArticle}>
            <p className={styles.gigsType}>{gig.type}</p>
            <h1 className={styles.gigTitle}>{gig.title}</h1>
            <p className={styles.gigsMeta}>{gig.date}</p>
            <p className={styles.gigsLocation}>{gig.location}</p>

            {gig.image ? (
              <div className={styles.gigHeroMedia}>
                <img
                  src={gig.image}
                  alt={gig.title}
                  className={styles.gigHeroImage}
                  decoding="async"
                />
              </div>
            ) : null}

            {gig.body ? <p className={styles.gigBody}>{gig.body}</p> : null}

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
