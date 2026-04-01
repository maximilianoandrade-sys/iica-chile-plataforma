'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Simula suscripción de correo
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    if (status === 'success') {
        return (
            <div className="bg-[var(--iica-navy)] text-white rounded-2xl p-8 md:p-12 my-12 relative overflow-hidden shadow-xl border-t-4 border-[var(--iica-yellow)] flex items-center justify-center">
                <div className="text-center animate-in fade-in zoom-in">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">¡Suscripción Exitosa!</h3>
                    <p className="text-blue-100">Pronto recibirás nuestras novedades institucionales.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--iica-navy)] text-white rounded-2xl p-8 md:p-12 my-12 relative overflow-hidden shadow-xl border-t-4 border-[var(--iica-yellow)]">
            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-3 text-[var(--iica-yellow)] font-bold uppercase tracking-wider text-xs">
                        <Mail className="h-4 w-4" />
                        <span>Boletín IICA Informa</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        ¿Quieres saber cuando abren nuevos fondos?
                    </h2>
                    <p className="text-blue-100/90 text-sm md:text-base">
                        Suscríbete para recibir alertas institucionales con las últimas convocatorias.
                    </p>
                </div>

                <div className="w-full md:w-auto min-w-[320px]">
                    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                        <label htmlFor="email-newsletter" className="sr-only">Correo Electrónico</label>
                        <input
                            id="email-newsletter"
                            type="email"
                            required
                            placeholder="tucorreo@institucion.cl"
                            className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-[var(--iica-secondary)] outline-none border-none shadow-inner"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'loading'}
                        />

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-[var(--iica-secondary)] hover:bg-[#008f45] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 mt-1"
                        >
                            {status === 'loading' ? (
                                'Procesando...'
                            ) : (
                                <>Suscribirme <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
