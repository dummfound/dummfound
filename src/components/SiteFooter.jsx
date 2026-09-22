import { Link } from "react-router-dom";
import { SocialBrandIcon } from "./SocialBrandIcon";
import styles from "../styles.module.scss";

export const SiteFooter = ({
  instagramDisclaimer = "",
  socialLinks = [],
  year = new Date().getFullYear(),
}) => {
  const hasSocial = socialLinks.length > 0;

  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerRow}>
        <p className={styles.footerCredit}>
          <span className={styles.footerCopyYear}>© {year}</span>{" "}
          <Link className={styles.footerBrand} to="/">
            DUMMFOUND
          </Link>
        </p>

        {hasSocial ? (
          <ul
            className={`${styles.footerLinks} ${styles.footerLinksSocial}`}
            role="list"
          >
            {socialLinks.map(({ key, label, href }) => (
              <li key={key} className={styles.footerLinkItem}>
                <a
                  className={styles.footerLink}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <span className={styles.footerLinkLabel}>{label}</span>
                  <span className={styles.footerLinkIcon} aria-hidden="true">
                    {key === "instagram" ? (
                      <span className={styles.socialInstagramPair}>
                        <SocialBrandIcon
                          brandKey={key}
                          className={styles.socialIcon}
                        />
                        <span className={styles.socialMetaAsterisk}>*</span>
                      </span>
                    ) : (
                      <SocialBrandIcon
                        brandKey={key}
                        className={styles.socialIcon}
                      />
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {instagramDisclaimer ? (
          <p className={styles.footerCopy}>
            <span className={styles.footerCopyText}>{instagramDisclaimer}</span>
          </p>
        ) : null}
      </div>
    </footer>
  );
};
