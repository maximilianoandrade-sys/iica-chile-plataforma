
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

const FUENTES_FOOTER = [
    { sigla: 'FONTAGRO', nombre: 'Fondo Regional de Tecnología Agropecuaria', url: 'https://www.fontagro.org/', emoji: '🌱' },
    { sigla: 'FAO', nombre: 'TCP Chile – Programas Técnicos', url: 'https://www.fao.org/chile/', emoji: '🌍' },
    { sigla: 'BID', nombre: 'Asistencia Técnica Regional', url: 'https://www.iadb.org/es', emoji: '🏦' },
    { sigla: 'FIDA', nombre: 'Fondo Internacional de Desarrollo Agrícola', url: 'https://www.ifad.org/', emoji: '🤝' },
    { sigla: 'GEF/GCF', nombre: 'Financiamiento Climático', url: 'https://www.thegef.org/', emoji: '🌿' },
    { sigla: 'UE', nombre: 'EUROCLIMA+ / Cooperación', url: 'https://euroclimaplus.org/', emoji: '🇪🇺' },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[var(--iica-navy)] text-white pt-12 pb-6 mt-auto">
            <div className="container mx-auto max-w-[1200px] px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-white/20 pb-8">

                    {/* Column 1: Identity */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Image
                                src="/logos/official/iica.png"
                                alt="Logo oficial IICA Chile"
                                width={48}
                                height={48}
                                className="h-11 w-auto"
                            />
                            <h3 className="text-xl font-bold">IICA <span className="text-[var(--iica-secondary)]">Chile</span></h3>
                        </div>
                        <p className="text-blue-200 text-sm leading-relaxed mb-4">
                            Promoviendo el desarrollo agrícola y el bienestar rural en las Américas desde 1942.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/IICAChile" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="Facebook IICA Chile">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="https://twitter.com/IICAChile" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="Twitter IICA Chile">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Radar de Oportunidades</h4>
                        <ul className="space-y-2 text-sm text-blue-200">
                            <li><Link href="/#inicio" className="hover:text-white transition-colors">Inicio</Link></li>
                            <li><Link href="/#convocatorias" className="hover:text-white transition-colors">Ver Oportunidades</Link></li>
                            <li><Link href="/#fuentes" className="hover:text-white transition-colors">Fuentes Internacionales</Link></li>
                            <li><Link href="/maletin" className="hover:text-white transition-colors">Recursos de Referencia</Link></li>

                        </ul>
                    </div>

                    {/* Column 3: Official Sources */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                            🌎 Fuentes Internacionales
                        </h4>
                        <ul className="space-y-2 text-sm">
                            {FUENTES_FOOTER.map(fuente => (
                                <li key={fuente.sigla}>
                                    <a
                                        href={fuente.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group"
                                    >
                                        <span>{fuente.emoji}</span>
                                        <span className="font-bold">{fuente.sigla}</span>
                                        <span className="text-blue-300 text-xs">– {fuente.nombre}</span>
                                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <p className="text-blue-400 text-xs mt-3 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
                            Fuentes verificadas: May 2026
                        </p>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Contacto IICA Chile</h4>
                        <ul className="space-y-2 text-sm text-blue-200">
                            <li>
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=Calle+Rancagua+320+Providencia+Santiago+Chile"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                    aria-label="Ver ubicación en Google Maps"
                                >
                                    📍 Calle Rancagua No.0320, Providencia, Santiago.
                                </a>
                            </li>
                            <li>✉️ <a href="mailto:representacion.chile@iica.int" className="hover:text-white transition-colors">representacion.chile@iica.int</a></li>
                            <li>📞 <a href="tel:+56222252511" className="hover:text-white transition-colors" aria-label="Llamar al IICA Chile">Fijo: (+56) 2 2225 2511</a></li>
                        </ul>
                        <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/20">
                            <p className="text-xs text-blue-200 font-medium">¿Encontraste una oportunidad relevante?</p>
                            <a
                                href="https://mail.google.com/mail/?view=cm&to=representacion.chile@iica.int&su=Oportunidad+de+Proyecto+IICA+Chile+2026"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--iica-yellow)] text-xs font-bold hover:underline"
                            >
                                Compártela con el equipo →
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-blue-300 gap-3">
                    <p>© {currentYear} Instituto Interamericano de Cooperación para la Agricultura (IICA). Todos los derechos reservados.</p>
                    <div className="flex gap-4">
                        <Link href="/legal/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
                        <Link href="/legal/terminos" className="hover:text-white transition-colors">Términos de Uso</Link>
                        <Link href="/#fuentes" className="hover:text-white transition-colors">Fuentes de Datos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
