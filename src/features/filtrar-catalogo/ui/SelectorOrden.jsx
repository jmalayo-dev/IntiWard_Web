import { ORDENES } from '../model/useFiltrosCatalogo';
import styles from './SelectorOrden.module.css';

export function SelectorOrden({ valor, alCambiar }) {
  return (
    <label className={styles.orden}>
      <span>Ordenar por:</span>
      <select value={valor} onChange={(e) => alCambiar(e.target.value)}>
        {ORDENES.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </label>
  );
}
