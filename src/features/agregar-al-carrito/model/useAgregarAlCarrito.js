import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agregarItem, carritoKeys } from '@/entities/carrito';

export function useAgregarAlCarrito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idProducto, cantidad = 1 }) => agregarItem(idProducto, cantidad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carritoKeys.todos });
    },
  });
}
