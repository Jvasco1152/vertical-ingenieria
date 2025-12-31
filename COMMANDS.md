# Comandos Útiles - Vertical Ingeniería

## Desarrollo

### Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre http://localhost:3000

### Build para producción
```bash
npm run build
```

### Iniciar en modo producción
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Base de Datos (Prisma)

### Generar cliente de Prisma
```bash
npx prisma generate
```
Ejecutar después de cambiar `schema.prisma`

### Aplicar cambios del schema a la DB
```bash
npm run db:push
# o
npx prisma db push
```

### Abrir Prisma Studio (GUI)
```bash
npm run db:studio
# o
npx prisma studio
```
Abre http://localhost:5555

### Crear migración
```bash
npx prisma migrate dev --name nombre_migracion
```
Usa en producción en lugar de `db push`

### Aplicar migraciones en producción
```bash
npx prisma migrate deploy
```

### Reset completo de la base de datos
```bash
npx prisma migrate reset
```
⚠️ CUIDADO: Borra todos los datos

### Ejecutar seed (datos de prueba)
```bash
npm run db:seed
# o
npx prisma db seed
```

### Ver estado de migraciones
```bash
npx prisma migrate status
```

### Formatear schema de Prisma
```bash
npx prisma format
```

## Git

### Inicializar repositorio
```bash
git init
git add .
git commit -m "Initial commit"
```

### Conectar con repositorio remoto
```bash
git remote add origin <url-del-repositorio>
git push -u origin main
```

### Crear nueva rama
```bash
git checkout -b feature/nombre-feature
```

### Cambiar de rama
```bash
git checkout main
```

### Commit y push
```bash
git add .
git commit -m "Descripción del cambio"
git push
```

### Ver estado
```bash
git status
```

### Ver historial
```bash
git log --oneline
```

### Pull últimos cambios
```bash
git pull
```

## npm / Node

### Instalar dependencia
```bash
npm install nombre-paquete
```

### Instalar dependencia de desarrollo
```bash
npm install -D nombre-paquete
```

### Desinstalar paquete
```bash
npm uninstall nombre-paquete
```

### Actualizar dependencias
```bash
npm update
```

### Ver paquetes desactualizados
```bash
npm outdated
```

### Limpiar caché
```bash
npm cache clean --force
```

### Reinstalar node_modules
```bash
rm -rf node_modules package-lock.json
npm install
```

## Vercel CLI

### Instalar Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy preview
```bash
vercel
```

### Deploy a producción
```bash
vercel --prod
```

### Ver logs
```bash
vercel logs
```

### Pull variables de entorno
```bash
vercel env pull .env.local
```

## PostgreSQL (Local)

### Conectar a PostgreSQL
```bash
psql -U postgres
```

### Crear base de datos
```sql
CREATE DATABASE vertical_db;
```

### Listar bases de datos
```sql
\l
```

### Conectar a una base de datos
```sql
\c vertical_db
```

### Listar tablas
```sql
\dt
```

### Describir tabla
```sql
\d nombre_tabla
```

### Salir de psql
```sql
\q
```

### Backup de base de datos
```bash
pg_dump -U postgres vertical_db > backup.sql
```

### Restaurar backup
```bash
psql -U postgres vertical_db < backup.sql
```

## Docker (Opcional)

### Construir imagen
```bash
docker build -t vertical-app .
```

### Ejecutar contenedor
```bash
docker run -p 3000:3000 vertical-app
```

### Docker Compose (PostgreSQL)
```bash
docker-compose up -d
```

### Ver logs de contenedor
```bash
docker logs <container-id>
```

## Troubleshooting

### Limpiar caché de Next.js
```bash
rm -rf .next
npm run build
```

### Reiniciar todo desde cero
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json

# Limpiar Next.js
rm -rf .next

# Reinstalar
npm install

# Regenerar Prisma
npx prisma generate
```

### Error: "Module not found"
```bash
npm install
npx prisma generate
```

### Error: "Can't reach database"
1. Verifica que PostgreSQL esté corriendo
2. Verifica `.env.local` tiene la URL correcta
3. Verifica que la base de datos existe

### Error al hacer build
```bash
# Limpiar y reconstruir
rm -rf .next
npm run build
```

### Puerto 3000 en uso
```bash
# Encontrar proceso usando puerto 3000
lsof -i :3000

# Matar proceso
kill -9 <PID>

# O usar otro puerto
PORT=3001 npm run dev
```

## Utilidades

### Generar secret para NextAuth
```bash
openssl rand -base64 32
```

### Ver tamaño del bundle
```bash
npm run build
```
Vercel muestra el tamaño de cada route

### Análisis de bundle
```bash
npm install -D @next/bundle-analyzer
```

Luego en `next.config.ts`:
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

Ejecutar:
```bash
ANALYZE=true npm run build
```

## Variables de Entorno

### Ver todas las variables cargadas
```bash
node -e "console.log(process.env)"
```

### Cargar .env.local en terminal
```bash
export $(cat .env.local | xargs)
```

## Prisma con URL dinámica

### Usar diferente base de datos
```bash
DATABASE_URL="postgresql://..." npx prisma db push
```

### Ejecutar seed en producción
```bash
DATABASE_URL="<url-producción>" npm run db:seed
```

## Shortcuts del Proyecto

### Setup completo desde cero
```bash
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

### Actualizar schema y regenerar
```bash
npx prisma db push
npx prisma generate
```

### Deploy completo
```bash
git add .
git commit -m "Update"
git push
# Vercel desplegará automáticamente
```

## Scripts personalizados en package.json

Ya incluidos:
- `npm run dev` - Desarrollo
- `npm run build` - Build
- `npm start` - Producción
- `npm run lint` - ESLint
- `npm run db:push` - Aplicar schema
- `npm run db:seed` - Datos de prueba
- `npm run db:studio` - Prisma Studio

## Tips

### Ejecutar comando en producción (Vercel)
```bash
vercel env pull
DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2) npx prisma db push
```

### Ver qué versión de Node estás usando
```bash
node -v
```

### Cambiar versión de Node (con nvm)
```bash
nvm use 18
```

### TypeScript: Verificar tipos sin build
```bash
npx tsc --noEmit
```

### Pretty print JSON
```bash
echo '{"name":"test"}' | npx prettier --parser json
```

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Vercel](https://vercel.com/docs)
