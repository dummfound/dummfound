import styles from "../styles.module.scss";

export const SectionAbout = ({ label, body }) => {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionLabel}>{label}</h2>
        <div className={`${styles.sectionBody} ${styles.prose}`}>
          <p>{body}</p>
        </div>
      </div>
    </section>
  );
};
