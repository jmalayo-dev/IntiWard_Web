import { ENDPOINTS, http } from '@/shared/api';

/** POST /auth/registro: el backend asigna siempre el rol CLIENTE. */
export const registrar = ({ nombres, apellidos, correo, telefono, direccion, password }) =>
  http.post(ENDPOINTS.auth.registro, { nombres, apellidos, correo, telefono, direccion, password });
