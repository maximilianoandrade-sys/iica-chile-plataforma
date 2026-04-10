'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, CheckCircle, Clock, MapPin, ChevronDown, ChevronUp, Shield, RefreshCw } from 'lucide-react';

interface FuenteOficial {
    id: string;
    nombre: string;
    sigla: string;
    descripcion: string;
    url: string;
    urlConcursos: string;
    color: string;
    bgColor: string;
    emoji: string;
    tipoFondos: string[];
    beneficiarios: string[];
    montoRango: string;
    verificado: boolean;
    ultimaVerificacion: string;
    fondosActivos: number;
    regiones: string;
}

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
        emoji: '💧',
        tipoFondos: ['Tecnificación del riego', 'Obras hidráulicas', 'Drenaje', 'Embalses de acumulación'],
        beneficiarios: ['Pequeño Agricultor', 'Mediano Agricultor', 'Organizaciones de Usuarios de Agua'],
        montoRango: 'Hasta 90% del costo del proyecto',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
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
        emoji: '🌱',
        tipoFondos: ['SIRSD-S (Suelos)', 'PRODESAL (Asistencia Técnica)', 'SAT', 'Créditos de Enlace', 'Bono Mujer Rural'],
        beneficiarios: ['Pequeño Agricultor', 'Agricultor Familiar Campesino', 'Mujer Rural', 'Usuario INDAP'],
        montoRango: 'Desde $0 (asistencia técnica) hasta $50M (créditos)',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
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
        emoji: '🔬',
        tipoFondos: ['Proyectos de Innovación', 'Jóvenes Innovadores', 'Agricultura Sustentable', 'Cambio Climático'],
        beneficiarios: ['Empresa Agrícola', 'Startup AgTech', 'Universidad', 'Centro de Investigación', 'Jóvenes 18-35 años'],
        montoRango: 'Hasta $80M por proyecto (80% cofinanciamiento)',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
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
        emoji: '🏭',
        tipoFondos: ['Activa Inversión Agro', 'Economía Circular', 'Escalamiento Productivo', 'Eficiencia Energética'],
        beneficiarios: ['PYME Agrícola', 'Empresa Mediana', 'Cooperativa Exportadora', 'Agroindustria'],
        montoRango: 'Hasta $100M (50-70% cofinanciamiento)',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
        fondosActivos: 4,
        regiones: 'Nacional'
    },
    {
        id: 'sercotec',
        nombre: 'Servicio de Cooperación Técnica',
        sigla: 'Sercotec',
        descripcion: 'Portal de fondos para micro y pequeñas empresas agrícolas. Capital Semilla, Capital Abeja (mujeres) y Fondo de Desarrollo de Negocios.',
        url: 'https://www.sercotec.cl',
        urlConcursos: 'https://www.sercotec.cl/fondos-concursables/',
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
        emoji: '🌻',
        tipoFondos: ['Capital Semilla Emprende', 'Capital Abeja (Mujeres)', 'Fondo de Desarrollo', 'Asociatividad Empresarial'],
        beneficiarios: ['Microempresa', 'Emprendedor', 'Mujer Emprendedora', 'Cooperativa Agrícola'],
        montoRango: 'Desde $3,5M hasta $15M (subsidio no reembolsable)',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
        fondosActivos: 4,
        regiones: 'Nacional (con oficinas regionales)'
    },
    {
        id: 'gore',
        nombre: 'Gobiernos Regionales (GOREs)',
        sigla: 'GOREs',
        descripcion: 'Cada región publica fondos FIC-R específicos para problemas locales. Coquimbo (riego), Maule (vitivinicultura), Araucanía (pueblos originarios), Los Lagos (acuicultura).',
        url: 'https://www.subdere.gov.cl/gore',
        urlConcursos: 'https://www.subdere.gov.cl/gore',
        color: 'text-teal-700',
        bgColor: 'bg-teal-50 border-teal-200',
        emoji: '🗺️',
        tipoFondos: ['FIC-R Innovación Regional', 'Fondos Sectoriales Regionales', 'Desarrollo Local', 'Pueblos Originarios'],
        beneficiarios: ['Empresa Regional', 'Cooperativa Local', 'Universidad Regional', 'Comunidad Indígena'],
        montoRango: 'Hasta $120M por proyecto (según región)',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
        fondosActivos: 5,
        regiones: 'Específico por región (Coquimbo, Maule, Araucanía, Biobío, Los Lagos, Valparaíso)'
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
        emoji: '🇺🇳',
        tipoFondos: ['Medio Ambiente (GEF)', 'Energía Sostenible', 'Género', 'Innovación Social'],
        beneficiarios: ['ONGs', 'Comunidades', 'Instituciones Públicas'],
        montoRango: 'Variable según convocatoria internacional',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
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
        emoji: '🌾',
        tipoFondos: ['Seguridad Alimentaria', 'Agricultura Familiar', 'Pesca y Acuicultura'],
        beneficiarios: ['Gobiernos', 'Organizaciones de la Sociedad Civil'],
        montoRango: 'Consultorías y Proyectos Específicos',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
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
        emoji: '🏦',
        tipoFondos: ['Desarrollo Rural', 'Inclusión Financiera', 'Cambio Climático'],
        beneficiarios: ['Pequeños Productores', 'Pueblos Indígenas'],
        montoRango: 'Grandes inversiones programáticas',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
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
        emoji: '🌎',
        tipoFondos: ['Innovación Tecnológica', 'Adaptación Cambio Climático'],
        beneficiarios: ['Institutos de Investigación (INIA)', 'Universidades'],
        montoRango: 'Hasta $200.000 USD por proyecto',
        verificado: true,
        ultimaVerificacion: '18 Feb 2026',
        fondosActivos: 0,
        regiones: 'Países miembros (incluye Chile)'
    }
];

const GORES_DETALLE = [
    { region: 'Coquimbo', foco: 'Riego eficiente y fruticultura', url: 'https://www.gorecoquimbo.cl/fondo-de-innovacion-para-la-competitividad/', monto: '$100M' },
    { region: 'Valparaíso', foco: 'Vitivinicultura y exportación', url: 'https://www.gorevalparaiso.cl/fondos-concursables/', monto: '$70M' },
    { region: 'Maule', foco: 'Agricultura y ganadería', url: 'https://www.goremaule.cl/gore/fondos-concursables/', monto: '$80M' },
    { region: 'Biobío', foco: 'Forestal y biomasa', url: 'https://www.gorebio.cl/fondos-concursables/', monto: '$90M' },
    { region: 'La Araucanía', foco: 'Agricultura mapuche y pueblos originarios', url: 'https://www.gorearaucania.cl/fondos-concursables/', monto: '$60M' },
    { region: 'Los Lagos', foco: 'Acuicultura y pesca artesanal', url: 'https://www.goreloslagos.cl/fondos-concursables/', monto: '$120M' },
];

export default function FuentesOficiales() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showGores, setShowGores] = useState(false);

    const totalFondos = FUENTES.reduce((sum, f) => sum + f.fondosActivos, 0);

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto max-w-[1200px] px-4">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-[var(--iica-blue)] px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <Shield className="h-4 w-4" />
                        Fuentes Verificadas
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--iica-navy)] mb-3">
                        🔗 Fuentes Oficiales de Fondos Chile 2026
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                        Todos los fondos de esta plataforma provienen directamente de estas instituciones gubernamentales.
                        Links verificados y actualizados al <strong>18 de febrero de 2026</strong>.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 font-bold">{FUENTES.length} fuentes verificadas</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-700 font-bold">{totalFondos} fondos activos</span>
                        </div>
                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-yellow-700 font-bold">Actualizado: 18 Feb 2026</span>
                        </div>
                    </div>
                </div>

                {/* Sources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {FUENTES.map((fuente, i) => (
                        <motion.div
                            key={fuente.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className={`border-2 rounded-2xl overflow-hidden transition-all ${fuente.bgColor} ${expandedId === fuente.id ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                        >
                            {/* Card Header */}
                            <button
                                onClick={() => setExpandedId(expandedId === fuente.id ? null : fuente.id)}
                                className="w-full text-left p-5 flex items-start gap-4"
                            >
                                <div className="text-4xl flex-shrink-0">{fuente.emoji}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className={`text-xl font-extrabold ${fuente.color}`}>{fuente.sigla}</span>
                                        {fuente.verificado && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                                                <CheckCircle className="h-3 w-3" /> Verificado
                                            </span>
                                        )}
                                        <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                            {fuente.fondosActivos} fondos activos
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">{fuente.nombre}</p>
                                    <p className="text-xs text-gray-500 line-clamp-2">{fuente.descripcion}</p>
                                </div>
                                <div className="flex-shrink-0 text-gray-400">
                                    {expandedId === fuente.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {expandedId === fuente.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
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
                                                            👤 {b}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Monto y Región */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                    <p className="text-xs font-bold text-gray-500 mb-1">💰 Monto/Cofinanciamiento</p>
                                                    <p className="text-sm font-bold text-gray-800">{fuente.montoRango}</p>
                                                </div>
                                                <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                    <p className="text-xs font-bold text-gray-500 mb-1">📍 Cobertura</p>
                                                    <p className="text-sm font-bold text-gray-800">{fuente.regiones}</p>
                                                </div>
                                            </div>

                                            {/* GOREs Detalle */}
                                            {fuente.id === 'gore' && (
                                                <div>
                                                    <button
                                                        onClick={() => setShowGores(!showGores)}
                                                        className="text-xs font-bold text-teal-700 underline mb-2 flex items-center gap-1"
                                                    >
                                                        {showGores ? '▲' : '▼'} Ver GOREs con fondos activos
                                                    </button>
                                                    <AnimatePresence>
                                                        {showGores && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {GORES_DETALLE.map(gore => (
                                                                        <a
                                                                            key={gore.region}
                                                                            href={gore.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center justify-between bg-white rounded-xl p-3 border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all group"
                                                                        >
                                                                            <div>
                                                                                <p className="text-xs font-bold text-teal-700">{gore.region}</p>
                                                                                <p className="text-xs text-gray-500">{gore.foco}</p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="text-xs font-bold text-green-600">{gore.monto}</p>
                                                                                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-teal-600 ml-auto mt-0.5" />
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}

                                            {/* CTA Buttons */}
                                            <div className="flex gap-3 pt-1">
                                                <a
                                                    href={fuente.urlConcursos}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] bg-white border-2 ${fuente.color} border-current hover:opacity-80`}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex gap-4 items-start">
                    <div className="text-2xl flex-shrink-0">⚠️</div>
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
