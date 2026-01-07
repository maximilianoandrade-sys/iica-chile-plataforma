# IICA Plataforma - Oportunidades Agrícolas 2026

Plataforma web para visualizar y buscar oportunidades de financiamiento agrícola de FAO, BID y FONTAGRO.

## Características

- 🔍 Búsqueda avanzada de tenders
- 🎯 Filtros por estado, agencia y categoría
- 📊 Estadísticas en tiempo real
- 📥 Exportación a CSV
- 📱 Diseño responsive
- 🎨 Interfaz moderna con Tailwind CSS

## Tecnologías

- **Next.js 15** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Prisma** - ORM para base de datos
- **Lucide React** - Iconos

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar base de datos
# Crear archivo .env con:
# DATABASE_URL="file:./dev.db"

# Generar cliente de Prisma
npx prisma generate

# Inicializar base de datos
npx prisma db push

# Ejecutar en desarrollo
npm run dev
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm start` - Inicia servidor de producción
- `npm run scrape` - Ejecuta scrapers de datos
- `npm run db:push` - Actualiza esquema de base de datos

## Deploy en Render

1. Crear nuevo repositorio en GitHub
2. Subir todos los archivos
3. En Render.com:
   - New → Web Service
   - Conectar repositorio de GitHub
   - Configurar:
     - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
     - **Start Command**: `npm start`
   - Agregar variable de entorno:
     - `DATABASE_URL` (PostgreSQL para Render)

## Estructura del Proyecto

```
├── app/
│   ├── page.tsx          # Componente principal
│   ├── layout.tsx        # Layout raíz
│   └── globals.css       # Estilos globales
├── lib/
│   └── types.ts          # Tipos y datos de tenders
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
└── package.json
```

## Licencia

MIT
