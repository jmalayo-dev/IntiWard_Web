import { formatoHora } from '@/shared/lib';
import { Icono, Insignia } from '@/shared/ui';
import { estadoCuenta } from '../model/constantes';

/** "Activo" verde, "Bloqueado hasta 15:20" rojo con candado o "Inactivo" gris. */
export function EstadoCuentaInsignia({ usuario }) {
  const estado = estadoCuenta(usuario);
  if (estado === 'BLOQUEADO') {
    return (
      <Insignia tono="error">
        <Icono nombre="candado" tamano={12} grosor={2.5} />
        Bloqueado hasta {formatoHora(usuario.bloqueadoHasta)}
      </Insignia>
    );
  }
  return <Insignia tono={estado === 'ACTIVO' ? 'exito' : 'neutro'}>{estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}</Insignia>;
}
