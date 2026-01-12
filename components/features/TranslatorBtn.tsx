
'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export const TranslatorBtn = ({ text }: { text: string }) => {
    const [translated, setTranslated] = useState(false);
    const [content, setContent] = useState(text);
    const [loading, setLoading] = useState(false);

    const handleTranslate = async () => {
        if (translated) {
            setContent(text);
            setTranslated(false);
            return;
        }

        setLoading(true);
        // Mock translation simulation
        setTimeout(() => {
            setContent("Texto traducido simulado: " + text); // Replace with real API call later
            setTranslated(true);
            setLoading(false);
        }, 800);
    };

    return (
        <button
            onClick={handleTranslate}
            disabled={loading}
            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
        >
            <Sparkles className="w-3 h-3" />
            {loading ? 'Traduciendo...' : translated ? 'Ver original' : 'Traducir al Español'}
        </button>
    );
};
