import { productos } from './productos';
import { usuarios } from './usuarios';

/*
 * VentaResponse + detalles (propuesta → Evelyn).
 * Los pedidos #00027, #00031, #00039 … #00043 son los de PROTOTIPO_WEB.md (Ana, Luis, Carla y la factura de
 * Seguridad Integral del Sur). El resto se genera con una semilla fija: siempre salen los mismos, con fechas
 * desde el 01/09/2026 hasta hoy, para que el resumen y los reportes tengan datos.
 */

// Generador pseudoaleatorio con semilla (mulberry32): mismos datos en cada recarga
let semilla = 20261015;
function azar() {
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = semilla;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const elegir = (lista) => lista[Math.floor(azar() * lista.length)];

const p2 = (n) => String(n).padStart(2, '0');
const aIso = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}:00`;
const redondear = (n) => Math.round(n * 100) / 100;

const RUC_SISUR = '20601234567';
const SISUR = 'Seguridad Integral del Sur S.A.C.';

function lineas(items) {
  return items.map(([idProducto, cantidad]) => {
    const p = productos.find((x) => x.id === idProducto);
    return { idProducto, nombreProducto: p.nombre, precioUnitario: p.precio, cantidad, importe: redondear(p.precio * cantidad) };
  });
}

function crearVenta({ id, idUsuario, fechaVenta, estado, tipoComprobante, items, docCliente = null, nombreRazonSocial }) {
  const detalles = lineas(items);
  const total = redondear(detalles.reduce((s, l) => s + l.importe, 0));
  const subtotal = redondear(total / 1.18);
  const usuario = usuarios.find((u) => u.id === idUsuario);
  return {
    id,
    idUsuario,
    fechaVenta,
    estado,
    tipoComprobante,
    subtotal,
    igv: redondear(total - subtotal),
    total,
    detalles,
    // Lo que pidió el cliente en el checkout; lo usa db/comprobantes.js al emitir
    docCliente,
    nombreRazonSocial: nombreRazonSocial ?? `${usuario.nombres} ${usuario.apellidos}`,
  };
}

const FIJAS = {
  27: { idUsuario: 2, estado: 'CONFIRMADA', tipoComprobante: 'BOLETA', items: [[1, 1]], docCliente: '45678912' },
  31: { idUsuario: 2, estado: 'ANULADA', tipoComprobante: 'BOLETA', items: [[4, 1]], docCliente: '45678912' },
  39: { idUsuario: 2, estado: 'CONFIRMADA', tipoComprobante: 'FACTURA', items: [[3, 1]], docCliente: RUC_SISUR, nombreRazonSocial: SISUR },
  40: { idUsuario: 3, estado: 'ANULADA', tipoComprobante: 'BOLETA', items: [[7, 1]], fechaVenta: '2026-10-14T16:20:00' },
  41: { idUsuario: 6, estado: 'CONFIRMADA', tipoComprobante: 'FACTURA', items: [[3, 2]], docCliente: RUC_SISUR, nombreRazonSocial: SISUR, fechaVenta: '2026-10-15T12:10:00' },
  42: { idUsuario: 2, estado: 'CONFIRMADA', tipoComprobante: 'BOLETA', items: [[2, 2]], docCliente: '45678912', fechaVenta: '2026-10-15T14:35:00' },
  43: { idUsuario: 5, estado: 'PENDIENTE', tipoComprobante: 'BOLETA', items: [[1, 1]], fechaVenta: '2026-10-15T15:02:00' },
};

// Productos que más se venden pesan más (ranking de la vista 5.9)
const PESOS = [1, 1, 1, 1, 1, 5, 5, 5, 5, 3, 3, 3, 6, 6, 4, 2, 2, 7, 8];
const CLIENTES = [3, 5, 6, 7, 8];

function ventaAlAzar(id, fechaVenta, clientes) {
  const idUsuario = elegir(clientes);
  const usuario = usuarios.find((u) => u.id === idUsuario);
  const primero = elegir(PESOS);
  const items = [[primero, primero === 3 || primero === 7 ? 1 : 1 + Math.floor(azar() * 2)]];
  if (azar() < 0.35) {
    const segundo = elegir(PESOS);
    if (segundo !== primero) items.push([segundo, 1]);
  }
  const esEmpresa = idUsuario === 6;
  const factura = esEmpresa || azar() < 0.15;
  const dni = String(40000000 + Math.floor(azar() * 9999999));
  return crearVenta({
    id,
    idUsuario,
    fechaVenta,
    estado: azar() < 0.1 ? 'ANULADA' : 'CONFIRMADA',
    tipoComprobante: factura ? 'FACTURA' : 'BOLETA',
    items,
    docCliente: esEmpresa ? RUC_SISUR : factura ? `10${dni}${Math.floor(azar() * 10)}` : azar() < 0.6 ? dni : null,
    nombreRazonSocial: esEmpresa ? SISUR : `${usuario.nombres} ${usuario.apellidos}`,
  });
}

function generar() {
  const lista = [];

  // #00001 … #00039: del 01/09 al 14/10, en orden de fecha
  const inicio = new Date(2026, 8, 1).getTime();
  const fin = new Date(2026, 9, 14).getTime();
  const fechas = Array.from({ length: 39 }, (_, i) => {
    const d = new Date(inicio + (i / 38) * (fin - inicio));
    d.setHours(9 + Math.floor(azar() * 12), Math.floor(azar() * 60));
    return d;
  }).sort((a, b) => a - b);

  for (let id = 1; id <= 43; id += 1) {
    const fija = FIJAS[id];
    const fechaVenta = fija?.fechaVenta ?? aIso(fechas[id - 1]);
    if (fija) lista.push(crearVenta({ id, fechaVenta, ...fija }));
    else lista.push(ventaAlAzar(id, fechaVenta, id < 20 ? [...CLIENTES, 4] : CLIENTES));
  }

  // #00044 en adelante: desde el 15/10 por la tarde hasta ahora
  const ahora = new Date();
  const dia = new Date(2026, 9, 15);
  let id = 44;
  while (dia <= ahora) {
    const cuantas = dia.getDate() === 15 && dia.getMonth() === 9 ? 1 : 2 + Math.floor(azar() * 3);
    const esHoy = dia.toDateString() === ahora.toDateString();
    // Hoy: entre 8 horas antes y ahora, para que el resumen "Hoy" siempre tenga ventas
    const desde = esHoy ? Math.max(0, ahora.getHours() - 8) : dia.getDate() === 15 && dia.getMonth() === 9 ? 16 : 9;
    const hasta = esHoy ? ahora.getHours() + 1 : 21;
    const horas = Array.from({ length: cuantas }, () => {
      const d = new Date(dia);
      d.setHours(desde + Math.floor(azar() * (hasta - desde)), Math.floor(azar() * 60));
      return d;
    })
      .filter((d) => d < ahora)
      .sort((a, b) => a - b);
    for (const d of horas) lista.push(ventaAlAzar(id++, aIso(d), CLIENTES));
    dia.setDate(dia.getDate() + 1);
  }
  return lista;
}

export const ventas = generar();

/** Lo que responde el backend: sin los datos del checkout (esos quedan en el comprobante). */
export const aVentaResponse = ({ docCliente: _doc, nombreRazonSocial: _nombre, ...venta }) => venta;
