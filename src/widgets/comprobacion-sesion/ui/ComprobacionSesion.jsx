import { Outlet } from 'react-router-dom';
import { useSesion } from '@/entities/sesion';
import { useUsuario } from '@/entities/usuario';
import { useLogout } from '@/features/logout';
import { RUTAS } from '@/shared/config';
import styles from './ComprobacionSesion.module.css';

/**
 * TEMPORAL · solo para comprobar la sesión. Para quitarlo: borrar esta carpeta
 * y la ruta raíz que la usa en app/router/router.jsx.
 */
export function ComprobacionSesion() {
  const { usuario, estaAutenticado } = useSesion();
  const { data: datos } = useUsuario(usuario?.id);
  // El backend no revoca tokens: cerrar sesión = borrar el JWT y la caché del front
  const cerrarSesion = useLogout({ destino: RUTAS.login });

  return (
    <>
      {estaAutenticado && (
        <div className={styles.barra} role="status">
          <span>
            Logeado! Tu usuario es <strong>{datos?.nombreCompleto || usuario.correo}</strong>
          </span>
          <button type="button" className={styles.boton} onClick={cerrarSesion}>
            Quitar y revocar token
          </button>
        </div>
      )}
      <Outlet />
    </>
  );
}
