/**
 * Smoke test HTTP — verifica que los endpoints y páginas clave responden.
 *
 * Asume que hay un servidor corriendo en DEPLOYMENT_URL (por defecto
 * http://localhost:3000). En CI o producción, setear DEPLOYMENT_URL al
 * dominio real. Sale con exit code 1 si CUALQUIER check falla.
 *
 * Cubre:
 *  - Home page renderiza (200, contiene <html>)
 *  - /admin redirige a /admin/sources
 *  - /api/search-projects responde con results + meta válidos
 *  - /api/check-link valida una URL conocida
 *  - Página de detalle de un proyecto (si la BD tiene ≥1 proyecto)
 */

const BASE = process.env.DEPLOYMENT_URL || "http://localhost:3000";

type Result = { name: string; ok: boolean; detail: string };
const results: Result[] = [];

async function check(name: string, fn: () => Promise<string>): Promise<void> {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    console.log(`  ✓ ${name} — ${detail}`);
  } catch (err) {
    const detail = (err as Error).message;
    results.push({ name, ok: false, detail });
    console.error(`  ✗ ${name} — ${detail}`);
  }
}

async function main() {
  console.log(`[smoke] testing ${BASE}`);

  await check("Home page (/) responde 200", async () => {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes("<html") && !html.includes("<HTML")) {
      throw new Error("respuesta no parece HTML");
    }
    return `${html.length} bytes`;
  });

  await check("/admin redirige (no 404)", async () => {
    // Sin cookie de auth, /admin redirige a /admin/login.
    // Con cookie válida, redirige a /admin/sources via app/admin/page.tsx.
    // Cualquiera de los dos es "no 404", que es lo que probamos.
    const res = await fetch(`${BASE}/admin`, { redirect: "manual" });
    if (res.status === 404) throw new Error("404 (la ruta /admin no existe)");
    if ([301, 302, 307, 308].includes(res.status)) {
      const location = res.headers.get("location") || "";
      if (!location.includes("/admin/")) {
        throw new Error(`location no apunta a /admin/*: '${location}'`);
      }
      return `${res.status} → ${location}`;
    }
    if (res.ok) return `200 (renderiza ${BASE}/admin)`;
    throw new Error(`HTTP ${res.status}`);
  });

  let projectId: number | null = null;

  await check("/api/search-projects devuelve shape válido", async () => {
    const res = await fetch(`${BASE}/api/search-projects`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.results)) {
      throw new Error("results no es array");
    }
    if (!data.meta || typeof data.meta.mode !== "string") {
      throw new Error(`meta.mode falta o no es string: ${JSON.stringify(data.meta)}`);
    }
    if (data.results.length > 0) {
      const sample = data.results[0];
      projectId = sample.id;
      for (const f of ["nombre", "institucion", "url_bases", "fecha_cierre"]) {
        if (!sample[f]) throw new Error(`sample sin campo '${f}'`);
      }
    }
    return `${data.results.length} resultados, mode=${data.meta.mode}`;
  });

  await check("/api/check-link valida URL", async () => {
    const target = encodeURIComponent(
      "https://www.cnr.gob.cl/agricultores/calendario-de-concurso/"
    );
    const res = await fetch(`${BASE}/api/check-link?url=${target}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data.isValid !== "boolean") {
      throw new Error(`isValid no es boolean: ${JSON.stringify(data)}`);
    }
    return `isValid=${data.isValid}`;
  });

  if (projectId !== null) {
    await check(`/proyecto/${projectId} renderiza`, async () => {
      const res = await fetch(`${BASE}/proyecto/${projectId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (!html.includes("<html") && !html.includes("<HTML")) {
        throw new Error("respuesta no parece HTML");
      }
      return `${html.length} bytes`;
    });
  } else {
    console.log("  ⊘ /proyecto/[id] — saltado (BD vacía)");
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n[smoke] ${results.length - failed.length}/${results.length} OK`);
  if (failed.length > 0) {
    console.error(`[smoke] ${failed.length} fallaron`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("[smoke] crash:", e);
  process.exit(1);
});
