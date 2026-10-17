import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { esClaveValida, esCorreo } from '@/shared/lib/validadores';
import { aUsuarioResponse, usuarios } from '../db/usuarios';
import { ahoraIso, error, latencia, ruta, rutaParam, siguienteId } from '../lib/respuestas';
import { requiereRol, requiereSesion } from '../lib/sesion';
import { crearTokenFalso } from '../lib/token';

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;
// Textos exactos de CredencialesInvalidasException y CuentaBloqueadaException (ms-auth)
const MENSAJE_401 = 'Credenciales inválidas';
const MENSAJE_423 = 'Cuenta bloqueada temporalmente por intentos fallidos. Intente más tarde';

function validarDatosUsuario(datos, { exigirClave }) {
  const detalles = [];
  if (!datos.nombres?.trim()) detalles.push('nombres: es obligatorio');
  if (!datos.apellidos?.trim()) detalles.push('apellidos: es obligatorio');
  if (!esCorreo(datos.correo)) detalles.push('correo: no tiene formato de correo');
  if (exigirClave && !esClaveValida(datos.password)) detalles.push('password: debe tener al menos 8 caracteres');
  return detalles;
}

export const auth = [
  http.post(ruta(ENDPOINTS.auth.login), async ({ request }) => {
    await latencia();
    const { correo, password } = await request.json();
    const detalles = [];
    if (!esCorreo(correo)) detalles.push('correo: no tiene formato de correo');
    if (!esClaveValida(password)) detalles.push('password: debe tener al menos 8 caracteres');
    if (detalles.length) return error(400, 'Datos inválidos', request, detalles);

    const usuario = usuarios.find((u) => u.correo === correo);
    if (!usuario) return error(401, MENSAJE_401, request);

    if (usuario.bloqueadoHasta) {
      if (usuario.bloqueadoHasta > Date.now()) return error(423, MENSAJE_423, request);
      // El bloqueo ya venció: se empieza de cero
      usuario.bloqueadoHasta = null;
      usuario.intentosFallidos = 0;
    }

    if (!usuario.activo) return error(401, MENSAJE_401, request);

    if (usuario.clave !== password) {
      usuario.intentosFallidos += 1;
      if (usuario.intentosFallidos >= MAX_INTENTOS) {
        usuario.bloqueadoHasta = Date.now() + MINUTOS_BLOQUEO * 60_000;
        return error(423, MENSAJE_423, request);
      }
      return error(401, MENSAJE_401, request);
    }

    usuario.intentosFallidos = 0;
    usuario.ultimoAcceso = ahoraIso();
    return HttpResponse.json({ token: crearTokenFalso(usuario), tipo: 'Bearer', expiraEnMinutos: 60, rol: usuario.rol });
  }),

  http.post(ruta(ENDPOINTS.auth.registro), async ({ request }) => {
    await latencia();
    const datos = await request.json();
    const detalles = validarDatosUsuario(datos, { exigirClave: true });
    if (detalles.length) return error(400, 'Datos inválidos', request, detalles);
    if (usuarios.some((u) => u.correo === datos.correo)) return error(409, 'El correo ya está registrado', request);

    const nuevo = {
      id: siguienteId(usuarios),
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo,
      telefono: datos.telefono ?? '',
      direccion: datos.direccion ?? '',
      fotoUrl: null,
      rol: 'CLIENTE',
      activo: true,
      creadoEn: ahoraIso(),
      clave: datos.password,
      intentosFallidos: 0,
      bloqueadoHasta: null,
      ultimoAcceso: null,
    };
    usuarios.push(nuevo);
    return HttpResponse.json(aUsuarioResponse(nuevo), { status: 201 });
  }),

  // Perfil propio (propuesta → Galarza). Va antes de /usuarios/:id para que "me" no se tome como id
  http.get(ruta(ENDPOINTS.usuarios.yo), async ({ request }) => {
    await latencia();
    const [usuario, fallo] = requiereSesion(request);
    if (fallo) return fallo;
    return HttpResponse.json(aUsuarioResponse(usuario));
  }),

  // Solo cambia nombres, apellidos, teléfono, dirección, foto y contraseña; el correo y el rol no
  http.put(ruta(ENDPOINTS.usuarios.yo), async ({ request }) => {
    await latencia();
    const [usuario, fallo] = requiereSesion(request);
    if (fallo) return fallo;
    const datos = await request.json();
    const detalles = validarDatosUsuario({ ...usuario, ...datos, correo: usuario.correo }, { exigirClave: datos.password !== undefined });
    if (detalles.length) return error(400, 'Datos inválidos', request, detalles);
    for (const campo of ['nombres', 'apellidos', 'telefono', 'direccion', 'fotoUrl']) {
      if (datos[campo] !== undefined) usuario[campo] = typeof datos[campo] === 'string' ? datos[campo].trim() : datos[campo];
    }
    if (datos.password) usuario.clave = datos.password;
    return HttpResponse.json(aUsuarioResponse(usuario));
  }),

  http.get(ruta(ENDPOINTS.usuarios.lista), async ({ request }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    return HttpResponse.json(usuarios.map(aUsuarioResponse));
  }),

  http.get(rutaParam(ENDPOINTS.usuarios.detalle), async ({ request, params }) => {
    await latencia();
    const [actual, fallo] = requiereSesion(request);
    if (fallo) return fallo;
    const id = Number(params.id);
    if (actual.rol !== 'ADMIN' && actual.id !== id) return error(403, 'No tiene permisos para este recurso', request);
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return error(404, `Usuario ${id} no encontrado`, request);
    return HttpResponse.json(aUsuarioResponse(usuario));
  }),

  http.post(ruta(ENDPOINTS.usuarios.lista), async ({ request }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const datos = await request.json();
    const detalles = validarDatosUsuario(datos, { exigirClave: true });
    if (detalles.length) return error(400, 'Datos inválidos', request, detalles);
    if (usuarios.some((u) => u.correo === datos.correo)) return error(409, 'El correo ya está registrado', request);

    const nuevo = {
      id: siguienteId(usuarios),
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo,
      telefono: datos.telefono ?? '',
      direccion: datos.direccion ?? '',
      fotoUrl: null,
      rol: datos.rol === 'ADMIN' ? 'ADMIN' : 'CLIENTE',
      activo: true,
      creadoEn: ahoraIso(),
      clave: datos.password,
      intentosFallidos: 0,
      bloqueadoHasta: null,
      ultimoAcceso: null,
    };
    usuarios.push(nuevo);
    return HttpResponse.json(aUsuarioResponse(nuevo), { status: 201 });
  }),

  http.put(rutaParam(ENDPOINTS.usuarios.detalle), async ({ request, params }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const usuario = usuarios.find((u) => u.id === Number(params.id));
    if (!usuario) return error(404, `Usuario ${params.id} no encontrado`, request);
    const datos = await request.json();
    const detalles = validarDatosUsuario({ ...usuario, ...datos }, { exigirClave: Boolean(datos.password) });
    if (detalles.length) return error(400, 'Datos inválidos', request, detalles);
    if (datos.correo && usuarios.some((u) => u.correo === datos.correo && u.id !== usuario.id)) {
      return error(409, 'El correo ya está registrado', request);
    }
    for (const campo of ['nombres', 'apellidos', 'correo', 'telefono', 'direccion', 'fotoUrl', 'rol', 'activo']) {
      if (datos[campo] !== undefined) usuario[campo] = datos[campo];
    }
    if (datos.password) usuario.clave = datos.password;
    // Reactivar una cuenta también levanta el bloqueo por intentos
    if (datos.activo === true) {
      usuario.bloqueadoHasta = null;
      usuario.intentosFallidos = 0;
    }
    return HttpResponse.json(aUsuarioResponse(usuario));
  }),

  // Desactivar en vez de borrar
  http.delete(rutaParam(ENDPOINTS.usuarios.detalle), async ({ request, params }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const usuario = usuarios.find((u) => u.id === Number(params.id));
    if (!usuario) return error(404, `Usuario ${params.id} no encontrado`, request);
    usuario.activo = false;
    return new HttpResponse(null, { status: 204 });
  }),
];
