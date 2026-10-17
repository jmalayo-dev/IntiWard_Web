import { ENDPOINTS, http } from '@/shared/api';
import { aVenta } from '../model/adaptadores';

export const listarVentas = async () => (await http.get(ENDPOINTS.pedidos.lista)).map(aVenta);

export const obtenerVenta = async (id) => aVenta(await http.get(ENDPOINTS.pedidos.detalle(id)));

// Escritura: la usa la feature confirmar-compra. El idUsuario lo saca el backend del token.
export const checkout = async ({ tipoComprobante, docCliente, nombreRazonSocial }) =>
  aVenta(await http.post(ENDPOINTS.pedidos.checkout, { tipoComprobante, docCliente, nombreRazonSocial }));
