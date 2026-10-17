import { createBrowserRouter } from 'react-router-dom';
import { AdminComprobantesPage } from '@/pages/admin-comprobantes';
import { AdminMarcasCategoriasPage } from '@/pages/admin-marcas-categorias';
import { AdminMovimientosPage } from '@/pages/admin-movimientos';
import { AdminProductoFormPage } from '@/pages/admin-producto-form';
import { AdminProductosPage } from '@/pages/admin-productos';
import { AdminReportesPage } from '@/pages/admin-reportes';
import { AdminResumenPage } from '@/pages/admin-resumen';
import { AdminStockPage } from '@/pages/admin-stock';
import { AdminUsuariosPage } from '@/pages/admin-usuarios';
import { AdminVentaDetallePage } from '@/pages/admin-venta-detalle';
import { AdminVentasPage } from '@/pages/admin-ventas';
import { CarritoPage } from '@/pages/carrito';
import { CatalogoPage } from '@/pages/catalogo';
import { CheckoutPage } from '@/pages/checkout';
import { CompraConfirmadaPage } from '@/pages/compra-confirmada';
import { CompraNoCompletadaPage } from '@/pages/compra-no-completada';
import { ComprobanteImprimiblePage } from '@/pages/comprobante-imprimible';
import { ErrorPage } from '@/pages/error';
import { InicioPage } from '@/pages/inicio';
import { LoginPage } from '@/pages/login';
import { MisPedidosPage } from '@/pages/mis-pedidos';
import { PedidoDetallePage } from '@/pages/pedido-detalle';
import { PerfilPage } from '@/pages/perfil';
import { ProductoDetallePage } from '@/pages/producto-detalle';
import { RegistroPage } from '@/pages/registro';
import { RUTAS } from '@/shared/config';
import { AdminLayout } from '@/widgets/admin-layout';
import { AuthLayout } from '@/widgets/auth-layout';
import { ComprobacionSesion } from '@/widgets/comprobacion-sesion';
import { TiendaLayout, TiendaSimpleLayout } from '@/widgets/tienda-layout';
import { RequiereRol, RequiereSesion, SoloInvitado } from './guardas';

// Migas de la barra superior del panel (las lee widgets/admin-layout); siempre empiezan en "Administración"
const migas = (...items) => ({ migas: items });
const CATALOGO = { texto: 'Catálogo', a: RUTAS.adminProductos };
const INVENTARIO = { texto: 'Inventario', a: RUTAS.adminStock };
const VENTAS = { texto: 'Ventas', a: RUTAS.adminVentas };

export const router = createBrowserRouter([
  // TEMPORAL: barra "Logeado!" en todas las vistas. Para quitarla, dejar solo los children.
  {
    element: <ComprobacionSesion />,
    children: [
      // Pantalla dividida, solo para visitantes
      {
        element: <SoloInvitado />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/registro', element: <RegistroPage /> },
            ],
          },
        ],
      },

      // Tienda
      {
        element: <TiendaLayout />,
        children: [
          { path: '/', element: <InicioPage /> },
          { path: '/catalogo', element: <CatalogoPage /> },
          { path: '/productos/:id', element: <ProductoDetallePage /> },
          {
            element: <RequiereRol rol="CLIENTE" />,
            children: [
              { path: '/carrito', element: <CarritoPage /> },
              { path: '/compra/:idVenta/confirmada', element: <CompraConfirmadaPage /> },
              { path: '/compra/no-completada', element: <CompraNoCompletadaPage /> },
              { path: '/mis-pedidos', element: <MisPedidosPage /> },
              { path: '/mis-pedidos/:id', element: <PedidoDetallePage /> },
            ],
          },
          {
            element: <RequiereSesion />,
            children: [{ path: '/perfil', element: <PerfilPage /> }],
          },
          { path: '/403', element: <ErrorPage tipo={403} /> },
          { path: '/sesion-expirada', element: <ErrorPage tipo="sesion" /> },
          { path: '/sin-conexion', element: <ErrorPage tipo="conexion" /> },
          { path: '*', element: <ErrorPage tipo={404} /> },
        ],
      },

      // Checkout: marco simplificado (solo logo y "Compra segura")
      {
        element: <RequiereRol rol="CLIENTE" />,
        children: [
          {
            element: <TiendaSimpleLayout />,
            children: [{ path: '/checkout', element: <CheckoutPage /> }],
          },
        ],
      },

      // Comprobante imprimible: sin marco
      {
        element: <RequiereSesion />,
        children: [{ path: '/comprobantes/:id/imprimir', element: <ComprobanteImprimiblePage /> }],
      },

      // Panel de administración
      {
        path: '/admin',
        element: <RequiereRol rol="ADMIN" />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminResumenPage />, handle: migas({ texto: 'Resumen' }) },
              { path: 'productos', element: <AdminProductosPage />, handle: migas(CATALOGO, { texto: 'Productos' }) },
              {
                path: 'productos/nuevo',
                element: <AdminProductoFormPage />,
                handle: migas({ texto: 'Productos', a: RUTAS.adminProductos }, { texto: 'Nuevo producto' }),
              },
              {
                path: 'productos/:id/editar',
                element: <AdminProductoFormPage />,
                handle: migas({ texto: 'Productos', a: RUTAS.adminProductos }, { texto: 'Editar producto' }),
              },
              { path: 'marcas-categorias', element: <AdminMarcasCategoriasPage />, handle: migas(CATALOGO, { texto: 'Marcas y categorías' }) },
              { path: 'stock', element: <AdminStockPage />, handle: migas(INVENTARIO, { texto: 'Stock' }) },
              { path: 'movimientos', element: <AdminMovimientosPage />, handle: migas(INVENTARIO, { texto: 'Movimientos' }) },
              { path: 'ventas', element: <AdminVentasPage />, handle: migas({ texto: 'Ventas' }) },
              { path: 'ventas/:id', element: <AdminVentaDetallePage />, handle: migas(VENTAS, { texto: 'Detalle de venta' }) },
              { path: 'comprobantes', element: <AdminComprobantesPage />, handle: migas(VENTAS, { texto: 'Comprobantes' }) },
              { path: 'reportes', element: <AdminReportesPage />, handle: migas(VENTAS, { texto: 'Reportes' }) },
              { path: 'usuarios', element: <AdminUsuariosPage />, handle: migas({ texto: 'Usuarios' }) },
              { path: '*', element: <ErrorPage tipo={404} />, handle: migas({ texto: 'No encontrada' }) },
            ],
          },
        ],
      },
    ],
  },
]);
