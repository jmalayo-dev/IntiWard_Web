import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TIPO_MOVIMIENTO, TipoMovimientoInsignia } from '@/entities/movimiento';
import { RUTAS } from '@/shared/config';
import { descargarCsv, formatoFechaHora, formatoPedido, paginarLista } from '@/shared/lib';
import { Boton, EstadoVacio, Icono, Paginacion, RangoFechas, Tabla } from '@/shared/ui';
import styles from './TablaMovimientos.module.css';

const TAMANO = 10;

/** Cantidad con color: la entrada en verde, el ajuste con su signo (rojo si resta). */
function Cantidad({ movimiento }) {
  const { tipo, cantidad } = movimiento;
  if (tipo === 'AJUSTE') {
    return <span className={cantidad < 0 ? styles.negativo : styles.positivo}>{cantidad > 0 ? `+${cantidad}` : `−${Math.abs(cantidad)}`}</span>;
  }
  return <span className={tipo === 'ENTRADA' ? styles.positivo : undefined}>{cantidad}</span>;
}

/**
 * Historial de stock con filtros (vista 5.6). movimientos: los de GET /movimientos; productos: [{ id, nombre }].
 * `idProducto` inicial viene de ?idProducto= (botón "Ver movimientos" de la vista 5.5).
 */
export function TablaMovimientos({ movimientos = [], productos = [], idProducto: idInicial = '', alCambiarProducto }) {
  const [idProducto, setIdProducto] = useState(idInicial);
  const [tipo, setTipo] = useState('');
  const [rango, setRango] = useState({ desde: '', hasta: '' });
  const [pagina, setPagina] = useState(0);

  const nombreDe = useMemo(() => Object.fromEntries(productos.map((p) => [p.id, p.nombre])), [productos]);

  const filtrados = useMemo(
    () =>
      movimientos.filter(
        (m) =>
          (!idProducto || m.idProducto === Number(idProducto)) &&
          (!tipo || m.tipo === tipo) &&
          (!rango.desde || m.creadoEn.slice(0, 10) >= rango.desde) &&
          (!rango.hasta || m.creadoEn.slice(0, 10) <= rango.hasta),
      ),
    [movimientos, idProducto, tipo, rango],
  );
  const vista = paginarLista(filtrados, pagina, TAMANO);

  const cambiar = (fn) => (valor) => {
    fn(valor);
    setPagina(0);
  };

  const exportar = () =>
    descargarCsv('movimientos.csv', [
      { titulo: 'Fecha y hora', valor: (m) => formatoFechaHora(m.creadoEn) },
      { titulo: 'Producto', valor: (m) => nombreDe[m.idProducto] ?? m.idProducto },
      { titulo: 'Tipo', valor: (m) => TIPO_MOVIMIENTO[m.tipo]?.texto ?? m.tipo },
      { titulo: 'Cantidad', valor: (m) => m.cantidad },
      { titulo: 'Venta', valor: (m) => (m.idVenta ? formatoPedido(m.idVenta) : '') },
      { titulo: 'Motivo', valor: (m) => m.motivo ?? '' },
    ], filtrados);

  const columnas = [
    { clave: 'fecha', titulo: 'Fecha y hora', render: (m) => <span className={styles.gris}>{formatoFechaHora(m.creadoEn)}</span> },
    { clave: 'producto', titulo: 'Producto', render: (m) => <strong className={styles.producto}>{nombreDe[m.idProducto] ?? `Producto ${m.idProducto}`}</strong> },
    { clave: 'tipo', titulo: 'Tipo', render: (m) => <TipoMovimientoInsignia tipo={m.tipo} /> },
    { clave: 'cantidad', titulo: 'Cantidad', alinear: 'right', render: (m) => <Cantidad movimiento={m} /> },
    {
      clave: 'venta',
      titulo: 'Venta',
      render: (m) =>
        m.idVenta ? (
          <Link to={RUTAS.adminVenta(m.idVenta)} className={styles.enlace}>
            {formatoPedido(m.idVenta)}
          </Link>
        ) : (
          '—'
        ),
    },
    { clave: 'motivo', titulo: 'Motivo', render: (m) => m.motivo ?? '—' },
  ];

  return (
    <div className={styles.contenedor}>
      <div className={styles.herramientas}>
        <select
          className={styles.selector}
          value={idProducto}
          onChange={(e) => {
            cambiar(setIdProducto)(e.target.value);
            alCambiarProducto?.(e.target.value);
          }}
          aria-label="Filtrar por producto"
        >
          <option value="">Producto: Todos</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        <select className={styles.selector} value={tipo} onChange={(e) => cambiar(setTipo)(e.target.value)} aria-label="Filtrar por tipo">
          <option value="">Tipo: Todos</option>
          {Object.entries(TIPO_MOVIMIENTO).map(([clave, { texto }]) => (
            <option key={clave} value={clave}>
              {texto}
            </option>
          ))}
        </select>
        <RangoFechas desde={rango.desde} hasta={rango.hasta} alCambiar={cambiar(setRango)} />
        <Boton variante="secundario" onClick={exportar} disabled={!filtrados.length} className={styles.exportar}>
          <Icono nombre="descargar" tamano={18} /> Exportar
        </Boton>
      </div>

      <Tabla
        columnas={columnas}
        filas={vista.items}
        vacio={<EstadoVacio icono="flechas" titulo="No hay movimientos" texto="Prueba con otro producto, tipo o rango de fechas." />}
        pie={<Paginacion {...vista} unidad={['movimiento', 'movimientos']} alCambiar={setPagina} />}
      />
    </div>
  );
}
