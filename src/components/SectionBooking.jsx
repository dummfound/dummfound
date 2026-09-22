import styles from "../styles.module.scss";

const BOOKING_EMAIL = "dummfound@gmail.com";
const BOOKING_GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(BOOKING_EMAIL)}`;

export const SectionBooking = ({
  label,
  lead,
  ctaLabel,
  formatLabel,
  formatValue,
  geoLabel,
  geoValue,
}) => {
  return (
    <section
      id="booking"
      className={styles.section}
      data-section="booking"
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
          <p>{lead}</p>
          <dl className={styles.bookingFacts}>
            <div>
              <dt>{formatLabel}</dt>
              <dd className={styles.bookingFactValue}>{formatValue}</dd>
            </div>
            <div>
              <dt>{geoLabel}</dt>
              <dd>{geoValue}</dd>
            </div>
          </dl>
          <a
            className={styles.bookingButton}
            href={BOOKING_GMAIL_COMPOSE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.bookingButtonText}>{ctaLabel}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
