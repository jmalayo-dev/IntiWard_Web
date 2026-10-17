import { Link, useParams } from 'react-router-dom';
import { useComprobanteDeVenta } from '@/entities/comprobante';
import { AvatarIniciales, useUsuario } from '@/entities/usuario';
import { EstadoVentaInsignia, useVenta } from '@/entities/venta';
import { BotonDescargarComprobante } from '@/features/descargar-comprobante';
import { RUTAS } from '@/shared/config';
import { formatoFecha, formatoHora, formatoPedido, useTitulo } from '@/shared/lib';
import { Cargando, MensajeError, Tarjeta } from '@/shared/ui';
import { ComprobanteVenta, LineaTiempoVenta, ProductosVenta } from '@/widgets/detalle-venta';
import { PantallaError } from '@/widgets/pantalla-error';
import styles from './AdminVentaDetallePage.module.css';

/**
 * Vista 5.7 · Detalle de venta (sin diseño de Stitch: es el detalle 4.11 dentro del panel,
 * con la tarjeta "Cliente" y la línea de tiempo completa, como pide PROTOTIPO_WEB.md §5.7).
 */
export function AdminVentaDetallePage() {
  const { id } = useParams();
  const { data: venta, isLoading, error, refetch } = useVenta(id);
  const { data: comprobante } = useComprobanteDeVenta(venta?.estado === 'CONFIRMADA' ? id : null);
  const { data: cliente } = useUsuario(venta?.idUsuario);
  useTitulo(`Venta ${formatoPedido(id)}`);

  if (error?.status === 404) return <PantallaError tipo={404} />;
  if (error) return <MensajeError error={error} alReintentar={refetch} />;
  if (isLoading) return <Cargando lineas={5} alto={48} />;

  return (
    <div className={styles.detalle}>
      <div className={styles.encabezado}>
        <div>
          <div className={styles.tituloFila}>
            <h1 className={styles.titulo}>Pedido {formatoPedido(venta.id)}</h1>
            <EstadoVentaInsignia estado={venta.estado} />
          </div>
          <p className={styles.gris}>
            Realizado el {formatoFecha(venta.fechaVenta)} a las {formatoHora(venta.fechaVenta)}
          </p>
        </div>
        {comprobante && <BotonDescargarComprobante comprobante={comprobante} variante="secundario" />}
      </div>

      <LineaTiempoVenta venta={venta} comprobante={comprobante} completa />

      <div className={styles.columnas}>
        <ProductosVenta venta={venta} nota="Precios del día de la compra." />
        <div className={styles.lateral}>
          <Tarjeta titulo="Cliente">
            {cliente ? (
              <div className={styles.cliente}>
                <div className={styles.quien}>
                  <AvatarIniciales iniciales={cliente.iniciales} fotoUrl={cliente.fotoUrl} tono="suave" tamano={44} />
                  <div>
                    <strong>{cliente.nombreCompleto}</strong>
                    <span className={styles.gris}>{cliente.correo}</span>
                  </div>
                </div>
                <dl className={styles.datos}>
                  <div>
                    <dt>Teléfono</dt>
                    <dd>{cliente.telefono || '—'}</dd>
                  </div>
                  <div>
                    <dt>Dirección</dt>
                    <dd>{cliente.direccion || '—'}</dd>
                  </div>
                </dl>
                <Link to={RUTAS.adminUsuarios} state={{ buscar: cliente.correo }} className={styles.enlace}>
                  Ver usuario
                </Link>
              </div>
            ) : (
              <Cargando lineas={3} />
            )}
          </Tarjeta>
          {comprobante && <ComprobanteVenta comprobante={comprobante} />}
        </div>
      </div>
    </div>
  );
}
