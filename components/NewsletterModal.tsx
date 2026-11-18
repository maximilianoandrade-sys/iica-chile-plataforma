'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Bell, Mail, Phone, CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import { CHILE_REGIONS, AGRICULTURAL_SECTORS } from '@/lib/project-utils';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [contactType, setContactType] = useState<'whatsapp' | 'email'>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [frequency, setFrequency] = useState<'instant_urgent' | 'weekly'>('instant_urgent');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setErrorMessage('Debes aceptar el consentimiento informado para activar las alertas (Ley 21.719).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: contactValue,
          type: contactType,
          regions: [selectedRegion],
          categories: [selectedCategory],
          frequency,
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al suscribirse');
      }

      setSuccessMessage(data.message || data.data?.message || '¡Suscripción exitosa!');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[var(--iica-navy)] to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 rounded-lg text-amber-300">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Alertas Personalizadas IICA</h3>
              <p className="text-[11px] text-blue-200">Recibe fondos del agro directo a tu teléfono o correo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{successMessage}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Te avisaremos cada vez que se abran nuevas convocatorias aplicables a tu perfil.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-[var(--iica-blue)] text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors"
              >
                Entendido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Selector WhatsApp vs Email */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Canal de Notificación Preferido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setContactType('whatsapp')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all ${
                      contactType === 'whatsapp'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <Phone className="h-4 w-4 text-emerald-600" /> WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactType('email')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all ${
                      contactType === 'email'
                        ? 'border-blue-500 bg-blue-50 text-[var(--iica-blue)] dark:bg-blue-900/30 dark:text-blue-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <Mail className="h-4 w-4 text-blue-600" /> Correo Electrónico
                  </button>
                </div>
              </div>

              {/* Input de contacto */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {contactType === 'whatsapp' ? 'Número de WhatsApp (+56 9 ...)' : 'Correo Electrónico'}
                </label>
                <input
                  type={contactType === 'email' ? 'email' : 'text'}
                  placeholder={contactType === 'whatsapp' ? '+56 9 1234 5678' : 'ejemplo@agricola.cl'}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Región y Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Región de Interés</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Todas">Todas las Regiones</option>
                    {CHILE_REGIONS.map((r: string) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Sector de Interés</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Todas">Todos los Sectores</option>
                    {AGRICULTURAL_SECTORS.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Frecuencia */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Frecuencia de Alerta</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'instant_urgent' | 'weekly')}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="instant_urgent">Instantánea (Solo cuando abre un fondo urgente ≤7d)</option>
                  <option value="weekly">Boletín Semanal IICA (Resumen consolidado)</option>
                </select>
              </div>

              {/* Consentimiento Ley 21.719 */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--iica-blue)] focus:ring-blue-500"
                  />
                  <span className="text-[11px] leading-tight text-gray-600 dark:text-gray-300">
                    Acepto el tratamiento de mis datos de contacto para recibir alertas de convocatorias según la{' '}
                    <Link href="/legal/privacidad" target="_blank" className="text-[var(--iica-blue)] underline">
                      Política de Privacidad
                    </Link>{' '}
                    (Ley 21.719). Puedo darme de baja en cualquier momento.
                  </span>
                </label>
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-[var(--iica-blue)] hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Procesando...' : 'Activar Mis Alertas Gratuitas'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
