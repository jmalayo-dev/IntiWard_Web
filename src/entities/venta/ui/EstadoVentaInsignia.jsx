import { Insignia } from '@/shared/ui';
import { ESTADO_VENTA } from '../model/constantes';

export function EstadoVentaInsignia({ estado, punto = false }) {
  const { texto, tono } = ESTADO_VENTA[estado] ?? { texto: estado, tono: 'neutro' };
  return (
    <Insignia tono={tono} punto={punto}>
      {texto}
    </Insignia>
  );
}
