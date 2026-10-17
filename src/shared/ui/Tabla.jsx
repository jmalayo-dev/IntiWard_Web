import styles from './Tabla.module.css';

/**
 * columnas: [{ clave, titulo, render?: (fila) => node, alinear?: 'left'|'right'|'center', ancho? }]
 * filas: arreglo de objetos con `id`
 * `vacio`: lo que se muestra si no hay filas · `claseFila(fila)`: 'seleccionada' | 'atenuada'
 */
export function Tabla({ columnas, filas, claveFila = 'id', vacio, claseFila, alClicFila, pie, sinBorde = false }) {
  return (
    <div className={`${styles.contenedor} ${sinBorde ? styles.sinBorde : ''}`}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c.clave} style={{ textAlign: c.alinear, width: c.ancho }}>
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr
              key={fila[claveFila]}
              className={[claseFila && styles[claseFila(fila)], alClicFila && styles.clicable].filter(Boolean).join(' ') || undefined}
              onClick={alClicFila ? () => alClicFila(fila) : undefined}
            >
              {columnas.map((c) => (
                <td key={c.clave} style={{ textAlign: c.alinear }}>
                  {c.render ? c.render(fila) : fila[c.clave]}
                </td>
              ))}
            </tr>
          ))}
          {!filas.length && vacio && (
            <tr>
              <td colSpan={columnas.length} className={styles.vacio}>
                {vacio}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {pie && <div className={styles.pie}>{pie}</div>}
    </div>
  );
}
