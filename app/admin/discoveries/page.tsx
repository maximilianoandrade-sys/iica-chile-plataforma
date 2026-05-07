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
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>Bandeja de Descubrimientos IA</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        {items.length} proyecto(s) pendientes de revisión.
      </p>
      <DiscoveriesClient initial={JSON.parse(JSON.stringify(items))} />
    </div>
  );
}
