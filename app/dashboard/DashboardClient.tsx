'use client';

import { useState } from 'react';
import { Project } from '@/lib/data';
import {
    CloudSun, Droplets, Calendar, Bell, ChevronRight,
    MapPin, TrendingUp, Sprout, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface DashboardClientProps {
    projects: Project[];
}

// Mock User Profiles
const PROFILES = {
    'norte': {
        name: "Juan Pérez",
        region: "Coquimbo",
        rubro: "Uva de Mesa",
        type: "Pequeño Productor",
        weather: { temp: 28, condition: "Soleado", humidity: "30%" },
        water: { source: "Embalse Puclaro", level: "15%", status: "Crítico" }
    },
    'centro': {
        name: "María González",
        region: "O'Higgins",
        rubro: "Maíz",
        type: "Mediano Agricultor",
        weather: { temp: 24, condition: "Parcial", humidity: "45%" },
        water: { source: "Río Cachapoal", level: "60%", status: "Normal" }
    },
    'sur': {
        name: "Pedro Cayuqueo",
        region: "La Araucanía",
        rubro: "Berries",
        type: "Comunidad Indígena",
        weather: { temp: 18, condition: "Lluvia", humidity: "85%" },
        water: { source: "Pozo Profundo", level: "90%", status: "Optimo" }
    }
};

export default function DashboardClient({ projects }: DashboardClientProps) {
    const [currentProfileKey, setCurrentProfileKey] = useState<'norte' | 'centro' | 'sur'>('norte');
    const profile = PROFILES[currentProfileKey];

    // Filter projects for this profile
    const suggestedProjects = projects.filter(p => {
        // Logic: Match region OR "Todas", and basic interest matching (mocked simple logic)
        const regionMatch = p.regiones.includes(profile.region) || p.regiones.includes("Todas");
        return regionMatch;
    }).slice(0, 5); // Top 5

    const upcomingDeadlines = suggestedProjects
        .filter(p => new Date(p.fecha_cierre) > new Date())
        .sort((a, b) => new Date(a.fecha_cierre).getTime() - new Date(b.fecha_cierre).getTime())
        .slice(0, 3);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Profile Switcher (Demo Only) */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {(Object.keys(PROFILES) as Array<keyof typeof PROFILES>).map((k) => (
                    <button
                        key={k}
                        onClick={() => setCurrentProfileKey(k)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${currentProfileKey === k
                                ? 'bg-[var(--iica-navy)] text-white'
                                : 'bg-white text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        Perfil {PROFILES[k].region}
                    </button>
                ))}
            </div>

            {/* Header */}
            <header className="mb-8">
                <p className="text-gray-500 text-sm font-medium">{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <h1 className="text-3xl font-bold text-[var(--iica-navy)]">
                    Hola, {profile.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.region} • {profile.rubro}</span>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Weather */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
                >
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Tu Campo</p>
                        <div className="text-3xl font-bold text-gray-800">{profile.weather.temp}°</div>
                        <p className="text-sm text-gray-600">{profile.weather.condition}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                        <CloudSun size={24} />
                    </div>
                </motion.div>

                {/* Water */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
                >
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Disponibilidad Hídrica</p>
                        <div className={`text-3xl font-bold ${profile.water.status === 'Crítico' ? 'text-red-500' : 'text-blue-500'
                            }`}>
                            {profile.water.level}
                        </div>
                        <p className="text-sm text-gray-600 truncate max-w-[120px]">{profile.water.source}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${profile.water.status === 'Crítico' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                        }`}>
                        <Droplets size={24} />
                    </div>
                </motion.div>

                {/* Opportunities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-[var(--iica-navy)] p-6 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-between text-white"
                >
                    <div>
                        <p className="text-blue-200 text-xs font-bold uppercase mb-1">Oportunidades</p>
                        <div className="text-3xl font-bold">{suggestedProjects.length}</div>
                        <p className="text-sm text-blue-100">Disponibles hoy</p>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center text-[var(--iica-yellow)]">
                        <TrendingUp size={24} />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed: Critical Alerts & Deadlines */}
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Bell className="h-5 w-5 text-red-500" />
                            Cierres Próximos
                        </h2>
                        <div className="space-y-3">
                            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((p) => (
                                <div key={p.id} className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{p.nombre}</h3>
                                        <p className="text-xs text-gray-500">{p.institucion} • Cierra el {new Date(p.fecha_cierre).toLocaleDateString()}</p>
                                    </div>
                                    <Link
                                        href={p.url_bases} target="_blank"
                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"
                                    >
                                        Postular
                                    </Link>
                                </div>
                            )) : (
                                <p className="text-gray-500 italic">No hay cierres críticos esta semana.</p>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Sprout className="h-5 w-5 text-green-600" />
                            Recomendados para ti
                        </h2>
                        <div className="grid gap-4">
                            {suggestedProjects.map((p) => (
                                <motion.div
                                    key={p.id}
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                                {p.categoria}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">ID: #{p.id}</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 leading-snug">{p.nombre}</h3>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {p.resumen?.observaciones || `Programa de ${p.institucion} para ${p.regiones.join(', ')}`}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(p.fecha_cierre).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1 font-semibold text-green-600">
                                                {p.monto > 0 ? `$${p.monto.toLocaleString()}` : "Variable"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Link
                                            href={p.url_bases}
                                            target="_blank"
                                            className="w-full sm:w-auto px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-gray-200"
                                        >
                                            Ver Bases <ArrowUpRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Assistant & Resources */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[var(--iica-navy)] to-[var(--iica-blue)] text-white p-6 rounded-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">¿Dudas Técnicas?</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Pregúntale a nuestra IA sobre riego en {profile.region} o requisitos específicos.
                            </p>
                            <button className="w-full py-2 bg-white text-[var(--iica-navy)] rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">
                                Abrir Chat Experto
                            </button>
                        </div>
                        {/* Decor */}
                        <div className="absolute -bottom-4 -right-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase">Recursos Rápidos</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="flex items-center justify-between text-sm text-gray-600 hover:text-[var(--iica-blue)] p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span>Manual de Riego .PDF</span>
                                    <ChevronRight className="h-3 w-3" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center justify-between text-sm text-gray-600 hover:text-[var(--iica-blue)] p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span>Guía de Postulación INDAP</span>
                                    <ChevronRight className="h-3 w-3" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center justify-between text-sm text-gray-600 hover:text-[var(--iica-blue)] p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span>Precio de Uva (ODEPA)</span>
                                    <ChevronRight className="h-3 w-3" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
