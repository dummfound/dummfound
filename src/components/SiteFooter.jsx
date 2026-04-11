import styles from "../styles.module.scss";

export const SiteFooter = ({
  line = "© DUMMFOUND",
  year = new Date().getFullYear(),
  instagramDisclaimer,
}) => {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.siteFooterInner}>
        <p className={styles.siteFooterCopyright}>
          {line} {year}
        </p>
        {instagramDisclaimer ? (
          <p className={styles.siteFooterDisclaimer}>{instagramDisclaimer}</p>
        ) : null}
      </div>
    </footer>
  );
};
