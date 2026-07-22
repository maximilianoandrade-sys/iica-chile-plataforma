import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, Calendar, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { FavoriteButton } from '@/components/FavoriteButton';
import { getLogger } from '@/lib/utils/logger';
import { type Project, daysUntilClose, formatDeadline, formatMontoCLP } from '@/lib/data';

const logger = getLogger('ProjectList');
const ITEMS_PER_PAGE = 16;

interface ProjectListProps {
  projects: Project[];
  totalCount: number;
  pageSize?: number;
  activeFilterLabels?: string[];
}

export default function ProjectList({
  projects,
  totalCount,
  pageSize = ITEMS_PER_PAGE,
  activeFilterLabels = [],
}: ProjectListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const hasQuery = Boolean(searchParams.get('q')?.trim());
  const sort = searchParams.get('sort') || (hasQuery ? 'relevance' : 'date_asc');
  const currentPage = Number(searchParams.get('page') || '1');
  const relevanceMode = searchParams.get('relevanceMode') || 'chile_strict';

  const updateSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginated = projects;

  const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const visibleStart = Math.max(1, firstPage);
  const visibleEnd = Math.min(totalPages, visibleStart + 4);
  const visiblePages = Array.from({ length: visibleEnd - visibleStart + 1 }, (_, index) => visibleStart + index);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleViewAll = () => {
        const params = new URLSearchParams(searchParams.toString());
    params.set('relevanceMode', 'all');
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleBackToChile = () => {
        const params = new URLSearchParams(searchParams.toString());
    params.delete('relevanceMode');
    params.delete('page');
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  logger.debug('Render ProjectList', { total: projects.length, page: currentPage });

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Toolbar: count + sort */}
      <div className="flex flex-col gap-3 rounded-xl border border-iica-border bg-white dark:bg-gray-800 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300" aria-live="polite" aria-atomic="true">
            Mostrando {projects.length} de {totalCount} oportunidades
          </span>
          {isPending ? (
            <span className="block text-xs font-medium text-iica-blue" aria-live="polite" aria-atomic="true">
              Actualizando resultados...
            </span>
          ) : null}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
              relevanceMode === 'all'
                ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                : 'border-iica-border bg-iica-blue/10 text-iica-navy dark:text-blue-300'
            }`}>
              {relevanceMode === 'all' ? 'Mostrando internacionales no verificadas' : 'Solo Chile (estricto)'}
            </span>
            {relevanceMode === 'all' ? (
              <button
                type="button"
                onClick={handleBackToChile}
                className="text-xs font-medium text-iica-blue hover:underline min-h-[44px] px-2"
              >
                Volver a Solo Chile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleViewAll}
                className="text-xs font-medium text-iica-blue hover:underline min-h-[44px] px-2"
              >
                Ver todas
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Dual View Toggle Switcher */}
          <div className="flex items-center rounded-lg border border-iica-border bg-gray-50 dark:bg-gray-700/50 p-1" role="group" aria-label="Modo de vista">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-iica-navy dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              title="Vista de Tarjetas Visuales"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-800 text-iica-navy dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              title="Vista de Tabla Compacta de Alta Densidad"
            >
              <List size={15} />
              <span className="hidden sm:inline">Tabla</span>
            </button>
          </div>

          <select
            value={sort}
            onChange={(e) => updateSort(e.target.value)}
            className="text-sm border border-iica-border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none min-h-[44px]"
            aria-label="Ordenar por"
            title="Prioriza convocatorias nacionales con cierre próximo y monto disponible"
          >
            <option value="relevance">Más relevantes</option>
            <option value="date_asc">Cierre más próximo</option>
            <option value="amount_desc">Mayor monto</option>
            <option value="newest">Más recientes</option>
          </select>
        </div>
      </div>

      {activeFilterLabels.length > 0 && paginated.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl border border-iica-border bg-iica-blue/5 dark:bg-blue-900/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-iica-navy dark:text-blue-300">{activeFilterLabels.length} filtros activos</span>
            {activeFilterLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-iica-border bg-white dark:bg-gray-700 px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300"
              >
                {label}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-sm font-medium text-iica-blue hover:underline min-h-[44px]"
          >
            Restablecer vista
          </button>
        </div>
      ) : null}

      {/* Grid or Table View */}
      {paginated.length > 0 ? (
        <div
          role="region"
          aria-label="Contenedor de resultados"
          aria-busy={isPending}
          className={`transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}
        >
          {viewMode === 'grid' ? (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Resultados de oportunidades">
              {paginated.map((project) => (
                <li key={project.id} className="list-none">
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-iica-border bg-white dark:bg-gray-800 shadow-sm">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold uppercase text-gray-700 dark:text-gray-200 border-b border-iica-border">
                  <tr>
                    <th scope="col" className="px-4 py-3">Oportunidad / Institución</th>
                    <th scope="col" className="px-4 py-3">Ámbito</th>
                    <th scope="col" className="px-4 py-3">Monto Estimado</th>
                    <th scope="col" className="px-4 py-3">Cierre</th>
                    <th scope="col" className="px-4 py-3">Viabilidad IICA</th>
                    <th scope="col" className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-iica-border">
                  {paginated.map((project) => {
                    const days = daysUntilClose(project);
                    const closeDate = formatDeadline(project.fecha_cierre);
                    const monto = project.montoTexto || (project.monto ? formatMontoCLP(project.monto) : 'Ver bases');

                    return (
                      <tr key={project.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white max-w-md">
                          <Link href={`/proyecto/${project.id}`} className="hover:text-iica-blue font-semibold line-clamp-2">
                            {project.nombre}
                          </Link>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {project.institucion}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            project.ambito === 'Internacional'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {project.regiones?.[0] || project.region || project.ambito || 'Nacional'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {monto}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                          <span className={`font-semibold ${
                            days <= 1 && days >= 0
                              ? 'text-red-600 dark:text-red-400'
                              : days <= 7 && days >= 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {days < 0 ? 'Cerrada' : days === 0 ? 'Cierra hoy' : `${days} días`}
                          </span>
                          <span className="block text-gray-400 dark:text-gray-500">{closeDate}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              {project.porcentajeViabilidad ? `${project.porcentajeViabilidad}% ${project.viabilidadIICA || 'Alta'}` : 'Alta'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <FavoriteButton projectId={project.id} />
                            <Link
                              href={`/proyecto/${project.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-iica-blue text-white hover:bg-iica-navy transition-colors min-h-[36px]"
                            >
                              Ver Ficha <ArrowRight size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 space-y-3" role="status" aria-live="polite">
          <p className="text-lg font-medium text-iica-navy dark:text-white">No encontramos oportunidades con estos filtros</p>
          <p className="text-sm mt-1">Pruebe ampliar su búsqueda o restablecer los filtros activos.</p>
          {relevanceMode !== 'all' ? (
            <button
              type="button"
              onClick={handleViewAll}
              className="inline-flex items-center justify-center rounded-full border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 text-sm font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-100 min-h-[44px]"
            >
              Incluir internacionales
            </button>
          ) : null}
          {activeFilterLabels.length > 0 && (
            <div className="mx-auto max-w-3xl">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Filtros activos</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {activeFilterLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center rounded-full border border-iica-border bg-white dark:bg-gray-700 px-3 py-1 text-xs text-gray-700 dark:text-gray-300"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center rounded-full border border-iica-blue bg-iica-blue px-4 py-2 text-sm font-medium text-white hover:bg-iica-blue/90 min-h-[44px]"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Paginación" className="flex flex-col items-center gap-2 pt-3">
          <p className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite" aria-atomic="true">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex justify-center gap-1">
            {visiblePages.map((page) => {
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  aria-label={page === currentPage ? `Página ${page}, página actual` : `Ir a la página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-green-600 text-white font-medium rounded'
                      : 'bg-white dark:bg-gray-800 border border-iica-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {visibleEnd < totalPages && (
              <>
                <span className="px-2 self-center text-gray-400">…</span>
                <button
                  type="button"
                  onClick={() => goToPage(totalPages)}
                  aria-label={`Ir a la última página, página ${totalPages}`}
                  className="min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-iica-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
