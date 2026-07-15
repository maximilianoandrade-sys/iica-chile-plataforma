import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';
import { Globe, Users, Leaf, Award, CheckCircle, ArrowRight, ExternalLink, TrendingUp, Shield, MapPin, BookOpen, Zap, Database, Sprout, Users2, Building2, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Sobre IICA Chile',
    description: 'Conozca el mandato, capacidades y trayectoria de IICA Chile en cooperación técnica agrícola y desarrollo rural.',
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        title: 'Sobre IICA Chile',
        description: 'Organismo especializado en agricultura del Sistema Interamericano con presencia y cooperación técnica en Chile.',
        url: '/about',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sobre IICA Chile',
        description: 'Conozca la trayectoria y capacidades de IICA Chile para apoyar iniciativas agrícolas con cooperación técnica.',
    },
};

const CAPACIDADES = [
    { icon: Globe, title: 'Cooperación Técnica Internacional', desc: 'Diseño e implementación de proyectos en asociación con FAO, BID, GEF, GCF, FONTAGRO y Unión Europea.' },
    { icon: Zap, title: 'Investigación y Transferencia', desc: 'Estudios de base, diagnósticos territoriales y transferencia tecnológica al sector agropecuario chileno.' },
    { icon: Leaf, title: 'Agua y Cambio Climático', desc: 'Adaptación, mitigación y gestión sostenible de recursos hídricos en zonas áridas y semiáridas.' },
    { icon: Database, title: 'Sistemas de Información', desc: 'Plataformas de datos, monitoreo de proyectos y observatorios de precios agroalimentarios.' },
    { icon: Sprout, title: 'Bioeconomía y Sostenibilidad', desc: 'Valorización de residuos agrícolas, economía circular y encadenamientos productivos verdes.' },
    { icon: Users2, title: 'Inclusión y Género', desc: 'Programas de empoderamiento económico de mujeres rurales, jóvenes y pueblos originarios.' },
    { icon: Building2, title: 'Fortalecimiento Institucional', desc: 'Apoyo a ministerios, GOREs, INDAP, SAG, CNR en modernización de procesos y servicios.' },
    { icon: GraduationCap, title: 'Formación de Capacidades', desc: 'Diplomados, talleres y cursos en línea con alcance hemisférico.' },
];

const HITOS = [
    { year: '1950', text: 'Apertura de la oficina IICA en Santiago de Chile.' },
    { year: '1987', text: 'Primer proyecto de riego tecnificado con CNR en La Serena.' },
    { year: '2003', text: 'Inicio del programa de apoyo a INDAP para pequeños agricultores.' },
    { year: '2010', text: 'Primer proyecto GEF ejecutado por el IICA en Chile: biodiversidad en zonas áridas.' },
    { year: '2016', text: 'Lanzamiento de la plataforma nacional de información agroalimentaria.' },
    { year: '2019', text: 'Acuerdo de cooperación con GORE Biobío para economía forestal.' },
    { year: '2022', text: 'Primera ejecución de fondo GCF en el sector agropecuario chileno.' },
    { year: '2025', text: 'Apertura de la Plataforma Digital de Financiamiento IICA Chile.' },
];

const ALIANZAS = [
    { name: 'MINAGRI / SAG', desc: 'Ministerio de Agricultura y servicio fitosanitario', icon: Building2 },
    { name: 'INDAP', desc: 'Agricultura familiar campesina', icon: Sprout },
    { name: 'CNR', desc: 'Comisión Nacional de Riego', icon: Leaf },
    { name: 'FIA', desc: 'Fundación para la Innovación Agraria', icon: Zap },
    { name: 'CORFO', desc: 'Fomento productivo y emprendimiento', icon: TrendingUp },
    { name: 'GOREs', desc: '10 gobiernos regionales con proyectos activos', icon: MapPin },
    { name: 'U. de Chile / PUC', desc: 'Universidades socias en investigación', icon: GraduationCap },
    { name: 'FAO / BID / GEF', desc: 'Organismos internacionales coejecutores', icon: Globe },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f4f7f9] dark:bg-gray-900">
            <Header />

            <main className="flex-grow">

                {/* Hero */}
                <div className="bg-gradient-to-br from-[var(--iica-navy)] via-[var(--iica-blue)] to-blue-600 text-white py-20 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                    </div>
                    <div className="container mx-auto max-w-[1100px] relative">
                        <Breadcrumb
                            items={[{ label: 'Sobre el IICA' }]}
                            className="mb-8 text-blue-200"
                        />
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6">
                                    <Globe className="h-3.5 w-3.5" />
                                    Institución Internacional
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                                    Instituto Interamericano de Cooperación para la Agricultura
                                </h1>
                                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                                    El IICA es el organismo especializado en agricultura del Sistema Interamericano, con mandato de apoyar los esfuerzos de 34 Estados Miembros para lograr el desarrollo agrícola y el bienestar rural.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/#convocatorias"
                                        className="inline-flex items-center gap-2 bg-white text-[var(--iica-navy)] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                                    >
                                        Ver Convocatorias <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a
                                        href="https://iica.int/es/countries/chile-es/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
                                    >
                                        Sitio Oficial <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                            {/* Stats grid — WCAG 1.3.1: role="group" + aria-label compuesto + dl/dd/dt */}
                            <div className="grid grid-cols-2 gap-5">
                                {[
                                    { n: '75', label: 'Años en Chile', icon: <Award className="h-7 w-7 text-white/80" /> },
                                    { n: '34', label: 'Estados Miembros', icon: <Globe className="h-7 w-7 text-white/80" /> },
                                    { n: '48+', label: 'Proyectos 2026', icon: <TrendingUp className="h-7 w-7 text-white/80" /> },
                                    { n: 'USD 85M+', label: 'Fondos Gestionados', icon: <Shield className="h-7 w-7 text-white/80" /> },
                                ].map(({ n, label, icon }) => (
                                    <div
                                        key={label}
                                        role="group"
                                        aria-label={`${n} ${label}`}
                                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
                                    >
                                        <div className="mb-3" aria-hidden="true">{icon}</div>
                                        <dl>
                                            <dd className="text-3xl md:text-4xl font-black">{n}</dd>
                                            <dt className="text-sm text-blue-100 mt-1">{label}</dt>
                                        </dl>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mandato */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto max-w-[1100px] px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-start">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-[var(--iica-navy)] mb-8">
                                    Nuestro Mandato
                                </h2>
                                <p className="text-gray-600 text-base leading-relaxed mb-6">
                                    Fundado en 1942 y con sede en San José, Costa Rica, el IICA opera en los 34 países miembros de la OEA para estimular, promover y apoyar los esfuerzos de los Estados Miembros para lograr el desarrollo agrícola y el bienestar de las poblaciones rurales.
                                </p>
                                <p className="text-gray-600 text-base leading-relaxed mb-8">
                                    En Chile, la oficina nacional con presencia desde 1950 actúa como puente entre las agencias internacionales de cooperación y los organismos nacionales, facilitando el acceso a fondos concursables, cooperación técnica especializada y redes de conocimiento hemisféricas.
                                </p>
                                <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-[var(--iica-blue)]">
                                    <p className="text-base text-blue-800 italic leading-relaxed">
                                        &ldquo;Contribuimos a mejorar la competitividad y sostenibilidad del agro chileno articulando recursos internacionales con capacidades locales, en un marco de excelencia técnica e integridad institucional.&rdquo;
                                    </p>
                                    <p className="text-sm font-bold text-blue-900 mt-3">— Representación IICA Chile, 2026</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-[var(--iica-navy)] mb-8 flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                                    ¿Por qué el IICA es el ejecutor ideal?
                                </h3>
                                <ul className="space-y-6">
                                    {[
                                        { t: 'Acreditación Internacional', d: 'Reconocido explícitamente como ejecutor elegible por GEF, GCF, FONTAGRO, UE-EUROCLIMA+ y BID, lo que elimina costosas evaluaciones fiduciarias.' },
                                        { t: 'Neutralidad Institucional', d: 'Como organismo internacional, actúa como articulador neutral entre ministerios, privados y academia, facilitando alianzas que de otro modo serían difíciles.' },
                                        { t: 'Capacidad de Co-formulación', d: 'Equipo especializado que apoya a contrapartes chilenas en identificar la fuente correcta, formular la propuesta y gestionar el proceso de aprobación.' },
                                        { t: 'Seguimiento y Rendición', d: 'Cumplimiento estricto de los estándares fiduciarios internacionales (auditorías, informes técnicos, planes de adquisiciones), vitales para organismos multilaterales.' },
                                    ].map(({ t, d }) => (
                                        <li key={t} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-gray-800 font-bold text-base block mb-1">{t}</strong>
                                                <p className="text-gray-600 text-sm leading-relaxed">{d}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Capacidades */}
                <section className="py-20 bg-[#f4f7f9] dark:bg-gray-900">
                    <div className="container mx-auto max-w-[1100px] px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black text-[var(--iica-navy)] mb-4">Áreas de Capacidad</h2>
                            <p className="text-gray-600 text-base max-w-2xl mx-auto">Nuestro equipo multidisciplinario opera en 8 áreas de expertise complementarias para el desarrollo agrícola chileno.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {CAPACIDADES.map((c) => {
                                const IconComponent = c.icon;
                                return (
                                    <div 
                                        key={c.title} 
                                        className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:border-[var(--iica-blue)] transition-all duration-300 hover:-translate-y-2 group"
                                    >
                                        <div className="mb-4 inline-flex p-3 bg-blue-50 rounded-xl group-hover:bg-[var(--iica-blue)] transition-colors duration-300">
                                            <IconComponent className="h-6 w-6 text-[var(--iica-blue)] group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <h3 className="font-bold text-[var(--iica-navy)] mb-3 text-base leading-snug">{c.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{c.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Hitos */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto max-w-[1100px] px-4">
                        <h2 className="text-3xl md:text-4xl font-black text-[var(--iica-navy)] mb-16 text-center">75 Años de Presencia en Chile</h2>
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[88px] top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--iica-blue)] via-[var(--iica-blue)] to-blue-100 hidden sm:block" />
                            <div className="space-y-8">
                                {HITOS.map((h, i) => (
                                    <div key={h.year} className="flex items-start gap-6 group">
                                        <div className="w-20 flex-shrink-0 text-right pt-1">
                                            <span className="font-black text-[var(--iica-blue)] text-xl">{h.year}</span>
                                        </div>
                                        <div className="relative hidden sm:flex items-start justify-center w-6 flex-shrink-0 mt-1">
                                            <div className="w-4 h-4 rounded-full bg-white border-3 border-[var(--iica-blue)] z-10 group-hover:scale-125 transition-transform duration-300" />
                                        </div>
                                        <div className="flex-1 bg-gradient-to-r from-blue-50 to-transparent rounded-xl px-6 py-5 border border-gray-100 group-hover:border-[var(--iica-blue)] group-hover:shadow-md transition-all duration-300">
                                            <p className="text-gray-700 text-base leading-relaxed font-medium">{h.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Alianzas Chile */}
                <section className="py-20 bg-gradient-to-b from-[#f4f7f9] to-white">
                    <div className="container mx-auto max-w-[1100px] px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black text-[var(--iica-navy)] mb-4">Alianzas Estratégicas en Chile</h2>
                            <p className="text-gray-600 text-base max-w-2xl mx-auto">Trabajamos articuladamente con organismos públicos, academia e instituciones internacionales.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ALIANZAS.map((a) => {
                                const IconComponent = a.icon;
                                return (
                                    <div 
                                        key={a.name} 
                                        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-[var(--iica-blue)] transition-all duration-300 group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-[var(--iica-blue)] transition-colors duration-300 flex-shrink-0">
                                                <IconComponent className="h-5 w-5 text-[var(--iica-blue)] group-hover:text-white transition-colors duration-300" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-black text-[var(--iica-navy)] text-sm mb-1">{a.name}</div>
                                                <div className="text-xs text-gray-500 leading-relaxed">{a.desc}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] text-white">
                    <div className="container mx-auto max-w-[1100px] px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-black mb-6">¿Quieres colaborar con el IICA?</h2>
                        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                            Si tu institución, empresa o gobierno regional tiene un proyecto agrícola que requiere financiamiento internacional, contáctanos para explorar opciones.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="/#convocatorias"
                                className="inline-flex items-center gap-2 bg-white text-[var(--iica-navy)] font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                            >
                                <BookOpen className="h-5 w-5" />
                                Explorar Convocatorias
                            </Link>
                            <a
                                href="mailto:representacion.chile@iica.int"
                                className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <MapPin className="h-5 w-5" />
                                Contactar Oficina Chile
                            </a>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
