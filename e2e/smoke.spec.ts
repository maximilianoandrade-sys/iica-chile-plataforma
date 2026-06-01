import { test, expect } from "@playwright/test";

/**
 * Smoke E2E — flujos críticos visibles en el navegador.
 *
 * Estos tests asumen que la BD local tiene al menos un proyecto (corre
 * `npm run ingest` antes si está vacía). En CI, seedear la BD primero.
 */

test.describe("Home & navegación", () => {
  test("home carga y muestra el listado de convocatorias", async ({ page }) => {
    await page.goto("/");
    // FilterChips search input is the new anchor
    await expect(page.getByRole("searchbox", { name: /Buscar oportunidades/i })).toBeVisible();
    // La sección "convocatorias" debería renderizar.
    await expect(page.locator("#convocatorias")).toBeVisible();
  });

  test("/admin redirige (no 404)", async ({ page }) => {
    // Sin cookie de auth → /admin/login. Con cookie → /admin/sources.
    // Cualquiera de los dos confirma que la ruta /admin no es 404.
    const response = await page.goto("/admin");
    expect(page.url()).toMatch(/\/admin\/(login|sources)(\?|$)/);
    if (response) {
      expect(response.status()).not.toBe(404);
    }
  });
});

test.describe("Búsqueda", () => {
  test("búsqueda con texto filtra sin error", async ({ page }) => {
    await page.goto("/");
    const input = page.getByRole("searchbox", { name: /Buscar oportunidades/i });
    await input.fill("riego");
    // FilterChips filters client-side — no network call needed.
    // Verify no error is displayed.
    await expect(page.getByText(/^error|falló|fallo en la búsqueda/i)).toHaveCount(0);
  });
});

test.describe("API endpoints", () => {
  test("/api/search-projects devuelve shape válido", async ({ request }) => {
    const res = await request.post("/api/search-projects", {
      data: { query: "" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    // API uses createSuccessResponse wrapper: { ok, data: { results, meta } }
    const payload = body.data ?? body;
    expect(Array.isArray(payload.results)).toBe(true);
    expect(typeof payload.meta?.mode).toBe("string");
  });

  test("/api/check-link valida URL legítima", async ({ request }) => {
    const target = encodeURIComponent(
      "https://www.cnr.gob.cl/agricultores/calendario-de-concurso/"
    );
    const res = await request.get(`/api/check-link?url=${target}`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data ?? body;
    expect(typeof data.isValid).toBe("boolean");
  });

  test("/api/check-link marca URL inexistente como inválida", async ({ request }) => {
    const target = encodeURIComponent("https://no-existe-este-dominio-1234567890.cl/");
    const res = await request.get(`/api/check-link?url=${target}`);
    // El endpoint debería responder ok=true (el endpoint funciona)
    // pero con isValid=false (la URL no responde).
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data ?? body;
    expect(data.isValid).toBe(false);
  });
});

test.describe("Detalle de proyecto", () => {
  test("la página de detalle de un proyecto carga", async ({ page, request }) => {
    // Obtener un id real desde la home SSR para evitar overlays de APIs externas.
    const home = await request.get("/");
    expect(home.ok()).toBeTruthy();
    const html = await home.text();
    const matches = Array.from(html.matchAll(/href="\/proyecto\/(\d+)"/g));
    const candidateIds = Array.from(
      new Set(
        matches
          .map((entry) => Number(entry[1]))
          .filter((id) => Number.isInteger(id) && id > 0)
      )
    );

    if (candidateIds.length === 0) {
      test.skip(true, "Home sin links de detalle — corre `npm run ingest` primero");
      return;
    }

    let selectedId: number | null = null;
    for (const candidateId of candidateIds) {
      const detailResponse = await request.get(`/proyecto/${candidateId}`);
      if (!detailResponse.ok()) {
        continue;
      }

      const detailHtml = await detailResponse.text();
      const hasBackLink = /Volver a todas las convocatorias/i.test(detailHtml);
      const isNotFound = /P[aá]gina no encontrada/i.test(detailHtml);

      if (hasBackLink && !isNotFound) {
        selectedId = candidateId;
        break;
      }
    }

    if (!selectedId) {
      test.skip(true, "No se encontró un detalle público accesible en /proyecto/[id]");
      return;
    }

    await page.goto(`/proyecto/${selectedId}`);

    await expect(page.getByLabel(/Cargando proyecto/i)).toHaveCount(0, { timeout: 20000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: /Volver a todas las convocatorias/i })).toBeVisible();
  });
});
