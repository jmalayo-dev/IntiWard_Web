import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PrecioTexto, ProductoImagen, useProducto, useProductos } from '@/entities/producto';
import { useSesion } from '@/entities/sesion';
import { StockInsignia, useStock } from '@/entities/stock';
import { BotonAgregarAlCarrito } from '@/features/agregar-al-carrito';
import { RUTAS } from '@/shared/config';
import { useTitulo } from '@/shared/lib';
import { Aviso, Cargando, Icono, Insignia, MensajeError, Migas, Pestanas, SelectorCantidad } from '@/shared/ui';
import { GrillaProductos } from '@/widgets/grilla-productos';
import { PantallaError } from '@/widgets/pantalla-error';
import styles from './ProductoDetallePage.module.css';

const GARANTIAS = ['Boleta o factura electrónica', 'Garantía de fábrica', 'Stock reservado al confirmar tu compra'];

function Relacionados({ producto }) {
  const { data: mismos } = useProductos({ categoria: producto.categoria, size: 5 });
  const { data: otros } = useProductos({ size: 12 });
  const lista = [...(mismos?.items ?? []), ...(otros?.items ?? [])]
    .filter((p, i, todos) => p.id !== producto.id && todos.findIndex((x) => x.id === p.id) === i)
    .slice(0, 4);
  if (!lista.length) return null;
  return (
    <section className={styles.relacionados} aria-labelledby="titulo-relacionados">
      <h2 id="titulo-relacionados" className={styles.tituloSeccion}>
        También te puede interesar
      </h2>
      <GrillaProductos productos={lista} />
    </section>
  );
}

/** Vista 4.3 · Detalle de producto. */
export function ProductoDetallePage() {
  const { id } = useParams();
  const { data: producto, isLoading, error, refetch } = useProducto(id);
  const { data: stock } = useStock(producto?.activo ? id : null);
  const { esAdmin } = useSesion();
  const [cantidad, setCantidad] = useState(1);
  const [pestana, setPestana] = useState('descripcion');
  useTitulo(producto?.nombre ?? 'Producto');

  if (error?.status === 404) return <PantallaError tipo={404} />;
  if (error) return <MensajeError error={error} alReintentar={refetch} />;
  if (isLoading) {
    return (
      <div className={styles.principal}>
        <Cargando alto={480} />
        <Cargando lineas={6} alto={24} />
      </div>
    );
  }

  const libre = stock ? Math.max(0, stock.disponible - stock.reservado) : undefined;
  const agotado = libre === 0;

  return (
    <div>
      <Migas
        items={[
          { texto: 'Inicio', a: RUTAS.inicio },
          { texto: producto.categoria, a: RUTAS.catalogoDe(producto.categoria) },
          { texto: producto.nombre },
        ]}
      />

      <div className={styles.principal}>
        <div className={styles.galeria}>
          <ProductoImagen producto={producto} className={styles.imagen} />
        </div>

        <div className={styles.info}>
          {!producto.activo && (
            <Aviso tipo="info">Este producto ya no está disponible{esAdmin ? ' en la tienda (está inactivo)' : ''}.</Aviso>
          )}
          <div className={styles.marcaFila}>
            <span className={styles.marca}>{producto.marca}</span>
            <Insignia tono="neutro">{producto.categoria}</Insignia>
          </div>
          <h1 className={styles.nombre}>{producto.nombre}</h1>
          <p className={styles.precio}>
            <PrecioTexto precio={producto.precio} tamano={32} />
            <span className={styles.igv}>Incluye IGV</span>
          </p>
          {producto.activo && libre !== undefined && (
            <div>
              <StockInsignia disponible={libre} detalle />
            </div>
          )}
          {producto.descripcion && <p className={styles.descripcionCorta}>{producto.descripcion}</p>}

          {producto.activo && !esAdmin && (
            <div className={styles.compra}>
              <div className={styles.cantidad}>
                <span className={styles.etiqueta}>Cantidad</span>
                <SelectorCantidad valor={agotado ? 0 : cantidad} minimo={1} maximo={libre ?? 1} disabled={agotado || libre === undefined} alCambiar={setCantidad} />
              </div>
              <BotonAgregarAlCarrito
                idProducto={producto.id}
                disponible={libre ?? 0}
                cantidad={Math.min(cantidad, libre ?? 1)}
                textoAgotado="No disponible"
                conIcono
                alAgregar={() => setCantidad(1)}
              />
            </div>
          )}

          <ul className={styles.garantias}>
            {GARANTIAS.map((g) => (
              <li key={g}>
                <Icono nombre="check" tamano={18} className={styles.check} />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className={styles.pestanas}>
        <Pestanas
          etiqueta="Información del producto"
          opciones={[
            { valor: 'descripcion', texto: 'Descripción' },
            { valor: 'especificaciones', texto: 'Especificaciones' },
          ]}
          valor={pestana}
          alCambiar={setPestana}
        />
        <div className={styles.panelPestana} role="tabpanel">
          {pestana === 'descripcion' ? (
            <p>{producto.descripcion || 'Este producto aún no tiene descripción.'}</p>
          ) : producto.especificaciones.length ? (
            <table className={styles.especificaciones}>
              <tbody>
                {producto.especificaciones.map((e) => (
                  <tr key={e.nombre}>
                    <th scope="row">{e.nombre}</th>
                    <td>{e.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Este producto aún no tiene especificaciones.</p>
          )}
        </div>
      </section>

      <Relacionados producto={producto} />
    </div>
  );
}
