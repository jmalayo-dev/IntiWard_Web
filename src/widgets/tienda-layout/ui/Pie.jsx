import { Link } from 'react-router-dom';
import { RUTAS } from '@/shared/config';
import { Logo } from '@/shared/ui';
import styles from './Pie.module.css';

/** Pie de la tienda (PROTOTIPO_WEB.md §2.1). Las páginas de ayuda aún no existen: van al catálogo. */
export function Pie() {
  return (
    <footer className={styles.pie}>
      <div className={styles.columnas}>
        <div className={styles.marca}>
          <Logo claro tamano={30} />
          <p>Seguridad para tu hogar y tu negocio</p>
        </div>
        <nav aria-label="Tienda">
          <h2 className={styles.titulo}>Tienda</h2>
          <ul>
            <li>
              <Link to={RUTAS.catalogo}>Catálogo</Link>
            </li>
            <li>
              <Link to={RUTAS.misPedidos}>Mis pedidos</Link>
            </li>
            <li>
              <Link to={RUTAS.perfil}>Mi perfil</Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Ayuda">
          <h2 className={styles.titulo}>Ayuda</h2>
          <ul>
            <li>
              <span>Boletas y facturas</span>
            </li>
            <li>
              <span>Garantía</span>
            </li>
            <li>
              <span>Preguntas frecuentes</span>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className={styles.titulo}>Contacto</h2>
          <ul>
            <li>
              <a href="mailto:ventas@intiguard.pe">ventas@intiguard.pe</a>
            </li>
            <li>
              <a href="tel:+5115550123">+51 1 555 0123</a>
            </li>
            <li>
              <span>Lima, Perú</span>
            </li>
          </ul>
        </div>
      </div>
      <p className={styles.legal}>© 2026 IntiGuard. Todos los precios incluyen IGV.</p>
    </footer>
  );
}
