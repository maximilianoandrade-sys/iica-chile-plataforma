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
    console.warn("[smoke] 0 resultados — la BD podría estar vacía (aceptable pre-ingesta)");
  } else {
    const sample = data.results[0];
    const requiredFields = ["nombre", "institucion", "url_bases"];
    for (const f of requiredFields) {
      if (!sample[f]) {
        console.error(`[smoke] sample missing field '${f}':`, sample);
        process.exit(1);
      }
    }
  }
  console.log(`[smoke] OK: ${data.results.length} resultados, meta: ${JSON.stringify(data.meta)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
