import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listarProductos, obtenerProducto } from './productoApi';

export const productoKeys = {
  todos: ['productos'],
  lista: (filtros) => ['productos', 'lista', filtros],
  detalle: (id) => ['productos', 'detalle', id],
};

/** `habilitado: false` no pide nada (por ejemplo, el buscador mientras el texto es muy corto). */
export const useProductos = (filtros, { habilitado = true } = {}) =>
  useQuery({ queryKey: productoKeys.lista(filtros), queryFn: () => listarProductos(filtros), placeholderData: keepPreviousData, enabled: habilitado });

export const useProducto = (id) =>
  useQuery({ queryKey: productoKeys.detalle(id), queryFn: () => obtenerProducto(id), enabled: Boolean(id) });
