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
 * "Mostrando 1–10 de 48" + flechas (y números si `numeros`). Recibe la página normalizada por aPagina() (pagina empieza en 0).
 * `centrada`: solo los números, al centro (catálogo).
 */
export function Paginacion({ pagina, tamano, total, totalPaginas, alCambiar, numeros = false, centrada = false }) {
  if (!total) return null;
  const desde = pagina * tamano + 1;
  const hasta = Math.min(total, (pagina + 1) * tamano);
  return (
    <nav className={`${styles.paginacion} ${centrada ? styles.centrada : ''}`} aria-label="Paginación">
      {!centrada && (
        <span>
          Mostrando {desde}–{hasta} de {total}
        </span>
      )}
      {(totalPaginas > 1 || centrada) && (
        <div className={styles.flechas}>
          <button type="button" className={styles.flecha} disabled={pagina <= 0} onClick={() => alCambiar(pagina - 1)} aria-label="Página anterior">
            <Icono nombre="chevronIzquierda" tamano={16} />
          </button>
          {(numeros || centrada) &&
            numerosVisibles(pagina, totalPaginas).map((n, i) =>
              n === '…' ? (
                <span key={`p${i}`} className={styles.puntos}>
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  className={`${styles.flecha} ${n === pagina ? styles.actual : ''}`}
                  aria-current={n === pagina ? 'page' : undefined}
                  onClick={() => alCambiar(n)}
                >
                  {n + 1}
                </button>
              ),
            )}
          <button
            type="button"
            className={styles.flecha}
            disabled={pagina >= totalPaginas - 1}
            onClick={() => alCambiar(pagina + 1)}
            aria-label="Página siguiente"
          >
            <Icono nombre="chevronDerecha" tamano={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
