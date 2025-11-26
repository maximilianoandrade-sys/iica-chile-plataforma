# 🔄 FORZAR ACTUALIZACIÓN EN RENDER

## ⚠️ PROBLEMA
Render puede estar usando caché y no detectar los cambios del nuevo template `home_didactico.html`.

## ✅ SOLUCIÓN: Forzar Re-Deploy

### Opción 1: Manual Trigger en Render (RECOMENDADO)
1. Ve a: https://dashboard.render.com
2. Selecciona el servicio: **"plataforma-iica-proyectos"**
3. Ve a la pestaña **"Manual Deploy"** o **"Events"**
4. Haz clic en **"Deploy latest commit"** o **"Clear build cache & deploy"**
5. Esto forzará un nuevo deploy sin caché

### Opción 2: Verificar que el Template Existe
En Render Dashboard → Logs, busca:
```
🎨 USANDO TEMPLATE: home_didactico.html (INTERFAZ DIDÁCTICA)
```

Si NO ves este mensaje, Render está usando una versión antigua.

### Opción 3: Verificar Start Command
1. Ve a Settings → Build & Deploy
2. Verifica que Start Command sea:
   ```
   gunicorn app_enhanced:app --bind 0.0.0.0:$PORT --workers 2 --timeout 180 --preload
   ```

### Opción 4: Limpiar Caché de Render
1. En Settings → Build & Deploy
2. Busca "Clear build cache"
3. Haz clic y luego "Deploy"

## 🔍 VERIFICACIÓN

Después del deploy, en los logs deberías ver:
```
🎨 USANDO TEMPLATE: home_didactico.html (INTERFAZ DIDÁCTICA)
```

Y en la página web deberías ver:
- Header de bienvenida con "Bienvenido a IICA Chile"
- Sección "¿Cómo funciona? Es muy fácil" con 4 pasos
- Botón de ayuda flotante (esquina inferior derecha)
- Filtros con tooltips y explicaciones

## ⚠️ SI SIGUE SIN FUNCIONAR

1. Verifica en Render Dashboard → Logs que se esté usando `app_enhanced`
2. Verifica que el commit más reciente esté desplegado
3. Intenta hacer un "Manual Deploy" desde Render Dashboard

