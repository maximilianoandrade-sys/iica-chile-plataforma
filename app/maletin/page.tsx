import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Recursos de Referencia | IICA Chile',
    description: 'Guías, modelos de postulación y documentos de referencia para preparar tu proyecto.',
};

export default function MaletinPage() {
    return (
        <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Recursos de Referencia
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                Esta sección está en construcción. Próximamente encontrarás guías,
                modelos de postulación y documentos de referencia para preparar tu proyecto.
            </p>
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-[var(--iica-blue)] hover:underline font-medium"
            >
                ← Ver oportunidades disponibles
            </Link>
        </main>
    );
}
