<div align="center">

# 🌾 Radar de Oportunidades IICA Chile

### Plataforma Inteligente de Financiamiento Silvoagropecuario, AgriTech y Acción Climática

[![Next.js](https://img.shields.io/badge/Next.js-14.2.23-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-29.0-C21325?style=for-the-badge&logo=jest)](https://jestjs.io/)
[![License](https://img.shields.io/badge/Licencia-IICA_Chile-002060?style=for-the-badge)](https://www.iica.int/es/chile)

*Desarrollado para el **Instituto Interamericano de Cooperación para la Agricultura (IICA) — Oficina Chile**, optimizando la búsqueda, formulación y postulación a fondos públicos e internacionales para agricultores, cooperativas e investigadores.*

[🌐 Explorar Plataforma](#-características-principales) • [🧮 Calculadora de Cofinanciamiento](#-herramientas-operativas-destacadas) • [📊 Exportador Excel](#-exportación-y-reportes) • [🚀 Instalación y Uso](#-guía-de-desarrollo-local)

</div>

---

## 🎯 Propósito de la Plataforma

El **Radar de Oportunidades IICA Chile** centraliza, clasifica y monitorea en tiempo real **127 convocatorias activas vigentes** (de un catálogo total de **214 convocatorias monitoreadas**) de financiamiento silvoagropecuario, desarrollo territorial, gestión hídrica, bioeconomía y **AgriTech / Inteligencia Artificial**.

Permite a profesionales del IICA, consultores, organizaciones campesinas y empresas agropecuarias:
1. **Identificar oportunidades vigentes** en minutos con filtros por región de Chile, sector y rango de presupuesto.
2. **Prevenir el rechazo administrativo** simulando el porcentaje de subsidio y el aporte propio requerido (dinero real vs. valorizado).
3. **Guardar y comparar propuestas** en una matriz competitiva lado a lado.
4. **Generar reportes ejecutivos institucionales** en Excel con fórmulas nativas y formato oficial IICA.

---

## ✨ Características Principales

### 🔍 1. Explorador y Búsqueda Multifuente (214 Convocatorias)
- **Monitoreo Automático de 25+ Instituciones**:
  - **Nacionales**: INDAP, CNR, CORFO, FIA, FONDEF, ANID, SAG, GORE Regionales.
  - **Internacionales**: PNUMA / UNEP, IKI (Alemania), CAF Banco de Desarrollo, Power of Diversity, IFC Banco Mundial, FAO, FIDA, IDRC Canadá, Horizonte Europa.
- **Categoría Especial AgriTech e IA**: Filtro dedicado para proyectos que incorporan Inteligencia Artificial, sensores IoT y agricultura de precisión.
- **Transparencia Directa**: Cada tarjeta incluye enlace a las bases oficiales (`Bases ↗`) y tooltip de verificación.

### 🧮 2. Herramientas Operativas Destacadas
- **Simulador de Cofinanciamiento y Aporte Propio (`CofinancingCalculator`)**:
  - Calcula automáticamente la división entre **Subsidio Máximo** (80%, 70%, 90% o 100%), **Aporte Propio Monetario (Pecuniario)** y **Aporte Propio Valorizado (Horas profesionales, Maquinaria, Predios)**.
- **Matriz Comparativa de Convocatorias (`TenderComparator`)**:
  - Permite seleccionar hasta 3 fondos simultáneamente para comparar cofinanciamiento, viabilidad IICA, fecha límite y complejidad en una tabla unificada.
- **Mis Oportunidades Guardadas (`FavoritesDrawer`)**:
  - Sistema de favoritos en `localStorage` (sin necesidad de iniciar sesión) con drawer lateral deslizante.
- **Barra de Filtros Activos Adhesiva (`ActiveFiltersBar`)**:
  - Barra flotante fija al hacer scroll con chips interactivos para remover filtros uno a uno.

### 🎨 3. UI/UX Avanzada y Semáforo de Urgencia
- **Semáforo Visual Dinámico**:
  - 🚨 `≤ 7 días`: Badge rojo pulsante de alta prioridad.
  - ⚠️ `8 a 30 días`: Badge ámbar.
  - ⚪ `> 30 días`: Badge gris neutro.
- **Dual Mode View**: Alternancia instantánea entre vista de **Tarjetas Visuales** y **Tabla Compacta de Alta Densidad** (con preferencia persistida en el navegador).
- **Accesibilidad y Móvil**: Cumple con estándares WCAG AA (targets táctiles ≥44px, contraste contrastado, diseño responsive adaptativo).

---

## 📊 Exportación y Reportes Institucionales

El módulo `exportProjectsToExcel` genera reportes en formato **SpreadsheetML XML (.xls)** totalmente compatibles con Microsoft Excel en español:

- **Formato Oficial IICA**: Banner azul institucional (`#002060`), títulos en oro y tablas formateadas.
- **KPI Summary Cards**: Total de fondos movilizables, promedio por convocatoria e indicadores clave.
- **Fórmulas Nativas de Excel**: Incluye funciones vivas (`=SUM`, `=COUNTA`, `=AVERAGE`, `=COUNTIF`).
- **Compatibilidad Regional en Español**: Incorpora la cabecera `sep=;\n` y delimitadores punto y coma (`;`) para que Excel en Windows/Mac abra los datos en columnas independientes sin amontonarlos.

---

## 🛠️ Stack Técnico

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Lenguaje**: [TypeScript 5](https://www.typescriptlang.org/) (Estricto, 0 `any`)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
- **Base de Datos / ORM**: [Supabase Postgres](https://supabase.com/) + [Prisma ORM](https://www.prisma.io/) (con fallback resiliente a JSON para desarrollo sin conexión)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/) (67 test suites, 387 unit tests pasados)
- **PWA**: Support Offline Progresivo vía Service Worker (`sw.js`)

---

## 🚀 Guía de Desarrollo Local

### Requisitos Previos
- Node.js 18+ o Node.js 20+
- npm 9+

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/maximilianoandrade-sys/iica-chile-plataforma.git
cd iica-chile-plataforma

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la plataforma.

---

## 🧪 Pruebas y Control de Calidad

```bash
# Ejecutar verificación de tipos TypeScript
npx tsc --noEmit

# Ejecutar el linter ESLint
npm run lint

# Ejecutar la suite completa de pruebas Jest
npx jest

# Generar la compilación optimizada de producción
npm run build
```

---

## 📁 Estructura del Proyecto

```
iica-chile-plataforma/
├── app/                      # Rutas Next.js App Router (Páginas y API routes)
│   ├── api/                  # Endpoints (export-csv, favorites, search, ai)
│   ├── proyecto/[id]/        # Ficha detallada de la convocatoria
│   └── page.tsx              # Portal principal / Dashboard
├── components/               # Componentes UI reutilizables
│   ├── ActiveFiltersBar.tsx  # Barra adhesiva de filtros activos
│   ├── CofinancingCalculator.tsx # Calculadora de aporte propio
│   ├── FavoritesDrawer.tsx   # Panel lateral de guardados
│   ├── FuentesOficiales.tsx  # Grilla de fuentes e instituciones
│   ├── ProjectCard.tsx       # Tarjeta de proyecto con semáforo de urgencia
│   ├── ProjectList.tsx       # Lista con vista dual (Tarjetas/Tabla)
│   └── TenderComparator.tsx  # Matriz comparativa de fondos
├── data/
│   └── projects.json         # Dataset principal con 214 convocatorias
├── lib/
│   ├── data.ts               # Tipos, funciones auxiliares y formatters
│   ├── logos.ts              # Registro oficial de marcas e instituciones
│   └── utils/
│       ├── exportCsv.ts      # Generador SpreadsheetML XML para Excel
│       ├── favorites.ts      # Gestión de favoritos en localStorage
│       └── logger.ts         # Sistema de logging estructurado JSON
├── tests/                    # Suites de pruebas unitarias Jest
└── README.md
```

---

## 🏛️ Créditos y Licencia

Plataforma desarrollada para el **Instituto Interamericano de Cooperación para la Agricultura (IICA)**. Todos los derechos reservados.

- **Oficina IICA Chile**: [https://www.iica.int/es/chile](https://www.iica.int/es/chile)
- **Contacto**: `iica.cl@iica.int`
