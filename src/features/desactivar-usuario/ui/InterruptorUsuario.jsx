import { useState } from 'react';
import { estadoCuenta } from '@/entities/usuario';
import { Aviso, Boton, Interruptor, Modal } from '@/shared/ui';
import { useActivarUsuario } from '../model/useActivarUsuario';
import { useDesactivarUsuario } from '../model/useDesactivarUsuario';

/**
 * Interruptor de la tabla de usuarios: encendido = la cuenta puede entrar.
 * Una cuenta bloqueada se muestra apagada; encenderla la reactiva y levanta el bloqueo.
 * No se puede desactivar la propia cuenta.
 */
export function InterruptorUsuario({ usuario, esPropia }) {
  const desactivar = useDesactivarUsuario();
  const activar = useActivarUsuario();
  const [confirmando, setConfirmando] = useState(false);
  const puedeEntrar = estadoCuenta(usuario) === 'ACTIVO';

  const cerrar = () => {
    setConfirmando(false);
    desactivar.reset();
  };

  return (
    <>
      <Interruptor
        activo={puedeEntrar}
        disabled={esPropia || activar.isPending || desactivar.isPending}
        etiqueta={puedeEntrar ? `Desactivar a ${usuario.nombreCompleto}` : `Activar a ${usuario.nombreCompleto}`}
        ocultarEtiqueta
        alCambiar={(v) => (v ? activar.mutate(usuario.id) : setConfirmando(true))}
      />
      <Modal
        abierto={confirmando}
        titulo={`¿Desactivar a ${usuario.nombreCompleto}?`}
        alCerrar={cerrar}
        acciones={
          <>
            <Boton variante="secundario" onClick={cerrar}>
              Cancelar
            </Boton>
            <Boton variante="peligro" cargando={desactivar.isPending} onClick={() => desactivar.mutate(usuario.id, { onSuccess: cerrar })}>
              Desactivar
            </Boton>
          </>
        }
      >
        <p style={{ color: 'var(--color-texto-secundario)' }}>No podrá iniciar sesión. Sus pedidos y comprobantes se conservan y puedes volver a activarla cuando quieras.</p>
        {desactivar.isError && <Aviso tipo="error">{desactivar.error.message}</Aviso>}
      </Modal>
    </>
  );
}
