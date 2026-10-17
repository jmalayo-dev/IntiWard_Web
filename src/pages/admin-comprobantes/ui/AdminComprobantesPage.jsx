import { useMemo, useState } from 'react';
import { TIPO_COMPROBANTE, TipoComprobanteInsignia, useComprobantes } from '@/entities/comprobante';
import { useVenta } from '@/entities/venta';
import { BotonDescargarComprobante, useDescargarComprobante } from '@/features/descargar-comprobante';
import { RUTAS } from '@/shared/config';
import { contiene, descargarCsv, formatoFecha, formatoMoneda, paginarLista, useTitulo } from '@/shared/lib';
import { Boton, Buscador, EncabezadoPagina, EstadoVacio, Icono, MensajeError, Paginacion, PanelLateral, Pestanas, RangoFechas, Tabla } from '@/shared/ui';
import { HojaComprobante } from '@/widgets/hoja-comprobante';
import styles from './AdminComprobantesPage.module.css';

const TIPOS = [
  { valor: '', texto: 'Todos' },
  { valor: 'BOLETA', texto: 'Boletas' },
  { valor: 'FACTURA', texto: 'Facturas' },
];

function Resumen({ titulo, lista }) {
  const ultima = lista[0];
  return (
    <section className={styles.resumen}>
      <h2 className={styles.resumenTitulo}>{titulo}</h2>
      <p className={styles.resumenValor}>
        {lista.length}
        {ultima && <span className={styles.ultima}>Última: {ultima.numero}</span>}
      </p>
    </section>
  );
}

function DetalleComprobante({ comprobante }) {
  const { data: venta } = useVenta(comprobante.idVenta);
  return <HojaComprobante comprobante={comprobante} venta={venta} compacta />;
}

/** Vista 5.8 · Comprobantes, con la hoja del comprobante en un panel lateral. */
export function AdminComprobantesPage() {
  useTitulo('Comprobantes');
  const { data: comprobantes = [], isLoading, error, refetch } = useComprobantes();
  const descargar = useDescargarComprobante();
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState('');
  const [rango, setRango] = useState({ desde: '', hasta: '' });
  const [pagina, setPagina] = useState(0);
  const [elegido, setElegido] = useState(null);

  // La lista llega del más nuevo al más antiguo
  const boletas = useMemo(() => comprobantes.filter((c) => c.tipo === 'BOLETA'), [comprobantes]);
  const facturas = useMemo(() => comprobantes.filter((c) => c.tipo === 'FACTURA'), [comprobantes]);

  const filtrados = comprobantes.filter(
    (c) =>
      (!texto || contiene(c.numero, texto) || contiene(c.docCliente, texto) || contiene(c.nombreRazonSocial, texto)) &&
      (!tipo || c.tipo === tipo) &&
      (!rango.desde || c.emitidoEn.slice(0, 10) >= rango.desde) &&
      (!rango.hasta || c.emitidoEn.slice(0, 10) <= rango.hasta),
  );
  const vista = paginarLista(filtrados, pagina, 10);
  const cambiar = (fn) => (valor) => {
    fn(valor);
    setPagina(0);
  };

  const exportar = () =>
    descargarCsv('comprobantes.csv', [
      { titulo: 'Número', valor: (c) => c.numero },
      { titulo: 'Tipo', valor: (c) => TIPO_COMPROBANTE[c.tipo]?.texto },
      { titulo: 'Fecha de emisión', valor: (c) => formatoFecha(c.emitidoEn) },
      { titulo: 'Cliente', valor: (c) => c.nombreRazonSocial },
      { titulo: 'Documento', valor: (c) => (c.docCliente ? `${TIPO_COMPROBANTE[c.tipo]?.documento} ${c.docCliente}` : '') },
      { titulo: 'Subtotal', valor: (c) => c.subtotal.toFixed(2) },
      { titulo: 'IGV', valor: (c) => c.igv.toFixed(2) },
      { titulo: 'Total', valor: (c) => c.total.toFixed(2) },
    ], filtrados);

  const columnas = [
    { clave: 'numero', titulo: 'Número', render: (c) => <span className={styles.mono}>{c.numero}</span> },
    { clave: 'tipo', titulo: 'Tipo', render: (c) => <TipoComprobanteInsignia tipo={c.tipo} /> },
    { clave: 'fecha', titulo: 'Fecha de emisión', render: (c) => formatoFecha(c.emitidoEn) },
    { clave: 'cliente', titulo: 'Cliente', render: (c) => <span className={styles.cliente}>{c.nombreRazonSocial}</span> },
    {
      clave: 'documento',
      titulo: 'Documento',
      render: (c) => (c.docCliente ? <span className={styles.mono}>{`${TIPO_COMPROBANTE[c.tipo]?.documento} ${c.docCliente}`}</span> : '—'),
    },
    { clave: 'subtotal', titulo: 'Subtotal', alinear: 'right', render: (c) => <span className={styles.nowrap}>{formatoMoneda(c.subtotal)}</span> },
    { clave: 'igv', titulo: 'IGV', alinear: 'right', render: (c) => <span className={styles.nowrap}>{formatoMoneda(c.igv)}</span> },
    { clave: 'total', titulo: 'Total', alinear: 'right', render: (c) => <strong className={styles.nowrap}>{formatoMoneda(c.total)}</strong> },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      alinear: 'right',
      render: (c) => (
        <span className={styles.acciones} onClick={(e) => e.stopPropagation()}>
          <button type="button" className={styles.icono} onClick={() => setElegido(c)} aria-label={`Ver ${c.numero}`} title="Ver">
            <Icono nombre="ojo" />
          </button>
          <button
            type="button"
            className={styles.icono}
            onClick={() => descargar.mutate({ id: c.id, numero: c.numero })}
            aria-label={`Descargar PDF de ${c.numero}`}
            title="Descargar PDF"
          >
            <Icono nombre="descargar" />
          </button>
        </span>
      ),
    },
  ];

  if (error) return <MensajeError error={error} alReintentar={refetch} />;

  return (
    <div>
      <EncabezadoPagina titulo="Comprobantes" />
      <div className={styles.resumenes}>
        <Resumen titulo="Boletas emitidas" lista={boletas} />
        <Resumen titulo="Facturas emitidas" lista={facturas} />
      </div>
      <div className={styles.herramientas}>
        <Buscador className={styles.buscador} placeholder="Número, DNI o RUC…" etiqueta="Buscar por número, DNI o RUC" value={texto} onChange={(e) => cambiar(setTexto)(e.target.value)} />
        <Pestanas variante="segmentos" etiqueta="Tipo de comprobante" opciones={TIPOS} valor={tipo} alCambiar={cambiar(setTipo)} />
        <RangoFechas desde={rango.desde} hasta={rango.hasta} alCambiar={cambiar(setRango)} />
        <Boton variante="secundario" onClick={exportar} disabled={!filtrados.length} className={styles.exportar}>
          <Icono nombre="descargar" tamano={18} /> Exportar
        </Boton>
      </div>
      <Tabla
        columnas={columnas}
        filas={vista.items}
        alClicFila={setElegido}
        claseFila={(c) => (c.id === elegido?.id ? 'seleccionada' : undefined)}
        vacio={!isLoading && <EstadoVacio icono="documento" titulo="No hay comprobantes con esos filtros" />}
        pie={<Paginacion {...vista} numeros alCambiar={setPagina} />}
      />

      <PanelLateral
        abierto={Boolean(elegido)}
        titulo={
          elegido && (
            <>
              <span className={styles.rotulo}>Comprobante</span> <span className={styles.mono}>{elegido.numero}</span>
            </>
          )
        }
        alCerrar={() => setElegido(null)}
        acciones={
          elegido && (
            <>
              <BotonDescargarComprobante comprobante={elegido} texto="Descargar PDF" />
              <Boton variante="secundario" onClick={() => window.open(RUTAS.comprobanteImprimible(elegido.id), '_blank')}>
                Imprimir
              </Boton>
            </>
          )
        }
      >
        {elegido && <DetalleComprobante comprobante={elegido} />}
      </PanelLateral>
    </div>
  );
}
