import { useEffect, useId } from 'react';
import { Icono } from './Icono';
import styles from './PanelLateral.module.css';

/** Panel que entra por la derecha (560 px) sobre un velo. */
export function PanelLateral({ abierto, titulo, alCerrar, acciones, children }) {
  const idTitulo = useId();

  useEffect(() => {
    if (!abierto) return undefined;
    const alTeclear = (e) => e.key === 'Escape' && alCerrar?.();
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto, alCerrar]);

  if (!abierto) return null;
  return (
    <div className={styles.velo} onClick={alCerrar}>
      <aside className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={idTitulo} onClick={(e) => e.stopPropagation()}>
        <header className={styles.cabecera}>
          <h2 id={idTitulo} className={styles.titulo}>
            {titulo}
          </h2>
          <button type="button" className={styles.cerrar} onClick={alCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" />
          </button>
        </header>
        {acciones && <div className={styles.acciones}>{acciones}</div>}
        <div className={styles.contenido}>{children}</div>
      </aside>
    </div>
  );
}
