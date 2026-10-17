import { useMutation, useQueryClient } from '@tanstack/react-query';
import { desactivarUsuario, usuarioKeys } from '@/entities/usuario';

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => desactivarUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuarioKeys.todos });
    },
  });
}
