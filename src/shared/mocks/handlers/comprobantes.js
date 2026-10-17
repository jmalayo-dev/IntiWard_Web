import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { comprobantes, correlativos } from '../db/comprobantes';
import { ahoraIso, error, latencia, redondear, ruta, rutaParam, siguienteId } from '../lib/respuestas';
import { requiereRol, requiereSesion } from '../lib/sesion';

const SERIES = { BOLETA: 'B001', FACTURA: 'F001' };

/** Lo que hace POST /comprobantes (ruta interna): numeración correlativa por serie, uno por venta. ms-pedidos manda el idUsuario de la venta. */
export function emitirComprobante({ venta, tipo, docCliente, nombreRazonSocial }) {
  const existente = comprobantes.find((c) => c.idVenta === venta.id);
  if (existente) return existente;
  const serie = SERIES[tipo];
  correlativos[serie] += 1;
  const id = siguienteId(comprobantes);
  const comprobante = {
    id,
    idVenta: venta.id,
    idUsuario: venta.idUsuario,
    tipo,
    numero: `${serie}-${String(correlativos[serie]).padStart(8, '0')}`,
    docCliente,
    nombreRazonSocial,
    subtotal: venta.subtotal,
    igv: venta.igv,
    total: venta.total,
    pdfUrl: ENDPOINTS.comprobantes.pdf(id),
    emitidoEn: ahoraIso(),
  };
  comprobantes.push(comprobante);
  return comprobante;
}

/** El dueño se lee del propio comprobante: no hace falta preguntarle a ms-pedidos. */
const esDueno = (usuario, comprobante) => usuario.rol === 'ADMIN' || comprobante.idUsuario === usuario.id;

/** ComprobanteResponse: `idUsuario` es interno y no se devuelve. */
const aComprobanteResponse = ({ idUsuario: _idUsuario, ...comprobante }) => comprobante;

/** PDF mínimo válido, solo para probar la descarga. */
function pdfDeEjemplo(comprobante) {
  const texto = `IntiGuard - ${comprobante.tipo} ${comprobante.numero} - Total S/ ${comprobante.total.toFixed(2)}`;
  const contenido = `BT /F1 14 Tf 72 760 Td (${texto}) Tj ET`;
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const posiciones = objetos.map((obj, i) => {
    const pos = pdf.length;
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
    return pos;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  pdf += posiciones.map((p) => `${String(p).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export const comprobantesHandlers = [
  // Antes que /comprobantes/:id para que "reporte" no se tome como id
  http.get(ruta(ENDPOINTS.comprobantes.reporte), async ({ request }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const params = new URL(request.url).searchParams;
    const desde = params.get('desde') ?? '0000-01-01';
    const hasta = params.get('hasta') ?? '9999-12-31';
    const lista = comprobantes.filter((c) => c.emitidoEn.slice(0, 10) >= desde && c.emitidoEn.slice(0, 10) <= hasta);
    const suma = (campo) => redondear(lista.reduce((s, c) => s + c[campo], 0));
    return HttpResponse.json({
      desde,
      hasta,
      cantidad: lista.length,
      subtotal: suma('subtotal'),
      igv: suma('igv'),
      total: suma('total'),
      comprobantes: lista.map(aComprobanteResponse),
    });
  }),

  http.get(ruta(ENDPOINTS.comprobantes.lista), async ({ request }) => {
    await latencia();
    const [usuario, fallo] = requiereSesion(request);
    if (fallo) return fallo;
    return HttpResponse.json(comprobantes.filter((c) => esDueno(usuario, c)).sort((a, b) => b.id - a.id).map(aComprobanteResponse));
  }),

  http.get(rutaParam(ENDPOINTS.comprobantes.porVenta, 'idVenta'), async ({ request, params }) => {
    await latencia();
    const [usuario, fallo] = requiereSesion(request);
    if (fallo) return fallo;
    const comprobante = comprobantes.find((c) => c.idVenta === Number(params.idVenta));
    if (!comprobante) return error(404, `No hay comprobante para la venta ${params.idVenta}`, request);
    if (!esDueno(usuario, comprobante)) return error(403, 'No tiene permisos para este recurso', request);
    return HttpResponse.json(aComprobanteResponse(comprobante));
  }),

  http.get(rutaParam(ENDPOINTS.comprobantes.pdf), async ({ request, params }) => {
    await latencia();
    const [usuario, fallo] = requiereSesion(request);
    if (fallo) return fallo;
    const comprobante = comprobantes.find((c) => c.id === Number(params.id));
    if (!comprobante) return error(404, `Comprobante ${params.id} no encontrado`, request);
    if (!esDueno(usuario, comprobante)) return error(403, 'No tiene permisos para este recurso', request);
    return new HttpResponse(pdfDeEjemplo(comprobante), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${comprobante.numero}.pdf"` },
    });
  }),

  http.get(rutaParam(ENDPOINTS.comprobantes.detalle), async ({ request, params }) => {
    await latencia();
    const [usuario, fallo] = requiereSesion(request);
    if (fallo) return fallo;
    const comprobante = comprobantes.find((c) => c.id === Number(params.id));
    if (!comprobante) return error(404, `Comprobante ${params.id} no encontrado`, request);
    if (!esDueno(usuario, comprobante)) return error(403, 'No tiene permisos para este recurso', request);
    return HttpResponse.json(aComprobanteResponse(comprobante));
  }),
];
