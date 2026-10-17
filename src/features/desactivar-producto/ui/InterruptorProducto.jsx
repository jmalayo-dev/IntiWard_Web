import { useState } from 'react';
import { Aviso, Boton, Interruptor, Modal } from '@/shared/ui';
import { useActivarProducto } from '../model/useActivarProducto';
import { useDesactivarProducto } from '../model/useDesactivarProducto';

/** Interruptor Activo / Inactivo de la tabla de productos. Desactivar pide confirmación; los productos no se borran. */
export function InterruptorProducto({ producto }) {
  const desactivar = useDesactivarProducto();
  const activar = useActivarProducto();
  const [confirmando, setConfirmando] = useState(false);

  const cerrar = () => {
    setConfirmando(false);
    desactivar.reset();
  };

  return (
    <>
      <Interruptor
        activo={producto.activo}
        disabled={activar.isPending || desactivar.isPending}
        etiqueta={producto.activo ? `Desactivar ${producto.nombre}` : `Activar ${producto.nombre}`}
        ocultarEtiqueta
        alCambiar={(v) => (v ? activar.mutate(producto.id) : setConfirmando(true))}
      />
      <Modal
        abierto={confirmando}
        titulo={`¿Desactivar ${producto.nombre}?`}
        alCerrar={cerrar}
        acciones={
          <>
            <Boton variante="secundario" onClick={cerrar}>
              Cancelar
            </Boton>
            <Boton variante="peligro" cargando={desactivar.isPending} onClick={() => desactivar.mutate(producto.id, { onSuccess: cerrar })}>
              Desactivar
            </Boton>
          </>
        }
      >
        <p style={{ color: 'var(--color-texto-secundario)' }}>
          Dejará de mostrarse en la tienda. Las ventas pasadas no cambian y puedes volver a activarlo cuando quieras.
        </p>
        {desactivar.isError && <Aviso tipo="error">{desactivar.error.message}</Aviso>}
      </Modal>
    </>
  );
}
