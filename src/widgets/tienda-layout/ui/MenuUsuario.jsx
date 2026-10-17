import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AvatarIniciales } from '@/entities/usuario';
import { useLogout } from '@/features/logout';
import { RUTAS } from '@/shared/config';
import { Icono } from '@/shared/ui';
import styles from './MenuUsuario.module.css';

/** Avatar con iniciales que abre "Mi perfil" y "Cerrar sesión". */
export function MenuUsuario({ perfil }) {
  const [abierto, setAbierto] = useState(false);
  const cerrarSesion = useLogout();
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => !ref.current?.contains(e.target) && setAbierto(false);
    const escape = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', escape);
    };
  }, [abierto]);

  return (
    <div className={styles.menu} ref={ref}>
      <button
        type="button"
        className={styles.avatar}
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Menú de ${perfil?.nombreCompleto ?? 'tu cuenta'}`}
      >
        <AvatarIniciales iniciales={perfil?.iniciales ?? ''} fotoUrl={perfil?.fotoUrl} tamano={36} />
      </button>
      {abierto && (
        <div className={styles.lista} role="menu">
          <div className={styles.quien}>
            <strong>{perfil?.nombreCompleto}</strong>
            <span>{perfil?.correo}</span>
          </div>
          <Link to={RUTAS.perfil} role="menuitem" className={styles.opcion} onClick={() => setAbierto(false)}>
            <Icono nombre="usuario" tamano={18} /> Mi perfil
          </Link>
          <button type="button" role="menuitem" className={styles.opcion} onClick={cerrarSesion}>
            <Icono nombre="salir" tamano={18} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
