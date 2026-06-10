
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

const FUENTES_FOOTER = [
    { sigla: 'FONTAGRO', nombre: 'Fondo Regional de Tecnología Agropecuaria', url: 'https://www.fontagro.org/es/convocatorias/', emoji: '🌱' },
    { sigla: 'FAO', nombre: 'TCP Chile – Programas Técnicos', url: 'https://www.fao.org/chile/', emoji: '🌍' },
    { sigla: 'BID', nombre: 'Asistencia Técnica Regional', url: 'https://idbinvest.org/en/projects', emoji: '🏦' },
    { sigla: 'FIDA', nombre: 'Fondo Internacional de Desarrollo Agrícola', url: 'https://ifad-cofinancing.org/catalogue/', emoji: '🤝' },
    { sigla: 'GEF/GCF', nombre: 'Financiamiento Climático', url: 'https://www.thegef.org/projects-operations', emoji: '🌿' },
    { sigla: 'UE', nombre: 'EUROCLIMA+ / Cooperación', url: 'https://euroclimaplus.org/areas-de-trabajo/', emoji: '🇪🇺' },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[var(--iica-navy)] dark:bg-gray-900 text-white mt-16">
            <div className="container mx-auto max-w-[1200px] px-4 py-12 md:py-16">

                {/* Grid principal */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-white/15">

                    {/* Columna 1: Identidad con logo oficial */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Image
                                src="/logos/official/iica.png"
                                alt="Logo oficial IICA Chile"
                                width={48}
                                height={48}
                                className="h-11 w-auto"
                            />
                            <div>
                                <h3 className="text-lg font-black leading-tight">
                                    IICA <span className="text-[var(--iica-secondary)] dark:text-emerald-400">Chile</span>
                                </h3>
                                <p className="text-[10px] text-white/60 uppercase tracking-widest font-medium">Radar 2026</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/75 leading-relaxed mb-5">
                            Promoviendo el desarrollo agrícola y el bienestar rural en las Américas desde 1942.
                        </p>
                        {/* Redes sociales */}
                        <div className="flex gap-3">
                            <a
                                href="https://www.linkedin.com/company/iica/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                                aria-label="LinkedIn IICA"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7 0h3.8v2.2h.1c.5-1 1.8-2.2 3.8-2.2 4.1 0 4.8 2.7 4.8 6.2V24h-4v-7.3c0-1.7 0-4-2.4-4s-2.8 1.9-2.8 3.9V24h-4V8z" /></svg>
                            </a>
                            <a
                                href="https://x.com/IICAnoticias"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                                aria-label="X IICA Noticias"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2h3.308l-7.227 8.26L23 22h-6.406l-5.016-6.58L5.82 22H2.51l7.73-8.835L1 2h6.568l4.534 5.966L18.244 2zm-1.16 18h1.833L6.58 3.895H4.613L17.084 20z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Columna 2: Radar de Oportunidades */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-5 text-white/90">Radar de Oportunidades</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/#inicio" className="text-white/70 hover:text-white transition-colors">Inicio</Link></li>
                            <li><Link href="/#convocatorias" className="text-white/70 hover:text-white transition-colors">Ver Oportunidades</Link></li>
                            <li><Link href="/#fuentes" className="text-white/70 hover:text-white transition-colors">Fuentes Internacionales</Link></li>

                            <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">Sobre IICA Chile</Link></li>
                        </ul>
                    </div>

                    {/* Columna 3: Fuentes Internacionales */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-5 text-white/90">
                            🌎 Fuentes Internacionales
                        </h4>
                        <ul className="space-y-2 text-sm">
                            {FUENTES_FOOTER.map(fuente => (
                                <li key={fuente.sigla}>
                                    <a
                                        href={fuente.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                                    >
                                        <span>{fuente.emoji}</span>
                                        <span className="font-bold">{fuente.sigla}</span>
                                        <span className="text-white/40 text-xs">— {fuente.nombre}</span>
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <p className="text-white/40 text-xs mt-4 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block" />
                            Fuentes verificadas · actualización continua
                        </p>
                    </div>

                    {/* Columna 4: Contacto */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-5 text-white/90">Contacto IICA Chile</h4>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-white/50" />
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=Calle+Rancagua+320+Providencia+Santiago+Chile"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                    aria-label="Ver ubicación en Google Maps"
                                >
                                    Calle Rancagua No. 0320, Providencia, Santiago
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 shrink-0 text-white/50" />
                                <a href="mailto:representacion.chile@iica.int" className="hover:text-white transition-colors">
                                    representacion.chile@iica.int
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 shrink-0 text-white/50" />
                                <a href="tel:+56222252511" className="hover:text-white transition-colors">
                                    (+56) 2 2225 2511
                                </a>
                            </li>
                        </ul>
                        <div className="mt-5 p-3.5 bg-white/10 rounded-xl border border-white/15">
                            <p className="text-xs text-white/60 font-medium mb-1">¿Encontraste una oportunidad relevante?</p>
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

                {/* Bottom bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
                    <p>© {currentYear} Instituto Interamericano de Cooperación para la Agricultura (IICA). Todos los derechos reservados.</p>
                    <div className="flex flex-wrap justify-center gap-4">
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
