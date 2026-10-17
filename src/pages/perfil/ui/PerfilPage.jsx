import { useCallback, useState } from 'react';
import { AvatarIniciales, RolInsignia, usePerfil } from '@/entities/usuario';
import { CambiarClave, CambiarFoto, FormularioPerfil } from '@/features/editar-perfil';
import { formatoMesAnio, useTitulo } from '@/shared/lib';
import { Cargando, EncabezadoPagina, MensajeError, Tarjeta, Toast } from '@/shared/ui';
import styles from './PerfilPage.module.css';

/** Vista 4.13 · Mi perfil (cliente y administrador). */
export function PerfilPage() {
  useTitulo('Mi perfil');
  const { data: perfil, isLoading, error, refetch } = usePerfil();
  const [aviso, setAviso] = useState(null);
  const cerrarAviso = useCallback(() => setAviso(null), []);

  if (error) return <MensajeError error={error} alReintentar={refetch} />;
  if (isLoading) return <Cargando lineas={6} alto={44} />;

  return (
    <div>
      <EncabezadoPagina titulo="Mi perfil" />
      <Toast mensaje={aviso} alCerrar={cerrarAviso} />
      <div className={styles.columnas}>
        <Tarjeta className={styles.identidad}>
          <AvatarIniciales iniciales={perfil.iniciales} fotoUrl={perfil.fotoUrl} tamano={120} tono="suave" />
          <CambiarFoto fotoUrl={perfil.fotoUrl} className={styles.cambiarFoto} alCambiar={() => setAviso('Tu foto se actualizó correctamente.')} />
          <h2 className={styles.nombre}>{perfil.nombreCompleto}</h2>
          <p className={styles.correo}>{perfil.correo}</p>
          <RolInsignia rol={perfil.rol} />
          {perfil.creadoEn && <p className={styles.miembro}>Miembro desde {formatoMesAnio(perfil.creadoEn)}</p>}
        </Tarjeta>

        <div className={styles.derecha}>
          <Tarjeta>
            {/* key: si el perfil cambia en el servidor, el formulario arranca de nuevo con esos datos */}
            <FormularioPerfil key={perfil.nombres + perfil.apellidos + perfil.telefono + perfil.direccion} perfil={perfil} alGuardar={() => setAviso('Tus datos se guardaron correctamente.')} />
          </Tarjeta>
          <Tarjeta titulo="Seguridad">
            <div className={styles.seguridad}>
              <div>
                <strong>Contraseña</strong>
                <p className={styles.gris}>Mínimo 8 caracteres.</p>
              </div>
              <CambiarClave alCambiar={() => setAviso('Tu contraseña se cambió correctamente.')} />
            </div>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
