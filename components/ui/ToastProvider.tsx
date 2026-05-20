"use client";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { X, CheckCircle, AlertCircle } from "lucide-react";

type ToastType = "success" | "error";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const DURATIONS: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
};

const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Clear timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    // Animate out
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    // Remove after transition
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id = `toast-${Date.now()}-${counterRef.current++}`;
      setToasts((prev) => {
        const next = [...prev, { id, message, type, visible: false }];
        // Keep only last MAX_TOASTS
        return next.slice(-MAX_TOASTS);
      });

      // Make visible after mount (for animation)
      requestAnimationFrame(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: true } : t)));
      });

      // Auto-dismiss
      const timer = setTimeout(() => dismiss(id), DURATIONS[type]);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const success = useCallback((message: string) => addToast(message, "success"), [addToast]);
  const error = useCallback((message: string) => addToast(message, "error"), [addToast]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm md:w-auto pointer-events-none max-md:right-0 max-md:left-0 max-md:mx-auto max-md:px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            aria-live={toast.type === "error" ? "assertive" : "polite"}
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg border-l-4 transition-all duration-200",
              toast.visible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0",
              toast.type === "success" && "border-l-green-500",
              toast.type === "error" && "border-l-red-500"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            )}
            <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">
              {toast.message}
            </span>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
