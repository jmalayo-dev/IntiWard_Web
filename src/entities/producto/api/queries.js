import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listarProductos, obtenerProducto } from './productoApi';

export const productoKeys = {
  todos: ['productos'],
  lista: (filtros) => ['productos', 'lista', filtros],
  detalle: (id) => ['productos', 'detalle', id],
};

export const useProductos = (filtros) =>
  useQuery({ queryKey: productoKeys.lista(filtros), queryFn: () => listarProductos(filtros), placeholderData: keepPreviousData });

export const useProducto = (id) =>
  useQuery({ queryKey: productoKeys.detalle(id), queryFn: () => obtenerProducto(id), enabled: Boolean(id) });
