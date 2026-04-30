# IICA Chile — Plataforma Radar de Oportunidades

Portal de financiamiento agrícola para técnicos del IICA Chile. Agrega fondos nacionales e internacionales, permite postulación en línea, y ofrece búsqueda semántica con IA.

---

## Knowledge Graph

An automated knowledge graph of this codebase was generated using [graphify](https://github.com/safishamsi/graphify) on 2026-04-30.

- **2,186 nodes · 2,923 edges · 167 communities**
- **414× token reduction** versus reading the full corpus (1.97M tokens → ~4,764 per query)

Interactive graph: [`graphify-out/graph.html`](graphify-out/graph.html) — open in any browser, no server needed.
Raw graph data: [`graphify-out/graph.json`](graphify-out/graph.json)
Full audit report: [`graphify-out/GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md)

---

## Code Assessment (2026-04-30)

Full automated assessment across 7 dimensions using the knowledge graph.

### Summary

| Dimension | Status | Critical findings |
|---|---|---|
| Duplicate code | 🔴 Severe | 8 Flask entry points, 11 home templates, 5 search engines |
| Dead code | 🔴 Severe | 102 of 331 files have degree ≤ 1 in the graph |
| Over-engineering | 🟠 High | 3 god functions called by 40+ modules each |
| Tech stack fragmentation | 🔴 Severe | Flask + Next.js coexist; migration never completed |
| Production readiness | 🔴 Critical | No auth, no SECRET_KEY, dead database layer |
| Security | 🔴 Critical | Hardcoded secrets in git, CORS `*`, path traversal |
| Performance & observability | 🟠 High | Cache disabled, no error tracking, broken analytics |

---

### Dimension 1 — Duplicate Code

The codebase was never cleaned up between iterations. Every major feature was rewritten 2–8× and all versions left on disk:

| Category | Count | Canonical | Dead variants |
|---|---|---|---|
| Flask entry points | **8** | `app.py` | `app_iica_chile.py`, `app_iica_chile_mejorado.py`, `app_iica_chile_dinamico.py`, `app_iica_chile_optimized.py`, `app_iica_platform.py`, `app_working.py`, `app_enhanced.py` |
| Backup systems | **3 classes** | None wired | `BackupManager`, `AdvancedBackupSystem`, `MockBackupSystem` (inline in `app.py`) |
| Notification systems | **4 impls** | None wired | `NotificationManager`, `NotificationSystem`, `MockNotificationSystem`, `PushNotificationManager.tsx` |
| Analytics engines | **5 impls** | `lib/analyticsEngine.ts` | `analytics.py`, `advanced_analytics.py`, `advanced_reporting.py`, `lib/analytics.ts` |
| Search engines | **5 impls** | `lib/searchEngine.ts` | `ai_search_engine.py`, `auto_search_system.py`, `ProjectSearchEngine.tsx`, `SmartProjectSearch.tsx` |
| Home templates | **11 variants** | `templates/home.html` | `home_amigable` (degree 0), `home_didactico`, `home_estetico`, `home_iica_colors`, `home_iica_simple`, `home_ligero`, `home_mvp`, `home_ordenado`, `home_ordenado_mejorado`, `home_simple` |
| Detalle fondo templates | **4 variants** | `templates/detalle_fondo.html` | `_dinamico`, `_mejorado`, `_optimized` (all graph degree ≤ 1) |
| Proyecto detalle templates | **4 variants** | `templates/proyecto_detalle.html` | `_completo`, `_fortalecido`, `_institucional` |
| Data seed/load scripts | **~20 scripts** | — | `actualizar_con_bidprime.py`, `actualizar_con_corfo.py`, `add_adaptation_fund.py`, `add_international_funds.py`, `cargar_proyectos_adicionales.py`, `create_database_completa.py`, `strengthen_database.py` … |
| Scraper `_real` pairs | **3 pairs** | `_real` suffix | `corfo.py`/`corfo_real.py`, `iica_dashboard.py`/`iica_dashboard_real.py`, `tenderconsultants.py`/`tenderconsultants_real.py` |

`app.py` also embeds `MockBackupSystem`, `MockNotificationSystem`, `MockApplicationTracker`, `MockAdvancedReporting` as inline classes — confirming the real implementations were never wired in and mocks replaced them permanently.

---

### Dimension 2 — Dead Code

**102 of 331 files have graph degree ≤ 1** (nothing imports them, they import nothing meaningful).

**Fully isolated (degree 0) — safe first deletion candidates:**

```
auto_actualiza.py
create_excel.py
create_excel_completo.py
render_config.py
start_render.py          ← imports app_final.py which doesn't exist
wsgi.py                  ← imports app_enhanced.py which doesn't exist
update_projects_2026.py
tests/__init__.py
scripts/process_counterparts.py
```

**Critical dead code inside `app.py` itself (`app.py:149`):**

```python
# CACHÉ DESHABILITADO TEMPORALMENTE PARA FORZAR ACTUALIZACIONES
# @lru_cache(maxsize=1)
def _cargar_excel_cached():
```

The cache was disabled "temporarily" and never re-enabled. Every HTTP request now re-parses the Excel file from disk.

---

### Dimension 3 — Overcomplicated Implementation

**God nodes** (highest edge count in graph — signals missing abstraction):

| Rank | Node | Edges | Root cause |
|---|---|---|---|
| 1 | `clasificar_area()` | 47 | Called directly by 45 scrapers — missing `BaseScraper` |
| 2 | `parsear_fecha()` | 40 | Raw utility imported by every scraper individually |
| 3 | `parsear_monto()` | 39 | Same |
| 4 | `app.py` (file) | 40 | 1,611-line monolith: routes + mocks + data loading + CORS |
| 5 | `CacheManager.set()` | 26 | Called from 17 unrelated modules across 9 communities |
| 6 | `searchEngine.ts` | 21 | TF-IDF + stemmer + thesaurus + Levenshtein + inverted index in one file |
| 7 | `accessibility.ts` | 23 | 15+ unrelated concerns in one utility |

`utils.py` is the root cause of the top 3: it mixes date parsing, money parsing, and area taxonomy — three concerns all 43 scrapers import from directly instead of through a shared `BaseScraper` base class.

**Recommended refactors:**
1. Create `scrapers/base.py` with `BaseScraper` — inject `clasificar_area`, `parsear_fecha`, `parsear_monto` once, eliminating ~120 duplicate call edges
2. Split `utils.py` → `taxonomy.py`, `date_utils.py`, `money_utils.py`
3. Split `app.py` into Flask blueprints by domain (projects, auth, admin, api)
4. Delete dead infrastructure: `backup_system.py`, `backup_system_advanced.py`, `notification_system.py`, `notification_system_advanced.py`, `advanced_analytics.py`, `ai_search_engine.py` — all have 0 inbound imports

---

### Dimension 4 — Tech Stack Fragmentation & Inconsistencies

**The migration from Flask to Next.js was never completed.** Both stacks are active simultaneously:

- **Production app = Next.js** (deployed to Vercel, `vercel.json` present)
- **Flask app** = legacy, still has templates and routes, intended as backend API for Next.js but mostly bypassed

**Three simultaneous data sources for the same entity (`Project`):**

| Source | Technology | Consumer |
|---|---|---|
| `data/projects.json` | Static JSON bundled at build | `app/api/projects/route.ts` |
| `data/proyectos_reales_2026.xlsx` | Excel parsed with pandas | Flask `app.py` |
| `prisma/schema.prisma` | PostgreSQL via Prisma | Defined; only call is commented out |
| `proyectos_base.py` | Hardcoded Python list | Flask `app.py` fallback |

**The core domain entity has 5 different names across the stack:**

| Name | Used in |
|---|---|
| `proyecto` | Flask routes, templates, Python models |
| `fondo` | Flask routes, Prisma `model Fondo` |
| `fund` / `project` | Next.js TypeScript (`lib/types.ts`) |
| `financiamiento` | Template names, UI labels |
| `ProjectOpportunity` | Scraper dataclass in `real_sources_scraper.py` |

**API endpoint duplication:** `/api/fondos` and `/api/estadisticas` are each defined in **5 separate Flask files**. The Next.js equivalent uses English paths (`/api/projects`) with no shared contract between the two stacks.

---

### Dimension 5 — Production Readiness Gaps

| Gap | Severity | Location |
|---|---|---|
| No authentication enforced on any route | Critical | `app.py` — no Flask-Login init |
| No `SECRET_KEY` configured | Critical | `app.py` — Flask uses random key per restart |
| Dead database layer — SQLAlchemy never initialized | High | `app.py` — `db.init_app()` never called |
| `wsgi.py` and `start_render.py` import non-existent files | High | Both crash on import |
| Deployment command not in source control | High | Only in Render dashboard |
| No CI pipeline runs tests on push | High | `.github/workflows/` has only data pipelines |
| `/mis-aplicaciones` IDOR — user ID via `?email=` query param | High | `app.py` route |
| `/download-csv/<filename>` — no `secure_filename()` | High | `app.py` — path traversal possible |
| 10 Python tests, several accept 404 as pass | Medium | `tests/test_app.py` |
| `/health` endpoint checks nothing | Medium | `app.py:1416` |

---

### Dimension 6 — Security

| Issue | Severity | Location |
|---|---|---|
| 5 legacy files have hardcoded `secret_key` in git | Critical | `app_iica_chile*.py` |
| Active `app.py` sets no `SECRET_KEY` at all | Critical | `app.py` |
| CORS set to `*` for all `/api/*` including write ops | High | `app.py:95` |
| 8 Excel data files committed to git (may contain real data) | High | `data/*.xlsx` |
| `security.py` (rate limiting, token auth, sanitization) never imported | High | `app.py` |
| `security.py` SQL queries use `.format()` — injection risk | Medium | `security.py:284,294,305` |
| `ai_routes.py` uses `@login_required` — blueprint never registered | Medium | `ai_routes.py` |

---

### Dimension 7 — Performance & Observability

**Performance:**

| Issue | Severity | Location |
|---|---|---|
| `@lru_cache` disabled, Excel parsed on every request | High | `app.py:149` |
| `app/api/projects/route.ts` returns full dataset, no pagination | Medium | `route.ts:12` |
| `/api/proyectos` has no `per_page` maximum — full dump possible | Medium | `app.py:1262` |

**Observability:**

| Issue | Severity | Location |
|---|---|---|
| All diagnostics via `print()`, no `logging.basicConfig` | High | `app.py` |
| No error tracking service (Sentry, Datadog) wired up | High | `app.py`, `next.config.js` |
| Web Vitals POSTed to `/api/analytics/web-vitals` — route doesn't exist | Medium | `app/layout.tsx:174` |
| `gtag` called but Google Analytics script never loaded | Low | `lib/performance.ts:32` |
| `/health` returns healthy with no data source check | Medium | `app.py:1416` |

---

### Scraping Architecture

**TL;DR: mostly manual and disconnected from the running app.**

Three trigger mechanisms exist, none connected to each other or to the live data the app serves:

#### 1. GitHub Actions — Weekly automated (`.github/workflows/discover-projects.yml`)
Runs every Monday at 12:00 UTC. **Does not scrape websites** — calls the **Anthropic Claude API** with the `web_search` tool. Claude runs 8 search queries, identifies grant opportunities, deduplicates by URL, and commits results to `data/discovered-projects.json`. Flask reads `.xlsx` only — this JSON is never consumed by the app.

#### 2. `auto_search_system.py` — Has scheduler, must be started manually
Has a `schedule` library loop (`every day at 06:00`, `every 6 hours`). Makes real HTTP requests to CORFO, INDAP, FIA, Adaptation Fund, FAO, World Bank, GCF. Writes to `data/auto_search_results.json`. Never started by `app.py` — requires manual execution.

#### 3. `auto_actualiza.py` — Fully manual, 3 lines
Calls `recolectar_todos()` then `guardar_excel()`. Must be triggered by hand.

#### Scraper quality (43 files):
- **~25% are stubs** — return hardcoded data with no HTTP request (e.g., `scrapers/bid.py` returns one hardcoded dict with a fixed 2025 date)
- **~50% make real requests** but use generic CSS selectors that likely return empty results against live sites
- **~25% are genuine implementations** (e.g., `real_sources_scraper.py`) with retry logic, proper User-Agent, structured dataclasses

#### Data never reaches the running app:
The only data `app.py` actually loads is `proyectos_base.py` (hardcoded Python list) + `data/proyectos_reales_2026.xlsx` (manually curated). **In practice the data served is static and manually maintained.**

---

### Priority Action List

1. **Delete** the 7 redundant Flask app variants (`app_iica_chile*.py`, `app_working.py`, `app_enhanced.py`)
2. **Delete** dead infrastructure with 0 consumers: `backup_system.py`, `backup_system_advanced.py`, `notification_system.py`, `notification_system_advanced.py`, `advanced_analytics.py`, `ai_search_engine.py`
3. **Delete** 9 of 11 home template variants, keeping only `templates/home.html`
4. **Set `SECRET_KEY`** from environment variable in `app.py`
5. **Wire `security.py`** into `app.py` (rate limiting, sanitization)
6. **Re-enable `@lru_cache`** on `_cargar_excel_cached()` or replace with startup-time load
7. **Fix CORS** — replace `origins: "*"` with explicit allowed origins
8. **Apply `secure_filename()`** to `/download-csv/<filename>`
9. **Add CI workflow** that runs `pytest` and `next build` on every push
10. **Connect scrapers** to a real pipeline: scraper → database → API → app (currently all three links are broken)
