import { Icono } from '@/shared/ui';
import { revisarClave } from '../model/seguridadClave';
import styles from './RequisitosClave.module.css';

/** Lista de requisitos de la contraseña: cada uno que se cumple queda tachado, en gris y con check. */
export function RequisitosClave({ clave }) {
  return (
    <ul className={styles.lista} aria-label="Requisitos de la contraseña">
      {revisarClave(clave).map((r) => (
        <li key={r.id} className={`${styles.requisito} ${r.cumplido ? styles.cumplido : ''}`}>
          <span className={styles.marca} aria-hidden="true">
            {r.cumplido ? <Icono nombre="check" tamano={12} grosor={3} /> : null}
          </span>
          <span className={styles.texto}>
            {r.texto}
            {r.obligatorio && <span className={styles.obligatorio}> (obligatorio)</span>}
          </span>
          <span className="solo-lectores">{r.cumplido ? ': cumplido' : ': pendiente'}</span>
        </li>
      ))}
    </ul>
  );
}
