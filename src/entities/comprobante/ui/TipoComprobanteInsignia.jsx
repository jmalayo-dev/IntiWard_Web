import { Insignia } from '@/shared/ui';
import { TIPO_COMPROBANTE } from '../model/constantes';

export function TipoComprobanteInsignia({ tipo }) {
  const { texto, tono } = TIPO_COMPROBANTE[tipo] ?? { texto: tipo, tono: 'neutro' };
  return <Insignia tono={tono}>{texto}</Insignia>;
}
