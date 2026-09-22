import styles from "../styles.module.scss";

export const SectionAbout = ({ label, body }) => {
  return (
    <section
      id="about"
      className={styles.section}
      data-section="about"
      data-theme="gray"
    >
      <div className={styles.sectionInner}>
        <div className={styles.sectionTop}>
          <span className={styles.sectionSquare} aria-hidden="true" />
          <h2 className={styles.sectionLabel}>
            {label}
          </h2>
        </div>
        <div className={`${styles.sectionBody} ${styles.prose}`}>
          <p>{body}</p>
        </div>
      </div>
    </section>
  );
};
