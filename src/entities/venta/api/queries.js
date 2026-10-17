import { useQuery } from '@tanstack/react-query';
import { listarVentas, obtenerVenta } from './ventaApi';

export const ventaKeys = {
  todos: ['ventas'],
  lista: () => ['ventas', 'lista'],
  detalle: (id) => ['ventas', 'detalle', id],
};

export const useVentas = () => useQuery({ queryKey: ventaKeys.lista(), queryFn: listarVentas });

export const useVenta = (id) => useQuery({ queryKey: ventaKeys.detalle(id), queryFn: () => obtenerVenta(id), enabled: Boolean(id) });
