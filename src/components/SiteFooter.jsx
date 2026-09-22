import { Link } from "react-router-dom";
import styles from "../styles.module.scss";

export const SiteFooter = ({
  linksLabel = "Links",
  followLabel = "Follow us",
  rightsLabel = "All Rights Reserved.",
  links = [],
  socialLinks = [],
  year = new Date().getFullYear(),
}) => {
  const hasLinks = links.length > 0;
  const hasSocial = socialLinks.length > 0;

  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerGrid}>
        {(hasLinks || hasSocial) && (
          <div className={styles.footerNavLabels} aria-hidden="true">
            {hasLinks ? (
              <span className={styles.footerNavLabel}>{linksLabel}</span>
            ) : null}
            {hasSocial ? (
              <span className={styles.footerNavLabel}>{followLabel}</span>
            ) : null}
          </div>
        )}

        {(hasLinks || hasSocial) && (
          <div className={styles.footerNavBody}>
            {hasLinks ? (
              <nav className={styles.footerNavRow} aria-label={linksLabel}>
                <ul className={styles.footerNavList} role="list">
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link className={styles.footerNavLink} to={href}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            {hasSocial ? (
              <nav className={styles.footerNavRow} aria-label={followLabel}>
                <ul className={styles.footerNavList} role="list">
                  {socialLinks.map(({ key, label, href }) => (
                    <li key={key}>
                      <a
                        className={styles.footerNavLink}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        )}

        <p className={styles.footerCopy}>
          © {year} {rightsLabel}
        </p>
      </div>
    </footer>
  );
};
