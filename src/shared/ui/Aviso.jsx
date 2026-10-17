import { Icono } from './Icono';
import styles from './Aviso.module.css';

const ICONOS = { error: 'alerta', advertencia: 'alerta', exito: 'exito', info: 'info' };

/** Aviso en línea con ícono: el estado nunca se comunica solo con color. */
export function Aviso({ tipo = 'info', icono, children, className = '' }) {
  return (
    <div className={`${styles.aviso} ${styles[tipo]} ${className}`} role={tipo === 'error' || tipo === 'advertencia' ? 'alert' : 'status'}>
      <Icono nombre={icono ?? ICONOS[tipo]} className={styles.icono} />
      <span className={styles.texto}>{children}</span>
    </div>
  );
}
