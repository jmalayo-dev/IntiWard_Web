import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AuroraBackground, Icono, Logo } from '@/shared/ui';
import { AMPLITUD_PX, ONDA_ACTIVA, recorteOnda } from '../model/onda';
import styles from './AuthLayout.module.css';

const BENEFICIOS = ['Compra con boleta o factura', 'Sigue tus pedidos', 'Descarga tus comprobantes'];

/**
 * Marco de las vistas 4.4 (Iniciar sesión) y 4.5 (Crear cuenta): una tarjeta centrada sobre fondo gris,
 * con la marca a la izquierda y el formulario a la derecha.
 * La división puede ser una onda sinusoidal vertical (model/onda.js, apagada con ONDA_ACTIVA = false).
 */
export function AuthLayout() {
  // Se guarda solo el alto real del panel (crece si el formulario es más alto que la pantalla) y la onda se
  // calcula en cada render: así un cambio en model/onda.js se aplica entero, sin quedar a medias
  const panel = useRef(null);
  const [alto, setAlto] = useState(0);
  useEffect(() => {
    const observador = new ResizeObserver(([entrada]) => setAlto(Math.ceil(entrada.borderBoxSize[0].blockSize)));
    observador.observe(panel.current);
    return () => observador.disconnect();
  }, []);
  const recorte = ONDA_ACTIVA && alto ? recorteOnda(alto) : undefined;
  const amplitud = ONDA_ACTIVA ? AMPLITUD_PX : 0;

  return (
    <main className={styles.pantalla}>
      <div className={styles.tarjeta} style={{ '--onda-amplitud': `${amplitud}px` }}>
        {/* "dark": activa el modo oscuro de AuroraBackground (zinc-900 con la aurora encendida) solo en este panel */}
        <AuroraBackground ref={panel} className={`dark ${styles.marca}`} style={{ clipPath: recorte }} aria-label="IntiGuard" role="region">
          <div className={styles.contenido}>
            <Logo claro tamano={40} />
            <p className={styles.frase}>Protege lo que más importa.</p>
            <ul className={styles.beneficios}>
              {BENEFICIOS.map((texto) => (
                <li key={texto} className={styles.beneficio}>
                  <span className={styles.check}>
                    <Icono nombre="check" tamano={16} grosor={2.5} />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>
        </AuroraBackground>

        <section className={styles.formulario}>
          <Outlet />
        </section>
      </div>
    </main>
  );
}
