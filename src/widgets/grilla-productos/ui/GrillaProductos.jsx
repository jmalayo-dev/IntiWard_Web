import { ProductoCard } from '@/entities/producto';
import { StockInsignia, useStocks } from '@/entities/stock';
import { BotonAgregarAlCarrito } from '@/features/agregar-al-carrito';
import { Cargando } from '@/shared/ui';
import styles from './GrillaProductos.module.css';

function TarjetaEsqueleto() {
  return (
    <div className={styles.esqueleto} aria-hidden="true">
      <Cargando alto={180} />
      <Cargando ancho="40%" alto={12} />
      <Cargando ancho="85%" alto={18} />
      <Cargando ancho="50%" alto={22} />
      <Cargando alto={44} />
    </div>
  );
}

/**
 * Tarjetas de producto con su insignia de stock y "Agregar al carrito".
 * El stock se pide en una sola llamada para toda la grilla (GET /stock?ids=…).
 * `columnas`: 3 (catálogo) o 4 (inicio, relacionados).
 */
export function GrillaProductos({ productos = [], cargando = false, columnas = 4, esqueletos = 6 }) {
  const ids = productos.map((p) => p.id);
  const { data: stock } = useStocks(ids);

  if (cargando) {
    return (
      <div className={`${styles.grilla} ${styles[`c${columnas}`]}`} role="status" aria-label="Cargando productos">
        {Array.from({ length: esqueletos }, (_, i) => (
          <TarjetaEsqueleto key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`${styles.grilla} ${styles[`c${columnas}`]}`}>
      {productos.map((p) => {
        const libre = stock?.[p.id]?.libre;
        return (
          <ProductoCard
            key={p.id}
            producto={p}
            insignia={libre !== undefined && <StockInsignia disponible={libre} />}
            accion={<BotonAgregarAlCarrito idProducto={p.id} disponible={libre ?? 1} />}
          />
        );
      })}
    </div>
  );
}
