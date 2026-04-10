# ✅ Checklist de Despliegue en Render

## Verificación Pre-Despliegue

### 1. Archivos de Configuración ✅
- [x] `package.json` - Configurado con scripts correctos
- [x] `next.config.js` - Configurado
- [x] `render.yaml` - Configurado para Next.js
- [x] `.gitignore` - Incluye node_modules y .next

### 2. Configuración en Render Dashboard

Verifica en tu servicio de Render que:

#### Build & Deploy
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment**: `Node`

#### Variables de Entorno
- `NODE_ENV` = `production` (ya configurado en render.yaml)

### 3. Pasos para Completar el Despliegue

1. **Asegúrate de que el código esté en Git**
   ```bash
   git status
   git add .
   git commit -m "Preparar despliegue Next.js en Render"
   git push origin main
   ```

2. **En el Dashboard de Render:**
   - Ve a tu servicio `tenders-platform`
   - Verifica que esté conectado al repositorio correcto
   - Verifica que la rama sea `main` (o la que uses)

3. **Inicia el Despliegue:**
   - Si el auto-deploy está activado, se iniciará automáticamente
   - O haz clic en "Manual Deploy" > "Deploy latest commit"

4. **Monitorea el Build:**
   - Ve a la pestaña "Logs"
   - Deberías ver:
     ```
     npm run build
     ✓ Compiled successfully
     ```

5. **Verifica el Despliegue:**
   - Una vez completado, accede a la URL proporcionada por Render
   - Deberías ver la plataforma funcionando

## 🔍 Verificación Post-Despliegue

### URLs a Verificar:
- [ ] Página principal: `https://tu-app.onrender.com/` (debe redirigir a /search)
- [ ] Página de búsqueda: `https://tu-app.onrender.com/search`
- [ ] Búsqueda funciona
- [ ] Filtros funcionan
- [ ] Paginación funciona

### Si hay Errores:

1. **Error 404:**
   - Verifica que `app/page.tsx` redirija a `/search`
   - Verifica que `app/search/page.tsx` exista

2. **Error de Build:**
   - Revisa los logs en Render
   - Verifica que todas las dependencias estén en `package.json`
   - Prueba localmente: `npm run build`

3. **Error al Iniciar:**
   - Verifica que `startCommand` sea `npm start`
   - Revisa los logs de runtime

## 📝 Comandos Útiles

```bash
# Probar build localmente
npm run build

# Probar producción localmente
npm start

# Verificar que todo esté en Git
git status
```

## 🎯 Configuración Final en Render

Si necesitas ajustar algo en el dashboard de Render:

1. Ve a **Settings** de tu servicio
2. Verifica:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: Debería detectarse automáticamente (18+)

¡Listo para desplegar! 🚀

