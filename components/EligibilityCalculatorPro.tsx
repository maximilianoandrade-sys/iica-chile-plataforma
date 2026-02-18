'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, X, Sparkles, Calculator, ChevronRight, Info } from 'lucide-react';

interface EligibilityResult {
    fondo: string;
    institucion: string;
    eligible: boolean;
    razon: string;
    monto?: string;
}

const FONDOS_ANALISIS: EligibilityResult[] = [
    {
        fondo: "Capital Semilla Emprende",
        institucion: "Sercotec",
        eligible: true,
        razon: "Tus ventas anuales están dentro del rango para microempresarios (hasta UF 2.400).",
        monto: "Hasta $3.5 millones"
    },
    {
        fondo: "Línea de Crédito INDAP",
        institucion: "INDAP",
        eligible: true,
        razon: "Eres usuario INDAP elegible. Tus activos no superan el límite establecido.",
        monto: "Hasta $50 millones"
    },
    {
        fondo: "Subsidio Riego CNR",
        institucion: "CNR",
        eligible: true,
        razon: "Tienes derechos de agua registrados y superficie elegible para tecnificación.",
        monto: "Hasta $100 millones"
    },
    {
        fondo: "CORFO Inversión Productiva",
        institucion: "CORFO",
        eligible: false,
        razon: "Tus ventas anuales superan el límite de UF 25.000 para esta línea de financiamiento.",
    },
    {
        fondo: "FIA Innovación Agrícola",
        institucion: "FIA",
        eligible: false,
        razon: "Este fondo requiere asociatividad con al menos 3 productores o una organización formal.",
    },
];

export default function EligibilityCalculatorPro() {
    const [step, setStep] = useState<'intro' | 'upload' | 'analyzing' | 'results'>('intro');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setUploadedFile(file);
    };

    const handleAnalyze = () => {
        setStep('analyzing');
        setTimeout(() => setStep('results'), 3500);
    };

    const eligibleCount = FONDOS_ANALISIS.filter(f => f.eligible).length;
    const notEligibleCount = FONDOS_ANALISIS.filter(f => !f.eligible).length;

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] px-6 py-5 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                    <Calculator className="h-6 w-6 text-[var(--iica-yellow)]" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Calculadora de Elegibilidad Pro</h3>
                    <p className="text-blue-200 text-sm">Sube tu Carpeta Tributaria y descubre para qué fondos calificas</p>
                </div>
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-4"
                        >
                            <div className="text-6xl mb-4">📊</div>
                            <h4 className="text-xl font-bold text-[var(--iica-navy)] mb-2">
                                ¿Para qué fondos califico?
                            </h4>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Sube tu Carpeta Tributaria del SII (PDF) y nuestra IA analizará automáticamente
                                tu nivel de ventas y categoría para decirte exactamente qué fondos puedes solicitar.
                            </p>
                            <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="text-2xl mb-2">📄</div>
                                    <p className="font-bold text-[var(--iica-navy)]">1. Sube tu PDF</p>
                                    <p className="text-gray-500 text-xs">Carpeta Tributaria del SII</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="text-2xl mb-2">🤖</div>
                                    <p className="font-bold text-[var(--iica-navy)]">2. IA Analiza</p>
                                    <p className="text-gray-500 text-xs">Extrae ventas y categoría</p>
                                </div>
                                <div className="bg-yellow-50 rounded-xl p-4">
                                    <div className="text-2xl mb-2">✅</div>
                                    <p className="font-bold text-[var(--iica-navy)]">3. Resultado</p>
                                    <p className="text-gray-500 text-xs">Fondos elegibles al instante</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="flex items-center justify-center gap-2 px-8 py-4 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-bold rounded-xl shadow-lg transition-all min-h-[56px] text-lg"
                                >
                                    <Upload className="h-5 w-5" />
                                    Subir Carpeta Tributaria
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setStep('analyzing')}
                                    className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-200 text-gray-600 hover:border-[var(--iica-blue)] hover:text-[var(--iica-blue)] font-bold rounded-xl transition-all min-h-[56px]"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Usar datos de ejemplo
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                <Info className="h-3 w-3" />
                                Tu documento es procesado localmente y no se almacena en nuestros servidores.
                            </p>
                        </motion.div>
                    )}

                    {step === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging
                                    ? 'border-[var(--iica-blue)] bg-blue-50'
                                    : uploadedFile
                                        ? 'border-green-400 bg-green-50'
                                        : 'border-gray-300 hover:border-[var(--iica-blue)] hover:bg-blue-50/30'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                {uploadedFile ? (
                                    <div>
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                        <p className="font-bold text-green-700">{uploadedFile.name}</p>
                                        <p className="text-gray-500 text-sm mt-1">
                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · Listo para analizar
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="font-bold text-gray-700">Arrastra tu Carpeta Tributaria aquí</p>
                                        <p className="text-gray-500 text-sm mt-1">o haz clic para seleccionar · Solo PDF · Máx. 10MB</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setStep('intro')}
                                    className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                >
                                    ← Volver
                                </button>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!uploadedFile}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[var(--iica-secondary)] hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[56px]"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Analizar con IA
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-8"
                        >
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-[var(--iica-blue)] border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="h-8 w-8 text-[var(--iica-blue)]" />
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-[var(--iica-navy)] mb-2">Analizando tu perfil...</h4>
                            <div className="space-y-2 text-sm text-gray-500 max-w-xs mx-auto">
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                    ✓ Extrayendo nivel de ventas anuales
                                </motion.p>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                                    ✓ Verificando categoría tributaria
                                </motion.p>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>
                                    ✓ Cruzando con 48 fondos disponibles
                                </motion.p>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }}>
                                    ✓ Generando reporte de elegibilidad...
                                </motion.p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-extrabold text-green-600">{eligibleCount}</p>
                                    <p className="text-green-700 font-medium text-sm">Fondos Elegibles ✅</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                    <p className="text-3xl font-extrabold text-red-500">{notEligibleCount}</p>
                                    <p className="text-red-600 font-medium text-sm">No Elegibles ❌</p>
                                </div>
                            </div>

                            {/* Results List */}
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                {FONDOS_ANALISIS.map((fondo, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`p-4 rounded-xl border-l-4 ${fondo.eligible
                                            ? 'bg-green-50 border-green-400'
                                            : 'bg-red-50 border-red-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {fondo.eligible
                                                ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                : <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            }
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <p className="font-bold text-gray-800">{fondo.fondo}</p>
                                                    <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">
                                                        {fondo.institucion}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{fondo.razon}</p>
                                                {fondo.monto && (
                                                    <p className="text-sm font-bold text-green-600 mt-1">💰 {fondo.monto}</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => setStep('intro')}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                                >
                                    Nuevo Análisis
                                </button>
                                <a
                                    href="/consultores"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--iica-blue)] text-white font-bold rounded-xl hover:bg-[var(--iica-navy)] transition-colors"
                                >
                                    Buscar Consultor →
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
