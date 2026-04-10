# Plataforma de Licitaciones - Next.js 15

Plataforma web moderna para búsqueda y filtrado de licitaciones internacionales, desarrollada con Next.js 15, React 18 y Tailwind CSS, integrada con la API Flask existente.

## 🚀 Características

- **Búsqueda Avanzada**: Búsqueda por palabras clave en títulos, organizaciones y descripciones
- **Filtros Múltiples**: Filtrado por ubicación, sector y estado
- **Sincronización de URL**: Los filtros se sincronizan con la URL para compartir y guardar búsquedas
- **Paginación**: Navegación eficiente entre resultados
- **Diseño Responsivo**: Interfaz moderna y adaptable a todos los dispositivos
- **Integración con Flask**: Consume datos reales de la plataforma Flask existente
- **Fallback Inteligente**: Si la API no está disponible, usa datos mock

## 📋 Requisitos Previos

- Node.js 18.17 o superior
- npm, yarn o pnpm
- Flask backend ejecutándose (opcional, tiene fallback a datos mock)

## 🛠️ Instalación Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# URL de la API Flask backend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Nota**: Si no configuras esta variable, la aplicación usará datos mock como fallback.

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 4. Construir para producción

```bash
npm run build
```

### 5. Ejecutar versión de producción localmente

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
│   ├── SearchBar.tsx       # Componente de barra de búsqueda
│   ├── FiltersPanel.tsx    # Panel de filtros lateral
│   └── TenderCard.tsx      # Tarjeta de licitación
├── lib/
│   └── tenders.ts          # Lógica de búsqueda y conexión con API Flask
├── package.json
├── next.config.js          # Configuración de Next.js
├── tailwind.config.js      # Configuración de Tailwind CSS
├── postcss.config.js       # Configuración de PostCSS
└── tsconfig.json           # Configuración de TypeScript
```

## 🔌 Integración con Flask Backend

La plataforma Next.js está configurada para consumir la API Flask existente en `/api/proyectos`. 

### Endpoint de API Flask

El endpoint `/api/proyectos` en Flask acepta los siguientes parámetros:

- `q`: Búsqueda por palabras clave
- `locations`: IDs de ubicaciones separados por comas (ej: "84,75")
- `sectors`: IDs de sectores separados por comas (ej: "10,16")
- `status`: Estado del proyecto ("open", "closed", "draft")
- `page`: Número de página (por defecto: 1)
- `per_page`: Resultados por página (por defecto: 9)

### Mapeo de Datos

La plataforma mapea automáticamente los datos de Flask al formato esperado:

- **Ubicaciones**: IDs numéricos (84=Chile, 75=Argentina, etc.)
- **Sectores**: IDs numéricos (70=ICT, 25=Energía, 16=Infraestructura, etc.)
- **Estados**: "open" (Abierto), "closed" (Cerrado), "draft" (Borrador)

### Fallback

Si la API Flask no está disponible o hay un error, la aplicación automáticamente usa datos mock para que siempre funcione.

## 🌐 Despliegue en Render.com

### Opción 1: Desplegar Next.js y Flask por separado

1. **Desplegar Flask** (si aún no está desplegado):
   - Usa el `render.yaml` existente para Flask
   - Anota la URL pública (ej: `https://tu-app-flask.onrender.com`)

2. **Desplegar Next.js**:
   - Crea un nuevo Web Service en Render
   - Conecta tu repositorio Git
   - Configura:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment**: Node.js
   - Agrega variable de entorno:
     - `NEXT_PUBLIC_API_URL`: URL de tu Flask backend (ej: `https://tu-app-flask.onrender.com`)

### Opción 2: Usar el mismo servicio (Next.js como frontend, Flask como API)

Si Flask y Next.js están en el mismo repositorio, puedes configurar Render para servir ambos:

1. **Configurar Render para Next.js**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Agrega variable: `NEXT_PUBLIC_API_URL=http://localhost:5000` (o la URL interna)

2. **Ejecutar Flask en segundo plano** (opcional):
   - Puedes usar un script que inicie ambos servicios
   - O desplegar Flask como un servicio separado

### Configuración Recomendada

Para producción, se recomienda:

1. **Flask como servicio separado** en Render (puerto 5000)
2. **Next.js como servicio separado** en Render (puerto 3000)
3. **Configurar CORS** en Flask para permitir requests desde Next.js

En `app_enhanced.py`, agrega:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["https://tu-nextjs-app.onrender.com"]}})
```

## 📝 Variables de Entorno

### Desarrollo Local

Crea `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Producción (Render)

En Render Dashboard, agrega:

- `NEXT_PUBLIC_API_URL`: URL completa de tu Flask backend
  - Ejemplo: `https://tu-app-flask.onrender.com`

## 🎨 Personalización

### Agregar Más Ubicaciones

Edita `components/FiltersPanel.tsx`:

```typescript
const locations = [
  { id: '84', name: 'Chile' },
  { id: '75', name: 'Argentina' },
  // Agrega más...
]
```

Y actualiza el mapeo en `app_enhanced.py` en el endpoint `/api/proyectos`.

### Agregar Más Sectores

Edita `components/FiltersPanel.tsx`:

```typescript
const sectors = [
  { id: '70', name: 'ICT & Telecom' },
  { id: '25', name: 'Energía' },
  // Agrega más...
]
```

Y actualiza el mapeo en `app_enhanced.py`.

## 🐛 Solución de Problemas

### Error: "Failed to fetch"

- Verifica que Flask esté ejecutándose
- Verifica la URL en `NEXT_PUBLIC_API_URL`
- Revisa la consola del navegador para errores CORS
- La aplicación usará datos mock como fallback

### Error: "Module not found"

- Ejecuta `npm install` nuevamente
- Verifica que todas las dependencias estén en `package.json`

### La API no responde

- La aplicación automáticamente usa datos mock
- Verifica los logs de Flask
- Verifica que el endpoint `/api/proyectos` esté funcionando

### Error en Build de Render

- Verifica que `package.json` tenga los scripts correctos
- Revisa los logs de build en Render Dashboard
- Asegúrate de que Node.js 18+ esté configurado

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Desarrollado con ❤️ usando Next.js 15, React 18, Tailwind CSS e integrado con Flask**
