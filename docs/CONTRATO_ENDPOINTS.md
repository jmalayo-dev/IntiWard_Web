# Contrato de endpoints · IntiGuard Web

Todo lo que el cliente web necesita del backend: ruta, quién la puede llamar, qué envía el front, qué debe responder el backend y qué vistas la usan. Cada atributo trae una línea con **para qué lo usa el front**.

- Fuente: los handlers de `src/shared/mocks/handlers/` (responden exactamente esto) y `src/shared/api/endpoints.js` (las rutas).
- Detalle de arquitectura y responsables de cada propuesta: [ARQUITECTURA_WEB.md](ARQUITECTURA_WEB.md) §6.
- Diseño de cada vista (los números 4.x y 5.x): [PROTOTIPO_WEB.md](PROTOTIPO_WEB.md).

**Estado** de cada endpoint: ✅ ya existe en el backend · 🟡 existe pero le falta algo · ⬜ falta (hoy solo lo responde el mock).

---

## 1. Convenciones

| Tema | Regla |
|---|---|
| Rutas | Relativas al gateway (`http://localhost:8080`). El front llama a `/api/...` y el proxy, o el rewrite en la nube, quita `/api` |
| Autenticación | Header `Authorization: Bearer <token>` en toda ruta que no sea pública |
| Formato | JSON en el cuerpo y en la respuesta, salvo el PDF |
| IDs | Números enteros (`Long`) |
| Montos | Número JSON con 2 decimales (`BigDecimal`): `199.9`. El front pone el `S/` |
| Precios | **Incluyen IGV**. `subtotal = total / 1.18`, `igv = total - subtotal`, redondeo HALF_UP a 2 decimales |
| Fechas | Texto ISO **sin zona** (`LocalDateTime`): `"2026-10-15T14:35:00"`. Filtros de fecha: `"2026-10-15"` (`LocalDate`) |
| Enums | En mayúsculas, como texto: `ADMIN`, `BOLETA`, `CONFIRMADA`… |
| Borrado | Nunca físico. `DELETE` pone `activo: false` |
| Validación | Un error por campo en `detalles`, con el formato `"campo: mensaje"`. El front lo parte por `:` para marcar el campo |

### Claims del JWT

El front lee el token sin validar la firma, para saber quién está conectado y a dónde llevarlo.

| Claim | Tipo | Para qué lo usa el front |
|---|---|---|
| `sub` | texto | Correo del usuario de la sesión |
| `rol` | `ADMIN` · `CLIENTE` | Decide qué rutas puede abrir (tienda o panel) y a dónde va tras el login |
| `idUsuario` | número | Id del usuario de la sesión, sin tener que pedir su perfil |
| `iat` | número (segundos) | Fecha de emisión; el front no la usa |
| `exp` | número (segundos) | Si ya pasó, el front cierra la sesión y lleva a "Sesión expirada" |

---

## 2. Error (todas las rutas)

```json
{
  "fecha": "2026-10-15T14:35:00",
  "status": 400,
  "error": "Bad Request",
  "mensaje": "Datos inválidos",
  "ruta": "/productos",
  "detalles": ["nombre: es obligatorio", "precio: debe ser mayor que 0"]
}
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `fecha` | fecha | Solo para depurar; no se muestra |
| `status` | número | Decide la reacción (tabla de abajo) |
| `error` | texto | Frase HTTP; respaldo si falta `mensaje` |
| `mensaje` | texto | Texto que se muestra al usuario en avisos y toasts. **Siempre debe venir**: sin él, el front lo trata como una falla del gateway |
| `ruta` | texto | Solo para depurar |
| `detalles` | texto[] | Errores por campo `"campo: mensaje"`; se pintan bajo cada input. En el 409 del checkout trae `"idProducto: N"` |

| Status | Qué hace el front |
|---|---|
| 400 | Marca los campos de `detalles` o muestra `mensaje` |
| 401 | Fuera del login: cierra la sesión y lleva a `/sesion-expirada`. En el login: "credenciales inválidas" |
| 403 | Lleva a `/403` o muestra "no tienes permiso" |
| 404 | Muestra el estado "no encontrado" de la vista |
| 409 | Conflicto: correo repetido, nombre repetido o stock insuficiente en el checkout |
| 423 | Login: cuenta bloqueada por intentos |
| 503 | Checkout: el comprobante no se pudo emitir y la compra no se completó |
| Sin respuesta | Lleva a `/sin-conexion` |

---

## 3. Objetos que se repiten

Se definen una vez aquí y los endpoints los referencian por nombre.

### Usuario

```json
{ "id": 1, "nombres": "Ana", "apellidos": "Torres", "correo": "ana.torres@gmail.com", "telefono": "987654321",
  "direccion": "Av. Arequipa 123, Lima", "fotoUrl": null, "rol": "CLIENTE", "activo": true,
  "creadoEn": "2026-09-01T10:00:00", "bloqueadoHasta": null, "ultimoAcceso": "2026-10-15T09:12:00" }
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `id` | número | Editar, desactivar o abrir al usuario; enlazar una venta con su cliente |
| `nombres` | texto | Saludo del encabezado, avatar con iniciales, tablas |
| `apellidos` | texto | Nombre completo en tablas, ventas y checkout |
| `correo` | texto | Identificador visible; se muestra en el perfil y en las tablas |
| `telefono` | texto | Formulario de perfil y de usuario |
| `direccion` | texto | Perfil, y dato del cliente en la vista de venta |
| `fotoUrl` | texto \| null | Foto del avatar; con `null` se muestran las iniciales |
| `rol` | `ADMIN` · `CLIENTE` | Insignia de rol en la tabla de usuarios y filtro por rol |
| `activo` | booleano | Interruptor activo/inactivo; un inactivo no puede iniciar sesión |
| `creadoEn` | fecha | Columna "Registrado" y cálculo de clientes nuevos en el resumen |
| `bloqueadoHasta` | fecha \| null · **propuesta** | Insignia "Bloqueado hasta HH:mm" (5.10); `null` si no está bloqueado o el bloqueo ya venció |
| `ultimoAcceso` | fecha \| null · **propuesta** | Columna "Último acceso" (5.10). Se actualiza en cada login correcto (columna nueva `usuario.ultimo_acceso`) |

### Producto

```json
{ "id": 1, "nombre": "Cámara IP Wi-Fi 1080p", "descripcion": "Cámara interior Full HD…", "precio": 159.9,
  "imagenUrl": "/productos/camara-ip.svg", "marca": "Hikvision", "categoria": "Cámaras",
  "activo": true, "idMarca": 1, "idCategoria": 1,
  "especificaciones": [{ "nombre": "Resolución", "valor": "1080p" }] }
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `id` | número | Enlace al detalle, carrito, stock y edición |
| `nombre` | texto | Título de la tarjeta, del detalle y de las tablas; base del buscador |
| `descripcion` | texto | Pestaña "Descripción" del detalle (4.3) |
| `precio` | número | Precio con IGV en tarjetas, detalle y carrito |
| `imagenUrl` | texto \| null | Foto del producto; con `null` se muestra un icono |
| `marca` | texto | Nombre de la marca en la tarjeta y en la tabla de productos |
| `categoria` | texto | Etiqueta, miga de pan y "productos relacionados" del detalle |
| `activo` | booleano · **propuesta** | Interruptor en 5.2. La tienda nunca recibe inactivos |
| `idMarca` | número · **propuesta** | Preselecciona la marca al editar (5.3) |
| `idCategoria` | número · **propuesta** | Preselecciona la categoría al editar (5.3) |
| `especificaciones` | `[{ nombre, valor }]` · **propuesta** | Pestaña "Especificaciones" del detalle (4.3); puede venir vacía. Se guardan en la tabla nueva `producto_especificacion` y se envían en `POST` / `PUT /productos` |

### Página (lista paginada) · propuesta

Formato `VIA_DTO` de Spring Data. El front también acepta el `PageImpl` clásico, con los mismos campos en la raíz.

```json
{ "content": [ /* Producto */ ], "page": { "size": 12, "number": 0, "totalElements": 31, "totalPages": 3 } }
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `content` | lista | Los elementos de la página actual |
| `page.size` | número | Tamaño pedido |
| `page.number` | número | Página actual (desde 0) para el paginador |
| `page.totalElements` | número | Texto "31 productos" y contadores del panel |
| `page.totalPages` | número | Cuántos botones tiene el paginador |

### Marca / Categoría · propuesta

```json
{ "id": 1, "nombre": "Hikvision", "activo": true, "productos": 3 }
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `id` | número | Editar y filtrar |
| `nombre` | texto | Texto del filtro, del buscador y de la tabla de 5.4 |
| `activo` | booleano | Interruptor de 5.4; la tienda solo recibe las activas |
| `productos` | número | Cantidad de productos **activos**: contador al lado de cada filtro y columna en 5.4 |

### Stock

```json
{ "idProducto": 1, "disponible": 12, "reservado": 2, "actualizadoEn": "2026-10-15T14:35:00" }
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `idProducto` | número | Une el stock con su producto |
| `disponible` | número | Unidades que se pueden comprar ya. **Lo reservado ya está descontado**: al reservar baja `disponible` y sube `reservado` |
| `reservado` | número | Unidades apartadas por checkouts en curso; columna en 5.5 |
| `actualizadoEn` | fecha \| null · **propuesta** | Fecha del último movimiento; columna "Actualizado" en 5.5 |

El front marca "Agotado" con 0 disponibles y "Pocas unidades" con 5 o menos, deshabilita "Agregar al carrito" y avisa en el carrito si la cantidad supera lo disponible.

**Un producto sin entradas no tiene fila de stock: su stock es 0.** Catálogo no llama a inventario al crear un producto; la fila se crea con la primera entrada o ajuste.

### Movimiento · propuesta

```json
{ "id": 10, "idProducto": 1, "tipo": "RESERVA", "cantidad": 2, "idVenta": 43, "motivo": null, "creadoEn": "2026-10-15T14:35:00" }
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `id` | número | Clave de la fila |
| `idProducto` | número | Nombre del producto y filtro por producto |
| `tipo` | `ENTRADA` · `RESERVA` · `CONFIRMACION` · `LIBERACION` · `AJUSTE` | Insignia de color y filtro por tipo |
| `cantidad` | número | Unidades. En `AJUSTE` lleva signo (`-3` resta); en los demás, siempre positiva |
| `idVenta` | número \| null | Enlace a la venta en reservas, confirmaciones y liberaciones |
| `motivo` | texto \| null | Razón escrita por el admin en entradas y ajustes |
| `creadoEn` | fecha | Columna de fecha y orden |

### Carrito · propuesta

```json
{ "items": [{ "idProducto": 1, "nombre": "Cámara IP Wi-Fi 1080p", "marca": "Hikvision", "precio": 159.9,
              "imagenUrl": "/productos/camara-ip.svg", "cantidad": 2, "importe": 319.8 }],
  "total": 319.8 }
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `items` | lista | Una línea por producto (sin duplicados) |
| `items[].idProducto` | número | Cambiar cantidad, quitar y consultar su stock |
| `items[].nombre` | texto | Nombre en la línea |
| `items[].marca` | texto | Subtítulo de la línea |
| `items[].precio` | número | Precio unitario |
| `items[].imagenUrl` | texto \| null | Miniatura |
| `items[].cantidad` | número | Selector de cantidad y número en el icono del carrito |
| `items[].importe` | número | `precio × cantidad` de la línea |
| `total` | número | Total con IGV. El front deriva subtotal e IGV para el resumen |

### Venta (pedido)

```json
{ "id": 43, "idUsuario": 1, "fechaVenta": "2026-10-15T14:35:00", "estado": "CONFIRMADA", "tipoComprobante": "BOLETA",
  "subtotal": 271.02, "igv": 48.78, "total": 319.8,
  "detalles": [{ "idProducto": 1, "nombreProducto": "Cámara IP Wi-Fi 1080p", "precioUnitario": 159.9, "cantidad": 2, "importe": 319.8 }] }
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `id` | número | Número de pedido (`#00043`) y enlace al detalle |
| `idUsuario` | número | Nombre del cliente en el panel (cruzado con `/usuarios`) |
| `fechaVenta` | fecha | Columna de fecha, filtros y gráficos por día |
| `estado` | `PENDIENTE` · `CONFIRMADA` · `ANULADA` | Insignia de estado; los reportes y el resumen solo cuentan confirmadas |
| `tipoComprobante` | `BOLETA` · `FACTURA` | Insignia y filtro por tipo |
| `subtotal` | número | Resumen de montos sin IGV |
| `igv` | número | IGV 18 % |
| `total` | número | Total cobrado; base de ventas, ticket promedio y gráficos |
| `detalles` | lista · **propuesta** | Productos del pedido. Debe venir **también en `GET /pedidos`** |
| `detalles[].idProducto` | número | Miniatura e enlace al producto |
| `detalles[].nombreProducto` | texto | Nombre guardado al momento de la venta (aunque luego cambie) |
| `detalles[].precioUnitario` | número | Precio pagado por unidad |
| `detalles[].cantidad` | número | Unidades; se suman para "productos más vendidos" |
| `detalles[].importe` | número | Subtotal de la línea |

`docCliente` y `nombreRazonSocial` **no** van en la venta: viven en el comprobante.

### Comprobante

```json
{ "id": 40, "idVenta": 43, "tipo": "BOLETA", "numero": "B001-00000040", "docCliente": "45678912",
  "nombreRazonSocial": "Ana Torres", "subtotal": 271.02, "igv": 48.78, "total": 319.8,
  "pdfUrl": "/comprobantes/40/pdf", "emitidoEn": "2026-10-15T14:35:02" }
```

| Atributo | Tipo | Para qué lo usa el front |
|---|---|---|
| `id` | número | Abrir la vista imprimible y descargar el PDF |
| `idVenta` | número | Une el comprobante con su pedido |
| `tipo` | `BOLETA` · `FACTURA` | Título del documento y filtro |
| `numero` | texto | Serie y correlativo (`B001-` / `F001-` + 8 dígitos); se muestra y da nombre al PDF |
| `docCliente` | texto \| null | DNI (8) o RUC (11). En boleta puede ser `null` |
| `nombreRazonSocial` | texto | Nombre del cliente o razón social impresa |
| `subtotal` | número | Montos del documento |
| `igv` | número | Montos del documento |
| `total` | número | Montos del documento y suma de reportes |
| `pdfUrl` | texto | Ruta del PDF; el front descarga con `GET /comprobantes/{id}/pdf` |
| `emitidoEn` | fecha | Fecha de emisión; filtro del reporte por rango |

ms-comprobantes guarda además el `idUsuario` de la venta (columna `comprobante.id_usuario`, lo manda ms-pedidos al emitir) para saber de quién es cada comprobante sin consultar a ms-pedidos. **No sale en la respuesta.**

---

## 4. Endpoints

### 4.1 ms-auth

#### `POST /auth/login` · Público · ✅

Envía:

| Campo | Para qué |
|---|---|
| `correo` | Usuario que inicia sesión |
| `password` | Clave (mínimo 8 caracteres) |

Responde **200**:

```json
{ "token": "eyJ…", "tipo": "Bearer", "expiraEnMinutos": 60, "rol": "CLIENTE" }
```

| Atributo | Para qué lo usa el front |
|---|---|
| `token` | Se guarda y va en cada petición como `Authorization` |
| `tipo` | Prefijo del header (`Bearer`) |
| `expiraEnMinutos` | Informativo; la expiración real se lee de `exp` |
| `rol` | Redirige: `ADMIN` → `/admin`, `CLIENTE` → la página de origen o el inicio |

Errores:
- **400**: formato inválido.
- **401** `"Credenciales inválidas"`: correo inexistente, clave errónea o cuenta inactiva. Mismo mensaje en los tres casos, para no revelar qué correos existen.
- **423**: al 5.º intento fallido; la cuenta queda bloqueada 15 minutos. Un login correcto reinicia el contador.

**Vistas:** 4.4 Iniciar sesión.

#### `POST /auth/registro` · Público · ⬜

Envía:

| Campo | Para qué |
|---|---|
| `nombres` · `apellidos` | Obligatorios |
| `correo` | Obligatorio, único |
| `telefono` · `direccion` | Opcionales |
| `password` | Mínimo 8 caracteres |

Responde **201**: el **Usuario**, siempre con rol `CLIENTE`.

Errores:
- **400**: con `detalles` por campo.
- **409** `"El correo ya está registrado"`.

**Vistas:** 4.5 Crear cuenta.

#### `GET /usuarios/me` · Con sesión · ⬜ propuesta

Responde **200**: el **Usuario** del token. **401** sin token.

**Vistas:**
- 4.7 Checkout: prellena el nombre.
- 4.8 Compra confirmada.
- 4.13 Mi perfil.
- Encabezado de la tienda: avatar y nombre en todas las páginas de la tienda con sesión.
- Barra lateral del panel: tarjeta de la cuenta en todas las páginas `/admin`.

#### `PUT /usuarios/me` · Con sesión · ⬜ propuesta

Envía solo los campos que cambian:

| Campo | Para qué |
|---|---|
| `nombres` · `apellidos` · `telefono` · `direccion` | Datos personales |
| `fotoUrl` | Nueva foto (URL) o `null` para quitarla |
| `password` | Nueva clave; si viene, se valida con mínimo 8 caracteres |

`correo` y `rol` **no** se pueden cambiar por aquí; se ignoran.

Responde **200**: el **Usuario** actualizado. **400** con `detalles`.

**Vistas:** 4.13 Mi perfil (datos, foto y contraseña).

#### `GET /usuarios` · ADMIN · ✅

Responde **200**: **Usuario[]** con todos, incluidos los inactivos. **403** si no es admin.

**Vistas:**
- 5.1 Resumen: clientes nuevos.
- 5.7 Ventas: nombre del cliente.
- 5.10 Usuarios.

#### `GET /usuarios/{id}` · ADMIN o el mismo usuario · ✅

Responde **200**: **Usuario**. **403** si es otro usuario y no es admin. **404**.

**Vistas:** detalle de venta del panel (datos del cliente).

#### `POST /usuarios` · ADMIN · ⬜

Envía: lo mismo que el registro, más `rol` (`ADMIN` o `CLIENTE`; cualquier otro valor se toma como `CLIENTE`).

Responde **201**: **Usuario**. **400**. **409** si el correo ya existe.

**Vistas:** 5.10 Usuarios (modal "Nuevo usuario").

#### `PUT /usuarios/{id}` · ADMIN · ⬜

Envía cualquiera de estos campos: `nombres`, `apellidos`, `correo`, `telefono`, `direccion`, `fotoUrl`, `rol`, `activo`, `password` (opcional).

- **`{ "activo": true }` reactiva la cuenta y también levanta el bloqueo por intentos.**

Responde **200**: **Usuario**. **400**. **404**. **409** si el correo ya existe.

**Vistas:** 5.10 Usuarios (editar y reactivar).

#### `DELETE /usuarios/{id}` · ADMIN · ⬜

Pone `activo: false`. Responde **204** sin cuerpo. **404**.

**Vistas:** 5.10 Usuarios (desactivar).

---

### 4.2 ms-catalogo

#### `GET /productos` · Público · 🟡 falta paginación y filtros

| Parámetro | Para qué |
|---|---|
| `page` | Página, desde 0 (por defecto 0) |
| `size` | Tamaño de página (por defecto 12). El front pide hasta **100** para tablas y gráficos del panel |
| `categoria` | Filtro por **nombre o id** de categoría |
| `marca` | Una o varias marcas separadas por coma (nombre o id) · **propuesta** |
| `q` | Texto contenido en el nombre, sin distinguir mayúsculas ni tildes |
| `precioMin` · `precioMax` | Rango de precio · **propuesta** |
| `conStock` | `true`: solo productos con `disponible` > 0; catálogo consulta a inventario · **propuesta** |
| `sort` | `precio,asc` · `precio,desc` · `nombre,asc` (formato Spring). Sin `sort`: por id · **propuesta** |
| `inactivos` | `true` y ADMIN: incluye los inactivos. Sin admin se ignora · **propuesta** |

Los filtros se combinan entre sí (Y).

Responde **200**: **Página** de **Producto**.

**Vistas:**
- 4.1 Inicio (`size=24`).
- 4.2 Catálogo (todos los filtros, `size=9`).
- 4.3 Detalle (relacionados `categoria&size=5`, y `size=12`).
- Buscador del encabezado: sugerencias `q&size=5`.
- 5.1 Resumen.
- 5.2 Productos (filtros, `inactivos`, y `size=1` solo para leer `totalElements`).
- 5.5 Stock.
- 5.6 Movimientos.
- 5.9 Reportes.
- Campana de agotados del panel.

#### `GET /productos/{id}` · Público · 🟡 faltan `activo`, `idMarca`, `idCategoria` y `especificaciones`

Responde **200**: **Producto**, **también si está inactivo** (con `activo: false`, contrato C5): ms-pedidos y los pedidos pasados lo necesitan. **404** solo si no existe. La página de detalle (4.3) muestra "no encontrado" cuando el producto está inactivo y quien mira no es admin.

**Vistas:**
- 4.3 Detalle de producto.
- 4.9 Compra no completada: nombre del producto agotado.
- 4.10 Mis pedidos y 4.11 Detalle de mi pedido: miniaturas.
- Detalle de venta del panel.
- 5.3 Editar producto.

#### `POST /productos` · ADMIN · ⬜

Envía:

| Campo | Para qué |
|---|---|
| `nombre` | Obligatorio |
| `descripcion` | Opcional |
| `precio` | Mayor que 0 |
| `imagenUrl` | Opcional |
| `idMarca` · `idCategoria` | Deben existir |
| `activo` | Opcional, por defecto `true` |
| `especificaciones` | Opcional: `[{ nombre, valor }]`, ambos obligatorios en cada una y sin nombres repetidos |

Responde **201**: **Producto**. **400** con `detalles` (por ejemplo `"especificaciones: hay nombres repetidos"`). El producto nace sin stock: **no se llama a inventario** (un producto sin entradas tiene stock 0).

**Vistas:** 5.3 Crear producto.

#### `PUT /productos/{id}` · ADMIN · ⬜

Envía los mismos campos que `POST`. También acepta solo `{ "activo": true }` para reactivar. Si viene `especificaciones`, **la lista enviada reemplaza a la anterior**; si no viene, no se tocan.

Responde **200**: **Producto**. **400**. **404**.

**Vistas:**
- 5.3 Editar producto.
- 5.2 Productos (interruptor: reactivar).

#### `DELETE /productos/{id}` · ADMIN · ⬜

Pone `activo: false`. Responde **204**. **404**.

**Vistas:** 5.2 Productos (interruptor: desactivar).

#### `GET /marcas` · `GET /categorias` · Público · ⬜

Responde **200**: **Marca[]** / **Categoría[]**. El público solo recibe las activas; el ADMIN recibe todas.

Cada una trae `productos` (activos). Las marcas traen además `conStock`: cuántos de esos productos tienen unidades disponibles (ms-catalogo se lo pregunta a ms-inventario). Con `conStock: 0` el filtro del catálogo muestra la marca tachada y no deja marcarla. Si ms-inventario no responde, `conStock` llega `null` y no se bloquea ninguna marca.

**Vistas:**
- 4.2 Catálogo (filtros con contador).
- Buscador del encabezado (sugerencias).
- 5.2 Productos (filtros).
- 5.3 Crear/editar producto (listas desplegables).
- 5.4 Marcas y categorías.

#### `POST /marcas` · `POST /categorias` · ADMIN · ⬜ propuesta

Envía `{ "nombre": "…" }`. Responde **201**: **Marca** / **Categoría** con `activo: true`. **400** si el nombre está vacío. **409** si el nombre ya existe (sin distinguir mayúsculas).

**Vistas:** 5.4 Marcas y categorías.

#### `PUT /marcas/{id}` · `PUT /categorias/{id}` · ADMIN · ⬜ propuesta

Envía `{ "nombre": "…" }` para renombrar y/o `{ "activo": false }` para desactivar. Responde **200**: **Marca** / **Categoría**. **400**. **404**. **409**.

**Vistas:** 5.4 Marcas y categorías (renombrar y activar/desactivar).

---

### 4.3 ms-inventario

#### `GET /stock/{idProducto}` · Público · 🟡 falta `actualizadoEn` y responder 0 sin fila

Responde **200**: **Stock**. Si el producto aún no tiene entradas: `{ "idProducto": 7, "disponible": 0, "reservado": 0, "actualizadoEn": null }` (no 404).

**Vistas:** 4.3 Detalle de producto (disponibilidad y tope del selector de cantidad).

#### `GET /stock?ids=1,2,3` · Público · ⬜ propuesta

Responde **200**: **Stock[]** con **una entrada por cada id pedido** (en 0 si no tiene stock). **Sin `ids`, todos los que tienen stock registrado.**

Evita una llamada por tarjeta. Es ruta pública: `GET /stock` se agrega a las rutas públicas del gateway y de ms-inventario (`GET /stock/*` no cubre `/stock`).

**Vistas:**
- 4.1 Inicio, 4.2 Catálogo y 4.3 Detalle: insignias de la grilla.
- 4.6 Carrito y 4.7 Checkout: aviso de stock insuficiente.
- 5.1 Resumen, 5.2 Productos y 5.5 Stock.
- Campana de agotados del panel (sin `ids`).

#### `POST /stock/entrada` · ADMIN · ⬜

Envía:

| Campo | Para qué |
|---|---|
| `idProducto` | Producto que recibe mercadería |
| `cantidad` | Entero mayor que 0; se **suma** a `disponible` |
| `motivo` | Opcional (p. ej. "Compra a proveedor") |

Responde **200**: **Stock** actualizado. Registra un movimiento `ENTRADA`. Si es la primera entrada del producto, crea su fila. **400**. **404** si el producto no existe en catálogo.

**Vistas:** 5.5 Stock (modal "Registrar entrada").

#### `PUT /stock/{idProducto}` · ADMIN · ⬜

Envía:

| Campo | Para qué |
|---|---|
| `disponible` | Nuevo valor absoluto (no una diferencia); entero ≥ 0 |
| `motivo` | Obligatorio (p. ej. "Conteo físico") |

Responde **200**: **Stock**. Registra un `AJUSTE` con la diferencia con signo; si el valor no cambia, no registra movimiento (la base no acepta cantidad 0). **400** si falta el motivo o el valor es negativo. **404** si el producto no existe.

**Vistas:** 5.5 Stock (modal "Ajustar").

#### `GET /movimientos?idProducto=` · ADMIN · ⬜

`idProducto` es opcional; sin él devuelve todos.

Responde **200**: **Movimiento[]**, del más reciente al más antiguo.

**Vistas:** 5.6 Movimientos.

---

### 4.4 ms-pedidos

Todas las rutas del carrito son **solo para CLIENTE**: un admin recibe 403. El carrito es el del usuario del token.

#### `GET /carrito` · CLIENTE · ⬜

Responde **200**: **Carrito**; vacío es `{ "items": [], "total": 0 }`.

**Vistas:**
- 4.6 Carrito.
- 4.7 Checkout.
- Encabezado de la tienda: número del icono del carrito.

#### `POST /carrito/items` · CLIENTE · ⬜

Envía:

| Campo | Para qué |
|---|---|
| `idProducto` | Producto que se agrega (debe estar activo) |
| `cantidad` | Entero > 0, por defecto 1. Si ya estaba en el carrito, **se suma** |

Responde **201**: **Carrito** completo. **400**. **404** si el producto no existe o está inactivo.

**Vistas:** 4.1 Inicio, 4.2 Catálogo y 4.3 Detalle (botón "Agregar al carrito").

#### `PUT /carrito/items/{idProducto}` · CLIENTE · ⬜

Envía `{ "cantidad": 3 }`: valor absoluto, entero > 0. Responde **200**: **Carrito**. **400**. **404** si no está en el carrito.

**Vistas:** 4.6 Carrito (selector de cantidad).

#### `DELETE /carrito/items/{idProducto}` · CLIENTE · ⬜

Responde **200**: **Carrito** sin esa línea. Si no estaba, no hace nada.

**Vistas:** 4.6 Carrito (quitar).

#### `POST /pedidos/checkout` · CLIENTE · ⬜

Envía:

| Campo | Para qué |
|---|---|
| `tipoComprobante` | `BOLETA` o `FACTURA` |
| `docCliente` | Boleta: DNI de 8 dígitos **opcional** (`null` o vacío). Factura: RUC de 11 dígitos obligatorio |
| `nombreRazonSocial` | Obligatorio: nombre del cliente o razón social |

Flujo que espera el front:
1. Crea la venta `PENDIENTE` con los ítems del carrito.
2. Reserva el stock de **todos** los ítems, o de ninguno (baja `disponible`, sube `reservado`).
3. Emite el comprobante.
4. Confirma la reserva: las unidades salen vendidas de `reservado` (el `disponible` ya bajó en el paso 2).
5. Deja la venta `CONFIRMADA` y vacía el carrito.

Responde **201**: **Venta** confirmada con `detalles`; el front va a `/compra/{id}/confirmada`.

Errores:
- **400**: `detalles` con `docCliente:` / `nombreRazonSocial:`, o `"El carrito está vacío"`.
- **409** `"Stock insuficiente para <producto>"` con `detalles: ["idProducto: 7"]`. **El front usa ese id** para mostrar el producto en 4.9. La venta queda `ANULADA`.
- **503** `"El servicio de comprobantes no está disponible…"`: se libera la reserva y la venta queda `ANULADA`.

**Vistas:**
- 4.7 Checkout.
- 4.8 Compra confirmada (si responde 201).
- 4.9 Compra no completada (si responde 409 o 503).

#### `GET /pedidos` · Con sesión · 🟡 falta control de dueño

Responde **200**: **Venta[]** con `detalles`, del más nuevo al más antiguo. Un CLIENTE recibe **solo las suyas**; el ADMIN, todas.

**Vistas:**
- 4.10 Mis pedidos.
- 5.1 Resumen: ventas, gráficos y más vendidos.
- 5.7 Ventas.
- 5.9 Reportes: ventas por día y más vendidos.

#### `GET /pedidos/{id}` · Dueño o ADMIN · 🟡 falta control de dueño

Responde **200**: **Venta** con `detalles`. **403** si es de otro cliente. **404**.

**Vistas:**
- 4.8 Compra confirmada.
- 4.11 Detalle de mi pedido.
- 4.12 Comprobante imprimible: productos del documento.
- Detalle de venta del panel.
- 5.8 Comprobantes: vista previa.

---

### 4.5 ms-comprobantes

#### `GET /comprobantes` · Con sesión · 🟡 falta el control de dueño

Responde **200**: **Comprobante[]**, del más nuevo al más antiguo. Un CLIENTE recibe solo los suyos (filtrados por `comprobante.id_usuario`); el ADMIN, todos.

**Vistas:**
- 4.10 Mis pedidos: número de comprobante en cada pedido.
- 5.1 Resumen.
- 5.7 Ventas.
- 5.8 Comprobantes.

#### `GET /comprobantes/{id}` · Dueño o ADMIN · 🟡 falta el control de dueño

Responde **200**: **Comprobante**. **403**. **404**.

**Vistas:** 4.12 Comprobante imprimible.

#### `GET /comprobantes/venta/{idVenta}` · Dueño o ADMIN · ⬜

Responde **200**: el **Comprobante** de esa venta (uno por venta). **403**. **404** si la venta no tiene comprobante.

**Vistas:**
- 4.8 Compra confirmada.
- 4.11 Detalle de mi pedido.
- Detalle de venta del panel.

#### `GET /comprobantes/{id}/pdf` · Dueño o ADMIN · ⬜

Responde **200** con el archivo PDF:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="B001-00000040.pdf"`

**403**. **404**.

**Vistas:** botón "Descargar PDF" en 4.8, 4.11, 4.12, el detalle de venta del panel y 5.8.

#### `GET /comprobantes/reporte?desde=2026-10-01&hasta=2026-10-15` · ADMIN · ⬜

`desde` y `hasta` son opcionales (`LocalDate`, inclusivos) y filtran por la fecha de `emitidoEn`.

Responde **200**:

```json
{ "desde": "2026-10-01", "hasta": "2026-10-15", "cantidad": 18, "subtotal": 4520.34, "igv": 813.66, "total": 5334.0,
  "comprobantes": [ /* Comprobante */ ] }
```

| Atributo | Para qué lo usa el front |
|---|---|
| `desde` · `hasta` | Rango aplicado; se muestra en el encabezado del reporte |
| `cantidad` | Tarjeta "Comprobantes emitidos" |
| `subtotal` · `igv` · `total` | Tarjetas de montos del período |
| `comprobantes` | Tabla del reporte y desglose boletas / facturas |

**Vistas:** 5.9 Reportes.

---

### 4.6 Rutas internas (el front **nunca** las llama)

Las usa ms-pedidos durante el checkout. Desde afuera deben responder **403**.

| Ruta | Para qué |
|---|---|
| `POST /stock/reservar` | Aparta las unidades del pedido (movimiento `RESERVA`) |
| `POST /stock/confirmar` | Descuenta lo reservado tras emitir el comprobante (movimiento `CONFIRMACION`) |
| `POST /stock/liberar` | Devuelve la reserva si falla el comprobante (movimiento `LIBERACION`) |
| `POST /comprobantes` | Emite el comprobante: serie `B001`/`F001`, correlativo por serie, uno por venta. Recibe también el `idUsuario` de la venta (control de dueño) |

---

## 5. Qué endpoints usa cada vista

Lista rápida para responder "¿esta vista para qué necesita ese endpoint?".

### Comunes

| Pieza | Endpoints |
|---|---|
| Encabezado de la tienda (todas las vistas 4.x) | `GET /usuarios/me` (con sesión) · `GET /carrito` (solo CLIENTE) |
| Buscador del encabezado | `GET /productos?q&size=5` · `GET /marcas` · `GET /categorias` |
| Barra lateral del panel (todas las vistas 5.x) | `GET /usuarios/me` · `GET /stock` · `GET /productos?size=100` (campana de agotados) |
| Botón "Agregar al carrito" | `POST /carrito/items` |
| Botón "Descargar PDF" | `GET /comprobantes/{id}/pdf` |

### Tienda

| Vista | Ruta | Endpoints |
|---|---|---|
| 4.1 Inicio | `/` | `GET /productos` · `GET /stock?ids` · `POST /carrito/items` |
| 4.2 Catálogo | `/catalogo` | `GET /productos` (filtros) · `GET /marcas` · `GET /categorias` · `GET /stock?ids` · `POST /carrito/items` |
| 4.3 Detalle de producto | `/productos/:id` | `GET /productos/{id}` · `GET /stock/{id}` · `GET /productos` (relacionados) · `GET /stock?ids` · `POST /carrito/items` |
| 4.4 Iniciar sesión | `/login` | `POST /auth/login` |
| 4.5 Crear cuenta | `/registro` | `POST /auth/registro` |
| 4.6 Carrito | `/carrito` | `GET /carrito` · `GET /stock?ids` · `PUT /carrito/items/{id}` · `DELETE /carrito/items/{id}` |
| 4.7 Checkout | `/checkout` | `GET /carrito` · `GET /usuarios/me` · `GET /stock?ids` · `POST /pedidos/checkout` |
| 4.8 Compra confirmada | `/compra/:idVenta/confirmada` | `GET /pedidos/{id}` · `GET /comprobantes/venta/{idVenta}` · `GET /usuarios/me` · PDF |
| 4.9 Compra no completada | `/compra/no-completada` | `GET /productos/{id}` (el id viene en los `detalles` del 409) |
| 4.10 Mis pedidos | `/mis-pedidos` | `GET /pedidos` · `GET /comprobantes` · `GET /productos/{id}` (miniaturas) |
| 4.11 Detalle de mi pedido | `/mis-pedidos/:id` | `GET /pedidos/{id}` · `GET /comprobantes/venta/{id}` · `GET /productos/{id}` · PDF |
| 4.12 Comprobante imprimible | `/comprobantes/:id/imprimir` | `GET /comprobantes/{id}` · `GET /pedidos/{idVenta}` · PDF |
| 4.13 Mi perfil | `/perfil` | `GET /usuarios/me` · `PUT /usuarios/me` |
| 4.14 Errores | `/403`, `/sesion-expirada`, `/sin-conexion`, `*` | Ninguno |

### Panel de administración

| Vista | Ruta | Endpoints |
|---|---|---|
| 5.1 Resumen | `/admin` | `GET /pedidos` · `GET /comprobantes` · `GET /usuarios` · `GET /stock` · `GET /productos?size=100` |
| 5.2 Productos | `/admin/productos` | `GET /productos` (filtros, `inactivos`) · `GET /marcas` · `GET /categorias` · `GET /stock?ids` · `DELETE /productos/{id}` · `PUT /productos/{id}` `{activo:true}` |
| 5.3 Crear / editar producto | `/admin/productos/nuevo` · `/admin/productos/:id/editar` | `GET /productos/{id}` · `GET /marcas` · `GET /categorias` · `POST /productos` · `PUT /productos/{id}` |
| 5.4 Marcas y categorías | `/admin/marcas-categorias` | `GET` · `POST` · `PUT /marcas` · `GET` · `POST` · `PUT /categorias` |
| 5.5 Stock | `/admin/stock` | `GET /stock` · `GET /productos?size=100` · `POST /stock/entrada` · `PUT /stock/{id}` |
| 5.6 Movimientos | `/admin/movimientos` | `GET /movimientos` · `GET /productos?size=100&inactivos=true` |
| 5.7 Ventas | `/admin/ventas` | `GET /pedidos` · `GET /comprobantes` · `GET /usuarios` |
| Detalle de venta | `/admin/ventas/:id` | `GET /pedidos/{id}` · `GET /usuarios/{id}` · `GET /comprobantes/venta/{id}` · `GET /productos/{id}` · PDF |
| 5.8 Comprobantes | `/admin/comprobantes` | `GET /comprobantes` · `GET /pedidos/{id}` (vista previa) · PDF |
| 5.9 Reportes | `/admin/reportes` | `GET /comprobantes/reporte` · `GET /pedidos` · `GET /productos?size=100&inactivos=true` |
| 5.10 Usuarios | `/admin/usuarios` | `GET /usuarios` · `POST /usuarios` · `PUT /usuarios/{id}` · `DELETE /usuarios/{id}` |
