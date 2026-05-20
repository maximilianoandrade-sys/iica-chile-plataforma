'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { ProjectRow } from '@/components/ProjectRow';
import { ProjectFilters, type FilterCounts } from '@/components/ProjectFilters';
import { MobileFilterDrawer } from '@/components/MobileFilterDrawer';
import { daysUntilClose } from '@/lib/data';
import { getLogger } from '@/lib/utils/logger';
import type { Project } from '@/lib/data';

const logger = getLogger('ProjectList');
const ITEMS_PER_PAGE = 15;

interface ProjectListProps {
  projects: Project[];
  filterCounts: FilterCounts;
  totalCount: number;
}

export default function ProjectList({ projects, filterCounts, totalCount }: ProjectListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Read sort and page from URL
  const sort = searchParams.get('sort') || 'date_asc';
  const currentPage = Number(searchParams.get('page') || '1');

  // Count active filters (exclude page and sort)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'sort' && value.trim() !== '') {
        count++;
      }
    });
    return count;
  }, [searchParams]);

  // URL update helpers
  const updateSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Client-side sort
  const sortedProjects = useMemo(() => {
    const sorted = [...projects];
    switch (sort) {
      case 'date_asc':
        sorted.sort((a, b) => {
          const dA = daysUntilClose(a);
          const dB = daysUntilClose(b);
          return dA - dB;
        });
        break;
      case 'amount_desc':
        sorted.sort((a, b) => {
          const mA = a.monto || 0;
          const mB = b.monto || 0;
          if (mA === 0 && mB === 0) return 0;
          if (mA === 0) return 1;
          if (mB === 0) return -1;
          return mB - mA;
        });
        break;
      case 'recent':
        sorted.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    return sorted;
  }, [projects, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedProjects = sortedProjects.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Generate page numbers for pagination nav
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  logger.debug('Rendering ProjectList', {
    totalProjects: projects.length,
    sort,
    currentPage: safePage,
    totalPages,
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Left sidebar - filters (desktop only) */}
      <aside className="hidden sm:block sm:w-72 xl:w-80 flex-shrink-0 sm:sticky sm:top-24 sm:self-start">
        <ProjectFilters filterCounts={filterCounts} totalCount={totalCount} filteredCount={projects.length} />
      </aside>

      {/* Right main content */}
      <main className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Mobile filter button */}
          <button
            type="button"
            className="sm:hidden inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg border border-iica-border bg-white text-sm font-medium text-iica-navy hover:bg-gray-50 transition-colors"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>

          {/* Desktop result count */}
          <div
            className="hidden sm:block text-sm text-gray-600"
            aria-live="polite"
          >
            Mostrando {projects.length} de {totalCount} oportunidades
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="sort-select" className="text-sm text-gray-600 hidden sm:inline">
              Ordenar por
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => updateSort(e.target.value)}
              className="min-h-[44px] rounded-lg border border-iica-border bg-white px-3 text-sm text-iica-navy focus:outline-none focus:ring-2 focus:ring-iica-navy/20"
            >
              <option value="date_asc">Cierre más próximo</option>
              <option value="amount_desc">Mayor monto</option>
              <option value="recent">Más recientes</option>
            </select>
          </div>
        </div>

        {/* Mobile result count */}
        <div
          className="sm:hidden text-sm text-gray-600 mb-3"
          aria-live="polite"
        >
          Mostrando {projects.length} de {totalCount} oportunidades
        </div>

        {/* Project rows */}
        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">
              No encontramos oportunidades con estos filtros.
            </p>
            <p className="mt-2">Pruebe ampliar su búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="border-t border-iica-border rounded-xl overflow-hidden bg-white shadow-sm">
              {paginatedProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-iica-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Página anterior"
                >
                  ←
                </button>

                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => goToPage(num)}
                    aria-current={num === safePage ? 'page' : undefined}
                    className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      num === safePage
                        ? 'bg-iica-navy text-white'
                        : 'border border-iica-border hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-iica-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Página siguiente"
                >
                  →
                </button>
              </nav>
            )}
          </>
        )}
      </main>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        filterCounts={filterCounts}
        totalCount={totalCount}
        filteredCount={projects.length}
      />
    </div>
  );
}
