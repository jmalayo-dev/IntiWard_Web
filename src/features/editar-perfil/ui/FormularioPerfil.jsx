import { useState } from 'react';
import { Aviso, Boton, Campo } from '@/shared/ui';
import { leerError } from '../model/errores';
import { useEditarPerfil } from '../model/useEditarPerfil';
import styles from './FormularioPerfil.module.css';

const desdePerfil = (p) => ({ nombres: p.nombres ?? '', apellidos: p.apellidos ?? '', telefono: p.telefono ?? '', direccion: p.direccion ?? '' });

/** Tarjeta "Datos personales" de la vista 4.13. El correo no se puede cambiar. */
export function FormularioPerfil({ perfil, alGuardar }) {
  const { mutate, isPending, error, reset } = useEditarPerfil();
  const [datos, setDatos] = useState(() => desdePerfil(perfil));
  const [errores, setErrores] = useState({});
  const delServidor = leerError(error);
  const cambiado = JSON.stringify(datos) !== JSON.stringify(desdePerfil(perfil));

  const cambiar = (campo) => (e) => {
    setDatos({ ...datos, [campo]: e.target.value });
    setErrores({ ...errores, [campo]: undefined });
    if (error) reset();
  };

  const guardar = (e) => {
    e.preventDefault();
    const encontrados = {};
    if (!datos.nombres.trim()) encontrados.nombres = 'Ingresa tus nombres';
    if (!datos.apellidos.trim()) encontrados.apellidos = 'Ingresa tus apellidos';
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    mutate(
      { nombres: datos.nombres.trim(), apellidos: datos.apellidos.trim(), telefono: datos.telefono.trim(), direccion: datos.direccion.trim() },
      { onSuccess: () => alGuardar?.() },
    );
  };

  return (
    <form className={styles.formulario} onSubmit={guardar} noValidate>
      <h2 className={styles.titulo}>Datos personales</h2>
      {delServidor.aviso && <Aviso tipo="error">{delServidor.aviso}</Aviso>}
      <div className={styles.fila}>
        <Campo etiqueta="Nombres" value={datos.nombres} onChange={cambiar('nombres')} error={errores.nombres ?? delServidor.campos.nombres} autoComplete="given-name" />
        <Campo etiqueta="Apellidos" value={datos.apellidos} onChange={cambiar('apellidos')} error={errores.apellidos ?? delServidor.campos.apellidos} autoComplete="family-name" />
      </div>
      <Campo etiqueta="Correo electrónico" value={perfil.correo} disabled ayuda="El correo no se puede cambiar" />
      <div className={styles.fila}>
        <Campo etiqueta="Teléfono" type="tel" value={datos.telefono} onChange={cambiar('telefono')} autoComplete="tel" />
        <Campo etiqueta="Dirección" value={datos.direccion} onChange={cambiar('direccion')} autoComplete="street-address" />
      </div>
      <div className={styles.acciones}>
        <Boton
          variante="secundario"
          disabled={!cambiado || isPending}
          onClick={() => {
            setDatos(desdePerfil(perfil));
            setErrores({});
            reset();
          }}
        >
          Cancelar
        </Boton>
        <Boton type="submit" cargando={isPending} disabled={!cambiado}>
          Guardar cambios
        </Boton>
      </div>
    </form>
  );
}
