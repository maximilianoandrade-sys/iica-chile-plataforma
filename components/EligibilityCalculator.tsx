'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, CheckCircle, AlertCircle } from 'lucide-react';

export default function EligibilityCalculator({
    isOpen,
    onClose,
    projectName
}: {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
}) {
    const [step, setStep] = useState(1);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<Record<string, boolean>>({});

    const questions = [
        { id: 'q1', text: "¿Tu proyecto está ubicado en una zona rural?", weight: 20 },
        { id: 'q2', text: "¿Cuentas con iniciación de actividades en el SII?", weight: 30 },
        { id: 'q3', text: "¿Tienes al día tus obligaciones tributarias (Carpeta Tributaria)?", weight: 30 },
        { id: 'q4', text: "¿Posees derechos de propiedad o arrendamiento del predio?", weight: 20 },
    ];

    const handleAnswer = (questionId: string, answer: boolean, weight: number) => {
        setAnswers({ ...answers, [questionId]: answer });
        if (answer) {
            setScore(prev => prev + weight);
        }
        if (step < questions.length) {
            setStep(prev => prev + 1);
        } else {
            setStep(questions.length + 1); // Finish
        }
    };

    const reset = () => {
        setStep(1);
        setScore(0);
        setAnswers({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
                <div className="bg-[var(--iica-navy)] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-[var(--iica-yellow)]" />
                        Calculadora de Elegibilidad
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/10 rounded-full p-1 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8">
                    {step <= questions.length ? (
                        <>
                            <div className="mb-6">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pregunta {step} de {questions.length}</span>
                                <h4 className="text-xl font-bold text-gray-800 mt-2">{questions[step - 1].text}</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleAnswer(questions[step - 1].id, false, questions[step - 1].weight)}
                                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all font-bold text-gray-600 hover:text-red-700"
                                >
                                    No
                                </button>
                                <button
                                    onClick={() => handleAnswer(questions[step - 1].id, true, questions[step - 1].weight)}
                                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all font-bold text-gray-600 hover:text-green-700"
                                >
                                    Sí
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center animate-in zoom-in spin-in-1">
                            <div className="mb-6 relative inline-block">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-gray-100"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={351.86}
                                        strokeDashoffset={351.86 - (351.86 * score) / 100}
                                        className={`${score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <span className="text-3xl font-bold block">{score}%</span>
                                </div>
                            </div>

                            <h4 className="text-2xl font-bold text-gray-800 mb-2">
                                {score > 80 ? '¡Alta Probabilidad!' : score > 50 ? 'Probabilidad Media' : 'Probabilidad Baja'}
                            </h4>
                            <p className="text-gray-600 mb-6">
                                {score > 80
                                    ? "Cumples con la mayoría de los requisitos clave. Te recomendamos revisar las bases y postular."
                                    : "Podrías necesitar regularizar algunos documentos antes de postular."}
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={reset}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 underline text-sm"
                                >
                                    Volver a calcular
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-[var(--iica-blue)] text-white font-bold rounded-lg hover:bg-[var(--iica-navy)] transition-colors"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {step <= questions.length && (
                    <div className="bg-gray-50 px-8 py-3 text-center border-t border-gray-100">
                        <p className="text-xs text-gray-400">Este cálculo es referencial y no garantiza la adjudicación.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
