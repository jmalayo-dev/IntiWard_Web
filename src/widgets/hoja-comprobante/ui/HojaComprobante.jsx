import { TIPO_COMPROBANTE } from '@/entities/comprobante';
import { formatoFecha, formatoMoneda, formatoPedido, montoEnLetras } from '@/shared/lib';
import { Logo } from '@/shared/ui';
import styles from './HojaComprobante.module.css';

// Datos del emisor que salen impresos en el comprobante (PROTOTIPO_WEB.md §4.12)
const EMISOR = { razonSocial: 'IntiGuard S.A.C.', ruc: '20512345678', direccion: 'Av. Javier Prado Este 1234, San Isidro, Lima' };

/**
 * Hoja A4 del comprobante (vista 4.12). Se usa sola para imprimir y dentro del panel lateral de la vista 5.8.
 * `venta` trae las líneas de detalle; los montos se leen del comprobante, no se recalculan.
 */
export function HojaComprobante({ comprobante, venta, compacta = false }) {
  const tipo = TIPO_COMPROBANTE[comprobante.tipo];
  const nombreTipo = comprobante.tipo === 'BOLETA' ? 'boleta de venta electrónica' : 'factura electrónica';
  return (
    <article className={`${styles.hoja} ${compacta ? styles.compacta : ''}`}>
      <header className={styles.cabecera}>
        <div className={styles.emisor}>
          <Logo tamano={compacta ? 26 : 32} />
          <strong>{EMISOR.razonSocial}</strong>
          <span>RUC {EMISOR.ruc}</span>
          <span>{EMISOR.direccion}</span>
        </div>
        <div className={styles.recuadro}>
          <span className={styles.tipo}>{tipo?.titulo}</span>
          <span className={styles.numero}>{comprobante.numero}</span>
        </div>
      </header>

      <dl className={styles.datos}>
        <div>
          <dt>Fecha de emisión:</dt>
          <dd>{formatoFecha(comprobante.emitidoEn)}</dd>
        </div>
        <div>
          <dt>Cliente:</dt>
          <dd>{comprobante.nombreRazonSocial}</dd>
        </div>
        <div>
          <dt>{tipo?.documento}:</dt>
          <dd>{comprobante.docCliente ?? '—'}</dd>
        </div>
        <div>
          <dt>Pedido:</dt>
          <dd>{formatoPedido(comprobante.idVenta)}</dd>
        </div>
      </dl>

      <table className={styles.detalle}>
        <thead>
          <tr>
            <th className={styles.centro}>Cant.</th>
            <th>Descripción</th>
            <th className={styles.derecha}>P. unitario</th>
            <th className={styles.derecha}>Importe</th>
          </tr>
        </thead>
        <tbody>
          {(venta?.detalles ?? []).map((d) => (
            <tr key={d.idProducto}>
              <td className={styles.centro}>{d.cantidad}</td>
              <td>{d.nombreProducto}</td>
              <td className={`${styles.derecha} ${styles.mono} ${styles.gris}`}>{formatoMoneda(d.precioUnitario)}</td>
              <td className={`${styles.derecha} ${styles.mono}`}>{formatoMoneda(d.importe)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className={styles.totales}>
        <div>
          <dt>Op. gravada</dt>
          <dd>{formatoMoneda(comprobante.subtotal)}</dd>
        </div>
        <div>
          <dt>IGV (18 %)</dt>
          <dd>{formatoMoneda(comprobante.igv)}</dd>
        </div>
        <div className={styles.importeTotal}>
          <dt>Importe total</dt>
          <dd>{formatoMoneda(comprobante.total)}</dd>
        </div>
      </dl>

      <p className={styles.letras}>SON: {montoEnLetras(comprobante.total)}</p>

      <footer className={styles.pie}>
        <p>Representación impresa de la {nombreTipo}.</p>
        <strong>Gracias por tu compra</strong>
      </footer>
    </article>
  );
}
