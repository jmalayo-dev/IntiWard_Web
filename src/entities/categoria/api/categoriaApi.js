import { ENDPOINTS, http } from '@/shared/api';

/** { id, nombre, activo, productos } — `productos` (cantidad de activos) es propuesta → César. */
export const listarCategorias = () => http.get(ENDPOINTS.categorias.lista);

// Escrituras (propuesta → César): las usa la feature guardar-marca-categoria
export const crearCategoria = (nombre) => http.post(ENDPOINTS.categorias.lista, { nombre });
export const editarCategoria = (id, datos) => http.put(ENDPOINTS.categorias.detalle(id), datos);
