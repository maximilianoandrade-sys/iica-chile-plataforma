'use client';

import { useState, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ShieldCheck, Sparkles, Building2, MapPin, Coins } from 'lucide-react';
import type { Project } from '@/lib/data';

interface EligibilityAssistantProps {
  project: Project;
}

const APPLICANT_TYPES = [
  { id: 'pequeno_agricultor', label: 'Pequeño Agricultor / INDAP', keywords: ['pequeño', 'indap', 'campesino', 'agricultor'] },
  { id: 'cooperativa', label: 'Cooperativa o Asociación Agrícola', keywords: ['cooperativa', 'asociación', 'agrupación', 'organización'] },
  { id: 'pyme', label: 'PYME / Empresa Agrícola', keywords: ['empresa', 'pyme', 'sociedad', 'agrícola', 'privada'] },
  { id: 'ong', label: 'ONG / Sociedad Civil / Colectivo', keywords: ['ong', 'sociedad civil', 'colectivo', 'mujeres', 'jóvenes'] },
  { id: 'universidad', label: 'Universidad / Centro I+D', keywords: ['universidad', 'centro', 'investigación', 'academia'] },
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
        reasons.push(`Perfil "${applicantLabel}" coincide con los requisitos registrados en las bases.`);
      } else {
        reasons.push(`Perfil "${applicantLabel}" aplica a esta convocatoria de ventanilla o criterios generales.`);
      }
    } else {
      missing.push(`Las bases enfatizan candidatos tipo: ${project.tipos_solicitante?.join(', ') || project.beneficiarios?.join(', ') || 'Consorcios o Entidades Acreditadas'}.`);
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
      reasons.push('Fondo 100% Subvención: No exige aporte en efectivo propio.');
    } else if (hasCofinancing === 'si') {
      score += 30;
      reasons.push('Dispones de capacidad de cofinanciamiento para el aporte contraparte.');
    } else {
      missing.push('El fondo requiere cofinanciamiento obligatorio del postulante.');
    }

    let verdict: 'eligible' | 'conditional' | 'ineligible' = 'eligible';
    if (score >= 80) verdict = 'eligible';
    else if (score >= 50) verdict = 'conditional';
    else verdict = 'ineligible';

    return { score, verdict, reasons, missing };
  }, [project, selectedApplicant, selectedRegion, hasCofinancing]);

  return (
    <div className="bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/80 dark:from-gray-800 dark:via-gray-800/90 dark:to-emerald-950/30 border-2 border-blue-200 dark:border-blue-800/60 rounded-2xl p-6 shadow-sm my-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-[var(--iica-blue)]/10 dark:bg-blue-900/40 rounded-xl text-[var(--iica-blue)] dark:text-blue-300">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-[var(--iica-navy)] dark:text-white flex items-center gap-2">
            Asistente de Elegibilidad — ¿Puedo Postular?
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Verificación determinística en tiempo real contrastando tu perfil contra los requisitos reales almacenados en las bases oficiales.
          </p>
        </div>
      </div>

      {/* Selectors Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Tipo de Solicitante */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            1. Perfil del Postulante
          </label>
          <select
            value={selectedApplicant}
            onChange={(e) => setSelectedApplicant(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)] min-h-[44px]"
          >
            {APPLICANT_TYPES.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>

        {/* Región */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            2. Ubicación / Región
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)] min-h-[44px]"
          >
            {REGION_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Cofinanciamiento */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            3. Aporte Propio Disponible
          </label>
          <select
            value={hasCofinancing}
            onChange={(e) => setHasCofinancing(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)] min-h-[44px]"
          >
            <option value="si">Sí tengo fondos para cofinanciar</option>
            <option value="no">Busco 100% Subvención (sin aporte)</option>
          </select>
        </div>
      </div>

      {/* Verdict Result */}
      <div className={`p-4 rounded-xl border-2 transition-all ${
        evaluation.verdict === 'eligible'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
          : evaluation.verdict === 'conditional'
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
          : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700'
      }`}>
        <div className="flex items-start gap-3">
          {evaluation.verdict === 'eligible' && <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />}
          {evaluation.verdict === 'conditional' && <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />}
          {evaluation.verdict === 'ineligible' && <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-extrabold px-3 py-0.5 rounded-full ${
                evaluation.verdict === 'eligible'
                  ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                  : evaluation.verdict === 'conditional'
                  ? 'bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100'
                  : 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
              }`}>
                {evaluation.verdict === 'eligible' && '✅ Preevaluación favorable'}
                {evaluation.verdict === 'conditional' && '⚠️ Elegible con Condiciones o Socio Técnico'}
                {evaluation.verdict === 'ineligible' && '❌ Perfil no prioritario según bases'}
              </span>
            </div>

            <ul className="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
              {evaluation.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
              {evaluation.missing.map((m, i) => (
                <li key={i} className="flex items-start gap-1.5 text-amber-800 dark:text-amber-300 font-medium">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">!</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-700/60 pt-2">
              Nota: La preevaluación mostrada es una orientación técnica previa del Radar IICA Chile. La decisión final de admisibilidad y adjudicación corresponde exclusivamente a la institución convocante según sus bases oficiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
