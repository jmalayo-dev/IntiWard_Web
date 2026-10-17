import { Icono } from '@/shared/ui';
import styles from './ChipsFiltros.module.css';

/** Chips de los filtros activos ("Cámaras ×", "Solo con stock ×"); la × quita ese filtro. */
export function ChipsFiltros({ filtros, cambiarFiltro, alternarMarca }) {
  const chips = [];
  if (filtros.q) chips.push({ texto: `"${filtros.q}"`, quitar: () => cambiarFiltro('q', '') });
  if (filtros.categoria) chips.push({ texto: filtros.categoria, quitar: () => cambiarFiltro('categoria', '') });
  filtros.marca.forEach((m) => chips.push({ texto: m, quitar: () => alternarMarca(m) }));
  if (filtros.precioMin || filtros.precioMax) {
    const texto = `S/ ${filtros.precioMin || 0} – ${filtros.precioMax ? `S/ ${filtros.precioMax}` : 'más'}`;
    chips.push({
      texto,
      quitar: () => {
        cambiarFiltro('precioMin', '');
        cambiarFiltro('precioMax', '');
      },
    });
  }
  if (filtros.conStock) chips.push({ texto: 'Solo con stock', quitar: () => cambiarFiltro('conStock', '') });
  if (!chips.length) return null;

  return (
    <ul className={styles.chips}>
      {chips.map((c) => (
        <li key={c.texto} className={styles.chip}>
          {c.texto}
          <button type="button" onClick={c.quitar} aria-label={`Quitar filtro ${c.texto}`} className={styles.quitar}>
            <Icono nombre="cerrar" tamano={14} grosor={2.5} />
          </button>
        </li>
      ))}
    </ul>
  );
}
