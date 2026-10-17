import { useId } from 'react';
import styles from './Campo.module.css';

/** Área de texto con etiqueta, contador opcional ("0 / 2000") y mensaje de error. */
export function AreaTexto({ etiqueta, error, maximo, value = '', id, className = '', filas = 5, ...resto }) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  return (
    <div className={`${styles.campo} ${className}`}>
      {etiqueta && (
        <label className={styles.etiqueta} htmlFor={idCampo}>
          {etiqueta}
        </label>
      )}
      <textarea
        id={idCampo}
        rows={filas}
        maxLength={maximo}
        value={value}
        className={`${styles.entrada} ${styles.area} ${error ? styles.conError : ''}`}
        aria-invalid={error ? true : undefined}
        {...resto}
      />
      <div className={styles.pieArea}>
        {error ? <span className={styles.mensajeError}>{error}</span> : <span />}
        {maximo && (
          <span className={styles.ayuda}>
            {value.length} / {maximo}
          </span>
        )}
      </div>
    </div>
  );
}
