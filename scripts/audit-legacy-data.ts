import prisma from "../lib/prisma";
import * as fs from "fs";

interface ValidationResult {
  ok: boolean;
  reason?: string;
}

async function validateUrl(url: string): Promise<ValidationResult> {
  if (!url || !url.trim()) return { ok: false, reason: "URL vacía" };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
    });
    clearTimeout(timeoutId);

    if (res.status === 404 || res.status === 410) return { ok: false, reason: `HTTP ${res.status}` };
    if (res.status >= 500) return { ok: false, reason: `HTTP ${res.status}` };
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };

    // Detectar redirect a homepage genérica
    const original = new URL(url);
    const final = new URL(res.url);
    const originalHasPath = original.pathname.length > 1;
    const finalIsRoot = final.pathname === "/" || final.pathname === "";
    if (originalHasPath && finalIsRoot && original.hostname === final.hostname) {
      return { ok: false, reason: "redirige a homepage" };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

function toCsv(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(",")),
  ].join("\n");
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(`[audit] Modo: ${apply ? "APPLY (modificará BD)" : "DRY-RUN (solo CSV)"}`);

  const all = await prisma.project.findMany({
    where: { estadoPostulacion: { not: "Cerrada" } },
  });

  console.log(`[audit] Validando ${all.length} proyectos no-cerrados...`);

  const broken: Array<Record<string, string | number>> = [];
  let okCount = 0;

  for (let i = 0; i < all.length; i++) {
    const p = all[i];
    process.stdout.write(`\r[audit] ${i + 1}/${all.length}`);
    const v = await validateUrl(p.url_bases || "");
    if (!v.ok) {
      broken.push({
        id: p.id,
        nombre: p.nombre,
        institucion: p.institucion,
        url: p.url_bases || "",
        reason: v.reason || "unknown",
      });
    } else {
      okCount++;
    }
  }
  console.log("\n");

  const csv = toCsv(broken);
  fs.writeFileSync("audit-broken-urls.csv", csv);

  console.log(`[audit] OK: ${okCount}`);
  console.log(`[audit] Broken: ${broken.length}`);
  console.log(`[audit] CSV escrito: audit-broken-urls.csv`);

  if (apply && broken.length > 0) {
    console.log(`[audit] Aplicando cierre de ${broken.length} proyectos...`);
    const today = new Date().toISOString().slice(0, 10);
    for (const b of broken) {
      await prisma.project.update({
        where: { id: b.id as number },
        data: {
          estadoPostulacion: "Cerrada",
          notasInternas: `auditoría legacy ${today}: ${b.reason}`,
        },
      });
    }
    console.log(`[audit] Listo.`);
  } else if (!apply) {
    console.log(`[audit] Revisá audit-broken-urls.csv. Para aplicar el cierre, corré con --apply.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
