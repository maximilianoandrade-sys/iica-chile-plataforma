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
  const [bulkBusy, setBulkBusy] = useState<"approve" | "discard" | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCount = selectedIds.length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  function toggleSelection(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.length === items.length ? [] : items.map((item) => item.id)));
  }

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
      setSelectedIds((prev) => prev.filter((value) => value !== id));
    } else {
      setErrorMessage("No pudimos actualizar este proyecto. Inténtelo nuevamente.");
    }
  }

  async function actBulk(action: "approve" | "discard") {
    if (selectedIds.length === 0) return;
    setBulkBusy(action);
    setErrorMessage(null);

    const res = await fetch("/api/admin/discoveries/bulk/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ids: selectedIds }),
    });

    setBulkBusy(null);
    if (res.ok) {
      setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      return;
    }

    setErrorMessage("No pudimos actualizar los proyectos seleccionados. Inténtelo nuevamente.");
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-blue-700"
              aria-label="Seleccionar todos"
            />
            <span>Seleccionados: {selectedCount}</span>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={selectedCount === 0 || bulkBusy !== null || busy !== null}
              onClick={() => actBulk("approve")}
              className="px-3 py-1.5 rounded-md bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-60"
            >
              {bulkBusy === "approve" ? "Aprobando..." : "Aprobar seleccionados"}
            </button>
            <button
              type="button"
              disabled={selectedCount === 0 || bulkBusy !== null || busy !== null}
              onClick={() => actBulk("discard")}
              className="px-3 py-1.5 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800 disabled:opacity-60"
            >
              {bulkBusy === "discard" ? "Descartando..." : "Descartar seleccionados"}
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-center">Sel.</th>
              <th className="px-4 py-3 text-left">Proyecto</th>
              <th className="px-4 py-3 text-left">Resumen IA</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelection(p.id)}
                    aria-label={`Seleccionar ${p.nombre}`}
                    className="h-4 w-4 rounded border-gray-300 text-blue-700"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold text-gray-900">{p.nombre}</p>
                  <p className="text-xs text-gray-500">{p.institucion}</p>
                  {p.url_bases && (
                    <a href={p.url_bases} target="_blank" rel="noopener" className="text-xs text-blue-700 hover:underline break-all">
                      {p.url_bases.slice(0, 60)}...
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-md">
                  {(p.notasInternas || "").slice(0, 250) || "Sin observaciones IA"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      disabled={busy === p.id}
                      onClick={() => act(p.id, "approve")}
                      aria-label={`Aprobar ${p.nombre}`}
                      className="px-3 py-1.5 rounded-md bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-60"
                    >
                      Aprobar
                    </button>
                    <button
                      disabled={busy === p.id}
                      onClick={() => act(p.id, "discard")}
                      aria-label={`Descartar ${p.nombre}`}
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
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500 font-medium">
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
