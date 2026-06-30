'use client';

import Link from 'next/link';
import { Calendar, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import { type Project, daysUntilClose, formatDeadline, pluralizeDias } from '@/lib/data';
import { InstitutionLogo } from '@/components/InstitutionLogo';
import { getLogger } from '@/lib/utils/logger';
import { trackEvent } from '@/lib/analytics';

const logger = getLogger('ProjectCard');

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
    return { text: 'Sin fecha definida', detail: 'Cierre por confirmar', urgency: 'normal' };
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
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    border: 'border-l-4 border-l-red-500',
    deadlineText: 'text-red-700 dark:text-red-400',
  },
  warning: {
    label: 'Cierra Pronto',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    border: 'border-l-4 border-l-amber-500',
    deadlineText: 'text-amber-700 dark:text-amber-400',
  },
  normal: {
    label: 'Abierta',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    border: '',
    deadlineText: 'text-gray-700 dark:text-gray-300',
  },
  closed: {
    label: 'Cerrada',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    border: '',
    deadlineText: 'text-gray-500 dark:text-gray-400',
  },
};

export function ProjectCard({ project }: { project: Project }) {
  const { text: deadlineText, detail: deadlineDetail, urgency } = formatDeadlineStatus(project);
  const monto = formatMonto(project);
  const region = project.regiones?.[0] ?? project.region ?? null;
  const institutionUpper = (project.institucion || '').toUpperCase();
  const isLikelyInternational =
    project.ambito === 'Internacional' ||
    ['WORLD BANK', 'FAO', 'FONTAGRO', 'FIDA', 'IFAD', 'BID', 'IADB', 'IICA', 'PNUD', 'GEF', 'GCF', 'UE'].some(
      (k) => institutionUpper.includes(k),
    );

  const styles = URGENCY_STYLES[urgency];

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
      className={`group relative flex flex-col rounded-xl border bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${styles.border} ${
        urgency === 'closed'
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
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
              {project.institucion}
            </span>
          </div>
          {/* Badge estado */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${styles.badge}`}
            >
              {urgency === 'critical' && <AlertCircle className="w-3 h-3" />}
              {styles.label}
            </span>
          </div>
        </div>

        {/* Título — primary visual element */}
        <Link
          href={`/proyecto/${project.id}`}
          onClick={handleProjectClick}
          className="stretched-link block mb-2 line-clamp-2 text-[15px] font-medium leading-snug text-gray-900 dark:text-white hover:text-[var(--iica-blue)] dark:hover:text-blue-400 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)]"
        >
          {project.nombre}
        </Link>

        {isLikelyInternational && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-[var(--iica-navy)] dark:text-blue-300">
            🌎 Internacional
          </span>
        )}
      </div>

      {/* Meta info — Amount + Deadline prominent, Region secondary */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/40 border-t border-b border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          {/* Monto — second visual priority */}
          {monto !== 'Ver bases oficiales' ? (
            <div className="flex items-center gap-1.5 col-span-2">
              <DollarSign className="w-3.5 h-3.5 text-secondary dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 leading-none">Monto</p>
                <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{monto}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 col-span-2">
              <DollarSign className="w-3.5 h-3.5 text-gray-300 dark:text-gray-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 leading-none">Monto</p>
                <p className="text-[12px] italic text-gray-400 dark:text-gray-500 mt-0.5">No especificado — ver bases</p>
              </div>
            </div>
          )}
          {/* Deadline — third visual priority, urgency-colored */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-secondary dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 leading-none">Cierra</p>
              <p className={`text-[13px] font-semibold mt-0.5 ${styles.deadlineText}`}>{deadlineDetail.replace('Fecha límite: ', '')}</p>
            </div>
          </div>
          {region && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 leading-none">Región</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 truncate">{region}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer — deadline urgency text */}
      <div className="px-5 py-3 mt-auto">
        <p className={`text-[13px] font-semibold ${styles.deadlineText}`}>{deadlineText}</p>
      </div>
    </article>
  );
}
