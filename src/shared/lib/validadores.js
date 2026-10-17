// Las mismas reglas que valida el backend, para avisar antes de enviar
export const esCorreo = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v ?? '');
export const esClaveValida = (v) => (v ?? '').length >= 8;
export const esDni = (v) => /^\d{8}$/.test(v ?? '');
export const esRuc = (v) => /^(10|15|17|20)\d{9}$/.test(v ?? '');
