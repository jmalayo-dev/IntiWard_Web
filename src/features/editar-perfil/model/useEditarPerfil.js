import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editarPerfil, usuarioKeys } from '@/entities/usuario';

/** PUT /usuarios/me (propuesta → Galarza): el cliente cambia sus datos, su foto o su contraseña. */
export function useEditarPerfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editarPerfil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuarioKeys.todos });
    },
  });
}
