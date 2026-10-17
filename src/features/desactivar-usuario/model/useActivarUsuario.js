import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editarUsuario, usuarioKeys } from '@/entities/usuario';

/** Reactivar una cuenta (PUT con activo: true). En el mock también levanta el bloqueo por intentos. */
export function useActivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => editarUsuario(id, { activo: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuarioKeys.todos });
    },
  });
}
