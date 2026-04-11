import styles from "../styles.module.scss";

export const SectionGigs = ({ label, gigs = [] }) => {
  return (
    <section id="gigs" className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionLabel}>{label}</h2>
        <div className={styles.sectionBody}>
          <ul className={styles.gigsList} role="list">
            {gigs.map(({ title, type, date, location, href, linkLabel, image }) => (
              <li key={`${title}-${date}`} className={styles.gigsItem}>
                <div className={styles.gigsContent}>
                  <h3 className={styles.gigsTitle}>{title}</h3>
                  <p className={styles.gigsType}>{type}</p>
                  <p className={styles.gigsMeta}>{date}</p>
                  <p className={styles.gigsLocation}>{location}</p>
                  <a
                    className={styles.gigsLink}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {linkLabel}
                  </a>
                </div>
                {image ? (
                  <div className={styles.gigsMedia}>
                    <img
                      src={image}
                      alt={title}
                      className={styles.gigsImage}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};