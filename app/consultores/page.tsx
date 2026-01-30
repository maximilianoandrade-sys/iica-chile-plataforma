'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Star, MessageCircle, Phone, Award, Filter } from 'lucide-react';

export default function ConsultoresPage() {
    const [filter, setFilter] = useState('Todos');

    const consultores = [
        {
            id: 1,
            name: "María González",
            specialty: "Riego y Drenaje",
            region: "Maule",
            rating: 4.9,
            reviews: 24,
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fm=jpg&q=60&w=200",
            tags: ["CNR", "INDAP", "Tecnificación"]
        },
        {
            id: 2,
            name: "Carlos Tapia",
            specialty: "Suelos Degradados",
            region: "Araucanía",
            rating: 4.7,
            reviews: 18,
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fm=jpg&q=60&w=200",
            tags: ["SIRSD-S", "Manejo de Suelos"]
        },
        {
            id: 3,
            name: "Ana Pizarro",
            specialty: "Innovación Agrícola",
            region: "O'Higgins",
            rating: 5.0,
            reviews: 12,
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?fm=jpg&q=60&w=200",
            tags: ["FIA", "Startups", "Corfo"]
        },
        {
            id: 4,
            name: "Roberto Méndez",
            specialty: "Gestión Hídrica",
            region: "Coquimbo",
            rating: 4.8,
            reviews: 30,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=200",
            tags: ["CNR", "Eficiencia", "Pequeña Agricultura"]
        },
    ];

    const filteredConsultants = filter === 'Todos'
        ? consultores
        : consultores.filter(c => c.specialty.includes(filter) || c.region.includes(filter));

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 pt-24 pb-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <Link href="/" className="text-gray-500 hover:text-[var(--iica-blue)] text-sm mb-4 inline-block">&larr; Volver al Inicio</Link>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--iica-navy)] mb-2">Directorio de Consultores</h1>
                            <p className="text-gray-600">Encuentra expertos certificados para formular y gestionar tus proyectos.</p>
                        </div>
                        <div className="flex gap-2">
                            <a href="/maletin" className="px-4 py-2 text-sm font-bold text-[var(--iica-blue)] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                Ir a Mi Maletín
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8">
                {/* Search & Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, especialidad o región..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {['Todos', 'Riego', 'Suelos', 'Maule', 'Araucanía'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setFilter(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === tag
                                        ? 'bg-[var(--iica-navy)] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredConsultants.map((consultor) => (
                        <div key={consultor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="relative h-24 bg-gradient-to-r from-blue-500 to-[var(--iica-blue)]">
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                                    <div className="relative w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                                        <Image
                                            src={consultor.image}
                                            alt={consultor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 pb-6 px-6 text-center">
                                <h3 className="font-bold text-lg text-gray-800">{consultor.name}</h3>
                                <p className="text-[var(--iica-blue)] font-medium text-sm mb-1">{consultor.specialty}</p>

                                <div className="flex items-center justify-center gap-1 mb-4 text-sm text-gray-500">
                                    <MapPin className="h-3 w-3" /> {consultor.region}
                                </div>

                                <div className="flex justify-center items-center gap-1 mb-4">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span className="font-bold text-gray-800">{consultor.rating}</span>
                                    <span className="text-gray-400 text-xs">({consultor.reviews} reseñas)</span>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                    {consultor.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase rounded border border-gray-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 py-2 px-3 bg-[var(--iica-secondary)] text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all">
                                        <MessageCircle className="h-4 w-4" /> Chat
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all">
                                        <Phone className="h-4 w-4" /> Llamar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
