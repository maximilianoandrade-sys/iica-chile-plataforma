'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { Project } from '@/lib/project-utils';
import { ProposalGeneratorModal } from '@/components/ProposalGeneratorModal';

interface ProposalGeneratorButtonProps {
  project: Project;
  className?: string;
}

export function ProposalGeneratorButton({ project, className = '' }: ProposalGeneratorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow min-h-[44px] ${className}`}
        title="Generar borrador de postulación con Asistente IA"
      >
        <Sparkles className="h-4 w-4 text-amber-200" />
        <span>Borrador con IA</span>
      </button>

      <ProposalGeneratorModal
        project={project}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

export default ProposalGeneratorButton;
