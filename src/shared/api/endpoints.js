/**
 * Rutas del backend, relativas al gateway. Única fuente de verdad del front:
 * si una ruta cambia en un microservicio, se cambia solo aquí.
 * No incluye las rutas internas (/stock/reservar, /stock/confirmar, /stock/liberar, POST /comprobantes).
 */
export const ENDPOINTS = {
  // ms-auth
  auth: {
    login: '/auth/login',
    registro: '/auth/registro',
  },
  usuarios: {
    lista: '/usuarios',
    detalle: (id) => `/usuarios/${id}`,
    yo: '/usuarios/me', // propuesta → Galarza: el cliente lee y edita su propio perfil
  },

  // ms-catalogo
  productos: {
    lista: '/productos',
    detalle: (id) => `/productos/${id}`,
  },
  // Crear y editar marcas y categorías: propuesta → César
  marcas: { lista: '/marcas', detalle: (id) => `/marcas/${id}` },
  categorias: { lista: '/categorias', detalle: (id) => `/categorias/${id}` },

  // ms-inventario
  stock: {
    lista: '/stock', // propuesta → Arévalo: GET /stock?ids=1,2,3 (una llamada por grilla, no una por tarjeta)
    detalle: (idProducto) => `/stock/${idProducto}`,
    entrada: '/stock/entrada',
  },
  movimientos: { lista: '/movimientos' },

  // ms-pedidos
  carrito: {
    ver: '/carrito',
    items: '/carrito/items',
    item: (idProducto) => `/carrito/items/${idProducto}`,
  },
  pedidos: {
    lista: '/pedidos',
    detalle: (id) => `/pedidos/${id}`,
    checkout: '/pedidos/checkout',
  },

  // ms-comprobantes
  comprobantes: {
    lista: '/comprobantes',
    detalle: (id) => `/comprobantes/${id}`,
    porVenta: (idVenta) => `/comprobantes/venta/${idVenta}`,
    pdf: (id) => `/comprobantes/${id}/pdf`,
    reporte: '/comprobantes/reporte',
  },
};
