import { iniciales } from '@/shared/lib';

/** UsuarioResponse → usuario de la UI. */
export const aUsuario = (u) => ({
  ...u,
  nombreCompleto: `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim(),
  iniciales: iniciales(u.nombres, u.apellidos),
});
