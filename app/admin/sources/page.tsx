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
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Estado de Fuentes de Datos</h1>
        <p className="text-sm text-gray-600">Seguimiento de cada scraper y proceso de descubrimiento.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Fuente</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Última ejecución</th>
              <th className="px-4 py-3 text-center">Proyectos</th>
              <th className="px-4 py-3 text-left">Error reciente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sources.map((s) => (
              <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.slug}</p>
                </td>
                <td className="px-4 py-3 text-center text-lg" aria-label={`Estado ${s.lastRunStatus || "desconocido"}`}>
                  {statusEmoji(s.lastRunStatus)}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{relative(s.lastRunAt)}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-800">{s.projectsCount}</td>
                <td className="px-4 py-3 text-xs text-red-700">
                  {s.lastRunError ? s.lastRunError.slice(0, 100) : "Sin errores reportados"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
