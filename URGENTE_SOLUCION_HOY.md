# 🚨 URGENTE: Solución para Hoy - Plataforma Debe Funcionar

## ⚠️ PROBLEMA
La plataforma no se actualiza en Render después del deploy.

## ✅ SOLUCIÓN INMEDIATA (HAZ ESTO AHORA - 10 MINUTOS)

### PASO 1: Verificar y Cambiar Start Command en Render Dashboard

1. **Abre**: https://dashboard.render.com
2. **Inicia sesión**
3. **Selecciona**: "plataforma-iica-proyectos"
4. **Ve a**: **Settings** → **Build & Deploy**
5. **Busca**: Campo **"Start Command"**
6. **BORRA TODO** lo que dice actualmente
7. **ESCRIBE EXACTAMENTE ESTO**:
   ```
   gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 300 --max-requests 50 --max-requests-jitter 10 --graceful-timeout 30
   ```
8. **GUARDA** los cambios (botón "Save Changes" o "Update")

### PASO 2: Limpiar Caché de Build

1. En la misma página **Settings** → **Build & Deploy**
2. Busca el botón **"Clear build cache"**
3. **HAZ CLIC** en "Clear build cache"
4. Luego haz clic en **"Deploy"** o **"Manual Deploy"**

### PASO 3: Forzar Deploy Manual

1. Ve a la pestaña **"Events"** o **"Manual Deploy"**
2. Haz clic en **"Deploy latest commit"** o **"Clear build cache & deploy"**
3. **ESPERA 3-5 MINUTOS** mientras Render hace el deploy

### PASO 4: Verificar en Logs

1. Ve a la pestaña **"Logs"**
2. **BUSCA** estas líneas (deben aparecer):
   ```
   ============================================================
   🚀 INICIANDO APLICACIÓN DESDE app.py
   ✅ Importando desde app_enhanced.py
   ✅ Template: home_didactico.html (INTERFAZ DIDÁCTICA)
   ✅ Versión de Deploy: [FECHA_HORA]
   ✅ Headers anti-caché activados
   ============================================================
   ```

3. **BUSCA** esta línea en los logs:
   ```
   ==> Running 'gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 300 --max-requests 50 --max-requests-jitter 10 --graceful-timeout 30'
   ```

   **IMPORTANTE**: Debe decir `app:app` NO `app_final:app` ni `app_enhanced:app`

### PASO 5: Verificar Versión

1. Visita: `https://tu-app.onrender.com/version`
2. Debe mostrar la versión con timestamp actual
3. Si muestra una versión antigua, el deploy no se aplicó correctamente

### PASO 6: Limpiar Caché del Navegador

1. **Windows**: Presiona `Ctrl + Shift + R`
2. **Mac**: Presiona `Cmd + Shift + R`
3. O abre la página en **modo incógnito**

### PASO 7: Forzar Refresh de la Aplicación

1. Visita: `https://tu-app.onrender.com/force-refresh`
2. Esto invalidará todos los cachés internos
3. Luego recarga la página principal

## 🔍 VERIFICACIÓN FINAL

### En la Página Web Debes Ver:
- ✅ Header grande con "Bienvenido a IICA Chile"
- ✅ Sección "¿Cómo funciona? Es muy fácil" con 4 pasos
- ✅ Botón de ayuda flotante naranja (esquina inferior derecha)
- ✅ Filtros con iconos de pregunta (tooltips)
- ✅ Estadísticas con descripciones amigables

### En los Logs Debes Ver:
- ✅ `🚀 INICIANDO APLICACIÓN DESDE app.py`
- ✅ `✅ Template: home_didactico.html`
- ✅ `✅ Versión de Deploy: [FECHA_HORA]`
- ✅ `🏠 RUTA HOME LLAMADA - FORZANDO ACTUALIZACIÓN`

## ❌ SI SIGUE SIN FUNCIONAR

### Opción A: Verificar que render.yaml esté en Git
```bash
git add render.yaml
git commit -m "Fix: Actualizar render.yaml sin preload"
git push origin main
```

Luego vuelve a hacer **PASO 3** (Forzar Deploy Manual)

### Opción B: Eliminar y Recrear el Servicio (ÚLTIMO RECURSO)

1. En Render Dashboard, ve a **Settings**
2. Desplázate hasta el final
3. Haz clic en **"Delete Service"**
4. Crea un nuevo servicio desde cero usando `render.yaml`

## 📞 CHECKLIST RÁPIDO

Antes de contactar soporte, verifica:
- [ ] Start Command dice `app:app` (NO `app_final` ni `app_enhanced`)
- [ ] Último commit está desplegado (Events → verificar commit)
- [ ] Logs muestran `🚀 INICIANDO APLICACIÓN DESDE app.py`
- [ ] `/version` muestra timestamp actual
- [ ] Caché del navegador limpiado (Ctrl+Shift+R)
- [ ] Build cache limpiado en Render

## 🎯 CAMBIOS IMPLEMENTADOS

1. ✅ **Eliminado `--preload`** de gunicorn (causaba caché)
2. ✅ **Reducido `max-requests` a 50** (fuerza reinicios frecuentes)
3. ✅ **Deshabilitado caché de `lru_cache`** temporalmente
4. ✅ **Invalidación de caché Jinja2** en cada request
5. ✅ **Headers anti-caché** en todas las respuestas
6. ✅ **Logging detallado** para verificar versión

## ⏰ TIEMPO ESTIMADO

- **Paso 1-3**: 5 minutos
- **Espera de deploy**: 3-5 minutos
- **Verificación**: 2 minutos
- **TOTAL**: ~10-12 minutos

## 🚀 DESPUÉS DE HACER LOS CAMBIOS

Una vez que funcione:
1. Verifica que `/version` muestre timestamp actual
2. Verifica que la página muestre el diseño didáctico
3. Prueba los filtros y búsqueda
4. Verifica que los proyectos se muestren correctamente

