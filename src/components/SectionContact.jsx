import styles from "../styles.module.scss";

const MAIL = "dummfound@gmail.com";

export const SectionContact = ({ label, socialLinks }) => {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionLabel}>{label}</h2>
        <div className={styles.sectionBody}>
          <address className={styles.contactBlock}>
            <a className={styles.contactMail} href={`mailto:${MAIL}`}>
              {MAIL}
            </a>
          </address>
          <ul className={styles.socialList} role="list">
            {socialLinks.map(({ key, label: socialLabel, href }) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {socialLabel}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
