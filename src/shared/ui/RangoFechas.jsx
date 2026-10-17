import { Icono } from './Icono';
import styles from './RangoFechas.module.css';

/** "01/10/2026 – 15/10/2026" con dos selectores de fecha nativos. Valores en formato AAAA-MM-DD. */
export function RangoFechas({ desde, hasta, alCambiar, etiqueta = 'Rango de fechas' }) {
  return (
    <fieldset className={styles.rango}>
      <legend className="solo-lectores">{etiqueta}</legend>
      <Icono nombre="calendario" tamano={18} className={styles.icono} />
      <input
        type="date"
        className={styles.fecha}
        value={desde}
        max={hasta || undefined}
        onChange={(e) => alCambiar({ desde: e.target.value, hasta })}
        aria-label="Desde"
      />
      <span aria-hidden="true">–</span>
      <input
        type="date"
        className={styles.fecha}
        value={hasta}
        min={desde || undefined}
        onChange={(e) => alCambiar({ desde, hasta: e.target.value })}
        aria-label="Hasta"
      />
    </fieldset>
  );
}
