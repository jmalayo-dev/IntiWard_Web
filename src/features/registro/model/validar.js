import { esClaveValida, esCorreo } from '@/shared/lib';

/** Reglas del registro, con los textos de PROTOTIPO_WEB.md §4.5. Teléfono y dirección son opcionales. */
export function validarRegistro(datos) {
  const errores = {};
  if (!datos.nombres.trim()) errores.nombres = 'Ingresa tus nombres';
  if (!datos.apellidos.trim()) errores.apellidos = 'Ingresa tus apellidos';
  if (!esCorreo(datos.correo.trim())) errores.correo = 'Ingresa un correo válido';
  if (!esClaveValida(datos.password)) errores.password = 'La contraseña debe tener al menos 8 caracteres';
  if (!datos.confirmacion) errores.confirmacion = 'Confirma tu contraseña';
  else if (datos.confirmacion !== datos.password) errores.confirmacion = 'Las contraseñas no coinciden';
  if (!datos.aceptaTerminos) errores.aceptaTerminos = 'Debes aceptar los términos y la política de privacidad';
  return errores;
}
