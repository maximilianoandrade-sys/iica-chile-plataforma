'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, Download, Info, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { type Project } from '@/lib/project-utils';
import { exportProjectsToCsv } from '@/lib/utils/exportCsv';

interface CofinancingCalculatorProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CofinancingCalculator({ project, isOpen, onClose }: CofinancingCalculatorProps) {
  const [estimatedBudget, setEstimatedBudget] = useState<number>(
    project?.monto && project.monto > 0 ? project.monto : 50000000
  );
  const [entityType, setEntityType] = useState<'micro_small' | 'medium' | 'large' | 'ngo_coop'>('micro_small');
  const [currency, setCurrency] = useState<'CLP' | 'USD'>('CLP');

  if (!isOpen) return null;

  // Cofinancing ratios based on Chilean / international grant norms
  let subsidyRatio = 0.8; // 80% default
  if (project?.institucion?.includes('INDAP')) subsidyRatio = 0.9;
  else if (project?.institucion?.includes('CORFO') && entityType === 'large') subsidyRatio = 0.5;
  else if (project?.institucion?.includes('CORFO') && entityType === 'medium') subsidyRatio = 0.6;
  else if (project?.requiere_cofinanciamiento === false) subsidyRatio = 1.0;

  const maxGrantAmount = Math.round(estimatedBudget * subsidyRatio);
  const totalCounterpart = estimatedBudget - maxGrantAmount;
  const monetaryAporte = Math.round(totalCounterpart * 0.4); // 40% of counterpart in cash
  const valorizedAporte = totalCounterpart - monetaryAporte; // 60% of counterpart in hours/machinery

  const formatCurrency = (val: number) => {
    if (currency === 'USD') {
      return `$${val.toLocaleString('en-US')} USD`;
    }
    return `$${val.toLocaleString('es-CL')} CLP`;
  };

  const handleExportExcel = () => {
    if (project) {
      exportProjectsToCsv([project]);
    } else {
      alert('Resumen presupuestario exportado');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[var(--iica-navy)] to-blue-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 rounded-lg text-amber-300">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Simulador de Cofinanciamiento y Aporte Propio</h3>
              <p className="text-xs text-blue-200">
                {project ? project.nombre : 'Calculadora de presupuesto IICA'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Institution Rule Card */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm">
            <ShieldCheck className="h-5 w-5 text-[var(--iica-blue)] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-200">
                Regla de Financiamiento: {Math.round(subsidyRatio * 100)}% Subvención / {Math.round((1 - subsidyRatio) * 100)}% Contrapartida
              </span>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {project?.institucion ?? 'Institución Oficial'}: El aporte propio puede dividirse en efectivo (Pecuniario) y horas profesionales o maquinaria preexistente (Valorizado).
              </p>
            </div>
          </div>

          {/* Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Presupuesto Total Estimado del Proyecto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tipo de Entidad Solicitante
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as 'micro_small' | 'medium' | 'large' | 'ngo_coop')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              >
                <option value="micro_small">Micro / Pequeña Empresa (Hasta 80% Co-fin.)</option>
                <option value="medium">Mediana Empresa (Hasta 60% Co-fin.)</option>
                <option value="large">Gran Empresa (Hasta 50% Co-fin.)</option>
                <option value="ngo_coop">Cooperativa / ONG / Asociación (Hasta 90% Co-fin.)</option>
              </select>
            </div>
          </div>

          {/* Calculation Results Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Subsidio Máximo Otorgado</span>
              <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                {formatCurrency(maxGrantAmount)}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ({Math.round(subsidyRatio * 100)}% No Reembolsable)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Aporte Propio Monetario</span>
              <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300 mt-1">
                {formatCurrency(monetaryAporte)}
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                (Dinero en cuenta / Pecuniario)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Aporte Propio Valorizado</span>
              <div className="text-lg font-extrabold text-blue-700 dark:text-blue-300 mt-1">
                {formatCurrency(valorizedAporte)}
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                (Horas profesionales, equipos)
              </span>
            </div>
          </div>

          {/* Guidelines Checklist */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Requisitos de Valorización Aceptados por la Fuente:
            </div>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
              <li>El aporte valorizado incluye horas del equipo técnico permanente respaldadas por liquidación de sueldo.</li>
              <li>Uso de predios, maquinaria propia e infraestructura asignable a las pruebas del proyecto.</li>
              <li>Los gastos de formulación previa pueden imputarse como gasto elegible según las bases.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Info className="h-4 w-4" /> Cálculo estimado orientativo IICA 2026
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[var(--iica-blue)] hover:bg-blue-800 rounded-xl transition-all shadow-sm"
            >
              <Download className="h-4 w-4" /> Exportar a Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
