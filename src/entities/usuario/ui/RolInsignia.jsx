import { Insignia } from '@/shared/ui';
import { TEXTO_ROL } from '../model/constantes';

export function RolInsignia({ rol }) {
  return <Insignia tono={rol === 'ADMIN' ? 'info' : 'neutro'}>{TEXTO_ROL[rol] ?? rol}</Insignia>;
}
