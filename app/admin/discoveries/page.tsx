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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h1 style={{ color: "#2D7A2F", fontSize: 24, margin: 0 }}>Bandeja de Descubrimientos IA</h1>
        <a href="/admin/sources" style={{ fontSize: 13, color: "#0066cc" }}>← Salud de fuentes</a>
      </div>
      <p style={{ color: "#666", fontSize: 13 }}>
        {items.length} proyecto{items.length === 1 ? "" : "s"} encontrado{items.length === 1 ? "" : "s"} por Claude pendientes de revisión.
        El snippet textual del web search está en la columna del medio.
      </p>
      <DiscoveriesClient initial={items} />
    </div>
  );
}
