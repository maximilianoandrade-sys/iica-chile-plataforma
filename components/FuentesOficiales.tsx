'use client';

import { useState } from 'react';
import { ExternalLink, CheckCircle, Clock, ChevronDown, ChevronUp, Shield, RefreshCw, Droplets, Sprout, FlaskConical, Factory, Globe, Wheat, Landmark, AlertTriangle, MapPin, Coins, type LucideIcon } from 'lucide-react';
import projectData from '@/data/projects.json';

// Compute fondosActivos dynamically from actual project data
const countByInst: Record<string, number> = {};
(projectData as Array<{ institucion: string }>).forEach(p => {
    countByInst[p.institucion] = (countByInst[p.institucion] || 0) + 1;
});

function getFondosActivos(sigla: string): number {
    return countByInst[sigla] || 0;
}

interface FuenteOficial {
    id: string;
    nombre: string;
    sigla: string;
    descripcion: string;
    url: string;
    urlConcursos: string;
    color: string;
    bgColor: string;
    icon: string;
    tipoFondos: string[];
    beneficiarios: string[];
    montoRango: string;
    verificado: boolean;
    ultimaVerificacion: string;
    fondosActivos: number;
    regiones: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
    droplets: Droplets,
    sprout: Sprout,
    flask: FlaskConical,
    factory: Factory,
    globe: Globe,
    wheat: Wheat,
    landmark: Landmark,
};

const FUENTES: FuenteOficial[] = [
    {
        id: 'cnr',
        nombre: 'Comisión Nacional de Riego',
        sigla: 'CNR',
        descripcion: 'Principal fuente de subsidios para proyectos de tecnificación del riego y obras hidráulicas. Administra la Ley 18.450 con múltiples llamados anuales.',
        url: 'https://www.cnr.gob.cl',
        urlConcursos: 'https://www.cnr.gob.cl/agricultores/concursos-de-riego/',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: 'droplets',
        tipoFondos: ['Tecnificación del riego', 'Obras hidráulicas', 'Drenaje', 'Embalses de acumulación'],
        beneficiarios: ['Pequeño Agricultor', 'Mediano Agricultor', 'Organizaciones de Usuarios de Agua'],
        montoRango: 'Hasta 90% del costo del proyecto',
        verificado: true,
        ultimaVerificacion: '11 May 2026',
        fondosActivos: 4,
        regiones: 'Nacional (con llamados regionales)'
    },
    {
        id: 'indap',
        nombre: 'Instituto de Desarrollo Agropecuario',
        sigla: 'INDAP',
        descripcion: 'Institución clave para la Agricultura Familiar Campesina (AFC). Ofrece bonos, créditos, asistencia técnica y programas de suelos para pequeños agricultores.',
        url: 'https://www.indap.gob.cl',
        urlConcursos: 'https://www.indap.gob.cl/programas',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
        icon: 'sprout',
        tipoFondos: ['SIRSD-S (Suelos)', 'PRODESAL (Asistencia Técnica)', 'SAT', 'Créditos de Enlace', 'Bono Mujer Rural'],
        beneficiarios: ['Pequeño Agricultor', 'Agricultor Familiar Campesino', 'Mujer Rural', 'Usuario INDAP'],
        montoRango: 'Desde $0 (asistencia técnica) hasta $50M (créditos)',
        verificado: true,
        ultimaVerificacion: '11 May 2026',
        fondosActivos: 6,
        regiones: 'Nacional (todas las regiones)'
    },
    {
        id: 'fia',
        nombre: 'Fundación para la Innovación Agraria',
        sigla: 'FIA',
        descripcion: 'Financia proyectos de innovación agrícola, AgTech, sostenibilidad y nuevos cultivos. Ideal para emprendedores y empresas que buscan diferenciarse con tecnología.',
        url: 'https://www.fia.cl',
        urlConcursos: 'https://www.fia.cl/convocatorias/',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50 border-purple-200',
        icon: 'flask',
        tipoFondos: ['Proyectos de Innovación', 'Jóvenes Innovadores', 'Agricultura Sustentable', 'Cambio Climático'],
        beneficiarios: ['Empresa Agrícola', 'Startup AgTech', 'Universidad', 'Centro de Investigación', 'Jóvenes 18-35 años'],
        montoRango: 'Hasta $80M por proyecto (80% cofinanciamiento)',
        verificado: true,
        ultimaVerificacion: '11 May 2026',
        fondosActivos: 3,
        regiones: 'Nacional'
    },
    {
        id: 'corfo',
        nombre: 'Corporación de Fomento de la Producción',
        sigla: 'CORFO',
        descripcion: 'Fondos de escalamiento productivo, economía circular, eficiencia energética y exportación. Para empresas medianas y grandes que buscan crecer.',
        url: 'https://www.corfo.cl',
        urlConcursos: 'https://www.corfo.cl/sites/cpp/programas-y-convocatorias',
        color: 'text-orange-700',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: 'factory',
        tipoFondos: ['Activa Inversión Agro', 'Economía Circular', 'Escalamiento Productivo', 'Eficiencia Energética'],
        beneficiarios: ['PYME Agrícola', 'Empresa Mediana', 'Cooperativa Exportadora', 'Agroindustria'],
        montoRango: 'Hasta $100M (50-70% cofinanciamiento)',
        verificado: true,
        ultimaVerificacion: '11 May 2026',
        fondosActivos: 4,
        regiones: 'Nacional'
    },

    {
        id: 'pnud',
        nombre: 'Programa de las Naciones Unidas para el Desarrollo',
        sigla: 'PNUD',
        descripcion: 'Apoya proyectos de desarrollo sostenible, medio ambiente y energía. Gestiona fondos internacionales de alto impacto.',
        url: 'https://www.undp.org/es/chile',
        urlConcursos: 'https://www.undp.org/es/chile/participa',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: 'globe',
        tipoFondos: ['Medio Ambiente (GEF)', 'Energía Sostenible', 'Género', 'Innovación Social'],
        beneficiarios: ['ONGs', 'Comunidades', 'Instituciones Públicas'],
        montoRango: 'Variable según convocatoria internacional',
        verificado: true,
        ultimaVerificacion: '11 May 2026',
        fondosActivos: 0,
        regiones: 'Nacional e Internacional'
    },
    {
        id: 'fao',
        nombre: 'Organización de las Naciones Unidas para la Alimentación y la Agricultura',
        sigla: 'FAO',
        descripcion: 'Lidera el esfuerzo internacional para poner fin al hambre. Ofrece cooperación técnica y fondos para sistemas alimentarios.',
        url: 'https://www.fao.org/chile',
        urlConcursos: 'https://www.fao.org/employment/vacancies/consultants/es/',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50 border-cyan-200',
        icon: 'wheat',
        tipoFondos: ['Seguridad Alimentaria', 'Agricultura Familiar', 'Pesca y Acuicultura'],
        beneficiarios: ['Gobiernos', 'Organizaciones de la Sociedad Civil'],
        montoRango: 'Consultorías y Proyectos Específicos',
        verificado: true,
        ultimaVerificacion: '11 May 2026',
        fondosActivos: 0,
        regiones: 'Latinoamérica y el Caribe'
    },
    {
        id: 'fida',
        nombre: 'Fondo Internacional de Desarrollo Agrícola',
        sigla: 'FIDA',
        descripcion: 'Invierte en la población rural para empoderarla y aumentar su seguridad alimentaria. Financia grandes programas nacionales.',
        url: 'https://www.ifad.org/es/',
        urlConcursos: 'https://www.ifad.org/es/calls-for-proposals',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        icon: 'landmark',
        tipoFondos: ['Desarrollo Rural', 'Inclusión Financiera', 'Cambio Climático'],
        beneficiarios: ['Pequeños Productores', 'Pueblos Indígenas'],
        montoRango: 'Grandes inversiones programáticas',
        verificado: true,
        ultimaVerificacion: '11 May 2026',
        fondosActivos: 0,
        regiones: 'Nacional (vía INDAP/Ministerios)'
    },
    {
        id: 'fontagro',
        nombre: 'Fondo Regional de Tecnología Agropecuaria',
        sigla: 'FONTAGRO',
        descripcion: 'Mecanismo de cooperación técnica para la innovación de la agricultura familiar. Convocatorias anuales para consorcios.',
        url: 'https://www.fontagro.org',
        urlConcursos: 'https://www.fontagro.org/es/convocatorias/',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50 border-amber-200',
        icon: 'globe',
        tipoFondos: ['Innovación Tecnológica', 'Adaptación Cambio Climático'],
        beneficiarios: ['Institutos de Investigación (INIA)', 'Universidades'],
        montoRango: 'Hasta $200.000 USD por proyecto',
        verificado: true,
        ultimaVerificacion: '11 May 2026',
        fondosActivos: 0,
        regiones: 'Países miembros (incluye Chile)'
    }
];

// Patch fondosActivos with real counts from projects.json
FUENTES.forEach(f => {
    f.fondosActivos = getFondosActivos(f.sigla);
});

export default function FuentesOficiales() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const totalFondos = FUENTES.reduce((sum, f) => sum + f.fondosActivos, 0);

    return (
        <section id="fuentes" aria-labelledby="fuentes-heading" className="py-16 bg-white">
            <div className="container mx-auto max-w-[1200px] px-4">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-[var(--iica-blue)] px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <Shield className="h-4 w-4" aria-hidden={true} />
                        Fuentes Verificadas
                    </div>
                    <h2 id="fuentes-heading" className="text-3xl md:text-4xl font-extrabold text-[var(--iica-navy)] mb-3">
                        Fuentes Oficiales de Fondos Chile 2026
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                        Todos los fondos de esta plataforma provienen directamente de estas instituciones gubernamentales.
                        Links verificados y actualizados al <strong>11 de mayo de 2026</strong>.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden={true} />
                            <span className="text-green-700 font-bold">{FUENTES.length} fuentes verificadas</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">
                            <RefreshCw className="h-4 w-4 text-blue-600" aria-hidden={true} />
                            <span className="text-blue-700 font-bold">{totalFondos} fondos activos</span>
                        </div>
                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full">
                            <Clock className="h-4 w-4 text-yellow-600" aria-hidden={true} />
                            <span className="text-yellow-700 font-bold">Actualizado: 11 May 2026</span>
                        </div>
                    </div>
                </div>

                {/* Sources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {FUENTES.map((fuente, i) => {
                        const IconComponent = ICON_MAP[fuente.icon] || Globe;
                        const isExpanded = expandedId === fuente.id;
                        return (
                            <div
                                key={fuente.id}
                                className={`border-2 rounded-2xl overflow-hidden transition-all animate-fade-in-up ${fuente.bgColor} ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
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
                                    <IconComponent className={`h-8 w-8 flex-shrink-0 ${fuente.color}`} aria-hidden={true} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className={`text-xl font-extrabold ${fuente.color}`}>{fuente.sigla}</span>
                                            <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                                {fuente.fondosActivos} fondos activos
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">{fuente.nombre}</p>
                                        <p className="text-xs text-gray-500 line-clamp-2">{fuente.descripcion}</p>
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
                                        <div className="px-5 pb-5 border-t border-white/60 pt-4 space-y-4">
                                            {/* Tipos de Fondos */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Tipos de Fondos</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {fuente.tipoFondos.map(tipo => (
                                                        <span key={tipo} className="px-2.5 py-1 bg-white text-gray-700 text-xs font-medium rounded-full border border-gray-200 shadow-sm">
                                                            {tipo}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Beneficiarios */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">¿Quién puede postular?</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {fuente.beneficiarios.map(b => (
                                                        <span key={b} className="px-2.5 py-1 bg-white text-gray-700 text-xs font-medium rounded-full border border-gray-200 shadow-sm">
                                                            {b}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Monto y Región */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                    <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                                                        <Coins className="h-3 w-3" aria-hidden={true} /> Monto/Cofinanciamiento
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800">{fuente.montoRango}</p>
                                                </div>
                                                <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                    <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" aria-hidden={true} /> Cobertura
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800">{fuente.regiones}</p>
                                                </div>
                                            </div>

                                            {/* CTA Buttons */}
                                            <div className="flex gap-3 pt-1">
                                                <a
                                                    href={fuente.urlConcursos}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] bg-white border-2 ${fuente.color} border-current hover:opacity-80`}
                                                >
                                                    <ExternalLink className="h-4 w-4" aria-hidden={true} />
                                                    Ver Convocatorias
                                                </a>
                                                <a
                                                    href={fuente.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-gray-600 border-2 border-gray-200 hover:border-gray-400 transition-all min-h-[48px] bg-white"
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

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex gap-4 items-start">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" aria-hidden={true} />
                    <div>
                        <p className="font-bold text-yellow-800 mb-1">Importante sobre los plazos</p>
                        <p className="text-yellow-700 text-sm">
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
