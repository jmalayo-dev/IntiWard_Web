import { diasEntre, formatoDiaMes, sumarDias } from '@/shared/lib';

const redondear = (n) => Math.round(n * 100) / 100;

/** Total de comprobantes por día del rango (un valor por día, aunque sea 0). */
export function porDia(comprobantes, desde, hasta) {
  const dias = Math.max(1, diasEntre(desde, hasta));
  return Array.from({ length: dias }, (_, i) => {
    const dia = sumarDias(desde, i);
    return {
      etiqueta: formatoDiaMes(dia),
      valor: redondear(comprobantes.filter((c) => c.emitidoEn.slice(0, 10) === dia).reduce((s, c) => s + c.total, 0)),
    };
  });
}

/** El período anterior del mismo largo, justo antes de `desde`. */
export function rangoAnterior({ desde, hasta }) {
  const dias = diasEntre(desde, hasta);
  return { desde: sumarDias(desde, -dias), hasta: sumarDias(desde, -1) };
}

/** Unidades vendidas por producto (ventas confirmadas), de más a menos. */
export function masVendidos(ventas, limite = 5) {
  const unidades = {};
  for (const v of ventas) {
    for (const d of v.detalles) {
      unidades[d.idProducto] ??= { nombre: d.nombreProducto, unidades: 0 };
      unidades[d.idProducto].unidades += d.cantidad;
    }
  }
  return Object.values(unidades)
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, limite);
}

/** Importe vendido por categoría (ventas confirmadas). `categoriaDe`: { idProducto: nombreCategoria } */
export function porCategoria(ventas, categoriaDe) {
  const montos = {};
  for (const v of ventas) {
    for (const d of v.detalles) {
      const categoria = categoriaDe[d.idProducto] ?? 'Otros';
      montos[categoria] = (montos[categoria] ?? 0) + d.importe;
    }
  }
  return Object.entries(montos)
    .map(([etiqueta, valor]) => ({ etiqueta, valor: redondear(valor) }))
    .sort((a, b) => b.valor - a.valor);
}
