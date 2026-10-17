import { RUTAS } from '@/shared/config';

/**
 * A dónde va alguien al iniciar sesión: a la página que pidió antes (si es de su rol)
 * o a su inicio: /admin para ADMIN, / para CLIENTE.
 */
export function destinoTrasLogin(rol, desde) {
  const esRutaAdmin = desde?.startsWith(RUTAS.admin);
  if (rol === 'ADMIN') return esRutaAdmin ? desde : RUTAS.admin;
  return desde && !esRutaAdmin ? desde : RUTAS.inicio;
}
