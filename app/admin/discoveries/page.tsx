import prisma from "@/lib/prisma";
import DiscoveriesClient from "./DiscoveriesClient";
import { getLogger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";
const logger = getLogger("AdminDiscoveriesPage");

export default async function DiscoveriesPage() {
  let items: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  let loadError = false;
  try {
    items = await prisma.project.findMany({
      where: { needsReview: true, estadoPostulacion: "Abierta" },
      orderBy: { firstSeenAt: "desc" },
      take: 100,
    });
  } catch (error) {
    loadError = true;
    logger.error("Failed to load discoveries", error as Error);
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Bandeja de Descubrimientos IA</h1>
        <p className="text-sm text-gray-600">
          {items.length} proyecto(s) pendientes de revisión por el equipo técnico.
        </p>
      </div>
      {loadError && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No pudimos cargar los descubrimientos. Revise la conexión de datos e inténtelo nuevamente.
        </div>
      )}
      <DiscoveriesClient initial={JSON.parse(JSON.stringify(items))} />
    </div>
  );
}
