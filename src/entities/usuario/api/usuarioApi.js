import { ENDPOINTS, http } from '@/shared/api';
import { aUsuario } from '../model/adaptadores';

export const listarUsuarios = async () => (await http.get(ENDPOINTS.usuarios.lista)).map(aUsuario);

export const obtenerUsuario = async (id) => aUsuario(await http.get(ENDPOINTS.usuarios.detalle(id)));

/** Perfil del usuario del token (propuesta → Galarza: GET /usuarios/me). */
export const obtenerPerfil = async () => aUsuario(await http.get(ENDPOINTS.usuarios.yo));

// Escrituras: las usan las features guardar-usuario, desactivar-usuario y editar-perfil
export const crearUsuario = (datos) => http.post(ENDPOINTS.usuarios.lista, datos);
export const editarUsuario = (id, datos) => http.put(ENDPOINTS.usuarios.detalle(id), datos);
export const desactivarUsuario = (id) => http.delete(ENDPOINTS.usuarios.detalle(id));
export const editarPerfil = async (datos) => aUsuario(await http.put(ENDPOINTS.usuarios.yo, datos));
