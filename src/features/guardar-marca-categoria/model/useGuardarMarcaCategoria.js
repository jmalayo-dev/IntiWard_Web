import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriaKeys, crearCategoria, editarCategoria } from '@/entities/categoria';
import { crearMarca, editarMarca, marcaKeys } from '@/entities/marca';
import { productoKeys } from '@/entities/producto';

const API = {
  marca: { crear: crearMarca, editar: editarMarca, claves: marcaKeys.todos },
  categoria: { crear: crearCategoria, editar: editarCategoria, claves: categoriaKeys.todos },
};

/**
 * Crear, renombrar, activar o desactivar una marca o categoría (endpoints propuestos → César).
 * `tipo`: 'marca' | 'categoria'. Invalida también los productos, que muestran esos nombres.
 */
export function useGuardarMarcaCategoria(tipo) {
  const queryClient = useQueryClient();
  const { crear, editar, claves } = API[tipo];
  return useMutation({
    mutationFn: ({ id, ...datos }) => (id ? editar(id, datos) : crear(datos.nombre)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claves });
      queryClient.invalidateQueries({ queryKey: productoKeys.todos });
    },
  });
}
