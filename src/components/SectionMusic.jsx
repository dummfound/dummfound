import styles from "../styles.module.scss";

export const SectionMusic = ({ label, releases }) => {
  return (
    <section id="music" className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionLabel}>{label}</h2>
        <div className={styles.sectionBody}>
          <ul className={styles.releaseList} role="list">
            {releases.map(({ title, meta, href, linkLabel }) => (
              <li key={title}>
                <span className={styles.releaseTitle}>{title}</span>
                <span className={styles.releaseMeta}>{meta}</span>
                <a
                  className={styles.releaseLink}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {linkLabel}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
