export const API_URL = import.meta.env.VITE_API_URL ?? '/api';

/** Servicios simulados con MSW, por ejemplo ['auth', 'catalogo']. Vacío = todo real. */
export const SERVICIOS_MOCK = (import.meta.env.VITE_MOCKS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const MOCK_FALLA_COMPROBANTE = import.meta.env.VITE_MOCK_FALLA_COMPROBANTE === 'true';
