# Plan de Implementación: Dashboard del Técnico IICA 2026

## Objetivos
Transformar el catálogo simple en una herramienta de gestión técnica avanzada con filtros de precisión, persistencia de usuario y soporte multilingüe.

## 1. Arquitectura de Datos (MANDATORY)
El archivo `data/projects.json` debe evolucionar para soportar la nueva lógica.
**Nuevos Campos Requeridos:**
- `monto_min` & `monto_max` (Number, para slider)
- `plazo_ejecucion_meses` (Number, para filtro de rangos)
- `tipos_postulante` (Array: "Persona natural", "Empresa", etc.)
- `requiere_cofinanciamiento` (Boolean)
- `idioma` (Enum: "es", "en", "multi")
- `faq_disponible` (Boolean)
- `webinar_url` / `webinar_fecha` (String/Date, nullable)
- `permite_adendas` (Boolean)
- `estado_bases` (Enum: "publicadas", "borrador", "no_disponibles")
- `firma_acreditada` (Boolean)

## 2. Componentes UI/UX

### Filtros Avanzados (`components/AdvancedFilters.tsx`)
- [ ] **Slider de Monto**: Rango dinámico basado en min/max del JSON.
- [ ] **Radio Groups / Chips**:
    - Plazo (<12, 12-24, >24).
    - Postulante (Multi-select).
    - Idioma.
- [ ] **Switch**: Cofinanciamiento y Requiere Firma.

### Tarjeta de Proyecto (`components/ProjectCard.tsx` - Refactor de `ProjectList`)
- [ ] **Header Semántico**:
    - Semáforo (🟢/🟡/🔴) para documentacion.
    - Badges para FAQ (❓) y Webinar (📅).
- [ ] **Badges Técnicos**:
    - Firma Acreditada.
    - Modificaciones (Adendas).

### Herramientas de Productividad
- [ ] **Pinning**: Guardar IDs en `localStorage` y forzar orden al inicio.
- [ ] **Historial**: `localStorage` de últimos 5 IDs visitados.
- [ ] **Impresión**: CSS `@media print` para ocultar header/footer/filtros.

## 3. Internacionalización (i18n)
- [ ] Crear contexto de idioma (`LanguageContext`).
- [ ] Diccionarios JSON (`locales/es.json`, `en.json`, `pt.json`).
- [ ] Reemplazar textos hardcodeados con función `t('key')`.

## 4. Ejecución Inmediata (Sesión Actual)
1. Actualizar `projects.json` con estructura completa.
2. Actualizar `ProjectList` para renderizar los nuevos metadatos visuales.
3. Implementar contadores por institución.
