import { useEffect } from 'react';
import { Icono } from './Icono';
import styles from './Toast.module.css';

const ICONOS = { exito: 'check', error: 'alerta', info: 'info', advertencia: 'alerta' };

/** Aviso pequeño arriba a la derecha que se cierra solo a los 4 s. */
export function Toast({ mensaje, tipo = 'exito', alCerrar }) {
  useEffect(() => {
    if (!mensaje) return undefined;
    const id = setTimeout(() => alCerrar?.(), 4000);
    return () => clearTimeout(id);
  }, [mensaje, alCerrar]);

  if (!mensaje) return null;
  return (
    <div className={`${styles.toast} ${styles[tipo]}`} role="status">
      <Icono nombre={ICONOS[tipo]} />
      <span>{mensaje}</span>
      <button type="button" className={styles.cerrar} onClick={alCerrar} aria-label="Cerrar aviso">
        <Icono nombre="cerrar" tamano={16} />
      </button>
    </div>
  );
}
