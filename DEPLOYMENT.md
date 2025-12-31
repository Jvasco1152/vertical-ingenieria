# Guía de Deployment - Vertical Ingeniería

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
