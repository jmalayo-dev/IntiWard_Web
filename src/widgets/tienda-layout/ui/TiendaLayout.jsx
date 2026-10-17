import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { RUTAS } from '@/shared/config';
import { Icono, Logo } from '@/shared/ui';
import { Encabezado } from './Encabezado';
import { Pie } from './Pie';
import styles from './TiendaLayout.module.css';

/** Al cambiar de página, vuelve arriba. */
function useArribaAlNavegar() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}

/** Marco de la tienda (PROTOTIPO_WEB.md §2.1): encabezado en 3 versiones, barra de categorías y pie. */
export function TiendaLayout() {
  useArribaAlNavegar();
  return (
    <div className={styles.marco}>
      <Encabezado />
      <main className={styles.contenido}>
        <Outlet />
      </main>
      <Pie />
    </div>
  );
}

/** Marco simplificado del checkout (vista 4.7): solo el logo y "Compra segura", sin buscador, categorías ni pie. */
export function TiendaSimpleLayout() {
  useArribaAlNavegar();
  return (
    <div className={styles.marco}>
      <header className={styles.barraSimple}>
        <div className={styles.barraSimpleContenido}>
          <Link to={RUTAS.inicio} aria-label="IntiGuard, ir al inicio">
            <Logo claro tamano={34} />
          </Link>
          <span className={styles.compraSegura}>
            <Icono nombre="candado" /> Compra segura
          </span>
        </div>
      </header>
      <main className={styles.contenido}>
        <Outlet />
      </main>
    </div>
  );
}
