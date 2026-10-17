const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const p = (n) => String(n).padStart(2, '0');

/** Date → "2026-10-15" (fecha local, como LocalDate). */
export const aFechaIso = (d) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;

/** "2026-10-15" o "2026-10-15T14:35:00" → Date local. */
export function desdeIso(iso) {
  const [fecha, hora = '00:00:00'] = iso.split('T');
  const [a, m, d] = fecha.split('-').map(Number);
  const [h, mi, s] = hora.split(':').map(Number);
  return new Date(a, m - 1, d, h, mi, s || 0);
}

export const hoyIso = () => aFechaIso(new Date());

export function sumarDias(iso, dias) {
  const d = desdeIso(iso);
  d.setDate(d.getDate() + dias);
  return aFechaIso(d);
}

/** Días entre dos fechas ISO, contando ambos extremos. */
export const diasEntre = (desde, hasta) => Math.round((desdeIso(hasta) - desdeIso(desde)) / 86_400_000) + 1;

/** "2026-10-15" → "15 de octubre de 2026" */
export function formatoFechaLarga(iso) {
  const d = desdeIso(iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "2026-10-15T..." → "octubre de 2026" */
export function formatoMesAnio(iso) {
  const d = desdeIso(iso);
  return `${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "2026-10-15T14:35:00" → "14:35" */
export const formatoHora = (iso) => iso?.split('T')[1]?.slice(0, 5) ?? '';

/** "2026-10-15" → "15/10" */
export const formatoDiaMes = (iso) => {
  const [, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}`;
};

/** "2026-10-15" → "Jue" */
export const diaCorto = (iso) => DIAS_CORTOS[desdeIso(iso).getDay()];

/** "Hoy 14:30" si es de hoy; si no, "13/10/2026". */
export function formatoRelativo(iso) {
  if (!iso) return '—';
  if (iso.slice(0, 10) === hoyIso()) return `Hoy ${formatoHora(iso)}`;
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}
