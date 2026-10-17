import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TIPO_COMPROBANTE, useComprobantes } from '@/entities/comprobante';
import { ProductoImagen, useProducto } from '@/entities/producto';
import { EstadoVentaInsignia, useVentas } from '@/entities/venta';
import { RUTAS } from '@/shared/config';
import { formatoFecha, formatoMoneda, formatoPedido, hoyIso, sumarDias, useTitulo } from '@/shared/lib';
import { Cargando, EncabezadoPagina, EstadoVacio, MensajeError, Pestanas } from '@/shared/ui';
import styles from './MisPedidosPage.module.css';

const PERIODOS = [
  { valor: '90', texto: 'Últimos 3 meses' },
  { valor: '30', texto: 'Últimos 30 días' },
  { valor: '365', texto: 'Último año' },
  { valor: '', texto: 'Todos' },
];

function Miniatura({ idProducto, nombre }) {
  const { data } = useProducto(idProducto);
  return <ProductoImagen producto={data ?? { nombre }} tamano={44} />;
}

/** Vista 4.10 · Mis pedidos. */
export function MisPedidosPage() {
  useTitulo('Mis pedidos');
  const { data: ventas, isLoading, error, refetch } = useVentas();
  const { data: comprobantes = [] } = useComprobantes();
  const [estado, setEstado] = useState('');
  const [periodo, setPeriodo] = useState('90');

  const comprobanteDe = useMemo(() => Object.fromEntries(comprobantes.map((c) => [c.idVenta, c])), [comprobantes]);
  const enPeriodo = (ventas ?? []).filter((v) => !periodo || v.fechaVenta.slice(0, 10) >= sumarDias(hoyIso(), -Number(periodo)));
  const cuenta = (e) => enPeriodo.filter((v) => v.estado === e).length;
  const lista = enPeriodo.filter((v) => !estado || v.estado === estado);

  if (error) return <MensajeError error={error} alReintentar={refetch} />;

  return (
    <div>
      <EncabezadoPagina titulo="Mis pedidos" subtitulo="Revisa tus compras y descarga tus comprobantes" />

      {isLoading ? (
        <Cargando lineas={4} alto={88} />
      ) : !ventas.length ? (
        <div className={styles.vacio}>
          <EstadoVacio
            icono="bolsa"
            titulo="Todavía no has comprado nada"
            accion={
              <Link to={RUTAS.catalogo} className={styles.botonPrimario}>
                Ver catálogo
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className={styles.filtros}>
            <Pestanas
              variante="pildora"
              etiqueta="Estado del pedido"
              valor={estado}
              alCambiar={setEstado}
              opciones={[
                { valor: '', texto: `Todos (${enPeriodo.length})` },
                { valor: 'CONFIRMADA', texto: `Confirmados (${cuenta('CONFIRMADA')})` },
                { valor: 'ANULADA', texto: `Anulados (${cuenta('ANULADA')})` },
                ...(cuenta('PENDIENTE') ? [{ valor: 'PENDIENTE', texto: `Pendientes (${cuenta('PENDIENTE')})` }] : []),
              ]}
            />
            <select className={styles.periodo} value={periodo} onChange={(e) => setPeriodo(e.target.value)} aria-label="Período">
              {PERIODOS.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.texto}
                </option>
              ))}
            </select>
          </div>

          {!lista.length ? (
            <div className={styles.vacio}>
              <EstadoVacio icono="bolsa" titulo="No hay pedidos en este período" texto="Prueba con otro estado o un período más largo." />
            </div>
          ) : (
            <ul className={styles.lista}>
              {lista.map((v) => {
                const comprobante = comprobanteDe[v.id];
                return (
                  <li key={v.id} className={styles.pedido}>
                    <div className={styles.numero}>
                      <strong>Pedido {formatoPedido(v.id)}</strong>
                      <span>{formatoFecha(v.fechaVenta)}</span>
                    </div>
                    <div className={styles.productos}>
                      <span className={styles.miniaturas}>
                        {v.detalles.slice(0, 3).map((d) => (
                          <Miniatura key={d.idProducto} idProducto={d.idProducto} nombre={d.nombreProducto} />
                        ))}
                      </span>
                      {v.detalles.length} {v.detalles.length === 1 ? 'producto' : 'productos'}
                    </div>
                    <div className={styles.estado}>
                      <EstadoVentaInsignia estado={v.estado} punto />
                    </div>
                    <div className={styles.comprobante}>
                      <span className={styles.rotulo}>Comprobante</span>
                      {comprobante ? (
                        <span className={styles.mono}>
                          {TIPO_COMPROBANTE[comprobante.tipo]?.texto} {comprobante.numero}
                        </span>
                      ) : (
                        <em className={styles.sin}>{v.estado === 'PENDIENTE' ? 'En proceso' : 'Sin comprobante'}</em>
                      )}
                    </div>
                    <div className={styles.total}>
                      <span className={styles.rotulo}>Total</span>
                      <strong>{formatoMoneda(v.total)}</strong>
                    </div>
                    <Link to={RUTAS.miPedido(v.id)} className={styles.botonSecundario}>
                      Ver detalle
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
