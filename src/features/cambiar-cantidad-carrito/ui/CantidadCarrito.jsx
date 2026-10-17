import { SelectorCantidad } from '@/shared/ui';
import { useCambiarCantidadCarrito } from '../model/useCambiarCantidadCarrito';

/** Selector "− 2 +" de una línea del carrito; no pasa del stock libre. */
export function CantidadCarrito({ idProducto, cantidad, maximo }) {
  const { mutate, isPending } = useCambiarCantidadCarrito();
  return (
    <SelectorCantidad
      valor={cantidad}
      maximo={maximo}
      disabled={isPending}
      etiqueta="Cantidad en el carrito"
      alCambiar={(nueva) => mutate({ idProducto, cantidad: nueva })}
    />
  );
}
