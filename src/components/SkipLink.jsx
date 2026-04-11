import styles from "../styles.module.scss";

export const SkipLink = ({ href = "#main", children }) => {
  return (
    <a className={styles.skip} href={href}>
      {children}
    </a>
  );
};
