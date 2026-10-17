import styles from './Tarjeta.module.css';

/** Tarjeta blanca con borde, radio 12 y sombra suave. `titulo` y `accion` opcionales en la cabecera. */
export function Tarjeta({ titulo, accion, children, className = '', sinRelleno = false, como: Etiqueta = 'section' }) {
  return (
    <Etiqueta className={`${styles.tarjeta} ${sinRelleno ? styles.sinRelleno : ''} ${className}`}>
      {(titulo || accion) && (
        <header className={styles.cabecera}>
          {titulo && <h2 className={styles.titulo}>{titulo}</h2>}
          {accion}
        </header>
      )}
      {children}
    </Etiqueta>
  );
}
