/**
 * StockResponse: { idProducto, disponible, reservado }. Cantidades de PROTOTIPO_WEB.md §3.
 * Como en ms-inventario, `disponible` ya descuenta lo reservado: el producto 1 tiene 10 unidades físicas,
 * 9 a la venta y 1 reservada por el pedido pendiente #00043.
 */
export const stock = [
  { idProducto: 1, disponible: 9, reservado: 1 },
  { idProducto: 2, disponible: 3, reservado: 0 },
  { idProducto: 3, disponible: 10, reservado: 0 },
  { idProducto: 4, disponible: 0, reservado: 0 },
  { idProducto: 5, disponible: 25, reservado: 0 },
  { idProducto: 6, disponible: 40, reservado: 0 },
  { idProducto: 7, disponible: 5, reservado: 0 },
  { idProducto: 8, disponible: 12, reservado: 0 },
  { idProducto: 9, disponible: 0, reservado: 0 },
];
