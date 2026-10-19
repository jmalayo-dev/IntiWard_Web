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
| `npm run dev` | App en desarrollo contra el backend real (gateway en `localhost:8080`) |
| `npm run build` | Genera `dist/` |
| `npm run preview` | Sirve `dist/` |
| `npm run lint` | oxlint |

## Publicar en Render

`render.yaml` crea un **Static Site** gratuito llamado `intiward-web` (`https://intiward-web.onrender.com`) (Dashboard → **New → Blueprint** → este repositorio).
El build usa `.env.production`, que apunta al gateway publicado: `VITE_API_URL=https://intiguard-gateway.onrender.com`.
El gateway acepta ese dominio por CORS (`CORS_ORIGENES` en el backend). Si Render le asigna otra URL a la web o al
gateway, corrige `.env.production` aquí y `CORS_ORIGENES` en el backend, y vuelve a desplegar.

El backend en el plan gratuito se duerme tras 15 min sin tráfico: antes de una demo, correr
`bash pruebas/despertar-render.sh` en el repositorio del backend (o abrir la web y esperar ~1 min).

## Backend real

La web siempre habla con el backend real: no hay datos simulados. En desarrollo, todo `/api` pasa por el proxy
de Vite al gateway (`/api` → `http://localhost:8080`, sin el prefijo), así que el navegador ve un solo origen.

1. Levantar el backend (repositorio `DSW_II_PROYECTO`, ver su `ARRANQUE_PROYECTO.md`): Eureka, gateway y los cinco servicios.
2. `npm run dev` y entrar a `http://localhost:5173`.
3. Los usuarios son los de Aiven: el administrador sale de `ADMIN_CORREO` / `ADMIN_CLAVE` del `.env` del backend, y
   cualquiera puede crear una cuenta de cliente en `/registro`.

Todos los endpoints que antes eran propuestas ya existen en el backend (18/10/2026). Se comprobó el recorrido completo a través del proxy de Vite contra Aiven: catálogo con filtros, registro, perfil,
carrito, checkout con boleta y factura, stock insuficiente (409), comprobantes caídos (503 con el stock liberado),
comprobantes y PDF, reportes y el panel con los 206 productos reales.

## Estado

Todas las vistas de `PROTOTIPO_WEB.md` están construidas y conectadas al backend real. Los mocks (MSW) se eliminaron el 19/10/2026.

| Vista | Diseño |
|---|---|
| 4.1 a 4.14 (tienda) | Stitch, salvo las variantes de error 403 / sesión expirada / sin conexión (mismo diseño que la 404) |
| 5.1 a 5.10 (panel) | Stitch, salvo **5.5 Stock** y el **detalle de venta** de la 5.7, armados con el texto de `PROTOTIPO_WEB.md` |

