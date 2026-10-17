import { Icono } from './Icono';
import styles from './EstadoVacio.module.css';

/** Ícono grande gris, título, una línea de explicación y una acción opcional. */
export function EstadoVacio({ icono = 'bandeja', titulo, texto, accion }) {
  return (
    <div className={styles.vacio}>
      <Icono nombre={icono} tamano={48} grosor={1.5} className={styles.icono} />
      <h2 className={styles.titulo}>{titulo}</h2>
      {texto && <p className={styles.texto}>{texto}</p>}
      {accion}
    </div>
  );
}
