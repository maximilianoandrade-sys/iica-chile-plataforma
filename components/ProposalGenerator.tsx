'use client';
import { useState } from 'react';
import { Sparkles, X, FileText, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog" || "react-dialog";

export function ProposalGenerator({ project, isOpen, onClose }: { project: any, isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateProposal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });
      const data = await res.json();
      setProposal(data.proposal || "No se pudo generar el borrador.");
    } catch (e) {
      setProposal("Hubo un error intentando contactar con la IA para redactar la propuesta.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">IA Generador de Propuestas</h2>
              <p className="text-xs text-gray-500">Borrador automático para: {project.nombre?.substring(0, 50)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {!proposal && !loading ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-purple-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Redactemos tu próximo proyecto gigante</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                Claude leerá la convocatoria y generará un Concept Note de 3-5 secciones redactado profesionalmente con el enfoque del IICA.
              </p>
              <button 
                onClick={generateProposal}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all focus:ring-4 focus:ring-purple-600/20 flex items-center gap-2 mx-auto"
              >
                <FileText className="w-4 h-4" />
                Comenzar Redacción AI
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-purple-600 animate-pulse">Analizando bases y redactando justificaciones estratégicas...</p>
              <p className="text-xs text-gray-500 mt-2">Esto puede tomar toma unos 10-15 segundos.</p>
            </div>
          ) : (
            <div className="text-gray-800 text-sm whitespace-pre-wrap font-sans bg-white border border-gray-200 p-6 rounded-xl shadow-sm prose prose-sm max-w-none">
              {proposal}
            </div>
          )}
        </div>

        {/* Footer */}
        {proposal && typeof proposal === 'string' && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
               {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
               {copied ? '¡Copiado!' : 'Copiar Borrador'}
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-[var(--iica-blue)] text-white rounded-lg text-sm font-bold hover:bg-[var(--iica-navy)] transition-colors"
            >
              Listo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
