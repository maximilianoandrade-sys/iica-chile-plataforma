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

  async function act(id: number, action: "approve" | "discard") {
    setBusy(id);
    const res = await fetch(`/api/admin/discoveries/${id}/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (res.ok) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Error: " + res.statusText);
    }
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f5f2e8" }}>
          <th style={{ padding: 8, textAlign: "left" }}>Proyecto</th>
          <th style={{ padding: 8, textAlign: "left" }}>Snippet IA</th>
          <th style={{ padding: 8 }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>
              <strong>{p.nombre}</strong>
              <div style={{ fontSize: 11, color: "#666" }}>{p.institucion}</div>
              <a href={p.url_bases} target="_blank" rel="noopener" style={{ fontSize: 11, color: "#1976d2" }}>
                {p.url_bases?.slice(0, 60)}...
              </a>
            </td>
            <td style={{ padding: 8, fontSize: 11, color: "#444", maxWidth: 400 }}>
              {(p.notasInternas || "").slice(0, 250)}
            </td>
            <td style={{ padding: 8, whiteSpace: "nowrap" }}>
              <button
                disabled={busy === p.id}
                onClick={() => act(p.id, "approve")}
                style={{ padding: "6px 12px", marginRight: 6, background: "#2D7A2F", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
              >
                Aprobar
              </button>
              <button
                disabled={busy === p.id}
                onClick={() => act(p.id, "discard")}
                style={{ padding: "6px 12px", background: "#c62828", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
              >
                Descartar
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr><td colSpan={3} style={{ padding: 20, textAlign: "center", color: "#666" }}>Bandeja vacía</td></tr>
        )}
      </tbody>
    </table>
  );
}
