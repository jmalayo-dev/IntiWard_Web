import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { destinoTrasLogin, useSesion } from '@/entities/sesion';
import { iniciarSesion } from '../api/loginApi';

/** Inicia sesión, guarda el token y lleva a / (CLIENTE), /admin (ADMIN) o a la página que se pidió antes. */
export function useLogin() {
  const { iniciar } = useSesion();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: iniciarSesion,
    onSuccess: ({ token, rol }) => {
      // Nada de la caché de otra sesión debe sobrevivir
      queryClient.clear();
      iniciar(token);
      navigate(destinoTrasLogin(rol, location.state?.desde), { replace: true });
    },
  });
}
