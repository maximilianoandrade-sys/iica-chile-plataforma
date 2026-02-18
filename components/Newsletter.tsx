'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [whatsapp, setWhatsapp] = useState(false);
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Simula una llamada a API - En el futuro conectar con Mailchimp o DB Local
        setTimeout(() => {
            setStatus('success');
            setEmail('');
            setPhone('');
            setWhatsapp(false);
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
                        <span>Boletín IICA Informa</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        ¿Quieres saber cuando abren nuevos fondos?
                    </h2>
                    <p className="text-blue-100/90 text-sm md:text-base">
                        Suscríbete para recibir alertas personalizadas en tu email y whatsapp con las últimas convocatorias. Cero spam.
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

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="checkbox"
                                        id="whatsapp-check"
                                        className="rounded text-[var(--iica-secondary)] focus:ring-[var(--iica-secondary)]"
                                        checked={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.checked)}
                                    />
                                    <label htmlFor="whatsapp-check" className="text-xs text-blue-100 cursor-pointer hover:text-white transition-colors flex items-center gap-1 select-none">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-green-400">
                                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.97 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
                                        </svg>
                                        Recibir alertas también por WhatsApp
                                    </label>
                                </div>

                                {whatsapp && (
                                    <input
                                        type="tel"
                                        placeholder="Tu número (Ej: +56 9 1234 5678)"
                                        required={whatsapp}
                                        className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-[var(--iica-secondary)] outline-none border-none shadow-inner animate-in fade-in slide-in-from-top-2"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={status === 'loading'}
                                    />
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-[var(--iica-secondary)] hover:bg-[#008f45] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 mt-1"
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
