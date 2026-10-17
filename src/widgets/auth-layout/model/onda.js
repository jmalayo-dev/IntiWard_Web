/**
 * Línea divisoria del marco dividido: onda sinusoidal vertical x(y) = A·sin(ω·y + φ) + D.
 * x es el corrimiento horizontal respecto de la división recta (el centro) e y baja por la pantalla.
 * Donde x > 0 la aurora entra en la mitad del formulario; donde x < 0 el blanco entra en la aurora.
 */
/** false: la división es recta. El código de la onda queda listo para volver a usarla con true. */
export const ONDA_ACTIVA = false;

export const ONDA = { amplitud: 0.4, frecuencia: .4, fase: 2, desplazamiento: -0.3 };

/** Cuántos píxeles mide 1 unidad de la ecuación (4 rem): amplitud de 51 px y un ciclo cada ~503 px. */
export const PX_POR_UNIDAD = 64;

export const AMPLITUD_PX = ONDA.amplitud * PX_POR_UNIDAD;
const PASO_PX = 4;

const corrimiento = (yPx) => {
  const y = yPx / PX_POR_UNIDAD;
  return (ONDA.amplitud * Math.sin(ONDA.frecuencia * y + ONDA.fase) + ONDA.desplazamiento) * PX_POR_UNIDAD;
};

/**
 * clip-path del panel de marca. El panel mide 50 % + la amplitud y se mete esa amplitud bajo el formulario,
 * así la división recta queda a `AMPLITUD_PX` de su borde derecho y la onda oscila a ambos lados.
 */
export function recorteOnda(altoPx) {
  const borde = (y) => `calc(100% - ${AMPLITUD_PX}px + ${corrimiento(y).toFixed(1)}px) ${y}px`;
  const puntos = ['0 0'];
  for (let y = 0; y < altoPx; y += PASO_PX) puntos.push(borde(y));
  puntos.push(borde(altoPx), `0 ${altoPx}px`);
  return `polygon(${puntos.join(', ')})`;
}
