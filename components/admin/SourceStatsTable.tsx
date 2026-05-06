"use client";
import React from 'react';
import { InstitutionLogo } from '../InstitutionLogo';

interface SourceStat {
  source: string;
  total: number;
  active: number;
  needsReview: number;
  lastScraped: string;
}

export function SourceStatsTable({ stats }: { stats: SourceStat[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-4">Fuente</th>
            <th className="px-6 py-4">Total Proyectos</th>
            <th className="px-6 py-4">Activos</th>
            <th className="px-6 py-4">Pendientes AI</th>
            <th className="px-6 py-4">Última Ingesta</th>
            <th className="px-6 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stats.map((stat) => (
            <tr key={stat.source} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3">
                <InstitutionLogo nombre={stat.source} size={32} />
                <span className="font-medium text-gray-900">{stat.source}</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{stat.total}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {stat.active}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stat.needsReview > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {stat.needsReview}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-400">
                {stat.lastScraped}
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Run Scraper
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
