import { useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientoKeys } from '@/entities/movimiento';
import { ajustarStock, stockKeys } from '@/entities/stock';

export function useAjustarStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idProducto, disponible, motivo }) => ajustarStock(idProducto, { disponible, motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.todos });
      queryClient.invalidateQueries({ queryKey: movimientoKeys.todos });
    },
  });
}
