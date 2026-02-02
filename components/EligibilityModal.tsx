'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Project } from '@/lib/data';

interface EligibilityModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
}

export default function EligibilityModal({ project, isOpen, onClose }: EligibilityModalProps) {
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

    const handleToggle = (index: number) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedItems(newChecked);
    };

    const hasChecklist = project.checklist && project.checklist.length > 0;
    const allChecked = hasChecklist && checkedItems.size === project.checklist!.length;
    const someUnchecked = hasChecklist && checkedItems.size > 0 && checkedItems.size < project.checklist!.length;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] px-6 py-5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Calculadora de Elegibilidad</h3>
                                    <p className="text-blue-100 text-sm">{project.nombre}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors p-1"
                                aria-label="Cerrar modal"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {hasChecklist ? (
                                <>
                                    <div className="mb-6">
                                        <p className="text-gray-600 mb-4">
                                            Marca todos los requisitos que cumples para verificar tu elegibilidad:
                                        </p>
                                        <div className="space-y-3">
                                            {project.checklist!.map((requirement, index) => (
                                                <label
                                                    key={index}
                                                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${checkedItems.has(index)
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedItems.has(index)}
                                                        onChange={() => handleToggle(index)}
                                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                    />
                                                    <span className={`flex-1 ${checkedItems.has(index) ? 'text-green-900 font-medium' : 'text-gray-700'}`}>
                                                        {requirement}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Result Message */}
                                    {checkedItems.size > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-xl border-2 flex items-start gap-3 ${allChecked
                                                    ? 'bg-green-50 border-green-500'
                                                    : 'bg-yellow-50 border-yellow-500'
                                                }`}
                                        >
                                            {allChecked ? (
                                                <>
                                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-bold text-green-900 mb-1">✅ ¡Eres Elegible!</h4>
                                                        <p className="text-green-800 text-sm">
                                                            Cumples con todos los requisitos básicos. Te recomendamos revisar las bases oficiales para conocer los detalles de postulación.
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-bold text-yellow-900 mb-1">⚠️ Te faltan requisitos</h4>
                                                        <p className="text-yellow-800 text-sm">
                                                            Has marcado {checkedItems.size} de {project.checklist!.length} requisitos. Revisa los que te faltan o consulta con un experto.
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-8 w-8 text-[var(--iica-blue)]" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-800 mb-2">Requisitos Específicos</h4>
                                    <p className="text-gray-600 mb-6">
                                        Este fondo no tiene una lista de requisitos predefinida en nuestra plataforma.
                                    </p>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                        <p className="text-sm text-gray-700">
                                            <strong className="text-[var(--iica-navy)]">Recomendación:</strong> Te invitamos a revisar las bases oficiales del concurso para conocer todos los requisitos de elegibilidad y postulación.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                                Esta calculadora es orientativa. Revisa siempre las bases oficiales.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-[var(--iica-navy)] hover:bg-[var(--iica-blue)] text-white font-bold rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
