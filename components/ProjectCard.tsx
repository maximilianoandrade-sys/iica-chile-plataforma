'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { type Project, daysUntilClose, pluralizeDias } from '@/lib/data';
import { InstitutionLogo } from '@/components/InstitutionLogo';
import { Badge } from '@/components/ui/Badge';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('ProjectCard');

function formatDeadline(project: Project): { text: string; urgency: 'critical' | 'warning' | 'normal' | 'closed' } {
  const days = daysUntilClose(project);
  if (days === 999) return { text: 'Sin fecha definida', urgency: 'normal' };
  if (days < 0) return { text: 'Cerrada', urgency: 'closed' };
  if (days === 0) return { text: 'Cierra hoy', urgency: 'critical' };
  if (days <= 7) return { text: `Cierra en ${pluralizeDias(days)}`, urgency: 'critical' };
  if (days <= 21) return { text: `Cierra en ${pluralizeDias(days)}`, urgency: 'warning' };
  return { text: `Cierra en ${pluralizeDias(days)}`, urgency: 'normal' };
}

function formatMonto(project: Project): string {
  if (project.montoTexto) return project.montoTexto;
  if (project.monto) return `$${Math.round(project.monto / 1_000_000)}M CLP`;
  return 'Monto no definido';
}

const urgencyVariantMap = {
  critical: 'urgencyHigh',
  warning: 'urgencyMedium',
  normal: 'urgencyLow',
  closed: 'urgencyNone',
} as const;

export function ProjectCard({ project }: { project: Project }) {
  const isClosed = project.estadoPostulacion === 'Cerrada';
  const { text: deadlineText, urgency } = formatDeadline(project);
  const monto = formatMonto(project);
  const region = project.regiones?.[0] ?? project.region ?? null;

  logger.debug('Rendering ProjectCard', { id: project.id });

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border border-iica-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${isClosed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <InstitutionLogo nombre={project.institucion} size={32} />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {project.institucion}
          </span>
        </div>
        <Badge variant={urgencyVariantMap[urgency]}>
          {deadlineText}
        </Badge>
      </div>

      <Link
        href={`/proyecto/${project.id}`}
        className="stretched-link text-base font-semibold text-iica-navy line-clamp-2 hover:underline focus-visible:ring-2 focus-visible:ring-iica-yellow focus-visible:outline-none rounded mb-3"
      >
        {project.nombre}
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <span className="text-sm font-bold text-gray-900">{monto}</span>
        {region && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            {region}
          </span>
        )}
      </div>
    </article>
  );
}
