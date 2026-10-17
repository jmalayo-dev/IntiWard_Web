import { ENDPOINTS, http } from '@/shared/api';

/** POST /auth/login → { token, tipo, expiraEnMinutos, rol } */
export const iniciarSesion = ({ correo, password }) => http.post(ENDPOINTS.auth.login, { correo, password });
