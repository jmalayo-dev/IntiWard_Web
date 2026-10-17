import { aPagina, ENDPOINTS, http } from '@/shared/api';
import { aProducto } from '../model/adaptadores';
import { TAMANO_PAGINA } from '../model/constantes';

/**
 * Filtros: categoria, marca (una o varias), q, precioMin, precioMax, conStock, sort ("precio,asc") e inactivos (solo admin).
 * Los que no son del contrato actual están marcados como propuesta en el mock de catálogo.
 */
export async function listarProductos({ page = 0, size = TAMANO_PAGINA, categoria, marca, q, precioMin, precioMax, conStock, sort, inactivos } = {}) {
  const params = {
    page,
    size,
    categoria,
    marca: Array.isArray(marca) ? marca.join(',') || undefined : marca,
    q,
    precioMin,
    precioMax,
    conStock: conStock || undefined,
    sort,
    inactivos: inactivos || undefined,
  };
  const pagina = aPagina(await http.get(ENDPOINTS.productos.lista, { params }));
  return { ...pagina, items: pagina.items.map(aProducto) };
}

export const obtenerProducto = async (id) => aProducto(await http.get(ENDPOINTS.productos.detalle(id)));

// Escrituras: las usan las features guardar-producto y desactivar-producto
export const crearProducto = (datos) => http.post(ENDPOINTS.productos.lista, datos);
export const editarProducto = (id, datos) => http.put(ENDPOINTS.productos.detalle(id), datos);
export const desactivarProducto = (id) => http.delete(ENDPOINTS.productos.detalle(id));
