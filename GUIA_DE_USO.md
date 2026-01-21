# 🚀 GUÍA DE USO - MEJORAS IMPLEMENTADAS

## IICA Chile - Plataforma de Financiamiento Agrícola

---

## 📖 TABLA DE CONTENIDOS

1. [Inicio Rápido](#inicio-rápido)
2. [Nuevas Funcionalidades](#nuevas-funcionalidades)
3. [Seguridad](#seguridad)
4. [Performance](#performance)
5. [Accesibilidad](#accesibilidad)
6. [PWA](#pwa)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## 🚀 INICIO RÁPIDO {#inicio-rápido}

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start
```

### Verificar Mejoras

```bash
# En el navegador, abrir consola y ejecutar:
window.verifyImprovements()
```

---

## ✨ NUEVAS FUNCIONALIDADES {#nuevas-funcionalidades}

### 1. Sistema de Favoritos Mejorado

**Uso:**
- Click en el ícono de corazón ❤️ para guardar/quitar favoritos
- Los favoritos se sincronizan automáticamente
- Persistencia en localStorage con encriptación

**Código:**
```typescript
import { secureStorageSet, secureStorageGet } from '@/lib/security';

// Guardar favorito
secureStorageSet('favorites', [1, 2, 3]);

// Obtener favoritos
const favs = secureStorageGet<number[]>('favorites', []);
```

### 2. Comparador de Proyectos

**Uso:**
- Seleccionar hasta 3 proyectos con el checkbox
- Click en "Comparar" para ver comparación lado a lado
- Comparación incluye: cierre, cofinanciamiento, plazo, requisitos

### 3. Notificaciones Push

**Uso:**
- Click en el ícono de campana 🔔 para activar
- Recibe notificaciones de:
  - Nuevas convocatorias
  - Proyectos próximos a cerrar
  - Actualizaciones importantes

**Código:**
```typescript
import { usePushNotifications } from '@/hooks/usePWA';

const { requestPermission, subscribe } = usePushNotifications();

// Activar notificaciones
await requestPermission();
await subscribe();
```

### 4. Instalación PWA

**Uso:**
- Banner automático aparece después de 10 segundos
- Click en "Instalar" para agregar a pantalla de inicio
- Funciona offline con caché inteligente

### 5. Búsqueda Inteligente

**Características:**
- Tolerancia a errores tipográficos
- Sinónimos automáticos
- Debounce de 300ms
- Historial de búsquedas

---

## 🔒 SEGURIDAD {#seguridad}

### Sanitización de Inputs

```typescript
import { sanitizeInput, sanitizeHTML } from '@/lib/security';

// Sanitizar texto
const safe = sanitizeInput(userInput);

// Sanitizar HTML
const safeHTML = sanitizeHTML(htmlContent);
```

### Validación con Zod

```typescript
import { validateSearchParams } from '@/lib/security';

// Validar parámetros de búsqueda
const safeParams = validateSearchParams(req.query);
```

### Rate Limiting

```typescript
import { checkRateLimit } from '@/lib/security';

// Verificar límite de requests
const { allowed, remaining } = checkRateLimit(userId, 100, 60000);

if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
}
```

### CSRF Protection

```typescript
import { generateCSRFToken, validateCSRFToken } from '@/lib/security';

// Generar token
const token = generateCSRFToken();

// Validar token
if (!validateCSRFToken(receivedToken, storedToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
}
```

---

## ⚡ PERFORMANCE {#performance}

### Web Vitals Monitoring

Las métricas se reportan automáticamente. Ver en consola del navegador:

```
📊 LCP: 1.2s (good)
📊 FID: 50ms (good)
📊 CLS: 0.05 (good)
```

### Cache Management

```typescript
import { cache } from '@/lib/performance';

// Guardar en caché (TTL: 5 min)
cache.set('projects', data, 5 * 60 * 1000);

// Obtener de caché
const cached = cache.get<Project[]>('projects');

// Limpiar caché
cache.clear();
```

### Debounce & Throttle

```typescript
import { debounce, throttle } from '@/lib/performance';

// Debounce para búsquedas
const debouncedSearch = debounce(handleSearch, 300);

// Throttle para scroll
const throttledScroll = throttle(handleScroll, 100);
```

### Lazy Loading

```typescript
import { lazyWithRetry } from '@/lib/performance';

// Lazy load con retry automático
const LazyComponent = lazy(() => 
    lazyWithRetry(() => import('./HeavyComponent'))
);
```

---

## ♿ ACCESIBILIDAD {#accesibilidad}

### Navegación por Teclado

**Atajos:**
- `Tab` - Navegar entre elementos
- `Shift + Tab` - Navegar hacia atrás
- `Enter` - Activar elemento
- `Escape` - Cerrar modales
- `Home` - Ir al inicio
- `End` - Ir al final

### Screen Reader Support

Todos los elementos tienen ARIA labels apropiados:

```typescript
import { announceToScreenReader } from '@/lib/accessibility';

// Anunciar mensaje
announceToScreenReader('Búsqueda completada: 15 resultados');
```

### Focus Management

```typescript
import { FocusTrap, focusManager } from '@/lib/accessibility';

// Crear focus trap para modal
const trap = new FocusTrap(modalElement);
trap.activate();

// Guardar y restaurar focus
focusManager.save();
// ... hacer algo ...
focusManager.restore();
```

### Validación de Contraste

```typescript
import { meetsWCAG_AA, getContrastRatio } from '@/lib/accessibility';

// Verificar contraste
const { passes, ratio } = meetsWCAG_AA('#0066CC', '#FFFFFF', 16);
console.log(`Contraste: ${ratio}:1 - ${passes ? 'PASS' : 'FAIL'}`);
```

### Auditoría Automática

```typescript
import { runAccessibilityAudit } from '@/lib/accessibility';

// Ejecutar auditoría completa
const audit = runAccessibilityAudit();
console.log(`Estado: ${audit.overall}`);
```

---

## 📱 PWA {#pwa}

### Service Worker

El Service Worker se registra automáticamente. Estrategias de caché:

- **Cache First**: JS, CSS, Fonts
- **Network First**: HTML, API
- **Stale While Revalidate**: Imágenes

### Offline Support

La app funciona offline automáticamente. Contenido cacheado:
- Página principal
- Assets estáticos
- Últimas búsquedas
- Proyectos visitados

### Push Notifications

```typescript
import { usePushNotifications } from '@/hooks/usePWA';

function MyComponent() {
    const { permission, subscribe, unsubscribe } = usePushNotifications();
    
    const handleEnable = async () => {
        await subscribe();
    };
    
    return (
        <button onClick={handleEnable}>
            Activar Notificaciones
        </button>
    );
}
```

### Install Prompt

```typescript
import { useInstallPrompt } from '@/hooks/usePWA';

function InstallButton() {
    const { isInstallable, promptInstall } = useInstallPrompt();
    
    if (!isInstallable) return null;
    
    return (
        <button onClick={promptInstall}>
            Instalar App
        </button>
    );
}
```

### Background Sync

```typescript
import { useBackgroundSync } from '@/hooks/usePWA';

function SyncComponent() {
    const { registerSync } = useBackgroundSync();
    
    const handleSync = async () => {
        await registerSync('sync-favorites');
    };
    
    return <button onClick={handleSync}>Sincronizar</button>;
}
```

---

## 🧪 TESTING {#testing}

### Lighthouse Audit

```bash
# Ejecutar Lighthouse
npm run lighthouse

# O manualmente en Chrome DevTools:
# 1. Abrir DevTools (F12)
# 2. Ir a pestaña "Lighthouse"
# 3. Click en "Generate report"
```

**Objetivos:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100
- PWA: 100

### Verificación de Seguridad

```bash
# Ejecutar auditoría de seguridad
npm run security-audit

# Verificar headers
curl -I https://tu-dominio.com
```

### Testing de Accesibilidad

```bash
# Ejecutar tests de a11y
npm run test:a11y

# O en navegador:
window.verifyImprovements()
```

### Testing PWA

```bash
# Verificar manifest
curl https://tu-dominio.com/manifest.json

# Verificar service worker
# En DevTools > Application > Service Workers
```

---

## 🚀 DEPLOYMENT {#deployment}

### Variables de Entorno

Crear `.env.local`:

```env
# VAPID Keys para Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica
VAPID_PRIVATE_KEY=tu_clave_privada

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### Generar VAPID Keys

```bash
npx web-push generate-vapid-keys
```

### Build de Producción

```bash
# Build
npm run build

# Verificar build
npm start

# O con PM2
pm2 start npm --name "iica-platform" -- start
```

### Vercel Deployment

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Headers de Seguridad

Agregar en `next.config.js`:

```javascript
async headers() {
    return [
        {
            source: '/:path*',
            headers: [
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
                {
                    key: 'Content-Security-Policy',
                    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com;"
                }
            ],
        },
    ];
}
```

---

## 📊 MONITOREO

### Google Analytics

Las métricas se envían automáticamente:
- Page views
- Eventos de búsqueda
- Clics en proyectos
- Web Vitals
- Errores

### Sentry (Opcional)

```typescript
// En app/layout.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
});
```

---

## 🐛 TROUBLESHOOTING

### Service Worker no se registra

```javascript
// Verificar en DevTools > Application > Service Workers
// Si no aparece, verificar:
// 1. HTTPS o localhost
// 2. Archivo sw.js en /public
// 3. No hay errores en consola
```

### Notificaciones no funcionan

```javascript
// Verificar permisos
console.log(Notification.permission);

// Si es "denied", el usuario debe cambiar permisos en configuración del navegador
```

### Build falla

```bash
# Limpiar caché
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Errores de TypeScript

```bash
# Verificar versión de TypeScript
npm list typescript

# Actualizar si es necesario
npm install typescript@latest
```

---

## 📚 RECURSOS ADICIONALES

- [Documentación Next.js](https://nextjs.org/docs)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

## 🤝 SOPORTE

Para reportar issues o sugerencias:
1. Abrir issue en GitHub
2. Incluir pasos para reproducir
3. Adjuntar screenshots si es relevante
4. Especificar navegador y versión

---

**Desarrollado con ❤️ por Antigravity AI**
**Versión: 1.0.0**
**Fecha: 2026-01-21**
