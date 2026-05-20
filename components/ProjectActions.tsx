'use client';

import React from 'react';
import { Copy, Eye, CheckCheck } from 'lucide-react';

interface ProjectActionsProps {
  projectId: number;
  isFavorite: boolean;
  isComparing: boolean;
  copiedId: number | null;
  onToggleFavorite: (id: number) => void;
  onToggleCompare: (id: number) => void;
  onCopy: (id: number, e: React.MouseEvent) => void;
  onQuickView: (id: number) => void;
}

export default function ProjectActions({
  projectId,
  isFavorite,
  isComparing,
  copiedId,
  onToggleFavorite,
  onToggleCompare,
  onCopy,
  onQuickView,
}: ProjectActionsProps) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={(e) => onCopy(projectId, e)}
        className={`p-2.5 rounded-xl border transition-all ${copiedId === projectId ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
        aria-label="Copiar ficha del proyecto"
      >
        {copiedId === projectId ? <CheckCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
      </button>
      <button
        onClick={() => onQuickView(projectId)}
        className="p-2.5 rounded-xl border bg-white text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-all"
        aria-label="Ver vista rápida del proyecto"
      >
        <Eye className="h-5 w-5" />
      </button>
    </div>
  );
}
