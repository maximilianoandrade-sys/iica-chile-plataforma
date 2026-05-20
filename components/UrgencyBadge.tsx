'use client';

import { Calendar, AlertCircle } from "lucide-react";
import { formatDeadline, pluralizeDias } from "@/lib/data";
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('UrgencyBadge');

export function UrgencyBadge({ date, mobile = false }: { date: string; mobile?: boolean }) {
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isExpired = targetDate.getTime() < today.getTime();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isUrgent = diffDays <= 7 && diffDays >= 0;

    if (isExpired) {
        return (
            <div className="flex flex-col items-start">
                <span className="text-gray-400 text-sm flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Finalizado</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">🔴 Cerrado</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-0.5">
            <div className={`flex items-center gap-1.5 ${isUrgent ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                {!mobile && <Calendar className="h-4 w-4 text-gray-400" />}
                <span className="text-sm">
                    {isUrgent ? `¡Cierra en ${pluralizeDias(diffDays)}!` : formatDeadline(date)}
                </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                🟢 Abierto
            </span>
        </div>
    );
}
