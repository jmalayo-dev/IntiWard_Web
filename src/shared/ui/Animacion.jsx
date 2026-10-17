import { useEffect, useRef, useState } from 'react';

/**
 * Animación Lottie (archivo .json en public/). El reproductor (lottie-web, versión light: no ejecuta
 * expresiones) se descarga recién cuando se usa. Con "reducir movimiento" activado muestra el primer cuadro quieto.
 * Si no se puede cargar, muestra `respaldo`.
 */
export function Animacion({ src, ancho, alto, etiqueta, respaldo = null }) {
  const contenedor = useRef(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let animacion;
    let cancelado = false;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    Promise.all([import('lottie-web/build/player/lottie_light'), fetch(src).then((r) => (r.ok ? r.json() : Promise.reject(r)))])
      .then(([{ default: lottie }, datos]) => {
        if (cancelado) return;
        animacion = lottie.loadAnimation({
          container: contenedor.current,
          renderer: 'svg',
          loop: !quieto,
          autoplay: !quieto,
          animationData: datos,
        });
      })
      .catch(() => !cancelado && setFallo(true));

    return () => {
      cancelado = true;
      animacion?.destroy();
    };
  }, [src]);

  if (fallo) return respaldo;
  return <div ref={contenedor} role="img" aria-label={etiqueta} style={{ width: ancho, height: alto, maxWidth: '100%' }} />;
}
