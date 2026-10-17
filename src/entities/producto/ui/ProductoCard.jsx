import { Link } from 'react-router-dom';
import { RUTAS } from '@/shared/config';
import { PrecioTexto } from './PrecioTexto';
import { ProductoImagen } from './ProductoImagen';
import styles from './ProductoCard.module.css';

/** Tarjeta de producto (PROTOTIPO_WEB.md §1.5). Sin acciones: `insignia` y `accion` los pone quien la usa. */
export function ProductoCard({ producto, insignia, accion }) {
  return (
    <article className={styles.tarjeta}>
      <Link to={RUTAS.producto(producto.id)} className={styles.enlace}>
        <ProductoImagen producto={producto} />
        <p className={styles.marca}>{producto.marca}</p>
        <h3 className={styles.nombre}>{producto.nombre}</h3>
      </Link>
      <div className={styles.pie}>
        <PrecioTexto precio={producto.precio} />
        <div className={styles.insignia}>{insignia}</div>
        {accion}
      </div>
    </article>
  );
}
