/**
 * Smoke test post-deploy: verifica que el endpoint de búsqueda devuelve
 * resultados reales con la forma esperada. Corre como último step del
 * workflow ingest-scrapers.yml. Si falla, alerta visible en GH Actions.
 */
const BASE = process.env.DEPLOYMENT_URL || "http://localhost:3000";

async function main() {
  console.log(`[smoke] testing ${BASE}/api/search-projects`);

  const res = await fetch(`${BASE}/api/search-projects`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "" }),
  });

  if (!res.ok) {
    console.error(`[smoke] HTTP ${res.status}`);
    process.exit(1);
  }
  const data = await res.json();
  if (!Array.isArray(data.results)) {
    console.error("[smoke] results no es array:", data);
    process.exit(1);
  }
  if (data.results.length === 0) {
    console.error("[smoke] 0 resultados — la BD parece vacía");
    process.exit(1);
  }
  const sample = data.results[0];
  const requiredFields = ["nombre", "institucion", "url_bases"];
  for (const f of requiredFields) {
    if (!sample[f]) {
      console.error(`[smoke] sample missing field '${f}':`, sample);
      process.exit(1);
    }
  }
  console.log(`[smoke] ✅ ${data.results.length} resultados OK`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
