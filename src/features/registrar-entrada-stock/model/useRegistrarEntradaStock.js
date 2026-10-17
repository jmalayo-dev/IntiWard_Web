import { useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientoKeys } from '@/entities/movimiento';
import { registrarEntrada, stockKeys } from '@/entities/stock';

export function useRegistrarEntradaStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idProducto, cantidad, motivo }) => registrarEntrada({ idProducto, cantidad, motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.todos });
      queryClient.invalidateQueries({ queryKey: movimientoKeys.todos });
    },
  });
}
