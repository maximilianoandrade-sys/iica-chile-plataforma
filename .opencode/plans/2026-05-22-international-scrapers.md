# International Scrapers Implementation Plan (World Bank + UNGM)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two international procurement scrapers (World Bank API + UNGM) to the ingestion pipeline, giving Chilean agricultural stakeholders visibility into international funding opportunities.

**Architecture:** Each scraper implements the existing `Scraper` interface, outputs `RawProject[]` with `ambito: "Internacional"` and `idioma: "en"`, and is registered in the shared registry. The persistence layer (`upsertProject`) already handles dedup, embedding, and source linking — no changes needed there. The existing UI filter chips already support `ambito: "Internacional"` filtering.

**Tech Stack:** TypeScript, Node.js fetch API (no external HTTP libs), Jest for testing, Prisma seed for Source registration.

---

## File Structure

| Path | Action | Responsibility |
|------|--------|---------------|
| `lib/ingestion/scrapers/world-bank.ts` | Create | World Bank Procurement Notices scraper (REST JSON API) |
| `lib/ingestion/scrapers/ungm.ts` | Create | UNGM scraper (POST-based search API) |
| `lib/ingestion/registry.ts` | Modify | Register both new scrapers |
| `lib/ingestion/types.ts` | Modify | Add optional `idioma` field to `RawProject` |
| `lib/ingestion/persistence.ts` | Modify | Persist `idioma` from RawProject to DB |
| `scripts/seed-sources.ts` | Modify | Add Source entries for world-bank and ungm |
| `tests/lib/ingestion/scrapers/world-bank.test.ts` | Create | Unit tests for World Bank scraper |
| `tests/lib/ingestion/scrapers/ungm.test.ts` | Create | Unit tests for UNGM scraper |

---

## Task 1: Extend RawProject with `idioma` field

**Files:**
- Modify: `lib/ingestion/types.ts:1-19`
- Modify: `lib/ingestion/persistence.ts:34-50`

- [ ] **Step 1: Add `idioma` to `RawProject` interface**

```typescript
// lib/ingestion/types.ts — add after line 18 (ambito field)
  idioma?: "es" | "en" | "pt" | "fr";
```

The full interface becomes:

```typescript
export interface RawProject {
  title: string;
  institution: string;
  url: string;
  canonicalKey?: string;
  deadline?: Date | null;
  budget?: string | null;
  description?: string;
  tags?: string[];
  region?: string;
  ambito?: "Nacional" | "Internacional" | "Regional";
  idioma?: "es" | "en" | "pt" | "fr";
}
```

- [ ] **Step 2: Persist `idioma` in upsertProject**

In `lib/ingestion/persistence.ts`, add `idioma` to the `baseFields` object (around line 50):

```typescript
  const baseFields = {
    nombre: raw.title,
    institucion: raw.institution,
    url_bases: raw.url,
    fecha_cierre: raw.deadline ?? new Date("2099-12-31"),
    monto: parseAmount(raw.budget || "") ?? 0,
    montoTexto: raw.budget?.trim() || null,
    estado: "Abierto",
    categoria: raw.tags?.[0] ?? "General",
    objetivo: raw.description ?? "",
    ambito: raw.ambito ?? "Nacional",
    idioma: raw.idioma ?? "es",
    region: raw.region ?? null,
    lastSeenAt: now,
  };
```

- [ ] **Step 3: Run existing tests to verify no regressions**

Run: `npx jest --passWithNoTests`
Expected: All 187+ tests pass (idioma defaults to "es" so existing scrapers unchanged).

- [ ] **Step 4: Commit**

```bash
git add lib/ingestion/types.ts lib/ingestion/persistence.ts
git commit -m "feat(ingestion): add idioma field to RawProject for multilingual sources"
```

---

## Task 2: World Bank Procurement Scraper

**Files:**
- Create: `lib/ingestion/scrapers/world-bank.ts`
- Test: `tests/lib/ingestion/scrapers/world-bank.test.ts`

### Context

World Bank API endpoint:
```
GET https://search.worldbank.org/api/v2/procnotices?format=json&qterm=agriculture&countrycode=CL&rows=50
```

Response shape:
```json
{
  "total": 128000,
  "rows": "50",
  "procnotices": {
    "1234567": {
      "id": "1234567",
      "notice_type": "Request for Expression of Interest",
      "project_name": "Chile Agricultural Modernization",
      "bid_description": "Consulting services for...",
      "submission_deadline_date": "2026-07-15T23:59:59Z",
      "procurement_method_name": "Quality and Cost Based",
      "noticeurl": "https://projects.worldbank.org/...",
      "contact_name": "John Doe",
      "borrower_country": "Chile"
    }
  }
}
```

- [ ] **Step 1: Write the failing test**

Create `tests/lib/ingestion/scrapers/world-bank.test.ts`:

```typescript
/**
 * @jest-environment node
 */
import { worldBankScraper } from "../../../../lib/ingestion/scrapers/world-bank";

global.fetch = jest.fn();

const MOCK_RESPONSE = {
  total: 2,
  rows: "50",
  procnotices: {
    "1001": {
      id: "1001",
      notice_type: "Request for Expression of Interest",
      project_name: "Chile Agricultural Modernization Project",
      bid_description: "Consulting services for irrigation systems upgrade in the Maule region.",
      submission_deadline_date: "2026-07-15T23:59:59Z",
      procurement_method_name: "Quality and Cost Based Selection",
      noticeurl: "https://projects.worldbank.org/en/projects-operations/procurement-detail/OP00123456",
      contact_name: "Juan Perez",
      borrower_country: "Chile",
    },
    "1002": {
      id: "1002",
      notice_type: "Invitation for Bids",
      project_name: "Sustainable Agriculture & Climate Resilience",
      bid_description: "Supply of precision farming equipment for smallholders.",
      submission_deadline_date: "2026-08-30T23:59:59Z",
      procurement_method_name: "International Competitive Bidding",
      noticeurl: "https://projects.worldbank.org/en/projects-operations/procurement-detail/OP00789012",
      contact_name: "Maria Gonzalez",
      borrower_country: "Chile",
    },
  },
};

describe("worldBankScraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("parses World Bank API response into RawProject array", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_RESPONSE),
    });

    const result = await worldBankScraper.scrape();

    expect(result.sourceSlug).toBe("world-bank");
    expect(result.projects).toHaveLength(2);
    expect(result.partialErrors).toHaveLength(0);

    const first = result.projects[0];
    expect(first.title).toBe("Chile Agricultural Modernization Project");
    expect(first.institution).toBe("World Bank");
    expect(first.url).toBe("https://projects.worldbank.org/en/projects-operations/procurement-detail/OP00123456");
    expect(first.deadline).toBeInstanceOf(Date);
    expect(first.deadline!.toISOString()).toBe("2026-07-15T23:59:59.000Z");
    expect(first.ambito).toBe("Internacional");
    expect(first.idioma).toBe("en");
    expect(first.description).toContain("irrigation systems");
    expect(first.tags).toContain("World Bank");
    expect(first.tags).toContain("Request for Expression of Interest");
  });

  it("handles empty procnotices object", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ total: 0, rows: "50", procnotices: {} }),
    });

    const result = await worldBankScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(0);
  });

  it("reports partial errors for notices missing noticeurl", async () => {
    const response = {
      total: 1,
      rows: "50",
      procnotices: {
        "2001": {
          id: "2001",
          project_name: "Orphan Notice",
          bid_description: "No URL here",
          // noticeurl missing
        },
      },
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const result = await worldBankScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(1);
    expect(result.partialErrors[0]).toContain("2001");
  });

  it("returns error when API returns non-200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
    });

    const result = await worldBankScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("HTTP 503");
  });

  it("handles fetch timeout/abort gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("AbortError"));

    const result = await worldBankScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("AbortError");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/lib/ingestion/scrapers/world-bank.test.ts --no-coverage`
Expected: FAIL — cannot find module `world-bank`

- [ ] **Step 3: Write the World Bank scraper implementation**

Create `lib/ingestion/scrapers/world-bank.ts`:

```typescript
/**
 * Scraper World Bank — usa la Procurement Notices API v2.
 *
 * Endpoint: https://search.worldbank.org/api/v2/procnotices
 * Parámetros clave:
 *   - format=json (devuelve JSON en lugar de XML)
 *   - qterm=agriculture (búsqueda textual)
 *   - countrycode=CL (Chile)
 *   - rows=100 (máximo por página)
 *
 * La API es pública, sin autenticación, con rate-limit generoso.
 * Devuelve un objeto con `procnotices` como dict {id: notice}.
 *
 * Cada notice tiene: id, project_name, bid_description, notice_type,
 * submission_deadline_date, procurement_method_name, noticeurl,
 * borrower_country, contact_name.
 */
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";

const logger = getLogger("WorldBankScraper");

interface WbNotice {
  id: string;
  notice_type?: string;
  project_name?: string;
  bid_description?: string;
  submission_deadline_date?: string;
  procurement_method_name?: string;
  noticeurl?: string;
  contact_name?: string;
  borrower_country?: string;
}

interface WbApiResponse {
  total: number;
  rows: string;
  procnotices: Record<string, WbNotice>;
}

const API_URL =
  "https://search.worldbank.org/api/v2/procnotices?format=json&qterm=agriculture&countrycode=CL&rows=100";

function parseDeadline(dateStr?: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export const worldBankScraper: Scraper = {
  slug: "world-bank",
  name: "World Bank Procurement",
  homepageUrl: "https://projects.worldbank.org/en/projects-operations/procurement",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let data: WbApiResponse;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(API_URL, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = (err as Error).message;
      logger.error("World Bank API fetch failed", err as Error);
      return { sourceSlug: this.slug, projects: [], partialErrors: [msg] };
    }

    const notices = data.procnotices ?? {};
    for (const [noticeId, notice] of Object.entries(notices)) {
      try {
        const url = notice.noticeurl;
        if (!url || !url.trim()) {
          partialErrors.push(`notice ${noticeId}: sin noticeurl`);
          continue;
        }

        const title = notice.project_name?.trim();
        if (!title) {
          partialErrors.push(`notice ${noticeId}: sin project_name`);
          continue;
        }

        const deadline = parseDeadline(notice.submission_deadline_date);
        const description = notice.bid_description
          ? cleanText(notice.bid_description).slice(0, 500)
          : undefined;

        const tags: string[] = ["World Bank"];
        if (notice.notice_type) tags.push(notice.notice_type);

        projects.push({
          title: cleanText(title),
          institution: "World Bank",
          url,
          canonicalKey: `worldbank-${noticeId}`,
          deadline,
          budget: null,
          description,
          tags,
          region: notice.borrower_country ?? "Chile",
          ambito: "Internacional",
          idioma: "en",
        });
      } catch (err) {
        partialErrors.push(`notice ${noticeId}: ${(err as Error).message}`);
      }
    }

    logger.info("World Bank scrape completed", {
      total: data.total,
      parsed: projects.length,
      errors: partialErrors.length,
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/lib/ingestion/scrapers/world-bank.test.ts --no-coverage`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/ingestion/scrapers/world-bank.ts tests/lib/ingestion/scrapers/world-bank.test.ts
git commit -m "feat(scraper): add World Bank Procurement Notices scraper via REST API"
```

---

## Task 3: UNGM Procurement Scraper

**Files:**
- Create: `lib/ingestion/scrapers/ungm.ts`
- Test: `tests/lib/ingestion/scrapers/ungm.test.ts`

### Context

UNGM (United Nations Global Marketplace) at ungm.org uses a POST-based search:
```
POST https://www.ungm.org/Public/Notice
Content-Type: application/json

{
  "PageIndex": 0,
  "PageSize": 50,
  "Title": "",
  "Description": "agriculture",
  "DeadlineFrom": "",
  "SortField": "DatePublished",
  "SortAscending": false,
  "isPagingReset": true,
  "NoticeTypes": [],
  "UNOrganizations": []
}
```

Response shape (JSON array):
```json
[
  {
    "ReferenceNo": "PROC-2026-001234",
    "Title": "Supply of Agricultural Inputs for FAO Chile",
    "Description": "Provision of seeds and fertilizers...",
    "OrganizationAcronym": "FAO",
    "Deadline": "2026-08-15T23:59:00Z",
    "PublishedDate": "2026-05-01T10:00:00Z",
    "UNSPSCDescription": "Agriculture and farming",
    "NoticeUrl": "/Public/Notice/123456"
  }
]
```

- [ ] **Step 1: Write the failing test**

Create `tests/lib/ingestion/scrapers/ungm.test.ts`:

```typescript
/**
 * @jest-environment node
 */
import { ungmScraper } from "../../../../lib/ingestion/scrapers/ungm";

global.fetch = jest.fn();

const MOCK_NOTICES = [
  {
    ReferenceNo: "PROC-2026-001234",
    Title: "Supply of Agricultural Inputs for FAO Chile",
    Description: "Provision of seeds, fertilizers, and pest control supplies for smallholder farmers.",
    OrganizationAcronym: "FAO",
    Deadline: "2026-08-15T23:59:00Z",
    PublishedDate: "2026-05-01T10:00:00Z",
    UNSPSCDescription: "Agriculture and farming",
    NoticeUrl: "/Public/Notice/123456",
  },
  {
    ReferenceNo: "PROC-2026-005678",
    Title: "Consultancy for Sustainable Irrigation in Latin America",
    Description: "Technical advisory for drip irrigation implementation.",
    OrganizationAcronym: "UNDP",
    Deadline: "2026-09-30T17:00:00Z",
    PublishedDate: "2026-05-10T08:00:00Z",
    UNSPSCDescription: "Water resources management",
    NoticeUrl: "/Public/Notice/789012",
  },
];

describe("ungmScraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("parses UNGM notice list into RawProject array", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_NOTICES),
    });

    const result = await ungmScraper.scrape();

    expect(result.sourceSlug).toBe("ungm");
    expect(result.projects).toHaveLength(2);
    expect(result.partialErrors).toHaveLength(0);

    const first = result.projects[0];
    expect(first.title).toBe("Supply of Agricultural Inputs for FAO Chile");
    expect(first.institution).toBe("FAO (UN)");
    expect(first.url).toBe("https://www.ungm.org/Public/Notice/123456");
    expect(first.canonicalKey).toBe("ungm-PROC-2026-001234");
    expect(first.deadline).toBeInstanceOf(Date);
    expect(first.deadline!.toISOString()).toBe("2026-08-15T23:59:00.000Z");
    expect(first.ambito).toBe("Internacional");
    expect(first.idioma).toBe("en");
    expect(first.tags).toContain("UNGM");
    expect(first.tags).toContain("FAO");
  });

  it("handles empty array response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(0);
  });

  it("reports partial errors for notices without Title", async () => {
    const notices = [
      {
        ReferenceNo: "NO-TITLE-001",
        Description: "Has description but no title",
        OrganizationAcronym: "WFP",
        Deadline: "2026-12-01T00:00:00Z",
        NoticeUrl: "/Public/Notice/999",
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(notices),
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(1);
    expect(result.partialErrors[0]).toContain("NO-TITLE-001");
  });

  it("returns error when UNGM API returns non-200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("HTTP 403");
  });

  it("handles network errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await ungmScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("ECONNREFUSED");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/lib/ingestion/scrapers/ungm.test.ts --no-coverage`
Expected: FAIL — cannot find module `ungm`

- [ ] **Step 3: Write the UNGM scraper implementation**

Create `lib/ingestion/scrapers/ungm.ts`:

```typescript
/**
 * Scraper UNGM — United Nations Global Marketplace.
 *
 * UNGM es la plataforma de procurement de todas las agencias UN (FAO, UNDP,
 * UNICEF, WFP, etc.). Usa una API POST para búsqueda de notices.
 *
 * Endpoint: POST https://www.ungm.org/Public/Notice
 * Content-Type: application/json
 * Body: { PageIndex, PageSize, Description:"agriculture", SortField, ... }
 *
 * La API devuelve un array de notices con: ReferenceNo, Title, Description,
 * OrganizationAcronym, Deadline, NoticeUrl (relative path).
 *
 * Sin autenticación requerida. Rate-limit no documentado pero es generoso
 * para volúmenes bajos (<5 requests/minuto).
 */
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";

const logger = getLogger("UNGMScraper");

interface UngmNotice {
  ReferenceNo?: string;
  Title?: string;
  Description?: string;
  OrganizationAcronym?: string;
  Deadline?: string;
  PublishedDate?: string;
  UNSPSCDescription?: string;
  NoticeUrl?: string;
}

const UNGM_BASE = "https://www.ungm.org";
const SEARCH_URL = `${UNGM_BASE}/Public/Notice`;

const SEARCH_BODY = {
  PageIndex: 0,
  PageSize: 50,
  Title: "",
  Description: "agriculture",
  DeadlineFrom: "",
  SortField: "DatePublished",
  SortAscending: false,
  isPagingReset: true,
  NoticeTypes: [],
  UNOrganizations: [],
};

function parseDeadline(dateStr?: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function buildNoticeUrl(relativePath?: string): string | null {
  if (!relativePath || !relativePath.trim()) return null;
  // NoticeUrl comes as "/Public/Notice/123456" — prepend base
  if (relativePath.startsWith("http")) return relativePath;
  return `${UNGM_BASE}${relativePath}`;
}

export const ungmScraper: Scraper = {
  slug: "ungm",
  name: "UNGM — United Nations Global Marketplace",
  homepageUrl: "https://www.ungm.org/Public/Notice",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let notices: UngmNotice[];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)",
        },
        body: JSON.stringify(SEARCH_BODY),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      notices = await res.json();
      if (!Array.isArray(notices)) throw new Error("Response is not an array");
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = (err as Error).message;
      logger.error("UNGM API fetch failed", err as Error);
      return { sourceSlug: this.slug, projects: [], partialErrors: [msg] };
    }

    for (const notice of notices) {
      try {
        const refNo = notice.ReferenceNo || "unknown";

        const title = notice.Title?.trim();
        if (!title) {
          partialErrors.push(`notice ${refNo}: sin Title`);
          continue;
        }

        const url = buildNoticeUrl(notice.NoticeUrl);
        if (!url) {
          partialErrors.push(`notice ${refNo}: sin NoticeUrl`);
          continue;
        }

        const deadline = parseDeadline(notice.Deadline);
        const description = notice.Description
          ? cleanText(notice.Description).slice(0, 500)
          : undefined;

        const org = notice.OrganizationAcronym || "UN";
        const tags: string[] = ["UNGM", org];
        if (notice.UNSPSCDescription) tags.push(notice.UNSPSCDescription);

        projects.push({
          title: cleanText(title),
          institution: `${org} (UN)`,
          url,
          canonicalKey: `ungm-${refNo}`,
          deadline,
          budget: null,
          description,
          tags,
          ambito: "Internacional",
          idioma: "en",
        });
      } catch (err) {
        const refNo = notice.ReferenceNo || "unknown";
        partialErrors.push(`notice ${refNo}: ${(err as Error).message}`);
      }
    }

    logger.info("UNGM scrape completed", {
      parsed: projects.length,
      errors: partialErrors.length,
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/lib/ingestion/scrapers/ungm.test.ts --no-coverage`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/ingestion/scrapers/ungm.ts tests/lib/ingestion/scrapers/ungm.test.ts
git commit -m "feat(scraper): add UNGM (United Nations Global Marketplace) scraper"
```

---

## Task 4: Register Scrapers & Seed Sources

**Files:**
- Modify: `lib/ingestion/registry.ts:1-32`
- Modify: `scripts/seed-sources.ts:3-12`

- [ ] **Step 1: Register both scrapers in the registry**

Modify `lib/ingestion/registry.ts`:

```typescript
import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { corfoScraper } from "./scrapers/corfo";
import { cnrScraper } from "./scrapers/cnr";
import { iicaHemisfericoScraper } from "./scrapers/iica-hemisferico";
import { worldBankScraper } from "./scrapers/world-bank";
import { ungmScraper } from "./scrapers/ungm";

/**
 * Scrapers de Capa A (determinísticos, corren diario vía GitHub Actions).
 *
 * QUÉ NO ESTÁ ACÁ Y POR QUÉ:
 * ─────────────────────────
 * - INDAP: opera con programas continuos (PRODESAL, PAP, PDI...) no
 *   convocatorias time-bound. La plata pública concreta va a Mercado
 *   Público (capturado en runtime por /api/search-projects). AI Discovery
 *   semanal cubre lo demás. El scraper inicial devolvía 0 hits.
 *
 * - FONTAGRO: el sitio no expone WP REST ni API pública. El scraper
 *   genérico de Cheerio devolvía 0 hits porque sus clases CSS no eran
 *   estándar. AI Discovery semanal lo captura mejor que un scraper
 *   roto. Los archivos lib/ingestion/scrapers/indap.ts y fontagro.ts
 *   se mantienen como referencia/punto de partida para reescribirlos
 *   con Playwright en el futuro si se invierte el tiempo.
 *
 * - IICA Dashboard (Playwright): requiere browser headless + cookie
 *   Cloudflare persistente. Se corre separadamente (ver export más abajo).
 */
export const scrapers: Scraper[] = [
  fiaScraper,
  corfoScraper,
  cnrScraper,
  iicaHemisfericoScraper,
  worldBankScraper,
  ungmScraper,
];

/**
 * Heavy scraper requiring Playwright (browser automation).
 * Run separately via: npx tsx scripts/scrape-iica-dashboard.ts
 * NOT included in the main `scrapers` array because it requires
 * Chromium binaries not available in serverless/Vercel.
 */
export { iicaDashboardScraper } from "./scrapers/iica-dashboard";
```

- [ ] **Step 2: Add Source entries to seed script**

Add these two entries to the `SOURCES` array in `scripts/seed-sources.ts`:

```typescript
const SOURCES = [
  { slug: "indap",            name: "INDAP",                                  type: "scraper",       homepageUrl: "https://www.indap.gob.cl/" },
  { slug: "fia",              name: "FIA — Fundación para la Innovación Agraria", type: "scraper", homepageUrl: "https://www.fia.cl/convocatorias/" },
  { slug: "corfo",            name: "CORFO",                                  type: "scraper",       homepageUrl: "https://www.corfo.cl/" },
  { slug: "fontagro",         name: "FONTAGRO",                               type: "scraper",       homepageUrl: "https://www.fontagro.org/es/iniciativas/convocatorias/" },
  { slug: "iica-hemisferico", name: "IICA Hemisférico",                       type: "scraper",       homepageUrl: "https://iica.int/es/licitaciones/" },
  { slug: "iica-dashboard",   name: "IICA Dashboard Proyectos (Contrapartes)", type: "scraper_playwright", homepageUrl: "https://apps.iica.int/dashboardproyectos/" },
  { slug: "cnr",              name: "CNR — Comisión Nacional de Riego",       type: "scraper",       homepageUrl: "https://www.cnr.gob.cl/agricultores/calendario-de-concurso/" },
  { slug: "ai-discovery",     name: "AI Discovery (Gemini + Google Search)",  type: "ai_discovery",  homepageUrl: null },
  { slug: "world-bank",       name: "World Bank Procurement",                 type: "scraper",       homepageUrl: "https://projects.worldbank.org/en/projects-operations/procurement" },
  { slug: "ungm",             name: "UNGM — United Nations Global Marketplace", type: "scraper",     homepageUrl: "https://www.ungm.org/Public/Notice" },
];
```

- [ ] **Step 3: Run the seed script to register sources**

Run: `npx tsx scripts/seed-sources.ts`
Expected: `OK: world-bank` and `OK: ungm` in output.

- [ ] **Step 4: Run full test suite**

Run: `npx jest --passWithNoTests`
Expected: All tests pass (existing + 10 new scraper tests).

- [ ] **Step 5: Commit**

```bash
git add lib/ingestion/registry.ts scripts/seed-sources.ts
git commit -m "feat(ingestion): register World Bank and UNGM scrapers in pipeline"
```

---

## Task 5: Integration Smoke Test

**Files:**
- No new files — manual verification steps

- [ ] **Step 1: Run scrapers locally**

Run: `npx tsx scripts/run-scrapers.ts`
Expected output includes lines like:
```
[world-bank] Iniciando...
[world-bank] Done: N ingestados (M crudos), status=success
[ungm] Iniciando...
[ungm] Done: N ingestados (M crudos), status=success
```

Note: UNGM may return 0 if their API requires specific headers or session cookies at runtime — this is acceptable as a known limitation to iterate on.

- [ ] **Step 2: Verify World Bank data in DB**

Run: `npx tsx -e "const prisma = require('./lib/prisma').default; prisma.project.findMany({where:{discoveredBy:'scraper',ambito:'Internacional',canonicalUrl:{startsWith:'worldbank'}},take:3,select:{nombre:true,institucion:true,ambito:true,idioma:true}}).then(console.log).finally(()=>prisma.$disconnect())"`

Expected: Array of projects with `ambito: "Internacional"`, `idioma: "en"`, `institucion: "World Bank"`.

- [ ] **Step 3: Verify UI filter shows "Internacional" chip with count > 0**

Run: `npm run dev` and navigate to http://localhost:3000.
Expected: The "Internacional" filter chip shows with a non-zero count badge.

- [ ] **Step 4: Run final build**

Run: `npm run build`
Expected: Build succeeds with no type errors.

- [ ] **Step 5: Commit if any fixes were needed**

Only if Steps 1-4 revealed issues that required code fixes.

```bash
git add -A
git commit -m "fix: address integration issues from international scraper smoke test"
```

---

## Mandatory Checks Verification

| Check | Status |
|-------|--------|
| No `console.*` — uses `getLogger('Module')` | OK — Both scrapers use `getLogger` |
| API routes use `createSuccessResponse` / `createErrorResponse` | N/A — no new API routes |
| Next.js 15+ async params | N/A — no new route handlers with params |
| No `process.env.X` in app code | OK — No env vars read in scrapers |
| Every new table has RLS | N/A — no new tables |
| After migration, regenerate types | N/A — no migrations |
| Supabase client init obeys SSR rules | N/A — uses Prisma directly |

---

## Notes

1. **UNGM API stability**: The UNGM POST endpoint at `/Public/Notice` may require session cookies or specific headers beyond what we've documented. If the scraper returns 403/0 results in production, the fallback approach is to use their RSS feed at `https://www.ungm.org/Public/Notice/RSSFeed` which is simpler but less structured.

2. **World Bank pagination**: The initial implementation fetches 100 notices (the API max per page). If we need more historical coverage, pagination via `os=100` (offset) can be added later — YAGNI for now.

3. **Existing `idioma` field**: The DB column already exists (`String @default("es")`), so no migration is needed. We just need to pass it through from `RawProject` to the `baseFields` in persistence.

4. **`validateUrl` consideration**: The URL validator does a HEAD request to verify the URL is live. World Bank URLs always work. UNGM relative URLs are converted to absolute (`https://www.ungm.org/Public/Notice/123456`) which should respond to HEAD. If UNGM blocks HEAD requests, we may need to add an allowlist in `validateUrl.ts` — but try without first.
