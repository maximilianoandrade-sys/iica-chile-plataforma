import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f4f7f9]">
            <Header />
            <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full transform transition-all hover:shadow-md">
                    <div className="text-6xl mb-6 animate-bounce">🌾</div>
                    <h2 className="text-4xl font-extrabold text-[var(--iica-navy)] mb-2">404</h2>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Página no encontrada</h3>

                    <p className="text-gray-600 mb-8 text-base leading-relaxed">
                        Parece que el recurso que buscas no ha sido sembrado aquí o fue cosechado.
                        Por favor, verifica la URL.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3.5 bg-[var(--iica-secondary)] text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-md hover:-translate-y-1 w-full"
                        >
                            🏠 Volver al Inicio
                        </Link>
                        <Link
                            href="/#convocatorias"
                            className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-[var(--iica-navy)] border-2 border-gray-100 rounded-xl font-bold hover:bg-gray-50 transition-all hover:border-gray-200 w-full"
                        >
                            🔍 Buscar Convocatorias
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
