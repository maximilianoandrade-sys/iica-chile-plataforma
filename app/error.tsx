'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[55vh] flex items-center justify-center p-6">
            <div className="w-full max-w-xl rounded-2xl border border-red-100 bg-white shadow-sm p-6 md:p-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-3">No pudimos cargar esta sección</h2>
                <p className="text-gray-600 mb-6">
                    Ocurrió un problema inesperado. Puede intentarlo de nuevo o volver al inicio para continuar navegando.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2.5 bg-[var(--iica-blue)] text-white rounded-lg hover:bg-[var(--iica-navy)] transition-colors font-semibold"
                    >
                        Intentar nuevamente
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                    >
                        Volver al inicio
                    </Link>
                </div>

                {error.digest && (
                    <p className="text-xs text-gray-400 mt-4">Código de referencia: {error.digest}</p>
                )}
            </div>
        </div>
    );
}
