# Vertical Ingeniería - Sistema de Gestión de Proyectos

Sistema web para gestión de proyectos de diseño de interiores para ascensores, permitiendo el seguimiento en tiempo real del progreso mediante fotos y actualizaciones.

## Características

- **Sistema de Autenticación**: Login seguro con roles (Admin, Trabajador, Cliente)
- **Dashboard Interactivo**: Vista general de proyectos y estadísticas
- **Gestión de Proyectos**: CRUD completo de proyectos con diferentes fases
- **Galería de Fotos**: Los trabajadores pueden subir fotos del progreso
- **Timeline de Progreso**: Seguimiento visual del avance del proyecto
- **Sistema de Roles**: Diferentes permisos según el tipo de usuario
- **Notificaciones**: Alertas para clientes cuando hay actualizaciones

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js
- **Almacenamiento**: Cloudinary (para imágenes)
- **UI**: Lucide React (iconos) + React Hot Toast (notificaciones)

## Estructura del Proyecto

```
vertical/
├── app/                      # App Router de Next.js
│   ├── api/                  # API Routes
│   │   └── auth/            # NextAuth endpoints
│   ├── dashboard/           # Dashboard principal
│   ├── projects/            # Gestión de proyectos
│   ├── login/               # Página de login
│   └── layout.tsx           # Layout raíz
├── components/              # Componentes React
│   ├── ui/                  # Componentes UI reutilizables
│   ├── layout/              # Navbar, Sidebar, etc.
│   ├── projects/            # Componentes de proyectos
│   └── dashboard/           # Componentes del dashboard
├── lib/                     # Utilidades y configuración
│   ├── prisma.ts           # Cliente de Prisma
│   └── auth.ts             # Configuración de NextAuth
├── prisma/                  # Esquema y migraciones de Prisma
│   └── schema.prisma       # Modelos de base de datos
└── types/                   # Tipos de TypeScript

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd vertical
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.local.example` a `.env.local` y configura las variables:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/vertical_db"

# NextAuth
NEXTAUTH_SECRET="tu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 4. Configurar la Base de Datos

#### Opción A: PostgreSQL Local

Instala PostgreSQL y crea una base de datos:

```bash
createdb vertical_db
```

#### Opción B: PostgreSQL en la nube (Supabase/Neon)

1. Crea una cuenta en [Supabase](https://supabase.com) o [Neon](https://neon.tech)
2. Crea un nuevo proyecto y obtén la URL de conexión
3. Actualiza `DATABASE_URL` en `.env.local`

### 5. Ejecutar migraciones de Prisma

```bash
npx prisma generate
npx prisma db push
```

### 6. (Opcional) Seed de datos de prueba

Crea un archivo `prisma/seed.ts` con usuarios y proyectos de ejemplo y ejecútalo:

```bash
npx prisma db seed
```

### 7. Ejecutar el proyecto

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Uso

### Crear un usuario administrador

Para crear el primer usuario, puedes usar Prisma Studio:

```bash
npx prisma studio
```

O crear un endpoint temporal en `app/api/seed/route.ts` para crear usuarios iniciales.

### Estructura de Roles

- **ADMIN**: Acceso total, gestión de usuarios y proyectos
- **WORKER**: Puede subir fotos y actualizar el progreso de proyectos asignados
- **CLIENT**: Puede ver el progreso de sus proyectos

## Próximas Funcionalidades

- [ ] Sistema de carga de imágenes con Cloudinary
- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat entre cliente y equipo de trabajo
- [ ] Exportación de reportes PDF
- [ ] Sistema de cotizaciones
- [ ] Calendario de actividades
- [ ] Modo offline para trabajadores
- [ ] Aplicación móvil (React Native)

## Scripts Disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Compilar para producción
npm run start        # Ejecutar en producción
npm run lint         # Ejecutar ESLint
```

## Comandos Prisma Útiles

```bash
npx prisma studio              # Abrir Prisma Studio (GUI)
npx prisma generate            # Generar cliente de Prisma
npx prisma db push             # Aplicar cambios al schema
npx prisma migrate dev         # Crear migración
npx prisma migrate deploy      # Aplicar migraciones en producción
```

## Deployment

### Vercel (Recomendado para Next.js)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Configuración de Base de Datos en Producción

Usa servicios como:
- [Supabase](https://supabase.com) - PostgreSQL + Storage + Auth
- [Neon](https://neon.tech) - PostgreSQL serverless
- [Railway](https://railway.app) - PostgreSQL + Deployment

## Soporte

Para soporte o preguntas, contacta a: [email]

## Licencia

Todos los derechos reservados - Vertical Ingeniería 2024
