"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, LifeBuoy, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const form = new FormData(e.currentTarget);
        const result = await signIn("credentials", {
            username: form.get("username"),
            password: form.get("password"),
            redirect: false,
        });

        if (result?.error) {
            setError("Credenciales no válidas. Intente nuevamente.");
            setIsLoading(false);
        } else {
            window.location.href = "/admin";
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md px-4 relative z-10"
            >
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl p-4 mb-4 border border-gray-50">
                        <Image src="/logos/iica.png" alt="IICA Logo" width={60} height={60} className="object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--iica-navy)] tracking-tight">Admin <span className="text-[var(--iica-blue)]">Radar</span></h1>
                    <p className="text-gray-500 mt-2 text-sm">Gestión de Oportunidades IICA Chile</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Usuario</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--iica-blue)] transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        name="username"
                                        type="text"
                                        placeholder="ej: admin_iica"
                                        required
                                        className="w-full bg-white border border-gray-200 rounded-2xl px-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]/20 focus:border-[var(--iica-blue)] transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--iica-blue)] transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-white border border-gray-200 rounded-2xl px-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]/20 focus:border-[var(--iica-blue)] transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"
                                >
                                    <LifeBuoy className="h-4 w-4" />
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-[var(--iica-blue)] to-[var(--iica-navy)] text-white rounded-2xl py-4 font-black transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Entrar al Sistema
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-50/50 p-4 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400">Acceso restringido para personal autorizado del IICA Chile.</p>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                    &copy; 2026 Instituto Interamericano de Cooperación para la Agricultura
                </div>
            </motion.div>
        </div>
    );
}
