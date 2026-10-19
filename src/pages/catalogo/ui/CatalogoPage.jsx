import { useState } from 'react';
import { ORDEN_CATEGORIAS, useCategorias } from '@/entities/categoria';
import { useMarcas } from '@/entities/marca';
import { useProductos } from '@/entities/producto';
import { ChipsFiltros, PanelFiltros, SelectorOrden, useFiltrosCatalogo } from '@/features/filtrar-catalogo';
import { RUTAS } from '@/shared/config';
import { useTitulo } from '@/shared/lib';
import { Boton, EstadoVacio, Icono, MensajeError, Migas, Paginacion } from '@/shared/ui';
import { GrillaProductos } from '@/widgets/grilla-productos';
import styles from './CatalogoPage.module.css';

const porOrden = (a, b) => {
  const ia = ORDEN_CATEGORIAS.indexOf(a.nombre);
  const ib = ORDEN_CATEGORIAS.indexOf(b.nombre);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
};

/** Vista 4.2 · Catálogo: filtros en la URL, grilla de 3 columnas y paginación. */
export function CatalogoPage() {
  const { filtros, cambiarFiltro, alternarMarca, cambiarPagina, limpiar, hayFiltros, cantidadFiltros } = useFiltrosCatalogo();
  const { data, isLoading, isFetching, error, refetch } = useProductos({ ...filtros, size: 9, sort: filtros.sort || undefined });
  const { data: categorias = [] } = useCategorias();
  const { data: marcas = [] } = useMarcas();
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const titulo = filtros.categoria ?? (filtros.q ? `Resultados para "${filtros.q}"` : 'Catálogo');
  useTitulo(filtros.categoria ?? 'Catálogo');

  const migas = [
    { texto: 'Inicio', a: RUTAS.inicio },
    { texto: 'Catálogo', a: RUTAS.catalogo },
    ...(filtros.categoria ? [{ texto: filtros.categoria }] : []),
  ];

  const total = data?.total ?? 0;

  return (
    <div>
      <Migas items={migas} />
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>{titulo}</h1>
          <p className={styles.cantidad}>{isLoading ? 'Cargando…' : `${total} ${total === 1 ? 'producto' : 'productos'}`}</p>
        </div>
        <div className={styles.acciones}>
          <Boton variante="secundario" className={styles.botonFiltros} onClick={() => setFiltrosAbiertos((v) => !v)} aria-expanded={filtrosAbiertos}>
            <Icono nombre="filtro" tamano={18} /> Filtros{cantidadFiltros ? ` (${cantidadFiltros})` : ''}
          </Boton>
          <SelectorOrden valor={filtros.sort} alCambiar={(v) => cambiarFiltro('orden', v)} />
        </div>
      </div>

      <div className={styles.columnas}>
        <aside className={`${styles.filtros} ${filtrosAbiertos ? styles.filtrosAbiertos : ''}`} aria-label="Filtros">
          <PanelFiltros
            filtros={filtros}
            cambiarFiltro={cambiarFiltro}
            alternarMarca={alternarMarca}
            limpiar={limpiar}
            categorias={[...categorias].sort(porOrden)}
            marcas={marcas}
          />
        </aside>

        <section className={styles.resultados} aria-busy={isFetching} aria-label="Resultados">
          <ChipsFiltros filtros={filtros} cambiarFiltro={cambiarFiltro} alternarMarca={alternarMarca} />
          {error ? (
            <MensajeError error={error} alReintentar={refetch} />
          ) : !isLoading && total === 0 ? (
            <div className={styles.vacio}>
              <EstadoVacio
                icono="buscar"
                titulo="No encontramos productos con esos filtros"
                texto="Prueba quitando algún filtro o buscando otra palabra."
                accion={
                  hayFiltros && (
                    <Boton variante="secundario" onClick={limpiar}>
                      Limpiar filtros
                    </Boton>
                  )
                }
              />
            </div>
          ) : (
            <div className={isFetching && !isLoading ? styles.actualizando : undefined}>
              <GrillaProductos productos={data?.items} cargando={isLoading} columnas={3} />
            </div>
          )}
          {data && <Paginacion {...data} unidad={['producto', 'productos']} alCambiar={cambiarPagina} />}
        </section>
      </div>
    </div>
  );
}
