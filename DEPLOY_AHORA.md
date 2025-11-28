# 🚀 DEPLOY INMEDIATO - SIGUE ESTOS PASOS EXACTOS

## ✅ CAMBIOS YA IMPLEMENTADOS EN EL CÓDIGO

He hecho los siguientes cambios en el código:

1. ✅ **Eliminado `--preload`** de gunicorn (causaba caché)
2. ✅ **Forzado uso de `home_didactico.html`** - SIN fallbacks
3. ✅ **Deshabilitado caché de Jinja2** completamente
4. ✅ **Deshabilitado caché de `lru_cache`** temporalmente
5. ✅ **Headers anti-caché** en todas las respuestas
6. ✅ **Logging detallado** para verificar versión
7. ✅ **Actualizado Procfile** para consistencia

## 📋 PASOS OBLIGATORIOS (HAZ ESTO AHORA)

### PASO 1: Hacer Commit y Push

```bash
git add .
git commit -m "URGENTE: Forzar actualización - sin caché, template forzado"
git push origin main
```

### PASO 2: Ir a Render Dashboard

1. Abre: https://dashboard.render.com
2. Inicia sesión
3. Selecciona: **"plataforma-iica-proyectos"**

### PASO 3: Cambiar Start Command (CRÍTICO)

1. Ve a: **Settings** → **Build & Deploy**
2. Busca: **"Start Command"**
3. **BORRA TODO** lo que dice actualmente
4. **ESCRIBE EXACTAMENTE ESTO**:
   ```
   gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 300 --max-requests 50 --max-requests-jitter 10 --graceful-timeout 30
   ```
5. **GUARDA** (botón "Save Changes")

### PASO 4: Limpiar Caché y Deploy

1. En la misma página, busca: **"Clear build cache"**
2. Haz clic en **"Clear build cache"**
3. Luego haz clic en **"Deploy latest commit"**
4. **ESPERA 3-5 MINUTOS**

### PASO 5: Verificar en Logs

En **Logs**, DEBES ver estas líneas:

```
============================================================
🚀 INICIANDO APLICACIÓN DESDE app.py
✅ Importando desde app_enhanced.py
✅ Template: home_didactico.html (INTERFAZ DIDÁCTICA)
✅ Versión de Deploy: [FECHA_HORA]
✅ Headers anti-caché activados
============================================================
🎨 INTERFAZ DIDÁCTICA - FORZANDO CARGA
📄 Template: home_didactico.html
✅ Versión: DIDACTICA_V3.0 - Build: [FECHA_HORA]
============================================================
🏠 RUTA HOME LLAMADA - FORZANDO ACTUALIZACIÓN
✅ Versión App: [FECHA_HORA]
✅ Template objetivo: home_didactico.html
============================================================
✅ Template FORZADO encontrado: templates/home_didactico.html
🔄 Caché de Jinja2 invalidado - usando template fresco
📄 Template seleccionado: home_didactico.html
🎯 RENDERIZANDO TEMPLATE: home_didactico.html
✅ Template home_didactico.html renderizado exitosamente
```

### PASO 6: Verificar Versión

Visita: `https://tu-app.onrender.com/version`

Debe mostrar:
```json
{
  "version": "[FECHA_HORA_ACTUAL]",
  "build_timestamp": "[TIMESTAMP_ACTUAL]",
  "template": "home_didactico.html",
  "cache_disabled": true,
  "gunicorn_preload": false
}
```

### PASO 7: Limpiar Caché del Navegador

- **Windows**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`
- O abre en **modo incógnito**

### PASO 8: Verificar Página Principal

La página debe mostrar:
- ✅ Header grande "Bienvenido a IICA Chile"
- ✅ Sección "¿Cómo funciona? Es muy fácil" con 4 pasos
- ✅ Botón de ayuda flotante naranja (esquina inferior derecha)
- ✅ Filtros con iconos de pregunta (tooltips)

## ❌ SI SIGUE SIN FUNCIONAR

### Verificar Start Command

En Render Dashboard → Logs, busca:
```
==> Running 'gunicorn app:app --bind 0.0.0.0:$PORT ...
```

**DEBE decir `app:app`** - Si dice `app_final` o `app_enhanced`, el cambio NO se guardó.

### Verificar Último Commit

1. Ve a **Events**
2. Verifica que el último commit sea el más reciente
3. Si no, haz clic en **"Deploy latest commit"**

### Forzar Refresh Manual

Visita: `https://tu-app.onrender.com/force-refresh`

Luego recarga la página principal.

## 🔍 CHECKLIST FINAL

Antes de reportar que no funciona, verifica:

- [ ] Start Command en Render dice `app:app` (NO `app_final` ni `app_enhanced`)
- [ ] Último commit está desplegado (Events → verificar)
- [ ] Logs muestran `🚀 INICIANDO APLICACIÓN DESDE app.py`
- [ ] Logs muestran `✅ Template FORZADO encontrado: templates/home_didactico.html`
- [ ] `/version` muestra timestamp actual (NO antiguo)
- [ ] Caché del navegador limpiado (Ctrl+Shift+R)
- [ ] Build cache limpiado en Render

## 📞 SI NADA FUNCIONA

1. Verifica que `templates/home_didactico.html` exista en Git:
   ```bash
   git ls-files | grep home_didactico.html
   ```

2. Si no existe, agrégalo:
   ```bash
   git add templates/home_didactico.html
   git commit -m "Agregar template home_didactico.html"
   git push origin main
   ```

3. Luego vuelve a hacer **PASO 4** (Limpiar Caché y Deploy)

