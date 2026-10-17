/** ComprobanteResponse → comprobante de la UI. */
export const aComprobante = (c) => ({
  ...c,
  subtotal: Number(c.subtotal),
  igv: Number(c.igv),
  total: Number(c.total),
});

/** Reporte (propuesta → Galarza) → reporte de la UI. */
export const aReporte = (r) => ({
  ...r,
  subtotal: Number(r.subtotal),
  igv: Number(r.igv),
  total: Number(r.total),
  comprobantes: (r.comprobantes ?? []).map(aComprobante),
});
