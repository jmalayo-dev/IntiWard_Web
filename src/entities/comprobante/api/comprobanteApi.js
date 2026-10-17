import { ENDPOINTS, http } from '@/shared/api';
import { aComprobante, aReporte } from '../model/adaptadores';

export const listarComprobantes = async () => (await http.get(ENDPOINTS.comprobantes.lista)).map(aComprobante);

export const obtenerComprobante = async (id) => aComprobante(await http.get(ENDPOINTS.comprobantes.detalle(id)));

export const obtenerComprobanteDeVenta = async (idVenta) => aComprobante(await http.get(ENDPOINTS.comprobantes.porVenta(idVenta)));

export const obtenerReporte = async ({ desde, hasta }) => aReporte(await http.get(ENDPOINTS.comprobantes.reporte, { params: { desde, hasta } }));

/** El PDF como Blob; lo usa la feature descargar-comprobante. */
export const descargarPdf = (id) => http.get(ENDPOINTS.comprobantes.pdf(id), { responseType: 'blob' });
