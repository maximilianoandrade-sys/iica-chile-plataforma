import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Info, 
  MapPin, 
  Users, 
  DollarSign, 
  Layers, 
  Laptop, 
  FileText, 
  ClipboardCheck, 
  Scale, 
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

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
    const montoFormatted = montoDisplay === 'Ver bases' ? 'Consultar en bases' : montoDisplay;
    const EN_VALIDACION = 'en validación editorial';
    const isEmptyField = (val: string | undefined | null) => !val || val.trim() === '' || val.trim().toLowerCase() === EN_VALIDACION;
    const meaningfulRegiones = (project.regiones ?? []).filter(r => !isEmptyField(r));
    const meaningfulBeneficiarios = (project.beneficiarios ?? []).filter(b => !isEmptyField(b));
    const hasRegions = meaningfulRegiones.length > 0;
    const hasBeneficiaries = meaningfulBeneficiarios.length > 0;
    const regionPreview = hasRegions
        ? (meaningfulRegiones.includes('Todas') ? 'Todo Chile' : meaningfulRegiones.slice(0, 2).join(', '))
        : (project.ambito || 'Nacional');

    const projectUrl = `${SITE_URL}/proyecto/${getCatalogRouteKey(project)}`;
    const similarProjects = projects
        .filter(p => p.id !== project.id && (p.institucion === project.institucion || p.categoria === project.categoria))
        .slice(0, 3);

    return (
        <div className="min-h-screen flex flex-col bg-[#f4f7f9] dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
            <Header />

            <main className="container mx-auto flex-grow max-w-[920px] px-3 py-6 sm:px-4 sm:py-8">

                {/* Breadcrumb */}
                <div className="mb-5 sm:mb-6">
                    <Link
                        href="/#convocatorias"
                        className="inline-flex items-center gap-2 text-sm text-[var(--iica-blue)] hover:text-[var(--iica-navy)] dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a todas las convocatorias
                    </Link>
                </div>

                {/* Card principal estilo captura pero pulido */}
                <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">

                    {/* Header del fondo (Azul profundo de la captura) */}
                    <header className="relative overflow-hidden bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] dark:from-[#0d1e38] dark:to-[#173b6c] p-6 sm:p-8 text-white">
                        <div className="absolute -right-20 -top-32 h-96 w-96 rotate-12 bg-white/5 pointer-events-none" aria-hidden="true" />
                        
                        <div className="relative z-10">
                            {/* Badges superiores y Botón de Agenda */}
                            <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 shadow-sm">
                                        {project.categoria}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                                        isClosed
                                            ? 'bg-red-500/20 border-red-300/30 text-red-100'
                                            : isUrgent
                                                ? 'bg-amber-500/25 border-amber-300/40 text-amber-100 animate-pulse'
                                                : 'bg-green-500/20 border-green-300/30 text-green-100'
                                    }`}>
                                        <span className={`h-2 w-2 rounded-full ${isClosed ? 'bg-red-400' : isUrgent ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                        {isClosed ? 'Cerrado' : isUrgent ? `Cierra en ${pluralizeDias(diffDays)}` : 'Abierto'}
                                    </span>
                                </div>

                                <div className="self-start sm:self-auto">
                                    <CalendarReminderButton project={project} />
                                </div>
                            </div>

                            {/* Título de la Convocatoria */}
                            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2 text-white">
                                {project.nombre}
                            </h1>
                            <p className="text-blue-100 font-semibold text-base sm:text-lg">{project.institucion}</p>

                            {/* Resumen u observaciones si existen */}
                            {project.resumen?.observaciones && (
                                <p className="mt-3 text-sm leading-relaxed text-blue-50/90 max-w-2xl">
                                    {project.resumen.observaciones}
                                </p>
                            )}

                            {/* Botón Ver Bases en Sitio Oficial del Header */}
                            <div className="mt-5">
                                <LinkGuardianAnchor
                                    url={project.url_bases}
                                    projectName={project.nombre}
                                    institution={project.institucion}
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-2.5 text-sm transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </header>

                    {/* Fechas de postulación (Línea de tiempo fiel a la captura, con contraste corregido) */}
                    <section aria-label="Fechas de postulación" className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-850 px-4 py-6 sm:px-6 sm:py-7 md:px-12">
                        <h2 className="text-center text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                            Fechas de postulación
                        </h2>
                        
                        <div className="mx-auto mt-6 grid max-w-xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 sm:mt-7 sm:gap-3">
                            {/* Punto 1: Publicación */}
                            <div className="text-center">
                                <span className="mx-auto block h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950" />
                                <span className="mt-2 inline-block rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                                    Publicación
                                </span>
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">Inicio disponible</p>
                            </div>

                            {/* Línea conectora */}
                            <div className="mt-1.5 h-0.5 w-12 bg-gray-300 dark:bg-gray-700 sm:w-28 md:w-36" aria-hidden="true" />

                            {/* Punto 2: Fecha de cierre */}
                            <div className="text-center">
                                <span className={`mx-auto block h-3.5 w-3.5 rounded-full border-2 ${isClosed ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-rose-400 bg-rose-50 dark:bg-rose-950'}`} />
                                <span className={`mt-2 inline-block rounded-md px-2.5 py-1 text-xs font-bold text-white shadow-xs ${isClosed ? 'bg-red-600' : 'bg-rose-500'}`}>
                                    {isClosed ? 'Cerrado' : formatDeadline(project.fecha_cierre)}
                                </span>
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">Fecha de cierre</p>
                            </div>
                        </div>
                    </section>

                    {/* Detalles del fondo (Métricas organizadas fiel a la captura) */}
                    <section aria-label="Detalles del fondo" className="bg-gray-50 dark:bg-gray-900/90 px-4 py-7 sm:px-6 md:px-8 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="mb-5 text-center text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                            Detalles del fondo
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-w-3xl mx-auto">
                            {/* Monto Máximo */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 p-4 sm:p-5 text-center shadow-xs">
                                <DollarSign className="mx-auto h-5 w-5 text-gray-400 dark:text-gray-400" aria-hidden="true" />
                                <p className="mt-1.5 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wide">Monto Máximo</p>
                                <p className="mt-1 text-base sm:text-lg font-extrabold text-[var(--iica-navy)] dark:text-white">{montoFormatted}</p>
                            </div>

                            {/* Fecha Cierre */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 p-4 sm:p-5 text-center shadow-xs">
                                <Calendar className="mx-auto h-5 w-5 text-gray-400 dark:text-gray-400" aria-hidden="true" />
                                <p className="mt-1.5 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wide">Fecha Cierre</p>
                                <p className={`mt-1 text-sm sm:text-base font-extrabold ${isClosed ? 'text-red-500 dark:text-red-400' : isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                                    {closingDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Modalidad */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 p-4 sm:p-5 text-center shadow-xs sm:col-span-2 md:col-span-1">
                                <Laptop className="mx-auto h-5 w-5 text-rose-500" aria-hidden="true" />
                                <p className="mt-1.5 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wide">Modalidad</p>
                                <p className="mt-1 text-sm sm:text-base font-bold text-rose-500">Postulación en línea</p>
                            </div>
                        </div>

                        {/* Cobertura territorial si existe */}
                        {hasRegions && (
                            <div className="mt-3.5 max-w-3xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                <MapPin className="h-3.5 w-3.5 text-[var(--iica-blue)]" />
                                <span>Cobertura geográfica: <strong>{regionPreview}</strong></span>
                            </div>
                        )}
                    </section>

                    {/* Contenido detallado con Tabs (Exactamente las 4 pestañas de tu captura) */}
                    <div className="bg-gray-50/60 dark:bg-gray-900 px-3 py-6 sm:px-6 md:px-8">
                        <Tabs defaultValue="requisitos" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 shadow-sm overflow-hidden">
                            {/* Pestañas exactas: Requisitos, Documentación, Evaluación, Bases y consultas */}
                            <TabsList className="flex h-auto w-full max-w-full justify-start overflow-x-auto rounded-none border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900 p-1 gap-1">
                                <TabsTrigger 
                                    value="requisitos" 
                                    className="min-h-[48px] rounded-xl px-4 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-[var(--iica-navy)] dark:data-[state=active]:text-white data-[state=active]:shadow-sm md:px-6"
                                >
                                    <ClipboardCheck className="mr-2 h-4 w-4 text-[var(--iica-blue)]" aria-hidden="true" />
                                    Requisitos
                                </TabsTrigger>

                                <TabsTrigger 
                                    value="documentacion" 
                                    className="min-h-[48px] rounded-xl px-4 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-[var(--iica-navy)] dark:data-[state=active]:text-white data-[state=active]:shadow-sm md:px-6"
                                >
                                    <FileText className="mr-2 h-4 w-4 text-emerald-600" aria-hidden="true" />
                                    Documentación
                                </TabsTrigger>

                                <TabsTrigger 
                                    value="evaluacion" 
                                    className="min-h-[48px] rounded-xl px-4 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-[var(--iica-navy)] dark:data-[state=active]:text-white data-[state=active]:shadow-sm md:px-6"
                                >
                                    <Scale className="mr-2 h-4 w-4 text-indigo-500" aria-hidden="true" />
                                    Evaluación
                                </TabsTrigger>

                                <TabsTrigger 
                                    value="bases" 
                                    className="min-h-[48px] rounded-xl px-4 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-[var(--iica-navy)] dark:data-[state=active]:text-white data-[state=active]:shadow-sm md:px-6"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4 text-amber-500" aria-hidden="true" />
                                    Bases y consultas
                                </TabsTrigger>
                            </TabsList>

                            {/* PESTAÑA 1: Requisitos (Asistente + Descripción + Checklist) */}
                            <TabsContent value="requisitos" className="p-5 sm:p-7 md:p-8 space-y-6 focus-visible:outline-none">
                                {/* Asistente de Elegibilidad */}
                                <EligibilityAssistant project={project} />

                                {/* Descripción / Objetivo */}
                                {project.objetivo && !isEmptyField(project.objetivo) && (
                                    <div className="pt-2">
                                        <h3 className="font-bold text-[var(--iica-navy)] dark:text-white mb-2 flex items-center gap-2 text-base sm:text-lg">
                                            <Info className="h-5 w-5 text-[var(--iica-blue)]" />
                                            Descripción
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                                            {project.objetivo}
                                        </p>
                                    </div>
                                )}

                                {/* Checklist de elegibilidad si existe */}
                                {project.checklist && project.checklist.length > 0 && (
                                    <div className="pt-2">
                                        <h3 className="font-bold text-[var(--iica-navy)] dark:text-white mb-3 flex items-center gap-2 text-base sm:text-lg">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            Checklist de Elegibilidad
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {project.checklist.map((item: string, idx: number) => (
                                                <div key={idx} className="flex items-start gap-2.5 bg-emerald-50/70 dark:bg-emerald-950/25 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/40">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cofinanciamiento si aplica */}
                                {project.resumen?.cofinanciamiento && !isEmptyField(project.resumen.cofinanciamiento) && (
                                    <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                                        <h4 className="font-bold text-[var(--iica-navy)] dark:text-blue-200 mb-1 flex items-center gap-2 text-sm">
                                            <DollarSign className="h-4 w-4 text-[var(--iica-blue)]" />
                                            Cofinanciamiento y Aportes
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            {project.resumen.cofinanciamiento}
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* PESTAÑA 2: Documentación */}
                            <TabsContent value="documentacion" className="p-5 sm:p-7 md:p-8 space-y-5 focus-visible:outline-none">
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-[var(--iica-navy)] dark:text-white flex items-center gap-2">
                                        <FileCheck className="h-5 w-5 text-emerald-600" />
                                        Documentación y antecedentes requeridos
                                    </h3>
                                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        Para postular formalmente a las convocatorias de {project.institucion}, asegúrate de recopilar la documentación administrativa y técnica solicitada:
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                                        <p className="text-xs font-bold text-[var(--iica-navy)] dark:text-blue-300 uppercase tracking-wide mb-1">1. Acreditación de Persona Jurídica / RUT</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                            Certificado de vigencia, personería legal y cédula del representante legal.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                                        <p className="text-xs font-bold text-[var(--iica-navy)] dark:text-blue-300 uppercase tracking-wide mb-1">2. Formulación Técnica del Proyecto</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                            Objetivos, metodología, cronograma de actividades e indicadores de resultado.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                                        <p className="text-xs font-bold text-[var(--iica-navy)] dark:text-blue-300 uppercase tracking-wide mb-1">3. Presupuesto Detallado</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                            Cotizaciones formales y cálculo de gastos financiables vs cofinanciamiento.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                                        <p className="text-xs font-bold text-[var(--iica-navy)] dark:text-blue-300 uppercase tracking-wide mb-1">4. Acreditación de Tenencia o Dominio</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                            Título de dominio, contrato de arriendo inscrito o derechos de aguas según aplique.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA 3: Evaluación */}
                            <TabsContent value="evaluacion" className="p-5 sm:p-7 md:p-8 space-y-5 focus-visible:outline-none">
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-[var(--iica-navy)] dark:text-white flex items-center gap-2">
                                        <Scale className="h-5 w-5 text-indigo-500" />
                                        Evaluación y Criterios IICA
                                    </h3>
                                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        Criterios típicos de evaluación y estimación de complejidad técnica para orientar tu postulación:
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-center">
                                        <p className="text-xs font-bold text-gray-800 dark:text-white">Pertinencia y Enfoque</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alineación con la vocación productiva y sectorial.</p>
                                    </div>

                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-center">
                                        <p className="text-xs font-bold text-gray-800 dark:text-white">Viabilidad Económica</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coherencia de costos y cronograma de ejecución.</p>
                                    </div>

                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-center">
                                        <p className="text-xs font-bold text-gray-800 dark:text-white">Sostenibilidad e Impacto</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Eficiencia hídrica y ambiental en el predio.</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2.5">
                                    <ShieldCheck className="h-4 w-4 text-[var(--iica-blue)] shrink-0 mt-0.5" />
                                    <span>Esta evaluación técnica previa es de carácter orientador generada por el Radar IICA Chile y no sustituye la ponderación formal de las comisiones evaluadoras de {project.institucion}.</span>
                                </div>
                            </TabsContent>

                            {/* PESTAÑA 4: Bases y consultas */}
                            <TabsContent value="bases" className="p-5 sm:p-7 md:p-8 space-y-5 focus-visible:outline-none">
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-[var(--iica-navy)] dark:text-white flex items-center gap-2">
                                        <ExternalLink className="h-5 w-5 text-amber-500" />
                                        Bases Oficiales y Canales de Consulta
                                    </h3>
                                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        Consulte las bases oficiales, fechas de cierre, aclaraciones y canales de atención antes de enviar su postulación:
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-[var(--iica-navy)] dark:text-white text-sm">Repositorio oficial del concurso</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Acceso verificado a los formularios oficiales y anexos descargables en el portal de {project.institucion}.</p>
                                    </div>
                                    <LinkGuardianAnchor
                                        url={project.url_bases}
                                        projectName={project.nombre}
                                        institution={project.institucion}
                                        className="shrink-0 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-all"
                                    />
                                </div>
                            </TabsContent>

                            {/* Botones de Acción Fieles a la Captura: ¿Listo para postular? */}
                            <div id="bases" className="p-5 sm:p-7 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/40 dark:bg-gray-900/60">
                                <div>
                                    <h3 className="font-bold text-[var(--iica-navy)] dark:text-white text-sm sm:text-base">¿Listo para postular?</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Accede a las bases oficiales, redacta un borrador con IA o descarga la minuta.</p>
                                </div>

                                <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5">
                                    <ProposalGeneratorButton project={project} />
                                    <CalendarReminderButton project={project} />
                                    <PrintProjectButton />
                                    <LinkGuardianAnchor
                                        url={project.url_bases}
                                        projectName={project.nombre}
                                        institution={project.institucion}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-extrabold px-5 py-3 rounded-xl transition-all shadow-sm min-h-[44px] text-xs sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Legal and verification disclaimer */}
                            <div className="p-4 mx-5 sm:mx-7 mb-5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/80 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2.5">
                                <Info className="w-4 h-4 text-[var(--iica-blue)] shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">Verificado por IICA Chile: </span>
                                    La información expuesta proviene de fuentes públicas oficiales ({project.institucion}). Las evaluaciones y filtros entregados corresponden a una preevaluación previa. La decisión final de admisibilidad, evaluación y adjudicación es competencia exclusiva de la institución convocante según sus bases oficiales.
                                </div>
                            </div>

                        </Tabs>
                    </div>

                </article>

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
