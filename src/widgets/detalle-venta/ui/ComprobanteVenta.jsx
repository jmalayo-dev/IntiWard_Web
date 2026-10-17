import { Link } from 'react-router-dom';
import { TIPO_COMPROBANTE } from '@/entities/comprobante';
import { BotonDescargarComprobante } from '@/features/descargar-comprobante';
import { RUTAS } from '@/shared/config';
import { formatoMoneda } from '@/shared/lib';
import styles from './ComprobanteVenta.module.css';

/** Tarjeta "Comprobante": tipo, número, cliente y documento, montos y descarga del PDF. */
export function ComprobanteVenta({ comprobante }) {
  const tipo = TIPO_COMPROBANTE[comprobante.tipo];
  return (
    <section className={styles.tarjeta}>
      <h2 className={styles.titulo}>Comprobante</h2>
      <div className={styles.recuadro}>
        <span className={styles.tipo}>{tipo?.largo}</span>
        <span className={styles.numero}>{comprobante.numero}</span>
        <span className={styles.cliente}>
          {comprobante.nombreRazonSocial}
          {comprobante.docCliente && ` · ${tipo?.documento} ${comprobante.docCliente}`}
        </span>
      </div>
      <dl className={styles.montos}>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatoMoneda(comprobante.subtotal)}</dd>
        </div>
        <div>
          <dt>IGV (18 %)</dt>
          <dd>{formatoMoneda(comprobante.igv)}</dd>
        </div>
        <div className={styles.total}>
          <dt>Total</dt>
          <dd>{formatoMoneda(comprobante.total)}</dd>
        </div>
      </dl>
      <BotonDescargarComprobante comprobante={comprobante} texto="Descargar PDF" anchoCompleto />
      <Link to={RUTAS.comprobanteImprimible(comprobante.id)} target="_blank" className={styles.imprimir}>
        Ver versión para imprimir
      </Link>
    </section>
  );
}
