'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">¡Algo salió mal!</h2>
            <p className="text-gray-600 mb-6">Hemos detectado un error inesperado al cargar esta sección.</p>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="px-4 py-2 bg-[var(--iica-blue)] text-white rounded hover:bg-[var(--iica-navy)] transition-colors"
            >
                Intentar nuevamente
            </button>
        </div>
    );
}
