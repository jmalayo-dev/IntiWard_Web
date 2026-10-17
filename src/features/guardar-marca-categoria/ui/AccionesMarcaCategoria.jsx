import { useState } from 'react';
import { Boton, Campo, Icono, Interruptor, Modal } from '@/shared/ui';
import { useGuardarMarcaCategoria } from '../model/useGuardarMarcaCategoria';
import { TEXTOS } from './textos';
import styles from './AccionesMarcaCategoria.module.css';

/** Lápiz para renombrar + interruptor activo/inactivo de una fila de marcas o categorías. */
export function AccionesMarcaCategoria({ tipo, item }) {
  const { mutate, isPending, error, reset } = useGuardarMarcaCategoria(tipo);
  const cambiarEstado = useGuardarMarcaCategoria(tipo);
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState(item.nombre);

  const cerrar = () => {
    setAbierto(false);
    reset();
  };

  const guardar = (e) => {
    e.preventDefault();
    if (!nombre.trim() || nombre.trim() === item.nombre) {
      cerrar();
      return;
    }
    mutate({ id: item.id, nombre: nombre.trim() }, { onSuccess: cerrar });
  };

  return (
    <div className={styles.acciones}>
      <button
        type="button"
        className={styles.lapiz}
        aria-label={`Renombrar ${item.nombre}`}
        onClick={() => {
          setNombre(item.nombre);
          setAbierto(true);
        }}
      >
        <Icono nombre="lapiz" />
      </button>
      <Interruptor
        activo={item.activo}
        disabled={cambiarEstado.isPending}
        etiqueta={`${item.activo ? 'Desactivar' : 'Activar'} ${item.nombre}`}
        ocultarEtiqueta
        alCambiar={(activo) => cambiarEstado.mutate({ id: item.id, activo })}
      />
      <Modal
        abierto={abierto}
        titulo={`Renombrar ${TEXTOS[tipo].nombre}`}
        alCerrar={cerrar}
        acciones={
          <>
            <Boton variante="secundario" onClick={cerrar}>
              Cancelar
            </Boton>
            <Boton type="submit" form={`renombrar-${tipo}-${item.id}`} cargando={isPending}>
              Guardar
            </Boton>
          </>
        }
      >
        <form id={`renombrar-${tipo}-${item.id}`} onSubmit={guardar} noValidate>
          <Campo
            etiqueta="Nombre"
            value={nombre}
            maxLength={80}
            onChange={(e) => {
              setNombre(e.target.value);
              if (error) reset();
            }}
            error={error?.message}
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
}
