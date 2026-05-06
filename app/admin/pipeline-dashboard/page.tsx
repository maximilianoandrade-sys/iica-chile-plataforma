import React from 'react';
import { getPipelineMetrics } from '@/lib/actions/pipeline';
import { SourceStatsTable } from '@/components/admin/SourceStatsTable';
import { Activity, AlertCircle, CheckCircle, Database } from 'lucide-react';

export default async function PipelineDashboard() {
  const { stats, summary } = await getPipelineMetrics();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Pipeline Monitoring</h2>
        <p className="text-gray-500">Estado de la ingesta automática y validación AI de proyectos.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Database size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Total Proyectos</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Activos</p>
            <p className="text-2xl font-bold text-gray-900">{summary.active}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Pendientes AI</p>
            <p className="text-2xl font-bold text-gray-900">{summary.pendingReview}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Fuentes Activas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.length}</p>
          </div>
        </div>
      </div>

      {/* Stats Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Estadísticas por Fuente</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Ejecutar Pipeline Completo
          </button>
        </div>
        <SourceStatsTable stats={stats} />
      </div>
    </div>
  );
}
