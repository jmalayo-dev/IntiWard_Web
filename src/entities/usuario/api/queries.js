import { useQuery } from '@tanstack/react-query';
import { listarUsuarios, obtenerPerfil, obtenerUsuario } from './usuarioApi';

export const usuarioKeys = {
  todos: ['usuarios'],
  lista: () => ['usuarios', 'lista'],
  detalle: (id) => ['usuarios', 'detalle', id],
  perfil: () => ['usuarios', 'perfil'],
};

export const useUsuarios = ({ habilitado = true } = {}) => useQuery({ queryKey: usuarioKeys.lista(), queryFn: listarUsuarios, enabled: habilitado });

export const useUsuario = (id) =>
  useQuery({ queryKey: usuarioKeys.detalle(id), queryFn: () => obtenerUsuario(id), enabled: Boolean(id) });

/** El usuario que inició sesión. Quien lo usa pasa `habilitado` según la sesión. */
export const usePerfil = ({ habilitado = true } = {}) => useQuery({ queryKey: usuarioKeys.perfil(), queryFn: obtenerPerfil, enabled: habilitado });
