"use client";
import { InstitutionLogo } from "./InstitutionLogo";

interface Oportunidad {
    id: string;
    nombre: string;
    institucion: string;
    cierre: string;
    diasRestantes: number;
    ambito: "Internacional" | "Nacional" | "Regional";
    viabilidad: "Alta" | "Media" | "Baja";
    url: string;
    adenda?: boolean;
}

export function OportunidadCard({ op }: { op: Oportunidad }) {
    const colorViabilidad = {
        Alta: "bg-green-100 text-green-800",
        Media: "bg-yellow-100 text-yellow-800",
        Baja: "bg-red-100 text-red-800",
    };
    const colorDias = op.diasRestantes <= 7
        ? "text-red-600 font-bold"
        : op.diasRestantes <= 30
            ? "text-orange-500 font-semibold"
            : "text-green-700";

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-start gap-3">
                <InstitutionLogo nombre={op.institucion} size={44} />
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-1">
                        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                            {op.ambito}
                        </span>
                        <span className={`text-xs rounded-full px-2 py-0.5 ${colorViabilidad[op.viabilidad]}`}>
                            IA: {op.viabilidad}
                        </span>
                        {op.adenda && (
                            <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                                ADENDAS
                            </span>
                        )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                        {op.nombre}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{op.institucion}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div>
                    <p className="text-xs text-gray-400">Cierre</p>
                    <p className={`text-sm ${colorDias}`}>
                        {op.cierre} · {op.diasRestantes}d
                    </p>
                </div>

                <a
                    href={op.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition"
                >
                    Ver Bases →
                </a>
            </div>
        </div>
    );
}
