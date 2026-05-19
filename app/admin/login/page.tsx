"use client";
import { useState } from "react";
import { AlertCircle, LockKeyhole, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: { "content-type": "application/json" },
      });

      if (res.ok) {
        // Full page reload ensures the cookie is sent on the next request
        // and bypasses any Service Worker cache from the PWA.
        window.location.href = "/admin/pipeline-dashboard";
        return;
      }

      setError("No pudimos validar su contraseña. Revise sus datos e inténtelo nuevamente.");
    } catch {
      setError("Tuvimos un problema de conexión. Inténtelo de nuevo en unos segundos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Acceso Seguro
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Administración IICA Chile</h1>
          <p className="text-sm text-gray-500 mt-2">Ingrese su contraseña para acceder al panel interno del pipeline.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label htmlFor="admin-password" className="text-sm font-bold text-gray-700 block">
            Contraseña de administración
          </label>
          <div className="relative">
            <LockKeyhole className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              autoFocus
              autoComplete="current-password"
              disabled={isSubmitting}
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || password.trim().length === 0}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--iica-navy)] hover:bg-[var(--iica-blue)] text-white font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verificando..." : "Entrar"}
          </button>

          {error && (
            <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3" role="alert">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
