import { useMutation, useQueryClient } from '@tanstack/react-query';
import { desactivarProducto, productoKeys } from '@/entities/producto';

export function useDesactivarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => desactivarProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoKeys.todos });
    },
  });
}
