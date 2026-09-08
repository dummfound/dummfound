import { Link } from "react-router-dom";
import styles from "../styles.module.scss";

const PANEL_IMAGE = "/img/DSCF4120-2.jpg";

const formatGigLine = (date, title) => {
  if (!date || date === "TBA") return `TBA  ${title}`;
  const short = date.replace(/\.20\d{2}$/, ".");
  return `${short}  ${title}`;
};

export const SectionGigs = ({ label, gigs = [] }) => {
  const tourTitle = gigs[0]?.type ?? "";
  const panelImage = gigs.find((g) => g.image)?.image ?? PANEL_IMAGE;

  return (
    <section id="gigs" className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionLabel}>{label}</h2>
        <div className={styles.sectionBody}>
          <div className={styles.gigsPanel}>
            <div className={styles.gigsPanelMedia} aria-hidden="true">
              <img
                src={panelImage}
                alt=""
                className={styles.gigsPanelImage}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className={styles.gigsPanelContent}>
              {tourTitle ? (
                <h3 className={styles.gigsPanelTitle}>{tourTitle}</h3>
              ) : null}
              <ul className={styles.gigsList} role="list">
                {gigs.map(({ slug, title, date }) => (
                  <li key={slug} className={styles.gigsItem}>
                    <Link className={styles.gigsItemLink} to={`/gigs/${slug}`}>
                      {formatGigLine(date, title)}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className={styles.gigsTba}>{"& TBA"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
