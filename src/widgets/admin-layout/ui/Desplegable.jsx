import { useEffect, useRef, useState } from 'react';
import styles from './Desplegable.module.css';

/**
 * Botón que abre una lista de opciones; se cierra al elegir, al hacer clic afuera o con Escape.
 * `boton(abierto, alternar)` dibuja el disparador; `children(cerrar)` dibuja las opciones.
 * Las opciones usan las clases .opcion y .separador de Desplegable.module.css.
 * `lado`: hacia dónde se alinea la lista ('derecha' | 'izquierda'); `arriba`: se abre hacia arriba.
 */
export function Desplegable({ boton, children, lado = 'derecha', arriba = false, className = '' }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => !ref.current?.contains(e.target) && setAbierto(false);
    const escape = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', escape);
    };
  }, [abierto]);

  return (
    <div className={`${styles.desplegable} ${className}`} ref={ref}>
      {boton(abierto, () => setAbierto((v) => !v))}
      {abierto && (
        <div className={`${styles.lista} ${styles[lado]} ${arriba ? styles.arriba : ''}`} role="menu">
          {children(() => setAbierto(false))}
        </div>
      )}
    </div>
  );
}

