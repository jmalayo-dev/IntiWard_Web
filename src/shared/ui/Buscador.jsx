import { Icono } from './Icono';
import styles from './Buscador.module.css';

/** Campo de búsqueda con lupa. */
export function Buscador({ etiqueta = 'Buscar', className = '', ...resto }) {
  return (
    <label className={`${styles.buscador} ${className}`}>
      <Icono nombre="buscar" className={styles.icono} />
      <span className="solo-lectores">{etiqueta}</span>
      <input type="search" className={styles.entrada} {...resto} />
    </label>
  );
}
