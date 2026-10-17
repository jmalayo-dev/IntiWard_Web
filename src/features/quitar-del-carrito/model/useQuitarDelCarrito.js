import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quitarItem, carritoKeys } from '@/entities/carrito';

export function useQuitarDelCarrito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idProducto) => quitarItem(idProducto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carritoKeys.todos });
    },
  });
}
