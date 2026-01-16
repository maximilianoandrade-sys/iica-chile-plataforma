import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <h2 className="text-4xl font-bold text-[var(--iica-navy)] mb-4">404</h2>
            <p className="text-xl text-gray-700 mb-6">Página no encontrada</p>
            <p className="text-gray-500 mb-8 max-w-md">
                Lo sentimos, el recurso que estás buscando no existe o ha sido movido.
            </p>
            <Link
                href="/"
                className="px-6 py-3 bg-[var(--iica-blue)] text-white rounded-lg font-bold hover:bg-[var(--iica-navy)] transition-colors"
            >
                Volver al Inicio
            </Link>
        </div>
    );
}
