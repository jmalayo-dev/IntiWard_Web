import { desglosarIgv } from '@/shared/lib';

/**
 * Cruza el carrito con el stock libre: cada línea sabe si está agotada o si pide más de lo que hay.
 * El resumen (vista previa) solo suma las líneas que se pueden comprar; el monto final lo calcula el backend.
 */
export function estadoCarrito(carrito, stock) {
  const lineas = (carrito?.items ?? []).map((item) => {
    const libre = stock?.[item.idProducto]?.libre;
    const agotado = libre === 0;
    const excede = libre !== undefined && !agotado && item.cantidad > libre;
    return { ...item, libre, agotado, excede };
  });
  const comprables = lineas.filter((l) => !l.agotado);
  const montos = desglosarIgv(Math.round(comprables.reduce((s, l) => s + l.importe, 0) * 100) / 100);
  const bloqueado = !lineas.length || lineas.some((l) => l.agotado || l.excede) || !stock;
  return { lineas, comprables, ...montos, bloqueado };
}
