import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ContadorCarrito, useCarrito } from '@/entities/carrito';
import { CategoriaIcono, ORDEN_CATEGORIAS } from '@/entities/categoria';
import { useSesion } from '@/entities/sesion';
import { usePerfil } from '@/entities/usuario';
import { useLogout } from '@/features/logout';
import { RUTAS } from '@/shared/config';
import { GlowCard, Icono, Logo } from '@/shared/ui';
import { MenuUsuario } from './MenuUsuario';
import styles from './Encabezado.module.css';

/**
 * Buscador con el diseño de GlowCard: vidrio translúcido y borde que brilla siguiendo al puntero
 * (tono dorado del Inti en la izquierda de la pantalla, que vira hacia el azul a la derecha).
 * Se monta con key = lo buscado, así muestra la búsqueda actual del catálogo.
 */
function Buscador({ inicial = '', alBuscar, className = '' }) {
  const [texto, setTexto] = useState(inicial);
  const navigate = useNavigate();
  return (
    <form
      role="search"
      className={`${styles.buscador} ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = texto.trim();
        navigate(q ? `${RUTAS.catalogo}?q=${encodeURIComponent(q)}` : RUTAS.catalogo);
        alBuscar?.();
      }}
    >
      <GlowCard customSize glowColor="orange" radio={12} className="h-11 w-full grid-rows-1 gap-0 rounded-xl p-0 shadow-[0_0.75rem_1.5rem_-1rem_black]">
        <Icono nombre="buscar" className={styles.lupa} />
        <input type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar cámaras, alarmas, cerraduras…" aria-label="Buscar productos" />
      </GlowCard>
    </form>
  );
}

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

          <Buscador key={buscado} inicial={buscado} className={styles.buscadorEscritorio} />

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
            <Buscador inicial={buscado} alBuscar={() => setMenuMovil(false)} />
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
