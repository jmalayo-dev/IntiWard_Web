import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { movimientos } from '../db/movimientos';
import { productos } from '../db/productos';
import { stock } from '../db/stock';
import { ahoraIso, error, latencia, ruta, rutaParam, siguienteId } from '../lib/respuestas';
import { requiereRol } from '../lib/sesion';

/** Registra un movimiento; lo usa también el checkout de pedidos. */
export function registrarMovimiento({ idProducto, tipo, cantidad, idVenta = null, motivo = null }) {
  movimientos.push({ id: siguienteId(movimientos), idProducto, tipo, cantidad, idVenta, motivo, creadoEn: ahoraIso() });
}

/** StockResponse (real) + `actualizadoEn`: fecha del último movimiento (propuesta → Arévalo, vista 5.5). */
function aStockResponse(fila) {
  const ultimo = movimientos.filter((m) => m.idProducto === fila.idProducto).reduce((max, m) => (m.creadoEn > max ? m.creadoEn : max), '');
  return { ...fila, actualizadoEn: ultimo || null };
}

/** Un producto sin entradas no tiene fila: su stock es 0 (no hay llamada de catálogo a inventario al crearlo). */
const sinFila = (idProducto) => ({ idProducto, disponible: 0, reservado: 0, actualizadoEn: null });

/** Fila del producto; la crea en 0 si el producto existe en catálogo y aún no tenía (primera entrada o ajuste). */
function filaParaMover(idProducto) {
  let fila = stock.find((s) => s.idProducto === idProducto);
  if (!fila && productos.some((p) => p.id === idProducto)) {
    fila = { idProducto, disponible: 0, reservado: 0 };
    stock.push(fila);
  }
  return fila;
}

export const inventario = [
  // Propuesta → Arévalo: GET /stock?ids=1,2,3 devuelve varios de una vez; sin ids, todos (vista 5.5)
  http.get(ruta(ENDPOINTS.stock.lista), async ({ request }) => {
    await latencia();
    const ids = new URL(request.url).searchParams.get('ids')?.split(',').filter(Boolean).map(Number);
    if (!ids?.length) return HttpResponse.json(stock.map(aStockResponse));
    // Cada id pedido tiene respuesta: los que no tienen fila salen en 0
    return HttpResponse.json(ids.map((id) => {
      const fila = stock.find((s) => s.idProducto === id);
      return fila ? aStockResponse(fila) : sinFila(id);
    }));
  }),

  http.get(rutaParam(ENDPOINTS.stock.detalle, 'idProducto'), async ({ params }) => {
    await latencia();
    const fila = stock.find((s) => s.idProducto === Number(params.idProducto));
    return HttpResponse.json(fila ? aStockResponse(fila) : sinFila(Number(params.idProducto)));
  }),

  http.post(ruta(ENDPOINTS.stock.entrada), async ({ request }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const { idProducto, cantidad, motivo } = await request.json();
    if (!(Number.isInteger(cantidad) && cantidad > 0)) {
      return error(400, 'Datos inválidos', request, ['cantidad: debe ser un entero mayor que 0']);
    }
    const fila = filaParaMover(Number(idProducto));
    if (!fila) return error(404, `Producto ${idProducto} no encontrado`, request);
    fila.disponible += cantidad;
    registrarMovimiento({ idProducto: fila.idProducto, tipo: 'ENTRADA', cantidad, motivo: motivo?.trim() || null });
    return HttpResponse.json(aStockResponse(fila));
  }),

  // Ajuste: fija el disponible; exige motivo y no deja negativo
  http.put(rutaParam(ENDPOINTS.stock.detalle, 'idProducto'), async ({ request, params }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const { disponible, motivo } = await request.json();
    const detalles = [];
    if (!motivo?.trim()) detalles.push('motivo: es obligatorio');
    if (!Number.isInteger(disponible) || disponible < 0) detalles.push('disponible: no puede ser negativo');
    if (detalles.length) return error(400, 'Datos inválidos', request, detalles);

    const fila = filaParaMover(Number(params.idProducto));
    if (!fila) return error(404, `Producto ${params.idProducto} no encontrado`, request);
    const diferencia = disponible - fila.disponible;
    fila.disponible = disponible;
    // La base rechaza un movimiento con cantidad 0 (ck_movimiento_cantidad): si no cambia, no se registra
    if (diferencia !== 0) registrarMovimiento({ idProducto: fila.idProducto, tipo: 'AJUSTE', cantidad: diferencia, motivo: motivo.trim() });
    return HttpResponse.json(aStockResponse(fila));
  }),

  http.get(ruta(ENDPOINTS.movimientos.lista), async ({ request }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const idProducto = new URL(request.url).searchParams.get('idProducto');
    const lista = idProducto ? movimientos.filter((m) => m.idProducto === Number(idProducto)) : movimientos;
    return HttpResponse.json([...lista].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn) || b.id - a.id));
  }),
];
