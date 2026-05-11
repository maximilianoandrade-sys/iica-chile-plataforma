"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: { "content-type": "application/json" },
    });
    if (res.ok) {
      router.push("/admin/sources");
    } else {
      setError("Contraseña incorrecta");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "120px auto", padding: 20, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 20 }}>Admin IICA Chile</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoFocus
          style={{ padding: 10, fontSize: 14, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button type="submit" style={{ padding: 10, background: "#2D7A2F", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Entrar
        </button>
        {error && <span style={{ color: "#c62828" }}>{error}</span>}
      </form>
    </div>
  );
}
