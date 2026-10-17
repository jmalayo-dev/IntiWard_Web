import { stock } from './stock';
import { ventas } from './ventas';

/*
 * Movimiento (propuesta → Arévalo): { id, idProducto, tipo, cantidad, idVenta, motivo, creadoEn }.
 * Tipos: ENTRADA, RESERVA, CONFIRMACION, LIBERACION y AJUSTE (cantidad con signo).
 * Se arma desde las ventas para que cuadre con el stock actual: el stock inicial del 01/09 es lo que
 * hace falta para llegar a las cantidades de db/stock.js. Las unidades físicas son `disponible + reservado`
 * (ms-inventario descuenta lo reservado de `disponible`).
 */
const sueltos = [
  { idProducto: 5, tipo: 'ENTRADA', cantidad: 25, idVenta: null, motivo: 'Guía de remisión 001-4521', creadoEn: '2026-10-09T08:30:00' },
  { idProducto: 3, tipo: 'AJUSTE', cantidad: -1, idVenta: null, motivo: 'Rotura en almacén', creadoEn: '2026-10-12T09:00:00' },
];

function sumarUnMinuto(iso) {
  const [fecha, hora] = iso.split('T');
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + 1;
  return `${fecha}T${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`;
}

function generar() {
  const deVentas = ventas.flatMap((v) =>
    v.detalles.flatMap(({ idProducto, cantidad }) => {
      const reserva = { idProducto, tipo: 'RESERVA', cantidad, idVenta: v.id, motivo: null, creadoEn: v.fechaVenta };
      if (v.estado === 'CONFIRMADA') return [reserva, { ...reserva, tipo: 'CONFIRMACION' }];
      if (v.estado === 'ANULADA') return [reserva, { ...reserva, tipo: 'LIBERACION', creadoEn: sumarUnMinuto(v.fechaVenta) }];
      return [reserva];
    }),
  );

  const iniciales = stock
    .map(({ idProducto, disponible, reservado }) => {
      const vendidas = deVentas.filter((m) => m.idProducto === idProducto && m.tipo === 'CONFIRMACION').reduce((s, m) => s + m.cantidad, 0);
      const otros = sueltos.filter((m) => m.idProducto === idProducto).reduce((s, m) => s + m.cantidad, 0);
      return { idProducto, tipo: 'ENTRADA', cantidad: disponible + reservado + vendidas - otros, idVenta: null, motivo: 'Stock inicial', creadoEn: '2026-09-01T08:30:00' };
    })
    .filter((m) => m.cantidad > 0);

  return [...iniciales, ...sueltos, ...deVentas]
    .sort((a, b) => a.creadoEn.localeCompare(b.creadoEn))
    .map((m, i) => ({ id: i + 1, ...m }));
}

export const movimientos = generar();
