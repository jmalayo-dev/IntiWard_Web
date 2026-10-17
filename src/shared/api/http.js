import axios from 'axios';
import { API_URL } from '@/shared/config/env';
import { ApiError } from './errores';
import { leerToken } from './token';

export const http = axios.create({ baseURL: API_URL });

let alNoAutorizado = () => {};
let alFallarGateway = null;

/** La capa app registra aquí qué hacer con un 401 (cerrar la sesión y llevar al login). */
export function registrarAlNoAutorizado(fn) {
  alNoAutorizado = fn;
}

/**
 * La capa app registra aquí cómo recuperarse de un 502 sin cuerpo (el gateway no respondió).
 * En desarrollo lo usa main.jsx para reactivar los mocks: si el navegador apagó el service worker
 * de MSW, la petición se escapa al proxy y vuelve 502. Se reintenta una sola vez.
 */
export function registrarAlFallarGateway(fn) {
  alFallarGateway = fn;
}

http.interceptors.request.use((config) => {
  const token = leerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (respuesta) => respuesta.data,
  async (error) => {
    const sinGateway = error.response?.status === 502 && !error.response.data?.mensaje;
    if (sinGateway && alFallarGateway && !error.config?.reintentado) {
      await alFallarGateway();
      return http({ ...error.config, reintentado: true });
    }
    const apiError = ApiError.desdeAxios(error);
    // En el login, el 401 es "credenciales inválidas", no una sesión vencida
    if (apiError.status === 401 && !error.config?.url?.endsWith('/auth/login')) alNoAutorizado();
    return Promise.reject(apiError);
  },
);
