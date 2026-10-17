# IntiGuard · cliente web

React + Vite (JavaScript) con Feature-Sliced Design. La arquitectura está en
[`docs/ARQUITECTURA_WEB.md`](docs/ARQUITECTURA_WEB.md) y el diseño en
[`docs/PROTOTIPO_WEB.md`](docs/PROTOTIPO_WEB.md).

## Arrancar

```bash
nvm use 22
npm install
npm run dev        # http://localhost:5173
```

| Comando | Para qué |
|---|---|
| `npm run dev` | App en desarrollo, con los mocks de `VITE_MOCKS` |
| `npm run build` | Genera `dist/` (sin mocks) |
| `npm run preview` | Sirve `dist/` |
| `npm run lint` | oxlint |

## Usuarios de los mocks

Solo existen en el navegador (`src/shared/mocks/db/usuarios.js`):

| Correo | Contraseña | Rol | Para probar |
|---|---|---|---|
| `ana.torres@gmail.com` | `cliente123` | CLIENTE | Compra completa; empieza con el carrito de la vista 4.6 (incluye un producto agotado) |
| `admin@intiguard.pe` | `admin1234` | ADMIN | Panel de administración |
| `luis.ramos@hotmail.com` | `cliente123` | CLIENTE | Cuenta bloqueada por intentos (10 min desde que carga la página) |
| `pedro.quispe@gmail.com` | `cliente123` | CLIENTE | Cuenta inactiva (el login responde "credenciales inválidas") |

El 5.º intento fallido bloquea la cuenta 15 minutos. **Recargar la página reinicia todos los datos**
(ventas, stock, usuarios): para probar un flujo largo, navegar dentro de la app sin recargar.

Los datos semilla son los de `PROTOTIPO_WEB.md` §3 más un historial generado con semilla fija
(ventas desde el 01/09/2026 hasta hoy, con sus comprobantes y movimientos de stock), para que el
resumen, los reportes y las tablas del panel tengan datos. Las imágenes de producto están en `public/productos/`.

Para probar la vista 4.9 "No pudimos completar tu compra", poner `VITE_MOCK_FALLA_COMPROBANTE=true`
en `.env.development.local` y reiniciar `npm run dev`.

## Publicar en Render

El build normal (`npm run build`) **no incluye los mocks** y tampoco hay proxy de Vite: `/api` tiene que llegar a un
backend real. Para publicar una **demo con datos simulados**, los mocks se encienden también en el build con una variable.

En Render, como *Static Site*:

| Opción | Valor |
|---|---|
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Environment → `NODE_VERSION` | `22` |
| Environment → `VITE_MOCKS_EN_BUILD` | `true` (demo con los cinco servicios simulados) |
| Redirects/Rewrites | Source `/*` → Destination `/index.html`, Action **Rewrite** (para que `/catalogo`, `/admin`… no den 404 al recargar) |

Las variables `VITE_*` se leen **al hacer el build**: después de cambiarlas en Render hay que volver a desplegar.
Como en local, cada visitante tiene sus propios datos simulados y se reinician al recargar.

**Cuando el backend esté publicado**, quitar `VITE_MOCKS_EN_BUILD` y elegir una de estas dos formas:

- Una regla de Render antes de la anterior: Source `/api/*` → Destination `https://<gateway>/:splat`, Action **Rewrite**.
  El navegador sigue viendo un solo dominio y no hace falta CORS.
- O `VITE_API_URL=https://<gateway>` (sin `/api`), con CORS habilitado en el gateway para el dominio de Render.

## Backend real

Crear `.env.development.local` (no se sube) y dejar en `VITE_MOCKS` solo los servicios que sigan simulados:

```properties
VITE_MOCKS=pedidos,comprobantes
```

Lo que no tiene mock pasa por el proxy de Vite (`/api` → `http://localhost:8080`, sin el prefijo).

### Lo que el front usa y el backend todavía no tiene (propuestas)

Están en `src/shared/api/endpoints.js` y los responde el mock. Hay que pasárselos a cada responsable:

| Servicio | Propuesta | Para qué vista |
|---|---|---|
| ms-auth | `POST /auth/registro` | 4.5 |
| ms-auth | `GET` / `PUT /usuarios/me` (perfil propio, contraseña y foto) | 4.13 |
| ms-auth | `bloqueadoHasta` y `ultimoAcceso` en `UsuarioResponse` | 5.10 |
| ms-catalogo | `activo`, `idMarca`, `idCategoria` y `especificaciones` en el producto | 4.3, 5.2, 5.3 |
| ms-catalogo | Filtros `marca` (varias, con coma), `precioMin`, `precioMax`, `conStock`, `sort` e `inactivos` | 4.2, 5.2 |
| ms-catalogo | `POST /marcas`, `PUT /marcas/{id}`, `POST /categorias`, `PUT /categorias/{id}` y `productos` (cantidad) en cada una | 4.2, 5.4 |
| ms-inventario | `GET /stock?ids=1,2,3` (y sin ids, todo) con `actualizadoEn` | 4.1–4.7, 5.5 |
| ms-inventario | Tipos de movimiento `RESERVA`, `CONFIRMACION`, `LIBERACION` además de `ENTRADA` y `AJUSTE` | 5.6 |
| ms-pedidos | `detalles` en `GET /pedidos` y `GET /pedidos/{id}`; `marca` en las líneas del carrito; DNI opcional en boleta | 4.6–4.11, 5.7 |

## Estado

Todas las vistas de `PROTOTIPO_WEB.md` están construidas y probadas contra los mocks.

| Vista | Diseño |
|---|---|
| 4.1 a 4.14 (tienda) | Stitch, salvo las variantes de error 403 / sesión expirada / sin conexión (mismo diseño que la 404) |
| 5.1 a 5.10 (panel) | Stitch, salvo **5.5 Stock** y el **detalle de venta** de la 5.7, armados con el texto de `PROTOTIPO_WEB.md` |

