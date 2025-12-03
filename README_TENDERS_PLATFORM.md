# Plataforma de Licitaciones - Next.js 15

Plataforma web moderna para búsqueda y filtrado de licitaciones internacionales, desarrollada con Next.js 15, React 18 y Tailwind CSS.

## 🚀 Características

- **Búsqueda Avanzada**: Búsqueda por palabras clave en títulos, organizaciones y descripciones
- **Filtros Múltiples**: Filtrado por ubicación, sector y estado
- **Sincronización de URL**: Los filtros se sincronizan con la URL para compartir y guardar búsquedas
- **Paginación**: Navegación eficiente entre resultados
- **Diseño Responsivo**: Interfaz moderna y adaptable a todos los dispositivos
- **UI Moderna**: Diseño limpio con Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18.17 o superior
- npm, yarn o pnpm

## 🛠️ Instalación Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 3. Construir para producción

```bash
npm run build
```

### 4. Ejecutar versión de producción localmente

```bash
npm start
```

## 📁 Estructura del Proyecto

```
tenders-platform/
├── app/
│   ├── layout.tsx          # Layout principal de la aplicación
│   ├── page.tsx            # Página de inicio (redirige a /search)
│   ├── search/
│   │   └── page.tsx        # Página principal de búsqueda
│   └── globals.css         # Estilos globales con Tailwind
├── components/
│   ├── FiltersPanel.tsx    # Panel de filtros lateral
│   └── TenderCard.tsx      # Tarjeta de licitación
├── lib/
│   └── tenders.ts          # Lógica de búsqueda y datos mock
├── package.json
├── next.config.js          # Configuración de Next.js
├── tailwind.config.js      # Configuración de Tailwind CSS
├── tsconfig.json           # Configuración de TypeScript
└── postcss.config.js       # Configuración de PostCSS
```

## 🌐 Despliegue en Render.com

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en un repositorio Git (GitHub, GitLab, etc.)
2. Verifica que todos los archivos necesarios estén incluidos

### Paso 2: Crear Servicio en Render

1. **Inicia sesión en Render.com** y crea una cuenta si no tienes una

2. **Crea un nuevo Web Service**:
   - Haz clic en "New +" → "Web Service"
   - Conecta tu repositorio Git

3. **Configura el servicio**:
   - **Name**: `tenders-platform` (o el nombre que prefieras)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `18` o superior (se detecta automáticamente)

4. **Variables de Entorno** (opcionales):
   - `NODE_ENV`: `production`
   - `PORT`: Render lo asigna automáticamente, pero Next.js lo detecta

5. **Plan**: Selecciona el plan gratuito o el que prefieras

### Paso 3: Desplegar

1. Haz clic en "Create Web Service"
2. Render comenzará a construir y desplegar tu aplicación
3. El proceso puede tardar 5-10 minutos la primera vez
4. Una vez completado, recibirás una URL pública (ej: `https://tenders-platform.onrender.com`)

### Paso 4: Auto-Deploy

- Render configurará automáticamente el auto-deploy en cada push a la rama principal
- Cada vez que hagas push, Render reconstruirá y redesplegará automáticamente

## 🔧 Configuración Adicional

### Variables de Entorno

Si necesitas agregar variables de entorno en Render:

1. Ve a tu servicio en Render Dashboard
2. Navega a "Environment"
3. Agrega las variables necesarias
4. Guarda los cambios (esto reiniciará el servicio)

### Dominio Personalizado

1. En Render Dashboard, ve a tu servicio
2. Navega a "Settings" → "Custom Domains"
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar DNS

## 📝 Uso de la Plataforma

### Búsqueda

1. Escribe palabras clave en el campo de búsqueda
2. Presiona Enter o haz clic en "Buscar"
3. Los resultados se filtrarán automáticamente

### Filtros

- **Ubicación**: Selecciona uno o más países
- **Sector**: Selecciona uno o más sectores (ICT, Energía, Infraestructura, etc.)
- **Estado**: Selecciona entre Abierto, Cerrado o Borrador

### Paginación

- Navega entre páginas usando los botones "Anterior" y "Siguiente"
- Cada página muestra hasta 9 resultados

## 🎨 Personalización

### Agregar Más Licitaciones

Edita el archivo `lib/tenders.ts` y agrega más objetos al array `mockTenders`:

```typescript
{
  id: 16,
  title: 'Nuevo Proyecto',
  organization: 'Organización',
  location: 'País',
  locationId: '84',
  sectors: ['10'],
  status: 'open',
  budget: 1000000,
  deadline: '2025-12-31',
  description: 'Descripción del proyecto',
}
```

### Modificar Filtros

Edita los arrays `locations` y `sectors` en `components/FiltersPanel.tsx`:

```typescript
const locations = [
  { id: '84', name: 'Chile' },
  // Agrega más ubicaciones...
]
```

### Cambiar Estilos

Modifica `tailwind.config.js` o edita directamente los componentes para personalizar el diseño.

## 🔌 Integración con Backend Real

Para conectar con un backend real:

1. Crea un archivo `.env.local` con tu URL de API:
   ```
   NEXT_PUBLIC_API_URL=https://tu-api.com
   ```

2. Modifica `lib/tenders.ts` para hacer llamadas reales:

```typescript
export async function fetchTenders(filters: Filters) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tenders?${new URLSearchParams({
      q: filters.query || '',
      locations: filters.locations?.join(',') || '',
      sectors: filters.sectors?.join(',') || '',
      status: filters.status || 'open',
      page: String(filters.page || 1),
    })}`
  )
  return response.json()
}
```

## 🐛 Solución de Problemas

### Error: "Module not found"

- Asegúrate de haber ejecutado `npm install`
- Verifica que todas las dependencias estén en `package.json`

### Error en Build de Render

- Verifica que `package.json` tenga los scripts correctos
- Revisa los logs de build en Render Dashboard
- Asegúrate de que Node.js 18+ esté configurado

### La aplicación no carga

- Verifica que el puerto esté configurado correctamente
- Revisa los logs del servicio en Render
- Asegúrate de que `next.config.js` esté presente

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para preguntas o problemas:
- Abre un issue en el repositorio
- Revisa la documentación de Next.js: https://nextjs.org/docs
- Revisa la documentación de Render: https://render.com/docs

---

**Desarrollado con ❤️ usando Next.js 15 y Tailwind CSS**

