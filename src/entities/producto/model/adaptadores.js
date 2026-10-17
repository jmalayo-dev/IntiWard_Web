/** ProductoResponse → producto de la UI. `activo` llega con el contrato C5; mientras tanto se asume true. */
export const aProducto = (p) => ({
  ...p,
  precio: Number(p.precio),
  activo: p.activo ?? true,
  especificaciones: p.especificaciones ?? [],
});
