import { useQuery } from '@tanstack/react-query';
import { listarComprobantes, obtenerComprobante, obtenerComprobanteDeVenta, obtenerReporte } from './comprobanteApi';

export const comprobanteKeys = {
  todos: ['comprobantes'],
  lista: () => ['comprobantes', 'lista'],
  detalle: (id) => ['comprobantes', 'detalle', id],
  deVenta: (idVenta) => ['comprobantes', 'venta', idVenta],
  reporte: (rango) => ['comprobantes', 'reporte', rango],
};

export const useComprobantes = () => useQuery({ queryKey: comprobanteKeys.lista(), queryFn: listarComprobantes });

export const useComprobante = (id) =>
  useQuery({ queryKey: comprobanteKeys.detalle(id), queryFn: () => obtenerComprobante(id), enabled: Boolean(id) });

export const useComprobanteDeVenta = (idVenta) =>
  useQuery({ queryKey: comprobanteKeys.deVenta(idVenta), queryFn: () => obtenerComprobanteDeVenta(idVenta), enabled: Boolean(idVenta) });

export const useReporte = (rango) =>
  useQuery({ queryKey: comprobanteKeys.reporte(rango), queryFn: () => obtenerReporte(rango), enabled: Boolean(rango?.desde && rango?.hasta) });
