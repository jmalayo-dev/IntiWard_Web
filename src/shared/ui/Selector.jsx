import { useId } from 'react';
import styles from './Campo.module.css';

/** Igual que Campo, pero con <select>. `opciones`: [{ valor, texto }]. */
export function Selector({ etiqueta, error, opciones = [], placeholder, id, className = '', ...resto }) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  return (
    <div className={`${styles.campo} ${className}`}>
      {etiqueta && (
        <label className={styles.etiqueta} htmlFor={idCampo}>
          {etiqueta}
        </label>
      )}
      <select id={idCampo} className={`${styles.entrada} ${error ? styles.conError : ''}`} aria-invalid={error ? true : undefined} {...resto}>
        {placeholder && <option value="">{placeholder}</option>}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
      {error && <span className={styles.mensajeError}>{error}</span>}
    </div>
  );
}
