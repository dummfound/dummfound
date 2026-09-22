import styles from "../styles.module.scss";

const SMARTPHONE_SRC = "/img/smartphone.png";

/** DUMMFOUND OS mark — smartphone silhouette */
export const OsAppIcon = ({ className = "" }) => (
  <img
    className={`${styles.osAppIcon} ${className}`.trim()}
    src={SMARTPHONE_SRC}
    alt=""
    width={16}
    height={16}
    decoding="async"
    aria-hidden="true"
    draggable={false}
  />
);
