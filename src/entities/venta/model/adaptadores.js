/** VentaResponse (+ detalles, propuesta → Evelyn) → venta de la UI. Los montos se leen, nunca se recalculan. */
export const aVenta = (v) => ({
  ...v,
  subtotal: Number(v.subtotal),
  igv: Number(v.igv),
  total: Number(v.total),
  detalles: (v.detalles ?? []).map((d) => ({ ...d, precioUnitario: Number(d.precioUnitario), importe: Number(d.importe) })),
});
