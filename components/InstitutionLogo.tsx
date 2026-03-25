"use client";
import Image from "next/image";
import { getInstitutionalLogo } from "@/lib/logos";
import { useState } from "react";

export function InstitutionLogo({ nombre, size = 40 }: { nombre: string; size?: number }) {
    const [error, setError] = useState(false);
    const safeName = nombre || "?";
    const src = !error ? getInstitutionalLogo(safeName) : `https://placehold.co/${size}x${size}/2E7D32/white?text=${encodeURIComponent(safeName.charAt(0))}`;

    return (
        <div
            className="rounded-md overflow-hidden flex items-center justify-center bg-white border"
            style={{ width: size, height: size, minWidth: size }}
        >
            <Image
                src={src}
                alt={`Logo ${nombre}`}
                width={size}
                height={size}
                onError={() => setError(true)}
                className="object-contain p-1"
            />
        </div>
    );
}
