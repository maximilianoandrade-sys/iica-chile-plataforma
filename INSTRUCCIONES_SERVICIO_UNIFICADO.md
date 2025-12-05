# ✅ Servicio Unificado: Next.js + Flask en el Mismo Dashboard

## 🎯 Configuración Completada

He configurado todo para que **Next.js y Flask se ejecuten en el mismo servicio** de Render (`iica-chile-plataforma`).

## 📋 Cambios Realizados

1. **`render.yaml`** - Configurado para usar Node.js y ejecutar ambos servicios
2. **`start.sh`** - Script que inicia Flask (puerto 5000) y Next.js (puerto $PORT)
3. **`next.config.js`** - Configurado para hacer proxy a Flask en localhost:5000
4. **`lib/tenders.ts`** - Actualizado para usar rewrites de Next.js

## 🚀 Pasos en Render Dashboard

### PASO 1: Ir al Servicio Existente
1. Ve a: https://dashboard.render.com
2. Selecciona: **`iica-chile-plataforma`** (tu servicio actual)

### PASO 2: Actualizar Configuración
1. Ve a **Settings** → **Build & Deploy**
2. **Environment**: Cambia de `Python` a **`Node`**
3. **Build Command**: 
   ```
   echo "📦 Instalando dependencias Python..." && pip install --no-cache-dir -r requirements.txt && echo "📦 Instalando dependencias Node.js..." && npm ci --prefer-offline --no-audit && echo "🏗️ Construyendo Next.js..." && npm run build
   ```
4. **Start Command**: 
   ```
   bash start.sh
   ```

### PASO 3: Actualizar Variables de Entorno
En **Settings** → **Environment**, verifica/agrega:

- `NODE_ENV` = `production`
- `FLASK_ENV` = `production`
- `PYTHON_VERSION` = `3.11.9`
- `PYTHONUNBUFFERED` = `1`
- `NODE_OPTIONS` = `--max_old_space_size=1024`
- `NEXT_PUBLIC_API_URL` = `http://localhost:5000`

### PASO 4: Forzar Deploy
1. Ve a **Manual Deploy**
2. Haz clic en **"Clear build cache & deploy"**
3. Espera 5-7 minutos (primera vez puede tardar más)

## 🔍 Verificación

### En los Logs de Render
Deberías ver:
```
🚀 Iniciando Flask API en puerto 5000...
🚀 Iniciando Next.js en puerto 10000...
✓ Compiled successfully
```

### En el Navegador
Al acceder a: `https://iica-chile-plataforma.onrender.com/`

**DEBERÍAS VER:**
- ✅ Header azul-verde con logo IICA oficial
- ✅ Colores institucionales (#0066cc y #00a651)
- ✅ Título: "Plataforma de Licitaciones IICA"
- ✅ Barra de búsqueda funcionando
- ✅ Filtros con colores IICA
- ✅ Datos reales desde Flask API

## ⚠️ Si Hay Problemas

### Error: "bash: start.sh: No such file or directory"
- Verifica que `start.sh` esté en el repositorio
- Asegúrate de que tenga permisos de ejecución

### Error: "Port already in use"
- Flask está intentando usar el puerto $PORT
- Verifica que `start.sh` esté configurado correctamente

### Next.js no encuentra la API
- Verifica que `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Revisa los logs para ver si Flask está corriendo

## 📝 Notas Importantes

- **Mismo Dashboard**: Todo está en `iica-chile-plataforma`
- **Mismo URL**: `https://iica-chile-plataforma.onrender.com/`
- **Flask API**: Disponible en `http://localhost:5000` (interno)
- **Next.js**: Disponible en puerto `$PORT` (público, Render lo asigna)

## 🎉 Resultado

Después del deploy, tendrás:
- ✅ Next.js con colores IICA y header
- ✅ Flask API funcionando en segundo plano
- ✅ Todo en el mismo servicio de Render
- ✅ Sin necesidad de crear otro dashboard

