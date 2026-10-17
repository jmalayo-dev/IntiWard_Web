import { desdeIso, diaCorto, hoyIso, sumarDias } from '@/shared/lib';

const redondear = (n) => Math.round(n * 100) / 100;

/** Fecha (AAAA-MM-DD) desde la que empieza cada período del selector. */
export function inicioDe(periodo, hoy = hoyIso()) {
  if (periodo === 'semana') return sumarDias(hoy, -6);
  if (periodo === 'mes') return `${hoy.slice(0, 8)}01`;
  return hoy;
}

/** Suma de las ventas confirmadas (los montos vienen del backend) entre dos fechas inclusive. */
export function ventasEntre(ventas, desde, hasta) {
  const lista = ventas.filter((v) => v.estado === 'CONFIRMADA' && v.fechaVenta.slice(0, 10) >= desde && v.fechaVenta.slice(0, 10) <= hasta);
  return { cantidad: lista.length, total: redondear(lista.reduce((s, v) => s + v.total, 0)) };
}

/** El mismo largo de período, justo antes (para el "▲ 18 % vs. ayer"). */
export function periodoAnterior(desde, hasta) {
  const dias = Math.round((desdeIso(hasta) - desdeIso(desde)) / 86_400_000) + 1;
  return { desde: sumarDias(desde, -dias), hasta: sumarDias(desde, -1) };
}

/** Ventas confirmadas por día de los últimos 7 días (hoy incluido). */
export function ultimos7Dias(ventas, hoy = hoyIso()) {
  return Array.from({ length: 7 }, (_, i) => {
    const dia = sumarDias(hoy, i - 6);
    return { etiqueta: diaCorto(dia), valor: ventasEntre(ventas, dia, dia).total, destacado: dia === hoy };
  });
}

