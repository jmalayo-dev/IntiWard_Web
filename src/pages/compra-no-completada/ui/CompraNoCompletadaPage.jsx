import { Link, Navigate, useLocation } from 'react-router-dom';
import { useProducto } from '@/entities/producto';
import { RUTAS } from '@/shared/config';
import { useTitulo } from '@/shared/lib';
import { TarjetaResultado } from '@/shared/ui';
import styles from './CompraNoCompletadaPage.module.css';

/** "idProducto: 7" (detalles del 409) → 7 */
const idDelDetalle = (detalles = []) => Number(detalles.find((d) => d.startsWith('idProducto'))?.split(':')[1]) || null;

/**
 * Vista 4.9 · Compra no completada. Llega desde confirmar-compra con el motivo:
 * 'stock' (409: se agotó un producto) o 'servicio' (503: no se pudo emitir el comprobante).
 */
export function CompraNoCompletadaPage() {
  useTitulo('Compra no completada');
  const { state } = useLocation();
  const idProducto = state?.motivo === 'stock' ? idDelDetalle(state.detalles) : null;
  const { data: producto } = useProducto(idProducto);

  // Sin motivo (por ejemplo, entrando directo a la URL) no hay nada que explicar
  if (!state?.motivo) return <Navigate to={RUTAS.carrito} replace />;

  if (state.motivo === 'stock') {
    return (
      <TarjetaResultado
        icono="caja"
        tono="advertencia"
        titulo="Uno de tus productos se agotó"
        acciones={
          <Link to={RUTAS.carrito} className={styles.botonPrimario}>
            Volver al carrito
          </Link>
        }
      >
        <p>
          Mientras confirmabas, se vendieron las últimas unidades de <strong>{producto?.nombre ?? 'uno de tus productos'}</strong>. No se hizo ningún cargo.
        </p>
      </TarjetaResultado>
    );
  }

  return (
    <TarjetaResultado
      icono="reciboTachado"
      tono="error"
      titulo="No pudimos completar tu compra"
      acciones={
        <>
          <Link to={RUTAS.checkout} className={styles.botonPrimario}>
            Intentar de nuevo
          </Link>
          <Link to={RUTAS.carrito} className={styles.botonSecundario}>
            Volver al carrito
          </Link>
        </>
      }
    >
      <p className={styles.texto}>
        Tuvimos un problema al emitir tu comprobante. <strong>No se realizó ningún cargo</strong> y los productos volvieron a estar disponibles. Intenta de nuevo en
        unos minutos.
      </p>
    </TarjetaResultado>
  );
}
