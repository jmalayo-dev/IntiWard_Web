/** Insignia dorada redonda con la cantidad de unidades del carrito. */
export function ContadorCarrito({ cantidad }) {
  if (cantidad == null) return null;
  return (
    <span
      aria-hidden="true"
      style={{
        minWidth: 20,
        height: 20,
        padding: '0 6px',
        borderRadius: 999,
        background: 'var(--color-acento)',
        color: 'var(--color-texto)',
        fontSize: 12,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {cantidad}
    </span>
  );
}
