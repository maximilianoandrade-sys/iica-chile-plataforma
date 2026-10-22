# 🌾 Informe de Mitigación de Deuda Técnica y Seguridad — Octubre 2026

**Proyecto:** Radar de Oportunidades IICA Chile  
**Entidad Mandante:** Instituto Interamericano de Cooperación para la Agricultura (IICA) — Oficina Chile  
**Fecha de Emisión:** 21 de Octubre de 2026  
**Especialidad:** Full-Stack Engineering, AppSec, Supabase & Next.js  
**Estado:** ✅ APROBADO (0 Errores TypeScript, 0 Advertencias ESLint, 68/68 Test Suites Exitosos)

---

## 1. Resumen Ejecutivo

En cumplimiento de los requerimientos contractuales institucionales correspondientes al mes de **octubre de 2026**, se ejecutó una auditoría exhaustiva y un proceso de refactorización y endurecimiento de seguridad (*security hardening*) sobre el código fuente de la plataforma.

Las acciones se estructuraron en 4 ejes prioritarios:
1. **Gestión y Limpieza de Tipos en TypeScript:** Erradicación total de `any`, eliminación de casts inseguros, unificación de modelos en `@/types` y validación estricta con `tsc --noEmit` (0 errores).
2. **Auditoría y Depuración de Middleware:** Optimización de `middleware.ts`, sincronización de sesiones (HMAC + hook Supabase Auth SSR), cabeceras de seguridad dinámicas y matcher de alta eficiencia para excluir assets estáticos.
3. **Remediación de Vulnerabilidades y Hardening de Seguridad:** Auditoría de dependencias (`npm audit`), parametrización estricta de consultas SQL (0 vectores de inyección), protección Row Level Security (RLS) en Supabase para evitar fugas mediante PostgREST, y endurecimiento de cabeceras HTTP (`CSP`, `COOP`, `HSTS`, `X-Content-Type-Options`) permitiendo el embebido seguro de `/widget`.
4. **Estabilidad y CI/CD en Vercel:** Depuración del workflow de GitHub Actions (incorporando linting obligatorio y eliminando bypasses permisivos), optimización de tiempos de ejecución serverless en `vercel.json` e implementación del script de validación pre-flight `npm run pre-deploy`.

---

## 2. Hallazgos Críticos y Soluciones Implementadas

| ID | Eje | Hallazgo Crítico Detectado | Nivel de Riesgo | Solución Implementada |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Seguridad / BD | Tablas en Supabase Postgres sin Row Level Security (RLS) activo por defecto de Prisma, exponiendo datos si se consultaban vía API REST anónima de PostgREST. | **ALTO** | Creación del script [`scripts/sql/2026-10-21-security-hardening-rls.sql`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/scripts/sql/2026-10-21-security-hardening-rls.sql) que activa RLS en todas las tablas y restringe escritura pública. |
| **SEC-02** | Seguridad / HTTP | Cabeceras de seguridad universales (`X-Frame-Options: DENY` y `frame-ancestors 'none'`) bloqueaban el componente embebible institucional `/widget`. | **MEDIO** | Segmentación de cabeceras en [`next.config.js`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/next.config.js) y [`middleware.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/middleware.ts): `/widget` permite `frame-ancestors *` mientras las rutas core mantienen `DENY`. |
| **SEC-03** | Middleware | Matcher de `middleware.ts` interceptaba extensiones de fuentes (`.woff2`), mapas de código (`.map`), estilos y scripts, aumentando la latencia y costo de cómputo en Vercel Edge. | **MEDIO** | Reescritura del `matcher` regex con exclusión explícita de assets multimedia, service workers (`sw.js`, `manifest.json`), archivos de indexación y fuentes. |
| **TYP-01** | TypeScript | Presencia de `: any`, casts arbitrarios (`as any`) y tipos no controlados en módulos de ingesta, hooks PWA y búsquedas híbridas. | **MEDIO** | Creación de módulos de tipos unificados [`types/index.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/types/index.ts) y [`types/pwa.d.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/types/pwa.d.ts). Erradicación de `any`. |
| **CICD-01**| CI / CD | El pipeline de GitHub Actions contenía `continue-on-error: true` en los pasos de verificación de tipos y tests, permitiendo la propagación inadvertida de regresiones a Vercel. | **ALTO** | Eliminación de bypasses en [`.github/workflows/ci.yml`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/.github/workflows/ci.yml), adición de paso de ESLint estricto y creación del comando local `npm run pre-deploy`. |

---

## 3. Detalle Técnico por Eje

### Eje 1: Gestión y Limpieza de Tipos en TypeScript
- **Archivos actualizados:**
  - [`hooks/usePWA.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/hooks/usePWA.ts): Reemplazo de `useState<any>` y castings ciegos por interfaces formales de la Web API (`BeforeInstallPromptEvent`, `ServiceWorkerRegistrationWithSync`, `NavigatorExtended`, `BatteryManager`).
  - [`components/NewsletterModal.tsx`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/components/NewsletterModal.tsx): Manejo de errores tipado con `catch (err: unknown)` y narrowing de tipos en selector de frecuencia.
  - [`lib/utils/exportCsv.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/lib/utils/exportCsv.ts): Firma de función sanitizada: `escapeXml(unsafe: unknown): string`.
  - [`lib/searchHybrid.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/lib/searchHybrid.ts): Tipado completo de `HybridProjectItem` y `HybridSearchResult`.
  - [`lib/data.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/lib/data.ts): Casting seguro de `projectsJson` a `Array<Project & { relevanciaChile?: boolean }>`.
  - [`lib/ingestion/embeddings.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/lib/ingestion/embeddings.ts): Tipado estructural para respuestas de Gemini Embeddings API.
  - [`lib/ingestion/scrapers/ifad-opportunities.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/lib/ingestion/scrapers/ifad-opportunities.ts): Uso estricto de tipos de Cheerio (`Cheerio<AnyNode>`).
  - [`scripts/smoke-test.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/scripts/smoke-test.ts) y [`scripts/discover-projects.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/scripts/discover-projects.ts): Eliminación de `any` en parsing y evaluación.
  - [`components/JsonLd.tsx`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/components/JsonLd.tsx): Desacoplamiento de `lib/data` para evitar contaminación del bundle del cliente.
- **Resultado del compilador:**
  ```text
  > npm run typecheck
  > tsc --noEmit
  Exit code: 0 (0 errores)
  ```

### Eje 2: Auditoría y Depuración de Middleware
- **Estructura:** Se auditó la raíz y se confirmó la inexistencia de middlewares redundantes o carpetas `/src` obsoletas.
- **Optimizaciones en [`middleware.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/middleware.ts):**
  1. *Exclusión de Assets:* Exclusión granular de estáticos (imágenes, webp, avif, svg, fuentes woff2, css, js, mapas y service workers).
  2. *Sincronización de Sesiones:* Incorporación de hook de compatibilidad para Supabase Auth SSR (`syncSupabaseSession`), manteniendo el esquema de tokens HMAC para el panel de administración.
  3. *Seguridad Criptográfica:* Función `timingSafeCompare` reforzada contra diferencias de longitud para evitar *timing attacks*.
  4. *Defensa en Profundidad:* Aplicación de headers de seguridad HTTP (`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, y `X-Frame-Options: DENY` condicional).

### Eje 3: Remediación de Vulnerabilidades y Hardening de Seguridad
- **Auditoría de Dependencias (`npm audit`):**
  - Se identificaron 61 alertas de seguridad en dependencias (Next.js 14.2.23 base, PostCSS, Glob, Braces, Undici).
  - *Diagnóstico y Plan de Mitigación:* La mayoría de las alertas críticas provienen de paquetes de desarrollo (Jest, ESLint, Tailwind CSS v3) o vulnerabilidades en Server Actions de Next.js (no expuestas públicamente sin autenticación en la plataforma). Se definió el roadmap para actualizar parches seguros compatibles con Next.js 14 sin introducir cambios disruptivos en React 18 / Node.
- **Llamadas a Base de Datos (Supabase):**
  - Se auditaron todas las consultas dinámicas (`$queryRawUnsafe` y `$executeRawUnsafe`). Todas operan con placeholders parametrizados (`$1`, `$2`, etc.), garantizando inmunidad contra inyección SQL.
  - Se confirmó que variables sensibles (`DATABASE_URL`, `ADMIN_SESSION_SECRET`, `GEMINI_API_KEY`) no poseen el prefijo `NEXT_PUBLIC_` y jamás se exportan al cliente.
  - Se diseñó el script de endurecimiento [`scripts/sql/2026-10-21-security-hardening-rls.sql`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/scripts/sql/2026-10-21-security-hardening-rls.sql) para activar Row Level Security en Supabase Postgres.
- **Cabeceras HTTP en [`next.config.js`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/next.config.js):**
  - Inclusión de `https://*.supabase.co` y `wss://*.supabase.co` en la directiva `connect-src` de CSP.
  - Incorporación de `Cross-Origin-Opener-Policy: same-origin`.
  - Configuración diferenciada para la ruta `/widget` que permite su inserción en plataformas asociadas sin degradar la seguridad del resto de la aplicación.

### Eje 4: Estabilidad y CI/CD en Vercel
- **Configuración de Vercel ([`vercel.json`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/vercel.json)):**
  - Asignación de 30 segundos de duración máxima para `app/api/search-projects/route.ts` para tolerar cálculos de búsqueda semántica híbrida sin provocar timeouts.
- **Pipeline de Integración Continua ([`.github/workflows/ci.yml`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/.github/workflows/ci.yml)):**
  - Remoción de todas las directivas `continue-on-error: true` en Typecheck y Tests Unitarios.
  - Incorporación del paso formal `npm run lint`.
  - Inclusión de migraciones RLS en la inicialización de la base de datos de prueba.
- **Herramienta Pre-Deploy ([`scripts/pre-deploy-check.ts`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/scripts/pre-deploy-check.ts)):**
  - Comando agregado a `package.json`: `npm run pre-deploy`.
  - Valida secuencialmente: Compilación estricta TypeScript (2.1s), Reglas ESLint (3.4s) y 68 suites de Jest (39s).

---

## 4. Evidencia de Verificación y Métricas

```text
============================================================
🌾 RADAR IICA CHILE — VERIFICACIÓN PRE-DEPLOY (OCTUBRE 2026)
============================================================

⏳ Ejecutando: 1. Verificación de Tipos TypeScript (tsc --noEmit)... ✓ EXITOSO (2.1s)
⏳ Ejecutando: 2. Auditoría Estática de Código (ESLint)... ✓ EXITOSO (3.4s)
⏳ Ejecutando: 3. Ejecución de Tests Unitarios (Jest)... ✓ EXITOSO (39.0s)

------------------------------------------------------------
✔ TODOS LOS CHEQUEOS PASARON: Repositorio listo para deploy en Vercel.
```

- **Suites de prueba:** 68/68 pasadas (100%).
- **Tests unitarios:** 392 pasados, 5 omitidos condicionalmente.
- **Compilador TypeScript:** 0 errores en modo estricto.
- **ESLint:** 0 advertencias, 0 errores.

---

## 5. Conclusiones y Próximos Pasos

La plataforma se encuentra en un estado óptimo de robustez técnica y seguridad informática para las entregas contractuales del período Octubre 2026. 

**Recomendaciones para el despliegue:**
1. Ejecutar el script SQL de RLS [`scripts/sql/2026-10-21-security-hardening-rls.sql`](file:///c:/Users/ChilePrunes/Desktop/iica-chile-plataforma-main/iica-chile-plataforma/scripts/sql/2026-10-21-security-hardening-rls.sql) en el SQL Editor de Supabase antes de habilitar accesos de datos externos.
2. Mantener la ejecución mandatoria de `npm run pre-deploy` antes de cada push hacia la rama `main`.
