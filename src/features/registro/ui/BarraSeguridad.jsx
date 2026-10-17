import { nivelDeClave, textoDeNivel } from '../model/seguridadClave';
import styles from './BarraSeguridad.module.css';

const CLASE_NIVEL = { 1: styles.nivel1, 2: styles.nivel2, 3: styles.nivel3, 4: styles.nivel4 };

/** Una sola barra que se llena por porcentaje (25 % por nivel), con un color para cada nivel. */
export function BarraSeguridad({ clave }) {
  const nivel = nivelDeClave(clave);
  const porcentaje = nivel * 25;
  return (
    <div
      className={styles.pista}
      role="meter"
      aria-label="Seguridad de la contraseña"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={porcentaje}
      aria-valuetext={nivel ? `${porcentaje} %, ${textoDeNivel(nivel)}` : 'Sin contraseña'}
    >
      <span className={`${styles.relleno} ${CLASE_NIVEL[nivel] ?? ''}`} style={{ width: `${porcentaje}%` }} />
    </div>
  );
}
