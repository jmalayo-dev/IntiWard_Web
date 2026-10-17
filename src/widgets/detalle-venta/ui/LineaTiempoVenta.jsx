import { formatoHora } from '@/shared/lib';
import { Icono } from '@/shared/ui';
import styles from './LineaTiempoVenta.module.css';

/**
 * Pasos de la venta. Cliente: registrado → reservado → comprobante. `completa` (admin) agrega "Venta confirmada".
 * Anulada: termina en un paso rojo. Pendiente: el resto queda en gris.
 */
export function LineaTiempoVenta({ venta, comprobante, completa = false }) {
  const hora = formatoHora(venta.fechaVenta);
  let pasos;
  if (venta.estado === 'ANULADA') {
    pasos = [
      { texto: 'Pedido registrado', hora, estado: 'hecho' },
      { texto: 'Compra anulada: no se realizó ningún cargo', estado: 'error' },
    ];
  } else {
    const confirmada = venta.estado === 'CONFIRMADA';
    pasos = [
      { texto: 'Pedido registrado', hora, estado: 'hecho' },
      { texto: 'Stock reservado', hora, estado: 'hecho' },
      { texto: 'Comprobante emitido', hora: comprobante ? formatoHora(comprobante.emitidoEn) : undefined, estado: confirmada ? 'hecho' : 'pendiente' },
    ];
    if (completa) pasos.push({ texto: 'Venta confirmada', hora: confirmada ? hora : undefined, estado: confirmada ? 'hecho' : 'pendiente' });
  }

  return (
    <ol className={styles.linea} aria-label="Estado del pedido">
      {pasos.map((p, i) => (
        <li key={p.texto} className={`${styles.paso} ${styles[p.estado]} ${i > 0 && pasos[i].estado !== 'pendiente' ? styles.conectado : ''}`}>
          <span className={styles.circulo}>
            <Icono nombre={p.estado === 'error' ? 'cerrar' : p.estado === 'hecho' ? 'check' : 'historial'} tamano={18} grosor={2.5} />
          </span>
          <span className={styles.texto}>{p.texto}</span>
          {p.hora && <span className={styles.hora}>{p.hora}</span>}
          {p.estado === 'pendiente' && <span className={styles.hora}>Pendiente</span>}
        </li>
      ))}
    </ol>
  );
}
