'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, Plus, Link as LinkIcon, Save } from 'lucide-react';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Estados del Formulario (Simulado)
    const [formData, setFormData] = useState({
        nombre: '',
        institucion: 'INDAP',
        fecha_cierre: '',
        categoria: 'Riego',
        monto: '',
        link: ''
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Clave Temporal para demo
        if (password === 'IICA2026') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Clave incorrecta. Solo personal autorizado.');
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert("✨ MODO DEMOSTRACIÓN \n\nPara guardar cambios reales, necesitamos conectar este formulario a una base de datos (Supabase/Firebase). \n\nEsta interfaz está lista para recibir esa conexión.");
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border-t-4 border-[var(--iica-navy)]">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Lock className="w-8 h-8 text-[var(--iica-navy)]" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-center text-[var(--iica-navy)] mb-2">Panel de Administración</h1>
                    <p className="text-gray-500 text-center text-sm mb-6">Acceso restringido a coordinadores de programas.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Clave de Acceso</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--iica-blue)] outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm font-bold animate-pulse">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-[var(--iica-navy)] text-white font-bold py-3 rounded hover:bg-[var(--iica-blue)] transition-colors"
                        >
                            Ingresar
                        </button>
                    </form>
                    <p className="mt-6 text-center text-xs text-gray-400">Plataforma IICA Chile v2.0</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Admin Header */}
            <header className="bg-[var(--iica-navy)] text-white py-4 px-6 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-[var(--iica-secondary)]" />
                        <span className="font-bold text-lg">IICA Admin Console</span>
                    </div>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-4xl mx-auto w-full p-6">

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Fondos</h2>
                    <button className="flex items-center gap-2 bg-[var(--iica-secondary)] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition">
                        <Plus className="h-5 w-5" /> Nuevo Fondo
                    </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <span className="text-gray-500 text-sm font-bold uppercase">Total Fondos</span>
                        <div className="text-3xl font-bold text-[var(--iica-blue)] mt-1">8</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <span className="text-gray-500 text-sm font-bold uppercase">Abiertos Hoy</span>
                        <div className="text-3xl font-bold text-green-600 mt-1">6</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <span className="text-gray-500 text-sm font-bold uppercase">Próximo Cierre</span>
                        <div className="text-xl font-bold text-orange-500 mt-2">CNR: 23-Ene</div>
                    </div>
                </div>

                {/* Editor Form Demo */}
                <div className="bg-white rounded-xl shadow-md border border-[var(--iica-border)] overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-700">Editor Rápido de Convocatorias</h3>
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Institución</label>
                                <select
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] bg-white"
                                    value={formData.institucion}
                                    onChange={e => setFormData({ ...formData, institucion: e.target.value })}
                                >
                                    <option>INDAP</option>
                                    <option>CNR</option>
                                    <option>CORFO</option>
                                    <option>FIA</option>
                                    <option>Fondo Chile</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                                <select
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] bg-white"
                                    value={formData.categoria}
                                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                >
                                    <option>Riego</option>
                                    <option>Suelos</option>
                                    <option>Inversión</option>
                                    <option>Innovación</option>
                                    <option>Internacional</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Concurso</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] text-sm"
                                placeholder="Ej: Concurso 25-2026 Obras Civiles..."
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Cierre</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)]"
                                    value={formData.fecha_cierre}
                                    onChange={e => setFormData({ ...formData, fecha_cierre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Link a Bases (URL)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="url"
                                        className="w-full p-3 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)]"
                                        placeholder="https://..."
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition">
                                Cancelar
                            </button>
                            <button type="submit" className="px-5 py-2.5 rounded-lg bg-[var(--iica-navy)] text-white font-bold shadow-md hover:bg-blue-800 transition flex items-center gap-2">
                                <Save className="h-4 w-4" /> Guardar Publicación
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}
