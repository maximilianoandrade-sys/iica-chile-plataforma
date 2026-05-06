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
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h1 style={{ color: "#2D7A2F", fontSize: 24, margin: 0 }}>Fuentes de datos — Salud</h1>
        <a href="/admin/discoveries" style={{ fontSize: 13, color: "#0066cc" }}>→ Bandeja de descubrimientos IA</a>
      </div>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>Estado de cada scraper / discovery.</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f2e8" }}>
            <th style={{ padding: 10, textAlign: "left" }}>Fuente</th>
            <th style={{ padding: 10 }}>Estado</th>
            <th style={{ padding: 10 }}>Último run</th>
            <th style={{ padding: 10 }}>Proyectos</th>
            <th style={{ padding: 10, textAlign: "left" }}>Error</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 10 }}>
                <strong>{s.name}</strong>
                <div style={{ fontSize: 11, color: "#666" }}>{s.slug}</div>
              </td>
              <td style={{ padding: 10, textAlign: "center", fontSize: 18 }}>{statusEmoji(s.lastRunStatus)}</td>
              <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>{relative(s.lastRunAt)}</td>
              <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>{s.projectsCount}</td>
              <td style={{ padding: 10, fontSize: 12, color: "#c62828", maxWidth: 280 }}>
                {s.lastRunError ? s.lastRunError.slice(0, 200) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: "#999", marginTop: 20 }}>
        Para re-ejecutar un scraper manualmente: GitHub → Actions → "Ingesta diaria de proyectos" → Run workflow.
      </p>
    </div>
  );
}
