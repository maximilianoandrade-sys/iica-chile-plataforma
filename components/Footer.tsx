
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

const FUENTES_FOOTER = [
    { sigla: 'FONTAGRO', nombre: 'Fondo Regional de Tecnología Agropecuaria', url: 'https://www.fontagro.org/es/convocatorias/', emoji: '🌱' },
    { sigla: 'FAO', nombre: 'TCP Chile – Programas Técnicos', url: 'https://www.fao.org/chile/', emoji: '🌍' },
    { sigla: 'BID', nombre: 'Asistencia Técnica Regional', url: 'https://www.iadb.org/es/project-portfolio-search', emoji: '🏦' },
    { sigla: 'FIDA', nombre: 'Fondo Internacional de Desarrollo Agrícola', url: 'https://www.ifad.org/en/web/latest', emoji: '🤝' },
    { sigla: 'GEF/GCF', nombre: 'Financiamiento Climático', url: 'https://www.thegef.org/projects-operations', emoji: '🌿' },
    { sigla: 'UE', nombre: 'EUROCLIMA+ / Cooperación', url: 'https://euroclimaplus.org/areas-de-trabajo/', emoji: '🇪🇺' },
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
                            <a href="https://www.linkedin.com/company/iica/" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="LinkedIn IICA">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7 0h3.8v2.2h.1c.5-1 1.8-2.2 3.8-2.2 4.1 0 4.8 2.7 4.8 6.2V24h-4v-7.3c0-1.7 0-4-2.4-4s-2.8 1.9-2.8 3.9V24h-4V8z" /></svg>
                            </a>
                            <a href="https://x.com/IICAnoticias" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors" aria-label="X IICA Noticias">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2h3.308l-7.227 8.26L23 22h-6.406l-5.016-6.58L5.82 22H2.51l7.73-8.835L1 2h6.568l4.534 5.966L18.244 2zm-1.16 18h1.833L6.58 3.895H4.613L17.084 20z" /></svg>
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
                            Fuentes verificadas: actualización continua
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
                        <Link href="/legal/derechos" className="hover:text-white transition-colors">Derechos ARCO+</Link>
                        <Link href="/legal/terminos" className="hover:text-white transition-colors">Términos de Uso</Link>
                        <Link href="/#fuentes" className="hover:text-white transition-colors">Fuentes de Datos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
