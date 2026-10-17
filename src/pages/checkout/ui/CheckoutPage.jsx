import { Link, Navigate } from 'react-router-dom';
import { useCarrito } from '@/entities/carrito';
import { useStocks } from '@/entities/stock';
import { usePerfil } from '@/entities/usuario';
import { FormularioCompra } from '@/features/confirmar-compra';
import { RUTAS } from '@/shared/config';
import { useTitulo } from '@/shared/lib';
import { Aviso, Cargando, Icono, MensajeError } from '@/shared/ui';
import { estadoCarrito, ResumenCarrito } from '@/widgets/resumen-carrito';
import styles from './CheckoutPage.module.css';

const PASOS = ['Carrito', 'Comprobante', 'Confirmación'];

function IndicadorPasos({ actual }) {
  return (
    <ol className={styles.pasos} aria-label="Pasos de la compra">
      {PASOS.map((paso, i) => {
        const estado = i < actual ? 'hecho' : i === actual ? 'actual' : 'pendiente';
        return (
          <li key={paso} className={`${styles.paso} ${styles[estado]}`} aria-current={estado === 'actual' ? 'step' : undefined}>
            <span className={styles.circulo}>{estado === 'hecho' ? <Icono nombre="check" tamano={18} grosor={2.5} /> : i + 1}</span>
            <span>
              {i + 1} {paso}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Vista 4.7 · Confirmar compra (marco simplificado). */
export function CheckoutPage() {
  useTitulo('Confirmar compra');
  const { data: carrito, isLoading, error, refetch } = useCarrito();
  const { data: perfil } = usePerfil();
  const { data: stock } = useStocks(carrito?.items.map((i) => i.idProducto) ?? []);
  const { lineas, subtotal, igv, total, bloqueado } = estadoCarrito(carrito, stock);

  if (error) return <MensajeError error={error} alReintentar={refetch} />;
  if (isLoading) return <Cargando lineas={4} alto={80} />;
  // Sin productos no hay nada que confirmar
  if (!lineas.length) return <Navigate to={RUTAS.carrito} replace />;

  return (
    <div className={styles.checkout}>
      <IndicadorPasos actual={1} />
      {bloqueado && stock && (
        <Aviso tipo="advertencia" className={styles.aviso}>
          Uno de tus productos ya no tiene stock suficiente. <Link to={RUTAS.carrito}>Revisa tu carrito</Link> para continuar.
        </Aviso>
      )}
      <FormularioCompra
        perfil={perfil}
        total={total}
        bloqueado={bloqueado}
        resumen={(boton) => (
          <ResumenCarrito titulo="Resumen del pedido" lineas={lineas.filter((l) => !l.agotado)} subtotal={subtotal} igv={igv} total={total}>
            {boton}
          </ResumenCarrito>
        )}
      />
    </div>
  );
}
