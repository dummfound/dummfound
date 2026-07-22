import { IosLinkIcon } from "./IosLinkIcon";
import { Link } from "react-router-dom";
import styles from "../styles.module.scss";

export const SectionGigs = ({ label, gigs = [] }) => {
  return (
    <section id="gigs" className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionLabel}>{label}</h2>
        <div className={styles.sectionBody}>
          <ul className={styles.gigsList} role="list">
            {gigs.map(
              ({ slug, title, type, date, location, linkLabel, image }) => (
                <li key={slug} className={styles.gigsItem}>
                  <div className={styles.gigsContent}>
                    <h3 className={styles.gigsTitle}>
                      <Link className={styles.gigsTitleLink} to={`/gigs/${slug}`}>
                        {title}
                      </Link>
                    </h3>
                    <p className={styles.gigsType}>{type}</p>
                    <p className={styles.gigsMeta}>{date}</p>
                    <p className={styles.gigsLocation}>{location}</p>
                    <Link className={styles.gigsLink} to={`/gigs/${slug}`}>
                      <span>{linkLabel}</span>
                      <IosLinkIcon className={styles.linkIcon} />
                    </Link>
                  </div>
                  {image ? (
                    <Link
                      className={styles.gigsMedia}
                      to={`/gigs/${slug}`}
                      aria-label={title}
                    >
                      <img
                        src={image}
                        alt=""
                        className={styles.gigsImage}
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                  ) : null}
                </li>
              )
            )}
          </ul>
          <p className={styles.gigsTba}>{"& TBA"}</p>
        </div>
      </div>
    </section>
  );
};
