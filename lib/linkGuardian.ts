/**
 * EL GUARDIÁN DE ENLACES
 * Sistema de verificación y corrección silenciosa de enlaces
 * 
 * Lógica:
 * 1. Si el link oficial responde (200 OK) -> Mantener
 * 2. Si el link oficial falla (404/500) -> Crear búsqueda de Google
 * 3. Si no hay info suficiente -> Ocultar botón
 */

'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// TIPOS
// ============================================================================

export interface LinkStatus {
    url: string;
    status: 'valid' | 'fallback' | 'hidden';
    fallbackUrl?: string;
    checked: boolean;
}

interface LinkCacheEntry {
    status: LinkStatus;
    timestamp: number;
    expiresAt: number;
}

// ============================================================================
// CACHE DE VERIFICACIONES
// ============================================================================

const linkCache = new Map<string, LinkCacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Obtiene el estado del link desde caché
 */
function getCachedLinkStatus(url: string): LinkStatus | null {
    const cached = linkCache.get(url);

    if (!cached) return null;

    // Verificar expiración
    if (Date.now() > cached.expiresAt) {
        linkCache.delete(url);
        return null;
    }

    return cached.status;
}

/**
 * Guarda el estado del link en caché
 */
function cacheLinkStatus(url: string, status: LinkStatus): void {
    linkCache.set(url, {
        status,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_TTL
    });

    // Guardar en localStorage para persistencia
    try {
        const cacheData = Array.from(linkCache.entries());
        localStorage.setItem('iica_link_cache', JSON.stringify(cacheData));
    } catch (error) {
        console.warn('No se pudo guardar caché de enlaces:', error);
    }
}

/**
 * Carga el caché desde localStorage
 */
function loadLinkCache(): void {
    try {
        const cached = localStorage.getItem('iica_link_cache');
        if (cached) {
            const entries = JSON.parse(cached);
            const now = Date.now();

            entries.forEach(([url, entry]: [string, LinkCacheEntry]) => {
                // Solo cargar entradas no expiradas
                if (now < entry.expiresAt) {
                    linkCache.set(url, entry);
                }
            });
        }
    } catch (error) {
        console.warn('No se pudo cargar caché de enlaces:', error);
    }
}

// Cargar caché al inicio
if (typeof window !== 'undefined') {
    loadLinkCache();
}

// ============================================================================
// VERIFICACIÓN DE ENLACES
// ============================================================================

/**
 * Verifica si un enlace está activo usando HEAD request
 */
async function checkLinkStatus(url: string): Promise<boolean> {
    try {
        // Usar API route para evitar CORS
        const response = await fetch(`/api/check-link?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            cache: 'no-cache'
        });

        const data = await response.json();
        return data.isValid === true;
    } catch (error) {
        console.warn('Error verificando enlace:', url, error);
        return false;
    }
}

/**
 * Genera URL de búsqueda de Google como fallback
 */
function generateGoogleSearchUrl(originalUrl: string, projectName: string): string {
    try {
        const domain = new URL(originalUrl).hostname;
        const searchQuery = `site:${domain} ${projectName} bases`;
        return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    } catch (error) {
        // Si no se puede parsear la URL, buscar solo por nombre
        const searchQuery = `${projectName} bases convocatoria`;
        return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    }
}

/**
 * Determina el estado final del enlace
 */
export async function getLinkStatus(
    url: string,
    projectName: string,
    institution?: string
): Promise<LinkStatus> {
    // Verificar caché primero
    const cached = getCachedLinkStatus(url);
    if (cached) {
        return cached;
    }

    // Si no hay URL, ocultar
    if (!url || url.trim() === '') {
        const status: LinkStatus = {
            url: '',
            status: 'hidden',
            checked: true
        };
        cacheLinkStatus(url, status);
        return status;
    }

    // Verificar si el enlace está activo
    const isValid = await checkLinkStatus(url);

    if (isValid) {
        // Enlace válido, mantener
        const status: LinkStatus = {
            url,
            status: 'valid',
            checked: true
        };
        cacheLinkStatus(url, status);
        return status;
    }

    // Enlace inválido, crear fallback
    if (projectName && projectName.trim() !== '') {
        const fallbackUrl = generateGoogleSearchUrl(url, projectName);
        const status: LinkStatus = {
            url,
            status: 'fallback',
            fallbackUrl,
            checked: true
        };
        cacheLinkStatus(url, status);
        return status;
    }

    // No hay información suficiente, ocultar
    const status: LinkStatus = {
        url,
        status: 'hidden',
        checked: true
    };
    cacheLinkStatus(url, status);
    return status;
}

// ============================================================================
// HOOK PARA COMPONENTES
// ============================================================================

/**
 * Hook para usar el guardián de enlaces en componentes
 */
export function useLinkGuardian(url: string, projectName: string, institution?: string) {
    const [linkStatus, setLinkStatus] = useState<LinkStatus>({
        url,
        status: 'valid', // Asumir válido inicialmente
        checked: false
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function checkLink() {
            setIsLoading(true);

            const status = await getLinkStatus(url, projectName, institution);

            if (mounted) {
                setLinkStatus(status);
                setIsLoading(false);
            }
        }

        checkLink();

        return () => {
            mounted = false;
        };
    }, [url, projectName, institution]);

    return {
        linkStatus,
        isLoading,
        shouldShow: linkStatus.status !== 'hidden',
        finalUrl: linkStatus.status === 'fallback' ? linkStatus.fallbackUrl : url,
        isFallback: linkStatus.status === 'fallback'
    };
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Limpia el caché de enlaces
 */
export function clearLinkCache(): void {
    linkCache.clear();
    try {
        localStorage.removeItem('iica_link_cache');
    } catch (error) {
        console.warn('No se pudo limpiar caché de enlaces:', error);
    }
}

/**
 * Obtiene estadísticas del caché
 */
export function getLinkCacheStats(): {
    total: number;
    valid: number;
    fallback: number;
    hidden: number;
} {
    const stats = {
        total: linkCache.size,
        valid: 0,
        fallback: 0,
        hidden: 0
    };

    const entries = Array.from(linkCache.entries());
    for (const [, entry] of entries) {
        switch (entry.status.status) {
            case 'valid':
                stats.valid++;
                break;
            case 'fallback':
                stats.fallback++;
                break;
            case 'hidden':
                stats.hidden++;
                break;
        }
    }

    return stats;
}

/**
 * Fuerza la re-verificación de un enlace
 */
export async function recheckLink(url: string, projectName: string): Promise<LinkStatus> {
    // Eliminar del caché
    linkCache.delete(url);

    // Verificar nuevamente
    return getLinkStatus(url, projectName);
}
