'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, MessageCircle, Phone, Award, CheckCircle, Clock, TrendingUp, Users, Filter, ChevronDown } from 'lucide-react';

const CONSULTORES = [
    {
        id: 1,
        name: "María González",
        specialty: "Riego y Drenaje",
        region: "Maule",
        rating: 4.9,
        reviews: 24,
        proyectosGanados: 18,
        montoGestionado: "$145M",
        disponible: true,
        tiempoRespuesta: "< 2 horas",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fm=jpg&q=60&w=200",
        tags: ["CNR", "INDAP", "Tecnificación"],
        fondosEspecialidad: ["Riego Tecnificado", "Eficiencia Hídrica", "SIRSD-S"],
        descripcion: "Ingeniera Agrónoma con 12 años de experiencia en proyectos de riego. Ha gestionado más de 18 proyectos exitosos en la región del Maule.",
        verificado: true,
        precio: "Desde $80.000/hr"
    },
    {
        id: 2,
        name: "Carlos Tapia",
        specialty: "Suelos Degradados",
        region: "Araucanía",
        rating: 4.7,
        reviews: 18,
        proyectosGanados: 12,
        montoGestionado: "$89M",
        disponible: true,
        tiempoRespuesta: "< 4 horas",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fm=jpg&q=60&w=200",
        tags: ["SIRSD-S", "Manejo de Suelos", "INDAP"],
        fondosEspecialidad: ["SIRSD-S", "Recuperación de Suelos", "PRODESAL"],
        descripcion: "Especialista en recuperación de suelos degradados y manejo sustentable. Trabaja principalmente con pequeños agricultores de la Araucanía.",
        verificado: true,
        precio: "Desde $70.000/hr"
    },
    {
        id: 3,
        name: "Ana Pizarro",
        specialty: "Innovación Agrícola",
        region: "O'Higgins",
        rating: 5.0,
        reviews: 12,
        proyectosGanados: 9,
        montoGestionado: "$210M",
        disponible: false,
        tiempoRespuesta: "1-2 días",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?fm=jpg&q=60&w=200",
        tags: ["FIA", "Startups", "Corfo"],
        fondosEspecialidad: ["FIA Innovación", "CORFO Capital", "Startup Chile"],
        descripcion: "MBA y Agrónoma especializada en proyectos de innovación y tecnología agrícola. Ha trabajado con FIA y CORFO en más de 9 proyectos.",
        verificado: true,
        precio: "Desde $120.000/hr"
    },
    {
        id: 4,
        name: "Roberto Méndez",
        specialty: "Gestión Hídrica",
        region: "Coquimbo",
        rating: 4.8,
        reviews: 30,
        proyectosGanados: 25,
        montoGestionado: "$320M",
        disponible: true,
        tiempoRespuesta: "< 1 hora",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=200",
        tags: ["CNR", "Eficiencia", "Pequeña Agricultura"],
        fondosEspecialidad: ["CNR Riego", "Gestión Hídrica", "Pozos Profundos"],
        descripcion: "Ingeniero Civil Hidráulico con 20 años de experiencia. Especialista en zonas áridas y semiáridas. El consultor más solicitado en Coquimbo.",
        verificado: true,
        precio: "Desde $100.000/hr"
    },
    {
        id: 5,
        name: "Valentina Rojas",
        specialty: "Mujeres Rurales",
        region: "Biobío",
        rating: 4.9,
        reviews: 15,
        proyectosGanados: 11,
        montoGestionado: "$67M",
        disponible: true,
        tiempoRespuesta: "< 3 horas",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=200",
        tags: ["INDAP", "Mujeres", "Cooperativas"],
        fondosEspecialidad: ["PRODESAL Mujer", "Cooperativas", "Economía Social"],
        descripcion: "Trabajadora Social y Gestora de Proyectos especializada en fondos para mujeres rurales y cooperativas. Enfoque en inclusión y equidad.",
        verificado: true,
        precio: "Desde $65.000/hr"
    },
    {
        id: 6,
        name: "Diego Fuentes",
        specialty: "Exportación Agrícola",
        region: "Metropolitana",
        rating: 4.6,
        reviews: 22,
        proyectosGanados: 16,
        montoGestionado: "$450M",
        disponible: true,
        tiempoRespuesta: "< 2 horas",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=jpg&q=60&w=200",
        tags: ["CORFO", "ProChile", "Exportación"],
        fondosEspecialidad: ["CORFO Exporta", "ProChile", "Internacionalización"],
        descripcion: "Economista Agrario con MBA Internacional. Especialista en fondos de exportación y acceso a mercados internacionales para productores chilenos.",
        verificado: false,
        precio: "Desde $150.000/hr"
    },
];

const FILTROS_ESPECIALIDAD = ['Todos', 'Riego', 'Suelos', 'Innovación', 'Exportación', 'Mujeres'];
const FILTROS_REGION = ['Todas', 'Maule', 'Araucanía', "O'Higgins", 'Coquimbo', 'Biobío', 'Metropolitana'];

export default function ConsultoresPage() {
    const [filterEsp, setFilterEsp] = useState('Todos');
    const [filterRegion, setFilterRegion] = useState('Todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const filtered = CONSULTORES.filter(c => {
        const matchEsp = filterEsp === 'Todos' || c.specialty.toLowerCase().includes(filterEsp.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(filterEsp.toLowerCase()));
        const matchRegion = filterRegion === 'Todas' || c.region === filterRegion;
        const matchSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.specialty.toLowerCase().includes(searchTerm.toLowerCase()) || c.region.toLowerCase().includes(searchTerm.toLowerCase());
        return matchEsp && matchRegion && matchSearch;
    });

    return (
        <div className="min-h-screen bg-[#f4f7f9] pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] text-white pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <Link href="/" className="text-blue-200 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
                        ← Volver al Inicio
                    </Link>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-sm font-medium text-blue-100 mb-4">
                                <Award className="h-4 w-4 text-[var(--iica-yellow)]" />
                                Validados por IICA Chile
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
                                Directorio de Formuladores
                            </h1>
                            <p className="text-blue-100 text-lg max-w-xl">
                                Expertos certificados que te ayudan a postular y ganar fondos. No pierdas una oportunidad por falta de apoyo técnico.
                            </p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                            <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-[var(--iica-yellow)]">{CONSULTORES.length}</p>
                                <p className="text-blue-200 text-xs">Consultores</p>
                            </div>
                            <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-green-400">73%</p>
                                <p className="text-blue-200 text-xs">Tasa Éxito</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-8">
                {/* Search & Filters Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, especialidad o región..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent outline-none text-gray-700 min-h-[48px]"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:border-[var(--iica-blue)] hover:text-[var(--iica-blue)] transition-colors font-medium min-h-[48px]"
                        >
                            <Filter className="h-4 w-4" />
                            Filtros
                            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-4">
                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-2">Especialidad:</p>
                                <div className="flex flex-wrap gap-2">
                                    {FILTROS_ESPECIALIDAD.map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilterEsp(f)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] ${filterEsp === f
                                                ? 'bg-[var(--iica-navy)] text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-2">Región:</p>
                                <div className="flex flex-wrap gap-2">
                                    {FILTROS_REGION.map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setFilterRegion(r)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] ${filterRegion === r
                                                ? 'bg-[var(--iica-blue)] text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results count */}
                <p className="text-sm text-gray-500 mb-4">
                    Mostrando <strong className="text-[var(--iica-navy)]">{filtered.length}</strong> de {CONSULTORES.length} consultores
                </p>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((consultor, i) => (
                        <motion.div
                            key={consultor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
                        >
                            {/* Card Header */}
                            <div className="relative h-20 bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)]">
                                {consultor.disponible ? (
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                        Disponible
                                    </div>
                                ) : (
                                    <div className="absolute top-3 right-3 bg-gray-400 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        Ocupado
                                    </div>
                                )}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                                    <div className="relative w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-md">
                                        <Image
                                            src={consultor.image}
                                            alt={consultor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {consultor.verificado && (
                                        <div className="absolute -bottom-1 -right-1 bg-[var(--iica-blue)] rounded-full p-0.5">
                                            <CheckCircle className="h-4 w-4 text-white fill-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="pt-12 pb-5 px-5 text-center">
                                <h3 className="font-bold text-lg text-gray-800">{consultor.name}</h3>
                                <p className="text-[var(--iica-blue)] font-medium text-sm mb-1">{consultor.specialty}</p>

                                <div className="flex items-center justify-center gap-1 mb-3 text-sm text-gray-500">
                                    <MapPin className="h-3 w-3" /> {consultor.region}
                                </div>

                                {/* Rating */}
                                <div className="flex justify-center items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className={`h-4 w-4 ${j < Math.floor(consultor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`} />
                                    ))}
                                    <span className="font-bold text-gray-800 ml-1">{consultor.rating}</span>
                                    <span className="text-gray-400 text-xs">({consultor.reviews})</span>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <p className="text-lg font-bold text-[var(--iica-navy)]">{consultor.proyectosGanados}</p>
                                        <p className="text-xs text-gray-500">Proyectos ganados</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <p className="text-lg font-bold text-[var(--iica-secondary)]">{consultor.montoGestionado}</p>
                                        <p className="text-xs text-gray-500">Gestionado</p>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                                    {consultor.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-blue-50 text-[var(--iica-blue)] text-[10px] font-bold uppercase rounded-full border border-blue-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Response time */}
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-4">
                                    <Clock className="h-3 w-3" />
                                    Responde en {consultor.tiempoRespuesta}
                                </div>

                                {/* Price */}
                                <p className="text-sm font-bold text-gray-700 mb-4">{consultor.precio}</p>

                                {/* CTA Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={`https://wa.me/56900000000?text=Hola ${consultor.name}, vi tu perfil en IICA Chile y necesito ayuda con un fondo.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#25D366] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all min-h-[48px]"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        WhatsApp
                                    </a>
                                    <button className="flex items-center justify-center gap-1.5 py-3 px-3 border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-[var(--iica-blue)] hover:text-[var(--iica-blue)] transition-all min-h-[48px]">
                                        <Phone className="h-4 w-4" /> Llamar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No se encontraron consultores</h3>
                        <p className="text-gray-500">Intenta con otros filtros o términos de búsqueda.</p>
                        <button
                            onClick={() => { setFilterEsp('Todos'); setFilterRegion('Todas'); setSearchTerm(''); }}
                            className="mt-4 px-6 py-3 bg-[var(--iica-blue)] text-white font-bold rounded-xl hover:bg-[var(--iica-navy)] transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}

                {/* CTA para consultores */}
                <div className="mt-12 bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] rounded-2xl p-8 text-white text-center">
                    <Award className="h-10 w-10 text-[var(--iica-yellow)] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">¿Eres consultor agrícola?</h3>
                    <p className="text-blue-200 mb-6 max-w-md mx-auto">
                        Únete a nuestra red de formuladores validados por IICA y conecta con agricultores que necesitan tu experiencia.
                    </p>
                    <a
                        href="mailto:chile@iica.int?subject=Solicitud de ingreso al Directorio de Consultores"
                        className="inline-flex items-center gap-2 bg-[var(--iica-yellow)] text-[var(--iica-navy)] font-bold px-8 py-4 rounded-xl hover:brightness-110 transition-all min-h-[56px]"
                    >
                        Solicitar Validación IICA →
                    </a>
                </div>
            </div>
        </div>
    );
}
