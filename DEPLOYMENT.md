# Guía de Deployment - Vertical Ingeniería

## ✅ Deployment Exitoso en Producción

**URL en vivo:** [https://vertical-ingenieria.vercel.app](https://vertical-ingenieria.vercel.app)

**Stack en Producción:**
- **Frontend/Backend:** Vercel
- **Base de Datos:** Supabase (PostgreSQL)
- **Imágenes:** Cloudinary
- **Framework:** Next.js 15.5.9
- **React:** 18.3.1

**Fecha de deployment:** 2025-12-31

---

## Deployment en Vercel (Recomendado)

Vercel es la plataforma creada por el equipo de Next.js y ofrece el mejor soporte para aplicaciones Next.js.

### Pasos:

1. **Sube tu código a GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <tu-repositorio>
   git push -u origin main
   ```

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Import Project"
   - Conecta tu repositorio de Git
   - Vercel detectará automáticamente que es un proyecto Next.js

3. **Configura las Variables de Entorno**
   En la configuración del proyecto en Vercel, agrega:
   ```
   DATABASE_URL=<tu-url-de-base-de-datos>
   NEXTAUTH_SECRET=<genera-un-secret-seguro>
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
   CLOUDINARY_API_KEY=<tu-api-key>
   CLOUDINARY_API_SECRET=<tu-api-secret>
   ```

4. **Deploy**
   - Vercel desplegará automáticamente
   - Cada push a main desplegará automáticamente

### Generar NEXTAUTH_SECRET seguro:
```bash
openssl rand -base64 32
```

## Base de Datos en Producción

### Opción 1: Supabase (Recomendado - Gratis)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a Settings > Database
3. Copia la "Connection String" (modo Direct, no Pooler)
4. Usa esa URL en `DATABASE_URL` en Vercel

**Ventajas:**
- Tier gratuito generoso
- PostgreSQL completo
- Incluye Storage para imágenes
- Incluye Auth (opcional)

### Opción 2: Neon (Serverless PostgreSQL)

1. Crea cuenta en [neon.tech](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia la connection string
4. Usa en Vercel

**Ventajas:**
- PostgreSQL serverless
- Escala automáticamente
- Tier gratuito

### Opción 3: Railway

1. Crea cuenta en [railway.app](https://railway.app)
2. Crea un nuevo servicio PostgreSQL
3. Obtén la URL de conexión
4. Usa en Vercel

## Ejecutar Migraciones en Producción

Después del primer deploy:

```bash
# Opción 1: Desde tu máquina local
DATABASE_URL="<tu-url-de-producción>" npx prisma db push

# Opción 2: Usando Vercel CLI
vercel env pull .env.production
npx prisma db push

# Poblar con datos iniciales
DATABASE_URL="<tu-url-de-producción>" npm run db:seed
```

## Configurar Cloudinary

Para almacenamiento de imágenes:

1. Crea cuenta en [cloudinary.com](https://cloudinary.com)
2. Ve a Dashboard
3. Copia:
   - Cloud Name
   - API Key
   - API Secret
4. Agrégalos a las variables de entorno en Vercel

## Deployment Manual (VPS/Servidor)

Si prefieres un servidor propio (DigitalOcean, AWS, etc.):

### 1. Preparar el servidor

```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib
```

### 2. Configurar PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE vertical_db;
CREATE USER vertical_user WITH ENCRYPTED PASSWORD 'tu-password';
GRANT ALL PRIVILEGES ON DATABASE vertical_db TO vertical_user;
\q
```

### 3. Clonar y configurar el proyecto

```bash
git clone <tu-repositorio>
cd vertical
npm install
```

### 4. Configurar variables de entorno

```bash
cp .env.local.example .env.local
nano .env.local
# Edita las variables
```

### 5. Ejecutar migraciones

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 6. Build y start

```bash
npm run build
npm start
```

### 7. Configurar PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start npm --name "vertical" -- start
pm2 save
pm2 startup
```

### 8. Configurar Nginx como reverse proxy

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9. Configurar SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## Deployment en Netlify

Aunque Vercel es mejor para Next.js, también puedes usar Netlify:

1. Conecta tu repositorio en [netlify.com](https://netlify.com)
2. Configura build command: `npm run build`
3. Publish directory: `.next`
4. Agrega variables de entorno
5. Deploy

## Checklist Pre-Deployment

- [ ] Variables de entorno configuradas correctamente
- [ ] Base de datos creada y accesible
- [ ] NEXTAUTH_SECRET generado (seguro)
- [ ] NEXTAUTH_URL apunta a tu dominio
- [ ] Cloudinary configurado (si usas imágenes)
- [ ] Ejecutadas migraciones de Prisma
- [ ] Datos iniciales cargados (seed)
- [ ] Build local exitoso (`npm run build`)
- [ ] Pruebas básicas realizadas

## Monitoreo Post-Deployment

### Logs en Vercel
```bash
vercel logs <deployment-url>
```

### Logs en servidor (PM2)
```bash
pm2 logs vertical
```

### Verificar estado de la base de datos
```bash
npx prisma studio
```

## Rollback en caso de problemas

### Vercel
- Ve a deployments
- Selecciona un deployment anterior
- Click en "Promote to Production"

### Servidor propio
```bash
git checkout <commit-anterior>
npm install
npm run build
pm2 restart vertical
```

## Configuración de Dominio Personalizado

### En Vercel:
1. Ve a Settings > Domains
2. Agrega tu dominio
3. Configura los DNS según las instrucciones

### En servidor propio:
1. Apunta el DNS A record a la IP de tu servidor
2. Configura Nginx/Apache según tu dominio
3. Instala SSL con certbot

---

## 🔧 Experiencia Real de Deployment (Problemas y Soluciones)

Esta sección documenta los problemas reales encontrados durante el deployment de este proyecto y cómo se resolvieron.

### Problema 1: Routes Manifest Error con Next.js 16.1.1

**Error:**
```
Error: The file "/vercel/path0/q/routes-manifest.json" couldn't be found.
This is often caused by a misconfiguration in your project.
```

**Causa:** Next.js 16.1.1 tiene incompatibilidades conocidas con la plataforma de deployment de Vercel.

**Intentos fallidos:**
1. ❌ Crear `vercel.json` con configuración custom
2. ❌ Agregar `output: 'standalone'` en `next.config.ts`

**Solución exitosa:**
- Downgrade a Next.js 15.5.9
- Esto también requirió downgrade de React 19 a React 18.3.1

```bash
npm install next@15.5.9 react@18.3.1 react-dom@18.3.1 eslint-config-next@15.5.9
```

---

### Problema 2: React 19 Incompatible con Next.js 15

**Error:**
```
npm error Could not resolve dependency:
npm error peer react@"^18.2.0 || 19.0.0-rc-66855b96-20241106" from next@15.0.3
```

**Causa:** Next.js 15 no soporta completamente React 19.

**Solución:**
```bash
npm install react@^18.3.1 react-dom@^18.3.1
npm install @types/react@^18.3.18 @types/react-dom@^18.3.5
```

---

### Problema 3: ESLint Error Bloqueando Build

**Error:**
```
./app/api/dashboard/stats/route.ts
24:9  Error: 'projectFilter' is never reassigned. Use 'const' instead.  prefer-const
```

**Causa:** Next.js 15 tiene reglas de ESLint más estrictas que bloquean el build.

**Solución:** Cambiar declaración de variable en `app/api/dashboard/stats/route.ts:24`
```typescript
// Antes:
let projectFilter: any = {};

// Después:
const projectFilter: any = {};
```

---

### Problema 4: CVE-2025-66478 Security Vulnerability

**Error:**
```
Error: Vulnerable version of Next.js detected, please update immediately.
Learn More: https://vercel.link/CVE-2025-66478
```

**Causa:** Next.js versiones 15.0.3 hasta 15.5.8 contienen una vulnerabilidad de seguridad.

**Solución:** Upgrade a Next.js 15.5.9 (versión parchada)
```bash
npm install next@15.5.9 eslint-config-next@15.5.9
```

**Verificación:**
```bash
npm audit
# found 0 vulnerabilities
```

---

### Problema 5: Prisma db push Colgado con pgbouncer

**Síntoma:** El comando `npx prisma db push` se cuelga indefinidamente.

**Causa:** Connection pooler (pgbouncer) de Supabase en puerto 6543 no es compatible con operaciones de migración de Prisma.

**Solución:** Usar dos connection strings diferentes:

**Para migraciones (.env):**
```env
# Puerto 5432 - Conexión directa SIN pgbouncer
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

**Para la aplicación (.env.local y Vercel):**
```env
# Puerto 6543 - Conexión con pooling CON pgbouncer
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Comandos:**
```bash
# Migraciones (usar .env con puerto 5432)
npx prisma db push

# Seed (usar .env con puerto 5432)
npm run db:seed
```

---

### Problema 6: Credenciales de Prueba Incorrectas

**Síntoma:** Las credenciales documentadas inicialmente no funcionaban.

**Causa:** La documentación inicial mostraba contraseñas incorrectas (ej: `admin123`, `worker123`) cuando el seed real usa `password123` para todos los usuarios.

**Solución:** Actualizar toda la documentación con las credenciales correctas del archivo `prisma/seed.ts`:
- Todos los usuarios usan: `password123`

---

## 📋 Checklist de Deployment Verificado

Este es el checklist que se siguió para el deployment exitoso:

- [x] Variables de entorno configuradas en Vercel
- [x] Base de datos Supabase creada y accesible
- [x] NEXTAUTH_SECRET generado (usando https://generate-secret.vercel.app/32)
- [x] NEXTAUTH_URL apunta a https://vertical-ingenieria.vercel.app
- [x] Cloudinary configurado con credenciales correctas
- [x] Migraciones ejecutadas con conexión directa (puerto 5432)
- [x] Seed ejecutado con datos de prueba
- [x] Build local exitoso sin errores
- [x] Next.js 15.5.9 (versión segura sin CVE)
- [x] React 18.3.1 (compatible con Next.js 15)
- [x] ESLint configurado correctamente
- [x] Deployment exitoso en Vercel
- [x] Aplicación funcionando en producción

---

## 🎯 Recomendaciones Basadas en Experiencia

### 1. Versiones de Dependencias

**Usar estas versiones verificadas:**
```json
{
  "dependencies": {
    "next": "^15.5.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@prisma/client": "^6.19.1",
    "next-auth": "^4.24.13"
  },
  "devDependencies": {
    "prisma": "^6.19.1",
    "eslint-config-next": "^15.5.9",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5"
  }
}
```

### 2. Supabase Database URLs

Siempre mantener DOS variables:
- Puerto 5432 (directo) para migraciones
- Puerto 6543 (pooling) para la aplicación

### 3. Next.js Versions

❌ **Evitar:**
- Next.js 16.x (incompatible con Vercel actualmente)
- React 19 (incompatible con Next.js 15)
- Next.js 15.0.3 - 15.5.8 (tienen CVE-2025-66478)

✅ **Usar:**
- Next.js 15.5.9 o superior
- React 18.3.1
- ESLint strict mode enabled

### 4. Build Local Primero

Siempre probar el build localmente antes de deployar:
```bash
npm run build
```

Si hay errores, no deployar hasta resolverlos.

### 5. Verificar Seguridad

Antes de cada deploy:
```bash
npm audit
```

Resolver todas las vulnerabilidades críticas.

## Optimizaciones Post-Deployment

1. **Habilitar compresión**
   - Vercel lo hace automáticamente
   - En servidor: configurar gzip en Nginx

2. **CDN para imágenes**
   - Cloudinary ya incluye CDN
   - Vercel también optimiza imágenes automáticamente

3. **Monitoring**
   - [Sentry](https://sentry.io) para error tracking
   - [LogRocket](https://logrocket.com) para session replay
   - Vercel Analytics (incluido)

## Backup de Base de Datos

```bash
# Supabase: Backups automáticos incluidos

# PostgreSQL manual:
pg_dump -U vertical_user vertical_db > backup.sql

# Restaurar:
psql -U vertical_user vertical_db < backup.sql
```

## Soporte

Para problemas de deployment:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
