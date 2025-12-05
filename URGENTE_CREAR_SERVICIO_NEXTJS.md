# 🚨 URGENTE: Crear Servicio Next.js en Render

## ⚠️ PROBLEMA IDENTIFICADO

Estás viendo la aplicación **Flask** (https://iica-chile-plataforma.onrender.com/) que es la versión antigua.

Los cambios que solicitaste (colores IICA, header con logo) están en **Next.js**, que **NO está desplegado aún**.

## ✅ SOLUCIÓN INMEDIATA - PASOS OBLIGATORIOS

### PASO 1: Ir a Render Dashboard
1. Abre: https://dashboard.render.com
2. Inicia sesión

### PASO 2: Verificar si Existe el Servicio Next.js
1. Busca en la lista de servicios: **`iica-licitaciones-frontend`**
2. **SI NO EXISTE** → Continúa con PASO 3
3. **SI EXISTE** → Ve al PASO 6

### PASO 3: Crear Nuevo Web Service (Next.js)
1. Haz clic en **"New +"** (esquina superior derecha)
2. Selecciona **"Web Service"**

### PASO 4: Conectar Repositorio
1. **Connect a repository**: Selecciona tu repositorio `iica-chile-plataforma`
2. Si no aparece, haz clic en **"Configure account"** para dar permisos
3. **Branch**: Selecciona `main`

### PASO 5: Configurar el Servicio Next.js

**Información Básica:**
- **Name**: `iica-licitaciones-frontend`
- **Region**: Elige la más cercana (ej: `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: (dejar vacío)

**Configuración de Build:**
- **Environment**: `Node`
- **Build Command**: `npm ci --prefer-offline --no-audit && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free`

**Variables de Entorno (IMPORTANTE):**
Haz clic en **"Add Environment Variable"** y agrega:

1. **Key**: `NODE_ENV`  
   **Value**: `production`

2. **Key**: `NEXT_PUBLIC_API_URL`  
   **Value**: `https://iica-chile-plataforma.onrender.com`

### PASO 6: Crear y Esperar
1. Haz clic en **"Create Web Service"**
2. Espera 3-5 minutos para que complete el build
3. Render te dará una URL como: `https://iica-licitaciones-frontend.onrender.com`

### PASO 7: Verificar que Funciona
1. Accede a la URL del servicio Next.js
2. **DEBERÍAS VER:**
   - ✅ Header azul-verde con logo IICA oficial
   - ✅ Colores institucionales (#0066cc y #00a651)
   - ✅ Título: "Plataforma de Licitaciones IICA"
   - ✅ Barra de búsqueda
   - ✅ Filtros con colores IICA

## 🔍 VERIFICACIÓN EN LOGS

En **Render Dashboard → iica-licitaciones-frontend → Logs**, deberías ver:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

## ⚠️ SI EL SERVICIO YA EXISTE PERO NO FUNCIONA

1. Ve al servicio `iica-licitaciones-frontend`
2. Ve a **"Manual Deploy"**
3. Haz clic en **"Clear build cache & deploy"**
4. Espera 3-5 minutos

## 📝 RESUMEN

- **URL Flask (antigua)**: https://iica-chile-plataforma.onrender.com/
- **URL Next.js (nueva con cambios)**: https://iica-licitaciones-frontend.onrender.com

**Los cambios están en Next.js, NO en Flask.**

