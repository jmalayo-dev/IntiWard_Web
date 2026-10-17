import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearProducto, editarProducto, productoKeys } from '@/entities/producto';

export function useGuardarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...datos }) => (id ? editarProducto(id, datos) : crearProducto(datos)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoKeys.todos });
    },
  });
}
