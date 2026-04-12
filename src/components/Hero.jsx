import styles from "../styles.module.scss";

export const Hero = ({ introLabel }) => {
  return (
    <section id="top" className={styles.hero} aria-label={introLabel}>
      <div className={styles.heroBg} aria-hidden="true">
        <img
          className={styles.heroBgImg}
          src="/dummfound-portrait.png"
          alt=""
          width={900}
          height={1200}
          decoding="async"
        />
      </div>
      <div className={styles.heroScrim} aria-hidden="true" />
      <div className={styles.heroGrain} aria-hidden="true" />
      <div className={styles.heroInner}>
        <div className={styles.heroGrid}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleSolid}>DUMMFOUND</span>
            <span className={styles.heroTitleGrad} aria-hidden="true">
              DUMMFOUND
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
};
