export const ROLES = { ADMIN: 'ADMIN', CLIENTE: 'CLIENTE' };

export const TEXTO_ROL = { ADMIN: 'Administrador', CLIENTE: 'Cliente' };

/** Estado de la cuenta para la vista 5.10: activo, bloqueado por intentos o inactivo. */
export function estadoCuenta(usuario) {
  if (!usuario.activo) return 'INACTIVO';
  if (usuario.bloqueadoHasta) return 'BLOQUEADO';
  return 'ACTIVO';
}
