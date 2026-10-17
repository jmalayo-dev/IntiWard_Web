import { useParams } from 'react-router-dom';
import { useComprobanteDeVenta } from '@/entities/comprobante';
import { EstadoVentaInsignia, useVenta } from '@/entities/venta';
import { BotonDescargarComprobante } from '@/features/descargar-comprobante';
import { RUTAS } from '@/shared/config';
import { formatoFecha, formatoHora, formatoPedido, useTitulo } from '@/shared/lib';
import { Cargando, MensajeError, Migas } from '@/shared/ui';
import { ComprobanteVenta, LineaTiempoVenta, ProductosVenta } from '@/widgets/detalle-venta';
import { PantallaError } from '@/widgets/pantalla-error';
import styles from './PedidoDetallePage.module.css';

/** Vista 4.11 · Detalle de mi pedido. Un pedido ajeno responde 403 y uno inexistente 404. */
export function PedidoDetallePage() {
  const { id } = useParams();
  const { data: venta, isLoading, error, refetch } = useVenta(id);
  const { data: comprobante } = useComprobanteDeVenta(venta?.estado === 'CONFIRMADA' ? id : null);
  useTitulo(`Pedido ${formatoPedido(id)}`);

  if (error?.status === 404 || error?.status === 403) return <PantallaError tipo={error.status} />;
  if (error) return <MensajeError error={error} alReintentar={refetch} />;
  if (isLoading) return <Cargando lineas={5} alto={48} />;

  return (
    <div className={styles.detalle}>
      <Migas items={[{ texto: 'Mis pedidos', a: RUTAS.misPedidos }, { texto: `Pedido ${formatoPedido(venta.id)}` }]} />
      <div className={styles.encabezado}>
        <div>
          <div className={styles.tituloFila}>
            <h1 className={styles.titulo}>Pedido {formatoPedido(venta.id)}</h1>
            <EstadoVentaInsignia estado={venta.estado} />
          </div>
          <p className={styles.fecha}>
            Realizado el {formatoFecha(venta.fechaVenta)} a las {formatoHora(venta.fechaVenta)}
          </p>
        </div>
        {comprobante && <BotonDescargarComprobante comprobante={comprobante} variante="secundario" />}
      </div>
      <LineaTiempoVenta venta={venta} comprobante={comprobante} />
      <div className={`${styles.columnas} ${comprobante ? '' : styles.unaColumna}`}>
        <ProductosVenta venta={venta} />
        {comprobante && <ComprobanteVenta comprobante={comprobante} />}
      </div>
    </div>
  );
}
