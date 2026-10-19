import { Icono } from './Icono';
import styles from './Paginacion.module.css';

/** Números de página con "…" cuando son muchos: [0, 1, 2, '…', 12]. */
function numerosVisibles(pagina, totalPaginas) {
  if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i);
  const set = new Set([0, totalPaginas - 1, pagina - 1, pagina, pagina + 1].filter((n) => n >= 0 && n < totalPaginas));
  if (pagina <= 2) [1, 2, 3].forEach((n) => set.add(n));
  if (pagina >= totalPaginas - 3) [totalPaginas - 4, totalPaginas - 3, totalPaginas - 2].forEach((n) => set.add(n));
  const lista = [...set].sort((a, b) => a - b);
  return lista.flatMap((n, i) => (i > 0 && n - lista[i - 1] > 1 ? ['…', n] : [n]));
}

/**
 * "Mostrando 1–24 de 44 productos" + Anterior · números · Siguiente. Una sola paginación para toda la web.
 * Recibe la página normalizada por aPagina() o paginarLista() (pagina empieza en 0).
 * `unidad`: [singular, plural] de lo que se lista, por ejemplo ['producto', 'productos'].
 */
export function Paginacion({ pagina, tamano, total, totalPaginas, alCambiar, unidad = ['resultado', 'resultados'] }) {
  if (!total) return null;
  const desde = pagina * tamano + 1;
  const hasta = Math.min(total, (pagina + 1) * tamano);
  const cambiar = (n) => {
    alCambiar(n);
    // Al cambiar de página, la lista nueva empieza arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={styles.paginacion} aria-label="Paginación">
      <span className={styles.resumen}>
        Mostrando{' '}
        <strong>
          {desde}–{hasta}
        </strong>{' '}
        de <strong>{total}</strong> {total === 1 ? unidad[0] : unidad[1]}
      </span>

      {totalPaginas > 1 && (
        <div className={styles.botones}>
          <button type="button" className={`${styles.boton} ${styles.texto}`} disabled={pagina <= 0} onClick={() => cambiar(pagina - 1)}>
            <Icono nombre="chevronIzquierda" tamano={16} />
            <span className={styles.etiqueta}>Anterior</span>
          </button>
          {numerosVisibles(pagina, totalPaginas).map((n, i) =>
            n === '…' ? (
              <span key={`p${i}`} className={styles.puntos} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                className={`${styles.boton} ${n === pagina ? styles.actual : ''}`}
                aria-current={n === pagina ? 'page' : undefined}
                aria-label={`Página ${n + 1}`}
                onClick={() => n !== pagina && cambiar(n)}
              >
                {n + 1}
              </button>
            ),
          )}
          <button
            type="button"
            className={`${styles.boton} ${styles.texto}`}
            disabled={pagina >= totalPaginas - 1}
            onClick={() => cambiar(pagina + 1)}
          >
            <span className={styles.etiqueta}>Siguiente</span>
            <Icono nombre="chevronDerecha" tamano={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
