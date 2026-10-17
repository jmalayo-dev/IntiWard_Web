import { Icono } from './Icono';
import styles from './Indicador.module.css';

/** Tarjeta de indicador del panel: ícono en círculo de color suave, título, valor grande y detalle. */
export function Indicador({ icono, tono = 'info', titulo, valor, detalle, tonoValor }) {
  return (
    <section className={styles.indicador}>
      <div className={styles.cabecera}>
        {icono && (
          <span className={`${styles.circulo} ${styles[tono]}`}>
            <Icono nombre={icono} />
          </span>
        )}
        <h2 className={styles.titulo}>{titulo}</h2>
      </div>
      <p className={`${styles.valor} ${tonoValor ? styles[`valor-${tonoValor}`] : ''}`}>{valor}</p>
      {detalle && <div className={styles.detalle}>{detalle}</div>}
    </section>
  );
}
