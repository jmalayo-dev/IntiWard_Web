import { useState } from 'react';
import { Aviso, Boton, Campo, Modal, Pestanas, Selector } from '@/shared/ui';
import { useAjustarStock } from '../model/useAjustarStock';

const MOTIVOS = ['Merma', 'Rotura', 'Error de carga', 'Otro'].map((m) => ({ valor: m, texto: m }));

/**
 * Modal "Ajuste de stock" (vista 5.5). El backend fija el disponible, así que aquí se calcula
 * actual ± cantidad. El motivo es obligatorio y el disponible no puede quedar negativo.
 */
export function ModalAjusteStock(props) {
  return props.abierto ? <Contenido {...props} /> : null;
}

function Contenido({ abierto, alCerrar, producto, disponible = 0, alAjustar }) {
  const { mutate, isPending, error } = useAjustarStock();
  const [sentido, setSentido] = useState('restar');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [errores, setErrores] = useState({});

  const guardar = (e) => {
    e.preventDefault();
    const n = Number(cantidad);
    const encontrados = {};
    if (!Number.isInteger(n) || n <= 0) encontrados.cantidad = 'La cantidad debe ser un número entero mayor que 0';
    else if (sentido === 'restar' && n > disponible) encontrados.cantidad = `No puedes restar más de lo disponible (${disponible})`;
    if (!motivo) encontrados.motivo = 'El motivo es obligatorio';
    if (motivo === 'Otro' && !detalle.trim()) encontrados.detalle = 'Describe el motivo';
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    const texto = detalle.trim() ? `${motivo}: ${detalle.trim()}` : motivo;
    mutate(
      { idProducto: producto.id, disponible: sentido === 'sumar' ? disponible + n : disponible - n, motivo: texto },
      {
        onSuccess: () => {
          alAjustar?.(producto);
          alCerrar();
        },
      },
    );
  };

  return (
    <Modal
      abierto={abierto}
      titulo="Ajuste de stock"
      alCerrar={alCerrar}
      acciones={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" form="form-ajuste" cargando={isPending}>
            Guardar ajuste
          </Boton>
        </>
      }
    >
      <form id="form-ajuste" onSubmit={guardar} noValidate style={{ display: 'grid', gap: 16 }}>
        <Aviso tipo="advertencia">Usa el ajuste solo para corregir el stock después de un conteo físico.</Aviso>
        {error && <Aviso tipo="error">{error.message}</Aviso>}
        <p style={{ fontSize: 14 }}>
          <strong>Producto:</strong> {producto?.nombre} (disponible: {disponible})
        </p>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Cantidad a ajustar</span>
          <Pestanas
            variante="segmentos"
            etiqueta="Sumar o restar"
            opciones={[
              { valor: 'sumar', texto: 'Sumar' },
              { valor: 'restar', texto: 'Restar' },
            ]}
            valor={sentido}
            alCambiar={setSentido}
          />
          <Campo
            aria-label="Cantidad a ajustar"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            error={errores.cantidad}
          />
        </div>
        <Selector etiqueta="Motivo" placeholder="Elige el motivo" opciones={MOTIVOS} value={motivo} onChange={(e) => setMotivo(e.target.value)} error={errores.motivo} />
        <Campo
          etiqueta={motivo === 'Otro' ? 'Detalle' : 'Detalle (opcional)'}
          maxLength={200}
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          error={errores.detalle}
        />
      </form>
    </Modal>
  );
}
