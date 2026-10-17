import { Link, useParams } from 'react-router-dom';
import { useComprobante } from '@/entities/comprobante';
import { useSesion } from '@/entities/sesion';
import { useVenta } from '@/entities/venta';
import { BotonDescargarComprobante } from '@/features/descargar-comprobante';
import { RUTAS } from '@/shared/config';
import { useTitulo } from '@/shared/lib';
import { Boton, Cargando, Icono, MensajeError } from '@/shared/ui';
import { HojaComprobante } from '@/widgets/hoja-comprobante';
import { PantallaError } from '@/widgets/pantalla-error';
import styles from './ComprobanteImprimiblePage.module.css';

/** Vista 4.12 · Comprobante imprimible (sin marco). La barra de acciones no sale al imprimir. */
export function ComprobanteImprimiblePage() {
  const { id } = useParams();
  const { esAdmin } = useSesion();
  const { data: comprobante, isLoading, error, refetch } = useComprobante(id);
  const { data: venta } = useVenta(comprobante?.idVenta);
  useTitulo(comprobante ? comprobante.numero : 'Comprobante');

  if (error?.status === 404 || error?.status === 403) return <PantallaError tipo={error.status} />;

  return (
    <div className={styles.fondo}>
      <div className={styles.acciones}>
        <Link to={esAdmin ? RUTAS.adminComprobantes : comprobante ? RUTAS.miPedido(comprobante.idVenta) : RUTAS.misPedidos} className={styles.volver}>
          <Icono nombre="flechaIzquierda" tamano={18} /> Volver
        </Link>
        <div className={styles.botones}>
          <BotonDescargarComprobante comprobante={comprobante} texto="Descargar PDF" variante="secundario" />
          <Boton onClick={() => window.print()} disabled={!comprobante}>
            Imprimir
          </Boton>
        </div>
      </div>
      {error ? (
        <MensajeError error={error} alReintentar={refetch} />
      ) : isLoading ? (
        <div className={styles.cargando}>
          <Cargando lineas={8} alto={32} />
        </div>
      ) : (
        <HojaComprobante comprobante={comprobante} venta={venta} />
      )}
    </div>
  );
}
