# Plataforma de Búsqueda y Filtro de Licitaciones

Una plataforma web moderna para buscar y filtrar licitaciones, desarrollada con Next.js 15, React 18 y Tailwind CSS, inspirada en DevelopmentAid.

## 🚀 Características

- **Búsqueda avanzada**: Busca licitaciones por palabras clave
- **Filtros múltiples**: Filtra por Ubicación, Sector y Estado
- **Paginación**: Navega fácilmente entre los resultados
- **Sincronización de URL**: Los filtros se sincronizan con la URL para compartir y guardar búsquedas
- **Diseño responsivo**: Funciona perfectamente en dispositivos móviles y desktop
- **UI moderna**: Interfaz limpia y profesional con Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18.0 o superior
- npm o yarn

## 🛠️ Instalación Local

1. **Clona o descarga el repositorio**

```bash
git clone <tu-repositorio>
cd mi-plataforma2
```

2. **Instala las dependencias**

```bash
npm install
```

3. **Ejecuta el servidor de desarrollo**

```bash
npm run dev
```

4. **Abre tu navegador**

Navega a [http://localhost:3000](http://localhost:3000)

La aplicación redirigirá automáticamente a `/search` donde podrás comenzar a buscar licitaciones.

## 🏗️ Construcción para Producción

1. **Construye la aplicación**

```bash
npm run build
```

2. **Ejecuta la versión de producción localmente**

```bash
npm start
```

## 📦 Estructura del Proyecto

```
mi-plataforma2/
├── app/
│   ├── layout.tsx          # Layout principal de la aplicación
│   ├── page.tsx             # Página de inicio (redirige a /search)
│   ├── search/
│   │   └── page.tsx         # Página principal de búsqueda
│   └── globals.css          # Estilos globales con Tailwind
├── components/
│   ├── SearchBar.tsx        # Componente de barra de búsqueda
│   ├── FiltersPanel.tsx     # Panel de filtros lateral
│   └── TenderCard.tsx       # Tarjeta de licitación
├── lib/
│   └── tenders.ts           # Mock data y lógica de filtrado
├── package.json
├── tailwind.config.js       # Configuración de Tailwind CSS
├── postcss.config.js        # Configuración de PostCSS
├── next.config.js           # Configuración de Next.js
└── tsconfig.json            # Configuración de TypeScript
```

## 🌐 Despliegue en Render.com

### Paso 1: Preparar el Repositorio

1. Asegúrate de que todos los archivos estén en tu repositorio Git
2. Haz commit y push de todos los cambios:

```bash
git add .
git commit -m "Plataforma de licitaciones lista para producción"
git push origin main
```

### Paso 2: Crear el Servicio en Render

1. **Inicia sesión en Render.com**
   - Ve a [https://render.com](https://render.com)
   - Inicia sesión con tu cuenta (puedes usar GitHub)

2. **Crea un nuevo Web Service**
   - Haz clic en "New +" en el dashboard
   - Selecciona "Web Service"
   - Conecta tu repositorio de GitHub/GitLab/Bitbucket

3. **Configura el Servicio**

   - **Name**: `tenders-platform` (o el nombre que prefieras)
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Elige el plan gratuito o el que prefieras

4. **Variables de Entorno** (si las necesitas en el futuro)
   - Por ahora no se requieren variables de entorno
   - Si en el futuro necesitas conectar a una base de datos o API, puedes agregarlas aquí

5. **Despliegue Automático**
   - Render desplegará automáticamente en cada push a la rama principal
   - Puedes activar/desactivar esta opción en la configuración

### Paso 3: Verificar el Despliegue

1. Render te proporcionará una URL pública (ej: `https://tenders-platform.onrender.com`)
2. Espera a que el build termine (puede tomar 2-5 minutos la primera vez)
3. Accede a la URL y verifica que la aplicación funcione correctamente

### Configuración Adicional en Render

Si necesitas configuraciones adicionales, puedes crear un archivo `render.yaml`:

```yaml
services:
  - type: web
    name: tenders-platform
    env: node
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter (si está configurado)

## 📝 Personalización

### Agregar Más Licitaciones Mock

Edita el archivo `lib/tenders.ts` y agrega más objetos al array `mockTenders`.

### Modificar Filtros

- **Ubicaciones**: Edita el array `locations` en `components/FiltersPanel.tsx`
- **Sectores**: Edita el array `sectors` en `components/FiltersPanel.tsx`

### Conectar a una API Real

Reemplaza la función `fetchTenders` en `lib/tenders.ts` con una llamada real a tu API:

```typescript
export async function fetchTenders(filters: Filters) {
  const response = await fetch(`${API_URL}/tenders?${buildQueryString(filters)}`);
  const data = await response.json();
  return data;
}
```

## 🐛 Solución de Problemas

### Error: "Module not found"
- Ejecuta `npm install` para instalar todas las dependencias

### Error en el build
- Verifica que estés usando Node.js 18 o superior
- Limpia la caché: `rm -rf .next node_modules` y luego `npm install`

### La aplicación no carga en Render
- Verifica que el build command y start command estén correctos
- Revisa los logs en el dashboard de Render para ver errores específicos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request.

---

**Desarrollado con ❤️ usando Next.js, React y Tailwind CSS**
