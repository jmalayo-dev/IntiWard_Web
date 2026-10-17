import styles from './Boton.module.css';

/**
 * @param {{ variante?: 'primario'|'acento'|'secundario'|'peligro', anchoCompleto?: boolean, cargando?: boolean }} props
 */
export function Boton({
  variante = 'primario',
  anchoCompleto = false,
  cargando = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...resto
}) {
  const clases = [styles.boton, styles[variante], anchoCompleto && styles.anchoCompleto, cargando && styles.cargando, className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={clases} disabled={disabled || cargando} aria-busy={cargando || undefined} {...resto}>
      {cargando && <span className={styles.giro} aria-hidden="true" />}
      {children}
    </button>
  );
}
