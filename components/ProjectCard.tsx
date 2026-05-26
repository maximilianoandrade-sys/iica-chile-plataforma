'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { type Project, daysUntilClose, formatDeadline, pluralizeDias } from '@/lib/data';
import { InstitutionLogo } from '@/components/InstitutionLogo';
import { Badge } from '@/components/ui/Badge';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('ProjectCard');

function formatDeadlineStatus(project: Project): {
  text: string;
  detail: string;
  urgency: 'critical' | 'warning' | 'normal' | 'closed';
} {
  const days = daysUntilClose(project);
  const closeDate = formatDeadline(project.fecha_cierre);

  if (days === 999) {
    return {
      text: 'Sin fecha definida',
      detail: 'Cierre por confirmar',
      urgency: 'normal',
    };
  }

  if (days < 0) {
    return {
      text: 'Cerrada',
      detail: `Cerró: ${closeDate}`,
      urgency: 'closed',
    };
  }

  return {
    text: days === 0 ? 'Cierra hoy' : `Cierra en ${pluralizeDias(days)}`,
    detail: `Fecha límite: ${closeDate}`,
    urgency: days <= 7 ? 'critical' : days <= 21 ? 'warning' : 'normal',
  };
}

function formatMonto(project: Project): string {
  if (project.montoTexto && project.montoTexto.trim()) return project.montoTexto;
  if (project.monto) return `$${Math.round(project.monto / 1_000_000)}M CLP`;
  return 'Ver bases oficiales';
}

const urgencyVariantMap = {
  critical: 'urgencyHigh',
  warning: 'urgencyMedium',
  normal: 'urgencyLow',
  closed: 'urgencyNone',
} as const;

const urgencyBadgeClassMap = {
  critical: '!bg-red-600 !text-white !border-red-700',
  warning: '!bg-amber-500 !text-white !border-amber-600',
  normal: '!bg-emerald-600 !text-white !border-emerald-700',
  closed: '!bg-slate-200 !text-slate-700 !border-slate-300',
} as const;

export function ProjectCard({ project }: { project: Project }) {
  const isClosed = project.estadoPostulacion === 'Cerrada';
  const { text: deadlineText, detail: deadlineDetail, urgency } = formatDeadlineStatus(project);
  const monto = formatMonto(project);
  const region = project.regiones?.[0] ?? project.region ?? null;
  const institutionUpper = (project.institucion || '').toUpperCase();
  const isLikelyInternational = project.ambito === 'Internacional' || ['WORLD BANK', 'FAO', 'FONTAGRO', 'FIDA', 'IFAD', 'BID', 'IADB', 'IICA', 'PNUD', 'GEF', 'GCF', 'UE'].some((k) => institutionUpper.includes(k));

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
        <div className="flex flex-col items-end gap-1 text-right">
          <Badge
            variant={urgencyVariantMap[urgency]}
            className={`${urgencyBadgeClassMap[urgency]} px-3 py-1 text-sm font-extrabold tracking-tight whitespace-nowrap shadow-sm`}
          >
            {deadlineText}
          </Badge>
          <span className="text-[11px] font-semibold text-gray-600">
            {deadlineDetail}
          </span>
        </div>
      </div>

      <Link
        href={`/proyecto/${project.id}`}
        className="stretched-link text-base font-semibold text-iica-navy line-clamp-2 hover:underline focus-visible:ring-2 focus-visible:ring-iica-yellow focus-visible:outline-none rounded mb-3"
      >
        {project.nombre}
      </Link>

      {isLikelyInternational && (
        <span className="mb-2 inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700">
          Internacional
        </span>
      )}

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
