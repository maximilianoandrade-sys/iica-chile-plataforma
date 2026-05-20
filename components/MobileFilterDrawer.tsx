'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ProjectFilters, type FilterCounts } from '@/components/ProjectFilters';
import { Button } from '@/components/ui/Button';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('MobileFilterDrawer');

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterCounts: FilterCounts;
  totalCount: number;
  filteredCount: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filterCounts,
  totalCount,
  filteredCount,
}: MobileFilterDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus panel when opened
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // Escape key closes drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  logger.debug('render', { isOpen, filteredCount });

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de búsqueda"
        tabIndex={-1}
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar filtros"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProjectFilters
            filterCounts={filterCounts}
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <Button variant="primary" className="w-full" onClick={onClose}>
            Ver {filteredCount} resultados
          </Button>
        </div>
      </div>
    </>
  );
}
