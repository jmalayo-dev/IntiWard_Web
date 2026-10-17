import { Icono } from './Icono';
import styles from './TarjetaResultado.module.css';

/** Tarjeta centrada de 640 px con un círculo de color e ícono, título y texto (vistas 4.8 y 4.9). */
export function TarjetaResultado({ icono, tono = 'exito', titulo, children, acciones, pie }) {
  return (
    <section className={styles.tarjeta}>
      <span className={`${styles.circulo} ${styles[tono]}`}>
        <Icono nombre={icono} tamano={tono === 'exito' ? 44 : 34} grosor={tono === 'exito' ? 3 : 2} />
      </span>
      <h1 className={styles.titulo}>{titulo}</h1>
      <div className={styles.contenido}>{children}</div>
      {acciones && <div className={styles.acciones}>{acciones}</div>}
      {pie}
    </section>
  );
}
