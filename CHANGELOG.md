# Changelog

Todas las versiones notables de Apuntar Academia se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [0.1.0] - 2026-08-31

Primera versión de desarrollo con la plataforma funcionalmente completa de punta a punta. Sin uso de usuarios reales todavía — en fase de pruebas internas.

### Agregado

**Autenticación y usuarios**
- Login/registro con JWT + Google OAuth
- 3 roles: comprador, vendedor, admin
- Verificación de DNI y CLU con aprobación/rechazo por parte de un admin (con email y motivo)
- Contexto de autenticación global (`AuthContext`) sincronizado en toda la app, sin depender de recargas de página

**Productos y transacciones**
- CRUD de productos con Cloudinary, moderación por admin, categorías y filtros
- Sistema de transacciones con escrow completo
- Pagos con Mercado Pago Checkout API (formulario propio)

**Chat en tiempo real**
- Mensajería vía Socket.io por transacción
- Presencia en línea/desconectado en tiempo real, persistente mientras dure la sesión (no solo dentro de la página de chat)
- Sonido de notificación y popup de nuevo mensaje disponibles desde cualquier página
- Contador de mensajes no leídos por conversación, con redirección inteligente (directo a la conversación si es una sola, o al listado si hay varias)

**Cursos**
- CRUD de cursos por admin (fecha, horario, cupos, precio, descuento, promoción)
- Página pública de catálogo de cursos
- Checkout de inscripción con Mercado Pago Checkout API
- Inscripción con nombre y DNI del participante, con validación de duplicados por DNI
- Términos y condiciones editables por curso (texto libre o carga desde archivo Word), con aceptación obligatoria antes de pagar

**Panel de administración**
- Gestión de usuarios, productos y cursos con navbar compartido y contadores
- Navegación unificada con menú desplegable de usuario en toda la plataforma, según rol

**Infraestructura**
- Backend en NestJS + TypeORM + PostgreSQL (Neon), deployado en Render
- Frontend en Next.js 16 + Tailwind CSS v4, deployado en Vercel
- Notificaciones por email (aprobación, rechazo, compra, entrega)

### Pendiente para próximas versiones
- Bloqueo de compra/venta por vencimiento de CLU
- Panel de administración: vista de inscripciones por curso
- Dashboard de ganancias y comisiones (incluyendo cursos)
- Dashboard de movimientos y progreso general de usuarios/productos

## [0.2.0] - 2026-09-08

### Agregado

**Vencimiento de CLU**
- Bloqueo automático de compra y venta cuando el CLU de un usuario está vencido (tanto para el comprador como para el vendedor de un producto)
- Suspensión automática de la cuenta al detectar vencimiento: vía cron diario y como respaldo, verificación en el momento en que el usuario intenta comprar o vender
- Flujo de renovación: el usuario resube su CLU con fecha nueva desde `/profile/documents`, quedando en revisión hasta que un admin la confirme
- Panel de admin: aviso distintivo para suspensiones automáticas por CLU vencido, con botones de aprobar/rechazar visibles solo una vez que el usuario envía la documentación renovada

### Corregido
- Navbar: agregado acceso directo a "Mis documentos" en el menú desplegable de usuario
- Formulario de publicar producto: el campo de precio rechazaba valores no múltiplos de 1000 (ej. $8.500) por un `step` mal configurado
- Formulario de publicar producto: los errores ahora se muestran como toast, consistente con el resto de la plataforma (antes quedaban arriba de la página, fuera de la vista si el usuario había scrolleado)
- Panel de admin de cursos: el formulario de edición y el listado completo se mostraban superpuestos en pantalla al mismo tiempo
- Términos y condiciones de cursos: separados en su propio modal con guardado independiente, en vez de vivir dentro del formulario general de edición del curso (donde no había confirmación clara de que se hubiera guardado)