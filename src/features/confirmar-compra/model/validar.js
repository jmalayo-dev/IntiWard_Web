import { esDni, esRuc } from '@/shared/lib';

/** Reglas de la vista 4.7: en boleta el DNI es opcional; en factura, RUC y razón social obligatorios. */
export function validarComprobante({ tipo, dni, ruc, razonSocial }) {
  const errores = {};
  if (tipo === 'BOLETA' && dni.trim() && !esDni(dni.trim())) errores.dni = 'El DNI debe tener 8 dígitos';
  if (tipo === 'FACTURA') {
    if (!esRuc(ruc.trim())) errores.ruc = 'El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20';
    if (!razonSocial.trim()) errores.razonSocial = 'La razón social es obligatoria para factura';
  }
  return errores;
}

/** 400 del checkout → errores por campo (docCliente / nombreRazonSocial) o un aviso general. */
export function leerErrorCompra(error, tipo) {
  if (!error || error.status !== 400) return { campos: {}, aviso: error && ![409, 503].includes(error.status) ? error.message : null };
  const campos = {};
  for (const detalle of error.detalles ?? []) {
    const [campo, mensaje] = detalle.split(':').map((s) => s.trim());
    if (campo === 'docCliente') campos[tipo === 'FACTURA' ? 'ruc' : 'dni'] = mensaje;
    if (campo === 'nombreRazonSocial') campos.razonSocial = mensaje;
  }
  return { campos, aviso: Object.keys(campos).length ? null : error.message };
}
