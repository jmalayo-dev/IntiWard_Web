import { Link } from 'react-router-dom';
import styles from './Migas.module.css';

/** "Inicio / Catálogo / Cámaras": la última en negro. items: [{ texto, a? }] */
export function Migas({ items, className = '' }) {
  return (
    <nav aria-label="Migas de pan" className={className}>
      <ol className={styles.migas}>
        {items.map((item, i) => {
          const ultima = i === items.length - 1;
          return (
            <li key={`${item.texto}-${i}`} className={styles.item}>
              {item.a && !ultima ? (
                <Link to={item.a} className={styles.enlace}>
                  {item.texto}
                </Link>
              ) : (
                <span className={ultima ? styles.actual : undefined} aria-current={ultima ? 'page' : undefined}>
                  {item.texto}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
