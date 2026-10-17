import { useQuery } from '@tanstack/react-query';
import { listarStock, obtenerStock } from './stockApi';

export const stockKeys = {
  todos: ['stock'],
  detalle: (idProducto) => ['stock', idProducto],
  lista: (ids) => ['stock', 'lista', ids ?? 'todos'],
};

// El stock cambia con cada compra de cualquier cliente: siempre se vuelve a pedir al montar (staleTime 0)
export const useStock = (idProducto) =>
  useQuery({ queryKey: stockKeys.detalle(idProducto), queryFn: () => obtenerStock(idProducto), enabled: Boolean(idProducto), staleTime: 0 });

/**
 * Stock de varios productos en una llamada, como mapa { [idProducto]: { disponible, reservado, libre } }.
 * `ids` vacío o ausente: todos (panel de stock). `libre` = disponible − reservado: lo que se puede vender.
 */
export function useStocks(ids, { habilitado = true } = {}) {
  const orden = ids ? [...ids].sort((a, b) => a - b) : undefined;
  return useQuery({
    queryKey: stockKeys.lista(orden),
    queryFn: () => listarStock(orden),
    enabled: habilitado && (!ids || ids.length > 0),
    staleTime: 0,
    select: (lista) => Object.fromEntries(lista.map((s) => [s.idProducto, { ...s, libre: Math.max(0, s.disponible - s.reservado) }])),
  });
}
