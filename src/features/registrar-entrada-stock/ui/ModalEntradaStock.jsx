import { useState } from 'react';
import { Aviso, Boton, Campo, Modal, Selector } from '@/shared/ui';
import { useRegistrarEntradaStock } from '../model/useRegistrarEntradaStock';

/** Modal "Registrar entrada" de la vista 5.5. productos: [{ id, nombre }]. Cerrado no se monta: cada apertura empieza limpia. */
export function ModalEntradaStock(props) {
  return props.abierto ? <Contenido {...props} /> : null;
}

function Contenido({ abierto, alCerrar, productos = [], idProducto, alRegistrar }) {
  const { mutate, isPending, error } = useRegistrarEntradaStock();
  const [datos, setDatos] = useState({ idProducto: idProducto ? String(idProducto) : '', cantidad: '', nota: '' });
  const [errores, setErrores] = useState({});

  const registrar = (e) => {
    e.preventDefault();
    const cantidad = Number(datos.cantidad);
    const encontrados = {};
    if (!datos.idProducto) encontrados.idProducto = 'Elige un producto';
    if (!Number.isInteger(cantidad) || cantidad <= 0) encontrados.cantidad = 'La cantidad debe ser un número entero mayor que 0';
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    mutate(
      { idProducto: Number(datos.idProducto), cantidad, motivo: datos.nota.trim() || null },
      {
        onSuccess: () => {
          alRegistrar?.(productos.find((p) => p.id === Number(datos.idProducto)), cantidad);
          alCerrar();
        },
      },
    );
  };

  return (
    <Modal
      abierto={abierto}
      titulo="Registrar entrada"
      alCerrar={alCerrar}
      acciones={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" form="form-entrada" cargando={isPending}>
            Registrar entrada
          </Boton>
        </>
      }
    >
      <form id="form-entrada" onSubmit={registrar} noValidate style={{ display: 'grid', gap: 16 }}>
        {error && <Aviso tipo="error">{error.message}</Aviso>}
        <Selector
          etiqueta="Producto"
          placeholder="Elige un producto"
          opciones={productos.map((p) => ({ valor: String(p.id), texto: p.nombre }))}
          value={datos.idProducto}
          onChange={(e) => setDatos({ ...datos, idProducto: e.target.value })}
          error={errores.idProducto}
        />
        <Campo
          etiqueta="Cantidad que llegó"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={datos.cantidad}
          onChange={(e) => setDatos({ ...datos, cantidad: e.target.value })}
          error={errores.cantidad}
        />
        <Campo
          etiqueta="Nota (opcional)"
          placeholder="Guía de remisión 001-4521"
          maxLength={200}
          value={datos.nota}
          onChange={(e) => setDatos({ ...datos, nota: e.target.value })}
        />
      </form>
    </Modal>
  );
}
