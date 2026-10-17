import { useCallback, useState } from 'react';
import { useCategorias } from '@/entities/categoria';
import { useMarcas } from '@/entities/marca';
import { AccionesMarcaCategoria, FormularioNuevoNombre } from '@/features/guardar-marca-categoria';
import { useTitulo } from '@/shared/lib';
import { EncabezadoPagina, EstadoVacio, Insignia, MensajeError, Pestanas, Tabla, Tarjeta, Toast } from '@/shared/ui';
import styles from './AdminMarcasCategoriasPage.module.css';

/** Vista 5.4 · Marcas y categorías (crear, renombrar, activar o desactivar). */
export function AdminMarcasCategoriasPage() {
  useTitulo('Marcas y categorías');
  const [pestana, setPestana] = useState('marca');
  const [aviso, setAviso] = useState(null);
  const cerrarAviso = useCallback(() => setAviso(null), []);
  const marcas = useMarcas();
  const categorias = useCategorias();
  const consulta = pestana === 'marca' ? marcas : categorias;

  const columnas = [
    { clave: 'nombre', titulo: 'Nombre', render: (x) => <span className={styles.nombre}>{x.nombre}</span> },
    { clave: 'productos', titulo: 'Productos', render: (x) => x.productos ?? '—' },
    { clave: 'estado', titulo: 'Estado', render: (x) => <Insignia tono={x.activo ? 'exito' : 'neutro'}>{x.activo ? 'Activa' : 'Inactiva'}</Insignia> },
    { clave: 'acciones', titulo: 'Acciones', alinear: 'right', render: (x) => <AccionesMarcaCategoria tipo={pestana} item={x} /> },
  ];

  return (
    <div>
      <EncabezadoPagina titulo="Marcas y categorías" />
      <Toast mensaje={aviso} alCerrar={cerrarAviso} />
      <Pestanas
        etiqueta="Marcas o categorías"
        valor={pestana}
        alCambiar={setPestana}
        opciones={[
          { valor: 'marca', texto: `Marcas (${marcas.data?.length ?? '…'})` },
          { valor: 'categoria', texto: `Categorías (${categorias.data?.length ?? '…'})` },
        ]}
      />
      <Tarjeta className={styles.tarjeta}>
        <FormularioNuevoNombre key={pestana} tipo={pestana} alAgregar={(x) => setAviso(`${x.nombre} se agregó correctamente.`)} />
        {consulta.error ? (
          <MensajeError error={consulta.error} alReintentar={consulta.refetch} />
        ) : (
          <Tabla
            sinBorde
            columnas={columnas}
            filas={consulta.data ?? []}
            claseFila={(x) => (x.activo ? undefined : 'atenuada')}
            vacio={!consulta.isLoading && <EstadoVacio icono="etiqueta" titulo={pestana === 'marca' ? 'Aún no hay marcas' : 'Aún no hay categorías'} />}
          />
        )}
      </Tarjeta>
    </div>
  );
}
