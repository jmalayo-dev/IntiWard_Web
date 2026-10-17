import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editarProducto, productoKeys } from '@/entities/producto';

/** Volver a mostrar un producto inactivo en la tienda (PUT con activo: true). */
export function useActivarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => editarProducto(id, { activo: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoKeys.todos });
    },
  });
}
