const CAMPOS = ['nombres', 'apellidos', 'correo', 'telefono', 'direccion', 'password'];

/**
 * ApiError del registro → { campos: { correo: '...' }, aviso: '...' }.
 * 409 va en el campo correo (lo dibuja el formulario); un 400 marca los campos de `detalles` ("correo: no tiene formato de correo").
 */
export function leerErrorRegistro(error) {
  if (!error) return { campos: {}, aviso: null };
  if (error.status === 409) return { campos: { correo: 'duplicado' }, aviso: null };
  if (error.status === 400 && error.detalles?.length) {
    const campos = {};
    for (const detalle of error.detalles) {
      const [campo, ...resto] = String(detalle).split(':');
      const mensaje = resto.join(':').trim();
      if (CAMPOS.includes(campo.trim()) && mensaje) campos[campo.trim()] = mensaje[0].toUpperCase() + mensaje.slice(1);
    }
    if (Object.keys(campos).length) return { campos, aviso: null };
  }
  if (error.status === 0) return { campos: {}, aviso: 'No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.' };
  return { campos: {}, aviso: error.message || 'Ocurrió un error inesperado' };
}
