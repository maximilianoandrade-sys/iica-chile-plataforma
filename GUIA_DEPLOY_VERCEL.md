
# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar la plataforma **IICA Chile** en Vercel, la plataforma nativa y recomendada para Next.js.

## 🛠️ Prerrequisitos

1.  Una cuenta en [Vercel](https://vercel.com/signup).
2.  El código subido a tu repositorio (GitHub/GitLab/Bitbucket).

## ⚡ Pasos para Desplegar

### Opción 1: Importar desde Git (Recomendado)

1.  Ve a tu **Dashboard de Vercel**: https://vercel.com/dashboard
2.  Haz clic en el botón **"Add New..."** -> **"Project"**.
3.  En la columna "Import Git Repository", busca tu repositorio `iica-chile-plataforma` y haz clic en **"Import"**.

### ⚙️ Configuración del Proyecto

En la pantalla de configuración ("Configure Project"):

1.  **Framework Preset**: Vercel detectará automáticamente **Next.js**. Déjalo así.
2.  **Root Directory**: Déjalo en `./` (raíz).
3.  **Build and Output Settings**:
    *   **Build Command**: `next build` (Automático)
    *   **Install Command**: `npm install` (Automático)
4.  **Environment Variables**:
    *   Necesitarás configurar las variables de entorno de tu base de datos y otras claves.
    *   Ejemplo:
        *   `DATABASE_URL`: `postgresql://usuario:password@host/db...` (Tu URL de base de datos externa, ej: Supabase, Neon, o la misma de Render si es accesible externamente).
        *   `NEXT_PUBLIC_API_URL`: `https://tu-dominio.vercel.app` (o la URL que te asigne Vercel).

5.  Haz clic en **"Deploy"**.

### 🎉 ¡Listo!

*   Vercel construirá tu aplicación en segundos.
*   Una vez termine, verás una pantalla de "Congratulations!" con una vista previa de tu sitio.
*   Tu plataforma estará disponible en `https://iica-chile-plataforma.vercel.app` (o similar).

## 🔄 Actualizaciones Automáticas

*   Cada vez que hagas un **Push** a la rama `main` (o la que hayas configurado), Vercel detectará el cambio y hará un nuevo despliegue automáticamente.
*   Puedes ver el historial de despliegues en la pestaña **"Deployments"** de tu proyecto en Vercel.

## 💡 Solución de Problemas Comunes

*   **Error de Base de Datos**: Asegúrate de que `DATABASE_URL` sea correcta y que la base de datos permita conexiones externas. En el script `postinstall` se ejecuta `prisma generate`, lo cual es necesario para que el cliente de base de datos funcione.
*   **Archivos Faltantes**: Si falta algún archivo en el despliegue, verifica que no esté en `.gitignore`.
