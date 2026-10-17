import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '@/entities/sesion';
import { RUTAS } from '@/shared/config';

/**
 * Borra el token y la caché de react-query, y lleva a `destino` (por defecto, la tienda).
 * Hacia la tienda, primero navega y después cierra la sesión: si no, la guarda de una página privada
 * (por ejemplo /perfil) mandaría al login. Hacia el login es al revés: con sesión, el login redirige al inicio.
 */
export function useLogout({ destino = RUTAS.inicio } = {}) {
  const { cerrar } = useSesion();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    if (destino === RUTAS.login) {
      cerrar();
      queryClient.clear();
      navigate(destino, { replace: true });
      return;
    }
    // flushSync: la página nueva queda montada antes de cerrar la sesión
    await navigate(destino, { replace: true, flushSync: true });
    cerrar();
    queryClient.clear();
  };
}
