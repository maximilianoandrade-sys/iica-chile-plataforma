'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Copy, Check, Download, Loader2, AlertCircle, FileText, Send } from 'lucide-react';
import type { Project } from '@/lib/project-utils';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('ProposalGeneratorModal');

interface ProposalGeneratorModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ProposalGeneratorModal({ project, isOpen, onClose }: ProposalGeneratorModalProps) {
  const [applicantName, setApplicantName] = useState('');
  const [organization, setOrganization] = useState('');
  const [applicantRegion, setApplicantRegion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProposal(null);
      setError(null);
      setCopied(false);
      setApplicantRegion(project.regiones?.[0] || project.region || '');
    }
  }, [isOpen, project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProposal(null);

    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          applicantInfo: {
            name: applicantName.trim() || undefined,
            organization: organization.trim() || undefined,
            region: applicantRegion.trim() || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo generar la propuesta');
      }

      setProposal(data.data.proposal);
      logger.info('Proposal draft generated successfully', { projectId: project.id });
    } catch (err) {
      const msg = (err as Error).message || 'Error de conexión al generar propuesta';
      setError(msg);
      logger.error('Failed to generate proposal in modal', err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!proposal) return;
    try {
      await navigator.clipboard.writeText(proposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!proposal) return;
    const element = document.createElement('a');
    const file = new Blob([proposal], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Borrador-Propuesta-${project.id}-${project.institucion.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h2 id="proposal-modal-title" className="text-xl font-extrabold leading-tight">
                Asistente de Postulación IA
              </h2>
              <p className="text-xs text-blue-100 line-clamp-1">{project.nombre}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {!proposal ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 flex items-start gap-3">
                <FileText className="h-5 w-5 text-[var(--iica-blue)] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--iica-navy)] dark:text-blue-200">
                    Generación automática con Gemini 2.5
                  </p>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                    El asistente redactará un borrador completo con resumen ejecutivo, objetivos, metodología y presupuesto acorde a las bases de {project.institucion}.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="applicantName" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Nombre del postulante o representante (Opcional)
                </label>
                <input
                  id="applicantName"
                  type="text"
                  placeholder="Ej: María González"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Organización, Cooperativa o Empresa (Opcional)
                </label>
                <input
                  id="organization"
                  type="text"
                  placeholder="Ej: Cooperativa Campesina del Maule"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="applicantRegion" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Región de ejecución (Opcional)
                </label>
                <input
                  id="applicantRegion"
                  type="text"
                  placeholder="Ej: O'Higgins, Maule, Coquimbo..."
                  value={applicantRegion}
                  onChange={(e) => setApplicantRegion(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-extrabold px-6 py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redactando borrador con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generar Borrador de Propuesta</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> Borrador listo para usar y adaptar
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors min-h-[36px]"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? '¡Copiado!' : 'Copiar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors min-h-[36px]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono leading-relaxed max-h-[50vh] overflow-y-auto select-text">
                {proposal}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProposal(null)}
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:underline px-3 py-2"
                >
                  ← Ajustar datos y regenerar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ProposalGeneratorModal;
