import { ProductoImagen, useProducto } from '@/entities/producto';
import { formatoMoneda } from '@/shared/lib';
import styles from './ProductosVenta.module.css';

/** Miniatura de la línea: la imagen actual del producto (si ya no está en la tienda, el ícono). */
function Miniatura({ idProducto, nombre }) {
  const { data } = useProducto(idProducto);
  return <ProductoImagen producto={data ?? { nombre }} tamano={56} />;
}

/** Tarjeta "Productos": producto, precio unitario, cantidad e importe. Precios del día de la compra. */
export function ProductosVenta({ venta, nota = 'Precios del día de tu compra.' }) {
  return (
    <section className={styles.tarjeta}>
      <h2 className={styles.titulo}>Productos</h2>
      <div className={styles.tablaContenedor}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Producto</th>
              <th className={styles.derecha}>Precio unitario</th>
              <th className={styles.centro}>Cantidad</th>
              <th className={styles.derecha}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {venta.detalles.map((d) => (
              <tr key={d.idProducto}>
                <td>
                  <span className={styles.producto}>
                    <Miniatura idProducto={d.idProducto} nombre={d.nombreProducto} />
                    {d.nombreProducto}
                  </span>
                </td>
                <td className={styles.derecha}>{formatoMoneda(d.precioUnitario)}</td>
                <td className={styles.centro}>{d.cantidad}</td>
                <td className={`${styles.derecha} ${styles.fuerte}`}>{formatoMoneda(d.importe)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.nota}>{nota}</p>
    </section>
  );
}
