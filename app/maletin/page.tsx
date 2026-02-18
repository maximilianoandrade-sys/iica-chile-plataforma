'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FileText, Upload, Download, CheckCircle, Shield,
    Folder, Trash2, Plus, X, RefreshCw,
    BookOpen, ClipboardList, FileSpreadsheet, FileImage,
    FileBadge, FileCheck, Search, Tag, Users, Star,
    Lock, ChevronDown, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type DocCategory = 'plantilla' | 'guia' | 'informe' | 'bases' | 'capacitacion' | 'otro';

interface TechDocument {
    id: string;
    name: string;
    fileName: string;
    uploadDate: string;
    size: number;
    dataUrl: string;
    uploadedBy: string;
    category: DocCategory;
    tags: string[];
    description?: string;
    pinned?: boolean;
}

// ─── Recursos pre-cargados (documentos de referencia del IICA) ───────────────
// Estos son recursos de referencia con links externos, no archivos subidos

interface ReferenceResource {
    id: string;
    name: string;
    description: string;
    category: DocCategory;
    tags: string[];
    url: string;
    institution: string;
    featured?: boolean;
}

const REFERENCE_RESOURCES: ReferenceResource[] = [
    {
        id: 'ref-1',
        name: 'Bases Concurso CNR Ley 18.450 – 2026',
        description: 'Bases oficiales del concurso de tecnificación del riego. Incluye requisitos, montos y formularios de postulación.',
        category: 'bases',
        tags: ['CNR', 'riego', '2026', 'postulación'],
        url: 'https://www.cnr.gob.cl/agricultores/concursos-de-riego/',
        institution: 'CNR',
        featured: true,
    },
    {
        id: 'ref-2',
        name: 'Guía Operativa SIRSD-S 2026 – INDAP',
        description: 'Manual técnico para la operación del Sistema de Incentivos para la Sustentabilidad Agroambiental.',
        category: 'guia',
        tags: ['INDAP', 'suelos', 'SIRSD', 'sustentabilidad'],
        url: 'https://www.indap.gob.cl/programas/sirsd-s',
        institution: 'INDAP',
        featured: true,
    },
    {
        id: 'ref-3',
        name: 'Formulario Postulación CORFO – Líneas de Fomento',
        description: 'Formularios estándar de postulación para las líneas de fomento productivo de CORFO.',
        category: 'plantilla',
        tags: ['CORFO', 'formulario', 'postulación', 'fomento'],
        url: 'https://www.corfo.cl/sites/cpp/programas',
        institution: 'CORFO',
    },
    {
        id: 'ref-4',
        name: 'Bases FIA – Concurso Innovación Agraria 2026',
        description: 'Bases del concurso de proyectos de innovación agraria de la Fundación para la Innovación Agraria.',
        category: 'bases',
        tags: ['FIA', 'innovación', 'investigación', '2026'],
        url: 'https://www.fia.cl/concursos',
        institution: 'FIA',
    },
    {
        id: 'ref-5',
        name: 'Guía Técnica de Riego Tecnificado – CNR',
        description: 'Manual técnico sobre sistemas de riego por goteo, aspersión y microaspersión para proyectos CNR.',
        category: 'guia',
        tags: ['CNR', 'riego', 'técnico', 'goteo', 'aspersión'],
        url: 'https://www.cnr.gob.cl/publicaciones/',
        institution: 'CNR',
    },
    {
        id: 'ref-6',
        name: 'Informe Anual IICA Chile 2025',
        description: 'Informe de actividades y resultados del IICA Chile para el año 2025.',
        category: 'informe',
        tags: ['IICA', 'informe', 'anual', '2025'],
        url: 'https://www.iica.int/es/countries/chile',
        institution: 'IICA',
        featured: true,
    },
    {
        id: 'ref-7',
        name: 'Bases SERCOTEC – Capital Semilla Emprende 2026',
        description: 'Bases del programa Capital Semilla para emprendimientos rurales y agrícolas.',
        category: 'bases',
        tags: ['SERCOTEC', 'capital semilla', 'emprendimiento', '2026'],
        url: 'https://www.sercotec.cl/programas/capital-semilla-emprende/',
        institution: 'SERCOTEC',
    },
    {
        id: 'ref-8',
        name: 'Plantilla Informe de Terreno – IICA',
        description: 'Plantilla estándar para informes de visita técnica a terreno. Incluye secciones de diagnóstico, recomendaciones y seguimiento.',
        category: 'plantilla',
        tags: ['IICA', 'terreno', 'informe', 'plantilla'],
        url: 'https://www.iica.int/es/countries/chile',
        institution: 'IICA',
    },
    {
        id: 'ref-9',
        name: 'Manual de Evaluación de Proyectos Agrícolas – IICA',
        description: 'Metodología IICA para la evaluación técnica y económica de proyectos de desarrollo agrícola.',
        category: 'capacitacion',
        tags: ['IICA', 'evaluación', 'metodología', 'proyectos'],
        url: 'https://repositorio.iica.int/',
        institution: 'IICA',
    },
    {
        id: 'ref-10',
        name: 'Bases GORE – Fondo Regional de Desarrollo Agrícola 2026',
        description: 'Bases de los fondos regionales de desarrollo agrícola administrados por los Gobiernos Regionales.',
        category: 'bases',
        tags: ['GORE', 'regional', 'desarrollo', '2026'],
        url: 'https://www.subdere.gov.cl/',
        institution: 'GORE',
    },
];

// ─── Categorías ───────────────────────────────────────────────────────────────

const CATEGORIES: { id: DocCategory | 'todos'; label: string; icon: React.ReactNode; colorClass: string }[] = [
    { id: 'todos', label: 'Todos', icon: <Folder className="h-4 w-4" />, colorClass: 'bg-gray-100 text-gray-700 border-gray-200' },
    { id: 'plantilla', label: 'Plantillas', icon: <ClipboardList className="h-4 w-4" />, colorClass: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'guia', label: 'Guías Técnicas', icon: <BookOpen className="h-4 w-4" />, colorClass: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'informe', label: 'Informes', icon: <FileText className="h-4 w-4" />, colorClass: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'bases', label: 'Bases de Fondos', icon: <FileCheck className="h-4 w-4" />, colorClass: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'capacitacion', label: 'Capacitación', icon: <Users className="h-4 w-4" />, colorClass: 'bg-pink-100 text-pink-700 border-pink-200' },
    { id: 'otro', label: 'Otro', icon: <FileBadge className="h-4 w-4" />, colorClass: 'bg-gray-100 text-gray-600 border-gray-200' },
];

const getCategoryStyle = (cat: DocCategory | 'todos') =>
    CATEGORIES.find(c => c.id === cat)?.colorClass ?? 'bg-gray-100 text-gray-600 border-gray-200';

const STORAGE_KEY = 'iica_maletin_tecnico_v1';

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function MaletinPage() {
    const [documents, setDocuments] = useState<TechDocument[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newDocName, setNewDocName] = useState('');
    const [newDocDesc, setNewDocDesc] = useState('');
    const [uploaderName, setUploaderName] = useState('');
    const [newDocTags, setNewDocTags] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<DocCategory>('plantilla');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'recursos' | 'mis-docs'>('recursos');
    const [filterCategory, setFilterCategory] = useState<DocCategory | 'todos'>('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try { setDocuments(JSON.parse(saved)); } catch { /* ignore */ }
        }
        setIsLoading(false);
    }, []);

    const saveDocuments = (docs: TechDocument[]) => {
        setIsSaving(true);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
            setDocuments(docs);
        } catch {
            alert('Error al guardar. Verifica el espacio disponible en tu navegador.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileSelect = (file: File) => {
        if (file.size > 10 * 1024 * 1024) { alert('El archivo es demasiado grande. Máximo 10MB.'); return; }
        setSelectedFile(file);
        if (!newDocName) setNewDocName(file.name.replace(/\.[^/.]+$/, ''));
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) { handleFileSelect(file); setShowUploadModal(true); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpload = () => {
        if (!selectedFile || !newDocName.trim() || !uploaderName.trim()) {
            alert('Por favor completa los campos obligatorios.'); return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const newDoc: TechDocument = {
                id: Date.now().toString(),
                name: newDocName.trim(),
                description: newDocDesc.trim(),
                fileName: selectedFile.name,
                uploadDate: new Date().toISOString(),
                size: selectedFile.size,
                dataUrl,
                uploadedBy: uploaderName.trim(),
                category: selectedCategory,
                tags: newDocTags.split(',').map(t => t.trim()).filter(Boolean),
            };
            saveDocuments([...documents, newDoc]);
            setShowUploadModal(false);
            setSelectedFile(null);
            setNewDocName(''); setNewDocDesc(''); setNewDocTags('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Eliminar este documento del maletín?')) {
            saveDocuments(documents.filter(d => d.id !== id));
        }
    };

    const handleDownload = (doc: TechDocument) => {
        const link = document.createElement('a');
        link.href = doc.dataUrl;
        link.download = doc.fileName;
        link.click();
    };

    const togglePin = (id: string) => {
        saveDocuments(documents.map(d => d.id === id ? { ...d, pinned: !d.pinned } : d));
    };

    const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
    const formatDate = (iso: string) => {
        const d = new Date(iso), now = new Date();
        const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
        if (diff === 0) return 'Hoy'; if (diff === 1) return 'Ayer';
        if (diff < 7) return `Hace ${diff} días`;
        return d.toLocaleDateString('es-CL');
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <FileText className="h-6 w-6 text-red-500" />;
        if (['jpg', 'jpeg', 'png'].includes(ext || '')) return <FileImage className="h-6 w-6 text-blue-400" />;
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
        if (['doc', 'docx'].includes(ext || '')) return <FileBadge className="h-6 w-6 text-blue-600" />;
        return <FileCheck className="h-6 w-6 text-gray-400" />;
    };

    // Filtros
    const q = searchQuery.toLowerCase();
    const filteredRefs = REFERENCE_RESOURCES.filter(r =>
        (filterCategory === 'todos' || r.category === filterCategory) &&
        (!q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)))
    );
    const filteredDocs = documents
        .filter(d =>
            (filterCategory === 'todos' || d.category === filterCategory) &&
            (!q || d.name.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q)))
        )
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    const featuredRefs = REFERENCE_RESOURCES.filter(r => r.featured);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* ── Header ── */}
            <div className="bg-gradient-to-br from-[var(--iica-navy)] via-[var(--iica-blue)] to-[#1a6fa8] text-white pt-24 pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <Link href="/" className="text-blue-200 hover:text-white text-sm mb-6 inline-flex items-center gap-1">
                        ← Volver al Inicio
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 mb-2">
                        <Folder className="h-10 w-10 text-[var(--iica-yellow)]" />
                        Maletín Técnico IICA
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl">
                        Repositorio de recursos técnicos para el equipo IICA Chile: plantillas, guías, bases de fondos e informes de referencia.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-6">

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Recursos de Referencia', value: REFERENCE_RESOURCES.length, icon: <BookOpen className="h-5 w-5 text-[var(--iica-blue)]" />, color: 'border-[var(--iica-blue)]' },
                        { label: 'Mis Documentos', value: documents.length, icon: <Folder className="h-5 w-5 text-purple-500" />, color: 'border-purple-400' },
                        { label: 'Bases de Fondos', value: REFERENCE_RESOURCES.filter(r => r.category === 'bases').length, icon: <FileCheck className="h-5 w-5 text-orange-500" />, color: 'border-orange-400' },
                        { label: 'Plantillas', value: REFERENCE_RESOURCES.filter(r => r.category === 'plantilla').length + documents.filter(d => d.category === 'plantilla').length, icon: <ClipboardList className="h-5 w-5 text-green-500" />, color: 'border-green-400' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className={`bg-white rounded-xl shadow-sm border-l-4 ${s.color} p-4 flex items-center gap-3`}>
                            <div className="p-2 bg-gray-50 rounded-lg">{s.icon}</div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                                <p className="text-xs text-gray-500 font-medium leading-tight">{s.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Búsqueda global ── */}
                <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, descripción o etiqueta..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent outline-none text-sm shadow-sm"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* ── Tabs ── */}
                <div className="flex w-full md:w-fit gap-1 bg-gray-100 p-1 rounded-xl mb-5">
                    {([
                        { id: 'recursos', label: `🔗 Recursos de Referencia (${REFERENCE_RESOURCES.length})` },
                        { id: 'mis-docs', label: `📁 Mis Documentos (${documents.length})` },
                    ] as const).map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 md:flex-none justify-center px-4 py-3 md:px-5 md:py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-[var(--iica-navy)]' : 'text-gray-500 hover:text-gray-700'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Category Filter ── */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setFilterCategory(cat.id as DocCategory | 'todos')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filterCategory === cat.id
                                ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    TAB 1: RECURSOS DE REFERENCIA (links externos)
                ══════════════════════════════════════════════════════════════ */}
                {activeTab === 'recursos' && (
                    <div>
                        {/* Destacados */}
                        {!searchQuery && filterCategory === 'todos' && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Star className="h-4 w-4 text-[var(--iica-yellow)]" /> Recursos Destacados
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {featuredRefs.map(ref => (
                                        <a key={ref.id} href={ref.url} target="_blank" rel="noopener noreferrer"
                                            className="bg-gradient-to-br from-[var(--iica-navy)] to-[var(--iica-blue)] text-white rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30`}>
                                                    {ref.category}
                                                </span>
                                                <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                                            </div>
                                            <h4 className="font-bold text-sm leading-snug mb-1">{ref.name}</h4>
                                            <p className="text-blue-200 text-xs line-clamp-2">{ref.description}</p>
                                            <div className="mt-3 text-[10px] font-bold text-blue-200">{ref.institution}</div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Todos los Recursos ({filteredRefs.length})
                        </h3>

                        <div className="space-y-3">
                            {filteredRefs.map(ref => (
                                <motion.div key={ref.id} layout
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--iica-blue)] transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
                                            {ref.category === 'bases' && <FileCheck className="h-6 w-6 text-orange-500" />}
                                            {ref.category === 'guia' && <BookOpen className="h-6 w-6 text-green-600" />}
                                            {ref.category === 'plantilla' && <ClipboardList className="h-6 w-6 text-blue-500" />}
                                            {ref.category === 'informe' && <FileText className="h-6 w-6 text-purple-500" />}
                                            {ref.category === 'capacitacion' && <Users className="h-6 w-6 text-pink-500" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-800 group-hover:text-[var(--iica-blue)] transition-colors">{ref.name}</h4>
                                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{ref.description}</p>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryStyle(ref.category)}`}>
                                                    {ref.category}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{ref.institution}</span>
                                                {ref.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                        <Tag className="h-2.5 w-2.5" />{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <a href={ref.url} target="_blank" rel="noopener noreferrer"
                                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white text-sm font-bold rounded-lg transition-colors">
                                        <ExternalLink className="h-4 w-4" /> Abrir
                                    </a>
                                </motion.div>
                            ))}
                        </div>

                        {filteredRefs.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="font-medium text-gray-500">No se encontraron recursos para esta búsqueda</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    TAB 2: MIS DOCUMENTOS (archivos subidos por el técnico)
                ══════════════════════════════════════════════════════════════ */}
                {activeTab === 'mis-docs' && (
                    <div>
                        {/* Drop Zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => setShowUploadModal(true)}
                            className={`mb-6 border-2 border-dashed rounded-xl p-6 md:p-8 text-center cursor-pointer transition-all active:scale-95 ${isDragging
                                ? 'border-[var(--iica-blue)] bg-blue-50 scale-[1.01]'
                                : 'border-gray-300 hover:border-[var(--iica-blue)] hover:bg-blue-50/30'}`}>
                            <Upload className={`h-10 w-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-[var(--iica-blue)]' : 'text-gray-400'}`} />
                            <p className="font-bold text-gray-700 hidden md:block">Arrastra un archivo aquí o haz clic para subir</p>
                            <p className="font-bold text-gray-700 md:hidden">Toca aquí para subir un documento o tomar una foto</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, JPG, PNG — Máximo 10MB</p>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12"><RefreshCw className="h-10 w-10 text-gray-300 mx-auto animate-spin" /></div>
                        ) : filteredDocs.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <Folder className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                                <h4 className="font-bold text-gray-600 mb-1">
                                    {searchQuery ? 'No se encontraron documentos' : 'No hay documentos en esta categoría'}
                                </h4>
                                <p className="text-gray-400 text-sm">Sube tu primer documento usando el área de arriba.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {filteredDocs.map(doc => (
                                        <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                                            className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--iica-blue)] transition-colors ${doc.pinned ? 'border-[var(--iica-yellow)] bg-yellow-50/20' : 'border-gray-200'}`}>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                    {getFileIcon(doc.fileName)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {doc.pinned && <Star className="h-4 w-4 text-[var(--iica-yellow)] fill-[var(--iica-yellow)] flex-shrink-0" />}
                                                        <h4 className="font-bold text-gray-800">{doc.name}</h4>
                                                    </div>
                                                    {doc.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{doc.description}</p>}
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryStyle(doc.category)}`}>
                                                            {doc.category}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{doc.fileName}</span>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs text-gray-400">{formatSize(doc.size)}</span>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs text-gray-400">{formatDate(doc.uploadDate)}</span>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs text-[var(--iica-blue)] font-medium">{doc.uploadedBy}</span>
                                                    </div>
                                                    {doc.tags.length > 0 && (
                                                        <div className="flex gap-1 mt-1.5 flex-wrap">
                                                            {doc.tags.map(tag => (
                                                                <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                    <Tag className="h-2.5 w-2.5" />{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button onClick={() => togglePin(doc.id)} title={doc.pinned ? 'Desfijar' : 'Fijar arriba'}
                                                    className={`p-2 rounded-lg transition-colors ${doc.pinned ? 'text-[var(--iica-yellow)] bg-yellow-50 hover:bg-yellow-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                                                    <Star className={`h-4 w-4 ${doc.pinned ? 'fill-current' : ''}`} />
                                                </button>
                                                <button onClick={() => handleDownload(doc)}
                                                    className="px-3 py-2 text-[var(--iica-blue)] bg-blue-50 hover:bg-blue-100 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors">
                                                    <Download className="h-4 w-4" /> Descargar
                                                </button>
                                                <button onClick={() => handleDelete(doc.id)} disabled={isSaving}
                                                    className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Nota privacidad ── */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                    <Lock className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                        <strong>Almacenamiento local:</strong> Los documentos subidos se guardan en este navegador (localStorage). Para compartir archivos con el equipo, usa los canales oficiales del IICA.
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                MODAL DE SUBIDA
            ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

                            <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] px-6 py-5 flex justify-between items-center rounded-t-2xl sticky top-0">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg"><Upload className="h-5 w-5 text-white" /></div>
                                    <h3 className="text-lg font-bold text-white">Subir Documento</h3>
                                </div>
                                <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); setNewDocName(''); setNewDocDesc(''); setNewDocTags(''); }}
                                    className="text-white/70 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Técnico / Área *</label>
                                    <input type="text" value={uploaderName} onChange={e => setUploaderName(e.target.value)}
                                        placeholder="Ej: María González – Área de Desarrollo Rural"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre del Documento *</label>
                                    <input type="text" value={newDocName} onChange={e => setNewDocName(e.target.value)}
                                        placeholder="Ej: Plantilla Informe de Terreno Q1 2026"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción (opcional)</label>
                                    <textarea value={newDocDesc} onChange={e => setNewDocDesc(e.target.value)} rows={2}
                                        placeholder="Breve descripción del contenido o uso del documento..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent text-sm resize-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Categoría</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.filter(c => c.id !== 'todos').map(cat => (
                                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id as DocCategory)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedCategory === cat.id
                                                    ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)]'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                                                {cat.icon} {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Etiquetas (separadas por coma)</label>
                                    <input type="text" value={newDocTags} onChange={e => setNewDocTags(e.target.value)}
                                        placeholder="Ej: CNR, riego, 2026, postulación"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Archivo *</label>
                                    <input ref={fileInputRef} type="file" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.ppt,.pptx"
                                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-[var(--iica-blue)] hover:file:bg-blue-100 cursor-pointer" />
                                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, XLS, PPT, JPG, PNG — Máx. 10MB</p>
                                </div>
                                {selectedFile && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                                        {getFileIcon(selectedFile.name)}
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">{formatSize(selectedFile.size)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
                                <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); setNewDocName(''); setNewDocDesc(''); setNewDocTags(''); }}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors">
                                    Cancelar
                                </button>
                                <button onClick={handleUpload}
                                    disabled={!selectedFile || !newDocName.trim() || !uploaderName.trim() || isSaving}
                                    className="px-6 py-2 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                                    {isSaving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Guardando...</> : <><Upload className="h-4 w-4" /> Subir Documento</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
