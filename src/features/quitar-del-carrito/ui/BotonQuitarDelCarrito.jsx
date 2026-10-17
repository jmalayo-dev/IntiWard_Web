import { Icono } from '@/shared/ui';
import { useQuitarDelCarrito } from '../model/useQuitarDelCarrito';
import styles from './BotonQuitarDelCarrito.module.css';

export function BotonQuitarDelCarrito({ idProducto, nombre }) {
  const { mutate, isPending } = useQuitarDelCarrito();
  return (
    <button type="button" className={styles.boton} onClick={() => mutate(idProducto)} disabled={isPending} aria-label={`Quitar ${nombre} del carrito`}>
      <Icono nombre="papelera" />
    </button>
  );
}
