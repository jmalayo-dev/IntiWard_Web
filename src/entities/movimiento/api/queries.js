import { useQuery } from '@tanstack/react-query';
import { listarMovimientos } from './movimientoApi';

export const movimientoKeys = {
  todos: ['movimientos'],
  lista: (idProducto) => ['movimientos', idProducto ?? 'todos'],
};

export const useMovimientos = (idProducto) =>
  useQuery({ queryKey: movimientoKeys.lista(idProducto), queryFn: () => listarMovimientos(idProducto) });
