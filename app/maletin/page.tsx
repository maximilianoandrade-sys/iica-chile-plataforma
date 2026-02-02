'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, CheckCircle, AlertCircle, Shield, Folder, Trash2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Document {
    id: string;
    name: string;
    fileName: string;
    uploadDate: string;
    size: number;
    dataUrl: string; // Base64 encoded file
}

export default function MaletinPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newDocName, setNewDocName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Load documents from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('iica_maletin_documents');
        if (saved) {
            try {
                setDocuments(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading documents:', e);
            }
        }
    }, []);

    // Save documents to localStorage whenever they change
    useEffect(() => {
        if (documents.length > 0) {
            localStorage.setItem('iica_maletin_documents', JSON.stringify(documents));
        }
    }, [documents]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Limit file size to 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 5MB.');
                return;
            }
            setSelectedFile(file);
            setNewDocName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension for default name
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !newDocName.trim()) {
            alert('Por favor selecciona un archivo y dale un nombre.');
            return;
        }

        // Convert file to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;

            const newDoc: Document = {
                id: Date.now().toString(),
                name: newDocName.trim(),
                fileName: selectedFile.name,
                uploadDate: new Date().toISOString(),
                size: selectedFile.size,
                dataUrl
            };

            setDocuments(prev => [...prev, newDoc]);
            setShowUploadModal(false);
            setSelectedFile(null);
            setNewDocName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        reader.readAsDataURL(selectedFile);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este documento?')) {
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            // Also update localStorage
            const updated = documents.filter(doc => doc.id !== id);
            if (updated.length === 0) {
                localStorage.removeItem('iica_maletin_documents');
            }
        }
    };

    const handleDownload = (doc: Document) => {
        const link = document.createElement('a');
        link.href = doc.dataUrl;
        link.download = doc.fileName;
        link.click();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-CL');
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
                        Sube y organiza tus documentos para tenerlos siempre a mano al postular.
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
                                <p className="text-gray-500 text-sm font-bold uppercase">Documentos Subidos</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                                    {documents.length}
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
                                <p className="text-gray-500 text-sm font-bold uppercase">Espacio Usado</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                                    {formatFileSize(documents.reduce((acc, doc) => acc + doc.size, 0))}
                                </h3>
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

                {/* Upload Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="w-full md:w-auto px-6 py-3 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Subir Nuevo Documento
                    </button>
                </div>

                {/* Documents List */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 text-lg">Mis Documentos</h3>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">🔒 Almacenado Localmente</span>
                    </div>

                    {documents.length === 0 ? (
                        <div className="p-12 text-center">
                            <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-gray-600 mb-2">No hay documentos aún</h4>
                            <p className="text-gray-500 text-sm">Sube tu primer documento para comenzar a organizar tu carpeta.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {documents.map((doc) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-lg bg-green-100 text-green-600">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg">{doc.name}</h4>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                <span>{doc.fileName}</span>
                                                <span>•</span>
                                                <span>{formatFileSize(doc.size)}</span>
                                                <span>•</span>
                                                <span>{formatDate(doc.uploadDate)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="px-4 py-2 text-[var(--iica-blue)] bg-blue-50 hover:bg-blue-100 rounded-lg font-medium text-sm flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" /> Descargar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium text-sm flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" /> Eliminar
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center text-gray-500 text-sm p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p>🔒 Tus documentos se almacenan localmente en tu navegador de forma segura. No se envían a ningún servidor externo.</p>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] px-6 py-5 flex justify-between items-center rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Upload className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Subir Documento</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setSelectedFile(null);
                                        setNewDocName('');
                                    }}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Nombre del Documento
                                    </label>
                                    <input
                                        type="text"
                                        value={newDocName}
                                        onChange={(e) => setNewDocName(e.target.value)}
                                        placeholder="Ej: Certificado de Vigencia"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Seleccionar Archivo
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Máximo 5MB. Formatos: PDF, DOC, DOCX, JPG, PNG</p>
                                </div>

                                {selectedFile && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-gray-700">
                                            <strong>Archivo seleccionado:</strong> {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Tamaño: {formatFileSize(selectedFile.size)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setSelectedFile(null);
                                        setNewDocName('');
                                    }}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || !newDocName.trim()}
                                    className="px-6 py-2 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Subir Documento
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
