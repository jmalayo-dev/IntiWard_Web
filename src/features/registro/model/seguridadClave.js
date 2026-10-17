/**
 * Requisitos de la contraseña. Solo el mínimo de 8 caracteres lo exige el backend;
 * los demás son para que sea fuerte y suben el nivel de la barra de seguridad.
 */
export const REQUISITOS_CLAVE = [
  { id: 'largo', texto: 'Al menos 8 caracteres', obligatorio: true, cumple: (c) => c.length >= 8 },
  { id: 'mayusculas', texto: 'Mayúsculas y minúsculas', cumple: (c) => /[a-z]/.test(c) && /[A-Z]/.test(c) },
  { id: 'numero', texto: 'Al menos un número', cumple: (c) => /\d/.test(c) },
  { id: 'simbolo', texto: 'Un símbolo (por ejemplo ! @ #) o 14 caracteres o más', cumple: (c) => /[^A-Za-z0-9]/.test(c) || c.length >= 14 },
];

/** Cada requisito con `cumplido: true/false` para la clave dada. */
export const revisarClave = (clave = '') => REQUISITOS_CLAVE.map((r) => ({ ...r, cumplido: r.cumple(clave) }));

/**
 * Nivel de 0 a 4 para la barra de seguridad: 1 si no llega a 8 caracteres;
 * si llega, 1 + cada requisito extra que cumple.
 */
export function nivelDeClave(clave = '') {
  if (!clave) return 0;
  const [largo, ...extras] = revisarClave(clave);
  if (!largo.cumplido) return 1;
  return Math.min(1 + extras.filter((r) => r.cumplido).length, 4);
}

/** Débil (1), media (2) o fuerte (3–4). */
export function textoDeNivel(nivel) {
  if (nivel >= 3) return 'fuerte';
  if (nivel === 2) return 'media';
  return 'débil';
}
