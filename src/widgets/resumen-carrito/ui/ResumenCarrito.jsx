import { formatoMoneda } from '@/shared/lib';
import styles from './ResumenCarrito.module.css';

/**
 * Tarjeta de resumen (vistas 4.6 y 4.7): líneas compactas opcionales, subtotal, IGV (18 %) y total.
 * `children`: el botón (y lo que vaya debajo). `fijo`: se queda visible al hacer scroll.
 */
export function ResumenCarrito({ titulo, lineas, subtotal, igv, total, nota, children, fijo = false }) {
  return (
    <aside className={`${styles.resumen} ${fijo ? styles.fijo : ''}`} aria-label={titulo}>
      <h2 className={styles.titulo}>{titulo}</h2>
      {lineas?.length > 0 && (
        <ul className={styles.lineas}>
          {lineas.map((l) => (
            <li key={l.idProducto}>
              <span>
                {l.cantidad} × {l.nombre}
              </span>
              <strong>{formatoMoneda(l.importe)}</strong>
            </li>
          ))}
        </ul>
      )}
      <dl className={styles.montos}>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatoMoneda(subtotal)}</dd>
        </div>
        <div>
          <dt>IGV (18 %)</dt>
          <dd>{formatoMoneda(igv)}</dd>
        </div>
        <div className={styles.total}>
          <dt>Total</dt>
          <dd>{formatoMoneda(total)}</dd>
        </div>
      </dl>
      {nota && <p className={styles.nota}>{nota}</p>}
      {children}
    </aside>
  );
}
