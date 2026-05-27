'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProjectCard } from '@/components/ProjectCard';
import { FilterChips } from '@/components/FilterChips';
import { type FilterCounts } from '@/lib/data';
import { daysUntilClose } from '@/lib/data';
import { getLogger } from '@/lib/utils/logger';
import type { Project } from '@/lib/data';

const logger = getLogger('ProjectList');
const ITEMS_PER_PAGE = 16;

interface ProjectListProps {
  projects: Project[];
  filterCounts: FilterCounts;
  totalCount: number;
  activeFilterLabels?: string[];
}

export default function ProjectList({ projects, filterCounts, totalCount, activeFilterLabels = [] }: ProjectListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const sort = searchParams.get('sort') || 'date_asc';
  const currentPage = Number(searchParams.get('page') || '1');
  const relevanceMode = searchParams.get('relevanceMode') || 'chile_strict';

  const updateSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const sorted = useMemo(() => {
    const items = [...projects];
    switch (sort) {
      case 'amount_desc':
        items.sort((a, b) => (b.monto || 0) - (a.monto || 0));
        break;
      case 'newest':
        items.sort((a, b) => b.id - a.id);
        break;
      case 'date_asc':
      default:
        items.sort((a, b) => {
          const dA = daysUntilClose(a);
          const dB = daysUntilClose(b);
          if (dA === 999 && dB === 999) return 0;
          if (dA === 999) return 1;
          if (dB === 999) return -1;
          return dA - dB;
        });
    }
    return items;
  }, [projects, sort]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  logger.debug('Render ProjectList', { total: projects.length, page: currentPage });

  return (
    <div className="space-y-5">
      {/* Filter chips */}
      <FilterChips filterCounts={filterCounts} />

      {/* Toolbar: count + sort */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="block text-sm text-gray-600" aria-live="polite">
            {projects.length} de {totalCount} oportunidades
          </span>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              relevanceMode === 'all'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {relevanceMode === 'all' ? 'Mostrando internacionales no verificadas' : 'Solo Chile (estricto)'}
            </span>
            {relevanceMode === 'all' ? (
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('relevanceMode');
                  params.delete('page');
                  const qs = params.toString();
                  router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
                }}
                className="text-xs text-iica-blue hover:underline"
              >
                Volver a Solo Chile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('relevanceMode', 'all');
                  params.delete('page');
                  router.push(`${pathname}?${params.toString()}`, { scroll: false });
                }}
                className="text-xs text-iica-blue hover:underline"
              >
                Ver todas
              </button>
            )}
          </div>
        </div>
        <select
          value={sort}
          onChange={(e) => updateSort(e.target.value)}
          className="text-sm border border-iica-border rounded-lg px-3 py-2 bg-white text-gray-700 focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none min-h-[40px]"
          aria-label="Ordenar por"
        >
          <option value="date_asc">Cierre más próximo</option>
          <option value="amount_desc">Mayor monto</option>
          <option value="newest">Más recientes</option>
        </select>
      </div>

      {/* Grid of cards */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginated.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 space-y-3" role="status" aria-live="polite">
          <p className="text-lg font-medium">No se encontraron oportunidades</p>
          <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
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
            onClick={() => router.push(pathname, { scroll: false })}
            className="inline-flex items-center justify-center rounded-full border border-iica-blue bg-iica-blue px-4 py-2 text-sm font-medium text-white hover:bg-iica-blue/90"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Paginación" className="flex justify-center gap-1 pt-4">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`min-w-[40px] min-h-[40px] rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-iica-blue text-white'
                    : 'bg-white border border-iica-border text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}
          {totalPages > 5 && (
            <>
              <span className="px-2 self-center text-gray-400">…</span>
              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                className="min-w-[40px] min-h-[40px] rounded-lg text-sm font-medium bg-white border border-iica-border text-gray-700 hover:bg-gray-50"
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
