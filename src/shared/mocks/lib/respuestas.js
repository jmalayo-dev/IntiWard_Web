import { delay as esperar, HttpResponse } from 'msw';
import { API_URL } from '@/shared/config/env';

/** Ruta del mock = prefijo /api + ruta de ENDPOINTS. */
export const ruta = (endpoint) => `${API_URL}${endpoint}`;

/** Ruta con parámetro en formato MSW: rutaParam(ENDPOINTS.productos.detalle) → /api/productos/:id */
export const rutaParam = (fn, nombre = 'id') => ruta(fn(`:${nombre}`));

/** Latencia simulada para ver los estados de carga. */
export const latencia = () => esperar(300);

const FRASES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  423: 'Locked',
  503: 'Service Unavailable',
};

/** Error con el mismo formato que el ApiError del backend. */
export function error(status, mensaje, request, detalles = []) {
  return HttpResponse.json(
    {
      fecha: ahoraIso(),
      status,
      error: FRASES[status],
      mensaje,
      ruta: new URL(request.url).pathname.replace(API_URL, ''),
      detalles,
    },
    { status },
  );
}

/** Página de Spring Data en formato VIA_DTO. */
export function pagina(lista, page = 0, size = 12) {
  const inicio = page * size;
  return {
    content: lista.slice(inicio, inicio + size),
    page: { size, number: page, totalElements: lista.length, totalPages: Math.max(1, Math.ceil(lista.length / size)) },
  };
}

/** Fecha local sin zona, como LocalDateTime: "2026-10-15T14:35:00". */
export function ahoraIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export const siguienteId = (lista) => lista.reduce((max, x) => Math.max(max, x.id), 0) + 1;

/** Redondeo a 2 decimales, como BigDecimal HALF_UP. */
export const redondear = (n) => Math.round(n * 100) / 100;
