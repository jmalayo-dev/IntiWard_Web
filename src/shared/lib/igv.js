/** Igual que Venta.asignarMontos del backend: los precios incluyen IGV. Solo para la vista previa del carrito. */
export function desglosarIgv(total) {
  const subtotal = Math.round((total / 1.18) * 100) / 100;
  const igv = Math.round((total - subtotal) * 100) / 100;
  return { subtotal, igv, total };
}
