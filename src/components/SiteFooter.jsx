import styles from "../styles.module.scss";

export const SiteFooter = ({
  year = new Date().getFullYear(),
  instagramDisclaimer,
  socialLinks = [],
}) => {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerStrip}>
        <div className={styles.footerStripLabel}>Follow</div>
        <ul className={styles.footerStripLinks} role="list">
          {socialLinks.map(({ key, label: socialLabel, href }) => (
            <li key={key}>
              <a
                className={styles.footerStripLink}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {socialLabel}
                {key === "instagram" ? (
                  <span className={styles.socialMetaAsterisk} aria-hidden="true">
                    *
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {instagramDisclaimer ? (
        <p className={styles.siteFooterDisclaimer}>{instagramDisclaimer}</p>
      ) : null}

      <div className={styles.footerMeta}>
        <span className={styles.footerMetaBrand}>DUMMFOUND</span>
        <span className={styles.footerMetaCopy}>© {year}</span>
        <span className={styles.footerMetaFill} aria-hidden="true" />
      </div>
    </footer>
  );
};
