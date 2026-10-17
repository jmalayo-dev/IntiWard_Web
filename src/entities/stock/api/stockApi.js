import { ENDPOINTS, http } from '@/shared/api';

export const obtenerStock = (idProducto) => http.get(ENDPOINTS.stock.detalle(idProducto));

/** Varios a la vez (propuesta → Arévalo). Sin ids: el stock de todos los productos. */
export const listarStock = (ids) => http.get(ENDPOINTS.stock.lista, { params: { ids: ids?.length ? ids.join(',') : undefined } });

// Escrituras: las usan las features registrar-entrada-stock y ajustar-stock
export const registrarEntrada = ({ idProducto, cantidad, motivo }) => http.post(ENDPOINTS.stock.entrada, { idProducto, cantidad, motivo });
export const ajustarStock = (idProducto, { disponible, motivo }) => http.put(ENDPOINTS.stock.detalle(idProducto), { disponible, motivo });
