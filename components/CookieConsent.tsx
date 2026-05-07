'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('iica_cookie_consent');
        if (!consent) {
            setShowConsent(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('iica_cookie_consent', 'accepted');
        setShowConsent(false);
    };

    const handleReject = () => {
        localStorage.setItem('iica_cookie_consent', 'rejected');
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900 border-t border-gray-700 p-4 md:p-6 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                    <p className="text-white text-sm md:text-base leading-relaxed">
                        Utilizamos cookies para mejorar tu experiencia y analizar el tráfico.
                        Consulta nuestra{' '}
                        <Link href="/legal/privacidad" className="underline text-[var(--iica-cyan)] hover:text-white">
                            Política de Privacidad
                        </Link>.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={handleReject}
                        className="py-2.5 px-5 text-sm font-medium text-gray-300 border border-gray-500 rounded-lg hover:bg-gray-800 hover:text-white transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-400"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="py-2.5 px-5 text-sm font-bold text-white bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] rounded-lg transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                    >
                        Aceptar cookies
                    </button>
                </div>
            </div>
        </div>
    );
}
