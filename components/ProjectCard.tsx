'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { type Project, daysUntilClose, formatDeadline, pluralizeDias } from '@/lib/data';
import { InstitutionLogo } from '@/components/InstitutionLogo';
import { Badge } from '@/components/ui/Badge';
import { getLogger } from '@/lib/utils/logger';
import { trackEvent } from '@/lib/analytics';

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
  critical: '!bg-red-50 !text-red-800 !border-red-200',
  warning: '!bg-amber-50 !text-amber-800 !border-amber-200',
  normal: '!bg-emerald-50 !text-emerald-800 !border-emerald-200',
  closed: '!bg-slate-100 !text-slate-700 !border-slate-300',
} as const;

export function ProjectCard({ project }: { project: Project }) {
  const isClosed = project.estadoPostulacion === 'Cerrada';
  const { text: deadlineText, detail: deadlineDetail, urgency } = formatDeadlineStatus(project);
  const monto = formatMonto(project);
  const region = project.regiones?.[0] ?? project.region ?? null;
  const institutionUpper = (project.institucion || '').toUpperCase();
  const isLikelyInternational = project.ambito === 'Internacional' || ['WORLD BANK', 'FAO', 'FONTAGRO', 'FIDA', 'IFAD', 'BID', 'IADB', 'IICA', 'PNUD', 'GEF', 'GCF', 'UE'].some((k) => institutionUpper.includes(k));

  logger.debug('Rendering ProjectCard', { id: project.id });

  const handleProjectClick = () => {
    trackEvent({
      action: 'project_click',
      category: 'Search',
      label: `${project.id}:${project.nombre}`,
    });
  };

  return (
    <article
      className={`group relative flex min-h-[184px] flex-col rounded-xl border border-iica-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${isClosed ? 'opacity-60' : ''}`}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <InstitutionLogo nombre={project.institucion} size={32} />
          <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {project.institucion}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          <Badge
            variant={urgencyVariantMap[urgency]}
            className={`${urgencyBadgeClassMap[urgency]} whitespace-nowrap px-2.5 py-1 text-xs font-bold tracking-tight shadow-sm`}
          >
            {deadlineText}
          </Badge>
          <span className="text-[11px] font-medium text-gray-600">
            {deadlineDetail}
          </span>
        </div>
      </div>

        <Link
          href={`/proyecto/${project.id}`}
          onClick={handleProjectClick}
          className="stretched-link mb-2 line-clamp-2 rounded text-[15px] font-semibold leading-5 text-iica-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iica-yellow"
        >
          {project.nombre}
        </Link>

      {isLikelyInternational && (
        <span className="mb-2 inline-flex w-fit items-center rounded-full border border-iica-blue/20 bg-iica-blue/10 px-2 py-0.5 text-[10px] font-semibold text-iica-navy">
          Internacional
        </span>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-iica-border/70 pt-2">
        <span className="text-sm font-semibold text-gray-900">{monto}</span>
        {region && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5" />
            {region}
          </span>
        )}
      </div>
    </article>
  );
}
