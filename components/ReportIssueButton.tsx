'use client';

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportIssueModal } from '@/components/ReportIssueModal';

interface ReportIssueButtonProps {
  projectId: number;
  projectTitle: string;
  className?: string;
}

export function ReportIssueButton({ projectId, projectTitle, className = '' }: ReportIssueButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 ${className}`}
        title="Reportar información desactualizada o enlace roto en esta convocatoria"
      >
        <Flag className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
        <span>¿Enlace caído o fecha errónea? Reportar aquí</span>
      </button>

      <ReportIssueModal
        projectId={projectId}
        projectTitle={projectTitle}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

export default ReportIssueButton;
