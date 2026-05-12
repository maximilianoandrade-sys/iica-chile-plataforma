/**
 * Backfill embeddings: genera vectores para todos los proyectos que aún
 * no tienen `embedding` en BD.
 *
 * Uso:
 *   npx tsx scripts/backfill-embeddings.ts          # backfill incremental
 *   npx tsx scripts/backfill-embeddings.ts --force  # re-embedea TODO (caro)
 *
 * Costos: Gemini tier free = 1500 req/min. Para ~10k proyectos: <7 min.
 * Para 1k proyectos: <1 min.
 *
 * Llamar a este script:
 *  - Una vez después de habilitar pgvector + crear columna embedding
 *  - Después de cada cron de ingesta (run-scrapers.ts ya lo invoca internamente)
 *  - Manualmente si se cambia el modelo de embedding
 */

import prisma from "../lib/prisma";
import {
  embedBatch,
  projectToEmbeddingText,
  toPgVector,
} from "../lib/ingestion/embeddings";

const BATCH_SIZE = 50;

async function main() {
  const force = process.argv.includes("--force");

  if (!process.env.GEMINI_API_KEY) {
    console.error("[backfill] GEMINI_API_KEY no configurada. Saliendo.");
    process.exit(1);
  }

  // Buscar proyectos sin embedding (o todos si --force).
  // Usamos raw SQL porque Prisma no soporta queries sobre columnas Unsupported.
  const filter = force ? "" : `WHERE embedding IS NULL`;
  const rows = await prisma.$queryRawUnsafe<
    Array<{
      id: number;
      nombre: string;
      institucion: string;
      objetivo: string | null;
      descripcionIICA: string | null;
      categoria: string | null;
    }>
  >(
    `SELECT id, nombre, institucion, objetivo, "descripcionIICA", categoria FROM "Project" ${filter} ORDER BY id`
  );

  if (rows.length === 0) {
    console.log("[backfill] Nada que hacer — todos los proyectos ya tienen embedding.");
    await prisma.$disconnect();
    return;
  }

  console.log(`[backfill] Procesando ${rows.length} proyectos en batches de ${BATCH_SIZE}...`);

  let done = 0;
  let errors = 0;

  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const texts = batch.map((r) => projectToEmbeddingText(r));

    try {
      const embeddings = await embedBatch(texts);

      // Persistir uno por uno (Prisma no permite UPDATE de columna vector
      // via método estructurado — usamos raw SQL parametrizado).
      for (let i = 0; i < batch.length; i++) {
        const emb = embeddings[i];
        if (!emb) {
          errors++;
          continue;
        }
        const vec = toPgVector(emb);
        await prisma.$executeRawUnsafe(
          `UPDATE "Project" SET embedding = $1::vector WHERE id = $2`,
          vec,
          batch[i].id
        );
        done++;
      }

      process.stdout.write(`\r[backfill] ${done}/${rows.length} OK, ${errors} errores`);
    } catch (err) {
      console.error(`\n[backfill] Batch falló: ${(err as Error).message}`);
      errors += batch.length;
    }
  }

  console.log("");
  console.log(`[backfill] Terminado. Insertados: ${done}, Errores: ${errors}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
