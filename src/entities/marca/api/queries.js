import { useQuery } from '@tanstack/react-query';
import { listarMarcas } from './marcaApi';

export const marcaKeys = { todos: ['marcas'] };

/** Cambian poco: se guardan 5 minutos en caché. */
export const useMarcas = () => useQuery({ queryKey: marcaKeys.todos, queryFn: listarMarcas, staleTime: 5 * 60_000 });
