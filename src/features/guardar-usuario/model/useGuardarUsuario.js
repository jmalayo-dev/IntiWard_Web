import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearUsuario, editarUsuario, usuarioKeys } from '@/entities/usuario';

export function useGuardarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...datos }) => (id ? editarUsuario(id, datos) : crearUsuario(datos)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuarioKeys.todos });
    },
  });
}
