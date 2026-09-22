import { Spinner } from "./Spinner";
import styles from "../styles.module.scss";

/** Shared loader — radio / hero */
export const BrandLoader = ({ label = "LOADING", size = 36 }) => (
  <div className={styles.brandLoader} role="status" aria-live="polite">
    <Spinner size={size} />
    {label ? <span className={styles.brandLoaderText}>{label}</span> : null}
  </div>
);
