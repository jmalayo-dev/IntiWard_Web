import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TIPO_COMPROBANTE, useComprobantes } from '@/entities/comprobante';
import { useProductos } from '@/entities/producto';
import { useStocks } from '@/entities/stock';
import { useUsuarios } from '@/entities/usuario';
import { EstadoVentaInsignia, useVentas } from '@/entities/venta';
import { RUTAS } from '@/shared/config';
import { formatoFechaHora, formatoFechaLarga, formatoMoneda, formatoPedido, hoyIso, useTitulo } from '@/shared/lib';
import { EncabezadoPagina, GraficoBarras, Icono, Indicador, Insignia, MensajeError, Tabla, Tarjeta } from '@/shared/ui';
import { inicioDe, periodoAnterior, ultimos7Dias, ventasEntre } from '../model/calculos';
import styles from './AdminResumenPage.module.css';

const PERIODOS = [
  { valor: 'hoy', texto: 'Hoy', titulo: 'Ventas de hoy', comparacion: 'vs. ayer' },
  { valor: 'semana', texto: 'Últimos 7 días', titulo: 'Ventas de los últimos 7 días', comparacion: 'vs. 7 días anteriores' },
  { valor: 'mes', texto: 'Este mes', titulo: 'Ventas del mes', comparacion: 'vs. período anterior' },
];

const soles = (n) => `S/ ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

function Variacion({ actual, anterior, texto }) {
  if (!anterior) return null;
  const porcentaje = Math.round(((actual - anterior) / anterior) * 100);
  const sube = porcentaje >= 0;
  return (
    <span className={sube ? styles.sube : styles.baja}>
      {sube ? '▲' : '▼'} {Math.abs(porcentaje)} % {texto}
    </span>
  );
}

/** Vista 5.1 · Resumen. Todo se calcula con los datos que ya da el backend (ventas, comprobantes y stock). */
export function AdminResumenPage() {
  useTitulo('Resumen');
  const [periodo, setPeriodo] = useState('hoy');
  const { data: ventas = [], error, refetch } = useVentas();
  const { data: comprobantes = [] } = useComprobantes();
  const { data: stock } = useStocks();
  const { data: productos } = useProductos({ size: 100 });
  const { data: usuarios = [] } = useUsuarios();

  const hoy = hoyIso();
  const elegido = PERIODOS.find((p) => p.valor === periodo);
  const desde = inicioDe(periodo, hoy);
  const actual = ventasEntre(ventas, desde, hoy);
  const anterior = periodoAnterior(desde, hoy);
  const previo = ventasEntre(ventas, anterior.desde, anterior.hasta);
  const delMes = ventasEntre(ventas, inicioDe('mes', hoy), hoy);
  const emitidos = comprobantes.filter((c) => c.emitidoEn.slice(0, 10) >= desde);
  const boletas = emitidos.filter((c) => c.tipo === 'BOLETA').length;

  const atencion = useMemo(() => {
    if (!stock || !productos) return [];
    return productos.items
      .map((p) => ({ ...p, libre: stock[p.id]?.libre ?? 0 }))
      .filter((p) => p.libre <= 5)
      .sort((a, b) => a.libre - b.libre)
      .slice(0, 4);
  }, [stock, productos]);
  // Solo productos activos: uno inactivo sin stock no necesita atención
  const agotados = stock && productos ? productos.items.filter((p) => (stock[p.id]?.disponible ?? 0) <= 0).length : 0;

  const comprobanteDe = Object.fromEntries(comprobantes.map((c) => [c.idVenta, c]));
  const nombreDe = Object.fromEntries(usuarios.map((u) => [u.id, u.nombreCompleto]));
  const ultimas = ventas.slice(0, 5);

  if (error) return <MensajeError error={error} alReintentar={refetch} />;

  return (
    <div className={styles.resumen}>
      <EncabezadoPagina
        titulo="Resumen"
        subtitulo={`Hoy, ${formatoFechaLarga(hoy)}`}
        acciones={
          <select className={styles.periodo} value={periodo} onChange={(e) => setPeriodo(e.target.value)} aria-label="Período">
            {PERIODOS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.texto}
              </option>
            ))}
          </select>
        }
      />

      <div className={styles.indicadores}>
        <Indicador
          icono="dolar"
          tono="info"
          titulo={elegido.titulo}
          valor={formatoMoneda(actual.total)}
          detalle={
            <span className={styles.detalleFila}>
              {actual.cantidad} {actual.cantidad === 1 ? 'venta' : 'ventas'}
              <Variacion actual={actual.total} anterior={previo.total} texto={elegido.comparacion} />
            </span>
          }
        />
        <Indicador icono="calendario" tono="advertencia" titulo="Ventas del mes" valor={formatoMoneda(delMes.total)} detalle={`${delMes.cantidad} ventas`} />
        <Indicador
          icono="documento"
          tono="exito"
          titulo={periodo === 'hoy' ? 'Comprobantes emitidos hoy' : 'Comprobantes emitidos'}
          valor={emitidos.length}
          detalle={`${boletas} ${boletas === 1 ? 'boleta' : 'boletas'} · ${emitidos.length - boletas} ${emitidos.length - boletas === 1 ? 'factura' : 'facturas'}`}
        />
        <Indicador
          icono="alertaTriangulo"
          tono="error"
          titulo="Productos agotados"
          valor={agotados}
          tonoValor={agotados ? 'error' : undefined}
          detalle={
            <Link to={RUTAS.adminStock} state={{ filtro: 'agotados' }} className={styles.enlace}>
              Ver stock
            </Link>
          }
        />
      </div>

      <div className={styles.fila}>
        <Tarjeta titulo="Ventas de los últimos 7 días" accion={<span className={styles.expresado}>Expresado en S/</span>}>
          <GraficoBarras datos={ultimos7Dias(ventas, hoy)} formato={soles} etiqueta="Ventas de los últimos 7 días" tresD color="#BAAAA0" />
        </Tarjeta>
        <Tarjeta titulo="Stock que necesita atención">
          {atencion.length ? (
            <ul className={styles.atencion}>
              {atencion.map((p) => (
                <li key={p.id}>
                  <div className={styles.atencionTexto}>
                    <strong>{p.nombre}</strong>
                    <span>{p.categoria}</span>
                  </div>
                  <Insignia tono={p.libre === 0 ? 'error' : 'advertencia'}>{p.libre === 0 ? 'Agotado' : `${p.libre} ${p.libre === 1 ? 'unidad' : 'unidades'}`}</Insignia>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.gris}>Todos los productos tienen más de 5 unidades.</p>
          )}
          <Link to={RUTAS.adminStock} className={styles.irA}>
            Ir a stock <Icono nombre="flechaDerecha" tamano={16} />
          </Link>
        </Tarjeta>
      </div>

      <Tarjeta
        sinRelleno
        titulo="Últimas ventas"
        accion={
          <Link to={RUTAS.adminVentas} className={styles.verTodas}>
            Ver todas <Icono nombre="flechaDerecha" tamano={16} />
          </Link>
        }
      >
        <Tabla
          sinBorde
          filas={ultimas}
          columnas={[
            {
              clave: 'pedido',
              titulo: 'Pedido',
              render: (v) => (
                <Link to={RUTAS.adminVenta(v.id)} className={styles.pedido}>
                  {formatoPedido(v.id)}
                </Link>
              ),
            },
            { clave: 'cliente', titulo: 'Cliente', render: (v) => comprobanteDe[v.id]?.nombreRazonSocial ?? nombreDe[v.idUsuario] ?? `Usuario ${v.idUsuario}` },
            { clave: 'fecha', titulo: 'Fecha', render: (v) => <span className={styles.gris}>{formatoFechaHora(v.fechaVenta)}</span> },
            {
              clave: 'comprobante',
              titulo: 'Comprobante',
              render: (v) =>
                comprobanteDe[v.id] ? (
                  <span className={styles.mono}>
                    {TIPO_COMPROBANTE[comprobanteDe[v.id].tipo]?.texto} {comprobanteDe[v.id].numero}
                  </span>
                ) : (
                  '—'
                ),
            },
            { clave: 'estado', titulo: 'Estado', render: (v) => <EstadoVentaInsignia estado={v.estado} punto /> },
            { clave: 'total', titulo: 'Total', alinear: 'right', render: (v) => <strong>{formatoMoneda(v.total)}</strong> },
          ]}
        />
      </Tarjeta>
    </div>
  );
}
