import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { movimientos } from '../db/movimientos';
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

export const inventario = [
  // Propuesta → Arévalo: GET /stock?ids=1,2,3 devuelve varios de una vez; sin ids, todos (vista 5.5)
  http.get(ruta(ENDPOINTS.stock.lista), async ({ request }) => {
    await latencia();
    const ids = new URL(request.url).searchParams.get('ids')?.split(',').filter(Boolean).map(Number);
    const lista = ids?.length ? stock.filter((s) => ids.includes(s.idProducto)) : stock;
    return HttpResponse.json(lista.map(aStockResponse));
  }),

  http.get(rutaParam(ENDPOINTS.stock.detalle, 'idProducto'), async ({ request, params }) => {
    await latencia();
    const fila = stock.find((s) => s.idProducto === Number(params.idProducto));
    if (!fila) return error(404, `No hay stock registrado para el producto ${params.idProducto}`, request);
    return HttpResponse.json(aStockResponse(fila));
  }),

  http.post(ruta(ENDPOINTS.stock.entrada), async ({ request }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const { idProducto, cantidad, motivo } = await request.json();
    if (!(Number.isInteger(cantidad) && cantidad > 0)) {
      return error(400, 'Datos inválidos', request, ['cantidad: debe ser un entero mayor que 0']);
    }
    const fila = stock.find((s) => s.idProducto === Number(idProducto));
    if (!fila) return error(404, `No hay stock registrado para el producto ${idProducto}`, request);
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

    const fila = stock.find((s) => s.idProducto === Number(params.idProducto));
    if (!fila) return error(404, `No hay stock registrado para el producto ${params.idProducto}`, request);
    const diferencia = disponible - fila.disponible;
    fila.disponible = disponible;
    registrarMovimiento({ idProducto: fila.idProducto, tipo: 'AJUSTE', cantidad: diferencia, motivo: motivo.trim() });
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
