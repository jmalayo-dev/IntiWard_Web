import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { MOCK_FALLA_COMPROBANTE } from '@/shared/config/env';
import { esDni, esRuc } from '@/shared/lib/validadores';
import { carritoDe, carritos } from '../db/carritos';
import { marcas } from '../db/marcas';
import { productos } from '../db/productos';
import { stock } from '../db/stock';
import { aVentaResponse, ventas } from '../db/ventas';
import { ahoraIso, error, latencia, redondear, ruta, rutaParam, siguienteId } from '../lib/respuestas';
import { requiereRol, requiereSesion } from '../lib/sesion';
import { emitirComprobante } from './comprobantes';
import { registrarMovimiento } from './inventario';

/** Carrito (propuesta → Evelyn): { items: [{ idProducto, nombre, marca, precio, imagenUrl, cantidad, importe }], total }. */
function aCarritoResponse(idUsuario) {
  const items = carritoDe(idUsuario).map(({ idProducto, cantidad }) => {
    const p = productos.find((x) => x.id === idProducto);
    const marca = marcas.find((m) => m.id === p.idMarca)?.nombre ?? '';
    return { idProducto, nombre: p.nombre, marca, precio: p.precio, imagenUrl: p.imagenUrl, cantidad, importe: redondear(p.precio * cantidad) };
  });
  return { items, total: redondear(items.reduce((s, i) => s + i.importe, 0)) };
}

const productoActivo = (id) => productos.find((p) => p.id === Number(id) && p.activo);

/** Igual que Venta.asignarMontos: los precios incluyen IGV. */
function montos(total) {
  const subtotal = redondear(total / 1.18);
  return { subtotal, igv: redondear(total - subtotal), total: redondear(total) };
}

/** Igual que ms-inventario: liberar devuelve lo reservado a `disponible`. */
function liberar(lineas, idVenta) {
  for (const { idProducto, cantidad } of lineas) {
    const fila = stock.find((s) => s.idProducto === idProducto);
    fila.disponible += cantidad;
    fila.reservado -= cantidad;
    registrarMovimiento({ idProducto, tipo: 'LIBERACION', cantidad, idVenta });
  }
}

export const pedidos = [
  http.get(ruta(ENDPOINTS.carrito.ver), async ({ request }) => {
    await latencia();
    const [usuario, fallo] = requiereRol(request, 'CLIENTE');
    if (fallo) return fallo;
    return HttpResponse.json(aCarritoResponse(usuario.id));
  }),

  http.post(ruta(ENDPOINTS.carrito.items), async ({ request }) => {
    await latencia();
    const [usuario, fallo] = requiereRol(request, 'CLIENTE');
    if (fallo) return fallo;
    const { idProducto, cantidad = 1 } = await request.json();
    if (!(Number.isInteger(cantidad) && cantidad > 0)) {
      return error(400, 'Datos inválidos', request, ['cantidad: debe ser un entero mayor que 0']);
    }
    if (!productoActivo(idProducto)) return error(404, `Producto ${idProducto} no encontrado`, request);

    const carrito = carritoDe(usuario.id);
    const linea = carrito.find((l) => l.idProducto === Number(idProducto));
    if (linea) linea.cantidad += cantidad;
    else carrito.push({ idProducto: Number(idProducto), cantidad });
    return HttpResponse.json(aCarritoResponse(usuario.id), { status: 201 });
  }),

  http.put(rutaParam(ENDPOINTS.carrito.item, 'idProducto'), async ({ request, params }) => {
    await latencia();
    const [usuario, fallo] = requiereRol(request, 'CLIENTE');
    if (fallo) return fallo;
    const { cantidad } = await request.json();
    if (!(Number.isInteger(cantidad) && cantidad > 0)) {
      return error(400, 'Datos inválidos', request, ['cantidad: debe ser un entero mayor que 0']);
    }
    const linea = carritoDe(usuario.id).find((l) => l.idProducto === Number(params.idProducto));
    if (!linea) return error(404, `El producto ${params.idProducto} no está en el carrito`, request);
    linea.cantidad = cantidad;
    return HttpResponse.json(aCarritoResponse(usuario.id));
  }),

  http.delete(rutaParam(ENDPOINTS.carrito.item, 'idProducto'), async ({ request, params }) => {
    await latencia();
    const [usuario, fallo] = requiereRol(request, 'CLIENTE');
    if (fallo) return fallo;
    carritos[usuario.id] = carritoDe(usuario.id).filter((l) => l.idProducto !== Number(params.idProducto));
    return HttpResponse.json(aCarritoResponse(usuario.id));
  }),

  // Checkout: PENDIENTE → reserva todo o nada → comprobante → CONFIRMADA y carrito vacío
  http.post(ruta(ENDPOINTS.pedidos.checkout), async ({ request }) => {
    await latencia();
    const [usuario, fallo] = requiereRol(request, 'CLIENTE');
    if (fallo) return fallo;
    const { tipoComprobante, docCliente, nombreRazonSocial } = await request.json();

    const detalles = [];
    if (!['BOLETA', 'FACTURA'].includes(tipoComprobante)) detalles.push('tipoComprobante: debe ser BOLETA o FACTURA');
    // En boleta el DNI es opcional (vista 4.7); si viene, debe tener 8 dígitos
    if (tipoComprobante === 'BOLETA' && docCliente && !esDni(docCliente)) detalles.push('docCliente: el DNI debe tener 8 dígitos');
    if (tipoComprobante === 'FACTURA' && !esRuc(docCliente)) detalles.push('docCliente: el RUC no es válido');
    if (!nombreRazonSocial?.trim()) detalles.push('nombreRazonSocial: es obligatorio');
    if (detalles.length) return error(400, 'Datos inválidos', request, detalles);

    const carrito = carritoDe(usuario.id);
    if (!carrito.length) return error(400, 'El carrito está vacío', request);

    const lineas = carrito.map(({ idProducto, cantidad }) => {
      const p = productos.find((x) => x.id === idProducto);
      return { idProducto, nombreProducto: p.nombre, precioUnitario: p.precio, cantidad, importe: redondear(p.precio * cantidad) };
    });
    const venta = {
      id: siguienteId(ventas),
      idUsuario: usuario.id,
      fechaVenta: ahoraIso(),
      estado: 'PENDIENTE',
      tipoComprobante,
      ...montos(lineas.reduce((s, l) => s + l.importe, 0)),
      detalles: lineas,
    };
    ventas.push(venta);

    // Reserva todo o nada. Como en ms-inventario, `disponible` ya descuenta lo reservado
    const sinStock = lineas.find((l) => {
      const fila = stock.find((s) => s.idProducto === l.idProducto);
      return !fila || fila.disponible < l.cantidad;
    });
    if (sinStock) {
      venta.estado = 'ANULADA';
      return error(409, `Stock insuficiente para ${sinStock.nombreProducto}`, request, [`idProducto: ${sinStock.idProducto}`]);
    }
    for (const l of lineas) {
      const fila = stock.find((s) => s.idProducto === l.idProducto);
      fila.disponible -= l.cantidad;
      fila.reservado += l.cantidad;
      registrarMovimiento({ idProducto: l.idProducto, tipo: 'RESERVA', cantidad: l.cantidad, idVenta: venta.id });
    }

    if (MOCK_FALLA_COMPROBANTE) {
      liberar(lineas, venta.id);
      venta.estado = 'ANULADA';
      return error(503, 'El servicio de comprobantes no está disponible. No se realizó ningún cobro', request);
    }

    emitirComprobante({ venta, tipo: tipoComprobante, docCliente: docCliente || null, nombreRazonSocial: nombreRazonSocial.trim() });

    // Confirmar la reserva: las unidades salen vendidas de `reservado` (el disponible ya bajó al reservar)
    for (const l of lineas) {
      const fila = stock.find((s) => s.idProducto === l.idProducto);
      fila.reservado -= l.cantidad;
      registrarMovimiento({ idProducto: l.idProducto, tipo: 'CONFIRMACION', cantidad: l.cantidad, idVenta: venta.id });
    }
    venta.estado = 'CONFIRMADA';
    carritos[usuario.id] = [];
    return HttpResponse.json(aVentaResponse(venta), { status: 201 });
  }),

  http.get(ruta(ENDPOINTS.pedidos.lista), async ({ request }) => {
    await latencia();
    const [usuario, fallo] = requiereSesion(request);
    if (fallo) return fallo;
    const lista = usuario.rol === 'ADMIN' ? ventas : ventas.filter((v) => v.idUsuario === usuario.id);
    return HttpResponse.json([...lista].sort((a, b) => b.id - a.id).map(aVentaResponse));
  }),

  http.get(rutaParam(ENDPOINTS.pedidos.detalle), async ({ request, params }) => {
    await latencia();
    const [usuario, fallo] = requiereSesion(request);
    if (fallo) return fallo;
    const venta = ventas.find((v) => v.id === Number(params.id));
    if (!venta) return error(404, `Pedido ${params.id} no encontrado`, request);
    if (usuario.rol !== 'ADMIN' && venta.idUsuario !== usuario.id) return error(403, 'No tiene permisos para este recurso', request);
    return HttpResponse.json(aVentaResponse(venta));
  }),
];
