import { useNavigate, useParams } from 'react-router-dom';
import { useCategorias } from '@/entities/categoria';
import { useMarcas } from '@/entities/marca';
import { useProducto } from '@/entities/producto';
import { FormularioProducto } from '@/features/guardar-producto';
import { RUTAS } from '@/shared/config';
import { useTitulo } from '@/shared/lib';
import { Cargando, MensajeError } from '@/shared/ui';
import { PantallaError } from '@/widgets/pantalla-error';

/** Vista 5.3 · Crear (/admin/productos/nuevo) o editar (/admin/productos/:id/editar) un producto. */
export function AdminProductoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: producto, isLoading, error, refetch } = useProducto(id);
  const { data: marcas = [] } = useMarcas();
  const { data: categorias = [] } = useCategorias();
  useTitulo(id ? 'Editar producto' : 'Nuevo producto');

  if (error?.status === 404) return <PantallaError tipo={404} />;
  if (error) return <MensajeError error={error} alReintentar={refetch} />;
  if (id && isLoading) return <Cargando lineas={6} alto={44} />;

  return (
    <FormularioProducto
      key={producto?.id ?? 'nuevo'}
      producto={producto}
      marcas={marcas}
      categorias={categorias}
      alCancelar={() => navigate(RUTAS.adminProductos)}
      alGuardar={(guardado) =>
        navigate(RUTAS.adminProductos, {
          state: {
            aviso: id ? `Se guardaron los cambios de ${guardado.nombre}.` : `${guardado.nombre} se creó sin stock. Registra una entrada en Stock para venderlo.`,
          },
        })
      }
    />
  );
}
