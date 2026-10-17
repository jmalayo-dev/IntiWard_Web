import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProductoImagen, useProductos } from '@/entities/producto';
import { StockInsignia, UMBRAL_ULTIMAS_UNIDADES, useStocks } from '@/entities/stock';
import { ModalAjusteStock } from '@/features/ajustar-stock';
import { ModalEntradaStock } from '@/features/registrar-entrada-stock';
import { RUTAS } from '@/shared/config';
import { contiene, formatoRelativo, paginarLista, useTitulo } from '@/shared/lib';
import { Boton, Buscador, EncabezadoPagina, EstadoVacio, Icono, Indicador, MensajeError, Paginacion, Pestanas, Tabla, Toast } from '@/shared/ui';
import styles from './AdminStockPage.module.css';

const FILTROS = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'pocas', texto: 'Con pocas unidades' },
  { valor: 'agotados', texto: 'Agotados' },
];

/**
 * Vista 5.5 · Stock (sin diseño de Stitch: armada con PROTOTIPO_WEB.md §5.5 y el marco del panel).
 * Solo productos activos; el stock viene de GET /stock (propuesta → Arévalo).
 */
export function AdminStockPage() {
  useTitulo('Stock');
  const location = useLocation();
  const { data: productos, error, refetch } = useProductos({ size: 100 });
  const { data: stock, isLoading } = useStocks();
  const [texto, setTexto] = useState('');
  const [filtro, setFiltro] = useState(location.state?.filtro ?? 'todos');
  const [pagina, setPagina] = useState(0);
  const [entrada, setEntrada] = useState(null);
  const [ajuste, setAjuste] = useState(null);
  const [aviso, setAviso] = useState(null);
  const cerrarAviso = useCallback(() => setAviso(null), []);

  const filas = useMemo(
    () =>
      (productos?.items ?? []).map((p) => ({
        ...p,
        disponible: stock?.[p.id]?.disponible ?? 0,
        reservado: stock?.[p.id]?.reservado ?? 0,
        actualizadoEn: stock?.[p.id]?.actualizadoEn,
      })),
    [productos, stock],
  );
  const filtradas = filas.filter(
    (f) =>
      contiene(f.nombre, texto) &&
      (filtro === 'todos' || (filtro === 'agotados' ? f.disponible <= 0 : f.disponible > 0 && f.disponible <= UMBRAL_ULTIMAS_UNIDADES)),
  );
  const vista = paginarLista(filtradas, pagina, 10);
  const suma = (campo) => filas.reduce((s, f) => s + f[campo], 0);
  const agotados = filas.filter((f) => f.disponible <= 0).length;

  const columnas = [
    {
      clave: 'producto',
      titulo: 'Producto',
      render: (f) => (
        <span className={styles.producto}>
          <ProductoImagen producto={f} tamano={40} />
          <span>{f.nombre}</span>
        </span>
      ),
    },
    { clave: 'disponible', titulo: 'Disponible', alinear: 'right', render: (f) => <strong>{f.disponible}</strong> },
    { clave: 'reservado', titulo: 'Reservado', alinear: 'right' },
    { clave: 'estado', titulo: 'Estado', render: (f) => <StockInsignia disponible={f.disponible} /> },
    { clave: 'actualizado', titulo: 'Última actualización', render: (f) => <span className={styles.gris}>{formatoRelativo(f.actualizadoEn)}</span> },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      alinear: 'right',
      render: (f) => (
        <span className={styles.acciones}>
          <button type="button" className={styles.chico} onClick={() => setEntrada(f.id)}>
            Entrada
          </button>
          <button type="button" className={styles.chico} onClick={() => setAjuste(f)}>
            Ajuste
          </button>
          <Link to={`${RUTAS.adminMovimientos}?idProducto=${f.id}`} className={styles.historial} aria-label={`Ver movimientos de ${f.nombre}`} title="Ver movimientos">
            <Icono nombre="historial" />
          </Link>
        </span>
      ),
    },
  ];

  if (error) return <MensajeError error={error} alReintentar={refetch} />;

  return (
    <div>
      <Toast mensaje={aviso} alCerrar={cerrarAviso} />
      <EncabezadoPagina
        titulo="Stock"
        acciones={
          <Boton onClick={() => setEntrada(0)}>
            <Icono nombre="mas" tamano={18} /> Registrar entrada
          </Boton>
        }
      />

      <div className={styles.indicadores}>
        <Indicador icono="caja" tono="info" titulo="Unidades disponibles" valor={suma('disponible')} />
        <Indicador icono="historial" tono="advertencia" titulo="Reservadas en compras en curso" valor={suma('reservado')} />
        <Indicador icono="alertaTriangulo" tono="error" titulo="Productos agotados" valor={agotados} tonoValor={agotados ? 'error' : undefined} />
      </div>

      <div className={styles.herramientas}>
        <Buscador
          className={styles.buscador}
          placeholder="Buscar producto…"
          etiqueta="Buscar producto"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setPagina(0);
          }}
        />
        <Pestanas
          variante="segmentos"
          etiqueta="Filtrar por estado"
          opciones={FILTROS}
          valor={filtro}
          alCambiar={(v) => {
            setFiltro(v);
            setPagina(0);
          }}
        />
      </div>

      <Tabla
        columnas={columnas}
        filas={vista.items}
        vacio={!isLoading && <EstadoVacio icono="almacen" titulo="No hay productos con ese filtro" />}
        pie={<Paginacion {...vista} numeros alCambiar={setPagina} />}
      />

      <ModalEntradaStock
        abierto={entrada !== null}
        idProducto={entrada || undefined}
        productos={filas}
        alCerrar={() => setEntrada(null)}
        alRegistrar={(p, cantidad) => setAviso(`Se registraron ${cantidad} unidades de ${p?.nombre}.`)}
      />
      <ModalAjusteStock
        abierto={Boolean(ajuste)}
        producto={ajuste}
        disponible={ajuste?.disponible ?? 0}
        alCerrar={() => setAjuste(null)}
        alAjustar={(p) => setAviso(`Se ajustó el stock de ${p.nombre}.`)}
      />
    </div>
  );
}

