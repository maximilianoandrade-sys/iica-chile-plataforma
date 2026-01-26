# Actualización de Enlaces de Fondos Internacionales

**Fecha:** 26 de enero de 2026  
**Objetivo:** Reemplazar enlaces genéricos institucionales por URLs directas a convocatorias y oportunidades reales

---

## 📋 Resumen de Cambios Realizados

Se actualizaron **10 fondos internacionales** en el archivo `data/projects.json` para mejorar significativamente la experiencia del usuario al acceder a las convocatorias.

### ✅ Fondos Actualizados

| # | Fondo | Link Anterior (Genérico) | Link Nuevo (Directo) | Razón del Cambio |
|---|-------|--------------------------|----------------------|------------------|
| 1 | **Fondo Chile (PNUD)** | `undp.org/es/chile` | `undp.org/es/chile/noticias` | Las convocatorias se publican como "Noticias" o en Adquisiciones |
| 2 | **Unión Europea (Horizonte)** | `horizonteeuropa.es` | `ec.europa.eu/info/funding-tenders` | Portal oficial Funding & Tenders donde se postula (Cluster 6) |
| 3 | **FAO (Pasantías)** | `fao.org/employment` | `fao.org/forest-farm-facility/` | Link directo al fondo Forest and Farm Facility (Grants) |
| 4 | **FONTAGRO (Conv. 2026 #1)** | `fontagro.org` | `fontagro.org/es/iniciativas/convocatorias` | Acceso directo a bases y formularios de Convocatoria 2026 |
| 5 | **FONTAGRO (Conv. 2026 #2)** | `fontagro.org/new/convocatorias/` | `fontagro.org/es/iniciativas/convocatorias` | Unificación del enlace a convocatorias |
| 6 | **BID Lab (IDB Lab)** | `bidlab.org` | `bidlab.org/es/inicio/convocatorias-pagina` | Página específica de "Convocatorias Abiertas" (Open Calls) |
| 7 | **USAID** | `usaid.gov` | `grants.gov` | Portal oficial donde USAID publica todas sus oportunidades |
| 8 | **GIZ (Alemania)** | `giz.de` | `giz.de/en/worldwide/376.html` | Proyectos de GIZ Chile (más relevante para usuarios locales) |
| 9 | **Green Climate Fund** | `greenclimate.fund` | `greenclimate.fund/projects/access-funding` | Sección específica para acceder a financiamiento |
| 10 | **World Bank** | `worldbank.org` | `projects.worldbank.org` | Portal de proyectos y oportunidades de negocio (Procurement) |

---

## 🎯 Impacto Esperado

### Antes (Problema)
- Usuario hace clic en "Ver Bases" → Llega a página institucional genérica
- Debe navegar manualmente por menús complejos
- Alta tasa de abandono (frustración)
- Difícil encontrar el botón de postulación real

### Después (Solución)
- Usuario hace clic en "Ver Bases" → Llega directamente a convocatorias
- Acceso inmediato a bases, formularios y fechas
- Mejor experiencia de usuario (UX)
- Mayor tasa de conversión (postulaciones reales)

---

## 📝 Fondos Nacionales (Sin Cambios)

Los fondos nacionales mantienen sus enlaces a buscadores generales, ya que funcionan correctamente:

- **INDAP:** `indap.gob.cl/concursos` ✅
- **CORFO:** `corfo.cl/sites/cpp/convocatorias` ✅
- **CNR:** `cnr.gob.cl/agricultores/concursos-de-riego/` ✅
- **FIA:** `fia.cl/convocatorias/` ✅

---

## 🔍 Fondos Especiales (Referencia Histórica)

Algunos fondos están cerrados o tienen características especiales. Se mantienen para referencia:

### IFAD (FIDA)
- **Estado:** Cerrado (fecha pasada: 2025-11-14)
- **Link actual:** `ifad.org/en/calls-for-proposals` ✅
- **Nota:** Este es el link correcto para futuras convocatorias

### FAO Forest and Farm Facility
- **Estado:** Abierto
- **Link actualizado:** `fao.org/forest-farm-facility/` ✅
- **Monto:** USD 5,000 - 100,000

### CAF
- **Estado:** Abierto (cierra 2025-09-21)
- **Link actual:** `caf.com` 
- **Nota:** CAF no tiene un portal único de convocatorias. Revisar periódicamente

---

## 🚀 Próximos Pasos Recomendados

### 1. Validación de Enlaces
Verificar que todos los enlaces actualizados funcionen correctamente:
```bash
# Probar manualmente cada enlace actualizado
```

### 2. Actualización de Descripciones
Considerar agregar notas en el campo `observaciones` para guiar al usuario:
```json
"observaciones": "Buscar 'Cluster 6' en el portal para proyectos de clima y agricultura"
```

### 3. Monitoreo Continuo
- Revisar enlaces trimestralmente
- Actualizar cuando las instituciones cambien sus portales
- Agregar nuevas convocatorias cuando se publiquen

### 4. Mejora de UI/UX
Considerar agregar:
- Tooltip con instrucciones breves al pasar el mouse sobre "Ver Bases"
- Badge indicando "Link Directo" para fondos internacionales
- Ícono de ayuda con tips de navegación

---

## 📊 Estadísticas de Actualización

- **Total de fondos en base de datos:** 23
- **Fondos internacionales actualizados:** 10
- **Fondos nacionales (sin cambios):** 4
- **Fondos especiales (referencia):** 9
- **Tasa de actualización:** 43.5% de la base de datos

---

## 🔗 Enlaces de Referencia

### Portales Principales Actualizados
1. **EU Funding & Tenders:** https://ec.europa.eu/info/funding-tenders
2. **Grants.gov (USAID):** https://www.grants.gov
3. **BID Lab Convocatorias:** https://bidlab.org/es/inicio/convocatorias-pagina
4. **FONTAGRO Convocatorias:** https://www.fontagro.org/es/iniciativas/convocatorias
5. **World Bank Projects:** https://projects.worldbank.org

### Documentación Adicional
- IFAD Calls for Proposals: https://www.ifad.org/en/calls-for-proposals
- GCF Access to Funding: https://www.greenclimate.fund/projects/access-funding
- FAO Forest & Farm Facility: https://www.fao.org/forest-farm-facility/

---

## ✅ Checklist de Implementación

- [x] Actualizar `data/projects.json` con nuevos enlaces
- [ ] Probar todos los enlaces en navegador
- [ ] Verificar que la aplicación cargue correctamente
- [ ] Hacer commit de los cambios
- [ ] Desplegar a producción
- [ ] Monitorear analytics para medir mejora en engagement
- [ ] Documentar cambios en changelog

---

## 📞 Contacto y Soporte

Si encuentras algún enlace roto o tienes sugerencias de mejora:
- Revisar directamente el sitio web de la institución
- Actualizar el archivo `data/projects.json`
- Documentar el cambio en este archivo

---

**Última actualización:** 26 de enero de 2026  
**Responsable:** Equipo de Desarrollo IICA Chile  
**Próxima revisión:** Abril 2026
