'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface CookieConsentValue {
    essential: boolean;
    analytics: boolean;
    timestamp: number;
}

const STORAGE_KEY = 'iica_cookie_consent';

function getStoredConsent(): CookieConsentValue | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CookieConsentValue;
        if (typeof parsed.essential !== 'boolean' || typeof parsed.analytics !== 'boolean' || typeof parsed.timestamp !== 'number') {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        const consent = getStoredConsent();
        if (!consent) {
            setShowConsent(true);
        }
    }, []);

    const acceptCookies = () => {
        const value: CookieConsentValue = { essential: true, analytics: true, timestamp: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        setShowConsent(false);
    };

    const rejectOptionalCookies = () => {
        const value: CookieConsentValue = { essential: true, analytics: false, timestamp: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div
            role="dialog"
            aria-label="Consentimiento de cookies"
            className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900 border-t border-gray-700 p-4 md:p-6 shadow-2xl animate-in slide-in-from-bottom-5"
        >
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                    <p className="text-white text-sm md:text-base leading-relaxed">
                        <strong>🍪 Respetamos tu privacidad.</strong> Utilizamos cookies propias y de terceros para analizar el tráfico, mejorar tu experiencia y ofrecerte contenido relevante.
                        Al continuar navegando, aceptas nuestra <Link href="/legal/privacidad" className="underline text-[var(--iica-cyan)] hover:text-white">Política de Privacidad</Link> y el uso de cookies.
                    </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button
                        onClick={rejectOptionalCookies}
                        className="px-4 py-2 text-gray-200 hover:text-white underline text-sm font-medium transition-colors min-h-[44px]"
                    >
                        Rechazar opcionales
                    </button>
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
