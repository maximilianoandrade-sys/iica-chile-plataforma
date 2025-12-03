# 🚨 SOLUCIÓN: Deploy de Next.js en Render

## ⚠️ PROBLEMA IDENTIFICADO

Render NO está detectando automáticamente el nuevo servicio Next.js desde `render.yaml`. Necesitas crearlo manualmente.

## ✅ SOLUCIÓN PASO A PASO

### OPCIÓN 1: Crear Servicio Next.js Manualmente (RECOMENDADO)

1. **Ir a Render Dashboard**
   - Abre: https://dashboard.render.com
   - Inicia sesión

2. **Crear Nuevo Web Service**
   - Haz clic en **"New +"** (esquina superior derecha)
   - Selecciona **"Web Service"**

3. **Conectar Repositorio**
   - Si no está conectado, conecta tu repositorio de GitHub
   - Selecciona: `iica-chile-plataforma` (tu repositorio)
   - Branch: `main`

4. **Configurar el Servicio Next.js**
   
   **Información Básica:**
   - **Name**: `iica-licitaciones-frontend`
   - **Region**: Elige la más cercana
   - **Branch**: `main`
   - **Root Directory**: (dejar vacío)

   **Configuración de Build:**
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. **Variables de Entorno**
   Agrega estas variables:
   - **Key**: `NODE_ENV` → **Value**: `production`
   - **Key**: `NEXT_PUBLIC_API_URL` → **Value**: `https://iica-chile-plataforma.onrender.com`

6. **Crear Servicio**
   - Haz clic en **"Create Web Service"**
   - Espera 3-5 minutos para que complete el build

7. **Verificar Deploy**
   - Una vez completado, Render te dará una URL como:
     `https://iica-licitaciones-frontend.onrender.com`
   - Accede a esa URL y deberías ver:
     ✅ Header con logo IICA
     ✅ Colores institucionales (#0066cc y #00a651)
     ✅ Plataforma de búsqueda de licitaciones

### OPCIÓN 2: Verificar si Render Detectó render.yaml

1. **Ir a Render Dashboard**
   - Ve a: https://dashboard.render.com

2. **Verificar Servicios Existentes**
   - Deberías ver:
     - `iica-chile-plataforma` (Flask - ya existe)
     - `iica-licitaciones-frontend` (Next.js - debería aparecer automáticamente)

3. **Si NO aparece el servicio Next.js:**
   - Sigue la **OPCIÓN 1** para crearlo manualmente

4. **Si SÍ aparece pero no funciona:**
   - Ve al servicio `iica-licitaciones-frontend`
   - Ve a **"Manual Deploy"** → **"Clear build cache & deploy"**
   - Espera 3-5 minutos

## 🔍 VERIFICACIÓN POST-DEPLOY

### 1. Verificar Build Exitoso
En **Render Dashboard → Logs** del servicio Next.js, deberías ver:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

### 2. Verificar URL
- **Flask API**: https://iica-chile-plataforma.onrender.com
- **Next.js Frontend**: https://iica-licitaciones-frontend.onrender.com

### 3. Verificar en el Navegador
Al acceder a la URL de Next.js, deberías ver:
- ✅ Header azul-verde con logo IICA oficial
- ✅ Título: "Plataforma de Licitaciones IICA"
- ✅ Barra de búsqueda
- ✅ Filtros (Ubicación, Sector, Estado)
- ✅ Tarjetas de licitaciones con colores IICA

## ⚠️ SI SIGUE SIN FUNCIONAR

### Verificar Logs de Build
1. Ve a **Render Dashboard** → **iica-licitaciones-frontend** → **Logs**
2. Busca errores en rojo
3. Errores comunes:
   - `Module not found` → Verifica que `package.json` tenga todas las dependencias
   - `Build failed` → Verifica que Node.js 18+ esté configurado

### Verificar Variables de Entorno
1. Ve a **Settings** → **Environment**
2. Verifica que existan:
   - `NODE_ENV = production`
   - `NEXT_PUBLIC_API_URL = https://iica-chile-plataforma.onrender.com`

### Forzar Re-Deploy
1. Ve a **Manual Deploy**
2. Haz clic en **"Clear build cache & deploy"**
3. Espera 3-5 minutos

## 📝 NOTAS IMPORTANTES

- **Render Free Plan**: Los servicios pueden tardar en iniciar (hasta 50 segundos)
- **Auto-Deploy**: Render detecta cambios automáticamente después del primer deploy manual
- **Caché**: Si no ves cambios, limpia el caché del navegador (`Ctrl + Shift + R`)

## 🎯 RESULTADO ESPERADO

Después de seguir estos pasos:
- ✅ Servicio Next.js desplegado en Render
- ✅ URL pública funcionando
- ✅ Header IICA con logo y colores institucionales
- ✅ Conexión con API Flask funcionando
- ✅ Plataforma de búsqueda completamente funcional

