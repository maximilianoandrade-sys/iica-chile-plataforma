'use client';

import Link from 'next/link';
import { Calendar, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import { type Project, daysUntilClose, formatDeadline, pluralizeDias } from '@/lib/data';
import { InstitutionLogo } from '@/components/InstitutionLogo';
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
    return { text: 'Sin fecha definida', detail: 'Cierre por confirmar', urgency: 'normal' };
  }
  if (days < 0) {
    return { text: 'Cerrada', detail: `Cerró: ${closeDate}`, urgency: 'closed' };
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

const statusConfig = {
  critical: {
    label: 'Cierra Pronto',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  },
  warning: {
    label: 'Cierra Pronto',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  },
  normal: {
    label: 'Abierta',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  },
  closed: {
    label: 'Cerrada',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
};

export function ProjectCard({ project }: { project: Project }) {
  const isClosed = project.estadoPostulacion === 'Cerrada';
  const { text: deadlineText, detail: deadlineDetail, urgency } = formatDeadlineStatus(project);
  const monto = formatMonto(project);
  const region = project.regiones?.[0] ?? project.region ?? null;
  const institutionUpper = (project.institucion || '').toUpperCase();
  const isLikelyInternational =
    project.ambito === 'Internacional' ||
    ['WORLD BANK', 'FAO', 'FONTAGRO', 'FIDA', 'IFAD', 'BID', 'IADB', 'IICA', 'PNUD', 'GEF', 'GCF', 'UE'].some(
      (k) => institutionUpper.includes(k),
    );

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
      aria-label={project.nombre}
      className={`group relative flex flex-col rounded-xl border bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        isClosed
          ? 'opacity-60 border-gray-100 dark:border-gray-700'
          : 'border-gray-200 dark:border-gray-700 hover:border-[var(--iica-blue)]/50 dark:hover:border-blue-500/50'
      }`}
    >
      {/* Card Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-3 gap-2">
          {/* Institución + logo */}
          <div className="flex items-center gap-2 min-w-0">
            <InstitutionLogo nombre={project.institucion} size={32} />
            <span className="truncate text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {project.institucion}
            </span>
          </div>
          {/* Badge estado */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${statusConfig[urgency].className}`}
            >
              {urgency === 'critical' && <AlertCircle className="w-3 h-3" />}
              {statusConfig[urgency].label}
            </span>
          </div>
        </div>

        {/* Título clickeable (stretched-link) */}
        <Link
          href={`/proyecto/${project.id}`}
          onClick={handleProjectClick}
          className="stretched-link block mb-2 line-clamp-2 text-[15px] font-bold leading-snug text-[var(--iica-navy)] dark:text-white hover:text-[var(--iica-blue)] dark:hover:text-blue-400 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)]"
        >
          {project.nombre}
        </Link>

        {isLikelyInternational && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-[var(--iica-navy)] dark:text-blue-300">
            🌎 Internacional
          </span>
        )}
      </div>

      {/* Meta info */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/40 border-t border-b border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-secondary dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 leading-none">Cierra</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{deadlineDetail.replace('Fecha límite: ', '')}</p>
            </div>
          </div>
          {region && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 leading-none">Región</p>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5 truncate">{region}</p>
              </div>
            </div>
          )}
          {monto !== 'Ver bases oficiales' && (
            <div className="flex items-center gap-1.5 col-span-2">
              <DollarSign className="w-3.5 h-3.5 text-secondary dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 leading-none">Monto</p>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{monto}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer de la card */}
      <div className="px-5 py-3 mt-auto">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{deadlineText}</p>
        {monto === 'Ver bases oficiales' && (
          <p className="text-xs text-gray-400 mt-0.5">Consultar bases para monto</p>
        )}
      </div>
    </article>
  );
}


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
      aria-label={project.nombre}
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

      <ul
        aria-label="Metadatos de la oportunidad"
        className="mt-auto flex items-center justify-between gap-2 border-t border-iica-border/70 pt-2"
      >
        <li className="text-sm font-semibold text-gray-900">{monto}</li>
        {region ? (
          <li className="inline-flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5" />
            {region}
          </li>
        ) : null}
      </ul>
    </article>
  );
}
