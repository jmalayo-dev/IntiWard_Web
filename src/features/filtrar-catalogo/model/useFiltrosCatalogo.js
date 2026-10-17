import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const CLAVES = ['categoria', 'marca', 'q', 'precioMin', 'precioMax', 'conStock'];

export const ORDENES = [
  { valor: '', texto: 'Relevancia' },
  { valor: 'precio,asc', texto: 'Precio: menor a mayor' },
  { valor: 'precio,desc', texto: 'Precio: mayor a menor' },
  { valor: 'nombre,asc', texto: 'Nombre A–Z' },
];

/**
 * Los filtros del catálogo viven en la URL: categoria, marca (varias, separadas por coma), q, precioMin, precioMax,
 * conStock, orden y page. Cambiar un filtro vuelve a la página 0.
 */
export function useFiltrosCatalogo() {
  const [params, setParams] = useSearchParams();

  const filtros = useMemo(
    () => ({
      categoria: params.get('categoria') ?? undefined,
      marca: params.get('marca')?.split(',').filter(Boolean) ?? [],
      q: params.get('q') ?? undefined,
      precioMin: params.get('precioMin') ?? undefined,
      precioMax: params.get('precioMax') ?? undefined,
      conStock: params.get('conStock') === '1',
      sort: params.get('orden') ?? '',
      page: Number(params.get('page') ?? 0),
    }),
    [params],
  );

  const cambiarFiltro = useCallback(
    (clave, valor) => {
      setParams((actual) => {
        const siguiente = new URLSearchParams(actual);
        if (valor) siguiente.set(clave, valor);
        else siguiente.delete(clave);
        if (clave !== 'page') siguiente.delete('page');
        return siguiente;
      });
    },
    [setParams],
  );

  const alternarMarca = useCallback(
    (marca) => {
      const marcas = filtros.marca.includes(marca) ? filtros.marca.filter((m) => m !== marca) : [...filtros.marca, marca];
      cambiarFiltro('marca', marcas.join(','));
    },
    [filtros.marca, cambiarFiltro],
  );

  const limpiar = useCallback(() => setParams({}), [setParams]);
  const hayFiltros = CLAVES.some((c) => (Array.isArray(filtros[c]) ? filtros[c].length : filtros[c]));
  const cantidadFiltros = (filtros.categoria ? 1 : 0) + filtros.marca.length + (filtros.precioMin || filtros.precioMax ? 1 : 0) + (filtros.conStock ? 1 : 0);

  return {
    filtros,
    cambiarFiltro,
    alternarMarca,
    cambiarPagina: (n) => cambiarFiltro('page', n ? String(n) : ''),
    limpiar,
    hayFiltros,
    cantidadFiltros,
  };
}
