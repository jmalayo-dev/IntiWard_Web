import { useState } from 'react';
import { esClaveValida } from '@/shared/lib';
import { Aviso, Boton, Campo, Modal } from '@/shared/ui';
import { leerError } from '../model/errores';
import { useEditarPerfil } from '../model/useEditarPerfil';

/** Botón "Cambiar contraseña" con su modal. */
export function CambiarClave({ alCambiar }) {
  const { mutate, isPending, error, reset } = useEditarPerfil();
  const [abierto, setAbierto] = useState(false);
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState({});
  const delServidor = leerError(error);

  const cerrar = () => {
    setAbierto(false);
    setClave('');
    setConfirmacion('');
    setErrores({});
    reset();
  };

  const guardar = (e) => {
    e.preventDefault();
    const encontrados = {};
    if (!esClaveValida(clave)) encontrados.clave = 'La contraseña debe tener al menos 8 caracteres';
    if (clave !== confirmacion) encontrados.confirmacion = 'Las contraseñas no coinciden';
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    mutate(
      { password: clave },
      {
        onSuccess: () => {
          cerrar();
          alCambiar?.();
        },
      },
    );
  };

  return (
    <>
      <Boton variante="secundario" onClick={() => setAbierto(true)}>
        Cambiar contraseña
      </Boton>
      <Modal
        abierto={abierto}
        titulo="Cambiar contraseña"
        alCerrar={cerrar}
        acciones={
          <>
            <Boton variante="secundario" onClick={cerrar}>
              Cancelar
            </Boton>
            <Boton type="submit" form="form-clave" cargando={isPending}>
              Guardar contraseña
            </Boton>
          </>
        }
      >
        <form id="form-clave" onSubmit={guardar} noValidate style={{ display: 'grid', gap: 16 }}>
          {delServidor.aviso && <Aviso tipo="error">{delServidor.aviso}</Aviso>}
          <Campo
            etiqueta="Contraseña nueva"
            type="password"
            autoComplete="new-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            error={errores.clave ?? delServidor.campos.password}
            ayuda="Mínimo 8 caracteres"
            autoFocus
          />
          <Campo
            etiqueta="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            error={errores.confirmacion}
          />
        </form>
      </Modal>
    </>
  );
}
