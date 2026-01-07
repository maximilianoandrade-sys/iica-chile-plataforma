# Guía de Deploy en Render

## Configuración Automática (Recomendado)

### Paso 1: Subir código a GitHub
1. Crea un nuevo repositorio en GitHub
2. Sube todos los archivos del proyecto
3. Asegúrate de que `render.yaml` esté en la raíz

### Paso 2: Crear servicio en Render
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **New** → **Blueprint**
3. Conecta tu repositorio de GitHub
4. Render detectará automáticamente `render.yaml` y configurará todo

### Paso 3: Configurar Base de Datos
1. Render creará automáticamente una base de datos PostgreSQL
2. Copia la `DATABASE_URL` de la base de datos creada
3. Ve a tu servicio web → **Environment**
4. Agrega la variable `DATABASE_URL` con el valor copiado

### Paso 4: Deploy
1. Render iniciará el deploy automáticamente
2. El build incluirá:
   - Instalación de dependencias
   - Generación del cliente Prisma
   - Migración de base de datos
   - Build de Next.js

## Configuración Manual

Si prefieres configurar manualmente:

### 1. Crear Base de Datos PostgreSQL
- **New** → **PostgreSQL**
- Nombre: `iica-plataforma-db`
- Plan: Free
- Copia la **Internal Database URL**

### 2. Crear Web Service
- **New** → **Web Service**
- Conecta tu repositorio de GitHub
- Configuración:
  - **Name**: `iica-plataforma`
  - **Environment**: `Node`
  - **Build Command**: 
```bash
    npm install && npx prisma generate && npx prisma db push && npm run build
    ```
  - **Start Command**: 
```bash
    npm start
    ```
  - **Environment Variables**:
    - `DATABASE_URL`: (Pega la Internal Database URL de PostgreSQL)
    - `NODE_ENV`: `production`

### 3. Deploy
- Click en **Manual Deploy** → **Deploy latest commit**
- Espera a que termine el build (puede tardar 5-10 minutos la primera vez)

## Verificación Post-Deploy

1. Verifica que la aplicación cargue correctamente
2. Revisa los logs en Render Dashboard
3. Verifica que la base de datos tenga datos:
   - Puedes usar el script `npm run scrape` para poblar datos

## Solución de Problemas

### Error: "Prisma Client not generated"
- Verifica que `postinstall` script esté en package.json
- Revisa los logs de build en Render

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté configurada correctamente
- Asegúrate de usar la **Internal Database URL** (no la External)

### Error: "Build timeout"
- El build puede tardar, especialmente la primera vez
- Considera usar un plan superior si persiste

### Error: "Module not found"
- Verifica que todas las dependencias estén en `package.json`
- Revisa que `node_modules` esté en `.gitignore`

## URLs Importantes

- **Dashboard Render**: https://dashboard.render.com
- **Documentación Render**: https://render.com/docs
- **Prisma con PostgreSQL**: https://www.prisma.io/docs/concepts/database-connectors/postgresql
