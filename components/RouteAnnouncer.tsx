'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('RouteAnnouncer');

/**
 * RouteAnnouncer — WCAG 2.4.3 / 4.1.3
 *
 * En SPAs con Next.js App Router, el foco no se mueve automáticamente al
 * navegar entre rutas. Este componente:
 *   1. Detecta cambios de pathname con usePathname().
 *   2. Anuncia el nuevo título de página a lectores de pantalla mediante
 *      una región aria-live="polite" oculta visualmente.
 *   3. Mueve el foco al contenedor #main-content para que el usuario de
 *      teclado/lector de pantalla empiece a leer desde el inicio del
 *      contenido nuevo, no desde donde estaba antes.
 *
 * No produce ningún output visual.
 */
export default function RouteAnnouncer() {
    const pathname = usePathname();
    const announceRef = useRef<HTMLDivElement>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Saltar el primer render — no anunciar la carga inicial de la página
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Pequeño delay para que el DOM del nuevo route se haya pintado
        const timer = setTimeout(() => {
            // 1. Anunciar título de la página al lector de pantalla
            if (announceRef.current) {
                const pageTitle = document.title || 'Página nueva';
                announceRef.current.textContent = '';
                // Forzar re-anuncio limpiando y seteando de nuevo
                requestAnimationFrame(() => {
                    if (announceRef.current) {
                        announceRef.current.textContent = `Navegaste a: ${pageTitle}`;
                        logger.debug('RouteAnnouncer: announced route change', { pathname, title: pageTitle });
                    }
                });
            }

            // 2. Mover el foco al contenedor principal para que el usuario
            //    de teclado empiece desde el inicio del contenido nuevo
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.focus({ preventScroll: true });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <div
            ref={announceRef}
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            // El div permanece vacío entre navegaciones — se llena solo al cambiar ruta
        />
    );
}
