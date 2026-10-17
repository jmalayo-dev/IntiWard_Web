import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '@/entities/carrito';
import { ProductoImagen } from '@/entities/producto';
import { useStocks } from '@/entities/stock';
import { CantidadCarrito } from '@/features/cambiar-cantidad-carrito';
import { BotonQuitarDelCarrito } from '@/features/quitar-del-carrito';
import { RUTAS } from '@/shared/config';
import { formatoMoneda, useTitulo } from '@/shared/lib';
import { Boton, Cargando, EncabezadoPagina, EstadoVacio, Insignia, MensajeError } from '@/shared/ui';
import { estadoCarrito, ResumenCarrito } from '@/widgets/resumen-carrito';
import styles from './CarritoPage.module.css';

/** Vista 4.6 · Carrito. */
export function CarritoPage() {
  useTitulo('Tu carrito');
  const navigate = useNavigate();
  const { data: carrito, isLoading, error, refetch } = useCarrito();
  const { data: stock } = useStocks(carrito?.items.map((i) => i.idProducto) ?? []);
  const { lineas, subtotal, igv, total, bloqueado } = estadoCarrito(carrito, stock);

  if (error) return <MensajeError error={error} alReintentar={refetch} />;
  if (isLoading) return <Cargando lineas={4} alto={96} />;

  if (!lineas.length) {
    return (
      <div className={styles.vacio}>
        <EstadoVacio
          icono="carrito"
          titulo="Tu carrito está vacío"
          texto="Explora el catálogo y agrega tus productos."
          accion={
            <Link to={RUTAS.catalogo} className={styles.botonEnlace}>
              Ver catálogo
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <EncabezadoPagina titulo="Tu carrito" subtitulo={`${carrito.unidades} ${carrito.unidades === 1 ? 'producto' : 'productos'}`} />
      <div className={styles.columnas}>
        <div>
          <ul className={styles.lista}>
            {lineas.map((l) => (
              <li key={l.idProducto} className={styles.linea}>
                <Link to={RUTAS.producto(l.idProducto)} className={styles.miniatura}>
                  <ProductoImagen producto={l} tamano={80} />
                </Link>
                <div className={styles.datos}>
                  <Link to={RUTAS.producto(l.idProducto)} className={styles.nombre}>
                    {l.nombre}
                  </Link>
                  <span className={styles.gris}>{l.marca}</span>
                  <span className={styles.gris}>{formatoMoneda(l.precio)}</span>
                </div>
                {l.agotado ? (
                  <div className={styles.agotado}>
                    <Insignia tono="error">Agotado</Insignia>
                    <span>Quita este producto para continuar</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.cantidad}>
                      <CantidadCarrito idProducto={l.idProducto} cantidad={l.cantidad} maximo={l.libre ?? l.cantidad} />
                      {l.excede && <span className={styles.aviso}>Solo quedan {l.libre}</span>}
                    </div>
                    <strong className={styles.importe}>{formatoMoneda(l.importe)}</strong>
                  </>
                )}
                <BotonQuitarDelCarrito idProducto={l.idProducto} nombre={l.nombre} />
              </li>
            ))}
          </ul>
          <Link to={RUTAS.catalogo} className={styles.seguir}>
            ← Seguir comprando
          </Link>
        </div>

        <ResumenCarrito titulo="Resumen de compra" subtotal={subtotal} igv={igv} total={total} nota="Los precios se confirman al finalizar la compra." fijo>
          <Boton anchoCompleto disabled={bloqueado} onClick={() => navigate(RUTAS.checkout)}>
            Continuar compra
          </Boton>
        </ResumenCarrito>
      </div>
    </div>
  );
}
