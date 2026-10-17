import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RUTAS } from '@/shared/config';
import { registrar } from '../api/registroApi';

/** Crea la cuenta y lleva al login con el aviso de cuenta creada. El 409 lo muestra el formulario en el campo correo. */
export function useRegistro() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: registrar,
    onSuccess: () => navigate(RUTAS.login, { replace: true, state: { cuentaCreada: true } }),
  });
}
