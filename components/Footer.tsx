
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[var(--iica-navy)] dark:bg-gray-900 text-white mt-16">
            <div className="container mx-auto max-w-[1200px] px-4 py-12 md:py-16">

                {/* Grid principal: 2 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 pb-10 border-b border-white/15">

                    {/* Columna 1: Identidad + RRSS */}
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
                                <p className="text-[10px] text-white/60 uppercase tracking-widest font-medium">Plataforma de Certificación</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/75 leading-relaxed mb-5 max-w-sm">
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
                                href="https://x.com/IABOREA"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                                aria-label="X IICA"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2h3.308l-7.227 8.26L23 22h-6.406l-5.016-6.58L5.82 22H2.51l7.73-8.835L1 2h6.568l4.534 5.966L18.244 2zm-1.16 18h1.833L6.58 3.895H4.613L17.084 20z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Columna 2: Enlaces útiles */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-5 text-white/90">Enlaces Útiles</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/#inicio" className="text-white/70 hover:text-white transition-colors">Inicio</Link></li>
                            <li><Link href="/#convocatorias" className="text-white/70 hover:text-white transition-colors">Ver Oportunidades</Link></li>
                            <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">Sobre IICA Chile</Link></li>
                            <li><Link href="/legal/privacidad" className="text-white/70 hover:text-white transition-colors">Política de Privacidad</Link></li>
                            <li><Link href="/legal/derechos" className="text-white/70 hover:text-white transition-colors">Derechos ARCO+</Link></li>
                            <li><Link href="/legal/terminos" className="text-white/70 hover:text-white transition-colors">Términos de Uso</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="text-center text-xs text-white/50">
                    <p>© {currentYear} Instituto Interamericano de Cooperación para la Agricultura (IICA). Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
