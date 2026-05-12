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
    // Algún elemento del listado debe aparecer; usamos el input de búsqueda
    // como ancla porque es el más estable estructuralmente.
    await expect(page.getByPlaceholder(/Buscar proyectos/i)).toBeVisible();
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
  test("búsqueda con query devuelve resultados sin error", async ({ page }) => {
    await page.goto("/");
    const input = page.getByPlaceholder(/Buscar proyectos/i);
    await input.fill("riego");
    // Click en el botón "Buscar con IA" — networkidle no funciona en dev
    // mode de Next.js porque HMR mantiene conexiones abiertas.
    const searchButton = page.getByRole("button", { name: /Buscar con IA/i });
    // Esperar a que la API responda escuchando el POST a /api/search-projects.
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes("/api/search-projects") && r.request().method() === "POST"
    );
    await searchButton.click();
    const apiResp = await responsePromise;
    expect(apiResp.ok()).toBeTruthy();
    // No esperamos un número exacto, pero NO debe mostrar error visible.
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
    expect(Array.isArray(body.results)).toBe(true);
    expect(typeof body.meta?.mode).toBe("string");
  });

  test("/api/check-link valida URL legítima", async ({ request }) => {
    const target = encodeURIComponent(
      "https://www.cnr.gob.cl/agricultores/calendario-de-concurso/"
    );
    const res = await request.get(`/api/check-link?url=${target}`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(typeof body.isValid).toBe("boolean");
  });

  test("/api/check-link marca URL inexistente como inválida", async ({ request }) => {
    const target = encodeURIComponent("https://no-existe-este-dominio-1234567890.cl/");
    const res = await request.get(`/api/check-link?url=${target}`);
    // El endpoint debería responder ok=true (el endpoint funciona)
    // pero con isValid=false (la URL no responde).
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.isValid).toBe(false);
  });
});

test.describe("Detalle de proyecto", () => {
  test("la página de detalle de un proyecto carga", async ({ page, request }) => {
    // Obtener un id real desde la API para no hardcodear.
    const res = await request.post("/api/search-projects", {
      data: { query: "" },
    });
    const body = await res.json();
    if (!body.results?.length) {
      test.skip(true, "BD sin proyectos — corre `npm run ingest` primero");
      return;
    }
    const id = body.results[0].id;
    await page.goto(`/proyecto/${id}`);
    // El nombre del proyecto debería aparecer (h1 o similar).
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Y debe haber un botón/link a las bases (ActionButton).
    await expect(page.getByRole("link").first()).toBeVisible();
  });
});
