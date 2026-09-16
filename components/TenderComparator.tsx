'use client';

import { useState } from 'react';
import { X, Scale, ExternalLink, Calendar, MapPin, Coins, ShieldCheck, Sparkles, Check, Download, AlertCircle } from 'lucide-react';
import type { Project } from '@/lib/project-utils';
import { InstitutionLogo } from '@/components/InstitutionLogo';
import { CalendarReminderButton } from '@/components/CalendarReminderButton';
import { exportProjectsToCsv } from '@/lib/utils/exportCsv';

interface TenderComparatorProps {
  selectedProjects: Project[];
  onRemoveProject: (id: number) => void;
  onClear: () => void;
}

export function TenderComparator({ selectedProjects, onRemoveProject, onClear }: TenderComparatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedProjects.length === 0) return null;

  // Calculate highest amount or 100% subsidy project
  const highestSubsidyId = selectedProjects.find(p => !p.requiere_cofinanciamiento)?.id ?? selectedProjects[0]?.id;

  return (
    <>
      {/* Glassmorphism Floating Dock Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--iica-navy)]/95 dark:bg-gray-900/95 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-blue-400/30 flex items-center gap-4 animate-fade-in max-w-[95vw] sm:max-w-auto">
        
        {/* Selected Logos Preview */}
        <div className="hidden sm:flex items-center -space-x-2 overflow-hidden py-1">
          {selectedProjects.map((p) => (
            <div key={p.id} className="relative inline-block ring-2 ring-white dark:ring-gray-800 rounded-full bg-white p-1">
              <InstitutionLogo nombre={p.institucion} size={24} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-[var(--iica-yellow)] shrink-0" aria-hidden="true" />
          <span className="text-xs font-extrabold whitespace-nowrap">
            {selectedProjects.length} {selectedProjects.length === 1 ? 'Convocatoria' : 'Convocatorias'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-4 py-2.5 bg-[var(--iica-yellow)] text-gray-900 hover:bg-yellow-400 font-extrabold text-xs rounded-xl transition-all shadow-md min-h-[44px] cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>⚖️ Ver Comparativa Lado a Lado</span>
          </button>

          <button
            type="button"
            onClick={() => exportProjectsToCsv(selectedProjects, 'Comparativa_Radar_IICA.csv')}
            className="hidden md:flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors min-h-[44px]"
            title="Exportar seleccionadas a Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>
          
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="Limpiar selección"
            aria-label="Limpiar selección de comparación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comparison Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-gray-800 rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[var(--iica-navy)] text-[var(--iica-yellow)] rounded-2xl shadow-inner">
                  <Scale className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-[var(--iica-navy)] dark:text-white flex items-center gap-2">
                    Matriz Comparativa de Convocatorias
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Alineación fila por fila para contrastar montos, exigencia de cofinanciamiento, fechas y viabilidad IICA.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportProjectsToCsv(selectedProjects, 'Comparativa_Radar_IICA.csv')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 transition-colors min-h-[44px]"
                >
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Exportar Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Cerrar comparador"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Matrix Body — Synchronized Rows */}
            <div className="overflow-x-auto p-4 md:p-6 flex-1">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th scope="col" className="w-48 p-4 text-xs font-extrabold uppercase text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30 rounded-tl-2xl">
                      Criterio de Evaluación
                    </th>
                    {selectedProjects.map((p) => (
                      <th key={p.id} className="p-4 text-left align-top bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 relative">
                        {p.id === highestSubsidyId && (
                          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-300">
                            <Sparkles className="w-3 h-3 text-emerald-600" /> Destacado
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => onRemoveProject(p.id)}
                          className="text-xs text-gray-400 hover:text-red-500 font-bold mb-2 flex items-center gap-1"
                          title="Quitar de la comparación"
                        >
                          <X className="w-3.5 h-3.5" /> Quitar
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                          <InstitutionLogo nombre={p.institucion} size={28} />
                          <span className="text-xs font-extrabold text-gray-600 dark:text-gray-400 truncate">{p.institucion}</span>
                        </div>

                        <h3 className="font-extrabold text-sm text-[var(--iica-navy)] dark:text-white line-clamp-2 leading-snug">
                          {p.nombre}
                        </h3>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {/* Row 1: Monto Subvención */}
                  <tr className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="p-4 font-extrabold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Monto Máximo
                    </td>
                    {selectedProjects.map((p) => (
                      <td key={p.id} className="p-4 font-extrabold text-sm text-gray-900 dark:text-gray-100 border-l border-gray-200 dark:border-gray-800">
                        {p.montoTexto || (p.monto ? `$${p.monto.toLocaleString('es-CL')}` : 'Ver bases')}
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Cofinanciamiento */}
                  <tr className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="p-4 font-extrabold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Exigencia Cofinanciamiento
                    </td>
                    {selectedProjects.map((p) => (
                      <td key={p.id} className="p-4 border-l border-gray-200 dark:border-gray-800">
                        {p.requiere_cofinanciamiento ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-200">
                            ⚠️ Aporte Propio Obligatorio
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200 border border-emerald-200">
                            🌱 100% Subvención (Sin Aporte)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Fecha Cierre */}
                  <tr className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="p-4 font-extrabold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Fecha de Cierre
                    </td>
                    {selectedProjects.map((p) => (
                      <td key={p.id} className="p-4 border-l border-gray-200 dark:border-gray-800 font-bold text-gray-800 dark:text-gray-200">
                        <div className="flex flex-col gap-1">
                          <span>{p.fecha_cierre}</span>
                          <CalendarReminderButton project={p} />
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Cobertura Región */}
                  <tr className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="p-4 font-extrabold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Región / Cobertura
                    </td>
                    {selectedProjects.map((p) => (
                      <td key={p.id} className="p-4 border-l border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                        {p.regiones?.join(', ') || p.region || p.ambito}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: Beneficiarios */}
                  <tr className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="p-4 font-extrabold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30">
                      Perfil Elegible
                    </td>
                    {selectedProjects.map((p) => (
                      <td key={p.id} className="p-4 border-l border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                        {p.beneficiarios?.join(', ') || 'Consultar en bases'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Rol IICA */}
                  <tr className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="p-4 font-extrabold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30">
                      Rol IICA & Viabilidad
                    </td>
                    {selectedProjects.map((p) => (
                      <td key={p.id} className="p-4 border-l border-gray-200 dark:border-gray-800 font-extrabold text-[var(--iica-navy)] dark:text-blue-300">
                        {p.rolIICA || 'Asesor Técnico'} (Viabilidad {p.viabilidadIICA || 'Alta'})
                      </td>
                    ))}
                  </tr>

                  {/* Row 7: Acciones Directas */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 rounded-bl-2xl">
                      Acción
                    </td>
                    {selectedProjects.map((p) => (
                      <td key={p.id} className="p-4 border-l border-gray-200 dark:border-gray-800">
                        <a
                          href={p.url_bases}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-extrabold text-xs rounded-xl transition-all shadow-md min-h-[44px]"
                        >
                          <span>Ver Bases Oficiales</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
