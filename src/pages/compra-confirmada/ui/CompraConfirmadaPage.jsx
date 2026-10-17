import { Link, useParams } from 'react-router-dom';
import { TIPO_COMPROBANTE, useComprobanteDeVenta } from '@/entities/comprobante';
import { usePerfil } from '@/entities/usuario';
import { useVenta } from '@/entities/venta';
import { BotonDescargarComprobante } from '@/features/descargar-comprobante';
import { RUTAS } from '@/shared/config';
import { formatoFechaHora, formatoMoneda, formatoPedido, useTitulo } from '@/shared/lib';
import { Cargando, MensajeError, TarjetaResultado } from '@/shared/ui';
import styles from './CompraConfirmadaPage.module.css';

/** Vista 4.8 · Compra confirmada. */
export function CompraConfirmadaPage() {
  useTitulo('Compra confirmada');
  const { idVenta } = useParams();
  const { data: venta, isLoading, error, refetch } = useVenta(idVenta);
  const { data: comprobante } = useComprobanteDeVenta(venta?.estado === 'CONFIRMADA' ? idVenta : null);
  const { data: perfil } = usePerfil();

  if (error) return <MensajeError error={error} alReintentar={refetch} />;
  if (isLoading) return <Cargando lineas={5} alto={32} />;

  return (
    <TarjetaResultado
      icono="check"
      titulo="¡Compra confirmada!"
      pie={
        <Link to={RUTAS.catalogo} className={styles.seguir}>
          Seguir comprando
        </Link>
      }
      acciones={
        <>
          <BotonDescargarComprobante comprobante={comprobante} />
          <Link to={RUTAS.miPedido(venta.id)} className={styles.botonSecundario}>
            Ver mi pedido
          </Link>
        </>
      }
    >
      <p className={styles.gracias}>Gracias{perfil ? `, ${perfil.nombres}` : ''}. Tu pedido ya está registrado.</p>
      <dl className={styles.datos}>
        <div>
          <dt>Pedido</dt>
          <dd>{formatoPedido(venta.id)}</dd>
        </div>
        <div>
          <dt>Fecha</dt>
          <dd>{formatoFechaHora(venta.fechaVenta)}</dd>
        </div>
        <div>
          <dt>Comprobante</dt>
          <dd className={styles.mono}>{comprobante ? `${TIPO_COMPROBANTE[comprobante.tipo]?.texto} ${comprobante.numero}` : '…'}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatoMoneda(venta.total)}</dd>
        </div>
      </dl>
    </TarjetaResultado>
  );
}
