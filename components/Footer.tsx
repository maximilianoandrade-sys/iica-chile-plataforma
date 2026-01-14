
import React from 'react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[var(--iica-navy)] text-white pt-12 pb-6 mt-auto">
            <div className="container mx-auto max-w-[1200px] px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-white/20 pb-8">

                    {/* Column 1: Identity */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">IICA Chile</h3>
                        <p className="text-blue-200 text-sm leading-relaxed mb-4">
                            Promoviendo el desarrollo agrícola y el bienestar rural en las Américas.
                        </p>
                    </div>

                    {/* Column 2: Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Enlaces Rápidos</h4>
                        <ul className="space-y-2 text-sm text-blue-200">
                            <li><a href="#" className="hover:text-white transition-colors">Inicio</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Convocatorias</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Recursos Técnicos</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Contacto</h4>
                        <ul className="space-y-2 text-sm text-blue-200">
                            <li>📍 Calle Rancagua No.0320, Providencia, Santiago.</li>
                            <li>✉️ representacion.chile@iica.int</li>
                            <li>📞 (+56) 2 2225 2511</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-blue-300">
                    <p>© {currentYear} Instituto Interamericano de Cooperación para la Agricultura (IICA).</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white">Política de Privacidad</a>
                        <a href="#" className="hover:text-white">Términos de Uso</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
