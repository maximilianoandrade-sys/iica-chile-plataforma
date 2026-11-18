'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, CheckCircle, Clock, ChevronDown, ChevronUp, Shield, RefreshCw, Droplets, Sprout, FlaskConical, Factory, Globe, Wheat, Landmark, AlertTriangle, MapPin, Coins, type LucideIcon } from 'lucide-react';
import { InstitutionLogo } from '@/components/InstitutionLogo';


import { FUENTES, type FuenteOficial } from '@/data/fuentes';

const ICON_MAP: Record<string, LucideIcon> = {
    droplets: Droplets,
    sprout: Sprout,
    flask: FlaskConical,
    factory: Factory,
    globe: Globe,
    wheat: Wheat,
    landmark: Landmark,
};

interface FuentesOficialesProps {
  institutionCounts?: Record<string, number>;
  lastUpdatedAt?: string | null;
  totalActiveOpportunities?: number;
}

function formatLastUpdatedLabel(lastUpdatedAt?: string | null): string {
  if (!lastUpdatedAt) return 'Actualización no disponible';

  const date = new Date(lastUpdatedAt);
  if (Number.isNaN(date.getTime())) return 'Actualización no disponible';

  const now = new Date();
  const sameDay = now.toDateString() === date.toDateString();
  const time = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  if (sameDay) return `Actualizado hoy, ${time}`;

  const day = date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `Actualizado: ${day} ${time}`;
}

export default function FuentesOficiales({ institutionCounts = {}, lastUpdatedAt = null, totalActiveOpportunities }: FuentesOficialesProps) {
    const fuentesWithCounts = FUENTES.map(f => ({
        ...f,
        fondosActivos: institutionCounts[f.sigla] ?? f.fondosActivos,
    }));

    const totalFondos = fuentesWithCounts.reduce((sum, f) => sum + f.fondosActivos, 0);
    const totalOportunidadesActivas = totalActiveOpportunities ?? totalFondos;

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleActiveClick = () => {
        startTransition(() => {
            router.push('/?estado=Abierta#convocatorias');
        });
    };

    const activeFuentes = fuentesWithCounts.filter(f => f.fondosActivos > 0);
    const inactiveFuentes = fuentesWithCounts.filter(f => f.fondosActivos === 0);

    return (
        <section id="fuentes" aria-labelledby="fuentes-heading" className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto max-w-[1200px] px-4">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-[var(--iica-blue)] px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <Shield className="h-4 w-4" aria-hidden={true} />
                        Fuentes oficiales monitoreadas
                    </div>
                    <h2 id="fuentes-heading" className="text-3xl md:text-4xl font-extrabold text-[var(--iica-navy)] dark:text-white mb-3">
                        Fuentes monitoreadas para Chile
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
                        Reunimos oportunidades publicadas por estas instituciones y organismos oficiales.
                        Revise siempre las bases de la convocatoria antes de postular. La fecha indica la última actualización disponible del radar.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-2 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden={true} />
                            <span className="text-green-700 dark:text-green-300 font-bold">{activeFuentes.length} fuentes con fondos activos</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleActiveClick}
                            aria-label={`Filtrar y ver las ${totalOportunidadesActivas} oportunidades activas`}
                            className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-full min-h-[44px] cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:scale-105 transition-all"
                        >
                            <RefreshCw className={`h-4 w-4 text-blue-600 ${isPending ? 'animate-spin' : ''}`} aria-hidden={true} />
                            <span className="text-blue-700 dark:text-blue-300 font-bold">{totalOportunidadesActivas} oportunidades activas</span>
                        </button>
                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 px-4 py-2 rounded-full">
                            <Clock className="h-4 w-4 text-yellow-600" aria-hidden={true} />
                            <span className="text-yellow-700 dark:text-yellow-300 font-bold">{formatLastUpdatedLabel(lastUpdatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Active Sources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {activeFuentes.map((fuente, i) => {
                        const IconComponent = ICON_MAP[fuente.icon] || Globe;
                        const isExpanded = expandedId === fuente.id;
                        return (
                            <div
                                key={fuente.id}
                                className={`border rounded-2xl overflow-hidden transition-all animate-fade-in-up bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                {/* Card Header */}
                                <button
                                    id={`source-btn-${i}`}
                                    aria-expanded={isExpanded}
                                    aria-controls={`source-panel-${i}`}
                                    onClick={() => setExpandedId(isExpanded ? null : fuente.id)}
                                    className="w-full text-left p-5 flex items-start gap-4 min-h-[48px]"
                                >
                                    <InstitutionLogo nombre={fuente.sigla} size={32} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-xl font-extrabold text-[var(--iica-navy)] dark:text-white">{fuente.sigla}</span>
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">
                                                {fuente.fondosActivos} fondos activos
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fuente.nombre}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{fuente.descripcion}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-gray-400">
                                        {isExpanded ? <ChevronUp className="h-5 w-5" aria-hidden={true} /> : <ChevronDown className="h-5 w-5" aria-hidden={true} />}
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div
                                        id={`source-panel-${i}`}
                                        role="region"
                                        aria-labelledby={`source-btn-${i}`}
                                    >
                                        <div className="px-5 pb-5 border-t border-white/60 dark:border-gray-600 pt-4 space-y-4">
                                            {/* Tipos de Fondos */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Tipos de Fondos</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {fuente.tipoFondos.map(tipo => (
                                                        <span key={tipo} className="px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                                                            {tipo}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Beneficiarios */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">¿Quién puede postular?</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {fuente.beneficiarios.map(b => (
                                                        <span key={b} className="px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                                                            {b}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Monto y Región */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                        <Coins className="h-3 w-3" aria-hidden={true} /> Monto/Cofinanciamiento
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{fuente.montoRango}</p>
                                                </div>
                                                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" aria-hidden={true} /> Cobertura
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{fuente.regiones}</p>
                                                </div>
                                            </div>

                                            {/* CTA Buttons */}
                                            <div className="flex gap-3 pt-1">
                                                <a
                                                    href={fuente.urlConcursos}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] bg-white dark:bg-gray-800 border-2 ${fuente.color} ${fuente.darkColor} border-current hover:opacity-80`}
                                                >
                                                    <ExternalLink className="h-4 w-4" aria-hidden={true} />
                                                    Ver Convocatorias
                                                </a>
                                                <a
                                                    href={fuente.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 transition-all min-h-[48px] bg-white dark:bg-gray-800"
                                                >
                                                    Sitio Web
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Inactive Sources */}
                {inactiveFuentes.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-lg font-bold text-[var(--iica-navy)] dark:text-gray-300 mb-4 px-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                            Otras fuentes en monitoreo (0 fondos activos actualmente)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {inactiveFuentes.map((fuente) => (
                                <a 
                                    key={fuente.id}
                                    href={fuente.urlConcursos}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="opacity-60 grayscale">
                                        <InstitutionLogo nombre={fuente.sigla} size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 truncate">{fuente.sigla}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5 flex gap-4 items-start">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" aria-hidden={true} />
                    <div>
                        <p className="font-bold text-yellow-800 dark:text-yellow-200 mb-1">Importante sobre los plazos</p>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                            Las fechas de cierre y montos son referenciales y pueden cambiar sin previo aviso.
                            Siempre verifica directamente en el sitio oficial de la institución antes de postular.
                            Esta plataforma actualiza la información periódicamente pero no reemplaza la consulta oficial.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
