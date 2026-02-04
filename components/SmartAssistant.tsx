'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, MessageSquare, Filter, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { Project } from '@/lib/data';
// import { useChat } from 'ai/react'; // Commmented out to avoid build errors if package missing, implemented custom below

// --- Custom Chat Hook (Lightweight version of Vercel AI SDK useChat) ---
const useCustomChat = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            });

            if (!response.ok) throw new Error('Error en chat');

            // Simple handling for now (assuming non-streaming for the custom hook fallback)
            // In a real Vercel AI SDK setup, this would handle streaming automatically
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiContent = '';

            // Update UI with placeholder
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;
                const chunk = decoder.decode(value);
                aiContent += chunk;
                // Naive stream update
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = aiContent; // Append to last message
                    return newMsgs;
                });
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Lo siento, tuve un problema conectando con el experto. Por favor intenta más tarde.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return { messages, input, handleInputChange: (e: any) => setInput(e.target.value), handleSubmit, isLoading };
};

interface SmartAssistantProps {
    projects: Project[];
}

export default function SmartAssistant({ projects }: SmartAssistantProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'filter' | 'chat'>('filter');

    // Toggle state
    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Floating Action Button (Mobile First) */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={toggleOpen}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-red-500 rotate-45' : 'bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)]'
                    } text-white md:hidden`}
            >
                {isOpen ? <X /> : <Sparkles />}
            </motion.button>

            {/* Main Container */}
            <AnimatePresence>
                {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`
                            fixed md:relative bottom-24 md:bottom-auto right-4 md:right-auto left-4 md:left-auto
                            md:w-full md:mb-8 z-40
                            bg-white md:bg-gradient-to-r md:from-[var(--iica-navy)] md:to-[var(--iica-blue)]
                            rounded-2xl shadow-2xl md:shadow-xl overflow-hidden
                            border border-gray-200 md:border-none
                        `}
                    >
                        {/* Desktop Background FX */}
                        <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 flex flex-col h-[500px] md:h-auto md:min-h-[300px]">
                            {/* Header */}
                            <div className="p-4 md:p-6 border-b md:border-white/10 flex justify-between items-center bg-[var(--iica-navy)] md:bg-transparent text-white">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-[var(--iica-yellow)]" />
                                    <div>
                                        <h2 className="font-bold text-lg md:text-xl leading-tight">Asistente IICA</h2>
                                        <p className="text-xs text-blue-200">Tu experto agrícola personal</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-xs font-semibold bg-white/10 rounded-lg p-1">
                                    <button
                                        onClick={() => setMode('filter')}
                                        className={`px-3 py-1.5 rounded-md transition-colors ${mode === 'filter' ? 'bg-white text-[var(--iica-navy)]' : 'text-blue-200 hover:text-white'}`}
                                    >
                                        Filtros
                                    </button>
                                    <button
                                        onClick={() => setMode('chat')}
                                        className={`px-3 py-1.5 rounded-md transition-colors ${mode === 'chat' ? 'bg-white text-[var(--iica-navy)]' : 'text-blue-200 hover:text-white'}`}
                                    >
                                        Chat IA
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 md:bg-transparent">
                                {mode === 'filter' ? (
                                    <FilterView projects={projects} />
                                ) : (
                                    <ChatView />
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// --- Sub-components ---

function FilterView({ projects }: { projects: Project[] }) {
    const router = useRouter();
    const [selectedProfile, setSelectedProfile] = useState<string>('');
    const [selectedNeed, setSelectedNeed] = useState<string>('');

    const calculateResults = () => {
        return projects.filter(project => {
            const matchesProfile = !selectedProfile || (project.beneficiarios && project.beneficiarios.includes(selectedProfile));
            const matchesNeed = !selectedNeed || project.categoria === selectedNeed;
            return matchesProfile && matchesNeed;
        }).length;
    };
    const resultCount = calculateResults();

    const handleViewResults = () => {
        const params = new URLSearchParams();
        if (selectedProfile) params.set('beneficiary', selectedProfile);
        if (selectedNeed) params.set('category', selectedNeed);
        const results = document.getElementById('convocatorias');
        if (results) results.scrollIntoView({ behavior: 'smooth' });
        router.push(`/?${params.toString()}#convocatorias`);
    };

    return (
        <div className="space-y-6 text-[var(--iica-navy)] md:text-white">
            <div className="space-y-3">
                <label className="text-sm font-bold opacity-80">👤 ¿Quién eres?</label>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: "Pequeño Productor", value: "Pequeño productor", icon: "👨‍🌾" },
                        { label: "Empresa", value: "Todo tipo de productor", icon: "🏢" },
                        { label: "Mujer / Joven", value: "Personas naturales", icon: "👩‍🌾" }
                    ].map(p => (
                        <button
                            key={p.value}
                            onClick={() => setSelectedProfile(selectedProfile === p.value ? '' : p.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${selectedProfile === p.value
                                    ? 'bg-[var(--iica-blue)] text-white border-transparent md:bg-white md:text-[var(--iica-navy)]'
                                    : 'bg-white border-gray-200 text-gray-600 md:bg-white/10 md:text-white md:border-white/20 hover:bg-gray-100'
                                }`}
                        >
                            <span>{p.icon}</span>
                            <span>{p.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold opacity-80">🎯 ¿Qué buscas?</label>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: "Riego", value: "Riego y Drenaje", icon: "💧" },
                        { label: "Suelos", value: "Suelos", icon: "🌱" },
                        { label: "Maquinaria", value: "Inversión", icon: "🚜" },
                        { label: "Innovación", value: "Innovación", icon: "💡" }
                    ].map(n => (
                        <button
                            key={n.value}
                            onClick={() => setSelectedNeed(selectedNeed === n.value ? '' : n.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${selectedNeed === n.value
                                    ? 'bg-[var(--iica-blue)] text-white border-transparent md:bg-white md:text-[var(--iica-navy)]'
                                    : 'bg-white border-gray-200 text-gray-600 md:bg-white/10 md:text-white md:border-white/20 hover:bg-gray-100'
                                }`}
                        >
                            <span>{n.icon}</span>
                            <span>{n.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleViewResults}
                className="w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 bg-[var(--iica-secondary)] text-white hover:brightness-110"
            >
                Ver {resultCount} {resultCount === 1 ? 'Resultado' : 'Resultados'}
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
}

function ChatView() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useCustomChat();
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white md:bg-white/5 rounded-xl md:border md:border-white/10 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px] md:max-h-[300px]">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 md:text-blue-100 py-8">
                        <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Hola, soy tu experto agrícola.</p>
                        <p className="text-xs mt-2 opacity-80">Pregúntame sobre riego, suelos, o qué fondo te conviene.</p>
                    </div>
                )}
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user'
                                ? 'bg-[var(--iica-blue)] text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none md:bg-white/90'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 md:bg-white/90 rounded-2xl rounded-bl-none px-4 py-3">
                            <Loader2 className="h-5 w-5 animate-spin text-[var(--iica-blue)]" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-gray-50 md:bg-white/10 border-t border-gray-200 md:border-white/10">
                <div className="relative">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Escribe tu pregunta..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl border-none focus:ring-2 focus:ring-[var(--iica-blue)] bg-white text-gray-900 shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-[var(--iica-blue)] text-white rounded-lg hover:bg-[var(--iica-navy)] disabled:opacity-50 transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
