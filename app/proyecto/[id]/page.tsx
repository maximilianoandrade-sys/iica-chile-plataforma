import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProjects } from '@/lib/data';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Calendar, CheckCircle, Info, MapPin, Users, DollarSign } from 'lucide-react';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const projects = await getProjects();
    const project = projects.find(p => p.id === parseInt(id));

    if (!project) {
        return { title: 'Fondo no encontrado | IICA Chile' };
    }

    return {
        title: `${project.nombre} | IICA Chile`,
        description: `${project.institucion} · ${project.categoria} · Cierre: ${new Date(project.fecha_cierre).toLocaleDateString('es-CL')}. ${project.resumen?.observaciones || ''}`,
        openGraph: {
            title: project.nombre,
            description: `Fondo de ${project.institucion}. Monto: ${project.monto > 0 ? `$${(project.monto / 1000000).toFixed(0)}M` : 'Consultar'}. Cierre: ${new Date(project.fecha_cierre).toLocaleDateString('es-CL')}`,
        }
    };
}

export async function generateStaticParams() {
    const projects = await getProjects();
    return projects.map(p => ({ id: String(p.id) }));
}

export default async function ProyectoDetallePage({ params }: Props) {
    const { id } = await params;
    const projects = await getProjects();
    const project = projects.find(p => p.id === parseInt(id));

    if (!project) notFound();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closingDate = new Date(project.fecha_cierre);
    const isClosed = closingDate < today;
    const diffDays = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isUrgent = diffDays <= 7 && diffDays >= 0;

    const montoFormatted = project.monto > 0
        ? project.monto >= 1_000_000_000
            ? `$${(project.monto / 1_000_000_000).toFixed(1)} mil millones`
            : `$${(project.monto / 1_000_000).toFixed(0)} millones`
        : 'Consultar institución';

    return (
        <div className="min-h-screen flex flex-col bg-[#f4f7f9]">
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
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Header del fondo */}
                    <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] p-8 text-white">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                                {project.categoria}
                            </span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isClosed
                                    ? 'bg-red-500/20 border-red-300/30 text-red-100'
                                    : isUrgent
                                        ? 'bg-amber-500/20 border-amber-300/30 text-amber-100'
                                        : 'bg-green-500/20 border-green-300/30 text-green-100'
                                }`}>
                                {isClosed ? '🔴 Cerrado' : isUrgent ? `⚠️ Cierra en ${diffDays} días` : '🟢 Abierto'}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">
                            {project.nombre}
                        </h1>
                        <p className="text-blue-100 font-semibold text-lg">{project.institucion}</p>
                    </div>

                    {/* Métricas clave */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 border-b border-gray-100">
                        <div className="p-5 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <DollarSign className="h-3.5 w-3.5" /> Monto Máximo
                            </div>
                            <div className="font-extrabold text-[var(--iica-navy)] text-lg leading-tight">{montoFormatted}</div>
                        </div>
                        <div className="p-5 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <Calendar className="h-3.5 w-3.5" /> Fecha Cierre
                            </div>
                            <div className={`font-extrabold text-lg leading-tight ${isClosed ? 'text-red-500' : isUrgent ? 'text-amber-600' : 'text-[var(--iica-navy)]'}`}>
                                {closingDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                        <div className="p-5 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <MapPin className="h-3.5 w-3.5" /> Regiones
                            </div>
                            <div className="font-bold text-gray-700 text-sm">
                                {project.regiones?.includes('Todas') ? 'Todo Chile' : project.regiones?.slice(0, 2).join(', ')}
                                {project.regiones && !project.regiones.includes('Todas') && project.regiones.length > 2 && ` +${project.regiones.length - 2}`}
                            </div>
                        </div>
                        <div className="p-5 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <Users className="h-3.5 w-3.5" /> Beneficiarios
                            </div>
                            <div className="font-bold text-gray-700 text-sm">
                                {project.beneficiarios?.slice(0, 2).join(', ')}
                                {project.beneficiarios && project.beneficiarios.length > 2 && ` +${project.beneficiarios.length - 2}`}
                            </div>
                        </div>
                    </div>

                    {/* Contenido detallado */}
                    <div className="p-6 md:p-8 space-y-8">

                        {/* Cofinanciamiento */}
                        {project.resumen?.cofinanciamiento && (
                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                <h2 className="font-bold text-[var(--iica-navy)] mb-2 flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-[var(--iica-blue)]" />
                                    Cofinanciamiento
                                </h2>
                                <p className="text-gray-700 font-medium">{project.resumen.cofinanciamiento}</p>
                            </div>
                        )}

                        {/* Checklist de elegibilidad */}
                        {project.checklist && project.checklist.length > 0 && (
                            <div>
                                <h2 className="font-bold text-[var(--iica-navy)] mb-4 flex items-center gap-2 text-lg">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    Checklist de Elegibilidad
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {project.checklist.map((item: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 bg-green-50 rounded-lg p-3 border border-green-100">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Requisitos clave */}
                        {project.resumen?.requisitos_clave && project.resumen.requisitos_clave.length > 0 && (
                            <div>
                                <h2 className="font-bold text-[var(--iica-navy)] mb-4 flex items-center gap-2 text-lg">
                                    <Info className="h-5 w-5 text-[var(--iica-blue)]" />
                                    Requisitos Clave
                                </h2>
                                <ul className="space-y-2">
                                    {project.resumen.requisitos_clave.map((req: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                                            <span className="w-6 h-6 rounded-full bg-[var(--iica-blue)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Plazo y observaciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.resumen?.plazo_ejecucion && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h3 className="font-bold text-gray-700 mb-1 text-sm">⏱️ Plazo de Ejecución</h3>
                                    <p className="text-gray-600">{project.resumen.plazo_ejecucion}</p>
                                </div>
                            )}
                            {project.resumen?.observaciones && (
                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                    <h3 className="font-bold text-gray-700 mb-1 text-sm">ℹ️ Observaciones</h3>
                                    <p className="text-gray-600 text-sm">{project.resumen.observaciones}</p>
                                </div>
                            )}
                        </div>

                        {/* Regiones completas */}
                        {project.regiones && !project.regiones.includes('Todas') && project.regiones.length > 0 && (
                            <div>
                                <h2 className="font-bold text-[var(--iica-navy)] mb-3 text-lg">📍 Regiones Elegibles</h2>
                                <div className="flex flex-wrap gap-2">
                                    {project.regiones.map((region: string) => (
                                        <span key={region} className="px-3 py-1 bg-blue-50 text-[var(--iica-navy)] text-sm font-medium rounded-full border border-blue-100">
                                            {region}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Beneficiarios completos */}
                        {project.beneficiarios && project.beneficiarios.length > 0 && (
                            <div>
                                <h2 className="font-bold text-[var(--iica-navy)] mb-3 text-lg">👥 Beneficiarios Elegibles</h2>
                                <div className="flex flex-wrap gap-2">
                                    {project.beneficiarios.map((ben: string) => (
                                        <span key={ben} className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-100">
                                            {ben}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA Principal */}
                        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="text-sm text-gray-500">
                                ⚠️ Verifica siempre las fechas y requisitos en el sitio oficial antes de postular.
                            </div>
                            {!isClosed && (
                                <a
                                    href={project.url_bases}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[var(--iica-secondary)] hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl min-h-[52px] text-base"
                                >
                                    Ver Bases Oficiales
                                    <ExternalLink className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
