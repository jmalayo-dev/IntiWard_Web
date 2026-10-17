import { useState } from 'react';
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { ContadorCarrito, useCarrito } from '@/entities/carrito';
import { CategoriaIcono, ORDEN_CATEGORIAS } from '@/entities/categoria';
import { useSesion } from '@/entities/sesion';
import { usePerfil } from '@/entities/usuario';
import { BuscadorProductos } from '@/features/buscar-productos';
import { useLogout } from '@/features/logout';
import { RUTAS } from '@/shared/config';
import { Icono, Logo } from '@/shared/ui';
import { MenuUsuario } from './MenuUsuario';
import styles from './Encabezado.module.css';

/** Barra superior de la tienda en sus 3 versiones (visitante, cliente y administrador) + barra de categorías. */
export function Encabezado() {
  const { estaAutenticado, esAdmin, rol } = useSesion();
  const esCliente = rol === 'CLIENTE';
  const { data: carrito } = useCarrito({ habilitado: esCliente });
  const { data: perfil } = usePerfil({ habilitado: estaAutenticado });
  const [params] = useSearchParams();
  const location = useLocation();
  const [menuMovil, setMenuMovil] = useState(false);
  const cerrarSesion = useLogout();
  const enCatalogo = location.pathname === RUTAS.catalogo;
  const categoriaActual = enCatalogo ? params.get('categoria') : null;
  const buscado = enCatalogo ? (params.get('q') ?? '') : '';

  const claseEnlace = ({ isActive }) => `${styles.enlace} ${isActive ? styles.activo : ''}`;

  return (
    <header className={styles.encabezado}>
      <div className={styles.barra}>
        <div className={styles.contenido}>
          <Link to={RUTAS.inicio} className={styles.logo} aria-label="IntiGuard, ir al inicio">
            <Logo claro tamano={34} />
          </Link>

          <BuscadorProductos key={buscado} inicial={buscado} className={styles.buscadorEscritorio} />

          <nav className={styles.acciones} aria-label="Cuenta">
            <NavLink to={RUTAS.catalogo} end className={claseEnlace}>
              Catálogo
            </NavLink>
            {!estaAutenticado && (
              <>
                <Link to={RUTAS.login} className={styles.botonBorde}>
                  Iniciar sesión
                </Link>
                <Link to={RUTAS.registro} className={styles.botonDorado}>
                  Crear cuenta
                </Link>
              </>
            )}
            {esCliente && (
              <>
                <NavLink to={RUTAS.misPedidos} className={claseEnlace}>
                  Mis pedidos
                </NavLink>
                <Link to={RUTAS.carrito} className={styles.carrito} aria-label={`Carrito, ${carrito?.unidades ?? 0} productos`}>
                  <Icono nombre="carrito" tamano={24} />
                  <span className={styles.insignia}>
                    <ContadorCarrito cantidad={carrito?.unidades ?? 0} />
                  </span>
                </Link>
              </>
            )}
            {esAdmin && (
              <Link to={RUTAS.admin} className={styles.botonDorado}>
                Panel de administración
              </Link>
            )}
            {estaAutenticado && <MenuUsuario perfil={perfil} />}
          </nav>

          <div className={styles.accionesMovil}>
            {esCliente && (
              <Link to={RUTAS.carrito} className={styles.carrito} aria-label={`Carrito, ${carrito?.unidades ?? 0} productos`}>
                <Icono nombre="carrito" tamano={24} />
                <span className={styles.insignia}>
                  <ContadorCarrito cantidad={carrito?.unidades ?? 0} />
                </span>
              </Link>
            )}
            <button type="button" className={styles.hamburguesa} onClick={() => setMenuMovil((v) => !v)} aria-expanded={menuMovil} aria-label="Menú">
              <Icono nombre={menuMovil ? 'cerrar' : 'menu'} tamano={24} />
            </button>
          </div>
        </div>

        {menuMovil && (
          <div className={styles.panelMovil} onClick={(e) => e.target.closest('a, button') && setMenuMovil(false)}>
            <BuscadorProductos inicial={buscado} alBuscar={() => setMenuMovil(false)} className={styles.buscadorMovil} />
            <Link to={RUTAS.catalogo}>Catálogo</Link>
            {!estaAutenticado && (
              <>
                <Link to={RUTAS.login}>Iniciar sesión</Link>
                <Link to={RUTAS.registro}>Crear cuenta</Link>
              </>
            )}
            {esCliente && <Link to={RUTAS.misPedidos}>Mis pedidos</Link>}
            {esAdmin && <Link to={RUTAS.admin}>Panel de administración</Link>}
            {estaAutenticado && (
              <>
                <Link to={RUTAS.perfil}>Mi perfil</Link>
                <button type="button" onClick={cerrarSesion}>
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <nav className={styles.categorias} aria-label="Categorías">
        <ul className={styles.listaCategorias}>
          {ORDEN_CATEGORIAS.map((c) => (
            <li key={c}>
              <Link to={RUTAS.catalogoDe(c)} className={`${styles.categoria} ${categoriaActual === c ? styles.categoriaActiva : ''}`}>
                <CategoriaIcono categoria={c} tamano={18} />
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
