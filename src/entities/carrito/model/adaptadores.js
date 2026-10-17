/** Carrito (propuesta → Evelyn) → carrito de la UI, con la cantidad total de unidades para la insignia. */
export function aCarrito(c) {
  const items = (c?.items ?? []).map((i) => ({ ...i, precio: Number(i.precio), importe: Number(i.importe) }));
  return {
    items,
    total: Number(c?.total ?? 0),
    unidades: items.reduce((s, i) => s + i.cantidad, 0),
  };
}
