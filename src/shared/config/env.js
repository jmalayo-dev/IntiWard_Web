export const API_URL = import.meta.env.VITE_API_URL ?? '/api';

const TODOS_LOS_SERVICIOS = 'auth,catalogo,inventario,pedidos,comprobantes';

/**
 * Servicios simulados con MSW, por ejemplo ['auth', 'catalogo']. Vacío = todo real.
 * En un build de demostración (VITE_MOCKS_EN_BUILD=true) sin VITE_MOCKS, se simulan los cinco.
 */
export const SERVICIOS_MOCK = (import.meta.env.VITE_MOCKS ?? (import.meta.env.VITE_MOCKS_EN_BUILD === 'true' ? TODOS_LOS_SERVICIOS : ''))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const MOCK_FALLA_COMPROBANTE = import.meta.env.VITE_MOCK_FALLA_COMPROBANTE === 'true';
