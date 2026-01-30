'use client';

import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle, AlertCircle, Shield, Folder, File, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MaletinPage() {
    // Mock user documents state
    const [documents, setDocuments] = useState([
        { id: 1, name: 'Carpeta Tributaria (F29)', date: 'Actualizado hace 2 días', status: 'valid', type: 'pdf' },
        { id: 2, name: 'Certificado de Vigencia', date: 'Vence en 15 días', status: 'warning', type: 'pdf' },
        { id: 3, name: 'Derechos de Agua', date: 'Subido el 01/01/2025', status: 'valid', type: 'pdf' },
        { id: 4, name: 'Rol de Avalúo Fiscal', date: 'Pendiente de carga', status: 'missing', type: 'none' },
    ]);

    const handleUpload = (id: number) => {
        // Simulación: Cambiar estado a válido
        const newDocs = documents.map(doc =>
            doc.id === id ? { ...doc, status: 'valid' as const, date: 'Subido ahora' } : doc
        );
        setDocuments(newDocs);
        alert("Simulación: Documento cargado exitosamente.");
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-[var(--iica-navy)] text-white pt-24 pb-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <Link href="/" className="text-blue-200 hover:text-white text-sm mb-4 inline-block">&larr; Volver al Inicio</Link>
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                        <Folder className="h-10 w-10 text-[var(--iica-yellow)]" />
                        Mi Maletín Digital
                    </h1>
                    <p className="text-blue-100 mt-2 text-lg">
                        Centraliza tus documentos clave para postular a fondos con un solo clic.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-bold uppercase">Documentos Listos</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                                    {documents.filter(d => d.status === 'valid').length}/{documents.length}
                                </h3>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[var(--iica-blue)]"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-bold uppercase">Nivel de Preparación</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">75%</h3>
                            </div>
                            <Shield className="h-8 w-8 text-[var(--iica-blue)]" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-[var(--iica-secondary)] to-green-600 p-6 rounded-xl shadow-lg text-white"
                    >
                        <h4 className="font-bold text-lg mb-2">¿Necesitas ayuda?</h4>
                        <p className="text-sm opacity-90 mb-4">Contacta a un consultor certificado para revisar tu carpeta.</p>
                        <Link href="/consultores" className="inline-block bg-white text-green-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-50 transition-colors">
                            Buscar Experto
                        </Link>
                    </motion.div>
                </div>

                {/* Documents List */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 text-lg">Documentación Estándar</h3>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Seguro y Encriptado</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {documents.map((doc) => (
                            <div key={doc.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${doc.status === 'valid' ? 'bg-green-100 text-green-600' :
                                            doc.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-gray-100 text-gray-400'
                                        }`}>
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">{doc.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {doc.status === 'valid' && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Válido</span>}
                                            {doc.status === 'warning' && <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Por vencer</span>}
                                            {doc.status === 'missing' && <span className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Pendiente</span>}
                                            <span className="text-xs text-gray-400">• {doc.date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {doc.status !== 'missing' ? (
                                        <>
                                            <button className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm flex items-center gap-2">
                                                <Eye className="h-4 w-4" /> Ver
                                            </button>
                                            <button className="px-4 py-2 text-[var(--iica-blue)] bg-blue-50 hover:bg-blue-100 rounded-lg font-medium text-sm flex items-center gap-2">
                                                <Download className="h-4 w-4" /> Descargar
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleUpload(doc.id)}
                                            className="px-4 py-2 text-white bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm"
                                        >
                                            <Upload className="h-4 w-4" /> Subir Archivo
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 text-center text-gray-500 text-sm p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p>🔒 Tus documentos se almacenan localmente en tu navegador para esta demostración. En la versión final, estarán encriptados en nuestros servidores seguros.</p>
                </div>
            </div>
        </div>
    );
}
