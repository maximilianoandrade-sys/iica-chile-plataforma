"use client";

import Image from "next/image";
import { getInstitutionalLogo, getLogoFallbackSvg } from "@/lib/logos";
import { useState } from "react";

export function InstitutionLogo({ nombre, size = 40 }: { nombre: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const resolved = getInstitutionalLogo(nombre);

  const showImage = resolved.hasAsset && !imgError;

  const fontSize = resolved.sigla.length >= 4 ? Math.round(size * 0.28) : Math.round(size * 0.35);

  return (
    <div
      className="rounded-md overflow-hidden flex items-center justify-center bg-white border"
      style={{ width: size, height: size, minWidth: size }}
    >
      {showImage ? (
        <Image
          src={resolved.path!}
          alt={`Logo ${nombre}`}
          width={size}
          height={size}
          onError={() => setImgError(true)}
          className="object-contain p-1"
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${nombre} badge`}
        >
          <rect width={size} height={size} rx={6} fill={resolved.brandColor} />
          <text
            x="50%"
            y="50%"
            fontFamily="system-ui,-apple-system,sans-serif"
            fontSize={fontSize}
            fontWeight={600}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {resolved.sigla}
          </text>
        </svg>
      )}
    </div>
  );
}
