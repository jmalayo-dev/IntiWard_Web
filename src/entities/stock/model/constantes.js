/** "Últimas unidades" de 1 a 5 (PROTOTIPO_WEB.md §3). */
export const UMBRAL_ULTIMAS_UNIDADES = 5;

export const ESTADO_STOCK = {
  EN_STOCK: { texto: 'En stock', tono: 'exito' },
  ULTIMAS: { texto: 'Últimas unidades', tono: 'advertencia' },
  AGOTADO: { texto: 'Agotado', tono: 'error' },
};

export function estadoStock(disponible) {
  if (!disponible || disponible <= 0) return ESTADO_STOCK.AGOTADO;
  if (disponible <= UMBRAL_ULTIMAS_UNIDADES) return ESTADO_STOCK.ULTIMAS;
  return ESTADO_STOCK.EN_STOCK;
}
