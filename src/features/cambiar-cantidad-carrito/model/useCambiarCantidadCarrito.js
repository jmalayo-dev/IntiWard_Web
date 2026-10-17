import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cambiarCantidad, carritoKeys } from '@/entities/carrito';

export function useCambiarCantidadCarrito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idProducto, cantidad }) => cambiarCantidad(idProducto, cantidad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carritoKeys.todos });
    },
  });
}
