import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function statusEmoji(status: string | null): string {
  if (status === "success") return "✅";
  if (status === "partial") return "⚠️";
  if (status === "error") return "❌";
  return "❓";
}

function relative(date: Date | null): string {
  if (!date) return "—";
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({ orderBy: { slug: "asc" } });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>Fuentes de datos — Salud</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>Estado de cada scraper / discovery.</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f2e8" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Fuente</th>
            <th style={{ padding: 8 }}>Estado</th>
            <th style={{ padding: 8 }}>Último run</th>
            <th style={{ padding: 8 }}>Proyectos</th>
            <th style={{ padding: 8, textAlign: "left" }}>Error</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>
                <strong>{s.name}</strong>
                <div style={{ fontSize: 11, color: "#666" }}>{s.slug}</div>
              </td>
              <td style={{ padding: 8, textAlign: "center" }}>{statusEmoji(s.lastRunStatus)}</td>
              <td style={{ padding: 8, textAlign: "center" }}>{relative(s.lastRunAt)}</td>
              <td style={{ padding: 8, textAlign: "center" }}>{s.projectsCount}</td>
              <td style={{ padding: 8, fontSize: 12, color: "#c62828" }}>
                {s.lastRunError ? s.lastRunError.slice(0, 100) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
