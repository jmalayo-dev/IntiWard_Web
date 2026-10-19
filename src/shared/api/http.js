import axios from 'axios';
import { API_URL } from '@/shared/config/env';
import { ApiError } from './errores';
import { leerToken } from './token';

export const http = axios.create({ baseURL: API_URL });

let alNoAutorizado = () => {};

/** La capa app registra aquí qué hacer con un 401 (cerrar la sesión y llevar al login). */
export function registrarAlNoAutorizado(fn) {
  alNoAutorizado = fn;
}

http.interceptors.request.use((config) => {
  const token = leerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (respuesta) => respuesta.data,
  (error) => {
    const apiError = ApiError.desdeAxios(error);
    // En el login, el 401 es "credenciales inválidas", no una sesión vencida
    if (apiError.status === 401 && !error.config?.url?.endsWith('/auth/login')) alNoAutorizado();
    return Promise.reject(apiError);
  },
);
