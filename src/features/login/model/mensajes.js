/** Texto que ve el usuario según el ApiError del login (ARQUITECTURA_WEB.md §9). */
export function avisoDeError(error) {
  if (!error) return null;
  switch (error.status) {
    case 401:
      // El mismo mensaje si el correo no existe: no se revela qué dato falló
      return { tipo: 'error', texto: 'Correo o contraseña incorrectos.' };
    case 423:
      return {
        tipo: 'advertencia',
        icono: 'candado',
        texto: 'Tu cuenta está bloqueada por 15 minutos por varios intentos fallidos. Intenta de nuevo más tarde.',
        bloqueada: true,
      };
    case 0:
      return { tipo: 'error', texto: 'No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.' };
    default:
      return { tipo: 'error', texto: error.message || 'Ocurrió un error inesperado' };
  }
}
