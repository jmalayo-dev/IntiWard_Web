const ahora = Date.now();

/** "2026-10-15T14:35:00" de hace `minutos` (para que "Último acceso" se vea reciente). */
function haceMinutos(minutos) {
  const d = new Date(ahora - minutos * 60_000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

const base = { telefono: '', direccion: '', fotoUrl: null, activo: true, intentosFallidos: 0, bloqueadoHasta: null, clave: 'cliente123' };

/** Usuarios de los mocks: solo existen en el navegador. `clave` e intentos no salen nunca en una respuesta. */
export const usuarios = [
  {
    ...base,
    id: 1,
    nombres: 'Mathias',
    apellidos: 'Alayo',
    correo: 'admin@intiguard.pe',
    rol: 'ADMIN',
    creadoEn: '2026-09-01T09:00:00',
    ultimoAcceso: haceMinutos(20),
    clave: 'admin1234',
  },
  {
    ...base,
    id: 2,
    nombres: 'Ana',
    apellidos: 'Torres',
    correo: 'ana.torres@gmail.com',
    telefono: '987 654 321',
    direccion: 'Av. Arequipa 1234, Miraflores, Lima',
    rol: 'CLIENTE',
    creadoEn: '2026-10-01T18:12:00',
    ultimoAcceso: haceMinutos(90),
  },
  {
    ...base,
    id: 3,
    nombres: 'Luis',
    apellidos: 'Ramos',
    correo: 'luis.ramos@hotmail.com',
    telefono: '944 120 553',
    rol: 'CLIENTE',
    creadoEn: '2026-09-11T10:40:00',
    ultimoAcceso: haceMinutos(5),
    // Bloqueado por 5 intentos fallidos (insignia "Bloqueado hasta" de la vista 5.10)
    intentosFallidos: 5,
    bloqueadoHasta: ahora + 10 * 60_000,
  },
  {
    ...base,
    id: 4,
    nombres: 'Pedro',
    apellidos: 'Quispe',
    correo: 'pedro.quispe@gmail.com',
    rol: 'CLIENTE',
    activo: false,
    creadoEn: '2026-09-12T16:05:00',
    ultimoAcceso: '2026-10-13T11:20:00',
  },
  {
    ...base,
    id: 5,
    nombres: 'Carla',
    apellidos: 'Díaz',
    correo: 'carla.diaz@gmail.com',
    telefono: '965 330 118',
    direccion: 'Jr. Junín 455, Cercado de Lima',
    rol: 'CLIENTE',
    creadoEn: '2026-09-03T12:00:00',
    ultimoAcceso: haceMinutos(60 * 26),
  },
  {
    ...base,
    id: 6,
    nombres: 'Jorge',
    apellidos: 'Salas',
    correo: 'compras@sisur.pe',
    telefono: '054 281 900',
    direccion: 'Av. Ejército 710, Yanahuara, Arequipa',
    rol: 'CLIENTE',
    creadoEn: '2026-09-02T09:30:00',
    ultimoAcceso: haceMinutos(60 * 30),
  },
  {
    ...base,
    id: 7,
    nombres: 'María',
    apellidos: 'Fernández',
    correo: 'maria.fernandez@outlook.com',
    rol: 'CLIENTE',
    creadoEn: '2026-09-04T20:15:00',
    ultimoAcceso: haceMinutos(60 * 50),
  },
  {
    ...base,
    id: 8,
    nombres: 'Diego',
    apellidos: 'Huamán',
    correo: 'diego.huaman@gmail.com',
    telefono: '912 004 781',
    rol: 'CLIENTE',
    creadoEn: '2026-09-06T08:50:00',
    ultimoAcceso: haceMinutos(60 * 8),
  },
];

const aIso = (ms) => {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
};

/**
 * UsuarioResponse (real) + `bloqueadoHasta` y `ultimoAcceso` (propuesta → Galarza, para la vista 5.10).
 * Nunca incluye la clave ni el contador de intentos.
 */
export const aUsuarioResponse = ({ id, nombres, apellidos, correo, telefono, direccion, fotoUrl, rol, activo, creadoEn, bloqueadoHasta, ultimoAcceso }) => ({
  id,
  nombres,
  apellidos,
  correo,
  telefono,
  direccion,
  fotoUrl,
  rol,
  activo,
  creadoEn,
  bloqueadoHasta: bloqueadoHasta && bloqueadoHasta > Date.now() ? aIso(bloqueadoHasta) : null,
  ultimoAcceso: ultimoAcceso ?? null,
});
