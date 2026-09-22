import { Link } from "react-router-dom";
import { HoverSlideText } from "./HoverSlideText";
import styles from "../styles.module.scss";

export const SiteFooter = ({
  navLinks = [],
  socialLinks = [],
  instagramDisclaimer = "",
  labels = {},
  year = new Date().getFullYear(),
}) => {
  const {
    colLinks = "Links",
    colFollow = "Follow",
    rights = "All rights reserved",
  } = labels;

  const byHref = Object.fromEntries(
    navLinks.map((item) => [item.href, item])
  );

  const linkItems = [byHref["/music"], byHref["/gigs"]].filter(Boolean);

  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerInner}>
        <div className={styles.footerCols}>
          <div className={styles.footerCol}>
            <h2 className={styles.footerColTitle}>{colLinks}</h2>
            <ul className={styles.footerColList} role="list">
              {linkItems.map(({ href, label }) => (
                <li key={`${href}-${label}`}>
                  <Link className={styles.footerTextLink} to={href}>
                    <HoverSlideText text={label} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.footerCol} ${styles.footerColFollow}`}>
            <h2 className={styles.footerColTitle}>{colFollow}</h2>
            <ul className={styles.footerColList} role="list">
              {socialLinks.map(({ key, label, href }) => {
                const text = String(label).replace(/\*$/, "");
                return (
                  <li key={key}>
                    <a
                      className={styles.footerTextLink}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <HoverSlideText text={text} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <Link className={styles.footerMark} to="/" aria-label="DUMMFOUND">
            <span className={styles.footerMarkBadge} aria-hidden="true">
              df
            </span>
            <span className={styles.footerMarkText}>
              <span className={styles.footerMarkName}>DUMMFOUND</span>
              <span className={styles.footerMarkRights}>
                © {year} {rights}
              </span>
            </span>
          </Link>

          {instagramDisclaimer ? (
            <p className={styles.footerDisclaimer}>{instagramDisclaimer}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
};
