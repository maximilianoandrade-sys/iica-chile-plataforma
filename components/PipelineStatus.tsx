'use client';

import { Clock } from 'lucide-react';

interface PipelineStatusProps {
  lastUpdated: Date | string;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Hace menos de un minuto';
  if (diffMinutes < 60) return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
}

export default function PipelineStatus({ lastUpdated }: PipelineStatusProps) {
  const date = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const isRecent = diffMs < 60 * 60 * 1000; // less than 1 hour

  return (
    <div
      className="flex items-center gap-2 text-sm text-gray-600"
      aria-live="polite"
      role="status"
    >
      {isRecent ? (
        <span className="relative flex h-3 w-3" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
      ) : (
        <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
      )}
      <span>
        {isRecent ? 'Datos actualizados recientemente' : `Actualizado ${timeAgo(date)}`}
      </span>
    </div>
  );
}
