import { useEffect, useId } from 'react';
import styles from './Modal.module.css';

/** Tarjeta centrada de 480 px sobre un velo oscuro. `acciones`: botones a la derecha. */
export function Modal({ abierto, titulo, alCerrar, acciones, children }) {
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
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={idTitulo} onClick={(e) => e.stopPropagation()}>
        <h2 id={idTitulo} className={styles.titulo}>
          {titulo}
        </h2>
        <div>{children}</div>
        {acciones && <div className={styles.acciones}>{acciones}</div>}
      </div>
    </div>
  );
}
