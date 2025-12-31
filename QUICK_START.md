# Guía de Inicio Rápido - Vertical Ingeniería

## Pasos para Ejecutar el Proyecto

### 1. Configurar Base de Datos

Tienes dos opciones:

#### Opción A: PostgreSQL Local (Requiere instalación de PostgreSQL)
```bash
# Crear la base de datos
createdb vertical_db
```

#### Opción B: Base de Datos en la Nube (RECOMENDADO - Más fácil)

**Usando Supabase (Gratis):**
1. Ve a https://supabase.com
2. Crea una cuenta gratis
3. Crea un nuevo proyecto
4. En Settings > Database, copia la "Connection String" (modo Direct)
5. Pega la URL en `.env.local` en la variable `DATABASE_URL`

**Ejemplo de URL de Supabase:**
```
DATABASE_URL="postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT].supabase.co:5432/postgres"
```

### 2. Configurar Variables de Entorno

Asegúrate de que el archivo `.env.local` existe y tiene esta configuración:

```env
# Database - Reemplaza con tu URL de Supabase o PostgreSQL local
DATABASE_URL="postgresql://postgres:password@localhost:5432/vertical_db"

# NextAuth - Ya está configurado, no necesitas cambiarlo para desarrollo
NEXTAUTH_SECRET="vertical-ingenieria-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generar Cliente de Prisma y Crear Tablas

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npm run db:push
```

### 4. Poblar la Base de Datos con Datos de Prueba

```bash
npm run db:seed
```

Esto creará usuarios y proyectos de ejemplo.

### 5. Ejecutar el Proyecto

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales para login:

**Password para todos: `password123`**

- **Admin**: admin@vertical.com
- **Trabajador 1**: carlos@vertical.com
- **Trabajador 2**: ana@vertical.com
- **Cliente 1**: juan@cliente.com
- **Cliente 2**: maria@cliente.com

## Rutas Disponibles

- `/` - Página de inicio
- `/login` - Login
- `/dashboard` - Dashboard (requiere autenticación)
- `/projects` - Lista de proyectos (requiere autenticación)
- `/projects/[id]` - Detalle de proyecto (requiere autenticación)

## Herramientas Útiles

### Prisma Studio (GUI para ver la base de datos)
```bash
npm run db:studio
```

Esto abrirá una interfaz visual en http://localhost:5555 donde podrás ver y editar los datos.

## Solución de Problemas

### Error: "Can't reach database server"
- Verifica que PostgreSQL esté corriendo (si es local)
- Verifica que la URL en `.env.local` sea correcta
- Si usas Supabase, verifica que el proyecto esté activo

### Error: "Invalid `prisma.user.findUnique()`"
- Ejecuta: `npx prisma generate`
- Luego: `npm run db:push`

### Error al hacer login
- Verifica que hayas ejecutado el seed: `npm run db:seed`
- Verifica que `NEXTAUTH_SECRET` esté configurado en `.env.local`

## Próximos Pasos

1. **Configurar Cloudinary** para subida de imágenes:
   - Crea cuenta en https://cloudinary.com
   - Copia las credenciales a `.env.local`

2. **Personalizar la aplicación**:
   - Modifica los colores en `tailwind.config.ts`
   - Agrega tu logo en `public/`
   - Personaliza los textos según tus necesidades

3. **Agregar más funcionalidades**:
   - Sistema de notificaciones en tiempo real
   - Chat entre cliente y trabajadores
   - Exportación de reportes
   - Sistema de cotizaciones

## Comandos Útiles

```bash
npm run dev           # Ejecutar en desarrollo
npm run build         # Compilar para producción
npm run db:push       # Aplicar cambios del schema a la DB
npm run db:seed       # Poblar con datos de prueba
npm run db:studio     # Abrir Prisma Studio
npx prisma migrate dev   # Crear migración (producción)
```

## Soporte

Si tienes problemas, verifica:
1. Que todas las dependencias estén instaladas: `npm install`
2. Que la base de datos esté corriendo y accesible
3. Que las variables de entorno estén configuradas
4. Los logs en la terminal cuando ejecutas `npm run dev`
