import styles from "../styles.module.scss";

const ABOUT_BG = "/img/about-bg.jpg";

export const SectionAbout = ({ label, body }) => {
  return (
    <section
      id="about"
      className={`${styles.section} ${styles.sectionAbout}`}
      data-section="about"
      data-theme="gray"
    >
      <div className={styles.aboutBg} aria-hidden="true">
        <img
          className={styles.aboutBgImg}
          src={ABOUT_BG}
          alt=""
          width={1600}
          height={900}
          decoding="async"
          loading="lazy"
          draggable={false}
        />
      </div>
      <div className={styles.sectionInner}>
        <div className={styles.sectionTop}>
          <span className={styles.sectionSquare} aria-hidden="true" />
          <h2 className={styles.sectionLabel}>{label}</h2>
        </div>
        <div className={`${styles.sectionBody} ${styles.prose}`}>
          <p>{body}</p>
        </div>
      </div>
    </section>
  );
};
