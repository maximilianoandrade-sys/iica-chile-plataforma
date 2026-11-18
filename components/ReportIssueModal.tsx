'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, Send } from 'lucide-react';

interface ReportIssueModalProps {
  projectId: number;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportIssueModal({ projectId, projectTitle, isOpen, onClose }: ReportIssueModalProps) {
  const [reason, setReason] = useState('fecha_cambiada');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const reasonLabels: Record<string, string> = {
      fecha_cambiada: 'Prórroga o cambio en fecha de cierre',
      enlace_roto: 'Enlace a bases caído o 404',
      monto_diferente: 'Monto/subsidio publicado es incorrecto',
      convocatoria_cerrada: 'Convocatoria ya adjudicada o cerrada',
      otro: 'Otro detalle o adenda',
    };

    const reasonText = reasonLabels[reason] || reason;
    const reportTitle = `[${reasonText}] ${projectTitle}`;
    const reportDescription = details.trim()
      ? `Motivo: ${reasonText}\nDetalles adicionales:\n${details.trim()}`
      : `Reporte de inconsistencia: ${reasonText}`;

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle.slice(0, 200),
          description: reportDescription.slice(0, 10000),
          projectId,
          reporterEmail: email.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar reporte');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        onClose();
      }, 2500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo registrar el reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Reportar Cambio o Error en Bases</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 animate-bounce" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">¡Gracias por tu reporte!</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              El equipo técnico y de auditoría IICA revisará el reporte contra las bases oficiales.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {errorMessage && (
              <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Convocatoria</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{projectTitle}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tipo de hallazgo
              </label>
              <select 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="fecha_cambiada">Prórroga o cambio en fecha de cierre</option>
                <option value="enlace_roto">El enlace a bases oficiales está caído o da error 404</option>
                <option value="monto_diferente">El monto o subsidio es distinto al publicado</option>
                <option value="convocatoria_cerrada">La convocatoria ya fue adjudicada / cerrada</option>
                <option value="otro">Otro detalle o adenda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Detalles o enlace de la adenda oficial (opcional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Ejemplo: Se publicó la resolución exenta que extiende el plazo hasta el 15 de noviembre..."
                className="w-full text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tu correo de contacto (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agronomo@ejemplo.cl"
                className="w-full text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
