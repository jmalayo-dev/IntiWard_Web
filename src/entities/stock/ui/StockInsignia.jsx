import { Insignia } from '@/shared/ui';
import { estadoStock, ESTADO_STOCK } from '../model/constantes';

/** En stock / Últimas unidades / Agotado. Con `detalle`, "Últimas unidades: quedan 3". */
export function StockInsignia({ disponible, detalle = false }) {
  const estado = estadoStock(disponible);
  const texto = detalle && estado === ESTADO_STOCK.ULTIMAS ? `${estado.texto}: quedan ${disponible}` : estado.texto;
  return <Insignia tono={estado.tono}>{texto}</Insignia>;
}
