'use client';

import { useState } from 'react';
import { X, Scale, ExternalLink, Calendar, MapPin, Coins, ShieldCheck, Check } from 'lucide-react';
import type { Project } from '@/lib/data';
import { InstitutionLogo } from '@/components/InstitutionLogo';

interface TenderComparatorProps {
  selectedProjects: Project[];
  onRemoveProject: (id: number) => void;
  onClear: () => void;
}

export function TenderComparator({ selectedProjects, onRemoveProject, onClear }: TenderComparatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedProjects.length === 0) return null;

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--iica-navy)] dark:bg-gray-800 text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-400/40 flex items-center gap-4 animate-bounce-short">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-[var(--iica-yellow)]" aria-hidden="true" />
          <span className="text-xs font-extrabold">
            {selectedProjects.length} {selectedProjects.length === 1 ? 'Convocatoria Seleccionada' : 'Convocatorias Seleccionadas'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-[var(--iica-yellow)] text-gray-900 hover:bg-yellow-400 font-extrabold text-xs rounded-xl transition-all shadow-md min-h-[44px] cursor-pointer"
          >
            ⚖️ Comparar Lado a Lado
          </button>
          
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Limpiar selección"
            aria-label="Limpiar selección de comparación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comparison Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-gray-700 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-[var(--iica-blue)] rounded-2xl">
                  <Scale className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--iica-navy)] dark:text-white">
                    Comparativa Lado a Lado de Convocatorias
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Contraste directo de montos, plazos, cofinanciamiento y perfil de elegibilidad entre las opciones seleccionadas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Cerrar comparador"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comparison Grid Table */}
            <div className={`grid grid-cols-1 md:grid-cols-${selectedProjects.length} gap-6`}>
              {selectedProjects.map((p) => (
                <div key={p.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-gray-50/50 dark:bg-gray-800/40 flex flex-col justify-between relative">
                  
                  <button
                    type="button"
                    onClick={() => onRemoveProject(p.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                    title="Quitar de la comparación"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    {/* Header: Institution + Name */}
                    <div className="flex items-center gap-2 mb-3">
                      <InstitutionLogo nombre={p.institucion} size={32} />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">{p.institucion}</span>
                    </div>

                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-4 line-clamp-2">
                      {p.nombre}
                    </h3>

                    {/* Attribute Rows */}
                    <div className="space-y-4 text-xs border-t pt-4 dark:border-gray-700">
                      {/* Monto */}
                      <div>
                        <span className="font-bold text-gray-500 uppercase tracking-wide block mb-1">Monto / Subvención</span>
                        <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                          {p.montoTexto || (p.monto ? `$${p.monto}` : 'Ver bases')}
                        </span>
                      </div>

                      {/* Cofinanciamiento */}
                      <div>
                        <span className="font-bold text-gray-500 uppercase tracking-wide block mb-1">Cofinanciamiento</span>
                        {p.requiere_cofinanciamiento ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 font-bold rounded-md">
                            ⚠️ Exige aporte propio
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 font-bold rounded-md">
                            🌱 100% Subvención (Sin aporte)
                          </span>
                        )}
                      </div>

                      {/* Fecha de Cierre */}
                      <div>
                        <span className="font-bold text-gray-500 uppercase tracking-wide block mb-1">Fecha de Cierre</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {p.fecha_cierre}
                        </span>
                      </div>

                      {/* Beneficiarios */}
                      <div>
                        <span className="font-bold text-gray-500 uppercase tracking-wide block mb-1">Perfil Elegible</span>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          {p.beneficiarios?.join(', ') || 'Consultar bases'}
                        </p>
                      </div>

                      {/* Rol IICA */}
                      <div>
                        <span className="font-bold text-gray-500 uppercase tracking-wide block mb-1">Rol IICA</span>
                        <span className="font-extrabold text-blue-700 dark:text-blue-300">
                          {p.rolIICA || 'Asesor'} (Viabilidad {p.viabilidadIICA})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t dark:border-gray-700">
                    <a
                      href={p.url_bases}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--iica-navy)] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all min-h-[44px]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver Bases Oficiales
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
