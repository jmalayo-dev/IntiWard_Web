import { ENDPOINTS, http } from '@/shared/api';

export const listarMovimientos = (idProducto) => http.get(ENDPOINTS.movimientos.lista, { params: { idProducto } });
