'use client';

import Link from 'next/link';
import { CalendarDays, ChevronRight, DollarSign, MapPin, Users, AlertCircle } from 'lucide-react';
import { type Project, daysUntilClose, formatDeadline, pluralizeDias } from '@/lib/project-utils';
import { FavoriteButton } from '@/components/FavoriteButton';
import { CalendarReminderButton } from '@/components/CalendarReminderButton';
import { getCatalogRouteKey } from '@/lib/catalog-merge';

/** Urgency semaphore: 3 levels + closed */
type UrgencyLevel = 'critical' | 'warning' | 'normal' | 'closed';

function getUrgencyLevel(project: Project): UrgencyLevel {
  if (project.estadoPostulacion === 'Cerrada') return 'closed';

  const days = daysUntilClose(project);
  if (days === 999) return 'normal';
  if (days < 0) return 'closed';
  if (days <= 1) return 'critical';
  if (days <= 7) return 'warning';
  return 'normal';
}

function formatDeadlineStatus(project: Project): {
  text: string;
  detail: string;
  urgency: UrgencyLevel;
} {
  const days = daysUntilClose(project);
  const closeDate = formatDeadline(project.fecha_cierre);

  if (days === 999) {
    return { text: 'Ventanilla permanente', detail: 'Postulación continua', urgency: 'normal' };
  }
  if (days < 0) {
    return { text: 'Cerrada', detail: `Cerró: ${closeDate}`, urgency: 'closed' };
  }
  return {
    text: days === 0 ? 'Cierra hoy' : `Cierra en ${pluralizeDias(days)}`,
    detail: `Fecha límite: ${closeDate}`,
    urgency: getUrgencyLevel(project),
  };
}

function formatMonto(project: Project): string {
  if (project.montoTexto && project.montoTexto.trim()) return project.montoTexto;
  if (project.monto) return `$${Math.round(project.monto / 1_000_000)}M CLP`;
  return 'Ver bases oficiales';
}

/** Semáforo de urgencia — badge, border, and deadline text styles */
const URGENCY_STYLES: Record<
  UrgencyLevel,
  { label: string; badge: string; border: string; deadlineText: string }
> = {
  critical: {
    label: 'Cierra Hoy',
    badge: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-200 dark:border dark:border-red-800',
    border: 'border-l-4 border-l-red-500',
    deadlineText: 'text-red-700 dark:text-red-300 font-semibold',
  },
  warning: {
    label: 'Cierra Pronto',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200 dark:border dark:border-amber-800',
    border: 'border-l-4 border-l-amber-500',
    deadlineText: 'text-amber-700 dark:text-amber-300 font-semibold',
  },
  normal: {
    label: 'Abierta',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border dark:border-emerald-800',
    border: '',
    deadlineText: 'text-gray-700 dark:text-gray-300',
  },
  closed: {
    label: 'Cerrada',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:border dark:border-gray-700',
    border: '',
    deadlineText: 'text-gray-500 dark:text-gray-400',
  },
};

export function ProjectCard({ 
  project, 
  onToggleCompare, 
  isSelectedForComparison = false 
}: { 
  project: Project;
  onToggleCompare?: (project: Project) => void;
  isSelectedForComparison?: boolean;
}) {
  const { text: deadlineText, urgency } = formatDeadlineStatus(project);
  const monto = formatMonto(project);
  const region = project.regiones?.[0] ?? project.region ?? null;
  const institutionUpper = (project.institucion || '').toUpperCase();
  const isLikelyInternational =
    project.ambito === 'Internacional' ||
    ['WORLD BANK', 'FAO', 'FONTAGRO', 'FIDA', 'IFAD', 'BID', 'IADB', 'IICA', 'PNUD', 'GEF', 'GCF', 'UE'].some(
      (k) => institutionUpper.includes(k),
    );

  const styles = URGENCY_STYLES[urgency];
  const beneficiaries = project.beneficiarios?.filter(Boolean).join(' · ') || 'Personas naturales y jurídicas';
  const scopeLabel = project.ambito || (isLikelyInternational ? 'Internacional' : 'Nacional');

  return (
    <article
      aria-label={project.nombre}
      className={`group relative flex min-h-[480px] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${styles.border} ${
        isSelectedForComparison ? 'ring-2 ring-blue-500 border-blue-500' : ''
      } ${
        urgency === 'closed'
          ? 'opacity-60 border-gray-100 dark:border-gray-700'
          : 'border-gray-200 dark:border-gray-700 hover:border-[var(--iica-blue)]/50 dark:hover:border-blue-500/50'
      }`}
    >
      {/* Header inspired by the requested reference card */}
      <div className="relative bg-[var(--iica-navy)] px-5 pb-12 pt-5 text-white dark:bg-slate-900">
        <div className="relative z-20 flex items-start justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${styles.badge}`}
          >
            {urgency === 'critical' && <AlertCircle className="h-3 w-3" />}
            {urgency === 'closed' ? 'CERRADA' : urgency === 'warning' ? 'CIERRA PRONTO' : 'ABIERTA'}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {scopeLabel}
          </span>
        </div>

        <div className="relative z-20 mt-4">
          <p className="mb-2 line-clamp-2 text-xs font-bold uppercase tracking-wide text-rose-200">
            {project.institucion}
          </p>
          <Link
            href={`/proyecto/${getCatalogRouteKey(project)}`}
            className="stretched-link block line-clamp-3 text-lg font-bold leading-snug text-white transition-colors hover:text-blue-100 focus-visible:outline-none"
          >
            {project.nombre}
          </Link>
        </div>

        <div className="absolute inset-x-0 -bottom-1 z-10 h-9 rounded-[50%_50%_0_0/100%_100%_0_0] border-t-4 border-blue-200 bg-white dark:border-blue-800 dark:bg-gray-800" />
      </div>

      <div className="flex flex-1 flex-col bg-white px-5 pb-4 pt-1 dark:bg-gray-800">
        {/* Compare, favorite and secondary indicators remain available without crowding the header. */}
        <div className="relative z-20 mb-3 flex min-h-[36px] items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {onToggleCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCompare(project);
                }}
                className={`rounded border px-2 py-1 text-[11px] font-bold transition-colors ${
                  isSelectedForComparison
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
                title="Seleccionar para comparar lado a lado"
              >
                {isSelectedForComparison ? '✓ Comparando' : '+ Comparar'}
              </button>
            )}
            {isLikelyInternational && (
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-[var(--iica-navy)] dark:bg-blue-900/30 dark:text-blue-300">
                Internacional
              </span>
            )}
          </div>
          <FavoriteButton projectId={project.id} />
        </div>

        <div className="space-y-4 text-[15px] text-gray-800 dark:text-gray-200">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-gray-700 dark:text-gray-300" aria-hidden="true" />
            <div>
              <p className="font-bold">Beneficiarios/as:</p>
              <p className="mt-0.5 leading-snug">{beneficiaries}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-gray-700 dark:text-gray-300" aria-hidden="true" />
            <div>
              <p className="font-bold">Fechas:</p>
              <p className="mt-0.5 leading-snug">
                {daysUntilClose(project) === 999
                  ? 'Postulación continua'
                  : `Fecha límite: ${formatDeadline(project.fecha_cierre)}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-gray-700 dark:text-gray-300" aria-hidden="true" />
            <div>
              <p className="font-bold">Montos:</p>
              <p className="mt-0.5 leading-snug">{monto}</p>
            </div>
          </div>
        </div>

        {/* Preserve useful metadata without returning to the former dense card. */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {region && <span className="text-xs text-gray-500 dark:text-gray-400">Cobertura: {region}</span>}
          {project.requiere_cofinanciamiento === false && (
            <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Sin cofinanciamiento
            </span>
          )}
        </div>

        <div className="relative z-20 mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <p className={`rounded-full px-3 py-1.5 text-xs font-bold ${styles.badge}`}>{deadlineText}</p>
          <div className="flex items-center gap-2">
            <CalendarReminderButton project={project} variant="icon" />
            {project.url_bases && (
              <Link
                href={`/proyecto/${getCatalogRouteKey(project)}#bases`}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-gray-400 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-[var(--iica-blue)] hover:text-[var(--iica-blue)] dark:border-gray-500 dark:text-gray-100"
                title="Ver detalles y bases oficiales"
              >
                Ver detalles <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
