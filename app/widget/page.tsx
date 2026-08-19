import { getProjects } from '@/lib/data';
import { ExternalLink, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Widget de Oportunidades | IICA Chile',
  robots: { index: false, follow: false },
};

export default async function WidgetPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const result = await getProjects();
  let projects = result.ok ? result.projects : [];

  if (categoria && categoria !== 'all') {
    projects = projects.filter(p => p.categoria === categoria);
  }

  // Show top 6 projects
  const displayProjects = projects.slice(0, 6);

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-800 p-4 font-sans text-gray-800 dark:text-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="font-extrabold text-sm md:text-base text-[var(--iica-navy)] dark:text-white tracking-tight">
            Radar IICA Chile <span className="text-[var(--iica-blue)] font-bold text-xs">| Oportunidades</span>
          </h1>
        </div>
        <a
          href="https://iica-chile-plataforma.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[var(--iica-blue)] hover:underline flex items-center gap-1"
        >
          Ver Todas ({projects.length}) ↗
        </a>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {displayProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs hover:border-[var(--iica-blue)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md uppercase">
                  {project.institucion}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {project.montoTexto || 'Ver bases'}
                </span>
              </div>
              <h2 className="text-xs font-bold text-[var(--iica-navy)] dark:text-white line-clamp-2 leading-snug">
                {project.nombre}
              </h2>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">
                {project.fecha_cierre ? `Cierra: ${project.fecha_cierre}` : 'Ventanilla Abierta'}
              </span>
              <a
                href={project.url_bases}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[var(--iica-blue)] dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Bases <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-500">
        <span>Actualización continua IICA Chile</span>
        <a
          href="https://iica-chile-plataforma.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[var(--iica-navy)] dark:text-white hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          Ir a Radar Completo
        </a>
      </div>
    </div>
  );
}
