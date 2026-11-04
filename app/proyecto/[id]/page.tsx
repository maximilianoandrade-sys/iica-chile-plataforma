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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LinkGuardianAnchor } from '@/lib/linkGuardian';
import { getCatalogRouteKey } from '@/lib/catalog-merge';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle, Info, MapPin, Users, DollarSign, Layers, Laptop, FileText, ClipboardCheck } from 'lucide-react';

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
    const project = projects.find(p => getCatalogRouteKey(p) === id || String(p.id) === id);

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
    return projects.map(p => ({ id: getCatalogRouteKey(p) }));
}

export default async function ProyectoDetallePage({ params }: Props) {
    const { id } = await params;
    const result = await getCachedProjects();
    const projects = result.ok ? result.projects : [];
    const project = projects.find(p => getCatalogRouteKey(p) === id || String(p.id) === id);

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
    const projectUrl = `${SITE_URL}/proyecto/${getCatalogRouteKey(project)}`;
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
                    <div className="relative overflow-hidden bg-[var(--iica-navy)] p-6 text-white md:p-8">
                        <div className="absolute -right-20 -top-32 h-96 w-96 rotate-12 bg-[var(--iica-blue)]/30" aria-hidden="true" />
                        <div className="relative z-10">
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
                        {project.resumen?.observaciones && (
                            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-blue-50">{project.resumen.observaciones}</p>
                        )}
                        <LinkGuardianAnchor
                            url={project.url_bases}
                            projectName={project.nombre}
                            institution={project.institucion}
                            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-400"
                        />
                        </div>
                    </div>

                    {/* Fechas de postulación, inspired by fondos.gob.cl */}
                    <div className="border-b border-gray-100 bg-white px-6 py-7 dark:border-gray-700 dark:bg-gray-800 md:px-12">
                        <h2 className="text-center text-lg font-bold text-gray-800 dark:text-white">Fechas de postulación</h2>
                        <div className="mx-auto mt-7 grid max-w-2xl grid-cols-[1fr_auto_1fr] items-start gap-3">
                            <div className="text-center">
                                <span className="mx-auto block h-3 w-3 rounded-full border-2 border-emerald-500 bg-white" />
                                <span className="mt-2 inline-block rounded bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
                                    Publicación
                                </span>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Inicio disponible</p>
                            </div>
                            <div className="mt-1 h-px w-20 bg-gray-300 dark:bg-gray-600 md:w-40" aria-hidden="true" />
                            <div className="text-center">
                                <span className={`mx-auto block h-3 w-3 rounded-full border-2 ${isClosed ? 'border-red-500' : 'border-rose-400'} bg-white`} />
                                <span className={`mt-2 inline-block rounded px-2 py-1 text-xs font-bold text-white ${isClosed ? 'bg-red-600' : 'bg-rose-500'}`}>
                                    {isClosed ? 'Cerrado' : formatDeadline(project.fecha_cierre)}
                                </span>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Fecha de cierre</p>
                            </div>
                        </div>
                    </div>

                    {/* Detalles del fondo */}
                    <div className="bg-[#f1f1f1] px-4 py-8 dark:bg-gray-900 md:px-8">
                        <h2 className="mb-5 text-center text-lg font-bold text-gray-800 dark:text-white">Detalles del fondo</h2>
                        <div className={`grid grid-cols-1 gap-3 ${hasRegions || hasBeneficiaries ? 'md:grid-cols-4' : 'md:grid-cols-2'}`}>
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
                        <div className="rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <Laptop className="mx-auto h-5 w-5 text-rose-500" aria-hidden="true" />
                            <p className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Modalidad</p>
                            <p className="mt-1 text-sm font-bold text-rose-500">Postulación en línea</p>
                        </div>
                        </div>
                    </div>

                    {/* Contenido detallado */}
                    <div className="bg-[#f1f1f1] px-4 pb-8 md:px-8">
                    <Tabs defaultValue="requisitos" className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <TabsList className="flex h-auto w-full justify-start overflow-x-auto rounded-none border-b border-gray-200 bg-white p-0 dark:border-gray-700 dark:bg-gray-800">
                            <TabsTrigger value="requisitos" className="min-h-[52px] rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-blue-600 data-[state=active]:bg-white md:px-8">
                                <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden="true" /> Requisitos
                            </TabsTrigger>
                            <TabsTrigger value="documentacion" className="min-h-[52px] rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-blue-600 data-[state=active]:bg-white md:px-8">
                                <FileText className="mr-2 h-4 w-4" aria-hidden="true" /> Documentación
                            </TabsTrigger>
                            <TabsTrigger value="evaluacion" className="min-h-[52px] rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-blue-600 data-[state=active]:bg-white md:px-8">
                                Evaluación
                            </TabsTrigger>
                            <TabsTrigger value="bases" className="min-h-[52px] rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-blue-600 data-[state=active]:bg-white md:px-8">
                                Bases y consultas
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="requisitos" className="p-6 md:p-8">

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
                        </TabsContent>
                        <TabsContent value="documentacion" className="p-6 md:p-8">
                            <h2 className="text-lg font-bold text-[var(--iica-navy)] dark:text-white">Documentación y bases</h2>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Revise la documentación oficial y los antecedentes solicitados directamente en la fuente de la convocatoria.</p>
                            <div className="mt-5">{/* The official-link action remains below for consistent verification. */}</div>
                        </TabsContent>
                        <TabsContent value="evaluacion" className="p-6 md:p-8">
                            <h2 className="text-lg font-bold text-[var(--iica-navy)] dark:text-white">Evaluación preliminar IICA</h2>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Esta ficha resume la información pública disponible y no reemplaza la evaluación oficial de la institución convocante.</p>
                        </TabsContent>
                        <TabsContent value="bases" className="p-6 md:p-8">
                            <h2 className="text-lg font-bold text-[var(--iica-navy)] dark:text-white">Bases y consultas</h2>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Consulte las bases oficiales, fechas y canales de atención antes de postular.</p>
                        </TabsContent>

                        {/* Botones de Acción: Bases, IA, Calendario e Impresión */}
                        <div id="bases" className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-[var(--iica-navy)] dark:text-white">¿Listo para postular?</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Accede a las bases oficiales, redacta un borrador con IA o descarga la minuta.</p>
                            </div>
                            <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
                                <ProposalGeneratorButton project={project} />
                                <CalendarReminderButton project={project} />
                                <PrintProjectButton />
                                <LinkGuardianAnchor
                                    url={project.url_bases}
                                    projectName={project.nombre}
                                    institution={project.institucion}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-md min-h-[44px]"
                                />
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

                    </Tabs>
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
