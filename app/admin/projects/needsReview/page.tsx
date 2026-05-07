import React from 'react';
import { getProjectsNeedingReview, approveProject, rejectProject } from '@/lib/actions/projects';
import { ReviewProjectCard } from '@/components/admin/ReviewProjectCard';
import { Inbox, ShieldCheck } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function NeedsReviewPage() {
  const projects = await getProjectsNeedingReview();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest">
            <ShieldCheck size={16} /> Verificación AI
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bandeja de Revisión</h2>
          <p className="text-gray-500 max-w-2xl">
            Proyectos detectados por el pipeline que requieren validación humana antes de ser publicados en la plataforma pública.
          </p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-xl border shadow-sm text-sm font-medium text-gray-600">
          <span className="text-blue-600 font-bold">{projects.length}</span> Pendientes
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-gray-50 text-gray-400 rounded-full">
            <Inbox size={48} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">¡Bandeja limpia!</h3>
            <p className="text-sm text-gray-500">No hay proyectos pendientes de revisión en este momento.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ReviewProjectCard 
              key={project.id} 
              project={project} 
              onApprove={approveProject}
              onReject={rejectProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
