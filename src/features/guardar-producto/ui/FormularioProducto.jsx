import { useState } from 'react';
import { AreaTexto, Aviso, Boton, Campo, Icono, Interruptor, Selector } from '@/shared/ui';
import { useGuardarProducto } from '../model/useGuardarProducto';
import { camposDelServidor, validarProducto } from '../model/validar';
import styles from './FormularioProducto.module.css';

const VACIO = { nombre: '', descripcion: '', idMarca: '', idCategoria: '', precio: '', imagenUrl: '', activo: true };

const desdeProducto = (p) =>
  p
    ? {
        nombre: p.nombre,
        descripcion: p.descripcion ?? '',
        idMarca: String(p.idMarca ?? ''),
        idCategoria: String(p.idCategoria ?? ''),
        precio: String(p.precio),
        imagenUrl: p.imagenUrl ?? '',
        activo: p.activo,
      }
    : VACIO;

/**
 * Vista 5.3: crear (sin `producto`) o editar. Incluye la fila del título con "Cancelar" y "Guardar producto".
 * marcas / categorias: [{ id, nombre }]
 */
export function FormularioProducto({ producto, marcas = [], categorias = [], alGuardar, alCancelar }) {
  const { mutate, isPending, error, reset } = useGuardarProducto();
  const [datos, setDatos] = useState(() => desdeProducto(producto));
  const [errores, setErrores] = useState({});
  const [intento, setIntento] = useState(false);
  const [avisoImagen, setAvisoImagen] = useState(null);
  const [imagenRota, setImagenRota] = useState(false);
  const servidor = camposDelServidor(error);
  const errorDe = (campo) => errores[campo] ?? servidor[campo];

  const cambiar = (campo, valor) => {
    const siguiente = { ...datos, [campo]: valor };
    setDatos(siguiente);
    if (intento) setErrores(validarProducto(siguiente));
    if (campo === 'imagenUrl') setImagenRota(false);
    if (error) reset();
  };

  const guardar = (e) => {
    e.preventDefault();
    setIntento(true);
    const encontrados = validarProducto(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    mutate(
      {
        id: producto?.id,
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim(),
        idMarca: Number(datos.idMarca),
        idCategoria: Number(datos.idCategoria),
        precio: Number(datos.precio),
        imagenUrl: datos.imagenUrl.trim() || null,
        activo: datos.activo,
      },
      { onSuccess: (guardado) => alGuardar?.(guardado) },
    );
  };

  // Se puede soltar un enlace a una imagen; los archivos todavía no (no hay servicio para subirlos)
  const soltar = (e) => {
    e.preventDefault();
    const texto = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (texto) {
      cambiar('imagenUrl', texto.trim());
      setAvisoImagen(null);
    } else if (e.dataTransfer.files.length) {
      setAvisoImagen('Todavía no se pueden subir archivos: pega la URL de la imagen.');
    }
  };

  const avisoGeneral = error && !Object.keys(servidor).length ? error.message : null;
  const urlPrevia = datos.imagenUrl.trim();

  return (
    <form className={styles.formulario} onSubmit={guardar} noValidate>
      <div className={styles.cabecera}>
        <h1 className={styles.tituloPagina}>{producto ? 'Editar producto' : 'Nuevo producto'}</h1>
        <div className={styles.botones}>
          <Boton variante="secundario" onClick={alCancelar} disabled={isPending}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={isPending}>
            Guardar producto
          </Boton>
        </div>
      </div>

      {avisoGeneral && <Aviso tipo="error">{avisoGeneral}</Aviso>}

      <div className={styles.columnas}>
        <section className={styles.tarjeta}>
          <h2 className={styles.titulo}>Información</h2>
          <Campo
            etiqueta="Nombre del producto *"
            placeholder="Ej. Cámara IP Wi-Fi 1080p"
            value={datos.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            error={errorDe('nombre')}
            maxLength={150}
          />
          <AreaTexto
            etiqueta="Descripción"
            placeholder="Detalles, especificaciones principales y características…"
            maximo={2000}
            value={datos.descripcion}
            onChange={(e) => cambiar('descripcion', e.target.value)}
          />
          <div className={styles.fila}>
            <Selector
              etiqueta="Marca *"
              placeholder="Selecciona una marca"
              opciones={marcas.map((m) => ({ valor: String(m.id), texto: m.activo === false ? `${m.nombre} (inactiva)` : m.nombre }))}
              value={datos.idMarca}
              onChange={(e) => cambiar('idMarca', e.target.value)}
              error={errorDe('idMarca')}
            />
            <Selector
              etiqueta="Categoría *"
              placeholder="Selecciona una categoría"
              opciones={categorias.map((c) => ({ valor: String(c.id), texto: c.activo === false ? `${c.nombre} (inactiva)` : c.nombre }))}
              value={datos.idCategoria}
              onChange={(e) => cambiar('idCategoria', e.target.value)}
              error={errorDe('idCategoria')}
            />
          </div>
          <Campo
            etiqueta="Precio (S/) *"
            prefijo="S/"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={datos.precio}
            onChange={(e) => cambiar('precio', e.target.value)}
            error={errorDe('precio')}
            ayuda="Incluye IGV. Debe ser mayor que 0."
          />
        </section>

        <section className={styles.tarjeta}>
          <h2 className={styles.titulo}>Imagen y estado</h2>
          <div className={styles.zona} onDragOver={(e) => e.preventDefault()} onDrop={soltar}>
            <Icono nombre="imagen" tamano={32} grosor={1.5} />
            <span>Arrastra una imagen o pega una URL</span>
          </div>
          {avisoImagen && <Aviso tipo="info">{avisoImagen}</Aviso>}
          <Campo
            etiqueta="URL de la imagen"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={datos.imagenUrl}
            onChange={(e) => cambiar('imagenUrl', e.target.value)}
            error={errorDe('imagenUrl')}
          />
          <div>
            <p className={styles.etiquetaPrevia}>Vista previa</p>
            <div className={styles.previa}>
              {urlPrevia && !imagenRota ? (
                <img src={urlPrevia} alt="Vista previa del producto" onError={() => setImagenRota(true)} />
              ) : (
                <span className={styles.sinImagen}>
                  <Icono nombre="imagen" tamano={40} grosor={1.5} />
                  {imagenRota ? 'No se pudo cargar la imagen' : 'Sin imagen seleccionada'}
                </span>
              )}
            </div>
          </div>
          <div className={styles.estado}>
            <span>Producto activo</span>
            <Interruptor activo={datos.activo} alCambiar={(v) => cambiar('activo', v)} etiqueta="Producto activo" ocultarEtiqueta />
          </div>
        </section>
      </div>

      {!producto && (
        <Aviso tipo="info">
          El producto empieza sin stock. Después de guardarlo, registra una entrada en <strong>Stock</strong> para poder venderlo.
        </Aviso>
      )}
    </form>
  );
}
