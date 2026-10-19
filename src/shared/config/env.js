/** URL base del backend: en desarrollo /api (el proxy de Vite la manda al gateway); en producción, el gateway publicado. */
export const API_URL = import.meta.env.VITE_API_URL ?? '/api';
