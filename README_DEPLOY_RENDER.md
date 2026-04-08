# Guía de Despliegue en Render.com

Esta guía te ayudará a desplegar la Plataforma de Licitaciones en Render.com paso a paso.

## 📋 Requisitos Previos

- Cuenta en Render.com (puedes registrarte con GitHub)
- Repositorio Git con el código de la plataforma
- Node.js 18+ instalado localmente (para pruebas)

## 🚀 Pasos para el Despliegue

### 1. Preparar el Código

Asegúrate de que tu código esté en un repositorio Git:

```bash
# Verifica que todos los archivos estén agregados
git status

# Si hay cambios sin commitear
git add .
git commit -m "Preparar para despliegue en Render"
git push origin main
```

### 2. Crear Cuenta en Render

1. Ve a [https://render.com](https://render.com)
2. Haz clic en "Get Started for Free"
3. Conecta tu cuenta de GitHub/GitLab/Bitbucket
4. Autoriza el acceso a tus repositorios

### 3. Crear Nuevo Web Service

1. En el dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio:
   - Si no aparece, haz clic en "Configure account" para dar permisos
   - Selecciona el repositorio que contiene la plataforma

### 4. Configurar el Servicio

Completa los siguientes campos:

#### Información Básica
- **Name**: `tenders-platform` (o el nombre que prefieras)
- **Region**: Elige la región más cercana a tus usuarios
- **Branch**: `main` (o la rama que uses)

#### Configuración de Build
- **Runtime**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

#### Plan
- Selecciona el plan **Free** para empezar (tiene algunas limitaciones)
- O elige un plan de pago para mejor rendimiento

### 5. Variables de Entorno (Opcional)

Por ahora no necesitas variables de entorno, pero si en el futuro necesitas agregar alguna (como URLs de API, claves, etc.):

1. Ve a la sección "Environment Variables"
2. Agrega cada variable con su valor
3. Ejemplo:
   - Key: `NODE_ENV`
   - Value: `production`

### 6. Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir tu aplicación
3. Puedes ver el progreso en tiempo real en los logs
4. El proceso puede tardar 2-5 minutos la primera vez

### 7. Verificar el Despliegue

1. Una vez completado el build, Render te dará una URL pública
2. Ejemplo: `https://tenders-platform.onrender.com`
3. Haz clic en la URL o cópiala y ábrela en tu navegador
4. Deberías ver la plataforma funcionando

## 🔄 Actualizaciones Automáticas

Render está configurado para desplegar automáticamente cada vez que hagas push a la rama principal:

1. Haz cambios en tu código local
2. Haz commit y push:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin main
   ```
3. Render detectará el cambio y comenzará un nuevo despliegue
4. Puedes ver el progreso en el dashboard de Render

## ⚙️ Configuración Avanzada

### Desactivar Auto-Deploy

Si prefieres desplegar manualmente:

1. Ve a tu servicio en Render
2. Ve a "Settings" > "Auto-Deploy"
3. Desactiva "Auto-Deploy"

### Despliegue Manual

1. Ve a tu servicio en Render
2. Haz clic en "Manual Deploy"
3. Selecciona la rama y commit que quieres desplegar

### Ver Logs

Para ver los logs de tu aplicación:

1. Ve a tu servicio en Render
2. Haz clic en la pestaña "Logs"
3. Verás logs en tiempo real de:
   - Build process
   - Runtime logs
   - Errores

## 🐛 Solución de Problemas Comunes

### Error: "Build failed"

**Causa común**: Dependencias faltantes o errores en el código

**Solución**:
1. Revisa los logs de build en Render
2. Prueba localmente: `npm run build`
3. Asegúrate de que `package.json` tenga todas las dependencias

### Error: "Application failed to start"

**Causa común**: El comando de inicio es incorrecto

**Solución**:
1. Verifica que `startCommand` sea `npm start`
2. Asegúrate de que `package.json` tenga el script `start`
3. Revisa los logs de runtime

### La aplicación carga pero muestra errores

**Causa común**: Problemas con rutas o configuración

**Solución**:
1. Revisa la consola del navegador (F12)
2. Verifica los logs en Render
3. Asegúrate de que todas las rutas estén correctas

### La aplicación es lenta al cargar

**Causa común**: Plan gratuito tiene "spin down" después de inactividad

**Solución**:
1. El plan gratuito pone la app en "sleep" después de 15 minutos de inactividad
2. La primera carga después del sleep puede tardar 30-60 segundos
3. Considera actualizar a un plan de pago para evitar esto

## 📊 Monitoreo

Render proporciona métricas básicas:

- **Metrics**: CPU, memoria, requests
- **Logs**: Logs en tiempo real
- **Events**: Historial de despliegues

## 🔒 Seguridad

- Render proporciona HTTPS automáticamente
- No necesitas configurar certificados SSL
- Las variables de entorno están encriptadas

## 💰 Costos

- **Plan Free**: Gratis, pero con limitaciones (sleep después de inactividad)
- **Plan Starter**: ~$7/mes, sin sleep, mejor rendimiento
- **Plan Standard**: ~$25/mes, para aplicaciones con más tráfico

## 📞 Soporte

Si tienes problemas:

1. Revisa la [documentación de Render](https://render.com/docs)
2. Revisa los logs de tu aplicación
3. Contacta el soporte de Render si es necesario

---

**¡Tu plataforma debería estar funcionando en Render ahora!** 🎉

