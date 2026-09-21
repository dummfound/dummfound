import { ScaleLoader } from "react-spinners";
import styles from "../styles.module.scss";

const BRAND = "#faff00";

/** Shared yellow ScaleLoader (react-spinners) — radio / hero */
export const BrandLoader = ({ label = "LOADING" }) => (
  <div className={styles.brandLoader} role="status" aria-live="polite">
    <ScaleLoader
      color={BRAND}
      height={32}
      width={4}
      radius={0}
      margin={3}
      aria-hidden
    />
    {label ? <span className={styles.brandLoaderText}>{label}</span> : null}
  </div>
);
