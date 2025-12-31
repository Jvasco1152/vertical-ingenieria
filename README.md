# Vertical Ingeniería - Sistema de Gestión de Proyectos

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.1-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

Sistema web profesional para la gestión de proyectos de diseño de interiores para ascensores. Permite el seguimiento en tiempo real del progreso mediante fotos, comentarios y actualizaciones, con roles diferenciados para administradores, trabajadores y clientes.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Demo](#-demo)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Deployment](#-deployment)
- [Licencia](#-licencia)

---

## ✨ Características

### 🔐 Autenticación y Seguridad
- Sistema de autenticación robusto con NextAuth.js
- Gestión de roles (ADMIN, WORKER, CLIENT)
- Sesiones seguras con JWT
- Protección de rutas por rol

### 📊 Dashboard Interactivo
- Estadísticas en tiempo real
- Comparativas mes a mes
- Actividad reciente
- Filtros personalizados por rol

### 🏗️ Gestión de Proyectos
- CRUD completo de proyectos
- Estados: Pendiente, En Progreso, Pausado, Completado, Cancelado
- Fases del proyecto: Diseño, Medición, Fabricación, Instalación, Finalización
- Barra de progreso visual
- Asignación de trabajadores
- Vinculación con clientes

### 👥 Gestión de Usuarios
- CRUD de usuarios con validación
- Gestión especializada de clientes
- Tabla con búsqueda y filtros
- Control de permisos por rol
- Prevención de auto-eliminación

### 🖼️ Galería de Imágenes
- Vista unificada de todas las imágenes
- Subida de imágenes a Cloudinary
- Lightbox con navegación por teclado
- Filtros por proyecto
- Descarga de imágenes

### 💬 Sistema de Comentarios
- Comentarios por proyecto
- Vista en tiempo real
- Vinculados a usuarios

### 🔔 Notificaciones
- Panel de notificaciones
- Indicador visual de no leídas
- Tipos: INFO, SUCCESS, WARNING, ERROR
- Marcado de lectura

### 🔍 Búsqueda y Filtros Avanzados
- Búsqueda en tiempo real
- Filtros por estado, fase, cliente
- Ordenamiento personalizado
- Panel de filtros expandible

---

## 🎯 Demo

**Usuario Administrador:**
```
Email: admin@vertical.com
Password: admin123
```

**Usuario Cliente:**
```
Email: cliente@example.com
Password: cliente123
```

**Usuario Trabajador:**
```
Email: worker@vertical.com
Password: worker123
```

> **Nota**: Estos son usuarios de prueba creados con el seed inicial

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16.1.1** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS 4.1.18** - Estilos utility-first
- **Lucide React** - Iconos modernos
- **React Hot Toast** - Notificaciones toast

### Backend
- **Next.js API Routes** - Endpoints REST
- **NextAuth 4.24.13** - Autenticación
- **Prisma 6.19.1** - ORM para base de datos
- **bcryptjs** - Hashing de contraseñas
- **Zod 4.2.1** - Validación de esquemas

### Base de Datos
- **PostgreSQL 18** - Base de datos relacional

### Almacenamiento
- **Cloudinary** - CDN para imágenes

### Herramientas de Desarrollo
- **ESLint** - Linter
- **TypeScript** - Type checking
- **Prisma Studio** - GUI para base de datos

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ instalado
- PostgreSQL 18+ instalado (o cuenta en Supabase/Neon)
- Cuenta de Cloudinary (para subida de imágenes)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jvasco1152/vertical-ingenieria.git
cd vertical-ingenieria
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/vertical_db"

# NextAuth
NEXTAUTH_SECRET="genera-un-secret-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Configurar la Base de Datos

#### Opción A: PostgreSQL Local

```bash
# Crear la base de datos
createdb vertical_db

# Aplicar el schema
npx prisma generate
npx prisma db push
```

#### Opción B: PostgreSQL en la nube

1. Crea una cuenta en [Supabase](https://supabase.com) o [Neon](https://neon.tech)
2. Crea un nuevo proyecto de PostgreSQL
3. Copia la URL de conexión
4. Actualiza `DATABASE_URL` en `.env.local`
5. Ejecuta las migraciones:

```bash
npx prisma generate
npx prisma db push
```

### 5. Seed de datos iniciales

```bash
npm run db:seed
```

Esto creará:
- 1 usuario ADMIN
- 2 usuarios WORKER
- 3 usuarios CLIENT
- 6 proyectos de ejemplo

### 6. Ejecutar el proyecto

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**

---

## 📖 Uso

### Primer Login

1. Abre http://localhost:3000
2. Serás redirigido a `/login`
3. Usa las credenciales de administrador:
   - Email: `admin@vertical.com`
   - Password: `admin123`

### Crear un Nuevo Proyecto

1. Inicia sesión como ADMIN
2. Ve a "Proyectos" → "Nuevo Proyecto"
3. Completa el formulario:
   - Título y descripción
   - Cliente (seleccionar de la lista)
   - Ubicación
   - Estado inicial
   - Fase actual
   - Fecha de inicio
   - Trabajadores asignados
4. Click en "Crear Proyecto"

### Subir Imágenes

1. Abre un proyecto
2. Scroll hasta "Galería de Imágenes"
3. Click en "Subir Imágenes"
4. Arrastra imágenes o selecciona archivos
5. Las imágenes se suben automáticamente a Cloudinary

### Estructura de Roles

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso total: gestión de usuarios, proyectos, clientes, galería |
| **WORKER** | Ver y editar proyectos asignados, subir imágenes |
| **CLIENT** | Ver únicamente sus propios proyectos y galería |

---

## 📁 Estructura del Proyecto

```
vertical-ingenieria/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                # NextAuth endpoints
│   │   ├── cloudinary/          # Cloudinary signing
│   │   ├── comments/            # CRUD de comentarios
│   │   ├── dashboard/           # Estadísticas
│   │   ├── gallery/             # Galería de imágenes
│   │   ├── notifications/       # Notificaciones
│   │   ├── projects/            # CRUD de proyectos
│   │   └── users/               # CRUD de usuarios
│   ├── clients/                 # Gestión de clientes
│   ├── dashboard/               # Dashboard principal
│   ├── gallery/                 # Galería global
│   ├── login/                   # Página de login
│   ├── projects/                # Gestión de proyectos
│   ├── users/                   # Gestión de usuarios
│   ├── layout.tsx               # Layout raíz
│   └── providers.tsx            # Context providers
├── components/                   # Componentes React
│   ├── auth/                    # ProtectedRoute
│   ├── clients/                 # ClientForm
│   ├── comments/                # Comment, CommentForm, CommentList
│   ├── gallery/                 # ImageCard, ImageLightbox
│   ├── layout/                  # Navbar, Sidebar
│   ├── notifications/           # NotificationBell, Panel
│   ├── projects/                # ProjectCard, Form, Filters, Gallery
│   ├── ui/                      # Button y componentes base
│   └── users/                   # UserForm
├── lib/                         # Utilidades y configuración
│   ├── auth.ts                  # NextAuth config
│   ├── cloudinary.ts            # Cloudinary helpers
│   ├── notifications.ts         # Helpers de notificaciones
│   ├── prisma.ts                # Cliente de Prisma
│   ├── upload.ts                # Upload helpers
│   └── validations/             # Schemas de Zod
│       ├── comment.ts
│       ├── image.ts
│       ├── notification.ts
│       ├── project.ts
│       └── user.ts
├── prisma/                      # Prisma ORM
│   ├── schema.prisma            # Modelos de BD
│   └── seed.ts                  # Datos iniciales
├── scripts/                     # Scripts de utilidad
│   ├── check-db.ts
│   ├── test-api.ts
│   └── test-cloudinary.ts
├── types/                       # Tipos de TypeScript
│   └── next-auth.d.ts          # Extensión de tipos NextAuth
├── .env.local.example           # Template de variables
├── next.config.ts               # Configuración Next.js
├── tailwind.config.ts           # Configuración Tailwind
├── tsconfig.json                # Configuración TypeScript
└── package.json                 # Dependencias
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Ejecutar en modo desarrollo (http://localhost:3000)

# Build
npm run build            # Compilar para producción
npm run start            # Ejecutar build de producción

# Linting
npm run lint             # Ejecutar ESLint

# Base de Datos
npm run db:push          # Aplicar schema a la BD
npm run db:seed          # Poblar BD con datos de prueba
npm run db:studio        # Abrir Prisma Studio (GUI)
npm run db:generate      # Generar cliente de Prisma

# Testing
npm run test:api         # Probar endpoints de API
npm run test:db          # Verificar conexión a BD
npm run test:cloudinary  # Probar conexión a Cloudinary
```

---

## 🚢 Deployment

### Vercel (Recomendado)

1. **Conectar repositorio**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Selecciona el proyecto

2. **Configurar variables de entorno**
   - Agrega todas las variables de `.env.local`
   - `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, etc.

3. **Deploy**
   - Click en "Deploy"
   - Vercel automáticamente detecta Next.js y lo configura

4. **Configurar Base de Datos**
   - Usa [Supabase](https://supabase.com) o [Neon](https://neon.tech)
   - Copia la URL de conexión a `DATABASE_URL`
   - Ejecuta: `npx prisma db push`

### Variables de Entorno en Producción

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="tu-secret-de-produccion"
NEXTAUTH_URL="https://tu-dominio.vercel.app"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Servicios Recomendados

- **Hosting**: [Vercel](https://vercel.com) - Deploy automático
- **Base de Datos**: [Supabase](https://supabase.com) o [Neon](https://neon.tech)
- **Imágenes**: [Cloudinary](https://cloudinary.com) - CDN gratuito

---

## 📚 Documentación Adicional

- [QUICK_START.md](QUICK_START.md) - Guía rápida de inicio
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía detallada de deployment
- [COMMANDS.md](COMMANDS.md) - Lista de comandos útiles
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Contexto completo del proyecto
- [ROADMAP.md](ROADMAP.md) - Hoja de ruta de desarrollo

---

## 🤝 Contribuciones

Este es un proyecto privado de Vertical Ingeniería. Para contribuciones o sugerencias, contacta al equipo de desarrollo.

---

## 📝 Licencia

Todos los derechos reservados © 2024 Vertical Ingeniería

Este software es propiedad de Vertical Ingeniería y está protegido por las leyes de derechos de autor. No está permitido su uso, copia, modificación o distribución sin autorización expresa por escrito.

---

## 📧 Contacto

- **Empresa**: Vertical Ingeniería
- **GitHub**: [@Jvasco1152](https://github.com/Jvasco1152)
- **Repositorio**: [vertical-ingenieria](https://github.com/Jvasco1152/vertical-ingenieria)

---

**Desarrollado con ❤️ para Vertical Ingeniería**
