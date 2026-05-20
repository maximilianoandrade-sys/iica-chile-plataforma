"use client";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-6">
      <div className="bg-white border border-red-100 rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-red-500" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Error en el panel</h2>
        <p className="text-sm text-gray-600">
          No pudimos cargar esta sección del panel de administración. 
          Puede ser un error temporal.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono">Código: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--iica-navy)] text-white font-bold text-sm hover:bg-[var(--iica-blue)] min-h-[44px]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reintentar
          </button>
          <Link
            href="/admin/pipeline-dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 min-h-[44px]"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
