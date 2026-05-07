import prisma from "../lib/prisma";

function normalizeUrl(rawUrl: string | null): string | null {
  if (!rawUrl) return null;
  try {
    const u = new URL(rawUrl.trim());
    u.hash = "";
    const params = new URLSearchParams();
    u.searchParams.forEach((v, k) => {
      if (!k.toLowerCase().startsWith("utm_")) params.set(k, v);
    });
    u.search = params.toString();
    let normalized = u.toString().toLowerCase();
    if (normalized.endsWith("/") && u.pathname !== "/") {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return null;
  }
}

async function main() {
  const all = await prisma.project.findMany({ where: { canonicalUrl: null } });
  const seen = new Map<string, number>();
  const collisions: number[] = [];

  for (const p of all) {
    const cu = normalizeUrl(p.url_bases);
    if (!cu) {
      console.warn(`Project ${p.id} (${p.nombre}) sin URL válida — saltando`);
      continue;
    }
    if (seen.has(cu)) {
      collisions.push(p.id);
      console.warn(`Colisión: project ${p.id} colisiona con ${seen.get(cu)} en ${cu}`);
      continue;
    }
    seen.set(cu, p.id);
    await prisma.project.update({ where: { id: p.id }, data: { canonicalUrl: cu } });
  }

  if (collisions.length > 0) {
    console.error(`WARNING: ${collisions.length} colisiones detectadas. Resolver manualmente antes de NOT NULL.`);
    process.exit(1);
  }
  console.log(`OK: Backfilled ${all.length - collisions.length}/${all.length} proyectos`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
