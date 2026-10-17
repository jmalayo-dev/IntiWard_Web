import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatches } from 'react-router-dom';
import { useProductos } from '@/entities/producto';
import { useSesion } from '@/entities/sesion';
import { useStocks } from '@/entities/stock';
import { AvatarIniciales, usePerfil } from '@/entities/usuario';
import { useLogout } from '@/features/logout';
import { RUTAS } from '@/shared/config';
import { Icono, Logo, Migas } from '@/shared/ui';
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

/** Migas del `handle` de la ruta activa: { migas: [{ texto, a? }] }. Siempre empiezan en "Administración". */
function useMigas() {
  const matches = useMatches();
  const conMigas = [...matches].reverse().find((m) => m.handle?.migas);
  return [{ texto: 'Administración', a: RUTAS.admin }, ...(conMigas?.handle.migas ?? [])];
}

/** Marco del panel (PROTOTIPO_WEB.md §2.2): menú lateral oscuro, barra superior con migas y el contenido. */
export function AdminLayout() {
  const { usuario } = useSesion();
  const { data: perfil } = usePerfil({ habilitado: Boolean(usuario) });
  const { data: stock } = useStocks();
  const { data: productos } = useProductos({ size: 100 });
  const cerrarSesion = useLogout({ destino: RUTAS.login });
  const migas = useMigas();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Solo cuentan los productos activos (uno inactivo sin stock no es un aviso)
  const agotados = stock && productos ? productos.items.filter((p) => (stock[p.id]?.disponible ?? 0) <= 0).length : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={styles.panel}>
      {/* En móvil, elegir una opción cierra el menú */}
      <aside
        className={`${styles.lateral} ${menuAbierto ? styles.lateralAbierto : ''}`}
        aria-label="Menú del panel"
        onClick={(e) => e.target.closest('a') && setMenuAbierto(false)}
      >
        <div className={styles.marca}>
          <Logo claro tamano={32} />
          <span className={styles.etiqueta}>Administración</span>
        </div>
        <nav className={styles.menu}>
          {MENU.map((seccion, i) => (
            <div key={seccion.grupo ?? i} className={styles.seccion}>
              {seccion.grupo && <p className={styles.grupo}>{seccion.grupo}</p>}
              {seccion.items.map((item) => (
                <NavLink key={item.a} to={item.a} end={item.exacta} className={({ isActive }) => `${styles.opcion} ${isActive ? styles.activa : ''}`}>
                  <Icono nombre={item.icono} />
                  {item.texto}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className={styles.abajo}>
          <Link to={RUTAS.inicio} className={styles.opcion}>
            <Icono nombre="enlaceExterno" /> Ver tienda
          </Link>
          <button type="button" className={styles.opcion} onClick={cerrarSesion}>
            <Icono nombre="salir" /> Cerrar sesión
          </button>
        </div>
      </aside>
      {menuAbierto && <div className={styles.velo} onClick={() => setMenuAbierto(false)} aria-hidden="true" />}

      <div className={styles.principal}>
        <header className={styles.superior}>
          <button type="button" className={styles.botonMenu} onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
            <Icono nombre="menu" />
          </button>
          <Migas items={migas} className={styles.migas} />
          <div className={styles.derecha}>
            <Link
              to={RUTAS.adminStock}
              state={{ filtro: 'agotados' }}
              className={styles.campana}
              aria-label={agotados ? `${agotados} productos agotados` : 'Sin avisos de stock'}
              title={agotados ? `${agotados} producto(s) agotado(s)` : 'Sin avisos de stock'}
            >
              <Icono nombre="campana" />
              {agotados > 0 && <span className={styles.punto} />}
            </Link>
            <div className={styles.quien}>
              <AvatarIniciales iniciales={perfil?.iniciales ?? ''} fotoUrl={perfil?.fotoUrl} tamano={40} />
              <div className={styles.quienTexto}>
                <strong>{perfil?.nombres ?? ''}</strong>
                <span>Administrador</span>
              </div>
            </div>
          </div>
        </header>
        <main className={styles.contenido}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
