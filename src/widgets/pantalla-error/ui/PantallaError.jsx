import { Link } from 'react-router-dom';
import { RUTAS } from '@/shared/config';
import { Animacion } from '@/shared/ui';
import styles from './PantallaError.module.css';

const TIPOS = {
  404: {
    codigo: '404',
    titulo: 'No encontramos esta página',
    texto: 'Puede que el enlace esté mal escrito o que el producto ya no exista.',
    boton: 'Volver al inicio',
    a: RUTAS.inicio,
  },
  403: {
    codigo: '403',
    titulo: 'No tienes permiso para ver esta página',
    texto: 'Si crees que es un error, inicia sesión con otra cuenta.',
    boton: 'Ir a la tienda',
    a: RUTAS.inicio,
  },
  sesion: {
    titulo: 'Tu sesión expiró',
    texto: 'Por seguridad, cerramos tu sesión después de 1 hora.',
    boton: 'Iniciar sesión de nuevo',
    a: RUTAS.login,
  },
  conexion: {
    titulo: 'Algo salió mal',
    texto: 'No pudimos conectar con la tienda. Intenta de nuevo en unos minutos.',
    boton: 'Reintentar',
  },
};

/** Escudo con sol y lupa, en azul y dorado (ilustración de la vista 4.14). */
function Ilustracion() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M48 10L20 22V42C20 60.5 32 74.5 48 78C64 74.5 76 60.5 76 42V22L48 10Z" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="40" r="8" fill="#F59E0B" />
      <path d="M48 26V29M48 51V54M34 40H37M59 40H62M38 30L40 32M56 48L58 50M38 50L40 48M56 30L58 32" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="56" cy="54" r="14" stroke="#1E3A8A" strokeWidth="3.5" fill="#F8FAFC" fillOpacity="0.85" />
      <line x1="66.5" y1="64.5" x2="80" y2="78" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

/** Vista 4.14: 404, sin permiso (403), sesión expirada y sin conexión. */
export function PantallaError({ tipo = 404 }) {
  const datos = TIPOS[tipo] ?? TIPOS[404];
  return (
    <section className={styles.pantalla}>
      {tipo === 404 ? (
        // La animación ya muestra el "404"; si no carga, vuelven el escudo y el código
        <Animacion
          src="/animaciones/error-404.json"
          ancho={300}
          alto={279}
          etiqueta="Error 404"
          respaldo={
            <>
              <Ilustracion />
              <p className={styles.codigo}>404</p>
            </>
          }
        />
      ) : (
        <>
          <Ilustracion />
          {datos.codigo && <p className={styles.codigo}>{datos.codigo}</p>}
        </>
      )}
      <h1 className={styles.titulo}>{datos.titulo}</h1>
      <p className={styles.texto}>{datos.texto}</p>
      {datos.a ? (
        <Link to={datos.a} className={styles.boton}>
          {datos.boton}
        </Link>
      ) : (
        <button type="button" className={styles.boton} onClick={() => window.location.reload()}>
          {datos.boton}
        </button>
      )}
    </section>
  );
}
