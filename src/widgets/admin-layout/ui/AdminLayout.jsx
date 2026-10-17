import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatches, useNavigate, useParams } from 'react-router-dom';
import { useProductos } from '@/entities/producto';
import { useSesion } from '@/entities/sesion';
import { useStocks } from '@/entities/stock';
import { AvatarIniciales, usePerfil } from '@/entities/usuario';
import { useLogout } from '@/features/logout';
import { RUTAS } from '@/shared/config';
import { formatoPedido } from '@/shared/lib';
import { Icono, Logo } from '@/shared/ui';
import { usePestanas } from '../model/pestanas';
import { Desplegable } from './Desplegable';
import menu from './Desplegable.module.css';
import styles from './AdminLayout.module.css';

const MENU = [
  { items: [{ a: RUTAS.admin, texto: 'Resumen', icono: 'cuadricula', exacta: true }] },
  {
    grupo: 'Catálogo',
    items: [
      { a: RUTAS.adminProductos, texto: 'Productos', icono: 'caja' },
      { a: RUTAS.adminMarcasCategorias, texto: 'Marcas y categorías', icono: 'etiqueta' },
    ],
  },
  {
    grupo: 'Inventario',
    items: [
      { a: RUTAS.adminStock, texto: 'Stock', icono: 'almacen' },
      { a: RUTAS.adminMovimientos, texto: 'Movimientos', icono: 'flechas' },
    ],
  },
  {
    grupo: 'Ventas',
    items: [
      { a: RUTAS.adminVentas, texto: 'Ventas', icono: 'carrito' },
      { a: RUTAS.adminComprobantes, texto: 'Comprobantes', icono: 'documento' },
      { a: RUTAS.adminReportes, texto: 'Reportes', icono: 'grafico' },
    ],
  },
  { items: [{ a: RUTAS.adminUsuarios, texto: 'Usuarios', icono: 'usuarios' }] },
];
const OPCIONES = MENU.flatMap((s) => s.items);

const CLAVE_COLAPSADO = 'intiguard.admin.colapsado';
const leerColapsado = () => {
  try {
    return localStorage.getItem(CLAVE_COLAPSADO) === '1';
  } catch {
    return false;
  }
};

/** Título e ícono de la página actual para su pestaña: el título sale de las migas de la ruta (router.jsx). */
function usePaginaActual() {
  const { pathname } = useLocation();
  const { id } = useParams();
  const matches = useMatches();
  const migas = [...matches].reverse().find((m) => m.handle?.migas)?.handle.migas ?? [];
  let titulo = migas.at(-1)?.texto ?? 'Panel';
  if (pathname.startsWith(`${RUTAS.adminVentas}/`) && id) titulo = `Venta ${formatoPedido(id)}`;
  const opcion = OPCIONES.filter((o) => (o.exacta ? pathname === o.a : pathname.startsWith(o.a))).sort((a, b) => b.a.length - a.a.length)[0];
  return { ruta: pathname, titulo, icono: opcion?.icono ?? 'documento' };
}

/**
 * Marco del panel de administración: barra lateral clara (se puede colapsar a solo íconos), pestañas de las
 * páginas abiertas y el contenido en una hoja blanca con bordes redondeados.
 */
export function AdminLayout() {
  const { usuario } = useSesion();
  const { data: perfil } = usePerfil({ habilitado: Boolean(usuario) });
  const { data: stock } = useStocks();
  const { data: productos } = useProductos({ size: 100 });
  const cerrarSesion = useLogout({ destino: RUTAS.login });
  const navigate = useNavigate();
  const location = useLocation();
  const actual = usePaginaActual();
  const { pestanas, cerrar } = usePestanas(actual);
  const [colapsado, setColapsado] = useState(leerColapsado);
  const [menuMovil, setMenuMovil] = useState(false);
  // Solo cuentan los productos activos (uno inactivo sin stock no es un aviso)
  const agotados = stock && productos ? productos.items.filter((p) => (stock[p.id]?.disponible ?? 0) <= 0).length : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const alternarColapsado = () => {
    setColapsado((v) => {
      try {
        localStorage.setItem(CLAVE_COLAPSADO, v ? '0' : '1');
      } catch {
        // Sin almacenamiento: se recuerda solo mientras la página siga abierta
      }
      return !v;
    });
  };

  const cerrarPestana = (e, ruta) => {
    e.preventDefault();
    e.stopPropagation();
    const siguiente = cerrar(ruta);
    if (siguiente) navigate(siguiente);
  };

  return (
    <div className={`${styles.panel} ${colapsado ? styles.colapsado : ''}`}>
      <aside
        className={`${styles.lateral} ${menuMovil ? styles.lateralAbierto : ''}`}
        aria-label="Menú del panel"
        // En móvil, elegir una opción cierra el menú
        onClick={(e) => e.target.closest('a') && setMenuMovil(false)}
      >
        <div className={styles.marca}>
          <Link to={RUTAS.admin} className={styles.marcaEnlace} aria-label="IntiGuard, ir al resumen">
            <span className={styles.marcaIcono}>
              <Logo claro tamano={26} />
            </span>
            <span className={styles.marcaTexto}>
              <strong>IntiGuard</strong>
              <span>Administración</span>
            </span>
          </Link>
          <button
            type="button"
            className={styles.botonIcono}
            onClick={alternarColapsado}
            aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'}
            title={colapsado ? 'Expandir menú' : 'Colapsar menú'}
          >
            <Icono nombre="panelLateral" />
          </button>
        </div>

        <nav className={styles.menu}>
          {MENU.map((seccion, i) => (
            <div key={seccion.grupo ?? i} className={styles.seccion}>
              {seccion.grupo && <p className={styles.grupo}>{seccion.grupo}</p>}
              {seccion.items.map((item) => (
                <NavLink
                  key={item.a}
                  to={item.a}
                  end={item.exacta}
                  title={colapsado ? item.texto : undefined}
                  className={({ isActive }) => `${styles.opcion} ${isActive ? styles.activa : ''}`}
                >
                  <Icono nombre={item.icono} />
                  <span className={styles.opcionTexto}>{item.texto}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <Desplegable
          className={styles.cuenta}
          lado="izquierda"
          arriba
          boton={(abierto, alternar) => (
            <button type="button" className={styles.cuentaBoton} onClick={alternar} aria-haspopup="menu" aria-expanded={abierto}>
              <AvatarIniciales iniciales={perfil?.iniciales ?? ''} fotoUrl={perfil?.fotoUrl} tamano={36} />
              <span className={styles.cuentaTexto}>
                <strong>{perfil?.nombreCompleto ?? ''}</strong>
                <span>Administrador</span>
              </span>
            </button>
          )}
        >
          {(cerrarMenu) => (
            <>
              <Link to={RUTAS.perfil} role="menuitem" className={menu.opcion} onClick={cerrarMenu}>
                <Icono nombre="usuario" tamano={18} /> Mi perfil
              </Link>
              <Link to={RUTAS.inicio} role="menuitem" className={menu.opcion} onClick={cerrarMenu}>
                <Icono nombre="enlaceExterno" tamano={18} /> Ver tienda
              </Link>
              <div className={menu.separador} />
              <button type="button" role="menuitem" className={menu.opcion} onClick={cerrarSesion}>
                <Icono nombre="salir" tamano={18} /> Cerrar sesión
              </button>
            </>
          )}
        </Desplegable>
      </aside>
      {menuMovil && <div className={styles.velo} onClick={() => setMenuMovil(false)} aria-hidden="true" />}

      <div className={styles.principal}>
        <header className={styles.superior}>
          <button type="button" className={`${styles.botonIcono} ${styles.botonMenu}`} onClick={() => setMenuMovil(true)} aria-label="Abrir menú">
            <Icono nombre="menu" />
          </button>

          <nav className={styles.pestanas} aria-label="Páginas abiertas">
            {pestanas.map((p) => (
              <Link
                key={p.ruta}
                to={p.ruta}
                className={`${styles.pestana} ${p.ruta === actual.ruta ? styles.pestanaActiva : ''}`}
                aria-current={p.ruta === actual.ruta ? 'page' : undefined}
              >
                <Icono nombre={p.icono} tamano={18} />
                <span className={styles.pestanaTexto}>{p.titulo}</span>
                {pestanas.length > 1 && (
                  <span role="button" tabIndex={0} className={styles.cerrarPestana} aria-label={`Cerrar ${p.titulo}`} onClick={(e) => cerrarPestana(e, p.ruta)} onKeyDown={(e) => e.key === 'Enter' && cerrarPestana(e, p.ruta)}>
                    <Icono nombre="cerrar" tamano={14} />
                  </span>
                )}
              </Link>
            ))}
            <Desplegable
              boton={(abierto, alternar) => (
                <button type="button" className={styles.botonIcono} onClick={alternar} aria-haspopup="menu" aria-expanded={abierto} aria-label="Abrir otra página" title="Abrir otra página">
                  <Icono nombre="mas" />
                </button>
              )}
              lado="izquierda"
            >
              {(cerrarMenu) =>
                OPCIONES.map((o) => (
                  <Link key={o.a} to={o.a} role="menuitem" className={menu.opcion} onClick={cerrarMenu}>
                    <Icono nombre={o.icono} tamano={18} /> {o.texto}
                  </Link>
                ))
              }
            </Desplegable>
          </nav>

          <div className={styles.herramientas}>
            <Link
              to={RUTAS.adminStock}
              state={{ filtro: 'agotados' }}
              className={styles.botonIcono}
              aria-label={agotados ? `${agotados} productos agotados` : 'Sin avisos de stock'}
              title={agotados ? `${agotados} producto(s) agotado(s)` : 'Sin avisos de stock'}
            >
              <Icono nombre="campana" />
              {agotados > 0 && <span className={styles.punto} />}
            </Link>
            <Desplegable
              boton={(abierto, alternar) => (
                <button type="button" className={styles.botonIcono} onClick={alternar} aria-haspopup="menu" aria-expanded={abierto} aria-label="Más opciones">
                  <Icono nombre="puntos" />
                </button>
              )}
            >
              {(cerrarMenu) => (
                <>
                  <Link to={RUTAS.inicio} role="menuitem" className={menu.opcion} onClick={cerrarMenu}>
                    <Icono nombre="enlaceExterno" tamano={18} /> Ver tienda
                  </Link>
                  <button type="button" role="menuitem" className={menu.opcion} onClick={alternarColapsado}>
                    <Icono nombre="panelLateral" tamano={18} /> {colapsado ? 'Expandir menú' : 'Colapsar menú'}
                  </button>
                  <div className={menu.separador} />
                  <button type="button" role="menuitem" className={menu.opcion} onClick={cerrarSesion}>
                    <Icono nombre="salir" tamano={18} /> Cerrar sesión
                  </button>
                </>
              )}
            </Desplegable>
          </div>
        </header>

        <main className={styles.hoja}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
