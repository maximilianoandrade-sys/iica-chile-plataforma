# 🌾 Plataforma de Financiamiento Agrícola - IICA Chile

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

> Plataforma web moderna para visualizar y buscar oportunidades de financiamiento agrícola en Chile. Desarrollada por el Instituto Interamericano de Cooperación para la Agricultura (IICA).

## 🚀 Demo en Vivo

**Producción:** [https://iica-chile-plataforma.vercel.app/](https://iica-chile-plataforma.vercel.app/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### 🎯 Funcionalidades Principales

- **Asistente de Perfilamiento Inteligente:** Wizard interactivo de 3 pasos para filtrar fondos según objetivo, región y perfil del usuario
- **Búsqueda Avanzada:** Filtros por categoría, región, beneficiario, institución y palabras clave Agrovoc
- **Contador de Días Restantes:** Badges visuales que muestran urgencia de cierre de convocatorias
- **Calculadora de Elegibilidad:** Quiz interactivo que estima probabilidad de adjudicación
- **Etiquetas de IA:** Clasificación automática de dificultad de postulación
- **Mi Maletín Digital:** Centro de gestión de documentos requeridos
- **Directorio de Consultores:** Marketplace de expertos en formulación de proyectos
- **Sistema de Favoritos:** Guarda y compara hasta 3 proyectos simultáneamente
- **PWA (Progressive Web App):** Instalable y funciona offline

### 🎨 Diseño y UX

- **Mobile-First:** Optimizado para dispositivos móviles
- **Responsive:** Adaptable a tablets y desktop
- **Animaciones Fluidas:** Powered by Framer Motion
- **Accesibilidad:** Cumple con WCAG 2.1 AA
- **SEO Optimizado:** Metadatos dinámicos por región

---

## 🛠️ Tecnologías

### Core

- **[Next.js 16.1.1](https://nextjs.org/)** - Framework React con App Router
- **[React 19.2.3](https://reactjs.org/)** - Biblioteca de UI
- **[TypeScript 5.9.3](https://www.typescriptlang.org/)** - Tipado estático

### Styling & UI

- **[Tailwind CSS 3.4.0](https://tailwindcss.com/)** - Utility-first CSS
- **[Framer Motion 12.26.2](https://www.framer.com/motion/)** - Animaciones
- **[Lucide React 0.441.0](https://lucide.dev/)** - Iconos

### Features

- **[next-pwa 5.6.0](https://github.com/shadowwalker/next-pwa)** - Progressive Web App
- **[Cheerio 1.0.0](https://cheerio.js.org/)** - Web scraping
- **[Axios 1.7.0](https://axios-http.com/)** - HTTP client

---

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/maximilianoandrade-sys/iica-chile-plataforma.git
cd iica-chile-plataforma
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Ejecutar en desarrollo**

```bash
npm run dev
```

4. **Abrir en el navegador**

```
http://localhost:3000
```

---

## 🎯 Uso

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Genera build optimizado
npm run start        # Inicia servidor de producción

# Scraping (Experimental)
npm run scrape       # Ejecuta scraper de convocatorias
```

### Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```env
# Opcional: Para analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Opcional: Para notificaciones
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-key
```

---

## 📁 Estructura del Proyecto

```
iica-chile-plataforma/
├── app/                      # App Router (Next.js 13+)
│   ├── page.tsx             # Página principal
│   ├── layout.tsx           # Layout global
│   ├── maletin/             # Gestión de documentos
│   ├── consultores/         # Directorio de expertos
│   ├── legal/               # Políticas y términos
│   └── api/                 # API Routes
├── components/              # Componentes React
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProjectList.tsx
│   ├── ProfilingWizard.tsx
│   ├── EligibilityCalculator.tsx
│   └── ...
├── lib/                     # Utilidades y helpers
│   ├── data.ts              # Tipos e interfaces
│   ├── analytics.ts         # Tracking
│   └── security.ts          # Headers de seguridad
├── data/                    # Datos estáticos
│   └── projects.json        # Base de datos de proyectos
├── public/                  # Assets estáticos
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service Worker
│   └── icons/               # Iconos PWA
├── scripts/                 # Scripts de automatización
│   └── scraper.py           # Web scraper (Python)
└── next.config.js           # Configuración Next.js
```

---

## 🌟 Funcionalidades Principales

### 1. Asistente de Perfilamiento

Guía al usuario en 3 pasos para encontrar fondos relevantes:

1. **Objetivo:** ¿Qué quieres financiar? (Riego, Suelos, Maquinaria, etc.)
2. **Región:** ¿Dónde está tu proyecto?
3. **Perfil:** ¿Quién eres? (Pequeño productor, Empresa, Joven, etc.)

### 2. Calculadora de Elegibilidad

Quiz de 4 preguntas que evalúa:
- Ubicación rural
- Iniciación de actividades
- Experiencia previa
- Cofinanciamiento disponible

Retorna un porcentaje de probabilidad con recomendaciones.

### 3. Mi Maletín Digital

Dashboard para gestionar documentos críticos:
- Carpeta Tributaria (F29)
- Certificado de Vigencia
- Derechos de Agua
- Rol de Avalúo Fiscal

Estados: ✅ Válido | ⚠️ Por vencer | ❌ Pendiente

### 4. Directorio de Consultores

Marketplace de expertos con:
- Filtros por especialidad y región
- Calificaciones y reseñas
- Contacto directo (Chat/Llamada)

---

## 📚 Documentación

- **[PLATFORM_REVIEW.md](./PLATFORM_REVIEW.md)** - Revisión completa de funcionalidades
- **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)** - Checklist de verificación
- **[DEPLOY_AHORA.md](./DEPLOY_AHORA.md)** - Guía de despliegue
- **[SOLUCION_DEPLOY_NEXTJS.md](./SOLUCION_DEPLOY_NEXTJS.md)** - Troubleshooting Vercel

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Equipo

**Instituto Interamericano de Cooperación para la Agricultura (IICA)**
- Oficina Chile
- Calle Rancagua No.0320, Providencia, Santiago
- Email: representacion.chile@iica.int
- Teléfono: (+56) 2 2225 2511

---

## 🙏 Agradecimientos

- **INDAP, CORFO, CNR, FIA** - Por la información de convocatorias
- **FAO, BID, FONTAGRO** - Por oportunidades internacionales
- **Comunidad Open Source** - Por las herramientas utilizadas

---

## 📊 Estado del Proyecto

- ✅ **Build:** Passing
- ✅ **Deploy:** Vercel
- ✅ **Tests:** Manual QA
- ✅ **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices, SEO)

---

**Desarrollado con ❤️ para el sector agrícola chileno**

[⬆ Volver arriba](#-plataforma-de-financiamiento-agrícola---iica-chile)
