/**
 * PERFORMANCE OPTIMIZATION - Core Web Vitals
 * Sistema de optimización para mejorar LCP, FID, CLS y otras métricas
 */

// ============================================================================
// 1. WEB VITALS MONITORING
// ============================================================================

export interface WebVitalsMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
}

/**
 * Reporta métricas de Web Vitals
 */
export function reportWebVitals(metric: WebVitalsMetric) {
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ${metric.name}:`, {
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta
        });
    }

    // Enviar a analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
        });
    }
}

// ============================================================================
// 2. IMAGE OPTIMIZATION
// ============================================================================

/**
 * Genera srcset para imágenes responsive
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
    return widths
        .map(width => `${baseUrl}?w=${width} ${width}w`)
        .join(', ');
}

/**
 * Calcula el tamaño óptimo de imagen según viewport
 */
export function getOptimalImageSize(): number {
    if (typeof window === 'undefined') return 1920;

    const width = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;

    // Tamaños comunes
    const sizes = [320, 640, 768, 1024, 1280, 1920, 2560];
    const targetWidth = width * dpr;

    // Encontrar el tamaño más cercano
    return sizes.find(size => size >= targetWidth) || 2560;
}

/**
 * Lazy load de imágenes con Intersection Observer
 */
export function lazyLoadImage(img: HTMLImageElement) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLImageElement;
                const src = target.dataset.src;

                if (src) {
                    target.src = src;
                    target.removeAttribute('data-src');
                    observer.unobserve(target);
                }
            }
        });
    }, {
        rootMargin: '50px' // Cargar 50px antes de que sea visible
    });

    observer.observe(img);
}

// ============================================================================
// 3. CODE SPLITTING & LAZY LOADING
// ============================================================================

/**
 * Lazy load de componentes con retry
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
    componentImport: () => Promise<{ default: T }>,
    retries = 3,
    interval = 1000
): Promise<{ default: T }> {
    return new Promise((resolve, reject) => {
        componentImport()
            .then(resolve)
            .catch((error) => {
                if (retries === 0) {
                    reject(error);
                    return;
                }

                setTimeout(() => {
                    lazyWithRetry(componentImport, retries - 1, interval)
                        .then(resolve)
                        .catch(reject);
                }, interval);
            });
    });
}

// ============================================================================
// 4. DEBOUNCE & THROTTLE
// ============================================================================

/**
 * Debounce function para optimizar eventos frecuentes
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para limitar ejecuciones
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================================================
// 5. CACHE MANAGEMENT
// ============================================================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class CacheManager {
    private cache = new Map<string, CacheEntry<any>>();
    private maxSize = 100;

    /**
     * Guarda datos en caché
     */
    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        // Limpiar si excede el tamaño máximo
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl
        });
    }

    /**
     * Obtiene datos del caché
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Verificar expiración
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Elimina entrada del caché
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Limpia todo el caché
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Limpia entradas expiradas
     */
    cleanup(): void {
        const now = Date.now();
        const entries = Array.from(this.cache.entries());
        for (const [key, entry] of entries) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
}

export const cache = new CacheManager();

// Limpiar caché cada 5 minutos
if (typeof window !== 'undefined') {
    setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}

// ============================================================================
// 6. PREFETCH & PRELOAD
// ============================================================================

/**
 * Prefetch de recursos
 */
export function prefetchResource(url: string, type: 'script' | 'style' | 'image' = 'script') {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = type;
    link.href = url;
    document.head.appendChild(link);
}

/**
 * Preload de recursos críticos
 */
export function preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script') {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = type;
    link.href = url;

    if (type === 'font') {
        link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
}

// ============================================================================
// 7. BUNDLE SIZE OPTIMIZATION
// ============================================================================

/**
 * Verifica si un módulo debe cargarse dinámicamente
 */
export function shouldLoadDynamically(moduleSize: number, threshold: number = 50000): boolean {
    return moduleSize > threshold;
}

/**
 * Calcula el tamaño estimado de un objeto
 */
export function estimateObjectSize(obj: any): number {
    const str = JSON.stringify(obj);
    return new Blob([str]).size;
}

// ============================================================================
// 8. PERFORMANCE MONITORING
// ============================================================================

interface PerformanceMark {
    name: string;
    startTime: number;
    duration?: number;
}

class PerformanceMonitor {
    private marks = new Map<string, number>();
    private measures: PerformanceMark[] = [];

    /**
     * Marca el inicio de una operación
     */
    mark(name: string): void {
        this.marks.set(name, performance.now());
    }

    /**
     * Mide el tiempo desde una marca
     */
    measure(name: string, startMark: string): number {
        const startTime = this.marks.get(startMark);

        if (!startTime) {
            console.warn(`⚠️ Marca "${startMark}" no encontrada`);
            return 0;
        }

        const duration = performance.now() - startTime;

        this.measures.push({
            name,
            startTime,
            duration
        });

        if (process.env.NODE_ENV === 'development') {
            console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    /**
     * Obtiene todas las mediciones
     */
    getMeasures(): PerformanceMark[] {
        return [...this.measures];
    }

    /**
     * Limpia las mediciones
     */
    clear(): void {
        this.marks.clear();
        this.measures = [];
    }
}

export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// 9. RESOURCE HINTS
// ============================================================================

/**
 * Agrega DNS prefetch para dominios externos
 */
export function addDNSPrefetch(domains: string[]) {
    if (typeof document === 'undefined') return;

    domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
    });
}

/**
 * Agrega preconnect para dominios críticos
 */
export function addPreconnect(domains: string[]) {
    if (typeof document === 'undefined') return;

    domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = `//${domain}`;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });
}

// ============================================================================
// 10. MEMORY MANAGEMENT
// ============================================================================

/**
 * Limpia referencias para prevenir memory leaks
 */
export function cleanup(refs: any[]) {
    refs.forEach(ref => {
        if (ref && typeof ref === 'object') {
            Object.keys(ref).forEach(key => {
                delete ref[key];
            });
        }
    });
}

/**
 * Monitorea el uso de memoria (solo en desarrollo)
 */
export function monitorMemory() {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

    const memory = (performance as any).memory;

    if (memory) {
        console.log('💾 Memoria:', {
            usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
            totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
            limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
        });
    }
}

// ============================================================================
// 11. CRITICAL CSS EXTRACTION
// ============================================================================

/**
 * Extrae CSS crítico para above-the-fold content
 */
export function extractCriticalCSS(html: string): string {
    // Implementación simplificada - en producción usar herramienta como critical
    const criticalSelectors = [
        'body',
        'header',
        'nav',
        '.hero',
        '.above-fold'
    ];

    // Esta es una implementación básica
    // En producción, usar una librería especializada
    return '/* Critical CSS placeholder */';
}

// ============================================================================
// 12. FONT LOADING OPTIMIZATION
// ============================================================================

/**
 * Optimiza la carga de fuentes
 */
export function optimizeFontLoading() {
    if (typeof document === 'undefined') return;

    // Usar font-display: swap
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'Inter';
            font-display: swap;
            src: local('Inter'), url('/fonts/inter.woff2') format('woff2');
        }
    `;
    document.head.appendChild(style);
}

// ============================================================================
// 13. INTERSECTION OBSERVER UTILITIES
// ============================================================================

/**
 * Crea un observer para lazy loading
 */
export function createLazyObserver(
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
): IntersectionObserver {
    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry);
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.01,
        ...options
    });
}

// ============================================================================
// 14. REQUEST ANIMATION FRAME UTILITIES
// ============================================================================

/**
 * Ejecuta callback en el próximo frame
 */
export function nextFrame(callback: () => void): number {
    return requestAnimationFrame(() => {
        requestAnimationFrame(callback);
    });
}

/**
 * Ejecuta callback cuando el navegador esté idle
 */
export function whenIdle(callback: () => void, timeout: number = 2000): void {
    if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(callback, { timeout });
    } else {
        setTimeout(callback, timeout);
    }
}
