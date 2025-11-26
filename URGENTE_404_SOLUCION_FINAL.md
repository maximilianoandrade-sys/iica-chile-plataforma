# 🚨 URGENTE: Solución Final para Errores 404

## ⚠️ PROBLEMA PRINCIPAL

**Render está usando `app_final:app` en lugar de `app_enhanced:app`**

Por eso todos los links dan error 404 - las rutas están en `app_enhanced.py` pero Render está ejecutando `app_final.py`.

## ✅ SOLUCIÓN INMEDIATA (OBLIGATORIO)

### **PASO 1: Ir a Render Dashboard**
1. Abre: https://dashboard.render.com
2. Inicia sesión
3. Selecciona el servicio: **"plataforma-iica-proyectos"**

### **PASO 2: Cambiar Start Command (CRÍTICO)**
1. Haz clic en **"Settings"** (Configuración)
2. Desplázate hasta **"Build & Deploy"**
3. Busca el campo **"Start Command"**
4. **BORRA TODO** lo que dice actualmente
5. **ESCRIBE EXACTAMENTE ESTO:**
   ```
   gunicorn app_enhanced:app --bind 0.0.0.0:$PORT --workers 2 --timeout 180 --preload
   ```

### **PASO 3: Guardar**
1. Haz clic en **"Save Changes"** o **"Update"**
2. Render iniciará automáticamente un nuevo deploy

### **PASO 4: Verificar en Logs**
1. Ve a la pestaña **"Logs"**
2. Espera 2-5 minutos
3. Busca esta línea en los logs:
   ```
   ==> Running 'gunicorn app_enhanced:app --bind 0.0.0.0:$PORT --workers 2 --timeout 180 --preload'
   ```
4. **SI VES `app_final` en lugar de `app_enhanced`, el cambio NO se aplicó**

## 🔍 VERIFICACIÓN POST-DEPLOY

Después del deploy, prueba estos links:
- https://iica-chile-plataforma.onrender.com/ (debe funcionar)
- https://iica-chile-plataforma.onrender.com/proyecto/0 (debe funcionar)
- https://iica-chile-plataforma.onrender.com/notificaciones (debe funcionar)

**Si TODOS funcionan, el problema está resuelto.**

## ❌ SI SIGUE DANDO 404

### Verificar en Render Dashboard → Logs:
1. Busca la línea que dice `==> Running`
2. Si dice `app_final`, el cambio NO se guardó
3. Vuelve a Settings y cambia el Start Command de nuevo

### Verificar que render.yaml esté en Git:
```bash
git ls-files | grep render.yaml
```

Si no aparece, agrégalo:
```bash
git add render.yaml
git commit -m "fix: Agregar render.yaml"
git push origin fix/ci-tests
```

## 🎯 RESULTADO ESPERADO

Después de cambiar el Start Command:
- ✅ Todos los links funcionan
- ✅ No hay errores 404
- ✅ Muestra todos los proyectos
- ✅ Los documentos aparecen en cada proyecto

## ⚠️ IMPORTANTE

**Este cambio DEBE hacerse manualmente en Render Dashboard.**
**El código ya está correcto, solo falta que Render use el archivo correcto.**

