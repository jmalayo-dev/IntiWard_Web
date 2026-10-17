import { useState } from 'react';
import { Aviso, Boton, Campo, Modal } from '@/shared/ui';
import { leerError } from '../model/errores';
import { useEditarPerfil } from '../model/useEditarPerfil';

/** Enlace "Cambiar foto": no hay servicio de archivos, así que se pega la URL de una imagen (o se quita). */
export function CambiarFoto({ fotoUrl, className, alCambiar }) {
  const { mutate, isPending, error, reset } = useEditarPerfil();
  const [abierto, setAbierto] = useState(false);
  const [url, setUrl] = useState(fotoUrl ?? '');
  const [invalida, setInvalida] = useState(false);
  const delServidor = leerError(error);

  const cerrar = () => {
    setAbierto(false);
    setInvalida(false);
    reset();
  };

  const guardar = (valor) => {
    if (valor && !/^https?:\/\/\S+$/.test(valor)) {
      setInvalida(true);
      return;
    }
    mutate(
      { fotoUrl: valor || null },
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
      <button
        type="button"
        className={className}
        onClick={() => {
          setUrl(fotoUrl ?? '');
          setAbierto(true);
        }}
      >
        Cambiar foto
      </button>
      <Modal
        abierto={abierto}
        titulo="Cambiar foto"
        alCerrar={cerrar}
        acciones={
          <>
            {fotoUrl && (
              <Boton variante="secundario" onClick={() => guardar('')} disabled={isPending}>
                Quitar foto
              </Boton>
            )}
            <Boton onClick={() => guardar(url.trim())} cargando={isPending}>
              Guardar foto
            </Boton>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          {delServidor.aviso && <Aviso tipo="error">{delServidor.aviso}</Aviso>}
          <Campo
            etiqueta="URL de la imagen"
            placeholder="https://ejemplo.com/foto.jpg"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setInvalida(false);
            }}
            error={invalida ? 'Ingresa una URL que empiece con http:// o https://' : undefined}
            autoFocus
          />
        </div>
      </Modal>
    </>
  );
}
