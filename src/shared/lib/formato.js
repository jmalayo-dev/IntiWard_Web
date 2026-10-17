const moneda = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1199 → "S/ 1,199.00" (formato de PROTOTIPO_WEB.md §1.1). */
export const formatoMoneda = (monto) => `S/ ${moneda.format(Number(monto ?? 0))}`;

/** "2026-10-15T14:35:00" → "15/10/2026" */
export function formatoFecha(iso) {
  if (!iso) return '';
  const [fecha] = iso.split('T');
  const [a, m, d] = fecha.split('-');
  return `${d}/${m}/${a}`;
}

/** "2026-10-15T14:35:00" → "15/10/2026 14:35" */
export function formatoFechaHora(iso) {
  if (!iso) return '';
  const hora = iso.split('T')[1]?.slice(0, 5) ?? '';
  return `${formatoFecha(iso)} ${hora}`.trim();
}

/** 42 → "#00042" */
export const formatoPedido = (id) => `#${String(id).padStart(5, '0')}`;

/** "Ana", "Torres" → "AT" */
export const iniciales = (nombres = '', apellidos = '') =>
  `${nombres.trim()[0] ?? ''}${apellidos.trim()[0] ?? ''}`.toUpperCase();
