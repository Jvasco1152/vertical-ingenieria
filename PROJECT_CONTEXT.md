# Contexto del Proyecto - Vertical Ingeniería

## 📋 Resumen del Proyecto

**Cliente:** Vertical Ingeniería
**Sector:** Diseño de interiores para ascensores
**Objetivo:** Sistema web para que trabajadores documenten proyectos con fotos y clientes puedan seguir el progreso en tiempo real

## ✅ Estado Actual del Proyecto (Actualizado 2026-03-03)

### 🚀 Deployment en Producción
- [x] **Aplicación desplegada en Vercel:** [https://vertical-ingenieria.vercel.app](https://vertical-ingenieria.vercel.app)
- [x] Base de datos PostgreSQL en Supabase
- [x] Variables de entorno configuradas en Vercel
- [x] Deployment automático desde GitHub
- [x] Next.js 15.5.9 (versión segura sin CVE-2025-66478)
- [x] React 18.3.1 (compatible con Next.js 15)

### Infraestructura Base
- [x] Proyecto Next.js 15.5.9 con TypeScript configurado
- [x] React 18.3.1 configurado
- [x] Tailwind CSS 4.1.18 configurado (@tailwindcss/postcss)
- [x] Estructura de carpetas organizada
- [x] Variables de entorno configuradas (.env.local y .env)
- [x] Build exitoso sin errores
- [x] PostgreSQL en Supabase configurado y conectado

### Base de Datos (Prisma 6.19.1 + PostgreSQL 18)
- [x] Schema completo de Prisma creado
- [x] Cliente de Prisma generado
- [x] PostgreSQL instalado localmente (puerto 5432)
- [x] Base de datos `vertical_db` creada y migrada
- [x] Seed ejecutado con datos de prueba
- [x] Modelos implementados y funcionando:
  - `User` (con roles: ADMIN, WORKER, CLIENT)
  - `Project` (con estados y fases)
  - `ProjectWorker` (relación many-to-many)
  - `ProjectImage` (para fotos del progreso) ✅ **FUNCIONAL**
  - `ProjectPhaseLog` (historial de fases)
  - `Comment` (comentarios en proyectos) ✅ **FUNCIONAL**
  - `Notification` (notificaciones) ✅ **FUNCIONAL**
  - `QuoteRequest` (solicitudes de cotización) ✅ **FUNCIONAL**

### Autenticación (NextAuth)
- [x] NextAuth configurado con credentials provider
- [x] Tipos de TypeScript extendidos para sesión
- [x] Sistema de roles implementado
- [x] Callbacks de JWT y session configurados
- [x] Protección de rutas (mediante componente ProtectedRoute)

### Componentes Creados
- [x] **UI:** Button (con variants y loading state)
- [x] **Layout:** Navbar (con notificaciones y dropdown de perfil) ✅ **COMPLETO**
- [x] **Layout:** Sidebar (navegación con filtros por rol) ✅ **COMPLETO**
- [x] **Projects:** ProjectCard (tarjetas con estadísticas) ✅ **COMPLETO**
- [x] **Projects:** ProjectForm (crear/editar proyectos) ✅ **NUEVO**
- [x] **Projects:** ProjectActions (editar/eliminar) ✅ **NUEVO**
- [x] **Projects:** ProjectFilters (búsqueda y filtros) ✅ **NUEVO**
- [x] **Projects:** ProjectGallery (galería con filtros por fase) ✅ **COMPLETO**
- [x] **Projects:** ImageUploader (drag & drop con progress) ✅ **COMPLETO**
- [x] **Projects:** ImageCard (card con lightbox) ✅ **COMPLETO**
- [x] **Comments:** CommentForm (crear comentarios) ✅ **NUEVO**
- [x] **Comments:** Comment (mostrar/editar/eliminar) ✅ **NUEVO**
- [x] **Comments:** CommentList (lista con fetch) ✅ **NUEVO**
- [x] **Notifications:** NotificationBell (campana con badge) ✅ **NUEVO**
- [x] **Notifications:** NotificationPanel (panel dropdown) ✅ **NUEVO**
- [x] **Notifications:** NotificationItem (item individual) ✅ **NUEVO**
- [x] **Users:** UserForm (crear/editar usuarios) ✅ **NUEVO**
- [x] **Clients:** ClientForm (crear/editar clientes) ✅ **NUEVO**
- [x] **Gallery:** ImageCard (tarjeta de imagen) ✅ **NUEVO**
- [x] **Gallery:** ImageLightbox (vista ampliada) ✅ **NUEVO**
- [x] **QuoteRequest:** Formulario público de cotización ✅ **NUEVO**
- [x] **QuoteRequest:** Panel admin de solicitudes ✅ **NUEVO**
- [x] **QuoteRequest:** Vista detalle con gestión de estado ✅ **NUEVO**

### Páginas Implementadas
- [x] `/` - Landing page con botón de login
- [x] `/login` - Página de login funcional
- [x] `/dashboard` - Dashboard con datos reales de PostgreSQL ✅ **CON DATOS REALES**
- [x] `/projects` - Lista de proyectos con filtros y búsqueda ✅ **COMPLETO**
- [x] `/projects/new` - Crear nuevo proyecto ✅ **NUEVO**
- [x] `/projects/[id]` - Detalle de proyecto completo ✅ **COMPLETO**
- [x] `/projects/[id]/edit` - Editar proyecto ✅ **NUEVO**
- [x] `/users` - Gestión de usuarios (solo ADMIN) ✅ **NUEVO**
- [x] `/users/new` - Crear usuario ✅ **NUEVO**
- [x] `/users/[id]/edit` - Editar usuario ✅ **NUEVO**
- [x] `/clients` - Gestión de clientes (solo ADMIN) ✅ **NUEVO**
- [x] `/clients/new` - Crear cliente ✅ **NUEVO**
- [x] `/clients/[id]/edit` - Editar cliente ✅ **NUEVO**
- [x] `/gallery` - Galería de todas las imágenes ✅ **NUEVO**
- [x] `/solicitud` - Formulario público de cotización (sin auth) ✅ **NUEVO**
- [x] `/solicitudes` - Panel admin de solicitudes con filtros ✅ **NUEVO**
- [x] `/solicitudes/[id]` - Detalle: estado, notas internas, crear proyecto ✅ **NUEVO**

### API Routes Implementadas
- [x] `/api/auth/[...nextauth]` - Autenticación
- [x] `/api/cloudinary/sign` - Firma de upload
- [x] `/api/projects` - GET (lista con filtros), POST (crear)
- [x] `/api/projects/[id]` - GET, PUT, DELETE
- [x] `/api/projects/[id]/images` - GET, POST
- [x] `/api/projects/[id]/images/[imageId]` - DELETE
- [x] `/api/comments` - GET, POST
- [x] `/api/comments/[id]` - PUT, DELETE
- [x] `/api/notifications` - GET, PUT, DELETE
- [x] `/api/users` - GET (con filtros), POST
- [x] `/api/users/[id]` - GET, PUT, DELETE
- [x] `/api/dashboard/stats` - Estadísticas del dashboard
- [x] `/api/gallery` - Imágenes con filtros
- [x] `/api/solicitudes` - GET (solo admin), POST (público)
- [x] `/api/solicitudes/[id]` - GET, PATCH (solo admin)

### Datos de Prueba (Seed)
- [x] Script de seed creado (`prisma/seed.ts`)
- [x] 5 usuarios de ejemplo (1 admin, 2 workers, 2 clients)
- [x] 3 proyectos de ejemplo
- [x] Comentarios y notificaciones de muestra
- [x] Password para todos: `password123`

## ✅ Funcionalidades Implementadas Completamente

### 1. Sistema de Carga de Imágenes con Cloudinary ⭐
**Estado:** ✅ **COMPLETADO**

**Implementado:**
- [x] Cloudinary configurado (Cloud Name: dwcejjfli)
- [x] Upload con firma segura desde backend
- [x] Drag & drop con preview y progress bar
- [x] Validación (jpg/png/webp, max 5MB)
- [x] Galería con filtros por fase
- [x] Lightbox para vista ampliada
- [x] Permisos por rol (ADMIN/WORKER suben, CLIENT solo ve)
- [x] API completa (GET, POST, DELETE)

### 2. CRUD Completo de Proyectos ⭐
**Estado:** ✅ **COMPLETADO**

**Implementado:**
- [x] Formulario de crear proyecto (con validación Zod)
- [x] Formulario de editar proyecto
- [x] Eliminación con confirmación
- [x] Asignación de trabajadores (multi-select)
- [x] Selección de cliente
- [x] Cambio de estado y fase
- [x] Actualización de progreso (slider 0-100%)
- [x] Fechas y presupuesto
- [x] Notificaciones automáticas en cambios

### 3. Sistema de Comentarios ⭐
**Estado:** ✅ **COMPLETADO**

**Implementado:**
- [x] Crear comentarios en proyectos
- [x] Edición inline de comentarios propios
- [x] Eliminación con permisos (autor o ADMIN)
- [x] Lista actualizable en tiempo real
- [x] Badges de rol del autor
- [x] Timestamps relativos
- [x] Notificaciones automáticas al comentar

### 4. Sistema de Notificaciones ⭐
**Estado:** ✅ **COMPLETADO**

**Implementado:**
- [x] Campana con badge de contador
- [x] Panel dropdown con lista
- [x] Auto-refresh cada 30 segundos
- [x] Marcar como leída (individual o todas)
- [x] Links a proyectos relacionados
- [x] Íconos por tipo de notificación
- [x] Generación automática para:
  - Nuevos comentarios
  - Nuevas imágenes
  - Cambios de fase
  - Proyecto completado
  - Asignación de trabajador

### 5. Dashboard con Datos Reales ⭐
**Estado:** ✅ **COMPLETADO**

**Implementado:**
- [x] Estadísticas en tiempo real:
  - Proyectos activos
  - En progreso
  - Completados
  - Avance promedio
- [x] Comparación con mes anterior
- [x] Actividad reciente (últimos 10 proyectos)
- [x] Filtrado automático por rol
- [x] Tarjetas con gradientes y animaciones

### 6. Filtros y Búsqueda en Proyectos ⭐
**Estado:** ✅ **COMPLETADO**

**Implementado:**
- [x] Búsqueda por texto (título, descripción, ubicación)
- [x] Filtro por estado
- [x] Filtro por fase actual
- [x] Filtro por cliente (solo ADMIN)
- [x] Ordenamiento (fecha, título, progreso)
- [x] Panel de filtros expandible
- [x] Indicador de filtros activos
- [x] Botón limpiar filtros

### 7. Gestión de Usuarios ⭐
**Estado:** ✅ **COMPLETADO**

**Implementado:**
- [x] Lista de usuarios con tabla
- [x] Crear nuevo usuario
- [x] Editar usuario existente
- [x] Eliminar usuario (con confirmación)
- [x] Búsqueda por nombre/email
- [x] Filtro por rol
- [x] Contador de proyectos por usuario
- [x] Prevención de auto-eliminación
- [x] Solo accesible para ADMIN

### 8. Gestión de Clientes ⭐
**Estado:** ✅ **COMPLETADO**

**Implementado:**
- [x] Lista de clientes (usuarios con rol CLIENT)
- [x] Crear nuevo cliente
- [x] Editar cliente existente
- [x] Eliminar cliente (con confirmación)
- [x] Búsqueda por nombre/email
- [x] Vista en tarjetas con estadísticas
- [x] Contador de proyectos por cliente
- [x] Solo accesible para ADMIN

### 10. Solicitudes de Cotización ⭐
**Estado:** ✅ **COMPLETADO** (Feb 2026)

**Implementado:**
- [x] Formulario público en `/solicitud` (sin autenticación)
- [x] Campos: nombre, email, teléfono, tipo de servicio, descripción, presupuesto estimado
- [x] Validación con Zod + react-hook-form
- [x] API POST pública — cualquier visitante puede enviar
- [x] Panel admin en `/solicitudes` con tabla y filtros por estado
- [x] Chips de color según estado (PENDING/REVIEWED/CONVERTED/REJECTED)
- [x] Vista detalle en `/solicitudes/[id]` con:
  - Selector de cambio de estado
  - Campo de notas internas (solo admin)
  - Botón "Crear Proyecto" desde la solicitud
- [x] Modelo `QuoteRequest` en Prisma con enum `QuoteStatus`
- [x] Ítem "Solicitudes" en Sidebar (adminOnly)
- [x] Botón "Solicitar Cotización" como CTA principal en landing page

### 9. Galería de Imágenes ⭐
**Estado:** ✅ **COMPLETADO**

**Implementado:**
- [x] Vista de todas las imágenes de proyectos
- [x] Búsqueda por nombre de proyecto
- [x] Filtro por proyecto específico
- [x] Ordenamiento por fecha
- [x] Grid responsive (1-4 columnas)
- [x] Lightbox con navegación (teclado y mouse)
- [x] Descarga de imágenes
- [x] Links a proyectos
- [x] Respeta permisos por rol

## 🔧 Configuración Técnica Importante

### Variables de Entorno Configuradas

**Desarrollo Local (.env.local):**
```env
# Database - Supabase
DATABASE_URL="postgresql://postgres.tlsybwdkzoclltwvetml:oehgwv1cMDkUvi3t@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_SECRET="vertical-ingenieria-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (CONFIGURADO ✅)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dwcejjfli"
CLOUDINARY_API_KEY="365675144951949"
CLOUDINARY_API_SECRET="kAx6nYattBoQssfwj48_ycAeHGM"
```

**Producción (Vercel):**
```env
# Database - Supabase con pooling
DATABASE_URL="postgresql://postgres.tlsybwdkzoclltwvetml:oehgwv1cMDkUvi3t@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_SECRET="<generado-con-openssl>"
NEXTAUTH_URL="https://vertical-ingenieria.vercel.app"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dwcejjfli"
CLOUDINARY_API_KEY="365675144951949"
CLOUDINARY_API_SECRET="kAx6nYattBoQssfwj48_ycAeHGM"
```

**Para Migraciones (.env):**
```env
# Usar conexión directa (puerto 5432) para prisma db push
DATABASE_URL="postgresql://postgres.tlsybwdkzoclltwvetml:oehgwv1cMDkUvi3t@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

**Nota:**
- Usar puerto **6543 con pgbouncer** para la aplicación (development y production)
- Usar puerto **5432 sin pgbouncer** para migraciones de Prisma

### Comandos Importantes
```bash
# Setup inicial
npm install
npx prisma generate
npm run db:push
npm run db:seed

# Desarrollo
npm run dev

# Prisma Studio (ver/editar DB)
npm run db:studio

# Build
npm run build

# Limpiar caché (si hay errores de build)
rm -rf .next && npm run build
```

### Base de Datos Configurada
- **Motor:** PostgreSQL (Supabase)
- **Host:** aws-1-sa-east-1.pooler.supabase.com
- **Puertos:**
  - 6543 (pooling con pgbouncer) - Para aplicación
  - 5432 (conexión directa) - Para migraciones
- **Nombre DB:** postgres
- **Estado:** ✅ Desplegada en Supabase, migrada y con datos de prueba

## 📊 Modelos de Base de Datos Principales

### User
- id, name, email, password, phone, role, image
- Roles: ADMIN | WORKER | CLIENT
- Relaciones: projectsAsClient, projectsAsWorker, comments, notifications

### Project
- id, title, description, location, clientId
- status: PENDING | IN_PROGRESS | PAUSED | COMPLETED | CANCELLED
- currentPhase: MEASUREMENT | DESIGN | APPROVAL | INSTALLATION | FINISHING | DELIVERY
- progress (0-100%), startDate, estimatedEndDate, budget
- Relaciones: client, workers, images, comments, phases, notifications

### ProjectImage
- id, projectId, url, publicId, description, phase, uploadedBy
- Relación: project

### Comment
- id, projectId, userId, content, createdAt
- Relaciones: project, user

### Notification
- id, userId, projectId, title, message, read
- Relaciones: user, project

### QuoteRequest
- id, name, email, phone, serviceType, description, estimatedBudget
- status: PENDING | REVIEWED | CONVERTED | REJECTED
- adminNotes (notas internas), createdAt, updatedAt

## 🎯 Decisiones Técnicas Tomadas

1. **Next.js 15.5.9 con App Router** (downgrade de 16.1.1 por compatibilidad con Vercel)
2. **React 18.3.1** (downgrade de 19 por compatibilidad con Next.js 15)
3. **Tailwind CSS 4.1.18** con @tailwindcss/postcss
4. **Prisma 6.19.1** como ORM
5. **NextAuth 4.24.13** para autenticación
6. **Cloudinary** para imágenes (signed upload)
7. **PostgreSQL en Supabase** con connection pooling (pgbouncer)
8. **bcryptjs** para hash de contraseñas
9. **Zod 4.2.1** para validación
10. **React Hot Toast 2.6.0** para notificaciones
11. **Diseño Moderno Minimalista** - Gradientes, shadows sutiles, hover effects
12. **Vercel** para hosting con deployment automático desde GitHub

## 🐛 Problemas Resueltos

### Desarrollo
1. ✅ Tailwind CSS v4 requiere @tailwindcss/postcss
2. ✅ next.config.ts deprecation de images.domains
3. ✅ Middleware deprecated en Next.js 16
4. ✅ Next.js 15+ params async en dynamic routes
5. ✅ ZodError.errors no existe en Zod 4.x
6. ✅ PostgreSQL authentication
7. ✅ Cloudinary "Unknown API key" - Corregido cloud name
8. ✅ Cloudinary upload - Cambiado a signed upload
9. ✅ Progress field validation - Conversión string a number
10. ✅ Zod enum errorMap syntax
11. ✅ bcrypt vs bcryptjs - Usando bcryptjs
12. ✅ ProjectImage uploadedBy relation - Ajustado a String
13. ✅ Turbopack cache issues - Limpiar .next

### Deployment en Vercel
14. ✅ **Routes manifest error con Next.js 16.1.1** - Downgrade a Next.js 15.5.9
15. ✅ **React 19 incompatible con Next.js 15** - Downgrade a React 18.3.1
16. ✅ **ESLint error bloqueando build** - Cambio de `let` a `const` en projectFilter
17. ✅ **CVE-2025-66478 en Next.js 15.1.3** - Upgrade a Next.js 15.5.9 (versión segura)
18. ✅ **Prisma db push colgado con pgbouncer** - Usar puerto 5432 para migraciones
19. ✅ **Supabase connection pooling** - Puerto 6543 para app, 5432 para migraciones
20. ✅ **Zod v4 required_error deprecado** - Reemplazado por `message` en schemas de enums
21. ✅ **Next.js 15 params async en API routes** - `await params` en route handlers dinámicos

## 📝 Próximos Pasos Recomendados

### Funcionalidades Completadas ✅ (100% del MVP + extras)
- [x] Sistema de autenticación con roles
- [x] Base de datos PostgreSQL configurada
- [x] Sistema completo de carga de imágenes
- [x] CRUD completo de proyectos
- [x] Sistema de comentarios
- [x] Sistema de notificaciones
- [x] Dashboard con datos reales
- [x] Filtros y búsqueda en proyectos
- [x] Gestión de usuarios
- [x] Gestión de clientes
- [x] Galería de imágenes
- [x] **Solicitudes de cotización** (formulario público + panel admin)

### Pendiente de Implementar (Opcional)

#### 1. Reportes y Estadísticas
- [ ] Página de reportes con gráficos
- [ ] Exportar a PDF/Excel
- [ ] Filtros por rango de fechas
- [ ] Gráficos de progreso temporal

#### 2. Configuración de Usuario
- [ ] Página de configuración personal
- [ ] Cambio de contraseña
- [ ] Actualizar foto de perfil
- [ ] Preferencias de notificaciones

#### 3. Mejoras de UX
- [ ] Paginación en listas largas
- [ ] Infinite scroll en galería
- [ ] Búsqueda avanzada
- [ ] Exportar datos

## 🎨 Credenciales de Prueba

**Aplicación en Vivo:** [https://vertical-ingenieria.vercel.app](https://vertical-ingenieria.vercel.app)

**Admin:**
- Email: `admin@vertical.com`
- Password: `password123`
- Rol: ADMIN (acceso completo)

**Workers:**
- Email: `carlos@vertical.com` / Password: `password123`
- Email: `ana@vertical.com` / Password: `password123`
- Rol: WORKER (puede gestionar proyectos asignados)

**Clientes:**
- Email: `juan@cliente.com` / Password: `password123`
- Email: `maria@cliente.com` / Password: `password123`
- Rol: CLIENT (solo ve sus proyectos)

> **Nota:** Todos los usuarios usan la contraseña `password123`

## 💡 Ideas Futuras

- Chat en tiempo real
- Aplicación móvil (React Native)
- Calendario de actividades
- Comparador antes/después de fotos
- Firma digital de aprobación
- QR code por proyecto
- Geolocalización de fotos
- Modo offline para trabajadores

## 🚀 Estado del Build

- ✅ Build exitoso sin errores
- ✅ TypeScript configurado correctamente
- ✅ ESLint funcionando
- ✅ Todos los componentes compilando
- ✅ No hay warnings críticos

## 📞 Estado del Proyecto - Resumen Ejecutivo

### 📊 Progreso del MVP
- **Infraestructura:** 100% ✅
- **Autenticación:** 100% ✅
- **Base de Datos:** 100% ✅
- **Upload de Imágenes:** 100% ✅
- **CRUD Proyectos:** 100% ✅
- **Comentarios:** 100% ✅
- **Notificaciones:** 100% ✅
- **Dashboard:** 100% ✅
- **Filtros y Búsqueda:** 100% ✅
- **Gestión de Usuarios:** 100% ✅
- **Gestión de Clientes:** 100% ✅
- **Galería:** 100% ✅
- **Solicitudes de Cotización:** 100% ✅
- **Deployment:** 100% ✅

**Progreso general del MVP: 100%** ✅
**Estado:** ✅ **DESPLEGADO EN PRODUCCIÓN**

### 🎯 Funcionalidades Core Completadas

1. ✅ **Autenticación y Roles** - Sistema completo con NextAuth
2. ✅ **Gestión de Proyectos** - CRUD completo con validaciones
3. ✅ **Carga de Imágenes** - Cloudinary con progress y validación
4. ✅ **Comentarios** - Sistema completo con edición/eliminación
5. ✅ **Notificaciones** - Auto-generadas con panel interactivo
6. ✅ **Dashboard** - Estadísticas en tiempo real
7. ✅ **Búsqueda y Filtros** - Múltiples criterios combinables
8. ✅ **Gestión de Usuarios** - Panel admin completo
9. ✅ **Gestión de Clientes** - Vista especializada para clientes
10. ✅ **Galería** - Vista unificada de todas las imágenes
11. ✅ **Solicitudes de Cotización** - Formulario público + panel admin con gestión de estados

### Archivos Clave del Proyecto:
- `prisma/schema.prisma` - Estructura de datos
- `lib/auth.ts` - Configuración de autenticación
- `lib/cloudinary.ts` - Helper de Cloudinary
- `lib/upload.ts` - Helper de upload frontend
- `lib/validations/` - Schemas de validación Zod
- `lib/notifications.ts` - Sistema de notificaciones
- `lib/validations/quoteRequest.ts` - Schema Zod de solicitudes
- `components/` - Componentes reutilizables
- `app/` - Páginas y API routes
- `.env.local` y `.env` - Variables de entorno

---

**Última actualización:** 2026-03-03
**Versión del proyecto:** 1.1.0
**Estado:** ✅ **DESPLEGADO EN PRODUCCIÓN**
**URL:** [https://vertical-ingenieria.vercel.app](https://vertical-ingenieria.vercel.app)
**Stack:** Next.js 15.5.9 + React 18.3.1 + PostgreSQL (Supabase) + Vercel
