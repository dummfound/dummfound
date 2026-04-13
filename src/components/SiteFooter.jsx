import { SocialBrandIcon } from "./SocialBrandIcon";
import styles from "../styles.module.scss";

export const SiteFooter = ({
  line = "© DUMMFOUND",
  year = new Date().getFullYear(),
  instagramDisclaimer,
  socialLinks = [],
}) => {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.siteFooterInner}>
        {socialLinks.length > 0 ? (
          <ul
            className={`${styles.socialList} ${styles.socialListFooter}`}
            role="list"
          >
            {socialLinks.map(({ key, label: socialLabel, href }) => (
              <li key={key}>
                <a
                  className={styles.socialLink}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialLabel}
                >
                  {key === "instagram" ? (
                    <span className={styles.socialInstagramPair}>
                      <SocialBrandIcon
                        brandKey={key}
                        className={styles.socialIcon}
                      />
                      <span
                        className={styles.socialMetaAsterisk}
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </span>
                  ) : (
                    <SocialBrandIcon
                      brandKey={key}
                      className={styles.socialIcon}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {instagramDisclaimer ? (
          <p className={styles.siteFooterDisclaimer}>{instagramDisclaimer}</p>
        ) : null}
        <p className={styles.siteFooterCopyright}>
          {line} {year}
        </p>
      </div>
    </footer>
  );
};
