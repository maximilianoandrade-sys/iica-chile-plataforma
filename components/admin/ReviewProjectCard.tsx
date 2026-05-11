"use client";
import React from 'react';
import { Project } from '@prisma/client';
import { InstitutionLogo } from '../InstitutionLogo';
import { Check, X, ExternalLink, Calendar, DollarSign } from 'lucide-react';

interface ReviewProjectCardProps {
  project: Project;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}

export function ReviewProjectCard({ project, onApprove, onReject }: ReviewProjectCardProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    try {
      await action();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <InstitutionLogo nombre={project.institucion} size={40} />
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{project.nombre}</h3>
              <p className="text-sm text-gray-500">{project.institucion} • {project.categoria}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
            Review Pending
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 italic">
          {project.objetivo || "Sin objetivo definido."}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} className="text-blue-500" />
            <span>Cierre: {new Date(project.fecha_cierre).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <DollarSign size={14} className="text-green-500" />
            <span>Monto: ${project.monto?.toLocaleString() || "N/A"}</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-gray-50">
          <a 
            href={project.url_bases} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
          >
            Ver bases originales <ExternalLink size={12} />
          </a>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(() => onReject(project.id))}
              disabled={isProcessing}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Rechazar y descartar"
            >
              <X size={20} />
            </button>
            <button
              onClick={() => handleAction(() => onApprove(project.id))}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Check size={18} /> Aprobar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
