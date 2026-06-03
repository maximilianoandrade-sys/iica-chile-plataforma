'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { FilterChips } from '@/components/FilterChips';
import { type FilterCounts } from '@/lib/data';
import { getLogger } from '@/lib/utils/logger';
import type { Project } from '@/lib/data';
import { trackEvent } from '@/lib/analytics';

const logger = getLogger('ProjectList');
const ITEMS_PER_PAGE = 16;

interface ProjectListProps {
  projects: Project[];
  filterCounts: FilterCounts;
  totalCount: number;
  pageSize?: number;
  activeFilterLabels?: string[];
}

export default function ProjectList({
  projects,
  filterCounts,
  totalCount,
  pageSize = ITEMS_PER_PAGE,
  activeFilterLabels = [],
}: ProjectListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

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
    trackEvent({
      action: 'filter_change',
      category: 'Search',
      label: 'relevance_mode:all',
    });
    const params = new URLSearchParams(searchParams.toString());
    params.set('relevanceMode', 'all');
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleBackToChile = () => {
    trackEvent({
      action: 'filter_change',
      category: 'Search',
      label: 'relevance_mode:chile_strict',
    });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('relevanceMode');
    params.delete('page');
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  logger.debug('Render ProjectList', { total: projects.length, page: currentPage });

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Filter chips */}
      <FilterChips filterCounts={filterCounts} />

      {/* Toolbar: count + sort */}
      <div className="flex flex-col gap-3 rounded-xl border border-iica-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-gray-700" aria-live="polite" aria-atomic="true">
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
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-iica-border bg-iica-blue/10 text-iica-navy'
            }`}>
              {relevanceMode === 'all' ? 'Mostrando internacionales no verificadas' : 'Solo Chile (estricto)'}
            </span>
            {relevanceMode === 'all' ? (
              <button
                type="button"
                onClick={handleBackToChile}
                className="text-xs font-medium text-iica-blue hover:underline"
              >
                Volver a Solo Chile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleViewAll}
                className="text-xs font-medium text-iica-blue hover:underline"
              >
                Ver todas
              </button>
            )}
          </div>
        </div>
        <select
          value={sort}
          onChange={(e) => updateSort(e.target.value)}
          className="text-sm border border-iica-border rounded-lg px-3 py-2 bg-white text-gray-700 focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none min-h-[44px]"
          aria-label="Ordenar por"
        >
          <option value="relevance">Más relevantes</option>
          <option value="date_asc">Cierre más próximo</option>
          <option value="amount_desc">Mayor monto</option>
          <option value="newest">Más recientes</option>
        </select>
      </div>

      {/* Grid of cards */}
      {paginated.length > 0 ? (
        <div className={`grid grid-cols-1 gap-4 transition-opacity duration-200 md:grid-cols-2 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
          {paginated.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
          <div className="text-center py-12 text-gray-500 space-y-3" role="status" aria-live="polite">
          <p className="text-lg font-medium text-iica-navy">No encontramos oportunidades con estos filtros</p>
          <p className="text-sm mt-1">Pruebe ampliar su búsqueda o restablecer los filtros activos.</p>
          {activeFilterLabels.length > 0 && (
            <div className="mx-auto max-w-3xl">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Filtros activos</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {activeFilterLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center rounded-full border border-iica-border bg-white px-3 py-1 text-xs text-gray-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                router.push(pathname, { scroll: false });
              });
            }}
            className="inline-flex items-center justify-center rounded-full border border-iica-blue bg-iica-blue px-4 py-2 text-sm font-medium text-white hover:bg-iica-blue/90 min-h-[44px]"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Paginación" className="flex justify-center gap-1 pt-3">
          {visiblePages.map((page) => {
            return (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-iica-blue text-white'
                    : 'bg-white border border-iica-border text-gray-700 hover:bg-gray-50'
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
                className="min-w-[44px] min-h-[44px] rounded-lg text-sm font-medium bg-white border border-iica-border text-gray-700 hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
        </nav>
      )}
    </div>
  );
}
