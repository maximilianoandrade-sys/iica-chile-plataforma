import { CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error";
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${type === "success"
                    ? "bg-white border-green-200 text-green-800"
                    : "bg-white border-red-200 text-red-800"
                }`}>
                {type === "success" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                <span className="font-medium text-sm">{message}</span>
            </div>
        </div>
    );
}
