import { useState } from 'react';
import { Boton, Casilla } from '@/shared/ui';
import styles from './PanelFiltros.module.css';

/** Campo de precio que aplica el filtro al salir del campo o con Enter (no en cada tecla). Se monta con key={valor}. */
function CampoPrecio({ etiqueta, valor, alAplicar }) {
  const [texto, setTexto] = useState(valor ?? '');
  const aplicar = () => {
    const limpio = texto.trim();
    if ((limpio || undefined) !== (valor || undefined)) alAplicar(limpio && Number(limpio) >= 0 ? limpio : '');
  };
  return (
    <label className={styles.precio}>
      <span className={styles.etiquetaPrecio}>{etiqueta}</span>
      <span className={styles.controlPrecio}>
        <span aria-hidden="true">S/</span>
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={aplicar}
          onKeyDown={(e) => e.key === 'Enter' && aplicar()}
        />
      </span>
    </label>
  );
}

/**
 * Columna de filtros de la vista 4.2: categoría, marca, precio y disponibilidad.
 * categorias / marcas: [{ id, nombre, productos }]. Una marca sin productos activos (productos: 0) sale tachada y no se
 * puede marcar (si ya estaba marcada, se puede desmarcar).
 */
export function PanelFiltros({ filtros, cambiarFiltro, alternarMarca, limpiar, categorias = [], marcas = [] }) {
  return (
    <div className={styles.panel}>
      <fieldset className={styles.grupo}>
        <legend className={styles.titulo}>Categoría</legend>
        {categorias.map((c) => (
          <label key={c.id} className={styles.opcion}>
            <input
              type="radio"
              name="categoria"
              checked={filtros.categoria === c.nombre}
              onChange={() => cambiarFiltro('categoria', c.nombre)}
              onClick={() => filtros.categoria === c.nombre && cambiarFiltro('categoria', '')}
            />
            {c.nombre} {c.productos !== undefined && `(${c.productos})`}
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.grupo}>
        <legend className={styles.titulo}>Marca</legend>
        {marcas.map((m) => {
          const marcada = filtros.marca.includes(m.nombre);
          const vacia = m.productos === 0;
          return (
            <Casilla
              key={m.id}
              etiqueta={m.nombre}
              checked={marcada}
              disabled={vacia && !marcada}
              title={vacia ? 'Sin productos por ahora' : undefined}
              onChange={() => alternarMarca(m.nombre)}
              className={`${styles.casilla} ${vacia ? styles.vacia : ''}`}
            />
          );
        })}
      </fieldset>

      <fieldset className={styles.grupo}>
        <legend className={styles.titulo}>Precio</legend>
        <div className={styles.precios}>
          <CampoPrecio key={`min-${filtros.precioMin}`} etiqueta="Mín." valor={filtros.precioMin} alAplicar={(v) => cambiarFiltro('precioMin', v)} />
          <CampoPrecio key={`max-${filtros.precioMax}`} etiqueta="Máx." valor={filtros.precioMax} alAplicar={(v) => cambiarFiltro('precioMax', v)} />
        </div>
      </fieldset>

      <fieldset className={styles.grupo}>
        <legend className={styles.titulo}>Disponibilidad</legend>
        <Casilla etiqueta="Solo con stock" checked={filtros.conStock} onChange={(e) => cambiarFiltro('conStock', e.target.checked ? '1' : '')} className={styles.casilla} />
      </fieldset>

      <Boton variante="secundario" anchoCompleto onClick={limpiar}>
        Limpiar filtros
      </Boton>
    </div>
  );
}
