import { useSearchParams } from 'react-router-dom';
import { useMovimientos } from '@/entities/movimiento';
import { useProductos, TAMANO_TODOS } from '@/entities/producto';
import { useTitulo } from '@/shared/lib';
import { Cargando, EncabezadoPagina, MensajeError } from '@/shared/ui';
import { TablaMovimientos } from '@/widgets/tabla-movimientos';

/** Vista 5.6 · Movimientos de stock. Acepta ?idProducto= desde la vista de stock. */
export function AdminMovimientosPage() {
  useTitulo('Movimientos de stock');
  const [params, setParams] = useSearchParams();
  const { data: movimientos, isLoading, error, refetch } = useMovimientos();
  const { data: productos } = useProductos({ size: TAMANO_TODOS, inactivos: true });

  return (
    <div>
      <EncabezadoPagina titulo="Movimientos de stock" subtitulo="Historial de entradas, reservas, ventas y ajustes" />
      {error ? (
        <MensajeError error={error} alReintentar={refetch} />
      ) : isLoading ? (
        <Cargando lineas={6} alto={48} />
      ) : (
        <TablaMovimientos
          movimientos={movimientos}
          productos={productos?.items ?? []}
          idProducto={params.get('idProducto') ?? ''}
          alCambiarProducto={(id) => setParams(id ? { idProducto: id } : {}, { replace: true })}
        />
      )}
    </div>
  );
}
