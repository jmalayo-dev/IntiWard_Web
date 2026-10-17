import styles from './Interruptor.module.css';

/** Interruptor encendido / apagado. `etiqueta` visible a la derecha, o solo para lectores si `ocultarEtiqueta`. */
export function Interruptor({ activo, alCambiar, etiqueta, ocultarEtiqueta = false, disabled = false }) {
  return (
    <label className={`${styles.interruptor} ${disabled ? styles.deshabilitado : ''}`}>
      <input
        type="checkbox"
        role="switch"
        className={styles.control}
        checked={Boolean(activo)}
        disabled={disabled}
        onChange={(e) => alCambiar?.(e.target.checked)}
      />
      <span className={styles.pista} aria-hidden="true" />
      <span className={ocultarEtiqueta ? 'solo-lectores' : styles.texto}>{etiqueta}</span>
    </label>
  );
}
