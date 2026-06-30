'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('Newsletter');

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [consent, setConsent] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const validateEmail = (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError('Ingrese un correo electrónico válido');
        } else {
            setEmailError('');
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, consent }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al suscribirse');
            }

            setStatus('success');
            setEmail('');
            setConsent(false);
        } catch (error) {
            logger.error('Newsletter subscription failed', { error });
            setStatus('error');
        }
    };

    return (
        <div className="bg-[var(--iica-navy)] text-white rounded-2xl p-8 md:p-12 my-12 relative overflow-hidden shadow-xl border-t-4 border-[var(--iica-yellow)]">

            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-3 text-[var(--iica-yellow)] font-bold uppercase tracking-wider text-xs">
                        <Mail className="h-4 w-4" />
                        <span>Boletín IICA Informa</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        ¿Quieres saber cuándo abren nuevos fondos?
                    </h2>
                    <p className="text-blue-100/90 text-sm md:text-base">
                        Suscríbase para recibir un resumen semanal con nuevas convocatorias, fechas de cierre y enlaces oficiales. Sin promociones.
                    </p>
                </div>

                <div className="w-full md:w-auto max-w-md">
                    {status === 'success' ? (
                        <div role="alert" className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center animate-in fade-in zoom-in">
                            <div className="flex justify-center mb-2">
                                <CheckCircle className="h-8 w-8 text-green-400 gap-2" />
                            </div>
                            <h3 className="font-bold text-lg">¡Suscripción Exitosa!</h3>
                            <p className="text-sm text-blue-100">¡Listo! Revisa tu correo para confirmar la suscripción.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-3 text-xs text-green-300 underline hover:text-green-200"
                            >
                                Suscribir otro correo
                            </button>
                        </div>
                    ) : (
                        <form aria-busy={status === 'loading'} onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <label htmlFor="email-newsletter" className="sr-only">Correo Electrónico</label>
                            <input
                                id="email-newsletter"
                                type="email"
                                required
                                placeholder="tu@correo.com"
                                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-[var(--iica-secondary)] outline-none border-none shadow-inner"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={(e) => validateEmail(e.target.value)}
                                disabled={status === 'loading'}
                            />
                            {emailError && (
                                <p role="alert" aria-live="polite" className="text-red-300 text-sm -mt-1">{emailError}</p>
                            )}
                            {status === 'error' && (
                                <p role="alert" aria-live="polite" className="text-red-300 text-sm mt-1">No pudimos registrar tu suscripción. Inténtalo de nuevo.</p>
                            )}

                            <div className="flex items-start gap-2">
                                <input
                                    id="consent-newsletter"
                                    type="checkbox"
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    disabled={status === 'loading'}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 accent-[var(--iica-secondary)]"
                                />
                                <label htmlFor="consent-newsletter" className="text-xs text-blue-100">
                                    Acepto recibir información según la{' '}
                                    <a
                                        href="/legal/privacidad"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-white"
                                    >
                                        política de privacidad
                                    </a>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading' || !consent || !email}
                                className="w-full min-h-[44px] bg-[var(--iica-secondary)] hover:bg-[#008f45] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 mt-1"
                            >
                                {status === 'loading' ? (
                                    'Procesando...'
                                ) : (
                                    <>Suscribirme Gratis <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                            <p className="text-xs text-center text-blue-200 opacity-70">
                                Frecuencia estimada: 1 correo por semana. Puede darse de baja en cualquier momento.
                            </p>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
