"use client";
import { useState } from "react";

export default function DiscoveriesClient({ initial }: { initial: any[] }) {
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
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
      <thead>
        <tr style={{ background: "#f5f2e8" }}>
          <th style={{ padding: 10, textAlign: "left" }}>Proyecto</th>
          <th style={{ padding: 10, textAlign: "left" }}>Snippet IA</th>
          <th style={{ padding: 10 }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.id} style={{ borderBottom: "1px solid #eee", verticalAlign: "top" }}>
            <td style={{ padding: 10, maxWidth: 380 }}>
              <strong style={{ fontSize: 14 }}>{p.nombre}</strong>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{p.institucion}</div>
              <a
                href={p.url_bases}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: "#0066cc", display: "block", marginTop: 4, wordBreak: "break-all" }}
              >
                {p.url_bases}
              </a>
            </td>
            <td style={{ padding: 10, fontSize: 12, color: "#444", maxWidth: 380 }}>
              {p.notasInternas ? p.notasInternas.slice(0, 250) : <em style={{ color: "#999" }}>(sin snippet)</em>}
            </td>
            <td style={{ padding: 10, whiteSpace: "nowrap" }}>
              <button
                disabled={busy === p.id}
                onClick={() => act(p.id, "approve")}
                style={{
                  padding: "6px 14px",
                  marginRight: 6,
                  background: "#2D7A2F",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: busy === p.id ? "wait" : "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Aprobar
              </button>
              <button
                disabled={busy === p.id}
                onClick={() => act(p.id, "discard")}
                style={{
                  padding: "6px 14px",
                  background: "#c62828",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: busy === p.id ? "wait" : "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Descartar
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr>
            <td colSpan={3} style={{ padding: 30, textAlign: "center", color: "#888" }}>
              Bandeja vacía 🎉
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
