# 🚨 URGENTE: Cambiar Configuración en Render Dashboard

## ⚠️ PROBLEMA CRÍTICO

Render está usando `app_final:app` en lugar de `app_enhanced:app`, por eso:
- ❌ Solo muestra 16 proyectos
- ❌ No se ven los cambios
- ❌ Usa template antiguo

## ✅ SOLUCIÓN INMEDIATA (5 MINUTOS)

### Paso 1: Ir a Render Dashboard
1. Abre: https://dashboard.render.com
2. Inicia sesión
3. Selecciona el servicio: **"plataforma-iica-proyectos"**

### Paso 2: Ir a Settings
1. En el menú lateral, haz clic en **"Settings"**
2. O busca el botón **"Settings"** en la parte superior

### Paso 3: Cambiar Start Command
1. Desplázate hasta la sección **"Build & Deploy"**
2. Busca el campo **"Start Command"**
3. **BORRA** el comando actual que dice:
   ```
   gunicorn app_final:app --bind 0.0.0.0:$PORT
   ```
4. **ESCRIBE** este comando nuevo:
   ```
   gunicorn app_enhanced:app --bind 0.0.0.0:$PORT --workers 2 --timeout 180 --preload
   ```

### Paso 4: Guardar
1. Haz clic en **"Save Changes"** o **"Update"**
2. Render iniciará automáticamente un nuevo deploy

### Paso 5: Esperar
1. Ve a la pestaña **"Logs"** o **"Events"**
2. Espera 2-5 minutos
3. Verifica que el nuevo deploy use `app_enhanced:app`

## 🔍 VERIFICACIÓN EN LOGS

Después del cambio, en los logs deberías ver:
```
==> Running 'gunicorn app_enhanced:app --bind 0.0.0.0:$PORT --workers 2 --timeout 180 --preload'
```

Y NO deberías ver:
```
==> Running 'gunicorn app_final:app --bind 0.0.0.0:$PORT'
```

## ✅ RESULTADO ESPERADO

Después del deploy, el sitio debería:
- ✅ Mostrar TODOS los proyectos (no solo 16)
- ✅ Usar el template mejorado
- ✅ Tener filtros funcionando
- ✅ Mostrar diseño institucional IICA

## 📸 IMAGEN DE REFERENCIA

El campo "Start Command" debería verse así:
```
┌─────────────────────────────────────────────────────────────┐
│ Start Command                                                │
├─────────────────────────────────────────────────────────────┤
│ gunicorn app_enhanced:app --bind 0.0.0.0:$PORT --workers 2 │
│ --timeout 180 --preload                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🆘 SI NO ENCUENTRAS EL CAMPO

1. Busca en **Settings** → **Environment**
2. O en **Settings** → **Build & Deploy**
3. O busca "Start Command" con Ctrl+F

## ⚡ ALTERNATIVA RÁPIDA

Si no encuentras el campo, puedes:
1. Eliminar el servicio actual
2. Crear uno nuevo desde `render.yaml`
3. Render leerá automáticamente `app_enhanced:app`

Pero es más rápido cambiar el Start Command manualmente.

