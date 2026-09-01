# Apuntar Academia

Plataforma full-stack de comercio legal de armas en Argentina, regulada por ANMAC. Incluye marketplace de productos con escrow, sistema de cursos con inscripción paga, chat en tiempo real, y panel de administración completo.

**Versión actual:** v0.1.0 · [Ver changelog completo](./CHANGELOG.md)

## Stack

| Capa | Tecnología |
|---|---|
| Backend | NestJS + TypeORM + PostgreSQL |
| Frontend | Next.js 16 + Tailwind CSS v4 |
| Base de datos | PostgreSQL (Neon, cloud) |
| Pagos | Mercado Pago Checkout API |
| Chat | Socket.io |
| Deploy backend | Render |
| Deploy frontend | Vercel |

## Estructura del repo

Monorepo con dos carpetas principales:
/backend → API NestJS
/frontend → App Next.js


Rama de trabajo principal: `develop`.

## Instalación y desarrollo local

### Backend

```bash
cd backend
npm install
npm run start:dev   # levanta con hot-reload en modo watch
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # levanta en modo desarrollo
```

### Scripts útiles

| Comando | Dónde | Qué hace |
|---|---|---|
| `npm run build` | backend / frontend | build de producción |
| `npm run start:prod` | backend | corre el build compilado |
| `npm run lint` | backend / frontend | linting |
| `npm run test` | backend | tests unitarios (Jest) |
| `npm run test:e2e` | backend | tests end-to-end |

## Variables de entorno

### Backend (Render)
MERCADOPAGO_ACCESS_TOKEN= # credencial de Mercado Pago (Checkout API)
FRONTEND_URL= # URL de Vercel, con https://
BACKEND_URL= # URL propia del backend, usada en el webhook de MP
DATABASE_URL= # connection string de Neon


### Frontend (Vercel)

NEXT_PUBLIC_API_URL=https://apuntar-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://apuntar-backend.onrender.com
NEXT_PUBLIC_MP_PUBLIC_KEY= # credencial pública de Mercado Pago


## Diseño

Estilo táctico negro/dorado. Tipografías: `Bebas Neue` (tactical) y `Rajdhani`. Clases custom reutilizables: `btn-tactical`, `btn-tactical-outline`, `card-tactical`, `input-tactical`, `bg-tactical-grid`, `font-tactical`.

## Módulos principales

- **Auth** — JWT + Google OAuth, roles: comprador / vendedor / admin
- **Usuarios** — verificación de DNI y CLU, aprobación/rechazo por admin
- **Productos** — CRUD con Cloudinary, moderación, categorías, búsqueda
- **Transacciones** — sistema de escrow
- **Pagos** — Mercado Pago Checkout API (formulario propio)
- **Chat** — Socket.io en tiempo real, presencia global, notificaciones
- **Cursos** — CRUD, inscripción paga, términos y condiciones por curso
- **Panel Admin** — gestión de usuarios, productos y cursos

## Notas de infraestructura

- El backend usa `synchronize: true` de TypeORM — cualquier columna nueva marcada como obligatoria (`NOT NULL`) sin `default` puede romper el arranque si ya existen filas en la tabla. Ver `CHANGELOG.md` o el historial de incidentes para más contexto si esto vuelve a pasar.
- El plan gratuito de Render duerme el backend tras un rato de inactividad — esto puede causar demoras al reconectar sockets o cargar datos después de un período sin uso.

## Pendientes conocidos

Ver la sección "Pendiente para próximas versiones" en [`CHANGELOG.md`](./CHANGELOG.md).