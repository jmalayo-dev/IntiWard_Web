import { formatoMoneda } from '@/shared/lib';

/** Precio con el formato "S/ 1,199.00". `tamano`: 20 en tarjeta, 32 en detalle. */
export function PrecioTexto({ precio, tamano = 20 }) {
  return <span style={{ fontSize: tamano, fontWeight: 700, color: 'var(--color-texto)' }}>{formatoMoneda(precio)}</span>;
}
