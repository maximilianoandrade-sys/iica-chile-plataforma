"use client";
import Image from "next/image";
import { getInstitutionalLogo } from "@/lib/logos";
import { useState } from "react";import { Building2 } from "lucide-react";

export function InstitutionLogo({ nombre, size = 40 }: { nombre: string; size?: number }) {
    const [error, setError] = useState(false);
    const safeName = nombre || "?";
    const src = getInstitutionalLogo(safeName);
    const hasValidSrc = src && !error;

    return (
        <div
            className="rounded-md overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100"
            style={{ width: size, height: size, minWidth: size }}
        >
            {hasValidSrc ? (
                <Image
                    src={src}
                    alt={`Logo ${nombre}`}
                    width={size}
                    height={size}
                    onError={() => setError(true)}
                    className="object-contain p-1"
                />
            ) : (
                <Building2 className="text-gray-400" size={size * 0.5} />
            )}
        </div>
    );
}
