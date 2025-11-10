# Guía para Desplegar en Render

## 📋 Resumen de Cambios

### Archivos Modificados:
1. ✅ `scrapers/google_custom.py` - Nuevo scraper para Google Custom Search API
2. ✅ `app.py` - Integración de Google Custom Search
3. ✅ `templates/home.html` - Header mejorado con logo IICA y filtros avanzados
4. ✅ `render.yaml` - Configuración con variables de entorno para Google API
5. ✅ `requirements.txt` - Dependencias actualizadas

### Nuevas Funcionalidades:
- 🔍 Búsqueda con Google Custom Search API
- 🎨 Header profesional con logo IICA y gradiente
- 🔎 Filtros avanzados (palabra clave, área, estado, fuente)
- 📱 Diseño responsive mejorado

## 🚀 Pasos para Desplegar en Render

### 1. Verificar Cambios Locales

```bash
# Verificar estado de Git
git status

# Ver cambios realizados
git diff
```

### 2. Agregar Archivos al Repositorio

```bash
# Agregar todos los archivos modificados
git add scrapers/google_custom.py
git add app.py
git add templates/home.html
git add render.yaml
git add requirements.txt

# O agregar todos los cambios
git add .
```

### 3. Hacer Commit

```bash
git commit -m "feat: Integración Google Custom Search API y mejoras UI

- Agregado scraper google_custom.py para búsqueda con Google API
- Integrado Google Custom Search en app.py
- Mejorado header con logo IICA y diseño profesional
- Agregados filtros avanzados (query, área, estado, fuente)
- Actualizado render.yaml con variables de entorno
- Mejoras en diseño responsive"
```

### 4. Subir a GitHub/GitLab

```bash
# Si es la primera vez o necesitas configurar el remoto
git remote -v  # Verificar remoto configurado

# Si no hay remoto, agregar uno:
# git remote add origin https://github.com/tu-usuario/tu-repositorio.git

# Subir cambios
git push origin main
# O si tu rama se llama master:
# git push origin master
```

### 5. Configurar Secrets en Render

1. **Ir a Render Dashboard**: https://dashboard.render.com
2. **Seleccionar tu servicio** "plataforma-iica-proyectos"
3. **Ir a "Environment"** en el menú lateral
4. **Agregar los siguientes Secrets**:
   - `GOOGLE_API_KEY`: Tu Google API Key
   - `GOOGLE_CX`: Tu Custom Search Engine ID

### 6. Verificar Despliegue

1. Render detectará automáticamente el push y comenzará el build
2. Revisar los logs en Render Dashboard
3. Una vez completado, la aplicación estará disponible en tu URL de Render

## 🔑 Obtener Credenciales de Google Custom Search

### Google API Key:
1. Ir a: https://console.cloud.google.com/
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar "Custom Search API"
4. Ir a "Credentials" → "Create Credentials" → "API Key"
5. Copiar la API Key

### Custom Search Engine ID (CX):
1. Ir a: https://programmablesearchengine.google.com/
2. Crear un nuevo motor de búsqueda
3. Configurar los sitios a buscar (o "Search the entire web")
4. Copiar el "Search engine ID" (CX)

## ✅ Verificación Post-Despliegue

1. **Verificar que la aplicación carga**: Visitar la URL de Render
2. **Verificar el header**: Debe mostrar el logo IICA y el título
3. **Probar búsqueda**: Usar el formulario de búsqueda
4. **Probar filtros**: Probar los dropdowns de área, estado y fuente
5. **Probar actualización**: Hacer clic en "Actualizar" para recolectar proyectos

## 🐛 Solución de Problemas

### Si el build falla:
- Verificar que `requirements.txt` tenga todas las dependencias
- Revisar los logs de build en Render

### Si Google Custom Search no funciona:
- Verificar que los secrets `GOOGLE_API_KEY` y `GOOGLE_CX` estén configurados
- Verificar que la API Key tenga permisos para Custom Search API
- Revisar los logs de la aplicación en Render

### Si el logo no aparece:
- Verificar que `static/iica-logo.png` esté en el repositorio
- Verificar que el archivo esté en la carpeta `static/`

## 📝 Notas Importantes

- Los secrets en Render son sensibles, no los compartas
- El despliegue automático se activa con cada push a la rama principal
- Render puede tardar 2-5 minutos en desplegar
- La primera vez puede tardar más por la instalación de dependencias
