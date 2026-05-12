"use client";
import { useState } from "react";

interface ProjectItem {
  id: number;
  nombre: string;
  institucion: string;
  url_bases: string;
  notasInternas: string | null;
}

export default function DiscoveriesClient({ initial }: { initial: ProjectItem[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function act(id: number, action: "approve" | "discard") {
    setBusy(id);
    setErrorMessage(null);
    const res = await fetch(`/api/admin/discoveries/${id}/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (res.ok) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    } else {
      setErrorMessage("No pudimos actualizar este proyecto. Inténtelo nuevamente.");
    }
  }

  return (
    <div className="space-y-3">
      {errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Proyecto</th>
              <th className="px-4 py-3 text-left">Resumen IA</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-bold text-gray-900">{p.nombre}</p>
                  <p className="text-xs text-gray-500">{p.institucion}</p>
                  <a href={p.url_bases} target="_blank" rel="noopener" className="text-xs text-blue-700 hover:underline break-all">
                    {p.url_bases?.slice(0, 60)}...
                  </a>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-md">
                  {(p.notasInternas || "").slice(0, 250) || "Sin observaciones IA"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      disabled={busy === p.id}
                      onClick={() => act(p.id, "approve")}
                      className="px-3 py-1.5 rounded-md bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-60"
                    >
                      Aprobar
                    </button>
                    <button
                      disabled={busy === p.id}
                      onClick={() => act(p.id, "discard")}
                      className="px-3 py-1.5 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800 disabled:opacity-60"
                    >
                      Descartar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-gray-500 font-medium">
                  Bandeja vacía
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
