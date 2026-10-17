import styles from './Insignia.module.css';

/** Píldora de estado. `tono`: exito | advertencia | error | info | morado | neutro. `punto`: círculo a la izquierda. */
export function Insignia({ tono = 'neutro', punto = false, children }) {
  return (
    <span className={`${styles.insignia} ${styles[tono]}`}>
      {punto && <span className={styles.punto} aria-hidden="true" />}
      {children}
    </span>
  );
}
