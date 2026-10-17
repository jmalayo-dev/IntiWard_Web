import styles from './Cargando.module.css';

/** Esqueleto de carga: bloques grises en lugar del contenido. */
export function Cargando({ ancho = '100%', alto = 16, lineas = 1 }) {
  return (
    <span role="status" aria-label="Cargando" style={{ display: 'grid', gap: 8 }}>
      {Array.from({ length: lineas }, (_, i) => (
        <span key={i} className={styles.esqueleto} style={{ width: ancho, height: alto }} />
      ))}
    </span>
  );
}
