import { estaVencido, leerClaims } from '@/shared/lib/jwt';
import { usuarios } from '../db/usuarios';
import { error } from './respuestas';

/** Usuario del header Authorization, o null si no hay token válido. */
export function usuarioDelToken(request) {
  const cabecera = request.headers.get('Authorization') ?? '';
  if (!cabecera.startsWith('Bearer ')) return null;
  const claims = leerClaims(cabecera.slice(7));
  if (!claims || estaVencido(claims)) return null;
  const usuario = usuarios.find((u) => u.id === claims.idUsuario);
  return usuario?.activo ? usuario : null;
}

/** [usuario, null] si hay sesión; [null, respuesta 401] si no. */
export function requiereSesion(request) {
  const usuario = usuarioDelToken(request);
  if (!usuario) return [null, error(401, 'Token ausente o inválido', request)];
  return [usuario, null];
}

/** [usuario, null] si tiene el rol; [null, 401 / 403] si no. */
export function requiereRol(request, rol) {
  const [usuario, fallo] = requiereSesion(request);
  if (fallo) return [null, fallo];
  if (usuario.rol !== rol) return [null, error(403, 'No tiene permisos para este recurso', request)];
  return [usuario, null];
}
