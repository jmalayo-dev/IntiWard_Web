import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { categorias } from '../db/categorias';
import { marcas } from '../db/marcas';
import { aProductoResponse, productos } from '../db/productos';
import { stock } from '../db/stock';
import { error, latencia, pagina, ruta, rutaParam, siguienteId } from '../lib/respuestas';
import { requiereRol, usuarioDelToken } from '../lib/sesion';

const esAdmin = (request) => usuarioDelToken(request)?.rol === 'ADMIN';

/** El filtro acepta el id o el nombre exacto (la UI puede mandar cualquiera de los dos). */
const coincide = (id, lista, valor) => String(id) === valor || lista.find((x) => x.id === id)?.nombre === valor;

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

function validarProducto(datos) {
  const detalles = [];
  if (!datos.nombre?.trim()) detalles.push('nombre: es obligatorio');
  if (!(Number(datos.precio) > 0)) detalles.push('precio: debe ser mayor que 0');
  if (!marcas.some((m) => m.id === Number(datos.idMarca))) detalles.push('idMarca: no existe');
  if (!categorias.some((c) => c.id === Number(datos.idCategoria))) detalles.push('idCategoria: no existe');
  return detalles;
}

/** Orden: `sort=precio,asc` · `precio,desc` · `nombre,asc` (formato Spring Data). Sin sort: por id. */
function ordenar(lista, sort) {
  const [campo, sentido = 'asc'] = (sort ?? '').split(',');
  if (!['precio', 'nombre'].includes(campo)) return lista;
  const factor = sentido === 'desc' ? -1 : 1;
  return [...lista].sort((a, b) => (campo === 'precio' ? a.precio - b.precio : a.nombre.localeCompare(b.nombre, 'es')) * factor);
}

const disponibleDe = (idProducto) => {
  const fila = stock.find((s) => s.idProducto === idProducto);
  return fila ? fila.disponible - fila.reservado : 0;
};

/** Marca o categoría con la cantidad de productos activos (propuesta → César, para los filtros y la vista 5.4). */
const conConteo = (campo) => (x) => ({ ...x, productos: productos.filter((p) => p[campo] === x.id && p.activo).length });

function crudNombre(lista, endpoint, campoProducto, etiqueta) {
  const validar = (nombre, id, request) => {
    if (!nombre?.trim()) return error(400, 'Datos inválidos', request, ['nombre: es obligatorio']);
    if (lista.some((x) => x.id !== id && x.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      return error(409, `Ya existe ${etiqueta} con ese nombre`, request);
    }
    return null;
  };
  return [
    http.post(ruta(endpoint.lista), async ({ request }) => {
      await latencia();
      const [, fallo] = requiereRol(request, 'ADMIN');
      if (fallo) return fallo;
      const { nombre } = await request.json();
      const invalido = validar(nombre, null, request);
      if (invalido) return invalido;
      const nuevo = { id: siguienteId(lista), nombre: nombre.trim(), activo: true };
      lista.push(nuevo);
      return HttpResponse.json(conConteo(campoProducto)(nuevo), { status: 201 });
    }),
    http.put(rutaParam(endpoint.detalle), async ({ request, params }) => {
      await latencia();
      const [, fallo] = requiereRol(request, 'ADMIN');
      if (fallo) return fallo;
      const item = lista.find((x) => x.id === Number(params.id));
      if (!item) return error(404, `No existe ${etiqueta} ${params.id}`, request);
      const datos = await request.json();
      if (datos.nombre !== undefined) {
        const invalido = validar(datos.nombre, item.id, request);
        if (invalido) return invalido;
        item.nombre = datos.nombre.trim();
      }
      if (typeof datos.activo === 'boolean') item.activo = datos.activo;
      return HttpResponse.json(conConteo(campoProducto)(item));
    }),
  ];
}

export const catalogo = [
  http.get(ruta(ENDPOINTS.productos.lista), async ({ request }) => {
    await latencia();
    const params = new URL(request.url).searchParams;
    const page = Number(params.get('page') ?? 0);
    const size = Number(params.get('size') ?? 12);
    const categoria = params.get('categoria');
    // Propuesta → César: varias marcas separadas por coma, rango de precio y orden
    const marcasPedidas = params.get('marca')?.split(',').filter(Boolean) ?? [];
    const precioMin = params.get('precioMin');
    const precioMax = params.get('precioMax');
    const q = params.get('q');
    // Propuesta → César + Arévalo: "Solo con stock" necesita que catálogo consulte a inventario
    const soloConStock = params.get('conStock') === 'true';
    const verInactivos = params.get('inactivos') === 'true' && esAdmin(request);

    let lista = verInactivos ? productos : productos.filter((p) => p.activo);
    if (categoria) lista = lista.filter((p) => coincide(p.idCategoria, categorias, categoria));
    if (marcasPedidas.length) lista = lista.filter((p) => marcasPedidas.some((m) => coincide(p.idMarca, marcas, m)));
    if (precioMin) lista = lista.filter((p) => p.precio >= Number(precioMin));
    if (precioMax) lista = lista.filter((p) => p.precio <= Number(precioMax));
    if (q) lista = lista.filter((p) => normalizar(p.nombre).includes(normalizar(q)));
    if (soloConStock) lista = lista.filter((p) => disponibleDe(p.id) > 0);
    lista = ordenar(lista, params.get('sort'));

    return HttpResponse.json(pagina(lista.map(aProductoResponse), page, size));
  }),

  http.get(rutaParam(ENDPOINTS.productos.detalle), async ({ request, params }) => {
    await latencia();
    const producto = productos.find((p) => p.id === Number(params.id));
    if (!producto || (!producto.activo && !esAdmin(request))) return error(404, `Producto ${params.id} no encontrado`, request);
    return HttpResponse.json(aProductoResponse(producto));
  }),

  http.post(ruta(ENDPOINTS.productos.lista), async ({ request }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const datos = await request.json();
    const detalles = validarProducto(datos);
    if (detalles.length) return error(400, 'Datos inválidos', request, detalles);

    const nuevo = {
      id: siguienteId(productos),
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion ?? '',
      precio: Number(datos.precio),
      imagenUrl: datos.imagenUrl ?? null,
      idMarca: Number(datos.idMarca),
      idCategoria: Number(datos.idCategoria),
      activo: datos.activo ?? true,
      especificaciones: [],
    };
    productos.push(nuevo);
    // ms-inventario crea el stock en 0 para cada producto nuevo
    stock.push({ idProducto: nuevo.id, disponible: 0, reservado: 0 });
    return HttpResponse.json(aProductoResponse(nuevo), { status: 201 });
  }),

  http.put(rutaParam(ENDPOINTS.productos.detalle), async ({ request, params }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const producto = productos.find((p) => p.id === Number(params.id));
    if (!producto) return error(404, `Producto ${params.id} no encontrado`, request);
    const datos = { ...producto, ...(await request.json()) };
    const detalles = validarProducto(datos);
    if (detalles.length) return error(400, 'Datos inválidos', request, detalles);

    Object.assign(producto, {
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion ?? '',
      precio: Number(datos.precio),
      imagenUrl: datos.imagenUrl ?? null,
      idMarca: Number(datos.idMarca),
      idCategoria: Number(datos.idCategoria),
      activo: datos.activo ?? producto.activo,
    });
    return HttpResponse.json(aProductoResponse(producto));
  }),

  // DELETE pone activo: false (contrato C5)
  http.delete(rutaParam(ENDPOINTS.productos.detalle), async ({ request, params }) => {
    await latencia();
    const [, fallo] = requiereRol(request, 'ADMIN');
    if (fallo) return fallo;
    const producto = productos.find((p) => p.id === Number(params.id));
    if (!producto) return error(404, `Producto ${params.id} no encontrado`, request);
    producto.activo = false;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(ruta(ENDPOINTS.marcas.lista), async ({ request }) => {
    await latencia();
    const lista = esAdmin(request) ? marcas : marcas.filter((m) => m.activo);
    return HttpResponse.json(lista.map(conConteo('idMarca')));
  }),

  http.get(ruta(ENDPOINTS.categorias.lista), async ({ request }) => {
    await latencia();
    const lista = esAdmin(request) ? categorias : categorias.filter((c) => c.activo);
    return HttpResponse.json(lista.map(conConteo('idCategoria')));
  }),

  ...crudNombre(marcas, ENDPOINTS.marcas, 'idMarca', 'una marca'),
  ...crudNombre(categorias, ENDPOINTS.categorias, 'idCategoria', 'una categoría'),
];
