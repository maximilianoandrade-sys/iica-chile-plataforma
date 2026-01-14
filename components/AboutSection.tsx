export default function AboutSection() {
    return (
        <section id="nosotros" className="py-16 bg-white border-t border-gray-200">
            <div className="container mx-auto max-w-[1200px] px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">

                    {/* Columna 1: Identidad Institucional */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src="https://iica.int/sites/default/files/2023-04/IICA_Logo_Color_1.png"
                                alt="Logo IICA"
                                className="h-16"
                            />
                            <span className="text-sm font-bold text-gray-500 tracking-widest uppercase">Oficina Chile</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Conectando las Américas para la Seguridad Alimentaria</h2>
                        <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                            El <strong>IICA</strong> es el organismo especializado en agricultura del Sistema Interamericano que apoya los esfuerzos de los Estados Miembros para lograr el desarrollo agrícola y el bienestar rural.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 mb-6">
                            <p className="text-sm text-blue-800 italic">
                                &ldquo;Nuestro compromiso es modernizar el agro chileno con innovación, sostenibilidad y cooperación técnica de excelencia.&rdquo;
                            </p>
                            <p className="text-xs font-bold text-blue-900 mt-2">— Hernán Chiriboga, Representante IICA Chile</p>
                        </div>

                        {/* Enlaces a Redes (RSS Simulado) */}
                        <div className="flex gap-4 items-center">
                            <a
                                href="https://twitter.com/IICAChile"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-500 transition"
                                aria-label="Twitter IICA Chile"
                            >
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a
                                href="https://www.iica.int/es/countries/chile-es/noticias"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 font-bold hover:underline"
                            >
                                Ver Noticias Recientes (RSS) →
                            </a>
                        </div>
                    </div>

                    {/* Columna 2: Widget de Últimas Noticias (Estático por ahora) */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            📰 Actualidad IICA
                        </h3>
                        <ul className="space-y-4">
                            <li className="pb-4 border-b border-gray-200 last:border-0">
                                <a href="https://iica.int/es/countries/chile-es" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition block">
                                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">Sostenibilidad</span>
                                    <p className="font-medium mt-1">Impulso a mercados de carbono para productores de arroz en Chile.</p>
                                </a>
                            </li>
                            <li className="pb-4 border-b border-gray-200 last:border-0">
                                <a href="https://iica.int/es/countries/chile-es" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition block">
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Gestión 2025</span>
                                    <p className="font-medium mt-1">Rendición de Cuentas: Transparencia y resultados de la gestión IICA.</p>
                                </a>
                            </li>
                            <li className="last:border-0">
                                <a href="https://iica.int/es/countries/chile-es" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition block">
                                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">Innovación</span>
                                    <p className="font-medium mt-1">Seminario Internacional de Biofertilizantes y Suelos Vivos.</p>
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </section>
    );
}
