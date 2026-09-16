import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getProjects, displayMonto, formatDeadline, pluralizeDias } from '@/lib/data';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EligibilityAssistant } from '@/components/EligibilityAssistant';
import { CalendarReminderButton } from '@/components/CalendarReminderButton';
import { PrintProjectButton } from '@/components/PrintProjectButton';
import { ProposalGeneratorButton } from '@/components/ProposalGeneratorButton';
import { ProjectCard } from '@/components/ProjectCard';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Calendar, CheckCircle, Info, MapPin, Users, DollarSign, Layers } from 'lucide-react';

const getCachedProjects = cache(getProjects);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

function safeJsonLd(obj: Record<string, unknown>): string {
    return JSON.stringify(obj).replace(/</g, '\\u003c');
}

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const result = await getCachedProjects();
    const projects = result.ok ? result.projects : [];
    const project = projects.find(p => p.id === parseInt(id));

    if (!project) {
        return { title: 'Fondo no encontrado | IICA Chile' };
    }

    const deadline = formatDeadline(project.fecha_cierre);
    const shortObs = project.resumen?.observaciones?.slice(0, 120) || 'Revise requisitos, fechas y bases oficiales antes de postular.';
    const title = `${project.nombre}`;
    const description = `${project.institucion} · ${project.categoria} · Cierre: ${deadline}. ${shortObs}`;

    return {
        title,
        description,
        alternates: {
            canonical: `/proyecto/${id}`,
        },
        openGraph: {
            title,
            description,
            url: `/proyecto/${id}`,
            images: ['/agricultural-field.png'],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/agricultural-field.png'],
        },
    };
}

export async function generateStaticParams() {
    const result = await getCachedProjects();
    const projects = result.ok ? result.projects : [];
    return projects.map(p => ({ id: String(p.id) }));
}

export default async function ProyectoDetallePage({ params }: Props) {
    const { id } = await params;
    const result = await getCachedProjects();
    const projects = result.ok ? result.projects : [];
    const project = projects.find(p => p.id === parseInt(id));

    if (!project) notFound();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closingDate = new Date(project.fecha_cierre);
    const isClosed = closingDate < today;
    const diffDays = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isUrgent = diffDays <= 7 && diffDays >= 0;

    const montoDisplay = displayMonto(project);
    const montoFormatted = montoDisplay === 'Ver bases' ? 'Consultar institución' : montoDisplay;
    const EN_VALIDACION = 'en validación editorial';
    const isEmptyField = (val: string | undefined | null) => !val || val.trim() === '' || val.trim().toLowerCase() === EN_VALIDACION;
    const meaningfulRegiones = (project.regiones ?? []).filter(r => !isEmptyField(r));
    const meaningfulBeneficiarios = (project.beneficiarios ?? []).filter(b => !isEmptyField(b));
    const hasRegions = meaningfulRegiones.length > 0;
    const hasBeneficiaries = meaningfulBeneficiarios.length > 0;
    const regionPreview = hasRegions
        ? (meaningfulRegiones.includes('Todas') ? 'Todo Chile' : meaningfulRegiones.slice(0, 2).join(', '))
        : null;
    const beneficiariesPreview = hasBeneficiaries
        ? meaningfulBeneficiarios.slice(0, 2).join(', ')
        : null;
    const projectUrl = `${SITE_URL}/proyecto/${id}`;
    const similarProjects = projects
        .filter(p => p.id !== project.id && (p.institucion === project.institucion || p.categoria === project.categoria))
        .slice(0, 3);

    return (
        <div className="min-h-screen flex flex-col bg-[#f4f7f9] dark:bg-gray-900">
            <Header />

            <main className="flex-grow container mx-auto max-w-[900px] px-4 py-10">

                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href="/#convocatorias"
                        className="inline-flex items-center gap-2 text-sm text-[var(--iica-blue)] hover:text-[var(--iica-navy)] font-medium transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a todas las convocatorias
                    </Link>
                </div>

                {/* Card principal */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

                    {/* Header del fondo */}
                    <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] p-8 text-white">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                                    {project.categoria}
                                </span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isClosed
                                        ? 'bg-red-500/20 border-red-300/30 text-red-100'
                                        : isUrgent
                                            ? 'bg-amber-500/20 border-amber-300/30 text-amber-100'
                                            : 'bg-green-500/20 border-green-300/30 text-green-100'
                                    }`}>
                                    {isClosed ? <><span aria-hidden="true">🔴</span> Cerrado</> : isUrgent ? <><span aria-hidden="true">⚠️</span> Cierra en {pluralizeDias(diffDays)}</> : <><span aria-hidden="true">🟢</span> Abierto</>}
                                </span>
                            </div>

                            <CalendarReminderButton project={project} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">
                            {project.nombre}
                        </h1>
                        <p className="text-blue-100 font-semibold text-lg">{project.institucion}</p>
                    </div>

                    {/* Métricas clave */}
                    <div className={`grid grid-cols-2 ${hasRegions || hasBeneficiaries ? 'md:grid-cols-4' : 'md:grid-cols-2'} divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700`}>
                        <div className="p-5 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                <DollarSign className="h-3.5 w-3.5" /> Monto Máximo
                            </div>
                            <div className="font-extrabold text-[var(--iica-navy)] dark:text-white text-lg leading-tight">{montoFormatted}</div>
                        </div>
                        <div className="p-5 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                <Calendar className="h-3.5 w-3.5" /> Fecha Cierre
                            </div>
                            <div className={`font-extrabold text-lg leading-tight ${isClosed ? 'text-red-500 dark:text-red-400' : isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--iica-navy)] dark:text-white'}`}>
                                {closingDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                        {hasRegions && (
                            <div className="p-5 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <MapPin className="h-3.5 w-3.5" /> Regiones
                                </div>
                                <div className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                                    {regionPreview}
                                    {!meaningfulRegiones.includes('Todas') && meaningfulRegiones.length > 2 && ` +${meaningfulRegiones.length - 2}`}
                                </div>
                            </div>
                        )}
                        {hasBeneficiaries && (
                            <div className="p-5 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <Users className="h-3.5 w-3.5" /> Beneficiarios
                                </div>
                                <div className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                                    {beneficiariesPreview}
                                    {meaningfulBeneficiarios.length > 2 && ` +${meaningfulBeneficiarios.length - 2}`}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contenido detallado */}
                    <div className="p-6 md:p-8 space-y-8">

                        {/* Asistente de Elegibilidad Rápidas */}
                        <EligibilityAssistant project={project} />

                        {/* Cofinanciamiento */}
                        {project.resumen?.cofinanciamiento && (
                            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-5 border border-blue-100 dark:border-blue-900">
                                <h2 className="font-bold text-[var(--iica-navy)] dark:text-blue-200 mb-2 flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-[var(--iica-blue)]" />
                                    Cofinanciamiento
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 font-medium">{project.resumen.cofinanciamiento}</p>
                            </div>
                        )}

                        {/* Objetivo / Descripción */}
                        {project.objetivo && !isEmptyField(project.objetivo) && (
                            <div>
                                <h2 className="font-bold text-[var(--iica-navy)] dark:text-white mb-3 flex items-center gap-2 text-lg">
                                    <Info className="h-5 w-5 text-[var(--iica-blue)]" />
                                    Descripción
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.objetivo}</p>
                            </div>
                        )}

                        {/* Checklist de elegibilidad */}
                        {project.checklist && project.checklist.length > 0 && (
                            <div>
                                <h2 className="font-bold text-[var(--iica-navy)] dark:text-white mb-4 flex items-center gap-2 text-lg">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    Checklist de Elegibilidad
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {project.checklist.map((item: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 bg-green-50 dark:bg-emerald-950/30 rounded-lg p-3 border border-green-100 dark:border-emerald-800">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Botones de Acción: Bases, IA, Calendario e Impresión */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-[var(--iica-navy)] dark:text-white">¿Listo para postular?</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Accede a las bases oficiales, redacta un borrador con IA o descarga la minuta.</p>
                            </div>
                            <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
                                <ProposalGeneratorButton project={project} />
                                <CalendarReminderButton project={project} />
                                <PrintProjectButton />
                                <a
                                    href={project.url_bases}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-md min-h-[44px]"
                                >
                                    Ver Bases en Sitio Oficial
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </div>

                        {/* Legal and verification disclaimer */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-[var(--iica-blue)] shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-gray-700 dark:text-gray-300">Verificado por IICA Chile: </span>
                                La información expuesta proviene de fuentes públicas oficiales ({project.institucion}). Las evaluaciones y filtros entregados corresponden a una preevaluación previa. La decisión final de admisibilidad, evaluación y adjudicación es competencia exclusiva de la institución convocante según sus bases oficiales.
                            </div>
                        </div>

                    </div>
                </div>

                {/* Convocatorias Similares Recomendadas */}
                {similarProjects.length > 0 && (
                    <section className="mt-12 space-y-4">
                        <div className="flex items-center gap-2 text-[var(--iica-navy)] dark:text-white">
                            <Layers className="h-5 w-5 text-[var(--iica-blue)]" />
                            <h2 className="text-xl font-bold">Convocatorias Similares Recomendadas</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {similarProjects.map((p) => (
                                <ProjectCard key={p.id} project={p} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
