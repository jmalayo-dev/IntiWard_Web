import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCategorias } from '@/entities/categoria';
import { useMarcas } from '@/entities/marca';
import { listarProductosParaExportar, ProductoImagen, useProductos, TAMANO_TODOS } from '@/entities/producto';
import { StockInsignia, useStocks } from '@/entities/stock';
import { InterruptorProducto } from '@/features/desactivar-producto';
import { RUTAS } from '@/shared/config';
import { descargarCsv, formatoMoneda, useDemorado, useTitulo } from '@/shared/lib';
import { Boton, Buscador, EncabezadoPagina, EstadoVacio, Icono, Insignia, Interruptor, MensajeError, Paginacion, Tabla, Toast } from '@/shared/ui';
import styles from './AdminProductosPage.module.css';

const TAMANO = 10;

/** Vista 5.2 · Productos. Los productos no se borran: se desactivan. */
export function AdminProductosPage() {
  useTitulo('Productos');
  const location = useLocation();
  const navigate = useNavigate();
  // Aviso que deja el formulario al guardar; se borra del historial al cerrarlo
  const cerrarAviso = useCallback(() => navigate(location.pathname, { replace: true, state: null }), [navigate, location.pathname]);
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [marca, setMarca] = useState('');
  const [inactivos, setInactivos] = useState(true);
  const [pagina, setPagina] = useState(0);
  const q = useDemorado(texto.trim());
  const filtros = { page: pagina, size: TAMANO, q: q || undefined, categoria: categoria || undefined, marca: marca || undefined, inactivos };

  const { data, isLoading, error, refetch } = useProductos(filtros);
  const { data: categorias = [] } = useCategorias();
  const { data: marcas = [] } = useMarcas();
  const { data: stock } = useStocks(data?.items.map((p) => p.id) ?? []);
  const { data: todos } = useProductos({ size: 1, inactivos: true });
  const { data: activos } = useProductos({ size: 1 });

  const cambiar = (fn) => (valor) => {
    fn(valor);
    setPagina(0);
  };

  const exportar = async () => {
    const { items: lista } = await listarProductosParaExportar({ ...filtros, page: 0, size: TAMANO_TODOS });
    descargarCsv('productos.csv', [
      { titulo: 'Producto', valor: (p) => p.nombre },
      { titulo: 'Marca', valor: (p) => p.marca },
      { titulo: 'Categoría', valor: (p) => p.categoria },
      { titulo: 'Precio', valor: (p) => p.precio.toFixed(2) },
      { titulo: 'Estado', valor: (p) => (p.activo ? 'Activo' : 'Inactivo') },
    ], lista);
  };

  const total = todos?.total ?? 0;
  const inactivosTotal = total - (activos?.total ?? 0);

  const columnas = [
    {
      clave: 'producto',
      titulo: 'Producto',
      render: (p) => (
        <span className={styles.producto}>
          <ProductoImagen producto={p} tamano={44} />
          <span className={styles.nombre}>{p.nombre}</span>
        </span>
      ),
    },
    { clave: 'marca', titulo: 'Marca' },
    { clave: 'categoria', titulo: 'Categoría' },
    { clave: 'precio', titulo: 'Precio', render: (p) => <span className={styles.precio}>{formatoMoneda(p.precio)}</span> },
    {
      clave: 'stock',
      titulo: 'Stock',
      render: (p) => {
        const disponible = stock?.[p.id]?.disponible;
        if (disponible === undefined) return '—';
        return (
          <span className={styles.stock}>
            {disponible}
            {p.activo && <StockInsignia disponible={disponible} />}
          </span>
        );
      },
    },
    { clave: 'estado', titulo: 'Estado', render: (p) => <Insignia tono={p.activo ? 'exito' : 'neutro'}>{p.activo ? 'Activo' : 'Inactivo'}</Insignia> },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (p) => (
        <span className={styles.acciones}>
          <Link to={RUTAS.adminProductoEditar(p.id)} className={styles.lapiz} aria-label={`Editar ${p.nombre}`}>
            <Icono nombre="lapiz" />
          </Link>
          <InterruptorProducto producto={p} />
        </span>
      ),
    },
  ];

  return (
    <div>
      <Toast mensaje={location.state?.aviso} alCerrar={cerrarAviso} />
      <EncabezadoPagina
        titulo="Productos"
        subtitulo={total ? `${total} productos${inactivosTotal ? ` (${total - inactivosTotal} activos y ${inactivosTotal} inactivo${inactivosTotal === 1 ? '' : 's'})` : ''}` : ' '}
        acciones={
          <Link to={RUTAS.adminProductoNuevo} className={styles.botonPrimario}>
            <Icono nombre="mas" tamano={18} /> Nuevo producto
          </Link>
        }
      />

      <div className={styles.herramientas}>
        <Buscador className={styles.buscador} placeholder="Buscar por nombre…" etiqueta="Buscar por nombre" value={texto} onChange={(e) => cambiar(setTexto)(e.target.value)} />
        <select className={styles.selector} value={categoria} onChange={(e) => cambiar(setCategoria)(e.target.value)} aria-label="Categoría">
          <option value="">Categoría: Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.nombre}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select className={styles.selector} value={marca} onChange={(e) => cambiar(setMarca)(e.target.value)} aria-label="Marca">
          <option value="">Marca: Todas</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.nombre}>
              {m.nombre}
            </option>
          ))}
        </select>
        <Interruptor activo={inactivos} alCambiar={cambiar(setInactivos)} etiqueta="Mostrar inactivos" />
        <Boton variante="secundario" onClick={exportar} className={styles.exportar}>
          <Icono nombre="descargar" tamano={18} /> Exportar
        </Boton>
      </div>

      {error ? (
        <MensajeError error={error} alReintentar={refetch} />
      ) : (
        <Tabla
          columnas={columnas}
          filas={data?.items ?? []}
          claseFila={(p) => (p.activo ? undefined : 'atenuada')}
          vacio={
            !isLoading && <EstadoVacio icono="caja" titulo="No hay productos con esos filtros" texto="Prueba con otro nombre, categoría o marca." />
          }
          pie={data && <Paginacion {...data} unidad={['producto', 'productos']} alCambiar={setPagina} />}
        />
      )}
    </div>
  );
}
