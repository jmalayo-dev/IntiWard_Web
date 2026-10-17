import { useQuery } from '@tanstack/react-query';
import { listarCategorias } from './categoriaApi';

export const categoriaKeys = { todos: ['categorias'] };

/** Cambian poco: se guardan 5 minutos en caché. */
export const useCategorias = () => useQuery({ queryKey: categoriaKeys.todos, queryFn: listarCategorias, staleTime: 5 * 60_000 });
