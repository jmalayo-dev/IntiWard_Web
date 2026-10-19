import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TIPO_COMPROBANTE, useComprobantes } from '@/entities/comprobante';
import { useUsuarios } from '@/entities/usuario';
import { ESTADO_VENTA, EstadoVentaInsignia, useVentas } from '@/entities/venta';
import { RUTAS } from '@/shared/config';
import { contiene, descargarCsv, formatoFechaHora, formatoMoneda, formatoPedido, hoyIso, paginarLista, useTitulo } from '@/shared/lib';
import { Boton, Buscador, EncabezadoPagina, EstadoVacio, Icono, MensajeError, Paginacion, Pestanas, RangoFechas, Tabla } from '@/shared/ui';
import styles from './AdminVentasPage.module.css';

const ESTADOS = [
  { valor: '', texto: 'Todas' },
  { valor: 'CONFIRMADA', texto: 'Confirmadas' },
  { valor: 'PENDIENTE', texto: 'Pendientes' },
  { valor: 'ANULADA', texto: 'Anuladas' },
];

/** Vista 5.7 · Ventas. */
export function AdminVentasPage() {
  useTitulo('Ventas');
  const { data: ventas = [], isLoading, error, refetch } = useVentas();
  const { data: comprobantes = [] } = useComprobantes();
  const { data: usuarios = [] } = useUsuarios();
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [rango, setRango] = useState({ desde: '', hasta: '' });
  const [pagina, setPagina] = useState(0);

  const filas = useMemo(() => {
    const comprobanteDe = Object.fromEntries(comprobantes.map((c) => [c.idVenta, c]));
    const usuarioDe = Object.fromEntries(usuarios.map((u) => [u.id, u]));
    return ventas.map((v) => {
      const comprobante = comprobanteDe[v.id];
      const usuario = usuarioDe[v.idUsuario];
      return {
        ...v,
        comprobante,
        cliente: comprobante?.nombreRazonSocial ?? usuario?.nombreCompleto ?? `Usuario ${v.idUsuario}`,
        correo: usuario?.correo ?? '',
        unidades: v.detalles.reduce((s, d) => s + d.cantidad, 0),
      };
    });
  }, [ventas, comprobantes, usuarios]);

  const filtradas = filas.filter(
    (v) =>
      (!texto || contiene(formatoPedido(v.id), texto) || contiene(v.cliente, texto) || contiene(v.correo, texto)) &&
      (!estado || v.estado === estado) &&
      (!tipo || (tipo === 'SIN' ? !v.comprobante : v.comprobante?.tipo === tipo)) &&
      (!rango.desde || v.fechaVenta.slice(0, 10) >= rango.desde) &&
      (!rango.hasta || v.fechaVenta.slice(0, 10) <= rango.hasta),
  );
  const vista = paginarLista(filtradas, pagina, 10);
  const delMes = ventas.filter((v) => v.fechaVenta.slice(0, 7) === hoyIso().slice(0, 7)).length;

  const cambiar = (fn) => (valor) => {
    fn(valor);
    setPagina(0);
  };

  const exportar = () =>
    descargarCsv('ventas.csv', [
      { titulo: 'Pedido', valor: (v) => formatoPedido(v.id) },
      { titulo: 'Fecha', valor: (v) => formatoFechaHora(v.fechaVenta) },
      { titulo: 'Cliente', valor: (v) => v.cliente },
      { titulo: 'Correo', valor: (v) => v.correo },
      { titulo: 'Productos', valor: (v) => v.unidades },
      { titulo: 'Comprobante', valor: (v) => v.comprobante?.numero ?? '' },
      { titulo: 'Estado', valor: (v) => ESTADO_VENTA[v.estado]?.texto ?? v.estado },
      { titulo: 'Total', valor: (v) => v.total.toFixed(2) },
    ], filtradas);

  const columnas = [
    {
      clave: 'pedido',
      titulo: 'Pedido',
      render: (v) => (
        <Link to={RUTAS.adminVenta(v.id)} className={styles.pedido}>
          {formatoPedido(v.id)}
        </Link>
      ),
    },
    { clave: 'fecha', titulo: 'Fecha', render: (v) => <span className={styles.nowrap}>{formatoFechaHora(v.fechaVenta)}</span> },
    {
      clave: 'cliente',
      titulo: 'Cliente',
      render: (v) => (
        <span className={styles.cliente}>
          <strong>{v.cliente}</strong>
          <span>{v.correo}</span>
        </span>
      ),
    },
    { clave: 'unidades', titulo: 'Productos', alinear: 'center' },
    {
      clave: 'comprobante',
      titulo: 'Comprobante',
      render: (v) => (v.comprobante ? <span className={styles.nowrap}>{`${TIPO_COMPROBANTE[v.comprobante.tipo]?.texto} ${v.comprobante.numero}`}</span> : '—'),
    },
    { clave: 'estado', titulo: 'Estado', render: (v) => <EstadoVentaInsignia estado={v.estado} /> },
    { clave: 'total', titulo: 'Total', alinear: 'right', render: (v) => <strong className={styles.nowrap}>{formatoMoneda(v.total)}</strong> },
    {
      clave: 'ver',
      titulo: '',
      alinear: 'right',
      render: (v) => (
        <Link to={RUTAS.adminVenta(v.id)} className={styles.ver}>
          Ver
        </Link>
      ),
    },
  ];

  if (error) return <MensajeError error={error} alReintentar={refetch} />;

  return (
    <div>
      <EncabezadoPagina
        titulo="Ventas"
        subtitulo={`${delMes} ${delMes === 1 ? 'venta' : 'ventas'} este mes`}
        acciones={
          <Boton variante="secundario" onClick={exportar} disabled={!filtradas.length}>
            <Icono nombre="descargar" tamano={18} /> Exportar
          </Boton>
        }
      />
      <div className={styles.herramientas}>
        <Buscador className={styles.buscador} placeholder="Pedido o cliente…" etiqueta="Buscar pedido o cliente" value={texto} onChange={(e) => cambiar(setTexto)(e.target.value)} />
        <Pestanas variante="segmentos" etiqueta="Estado" opciones={ESTADOS} valor={estado} alCambiar={cambiar(setEstado)} />
        <select className={styles.selector} value={tipo} onChange={(e) => cambiar(setTipo)(e.target.value)} aria-label="Comprobante">
          <option value="">Comprobante: Todos</option>
          <option value="BOLETA">Boletas</option>
          <option value="FACTURA">Facturas</option>
          <option value="SIN">Sin comprobante</option>
        </select>
        <RangoFechas desde={rango.desde} hasta={rango.hasta} alCambiar={cambiar(setRango)} />
      </div>
      <Tabla
        columnas={columnas}
        filas={vista.items}
        vacio={!isLoading && <EstadoVacio icono="carrito" titulo="No hay ventas con esos filtros" />}
        pie={<Paginacion {...vista} unidad={['venta', 'ventas']} alCambiar={setPagina} />}
      />
    </div>
  );
}
