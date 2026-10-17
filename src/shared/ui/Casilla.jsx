import { useId } from 'react';
import styles from './Casilla.module.css';

/** Casilla de verificación con su texto a la derecha y mensaje de error debajo. */
export function Casilla({ etiqueta, error, id, className = '', ...resto }) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const idMensaje = `${idCampo}-mensaje`;
  return (
    <div className={`${styles.casilla} ${className}`}>
      <label className={styles.fila} htmlFor={idCampo}>
        <input
          id={idCampo}
          type="checkbox"
          className={`${styles.control} ${error ? styles.conError : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idMensaje : undefined}
          {...resto}
        />
        <span>{etiqueta}</span>
      </label>
      {error && (
        <span id={idMensaje} className={styles.mensajeError}>
          {error}
        </span>
      )}
    </div>
  );
}
