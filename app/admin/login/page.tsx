"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: { "content-type": "application/json" },
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/sources");
    } else {
      setError("Contraseña incorrecta");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "120px auto", padding: 20, fontFamily: "system-ui" }}>
      <h1 style={{ color: "#2D7A2F", fontSize: 24, marginBottom: 4 }}>Admin IICA Chile</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Acceso al panel de administración interno.</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoFocus
          style={{ padding: 10, fontSize: 14, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button
          type="submit"
          disabled={busy || !password}
          style={{
            padding: 10,
            background: busy ? "#999" : "#2D7A2F",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {busy ? "Verificando..." : "Entrar"}
        </button>
        {error && <span style={{ color: "#c62828", fontSize: 13 }}>{error}</span>}
      </form>
    </div>
  );
}
