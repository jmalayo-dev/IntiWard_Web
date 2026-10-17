import { esClaveValida, esCorreo } from '@/shared/lib';

/** Mismas reglas que LoginRequest de ms-auth, con los textos de PROTOTIPO_WEB.md §4.4. */
export function validarLogin({ correo, password }) {
  const errores = {};
  if (!esCorreo(correo.trim())) errores.correo = 'Ingresa un correo válido';
  if (!esClaveValida(password)) errores.password = 'La contraseña debe tener al menos 8 caracteres';
  return errores;
}
