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
| `npm run dev` | App en desarrollo contra el backend real (gateway en `localhost:8080`); con mocks si se define `VITE_MOCKS` |
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

`render.yaml` crea un **Static Site** gratuito llamado `intiguard-web` (Dashboard → **New → Blueprint** → este repositorio).
El build usa `.env.production`, que apunta al gateway publicado: `VITE_API_URL=https://intiguard-gateway.onrender.com`.
El gateway acepta ese dominio por CORS (`CORS_ORIGENES` en el backend). Si Render le asigna otra URL a la web o al
gateway, corrige `.env.production` aquí y `CORS_ORIGENES` en el backend, y vuelve a desplegar.

El backend en el plan gratuito se duerme tras 15 min sin tráfico: antes de una demo, correr
`bash pruebas/despertar-render.sh` en el repositorio del backend (o abrir la web y esperar ~1 min).

Para publicar una **demo solo con datos simulados** (sin backend), agregar en Render `VITE_MOCKS_EN_BUILD=true`
y volver a desplegar: los mocks se encienden también en el build.

## Backend real

Es lo que usa `npm run dev` por defecto (`VITE_MOCKS=` vacío en `.env.development`). Todo `/api` pasa por el proxy
de Vite al gateway (`/api` → `http://localhost:8080`, sin el prefijo), así que el navegador ve un solo origen.

1. Levantar el backend (repositorio `DSW_II_PROYECTO`, ver su `ARRANQUE_PROYECTO.md`): Eureka, gateway y los cinco servicios.
2. `npm run dev` y entrar a `http://localhost:5173`.
3. Los usuarios son los de Aiven: el administrador sale de `ADMIN_CORREO` / `ADMIN_CLAVE` del `.env` del backend, y
   cualquiera puede crear una cuenta de cliente en `/registro`.

Para trabajar **sin backend**, crear `.env.development.local` (no se sube) con los servicios que se quieran simular:

```properties
VITE_MOCKS=auth,catalogo,inventario,pedidos,comprobantes
```

Todos los endpoints que antes eran propuestas ya existen en el backend (18/10/2026) y responden igual que los mocks.
Se comprobó el recorrido completo a través del proxy de Vite contra Aiven: catálogo con filtros, registro, perfil,
carrito, checkout con boleta y factura, stock insuficiente (409), comprobantes caídos (503 con el stock liberado),
comprobantes y PDF, reportes y el panel con los 206 productos reales.

## Estado

Todas las vistas de `PROTOTIPO_WEB.md` están construidas, probadas contra los mocks y conectadas al backend real.

| Vista | Diseño |
|---|---|
| 4.1 a 4.14 (tienda) | Stitch, salvo las variantes de error 403 / sesión expirada / sin conexión (mismo diseño que la 404) |
| 5.1 a 5.10 (panel) | Stitch, salvo **5.5 Stock** y el **detalle de venta** de la 5.7, armados con el texto de `PROTOTIPO_WEB.md` |

