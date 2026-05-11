"use client";
import React from 'react';
import { InstitutionLogo } from '../InstitutionLogo';

interface SourceStat {
  slug: string;
  name: string;
  projectsCount: number;
  lastRunAt: Date | null;
  lastRunStatus: string | null;
  lastRunError: string | null;
  enabled: boolean;
}

export function SourceStatsTable({ stats }: { stats: SourceStat[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-4">Fuente</th>
            <th className="px-6 py-4">Proyectos</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4">Última Ingesta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stats.map((stat) => (
            <tr key={stat.slug} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3">
                <InstitutionLogo nombre={stat.name} size={32} />
                <span className="font-medium text-gray-900">{stat.name}</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{stat.projectsCount}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stat.lastRunStatus === 'success' ? 'bg-green-100 text-green-700' :
                  stat.lastRunStatus === 'error' ? 'bg-red-100 text-red-700' :
                  stat.lastRunStatus === 'partial' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {stat.lastRunStatus || 'Sin ejecutar'}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-400">
                {stat.lastRunAt ? new Date(stat.lastRunAt).toLocaleDateString('es-CL') : 'Nunca'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
