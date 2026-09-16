'use client';

import React, { useEffect, useState } from 'react';
import { Star, X, ExternalLink, Calendar, Trash2 } from 'lucide-react';
import { type Project } from '@/lib/project-utils';
import { getFavoriteIds, toggleFavorite } from '@/lib/utils/favorites';
import Link from 'next/link';

interface FavoritesDrawerProps {
  allProjects: Project[];
  isOpen: boolean;
  onClose: () => void;
}

export default function FavoritesDrawer({ allProjects, isOpen, onClose }: FavoritesDrawerProps) {
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([]);

  const refreshFavorites = React.useCallback(() => {
    const ids = getFavoriteIds();
    const matched = allProjects.filter((p) => ids.includes(p.id));
    setFavoriteProjects(matched);
  }, [allProjects]);

  useEffect(() => {
    refreshFavorites();

    const handleUpdate = () => refreshFavorites();
    window.addEventListener('iica_favorites_updated', handleUpdate);
    return () => window.removeEventListener('iica_favorites_updated', handleUpdate);
  }, [refreshFavorites]);

  if (!isOpen) return null;

  const handleRemove = (id: number) => {
    toggleFavorite(id);
    refreshFavorites();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[var(--iica-navy)] to-blue-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <h2 className="font-bold text-lg leading-tight">Mis Oportunidades Guardadas</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {favoriteProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 space-y-3">
                <Star className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700" />
                <p className="font-medium text-sm">No tienes oportunidades guardadas aún.</p>
                <p className="text-xs">Haz clic en la estrella ★ de cualquier tarjeta para guardarla en tu navegador.</p>
              </div>
            ) : (
              favoriteProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-[var(--iica-blue)] dark:text-blue-300">
                        {project.institucion}
                      </span>
                      <button
                        onClick={() => handleRemove(project.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Remover de guardados"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <Link
                      href={`/proyecto/${project.id}`}
                      onClick={onClose}
                      className="font-bold text-sm text-[var(--iica-navy)] dark:text-white hover:text-[var(--iica-blue)] line-clamp-2"
                    >
                      {project.nombre}
                    </Link>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
                      <span>{project.montoTexto ?? 'Ver bases'}</span>
                      <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                        <Calendar className="h-3 w-3" /> Cierra {project.fecha_cierre}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <Link
                      href={`/proyecto/${project.id}`}
                      onClick={onClose}
                      className="text-xs font-bold text-[var(--iica-blue)] hover:underline flex items-center gap-1"
                    >
                      Ver Detalle
                    </Link>
                    {project.url_bases && (
                      <a
                        href={project.url_bases}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                      >
                        Bases <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500">
            Tus guardados persisten en este navegador sin necesidad de iniciar sesión.
          </div>
        </div>
      </div>
    </div>
  );
}
