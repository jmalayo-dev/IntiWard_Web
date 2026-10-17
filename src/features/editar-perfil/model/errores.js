/** 400 con detalles "campo: mensaje" → { campo: mensaje }; lo demás, un aviso. */
export function leerError(error) {
  if (!error) return { campos: {}, aviso: null };
  const campos = {};
  if (error.status === 400) {
    for (const detalle of error.detalles ?? []) {
      const [campo, ...resto] = detalle.split(':');
      campos[campo.trim()] = resto.join(':').trim();
    }
  }
  return { campos, aviso: Object.keys(campos).length ? null : error.message };
}
