# IICA Chile - Radar de Oportunidades v2.0

Plataforma institucional del IICA Chile para identificar y gestionar oportunidades de proyectos 2026.

## Mejoras Implementadas

### Dark Mode
- Toggle de tema claro/oscuro en el Header
- Colores adaptados para ambos modos
- Persistencia de preferencia en localStorage

### i18n (Internacionalizacion)
- Soporte para ES, EN, PT
- Archivos de traduccion en `/messages`
- Middleware para deteccion automatica de idioma

### Tests
- Jest + React Testing Library
- Tests para `data.ts` (utilidades)
- Tests para `ProjectFilters` (componente)
- Coverage de funciones criticas

### Base de Datos
- Prisma ORM con PostgreSQL
- Modelo `Project` completo
- Scripts de seed para migracion
- Modelos adicionales: Analytics, Newsletter, LinkCheck

### Accesibilidad (WCAG AA)
- Iconos lucide-react (reemplazo de emojis)
- Atributos aria labels
- Navegacion por teclado
- Skip to main content
- Focus visible mejorado

### Optimizacion
- Dynamic imports para componentes pesados
- Lazy loading de modales
- Bundle splitting por rutas

## Requisitos

- Node.js 18+
- PostgreSQL (local o Vercel Postgres)
- npm o yarn

## Instalacion

```bash
# Clonar repositorio
git clone https://github.com/maximilianoandrade-sys/iica-chile-plataforma.git
cd iica-chile-plataforma

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Generar Prisma Client
npm run prisma:generate

# Configurar base de datos (desarrollo local)
npm run db:setup
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Tests

```bash
# Ejecutar tests
npm test

# Tests con watch
npm run test:watch

# Coverage
npm run test:coverage
```

## Deploy a Vercel

### 1. Crear proyecto en Vercel

```bash
npm i -g vercel
vercel login
vercel
```

### 2. Agregar Storage (PostgreSQL)

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleccionar proyecto > Storage > Create Database
3. Elegir "PostgreSQL"
4. Conectar a proyecto

### 3. Configurar Environment Variables

En Vercel Dashboard > Settings > Environment Variables:

```
DATABASE_URL = (automatically populated by Vercel Postgres)
NEXTAUTH_URL = https://tu-proyecto.vercel.app
NEXTAUTH_SECRET = (generar con: openssl rand -base64 32)
```

### 4. Deploy

```bash
# Deploy manual
./deploy-vercel.sh

# O desde Vercel CLI
vercel --prod
```

El deploy automaticamente:
- Genera Prisma Client
- Hace build de Next.js
- Despliega a Vercel

## Estructura del Proyecto

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/            # Panel de administracion
│   ├── legal/            # Paginas legales
│   └── page.tsx          # Pagina principal
├── components/           # Componentes React
│   ├── ui/              # Componentes base
│   ├── features/        # Caracteristicas
│   └── *.tsx            # Componentes principales
├── lib/                  # Utilidades
├── hooks/                # Custom hooks
├── prisma/               # Schema y seed de DB
├── messages/             # Traducciones i18n
├── tests/                # Tests
└── public/               # Archivos estaticos
```

## API Endpoints

| Endpoint | Descripcion |
|----------|-------------|
| `GET /api/projects` | Listar proyectos |
| `GET /api/search-projects` | Buscar proyectos |
| `POST /api/generate-proposal` | Generar propuesta |
| `GET /api/export-csv` | Exportar a CSV |
| `POST /api/check-link` | Verificar enlaces |
| `GET /api/cron/check-updates` | Actualizar datos |

## Tecnologias

- **Framework**: Next.js 14
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Base de datos**: PostgreSQL + Prisma
- **i18n**: next-intl
- **Tests**: Jest + Testing Library
- **PWA**: next-pwa
- **Deploy**: Vercel

## Licencia

ISC

## Contacto

IICA Chile - Instituto Interamericano de Cooperacion para la Agricultura
