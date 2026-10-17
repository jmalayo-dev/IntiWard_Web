import { ventas } from './ventas';

const SERIES = { BOLETA: 'B001', FACTURA: 'F001' };

/** Último correlativo emitido por serie (serie_correlativo de ms-comprobantes). */
export const correlativos = { B001: 0, F001: 0 };

/**
 * Uno por cada venta confirmada, numerado en orden de fecha. Guarda `idUsuario` (copiado de la venta, como la
 * columna comprobante.id_usuario de ms-comprobantes) para saber el dueño; no sale en la respuesta.
 */
export const comprobantes = ventas
  .filter((v) => v.estado === 'CONFIRMADA')
  .map((v, i) => {
    const serie = SERIES[v.tipoComprobante];
    correlativos[serie] += 1;
    return {
      id: i + 1,
      idVenta: v.id,
      idUsuario: v.idUsuario,
      tipo: v.tipoComprobante,
      numero: `${serie}-${String(correlativos[serie]).padStart(8, '0')}`,
      docCliente: v.docCliente,
      nombreRazonSocial: v.nombreRazonSocial,
      subtotal: v.subtotal,
      igv: v.igv,
      total: v.total,
      pdfUrl: `/comprobantes/${i + 1}/pdf`,
      emitidoEn: v.fechaVenta,
    };
  });
