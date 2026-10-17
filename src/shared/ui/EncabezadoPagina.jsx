import styles from './EncabezadoPagina.module.css';

/** Título de la página (28 px) con subtítulo gris a la izquierda y acciones a la derecha. */
export function EncabezadoPagina({ titulo, subtitulo, acciones, className = '' }) {
  return (
    <div className={`${styles.encabezado} ${className}`}>
      <div className={styles.textos}>
        <h1 className={styles.titulo}>{titulo}</h1>
        {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
      </div>
      {acciones && <div className={styles.acciones}>{acciones}</div>}
    </div>
  );
}
