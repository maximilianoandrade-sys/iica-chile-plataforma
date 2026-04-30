# Graph Report - .  (2026-04-30)

## Corpus Check
- Large corpus: 331 files · ~1,478,931 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 2186 nodes · 2923 edges · 86 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 331 edges (avg confidence: 0.78)
- Token cost: 27,700 input · 7,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Flask UI & API Layer|Flask UI & API Layer]]
- [[_COMMUNITY_Data Parsing & Utilities|Data Parsing & Utilities]]
- [[_COMMUNITY_Next.js App Router|Next.js App Router]]
- [[_COMMUNITY_Auto-Search & Data Pipeline|Auto-Search & Data Pipeline]]
- [[_COMMUNITY_Core Flask Application|Core Flask Application]]
- [[_COMMUNITY_AIGemini Chat Routes|AI/Gemini Chat Routes]]
- [[_COMMUNITY_BIDPrime Data Updater|BIDPrime Data Updater]]
- [[_COMMUNITY_Accessibility & ARIA Utils|Accessibility & ARIA Utils]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_React UI Components|React UI Components]]
- [[_COMMUNITY_Flask Optimized Backend|Flask Optimized Backend]]
- [[_COMMUNITY_Backup System|Backup System]]
- [[_COMMUNITY_Flask IICA Mejorado|Flask IICA Mejorado]]
- [[_COMMUNITY_Flask IICA Chile|Flask IICA Chile]]
- [[_COMMUNITY_Flask Dynamic App|Flask Dynamic App]]
- [[_COMMUNITY_Advanced Analytics Engine|Advanced Analytics Engine]]
- [[_COMMUNITY_Platform Assets & Docs|Platform Assets & Docs]]
- [[_COMMUNITY_Web Scrapers|Web Scrapers]]
- [[_COMMUNITY_AI Recommendations Engine|AI Recommendations Engine]]
- [[_COMMUNITY_Next.js Routing & SEO|Next.js Routing & SEO]]
- [[_COMMUNITY_Security & Rate Limiting|Security & Rate Limiting]]
- [[_COMMUNITY_Advanced Backup System|Advanced Backup System]]
- [[_COMMUNITY_Notification Manager|Notification Manager]]
- [[_COMMUNITY_Flask Platform App|Flask Platform App]]
- [[_COMMUNITY_Missing Sources Updater|Missing Sources Updater]]
- [[_COMMUNITY_Analytics Manager|Analytics Manager]]
- [[_COMMUNITY_AI Search Engine|AI Search Engine]]
- [[_COMMUNITY_Application System|Application System]]
- [[_COMMUNITY_Advanced Reporting|Advanced Reporting]]
- [[_COMMUNITY_Cache Manager|Cache Manager]]
- [[_COMMUNITY_API Client & Health|API Client & Health]]
- [[_COMMUNITY_Application Tracker|Application Tracker]]
- [[_COMMUNITY_Project List UI|Project List UI]]
- [[_COMMUNITY_Additional Sources Updater|Additional Sources Updater]]
- [[_COMMUNITY_Link Manager|Link Manager]]
- [[_COMMUNITY_INDAP Scraper|INDAP Scraper]]
- [[_COMMUNITY_Automatic Sources|Automatic Sources]]
- [[_COMMUNITY_Notification System|Notification System]]
- [[_COMMUNITY_Mass Project Search|Mass Project Search]]
- [[_COMMUNITY_International Sources|International Sources]]
- [[_COMMUNITY_Mass Projects Updater|Mass Projects Updater]]
- [[_COMMUNITY_Gemini AI Service|Gemini AI Service]]
- [[_COMMUNITY_PWA & Push Notifications|PWA & Push Notifications]]
- [[_COMMUNITY_Fund Management Forms|Fund Management Forms]]
- [[_COMMUNITY_CORFO Data Updater|CORFO Data Updater]]
- [[_COMMUNITY_Semantic Search Utils|Semantic Search Utils]]
- [[_COMMUNITY_Database Config|Database Config]]
- [[_COMMUNITY_Links Management|Links Management]]
- [[_COMMUNITY_Projects Loader|Projects Loader]]
- [[_COMMUNITY_App Configuration|App Configuration]]
- [[_COMMUNITY_Database Initialization|Database Initialization]]
- [[_COMMUNITY_Advanced Services|Advanced Services]]
- [[_COMMUNITY_Render Deployment Config|Render Deployment Config]]
- [[_COMMUNITY_Multi-Step Navigation|Multi-Step Navigation]]
- [[_COMMUNITY_Project Search Engine|Project Search Engine]]
- [[_COMMUNITY_Admin Panel|Admin Panel]]
- [[_COMMUNITY_Adaptation Fund Loader|Adaptation Fund Loader]]
- [[_COMMUNITY_Document Enricher|Document Enricher]]
- [[_COMMUNITY_Database Enricher|Database Enricher]]
- [[_COMMUNITY_Real Data Generator|Real Data Generator]]
- [[_COMMUNITY_Complete Funds Updater|Complete Funds Updater]]
- [[_COMMUNITY_International Funds Loader|International Funds Loader]]
- [[_COMMUNITY_INDAP Scraper Example|INDAP Scraper Example]]
- [[_COMMUNITY_Pipeline Task Manager|Pipeline Task Manager]]
- [[_COMMUNITY_App Sharing|App Sharing]]
- [[_COMMUNITY_Site Header|Site Header]]
- [[_COMMUNITY_Service Worker|Service Worker]]
- [[_COMMUNITY_News Domain|News Domain]]
- [[_COMMUNITY_Blockchain Hash|Blockchain Hash]]
- [[_COMMUNITY_SII Validation Mock|SII Validation Mock]]
- [[_COMMUNITY_Predictive Analytics Mock|Predictive Analytics Mock]]
- [[_COMMUNITY_PostgreSQL Checker|PostgreSQL Checker]]
- [[_COMMUNITY_DB Info Getter|DB Info Getter]]
- [[_COMMUNITY_Windows Path Config|Windows Path Config]]
- [[_COMMUNITY_Web Vitals Monitoring|Web Vitals Monitoring]]
- [[_COMMUNITY_Project Comparator Docs|Project Comparator Docs]]
- [[_COMMUNITY_Git Diff Log|Git Diff Log]]
- [[_COMMUNITY_Git History|Git History]]
- [[_COMMUNITY_Python Runtime|Python Runtime]]
- [[_COMMUNITY_IICA Logo SVG|IICA Logo SVG]]
- [[_COMMUNITY_IICA Official Logo|IICA Official Logo]]
- [[_COMMUNITY_IICA Chile Banner|IICA Chile Banner]]
- [[_COMMUNITY_Quienes Somos Page|Quienes Somos Page]]
- [[_COMMUNITY_Home Amigable|Home Amigable]]
- [[_COMMUNITY_Mis Postulaciones Route|Mis Postulaciones Route]]
- [[_COMMUNITY_CNR Institution|CNR Institution]]

## God Nodes (most connected - your core abstractions)
1. `clasificar_area()` - 47 edges
2. `parsear_fecha()` - 40 edges
3. `parsear_monto()` - 39 edges
4. `Fondo` - 31 edges
5. `IICA Chile Plataforma — Radar de Oportunidades agricultural funding platform for IICA Chile technicians` - 25 edges
6. `BackupManager` - 22 edges
7. `AdvancedAnalytics` - 21 edges
8. `parse_with_bs4()` - 20 edges
9. `fetch_html()` - 19 edges
10. `AIRecommendationEngine` - 18 edges

## Surprising Connections (you probably didn't know these)
- `IICA Chile Plataforma — Radar de Oportunidades agricultural funding platform for IICA Chile technicians` --uses_hero_image--> `public/agricultural-field.png — Hero image: aerial view of vineyard rows and vegetable crops in a Chilean valley with Andean mountains in background, workers visible`  [INFERRED]
  docs/informe_avances_feb2026.md → public/agricultural-field.png
- `IICA Chile Plataforma — Radar de Oportunidades agricultural funding platform for IICA Chile technicians` --uses_app_icon--> `app/icon.svg — IICA platform app icon: dark blue rounded square (#002D72) with green triangle (#A5C63B) pointing up (mountain/growth motif)`  [EXTRACTED]
  docs/informe_avances_feb2026.md → app/icon.svg
- `IICA Chile Plataforma — Radar de Oportunidades agricultural funding platform for IICA Chile technicians` --displays_partner_logo--> `public/logos/cnr.png — Logo of CNR (Comisión Nacional de Riego Chile): blue water droplet with Chilean flag star and 'CNR' acronym`  [EXTRACTED]
  docs/informe_avances_feb2026.md → public/logos/cnr.png
- `IICA Chile Plataforma — Radar de Oportunidades agricultural funding platform for IICA Chile technicians` --displays_partner_logo--> `public/logos/corfo.png — Logo of CORFO Chile: red gear with upward arrow and Chile map silhouette, 'CORFO CHILE' text`  [EXTRACTED]
  docs/informe_avances_feb2026.md → public/logos/corfo.png
- `IICA Chile Plataforma — Radar de Oportunidades agricultural funding platform for IICA Chile technicians` --displays_partner_logo--> `public/logos/fia.png — Logo of FIA (Fundación para la Innovación Agraria Chile): green leaf with lightbulb/gear motif, green-orange gradient`  [EXTRACTED]
  docs/informe_avances_feb2026.md → public/logos/fia.png

## Hyperedges (group relationships)
- **Tres Fases de Implementación completadas al 100% (Seguridad + Semántica + Rural)** — fases_fase1_seguridad, fases_fase2_semantica, fases_fase3_rural [EXTRACTED 1.00]
- **Stack de deploy multi-plataforma (Render, Vercel, Railway, Heroku)** — deploy_render_service, vercel_deploy_guide, deploy_guide_railway, deploy_guide_heroku [INFERRED 0.85]
- **Puntos de entrada de la aplicación Flask (app.py, app_final.py, app_enhanced.py, app_working.py)** — solucion_render_app_entry, solucion_404_app_final, deploy_app_enhanced, bitacora_app_working [EXTRACTED 0.90]
- **Fuentes de financiamiento integradas (nacionales e internacionales)** — bitacora_fuentes_nacionales, bitacora_fuentes_internacionales, bitacora_adaptation_fund, readme_mejorada_fondos_nacionales, readme_mejorada_fondos_internacionales [EXTRACTED 1.00]
- **Problemas de configuración en Render y sus soluciones** — render_npm_ci_error, render_build_command, solucion_render_cache, solucion_render_gunicorn, render_setup_prisma [EXTRACTED 0.95]
- **Main Navigation Pages (base_mvp navbar)** — base_mvp_template, about_page, dashboard_page, adjudicados_page, awarded_page [EXTRACTED 0.95]
- **Detalle Fondo Template Variants** — detalle_fondo_page, detalle_fondo_dinamico_page, detalle_fondo_mejorado_page, detalle_fondo_optimized_page [INFERRED 0.80]
- **Dashboard Template Variants** — dashboard_page, dashboard_avanzado_page, dashboard_iica_page, dashboard_iica_completo_page, dashboard_simple_page [INFERRED 0.75]
- **AI-powered Feature Pages** — ai_search_page, chatbot_page, busqueda_avanzada_page [INFERRED 0.80]
- **Agregar Fondo Template Variants** — agregar_fondo_page, agregar_fondo_dinamico_page [INFERRED 0.85]
- **Shared Fondo Search/Filter UI Pattern** — fondos_page, fondos_disponibles_page, fondos_disponibles_dinamico_page, fondos_internacionales_page, fondos_optimized_page, fondos_abiertos_dinamico_page [INFERRED 0.90]
- **PWA-Enabled Pages (Service Worker + Manifest)** — home_page, home_institucional_page [EXTRACTED 1.00]
- **Home Page Variants** — home_page, home_actualizado_page, home_amigable_page, home_institucional_page, home_institucional_completo_page [INFERRED 0.85]
- **Postulacion User Flow** — home_page, detalle_proyecto_page, formulario_postulacion_page, postular_endpoint [EXTRACTED 1.00]
- **Pages Consuming /api/fondos** — fondos_page, fondos_disponibles_dinamico_page, fondos_internacionales_page [EXTRACTED 1.00]
- **Home page UI variant group** — home_ligero_page, home_mvp_page, home_ordenado_page, home_ordenado_mejorado_page, home_simple_page [INFERRED 0.90]
- **Index/Portal page UI variant group** — index_page, index_dinamico_page, index_mejorado_page, index_optimized_page [INFERRED 0.85]
- **Postulación user flow** — postulacion_fondo_page, api_postulacion, postulacion_exitosa_page, mis_postulaciones_page [EXTRACTED 1.00]
- **IICA Partner Institutions (Chile government)** — institution_indap, institution_fia, institution_cnr, institution_minagri, institution_sag [EXTRACTED 1.00]
- **IICA International Partner Institutions** — institution_fao, institution_undp, institution_banco_mundial, institution_bid [EXTRACTED 1.00]
- **User personal pages group** — mis_aplicaciones_page, mis_favoritos_page, mis_postulaciones_page, notificaciones_page [INFERRED 0.90]
- **PWA assets (manifest + service worker)** — static_sw_js, static_manifest_json, home_mvp_page, home_ordenado_mejorado_page [EXTRACTED 1.00]
- **Postulacion Submission Workflow** — postulaciones_page, postular_page, api_postular_endpoint, postulacion_entity, fondo_entity [INFERRED 0.90]
- **Proyecto Detail Page Variants** — proyecto_detalle_page, proyecto_detalle_completo_page, proyecto_detalle_fortalecido_page, proyecto_detalle_institucional_page [INFERRED 0.85]
- **User Registration Flow** — register_page, registro_page, usuario_entity, route_login [EXTRACTED 1.00]
- **Proyectos Listing Pages** — todos_los_proyectos_page, todos_los_proyectos_mejorado_page, proyecto_entity, fuente_financiamiento_entity [INFERRED 0.90]
- **Main Navigation Cluster** — route_home, route_todos_proyectos, route_quienes_somos, route_dashboard [EXTRACTED 1.00]

## Communities

### Community 0 - "Flask UI & API Layer"
Cohesion: 0.02
Nodes (152): POST /actualizar Endpoint, Proyectos Adjudicados Page (static), AI: Asistente IA Gemini (chatbot), Buscador Inteligente IA, API POST /api/actualizar-proyectos, API POST /api/ai/chat, API POST /api/ai-search, API POST /api/backup/create (+144 more)

### Community 1 - "Data Parsing & Utilities"
Cohesion: 0.03
Nodes (109): clasificar_area(), formatear_monto_visual(), parsear_fecha(), parsear_monto(), Extrae monto y moneda y devuelve una representación normalizada.      Ejemplos, Formatea un monto para mostrar con decimales y separadores de miles de forma vis, Clasifica un proyecto según áreas temáticas institucionales del IICA Chile., Normaliza una fecha a formato ISO (YYYY-MM-DD).      Acepta formatos comunes c (+101 more)

### Community 2 - "Next.js App Router"
Cohesion: 0.03
Nodes (51): GET(), generateProposal(), getAllCallLinks(), parseCall(), cacheLinkStatus(), checkLinkStatus(), generateGoogleSearchUrl(), generateWaybackUrl() (+43 more)

### Community 3 - "Auto-Search & Data Pipeline"
Cohesion: 0.03
Nodes (40): AutoSearchSystem, Inicia el sistema de búsqueda automática, Sistema de búsqueda automática diaria en páginas web, Búsqueda diaria completa en todas las fuentes, Búsqueda rápida cada 6 horas, Busca proyectos en una fuente específica, Extrae información de un elemento HTML, Determina el área de interés basada en el texto (+32 more)

### Community 4 - "Core Flask Application"
Cohesion: 0.04
Nodes (69): ai_search(), api_exportar_csv(), api_notificaciones(), api_proyectos(), backup_page(), calcular_estadisticas(), cargar_excel(), _cargar_excel_cached() (+61 more)

### Community 5 - "AI/Gemini Chat Routes"
Cohesion: 0.04
Nodes (51): chat(), generar_carta(), Rutas de API para Google Gemini AI Endpoints para chatbot y funcionalidades de, Validar elegibilidad con IA          GET /api/ai/validar-elegibilidad/<fondo_i, Endpoint de chatbot con Gemini          POST /api/ai/chat     Body: {, Obtener recomendaciones de fondos con IA          GET /api/ai/recomendaciones, Generar carta de presentación con IA          POST /api/ai/generar-carta/<fond, recomendaciones_ia() (+43 more)

### Community 6 - "BIDPrime Data Updater"
Cohesion: 0.04
Nodes (56): actualizar_base_datos_bidprime(), mostrar_proyectos_bidprime(), Actualiza la base de datos con proyectos de BIDPrime, Muestra los proyectos de BIDPrime encontrados, Verifica que los enlaces de BIDPrime sean válidos, verificar_enlaces_bidprime(), actualizar_base_datos_completa(), mostrar_resumen_fuentes() (+48 more)

### Community 7 - "Accessibility & ARIA Utils"
Cohesion: 0.04
Nodes (28): createAccessibleDescription(), FocusManager, FocusTrap, generateAriaId(), getContrastRatio(), getLuminance(), hexToRgb(), KeyboardNavigationManager (+20 more)

### Community 8 - "Project Documentation"
Cohesion: 0.04
Nodes (60): Antigravity AI (desarrollador de la plataforma), Adaptation Fund (15 proyectos), APIs REST (/api/proyectos, /api/analytics, /api/postulacion, /api/ai-search), app_working.py - Aplicación Flask Principal, Paleta de Colores IICA (#2E7D32 verde, #1976D2 azul, #FF6F00 naranja), Dashboard con Chart.js y Analytics, Flask Backend (Python 3.13.7, Flask 3.1.2), Frontend Stack (HTML5, CSS3, JS, Bootstrap 5.3.0, Chart.js) (+52 more)

### Community 9 - "React UI Components"
Cohesion: 0.05
Nodes (21): InstitutionLogo(), getLogoUrl(), handleCalendar(), handleClick(), handleGoogleCalendar(), handleWhatsApp(), toggleExpand(), getLogoUrl() (+13 more)

### Community 10 - "Flask Optimized Backend"
Cohesion: 0.06
Nodes (31): actualizacion_automatica_avanzada(), actualizar_fondos(), api_estadisticas(), api_fondos(), detalle_fondo(), exportar(), fondos(), IICAChilePlatformOptimized (+23 more)

### Community 11 - "Backup System"
Cohesion: 0.06
Nodes (23): BackupManager, init_backup_system(), Sistema de Respaldo Automático para la Plataforma IICA Mantiene copias de segur, Respaldar bases de datos, Respaldar archivos de configuración, Respaldar código fuente, Comprime el respaldo en un archivo ZIP, Limpia respaldos antiguos (+15 more)

### Community 12 - "Flask IICA Mejorado"
Cohesion: 0.06
Nodes (29): agregar_fondo(), api_estadisticas(), api_fondos(), detalle_fondo(), exportar(), fondos_disponibles(), IICAChilePlatformMejorado, index() (+21 more)

### Community 13 - "Flask IICA Chile"
Cohesion: 0.06
Nodes (31): actualizacion_automatica(), actualizar_fondos(), api_estadisticas(), api_fondos(), detalle_fondo(), exportar(), fondos(), IICAChilePlatform (+23 more)

### Community 14 - "Flask Dynamic App"
Cohesion: 0.06
Nodes (30): agregar_fondo(), api_agregar_fondo(), api_agregar_postulacion(), api_estadisticas(), api_fondos(), detalle_fondo(), exportar_excel(), fondos_abiertos() (+22 more)

### Community 15 - "Advanced Analytics Engine"
Cohesion: 0.08
Nodes (20): AdvancedAnalytics, Análisis sectoral de proyectos, Análisis financiero detallado, Análisis temporal de proyectos, Obtiene análisis completo de los proyectos, Genera recomendaciones basadas en el análisis, Calcula el monto total de un DataFrame, Calcula el monto promedio de un DataFrame (+12 more)

### Community 16 - "Platform Assets & Docs"
Cohesion: 0.06
Nodes (40): public/agricultural-field.png — Hero image: aerial view of vineyard rows and vegetable crops in a Chilean valley with Andean mountains in background, workers visible, lib/analyticsEngine.ts — KPI calculation engine: urgencyScore (40% temporal + 35% viability + 25% role), CSV export with 16 fields, app/icon.svg — IICA platform app icon: dark blue rounded square (#002D72) with green triangle (#A5C63B) pointing up (mountain/growth motif), Backup strategy — GitHub + OneDrive + local backup recommended for project persistence, CNR — Comisión Nacional de Riego Chile (national irrigation commission), Commit by maximilianoandrade-sys — Apr 8 2026: AI-generated changes preserving original design (512 files changed), CORFO — Corporación de Fomento de la Producción Chile (economic development agency), FIA — Fundación para la Innovación Agraria Chile (agricultural innovation foundation) (+32 more)

### Community 17 - "Web Scrapers"
Cohesion: 0.1
Nodes (25): clean_text(), compute_iica_role(), CorfoScraper, FiaScraper, FontagroScraper, IicaGlobalScraper, IndapScraper, infer_category() (+17 more)

### Community 18 - "AI Recommendations Engine"
Cohesion: 0.07
Nodes (18): AIRecommendationEngine, Sistema de Recomendaciones con IA para la Plataforma IICA Recomienda proyectos, Extrae características de texto de un proyecto, Entrena el modelo de similitud, Crea clusters de proyectos similares, Guarda el modelo entrenado, Carga el modelo entrenado, Obtiene proyectos similares a uno dado (+10 more)

### Community 19 - "Next.js Routing & SEO"
Cohesion: 0.08
Nodes (24): sitemap(), checkLinkForUpdates(), formatNotificationMessage(), GET(), getFromCache(), isAuthorized(), POST(), saveToCache() (+16 more)

### Community 20 - "Security & Rate Limiting"
Cohesion: 0.06
Nodes (22): rate_limit(), Sistema de Seguridad Avanzado para la Plataforma IICA Protección contra ataques, Valida un token de API, Verifica si una IP ha excedido el límite de velocidad, Registra un intento de acceso, Verifica si una IP está bloqueada, Registra actividad sospechosa, Detecta patrones de ataque (+14 more)

### Community 21 - "Advanced Backup System"
Cohesion: 0.08
Nodes (16): AdvancedBackupSystem, Sistema Avanzado de Backup para IICA Chile Backup automático, versionado y recu, Backup de archivos estáticos, Crear archivo de metadatos del backup, Listar archivos incluidos en el backup, Calcular tamaño del backup en MB, Comprimir backup en archivo ZIP, Limpiar backups antiguos (+8 more)

### Community 22 - "Notification Manager"
Cohesion: 0.08
Nodes (16): NotificationManager, Sistema de Notificaciones Inteligente para la Plataforma IICA Notifica sobre nu, Desuscribe un usuario, Agrega un proyecto nuevo para notificación, Obtiene suscriptores que podrían estar interesados en un proyecto, Parsea el monto de un string a float, Envía una notificación por email, Registra una notificación enviada (+8 more)

### Community 23 - "Flask Platform App"
Cohesion: 0.08
Nodes (22): actualizar_fondos(), api_estadisticas(), api_fondos(), api_postular(), detalle_fondo(), fondos(), IICAPlatform, postulaciones() (+14 more)

### Community 24 - "Missing Sources Updater"
Cohesion: 0.1
Nodes (27): actualizar_base_datos_fuentes_web_faltantes(), main(), mostrar_proyectos_por_tipo_financiamiento(), mostrar_resumen(), Muestra un resumen de la actualización, Actualiza la base de datos con fuentes web faltantes, Verifica los proyectos web faltantes agregados, Muestra proyectos organizados por tipo de financiamiento (+19 more)

### Community 25 - "Analytics Manager"
Cohesion: 0.08
Nodes (14): AnalyticsManager, Sistema de Analytics Avanzado para la Plataforma IICA Rastrea comportamiento de, Rastrea un clic en un proyecto, Rastrea una exportación, Rastrea el rendimiento, Obtiene analytics de búsquedas, Inicializa la base de datos de analytics, Obtiene analytics de proyectos (+6 more)

### Community 26 - "AI Search Engine"
Cohesion: 0.1
Nodes (13): AISearchEngine, Extrae palabras clave relevantes, Extrae filtros específicos de la consulta, Extrae rango de montos de la consulta, Sugiere áreas basadas en las palabras clave, Busca proyectos basado en la consulta parseada, Calcula la puntuación de relevancia de un proyecto, Parsea el monto de string a float (+5 more)

### Community 27 - "Application System"
Cohesion: 0.09
Nodes (13): ApplicationSystem, Crea requisitos específicos para cada proyecto, Obtiene la plantilla de postulación para un tipo de proyecto, Obtiene los requisitos para un tipo de proyecto, Envía una postulación a un proyecto, Inicializa los archivos del sistema de postulación, Obtiene todas las postulaciones para un proyecto, Obtiene una postulación específica por ID (+5 more)

### Community 28 - "Advanced Reporting"
Cohesion: 0.1
Nodes (13): AdvancedReporting, Sistema de Reportes Avanzados para IICA Chile Genera reportes detallados, análi, Analizar datos financieros, Categorizar montos en rangos, Analizar fuentes de financiamiento, Generar recomendaciones basadas en el análisis, Generar gráficos y convertirlos a base64, Guardar reporte en archivo (+5 more)

### Community 29 - "Cache Manager"
Cohesion: 0.1
Nodes (17): cache_estadisticas(), cache_proyectos(), cached(), CacheManager, cleanup_cache(), invalidate_cache(), Sistema de caché avanzado para la plataforma IICA Optimiza el rendimiento y red, Decorador específico para cachear proyectos (+9 more)

### Community 30 - "API Client & Health"
Cohesion: 0.08
Nodes (22): client(), Prueba que la página de detalle de proyecto funciona, Prueba que el favicon responde correctamente, Prueba que las páginas no encontradas devuelven 404, Prueba que los archivos estáticos se sirven correctamente, Cliente de prueba para la aplicación, Prueba que la página principal carga correctamente, Prueba que el endpoint de salud funciona (+14 more)

### Community 31 - "Application Tracker"
Cohesion: 0.1
Nodes (12): ApplicationTracker, Sistema de Seguimiento de Aplicaciones para IICA Chile Permite a los usuarios h, Calcular tasa de éxito de aplicaciones, Obtener aplicaciones recientes, Cargar aplicaciones desde archivo JSON, Guardar aplicaciones en archivo JSON, Crear nueva aplicación, Actualizar estado de aplicación (+4 more)

### Community 32 - "Project List UI"
Cohesion: 0.19
Nodes (18): ProjectListContainer(), bigrams(), buildDynamicSuggestions(), buildProjectCorpus(), defaultSortProjects(), expandNaturalLanguage(), expandSearchTerms(), generateSearchSuggestions() (+10 more)

### Community 33 - "Additional Sources Updater"
Cohesion: 0.13
Nodes (19): actualizar_base_datos_fuentes_adicionales(), main(), mostrar_proyectos_por_categoria(), mostrar_resumen(), Muestra un resumen de la actualización, Verifica los proyectos adicionales agregados, Actualiza la base de datos con fuentes adicionales, Muestra proyectos organizados por categoría (+11 more)

### Community 34 - "Link Manager"
Cohesion: 0.15
Nodes (9): LinkManager, Obtiene todos los enlaces relevantes para un proyecto, Verifica todos los enlaces de una lista de proyectos, Carga enlaces específicos para Render, Genera reporte de verificación de enlaces, Enlaces por defecto si no existe el archivo, Verifica si un enlace es funcional, Limpia y normaliza una URL (+1 more)

### Community 35 - "INDAP Scraper"
Cohesion: 0.15
Nodes (11): IndapScraperMejorado, obtener_fondos_indap(), Scraper INDAP Mejorado Obtiene fondos actualizados de INDAP con manejo robusto, Extraer enlace del elemento, Convertir fecha chilena a objeto date, Extraer monto numérico, Scraper robusto para fondos INDAP, Función principal para obtener fondos INDAP (+3 more)

### Community 36 - "Automatic Sources"
Cohesion: 0.12
Nodes (9): ejecutar_scraping_completo(), FuentesAutomaticas, Scraping de Fondos.gob.cl, Scraping de Tenders Global, Scraping de la Unión Europea, Scraping del Banco Interamericano de Desarrollo, Obtener fondos de todas las fuentes automáticas, Ejecutar scraping completo de todas las fuentes (+1 more)

### Community 37 - "Notification System"
Cohesion: 0.12
Nodes (9): NotificationSystem, Sistema Avanzado de Notificaciones para IICA Chile Notificaciones en tiempo rea, Obtener notificaciones, Marcar notificación como leída, Obtener estadísticas de notificaciones, Agregar suscriptor a notificaciones, Crear nueva notificación, Enviar notificación a suscriptores relevantes (+1 more)

### Community 38 - "Mass Project Search"
Cohesion: 0.12
Nodes (16): buscar_proyectos_anid(), buscar_proyectos_bancoestado(), buscar_proyectos_corfo(), buscar_proyectos_fundaciones(), buscar_proyectos_indap(), buscar_proyectos_internacionales(), buscar_todos_los_proyectos(), guardar_proyectos_nuevos() (+8 more)

### Community 39 - "International Sources"
Cohesion: 0.17
Nodes (16): obtener_proyectos_devex(), obtener_proyectos_embajada_australia(), obtener_proyectos_embajada_canada(), obtener_proyectos_ford(), obtener_proyectos_kellogg(), obtener_proyectos_rockefeller(), obtener_proyectos_terra_viva(), obtener_todos_proyectos_fundaciones() (+8 more)

### Community 40 - "Mass Projects Updater"
Cohesion: 0.16
Nodes (15): actualizar_base_datos_proyectos_masivos(), main(), mostrar_proyectos_por_fuente(), mostrar_resumen(), Muestra un resumen de la actualización, Actualiza la base de datos con proyectos masivos online, Verifica los proyectos masivos agregados, Muestra proyectos organizados por fuente (+7 more)

### Community 41 - "Gemini AI Service"
Cohesion: 0.14
Nodes (8): GeminiService, Servicio de IA con Google Gemini Chatbot y recomendaciones inteligentes para ag, Generar recomendaciones inteligentes de fondos usando IA                  Args, Servicio para interactuar con Google Gemini AI, Inicializar servicio Gemini, Generar carta de presentación para postulación                  Args:, Validar si el usuario cumple requisitos del fondo                  Returns:, Chatbot asistente para agricultores                  Args:             mensaj

### Community 42 - "PWA & Push Notifications"
Cohesion: 0.14
Nodes (2): PWAInstallBanner(), useInstallPrompt()

### Community 43 - "Fund Management Forms"
Cohesion: 0.18
Nodes (14): Agregar Fondo Dinámico (AJAX), Agregar Nuevo Fondo (static form), API: POST /actualizar, API POST /api/agregar-fondo, API: GET /api/estadisticas, API: GET /exportar-excel, Index Dinámico (Gestión de Fondos), Index Mejorado (UI variant) (+6 more)

### Community 44 - "CORFO Data Updater"
Cohesion: 0.21
Nodes (11): actualizar_base_datos_corfo(), main(), mostrar_resumen(), Muestra un resumen de la actualización, Verifica los proyectos de CORFO agregados, Actualiza la base de datos con proyectos de CORFO, verificar_proyectos_corfo(), obtener_proyectos_corfo_por_filtros() (+3 more)

### Community 45 - "Semantic Search Utils"
Cohesion: 0.33
Nodes (12): calculateTermFrequency(), cosineSimilarity(), createVector(), dotProduct(), expandNaturalLanguage(), expandSearchTerms(), generateSearchSuggestions(), hybridSearch() (+4 more)

### Community 46 - "Database Config"
Cohesion: 0.22
Nodes (8): Config, DevelopmentConfig, get_config(), ProductionConfig, Configuración de Base de Datos Soporta PostgreSQL (producción) y SQLite (desarr, Configuración para desarrollo, Configuración para producción, Obtener configuración según entorno

### Community 47 - "Links Management"
Cohesion: 0.33
Nodes (9): actualizar_base_datos_con_enlaces_funcionales(), crear_archivo_enlaces_render(), crear_enlaces_funcionales(), generar_reporte_enlaces_funcionales(), main(), Crea enlaces funcionales basados en sitios reales, Crea archivo de enlaces para Render, Genera reporte de enlaces funcionales (+1 more)

### Community 48 - "Projects Loader"
Cohesion: 0.29
Nodes (9): agregar_proyectos_a_base_datos(), cargar_proyectos_existentes(), crear_proyectos_adicionales(), generar_estadisticas_actualizadas(), main(), Carga proyectos existentes de la base de datos, Crea proyectos adicionales basados en fuentes reales, Agrega proyectos adicionales a la base de datos existente (+1 more)

### Community 49 - "App Configuration"
Cohesion: 0.36
Nodes (7): Config, DevelopmentConfig, ProductionConfig, Configuración para desarrollo, Configuración para producción, Configuración para testing, TestingConfig

### Community 50 - "Database Initialization"
Cohesion: 0.36
Nodes (7): crear_base_datos_reforzada(), generar_estadisticas(), guardar_base_datos(), main(), Crea una base de datos completamente reforzada, Guarda la base de datos en Excel, Genera estadísticas de la base de datos

### Community 51 - "Advanced Services"
Cohesion: 0.25
Nodes (4): AnalyticsService, BlockchainService, MockGovernmentAPI, Servicios avanzados para IICA Chile Incluye: Blockchain Hashing, Mock APIs, Uti

### Community 53 - "Render Deployment Config"
Cohesion: 0.4
Nodes (4): Configuración específica para Render, Inicia la aplicación para Render - ACTUALIZADO para usar app_enhanced, setup_render(), start_app()

### Community 55 - "Multi-Step Navigation"
Cohesion: 0.5
Nodes (2): applyFilters(), handleNext()

### Community 56 - "Project Search Engine"
Cohesion: 0.4
Nodes (2): handleKeyDown(), handleSearch()

### Community 57 - "Admin Panel"
Cohesion: 0.4
Nodes (5): Panel Administrativo, Dashboard Avanzado, Role: Admin User, Route /notificaciones, Route /reportes

### Community 58 - "Adaptation Fund Loader"
Cohesion: 0.67
Nodes (3): agregar_adaptation_fund(), main(), Agrega proyectos del Adaptation Fund a la base de datos

### Community 59 - "Document Enricher"
Cohesion: 0.67
Nodes (3): fortalecer_documentos(), main(), Fortalecer la sección de documentos con documentos específicos por área de proye

### Community 60 - "Database Enricher"
Cohesion: 0.67
Nodes (3): fortalecer_base_datos(), main(), Fortalecer la base de datos con enlaces directos y datos mejorados

### Community 61 - "Real Data Generator"
Cohesion: 0.5
Nodes (3): generate_excel_file(), Script to generate funding opportunities data from research on: - Devex.com -, Generate Excel file with funding opportunities

### Community 62 - "Complete Funds Updater"
Cohesion: 0.67
Nodes (3): actualizar_fondos_completos(), main(), Actualiza la base de datos con fondos más recientes y variados

### Community 63 - "International Funds Loader"
Cohesion: 0.67
Nodes (3): agregar_fondos_internacionales(), main(), Agrega proyectos de fondos internacionales adicionales

### Community 67 - "INDAP Scraper Example"
Cohesion: 0.67
Nodes (3): main(), Example scraper function for INDAP, scrape_indap()

### Community 68 - "Pipeline Task Manager"
Cohesion: 0.83
Nodes (3): addPipelineTask(), getPipelineTasks(), savePipelineTasks()

### Community 70 - "App Sharing"
Cohesion: 0.67
Nodes (1): Script para compartir la aplicación IICA con ngrok

### Community 73 - "Site Header"
Cohesion: 1.0
Nodes (2): getUrgentCount(), Header()

### Community 75 - "Service Worker"
Cohesion: 1.0
Nodes (2): n(), r()

### Community 116 - "News Domain"
Cohesion: 1.0
Nodes (2): Domain Entity: Noticia, Noticias Dinámicas (News)

### Community 121 - "Blockchain Hash"
Cohesion: 1.0
Nodes (1): Genera un hash SHA-256 inmutable para trazabilidad

### Community 122 - "SII Validation Mock"
Cohesion: 1.0
Nodes (1): Mock de validación SII/Registro Civil

### Community 123 - "Predictive Analytics Mock"
Cohesion: 1.0
Nodes (1): Mock de datos analíticos predictivos

### Community 126 - "PostgreSQL Checker"
Cohesion: 1.0
Nodes (1): Verificar si estamos usando PostgreSQL

### Community 127 - "DB Info Getter"
Cohesion: 1.0
Nodes (1): Obtener información de la BD

### Community 154 - "Windows Path Config"
Cohesion: 1.0
Nodes (1): Ruta del Proyecto en Windows (OneDrive - IICA)

### Community 155 - "Web Vitals Monitoring"
Cohesion: 1.0
Nodes (1): Web Vitals Monitoring (LCP, FID, CLS)

### Community 156 - "Project Comparator Docs"
Cohesion: 1.0
Nodes (1): Comparador de Proyectos (hasta 3 simultáneos)

### Community 157 - "Git Diff Log"
Cohesion: 1.0
Nodes (1): .agent/ACTUALIZACION_ENLACES_FONDOS.md (diff)

### Community 158 - "Git History"
Cohesion: 1.0
Nodes (1): git_log.txt — Full project git history log

### Community 159 - "Python Runtime"
Cohesion: 1.0
Nodes (1): runtime.txt — Python 3.11.9 runtime specification

### Community 160 - "IICA Logo SVG"
Cohesion: 1.0
Nodes (1): static/logo_iica.svg — IICA logo: circular badge with green 'IICA' text, agricultural curve and crop dots motif

### Community 161 - "IICA Official Logo"
Cohesion: 1.0
Nodes (1): static/logo_iica_oficial.svg — IICA official logo: circular badge with gradient IICA text, agriculture leaf/crop field motif in green and blue

### Community 162 - "IICA Chile Banner"
Cohesion: 1.0
Nodes (1): static/logos/logo_iica_oficial.svg — IICA Chile banner logo: blue-to-green gradient rectangle with 'IICA' and 'CHILE' text in white

### Community 163 - "Quienes Somos Page"
Cohesion: 1.0
Nodes (1): Quiénes Somos Page

### Community 164 - "Home Amigable"
Cohesion: 1.0
Nodes (1): Home Amigable Page

### Community 165 - "Mis Postulaciones Route"
Cohesion: 1.0
Nodes (1): Route: /mis-postulaciones

### Community 166 - "CNR Institution"
Cohesion: 1.0
Nodes (1): Institution: CNR

## Knowledge Gaps
- **701 isolated node(s):** `Agrega proyectos del Adaptation Fund a la base de datos`, `Motor de búsqueda inteligente similar a Perplexity`, `Analiza la consulta del usuario y extrae intenciones`, `Detecta la intención del usuario`, `Extrae palabras clave relevantes` (+696 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `PWA & Push Notifications`** (14 nodes): `PWAInstallBanner()`, `PWAInstallBanner.tsx`, `showLocalNotification()`, `usePWA.ts`, `urlBase64ToUint8Array()`, `useBackgroundSync()`, `useBatteryStatus()`, `useCacheManagement()`, `useInstallPrompt()`, `useNetworkInformation()`, `useOfflineDetection()`, `usePushNotifications()`, `useServiceWorker()`, `useWebShare()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Multi-Step Navigation`** (5 nodes): `applyFilters()`, `handleBack()`, `handleNext()`, `skipWizard()`, `ProfilingWizard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Search Engine`** (5 nodes): `getSourceMeta()`, `handleKeyDown()`, `ProjectSearchEngine.tsx`, `handleSearch()`, `SimpleModeWizard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Sharing`** (3 nodes): `Script para compartir la aplicación IICA con ngrok`, `share_app()`, `share_app.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Site Header`** (3 nodes): `getUrgentCount()`, `Header()`, `Header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Service Worker`** (3 nodes): `sw.js`, `n()`, `r()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `News Domain`** (2 nodes): `Domain Entity: Noticia`, `Noticias Dinámicas (News)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Blockchain Hash`** (1 nodes): `Genera un hash SHA-256 inmutable para trazabilidad`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SII Validation Mock`** (1 nodes): `Mock de validación SII/Registro Civil`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Predictive Analytics Mock`** (1 nodes): `Mock de datos analíticos predictivos`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostgreSQL Checker`** (1 nodes): `Verificar si estamos usando PostgreSQL`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DB Info Getter`** (1 nodes): `Obtener información de la BD`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Windows Path Config`** (1 nodes): `Ruta del Proyecto en Windows (OneDrive - IICA)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Web Vitals Monitoring`** (1 nodes): `Web Vitals Monitoring (LCP, FID, CLS)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Comparator Docs`** (1 nodes): `Comparador de Proyectos (hasta 3 simultáneos)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Git Diff Log`** (1 nodes): `.agent/ACTUALIZACION_ENLACES_FONDOS.md (diff)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Git History`** (1 nodes): `git_log.txt — Full project git history log`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Python Runtime`** (1 nodes): `runtime.txt — Python 3.11.9 runtime specification`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `IICA Logo SVG`** (1 nodes): `static/logo_iica.svg — IICA logo: circular badge with green 'IICA' text, agricultural curve and crop dots motif`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `IICA Official Logo`** (1 nodes): `static/logo_iica_oficial.svg — IICA official logo: circular badge with gradient IICA text, agriculture leaf/crop field motif in green and blue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `IICA Chile Banner`** (1 nodes): `static/logos/logo_iica_oficial.svg — IICA Chile banner logo: blue-to-green gradient rectangle with 'IICA' and 'CHILE' text in white`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Quienes Somos Page`** (1 nodes): `Quiénes Somos Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Home Amigable`** (1 nodes): `Home Amigable Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mis Postulaciones Route`** (1 nodes): `Route: /mis-postulaciones`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CNR Institution`** (1 nodes): `Institution: CNR`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `parsear_monto()` connect `Data Parsing & Utilities` to `Core Flask Application`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `home()` connect `Core Flask Application` to `Data Parsing & Utilities`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `actualizar_base_datos_completa()` connect `BIDPrime Data Updater` to `Auto-Search & Data Pipeline`, `International Sources`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 45 inferred relationships involving `clasificar_area()` (e.g. with `convertir_proyectos_raw_a_formato()` and `obtener_proyectos_fao()`) actually correct?**
  _`clasificar_area()` has 45 INFERRED edges - model-reasoned connections that need verification._
- **Are the 38 inferred relationships involving `parsear_fecha()` (e.g. with `obtener_proyectos_fao()` and `obtener_proyectos_bid()`) actually correct?**
  _`parsear_fecha()` has 38 INFERRED edges - model-reasoned connections that need verification._
- **Are the 37 inferred relationships involving `parsear_monto()` (e.g. with `home()` and `obtener_proyectos_fao()`) actually correct?**
  _`parsear_monto()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `Fondo` (e.g. with `Rutas de API para Google Gemini AI Endpoints para chatbot y funcionalidades de` and `Endpoint de chatbot con Gemini          POST /api/ai/chat     Body: {`) actually correct?**
  _`Fondo` has 25 INFERRED edges - model-reasoned connections that need verification._