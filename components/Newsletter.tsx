'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Simula una llamada a API - En el futuro conectar con Mailchimp o DB Local
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <div className="bg-[var(--iica-navy)] text-white rounded-2xl p-8 md:p-12 my-12 relative overflow-hidden shadow-xl border-t-4 border-[var(--iica-yellow)]">

            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-3 text-[var(--iica-yellow)] font-bold uppercase tracking-wider text-xs">
                        <Mail className="h-4 w-4" />
                        <span>Kiosco IICA Informa</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        ¿Quieres saber cuando abren nuevos fondos?
                    </h2>
                    <p className="text-blue-100/90 text-sm md:text-base">
                        Suscríbete a nuestra alerta semanal. Solo enviamos correos cuando hay oportunidades reales para tu perfil. Cero spam.
                    </p>
                </div>

                <div className="w-full md:w-auto min-w-[320px]">
                    {status === 'success' ? (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center animate-in fade-in zoom-in">
                            <div className="flex justify-center mb-2">
                                <CheckCircle className="h-8 w-8 text-green-400 gap-2" />
                            </div>
                            <h3 className="font-bold text-lg">¡Suscripción Exitosa!</h3>
                            <p className="text-sm text-blue-100">Pronto recibirás nuestras novedades.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-3 text-xs text-green-300 underline hover:text-green-200"
                            >
                                Suscribir otro correo
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <label htmlFor="email-newsletter" className="sr-only">Correo Electrónico</label>
                            <input
                                id="email-newsletter"
                                type="email"
                                required
                                placeholder="tu@correo.com"
                                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-[var(--iica-secondary)] outline-none border-none shadow-inner"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === 'loading'}
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-[var(--iica-secondary)] hover:bg-[#008f45] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70"
                            >
                                {status === 'loading' ? (
                                    'Procesando...'
                                ) : (
                                    <>Suscribirme Gratis <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-blue-200 opacity-70">
                                Al suscribirte aceptas recibir boletines informativos del IICA.
                            </p>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
