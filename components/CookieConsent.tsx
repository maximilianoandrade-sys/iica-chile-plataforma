'use client';

import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('iica_cookie_consent');
        if (!consent) {
            setShowConsent(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('iica_cookie_consent', 'true');
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900 border-t border-gray-700 p-4 md:p-6 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                    <p className="text-white text-sm md:text-base leading-relaxed">
                        <strong>🍪 Respetamos tu privacidad.</strong> Utilizamos cookies propias y de terceros para analizar el tráfico, mejorar tu experiencia y ofrecerte contenido relevante.
                        Al continuar navegando, aceptas nuestra <a href="#" className="underline text-[var(--iica-cyan)] hover:text-white">Política de Privacidad</a> y el uso de cookies.
                    </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button
                        onClick={acceptCookies}
                        className="bg-[var(--iica-cyan)] hover:bg-[#008ec2] text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                    >
                        Aceptar todo
                    </button>
                </div>
            </div>
        </div>
    );
}
