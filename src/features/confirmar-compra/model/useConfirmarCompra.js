import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { carritoKeys } from '@/entities/carrito';
import { stockKeys } from '@/entities/stock';
import { checkout, ventaKeys } from '@/entities/venta';
import { RUTAS } from '@/shared/config';

/**
 * POST /pedidos/checkout.
 * 201 → compra confirmada · 409 (stock) / 503 (comprobantes) → compra no completada con el motivo.
 * Un 400 se queda en el formulario para marcar los campos.
 */
export function useConfirmarCompra() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: checkout,
    onSuccess: (venta) => {
      queryClient.invalidateQueries({ queryKey: carritoKeys.todos });
      queryClient.invalidateQueries({ queryKey: stockKeys.todos });
      queryClient.invalidateQueries({ queryKey: ventaKeys.todos });
      navigate(RUTAS.compraConfirmada(venta.id), { replace: true });
    },
    onError: (error) => {
      if (error.status === 409 || error.status === 503) {
        queryClient.invalidateQueries({ queryKey: ventaKeys.todos });
        queryClient.invalidateQueries({ queryKey: stockKeys.todos });
        navigate(RUTAS.compraNoCompletada, {
          replace: true,
          // En el 409, detalles trae "idProducto: 7": la vista 4.9 muestra el nombre del producto que se agotó
          state: { motivo: error.status === 409 ? 'stock' : 'servicio', mensaje: error.message, detalles: error.detalles },
        });
      }
    },
  });
}
