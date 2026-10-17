import { Icono } from './Icono';
import styles from './SelectorCantidad.module.css';

/** Selector "− 2 +". No baja de `minimo` ni pasa de `maximo`. */
export function SelectorCantidad({ valor, alCambiar, minimo = 1, maximo = Infinity, disabled = false, etiqueta = 'Cantidad' }) {
  return (
    <div className={`${styles.selector} ${disabled ? styles.deshabilitado : ''}`} role="group" aria-label={etiqueta}>
      <button type="button" className={styles.boton} onClick={() => alCambiar(valor - 1)} disabled={disabled || valor <= minimo} aria-label="Quitar uno">
        <Icono nombre="menos" tamano={16} />
      </button>
      <span className={styles.valor} aria-live="polite">
        {valor}
      </span>
      <button type="button" className={styles.boton} onClick={() => alCambiar(valor + 1)} disabled={disabled || valor >= maximo} aria-label="Agregar uno">
        <Icono nombre="mas" tamano={16} />
      </button>
    </div>
  );
}
