'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                aria-label="Cambiar tema"
            >
                <div className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500" aria-hidden="true" />
            ) : (
                <Moon className="w-5 h-5 text-gray-600" aria-hidden="true" />
            )}
        </button>
    );
}
