import styles from './Pestanas.module.css';

/**
 * Pestañas subrayadas (`variante="linea"`), en píldora (`"pildora"`) o botones segmentados (`"segmentos"`).
 * opciones: [{ valor, texto }]
 */
export function Pestanas({ opciones, valor, alCambiar, variante = 'linea', etiqueta, className = '' }) {
  return (
    <div className={`${styles[variante]} ${className}`} role="tablist" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="tab"
          aria-selected={o.valor === valor}
          className={`${styles.opcion} ${o.valor === valor ? styles.activa : ''}`}
          onClick={() => alCambiar(o.valor)}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}
