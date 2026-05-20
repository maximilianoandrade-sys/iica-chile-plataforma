import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-iica-navy text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-white text-iica-navy p-1 rounded font-black text-sm">IICA</span>
            Panel de Administración - Pipeline 2026
          </h1>
          <nav className="flex flex-wrap gap-6 text-sm" aria-label="Navegación de administración">
            <Link href="/admin/pipeline-dashboard" className="hover:text-blue-200 transition-colors">Dashboard</Link>
            <Link href="/admin/projects/needsReview" className="hover:text-blue-200 transition-colors">Bandeja de Revisión</Link>
            <Link href="/admin/discoveries" className="hover:text-blue-200 transition-colors">Descubrimientos</Link>
            <Link href="/admin/sources" className="hover:text-blue-200 transition-colors">Fuentes</Link>
            <Link href="/" className="hover:text-blue-200 transition-colors">Ver Sitio Público</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-6">
        {children}
      </main>
      <footer className="bg-white border-t py-4 px-6 text-center text-xs text-gray-400">
        &copy; 2026 IICA Chile — Sistema Interno de Monitoreo de Proyectos
      </footer>
    </div>
  );
}
