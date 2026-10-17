import { Insignia } from '@/shared/ui';
import { TIPO_MOVIMIENTO } from '../model/constantes';

export function TipoMovimientoInsignia({ tipo }) {
  const { texto, tono } = TIPO_MOVIMIENTO[tipo] ?? { texto: tipo, tono: 'neutro' };
  return <Insignia tono={tono}>{texto}</Insignia>;
}
