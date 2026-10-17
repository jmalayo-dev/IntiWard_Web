import { ENDPOINTS, http } from '@/shared/api';

/** { id, nombre, activo, productos } — `productos` (cantidad de activos) es propuesta → César. */
export const listarMarcas = () => http.get(ENDPOINTS.marcas.lista);

// Escrituras (propuesta → César): las usa la feature guardar-marca-categoria
export const crearMarca = (nombre) => http.post(ENDPOINTS.marcas.lista, { nombre });
export const editarMarca = (id, datos) => http.put(ENDPOINTS.marcas.detalle(id), datos);
