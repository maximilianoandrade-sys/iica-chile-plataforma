'use client';

import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Building2, 
  MapPin, 
  Coins,
  ChevronDown,
  Info
} from 'lucide-react';
import type { Project } from '@/lib/project-utils';

interface EligibilityAssistantProps {
  project: Project;
}

const APPLICANT_TYPES = [
  { id: 'pequeno_agricultor', label: 'Pequeño Agricultor / INDAP', keywords: ['pequeño', 'indap', 'campesino', 'agricultor', 'persona natural'] },
  { id: 'cooperativa', label: 'Cooperativa o Asociación Agrícola', keywords: ['cooperativa', 'asociación', 'agrupación', 'organización'] },
  { id: 'pyme', label: 'PYME / Empresa Agrícola', keywords: ['empresa', 'pyme', 'sociedad', 'agrícola', 'privada', 'startup'] },
  { id: 'ong', label: 'ONG / Sociedad Civil / Colectivo', keywords: ['ong', 'sociedad civil', 'colectivo', 'mujeres', 'jóvenes'] },
  { id: 'universidad', label: 'Universidad / Centro I+D', keywords: ['universidad', 'centro', 'investigación', 'academia', 'instituto'] },
];

const REGION_OPTIONS = [
  'Nacional (Todas las Regiones)',
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble', 'Biobío',
  'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
  'Internacional'
];

export function EligibilityAssistant({ project }: EligibilityAssistantProps) {
  const [selectedApplicant, setSelectedApplicant] = useState<string>('pequeno_agricultor');
  const [selectedRegion, setSelectedRegion] = useState<string>('Nacional (Todas las Regiones)');
  const [hasCofinancing, setHasCofinancing] = useState<string>('si');

  const evaluation = useMemo(() => {
    let score = 0;
    const reasons: string[] = [];
    const missing: string[] = [];

    // 1. Applicant profile evaluation against official rules
    const applicantObj = APPLICANT_TYPES.find(a => a.id === selectedApplicant);
    const applicantLabel = applicantObj?.label || selectedApplicant;
    
    const tiposUpper = (project.tipos_solicitante || []).map(t => t.toLowerCase());
    const beneUpper = (project.beneficiarios || []).map(b => b.toLowerCase());
    const allProfiles = [...tiposUpper, ...beneUpper];

    const isMatchProfile = applicantObj?.keywords.some(kw => 
      allProfiles.some(p => p.includes(kw))
    ) ?? true;

    if (isMatchProfile) {
      score += 40;
      if (allProfiles.length > 0) {
        reasons.push(`Tu perfil "${applicantLabel}" coincide con los requisitos y beneficiarios registrados en las bases.`);
      } else {
        reasons.push(`Tu perfil "${applicantLabel}" califica para esta convocatoria abierta de criterios generales.`);
      }
    } else {
      missing.push(`Las bases priorizan postulantes tipo: ${project.tipos_solicitante?.join(', ') || project.beneficiarios?.join(', ') || 'Consorcios o Entidades Acreditadas'}.`);
    }

    // 2. Region / Coverage evaluation
    const isIntl = project.ambito === 'Internacional' || (project.regiones || []).includes('Nacional e Internacional');
    const isNacional = (project.regiones || []).some(r => r.toLowerCase().includes('nacional') || r.toLowerCase().includes('todas'));
    
    if (isIntl || isNacional || selectedRegion.includes('Nacional')) {
      score += 30;
      reasons.push(`Cobertura geográfica aplicable a ${selectedRegion}.`);
    } else {
      const projRegs = project.regiones?.join(', ') || project.region || 'Especificada en bases';
      reasons.push(`Fondo disponible para la zona de cobertura (${projRegs}).`);
      score += 20;
    }

    // 3. Cofinancing evaluation
    if (!project.requiere_cofinanciamiento) {
      score += 30;
      reasons.push('Fondo 100% Subvención: No exige aporte en efectivo propio contraparte.');
    } else if (hasCofinancing === 'si') {
      score += 30;
      reasons.push('Cuentas con capacidad para cofinanciar el porcentaje requerido por las bases.');
    } else {
      missing.push('Esta convocatoria exige aporte propio o de terceros (cofinanciamiento obligatorio).');
    }

    let verdict: 'eligible' | 'conditional' | 'ineligible' = 'eligible';
    if (score >= 80) verdict = 'eligible';
    else if (score >= 50) verdict = 'conditional';
    else verdict = 'ineligible';

    return { score, verdict, reasons, missing };
  }, [project, selectedApplicant, selectedRegion, hasCofinancing]);

  return (
    <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 p-5 sm:p-6 shadow-sm dark:border-blue-900/50 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-blue-950/30">
      
      {/* Header del asistente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-blue-100 dark:border-gray-700/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--iica-blue)] text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--iica-navy)] dark:text-white">
              Asistente de Elegibilidad Rápida
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Verifica en tiempo real si cumples con las condiciones básicas para postular.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
          <Info className="h-3.5 w-3.5" />
          <span>Filtro Automatizado</span>
        </div>
      </div>

      {/* Selectores */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Perfil */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
            <Building2 className="h-3.5 w-3.5 text-[var(--iica-blue)]" aria-hidden="true" />
            1. Perfil del Postulante
          </label>
          <div className="relative">
            <select
              value={selectedApplicant}
              onChange={(e) => setSelectedApplicant(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-8 text-xs font-semibold text-gray-800 shadow-sm transition-all focus:border-[var(--iica-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-h-[44px]"
            >
              {APPLICANT_TYPES.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Región */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
            <MapPin className="h-3.5 w-3.5 text-[var(--iica-blue)]" aria-hidden="true" />
            2. Ubicación / Región
          </label>
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-8 text-xs font-semibold text-gray-800 shadow-sm transition-all focus:border-[var(--iica-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-h-[44px]"
            >
              {REGION_OPTIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Cofinanciamiento */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
            <Coins className="h-3.5 w-3.5 text-[var(--iica-blue)]" aria-hidden="true" />
            3. Aporte Propio Disponible
          </label>
          <div className="relative">
            <select
              value={hasCofinancing}
              onChange={(e) => setHasCofinancing(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-3 pr-8 text-xs font-semibold text-gray-800 shadow-sm transition-all focus:border-[var(--iica-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 min-h-[44px]"
            >
              <option value="si">Dispongo de fondos de contraparte</option>
              <option value="no">Busco financiamiento 100% subsidio</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Veredicto de Elegibilidad */}
      <div className={`mt-5 rounded-xl border p-4 sm:p-5 transition-all ${
        evaluation.verdict === 'eligible'
          ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100'
          : evaluation.verdict === 'conditional'
          ? 'border-amber-200 bg-amber-50/90 text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100'
          : 'border-rose-200 bg-rose-50/90 text-rose-950 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-100'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 shrink-0">
            {evaluation.verdict === 'eligible' && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            {evaluation.verdict === 'conditional' && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </div>
            )}
            {evaluation.verdict === 'ineligible' && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold">
                {evaluation.verdict === 'eligible' && 'Preevaluación favorable: Perfil compatible'}
                {evaluation.verdict === 'conditional' && 'Elegible con condiciones o alianza técnica requerida'}
                {evaluation.verdict === 'ineligible' && 'Perfil no prioritario según bases oficiales'}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                evaluation.verdict === 'eligible'
                  ? 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                  : evaluation.verdict === 'conditional'
                  ? 'bg-amber-200/80 text-amber-900 dark:bg-amber-800 dark:text-amber-100'
                  : 'bg-rose-200/80 text-rose-900 dark:bg-rose-800 dark:text-rose-100'
              }`}>
                Puntaje de afinidad: {evaluation.score}%
              </span>
            </div>

            {/* Listado de motivos */}
            <div className="mt-3 space-y-1.5 text-xs">
              {evaluation.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span className="leading-relaxed">{r}</span>
                </div>
              ))}
              {evaluation.missing.map((m, i) => (
                <div key={i} className="flex items-start gap-2 font-medium text-amber-900 dark:text-amber-300">
                  <span className="mt-0.5 font-bold text-amber-600 dark:text-amber-400">!</span>
                  <span className="leading-relaxed">{m}</span>
                </div>
              ))}
            </div>

            <p className="mt-3.5 border-t border-black/10 pt-2 text-[11px] leading-relaxed text-gray-500 dark:border-white/10 dark:text-gray-400">
              * Esta orientación técnica es determinística y referencial generada por el Radar IICA Chile. La resolución definitiva corresponde a la institución convocante.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default EligibilityAssistant;
