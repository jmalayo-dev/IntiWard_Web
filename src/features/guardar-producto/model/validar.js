/** Reglas de la vista 5.3 (las mismas que valida catálogo). */
export function validarProducto(datos) {
  const errores = {};
  if (!datos.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!(Number(datos.precio) > 0)) errores.precio = 'El precio debe ser mayor que 0';
  if (!datos.idMarca) errores.idMarca = 'Elige una marca';
  if (!datos.idCategoria) errores.idCategoria = 'Elige una categoría';
  if (datos.imagenUrl.trim() && !/^(https?:\/\/|\/)\S+$/.test(datos.imagenUrl.trim())) errores.imagenUrl = 'Ingresa una URL válida';
  return errores;
}

/** 400 de catálogo ("nombre: es obligatorio") → errores por campo. */
export function camposDelServidor(error) {
  if (error?.status !== 400) return {};
  return Object.fromEntries(
    (error.detalles ?? []).map((d) => {
      const [campo, ...resto] = d.split(':');
      return [campo.trim(), resto.join(':').trim()];
    }),
  );
}
