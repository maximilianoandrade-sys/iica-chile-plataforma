# 🚀 INSTRUCCIONES PARA ACTUALIZAR DESPLIEGUE EN RENDER

## ⚠️ PROBLEMA IDENTIFICADO

El `render.yaml` estaba configurado para Next.js, pero el servicio desplegado es Flask. Esto causaba que los cambios no se reflejaran.

## ✅ SOLUCIÓN APLICADA

1. **render.yaml corregido** - Ahora apunta al servicio Flask correcto
2. **CORS agregado** - Para permitir que la API sea consumida desde Next.js
3. **Endpoint /api/proyectos mejorado** - Con soporte CORS completo

## 📋 PASOS PARA ACTUALIZAR EN RENDER

### Paso 1: Hacer Push de los Cambios

```bash
git add .
git commit -m "fix: Corregir render.yaml y agregar CORS para API"
git push origin main
```

### Paso 2: Forzar Deploy en Render

1. Ve a: https://dashboard.render.com
2. Selecciona el servicio: **"iica-chile-plataforma"**
3. Ve a la pestaña **"Manual Deploy"**
4. Haz clic en **"Clear build cache & deploy"**
5. Espera 3-5 minutos

### Paso 3: Verificar Configuración

En Render Dashboard → Settings → Build & Deploy, verifica:

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 300 --max-requests 50`

### Paso 4: Verificar que Funciona

Después del deploy, verifica:

1. **Página principal**: https://iica-chile-plataforma.onrender.com/
   - Debe mostrar la plataforma Flask con 121 proyectos

2. **API de proyectos**: https://iica-chile-plataforma.onrender.com/api/proyectos
   - Debe devolver JSON con proyectos
   - Debe incluir headers CORS

3. **API con filtros**: https://iica-chile-plataforma.onrender.com/api/proyectos?q=agricultura&status=open
   - Debe filtrar correctamente

## 🔍 VERIFICACIÓN EN LOGS

En Render → Logs, debes ver:

```
✅ app_enhanced.py importado correctamente
✅ CORS configurado para /api/*
🚀 INICIANDO APLICACIÓN DESDE app.py
✅ Importando desde app_enhanced.py
```

## 📝 CAMBIOS REALIZADOS

1. **render.yaml**: Corregido para usar Flask (no Next.js)
2. **app_enhanced.py**: 
   - CORS agregado para /api/*
   - Endpoint /api/proyectos mejorado con soporte OPTIONS
   - Headers CORS en todas las respuestas de API

## ⚠️ SI AÚN NO FUNCIONA

1. **Limpia el caché de build** en Render
2. **Verifica que el commit más reciente esté desplegado**
3. **Revisa los logs** para errores
4. **Verifica que requirements.txt incluya todas las dependencias**

## 🎯 PRÓXIMOS PASOS

Si quieres desplegar también la plataforma Next.js:

1. Crea un **nuevo servicio** en Render para Next.js
2. Configura:
   - Name: `tenders-platform-nextjs`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Variable: `NEXT_PUBLIC_API_URL=https://iica-chile-plataforma.onrender.com`

Esto te dará:
- **Flask**: https://iica-chile-plataforma.onrender.com (API + UI original)
- **Next.js**: https://tenders-platform-nextjs.onrender.com (Nueva UI moderna)

