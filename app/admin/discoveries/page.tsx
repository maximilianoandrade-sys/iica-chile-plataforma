import prisma from "@/lib/prisma";
import DiscoveriesClient from "./DiscoveriesClient";

export const dynamic = "force-dynamic";

export default async function DiscoveriesPage() {
  const items = await prisma.project.findMany({
    where: { needsReview: true, estadoPostulacion: "Abierta" },
    orderBy: { firstSeenAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Bandeja de Descubrimientos IA</h1>
        <p className="text-sm text-gray-600">
          {items.length} proyecto(s) pendientes de revisión por el equipo técnico.
        </p>
      </div>
      <DiscoveriesClient initial={JSON.parse(JSON.stringify(items))} />
    </div>
  );
}
