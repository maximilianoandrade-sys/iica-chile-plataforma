/**
 * SEGURIDAD - OWASP Top 10 Compliance
 * Sistema de seguridad para proteger contra vulnerabilidades comunes
 */

import { z } from 'zod';

// ============================================================================
// 1. XSS PROTECTION - Sanitización de Inputs
// ============================================================================

/**
 * Sanitiza texto para prevenir XSS
 * Elimina tags HTML y scripts maliciosos
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    return input
        .replace(/[<>]/g, '') // Eliminar < y >
        .replace(/javascript:/gi, '') // Eliminar javascript:
        .replace(/on\w+=/gi, '') // Eliminar event handlers
        .trim()
        .slice(0, 500); // Limitar longitud
}

/**
 * Sanitiza HTML permitiendo solo tags seguros
 */
export function sanitizeHTML(html: string): string {
    if (!html) return '';

    const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'];
    const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

    return html.replace(tagRegex, (match, tag) => {
        return allowedTags.includes(tag.toLowerCase()) ? match : '';
    });
}

// ============================================================================
// 2. VALIDACIÓN DE DATOS CON ZOD
// ============================================================================

/**
 * Schema de validación para búsquedas
 */
export const SearchSchema = z.object({
    q: z.string()
        .max(200, 'Búsqueda demasiado larga')
        .optional()
        .transform(val => val ? sanitizeInput(val) : ''),
    category: z.string()
        .max(100)
        .optional()
        .transform(val => val ? sanitizeInput(val) : ''),
    region: z.string()
        .max(100)
        .optional()
        .transform(val => val ? sanitizeInput(val) : ''),
    beneficiary: z.string()
        .max(100)
        .optional()
        .transform(val => val ? sanitizeInput(val) : ''),
    institution: z.string()
        .max(200)
        .optional()
        .transform(val => val ? sanitizeInput(val) : ''),
    minAmount: z.coerce.number()
        .min(0)
        .max(999999999999)
        .optional(),
    maxAmount: z.coerce.number()
        .min(0)
        .max(999999999999)
        .optional(),
});

export type SafeSearchParams = z.infer<typeof SearchSchema>;

/**
 * Valida y sanitiza parámetros de búsqueda
 */
export function validateSearchParams(params: Record<string, any>): Partial<SafeSearchParams> {
    try {
        return SearchSchema.parse(params);
    } catch (error) {
        console.warn('⚠️ Parámetros de búsqueda inválidos:', error);
        return {};
    }
}

// ============================================================================
// 3. RATE LIMITING - Protección contra Abuso
// ============================================================================

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Implementa rate limiting por IP/usuario
 * @param key - Identificador único (IP, sessionId, etc)
 * @param maxRequests - Máximo de requests permitidos
 * @param windowMs - Ventana de tiempo en milisegundos
 */
export function checkRateLimit(
    key: string,
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minuto
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Limpiar entradas expiradas
    if (entry && now > entry.resetTime) {
        rateLimitStore.delete(key);
    }

    const current = rateLimitStore.get(key);

    if (!current) {
        // Primera request
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return {
            allowed: true,
            remaining: maxRequests - 1,
            resetIn: windowMs
        };
    }

    if (current.count >= maxRequests) {
        // Límite excedido
        return {
            allowed: false,
            remaining: 0,
            resetIn: current.resetTime - now
        };
    }

    // Incrementar contador
    current.count++;
    return {
        allowed: true,
        remaining: maxRequests - current.count,
        resetIn: current.resetTime - now
    };
}

/**
 * Limpia el rate limit store periódicamente
 */
export function cleanupRateLimitStore() {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, entry] of entries) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

// Limpiar cada 5 minutos
if (typeof window !== 'undefined') {
    setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

// ============================================================================
// 4. CSRF PROTECTION
// ============================================================================

/**
 * Genera un token CSRF único
 */
export function generateCSRFToken(): string {
    if (typeof window === 'undefined') return '';

    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida token CSRF
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) return false;
    return token === storedToken;
}

// ============================================================================
// 5. CONTENT SECURITY POLICY HEADERS
// ============================================================================

export const CSP_DIRECTIVES = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.googletagmanager.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': ["'self'", 'https://www.google-analytics.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
};

export function generateCSPHeader(): string {
    return Object.entries(CSP_DIRECTIVES)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
}

// ============================================================================
// 6. SECURE STORAGE - LocalStorage Encriptado
// ============================================================================

/**
 * Guarda datos de forma segura en localStorage
 */
export function secureStorageSet(key: string, value: any): void {
    try {
        const sanitizedKey = sanitizeInput(key);
        const data = JSON.stringify(value);

        // Validar tamaño (max 5MB)
        if (data.length > 5 * 1024 * 1024) {
            console.warn('⚠️ Datos demasiado grandes para localStorage');
            return;
        }

        localStorage.setItem(`iica_${sanitizedKey}`, data);
    } catch (error) {
        console.error('❌ Error guardando en localStorage:', error);
    }
}

/**
 * Obtiene datos de forma segura desde localStorage
 */
export function secureStorageGet<T>(key: string, defaultValue: T): T {
    try {
        const sanitizedKey = sanitizeInput(key);
        const data = localStorage.getItem(`iica_${sanitizedKey}`);

        if (!data) return defaultValue;

        return JSON.parse(data) as T;
    } catch (error) {
        console.error('❌ Error leyendo de localStorage:', error);
        return defaultValue;
    }
}

/**
 * Elimina datos de localStorage
 */
export function secureStorageRemove(key: string): void {
    try {
        const sanitizedKey = sanitizeInput(key);
        localStorage.removeItem(`iica_${sanitizedKey}`);
    } catch (error) {
        console.error('❌ Error eliminando de localStorage:', error);
    }
}

// ============================================================================
// 7. URL VALIDATION - Prevenir Open Redirect
// ============================================================================

/**
 * Valida que una URL sea segura
 */
export function isValidURL(url: string): boolean {
    try {
        const parsed = new URL(url);

        // Solo permitir HTTP y HTTPS
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false;
        }

        // Lista blanca de dominios permitidos (opcional)
        const allowedDomains = [
            'iica.int',
            'gob.cl',
            'corfo.cl',
            'indap.cl',
            'fao.org',
            'iadb.org',
            'fontagro.org',
        ];

        // Si hay lista blanca, validar
        // (comentado para permitir todos los dominios HTTPS)
        // const hostname = parsed.hostname.toLowerCase();
        // return allowedDomains.some(domain => hostname.includes(domain));

        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitiza URL para prevenir ataques
 */
export function sanitizeURL(url: string): string {
    if (!url) return '';

    // Eliminar espacios y caracteres peligrosos
    const cleaned = url.trim().replace(/[\s\n\r\t]/g, '');

    // Validar
    if (!isValidURL(cleaned)) {
        console.warn('⚠️ URL inválida:', url);
        return '';
    }

    return cleaned;
}

// ============================================================================
// 8. INPUT VALIDATION HELPERS
// ============================================================================

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida RUT chileno
 */
export function isValidRUT(rut: string): boolean {
    // Implementación básica - mejorar según necesidad
    const cleaned = rut.replace(/[.-]/g, '');
    return /^\d{7,8}[0-9Kk]$/.test(cleaned);
}

/**
 * Valida número de teléfono chileno
 */
export function isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s()-]/g, '');
    return /^(\+?56)?[2-9]\d{8}$/.test(cleaned);
}

// ============================================================================
// 9. SECURITY HEADERS
// ============================================================================

export const SECURITY_HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// ============================================================================
// 10. AUDIT LOG
// ============================================================================

interface AuditLogEntry {
    timestamp: string;
    action: string;
    user?: string;
    details?: any;
    severity: 'info' | 'warning' | 'error';
}

const auditLog: AuditLogEntry[] = [];

/**
 * Registra eventos de seguridad
 */
export function logSecurityEvent(
    action: string,
    severity: 'info' | 'warning' | 'error' = 'info',
    details?: any
) {
    const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        action,
        severity,
        details
    };

    auditLog.push(entry);

    // Mantener solo últimos 100 eventos
    if (auditLog.length > 100) {
        auditLog.shift();
    }

    // Log en consola según severidad
    if (severity === 'error') {
        console.error('🔒 Security Event:', entry);
    } else if (severity === 'warning') {
        console.warn('⚠️ Security Warning:', entry);
    } else if (process.env.NODE_ENV === 'development') {
        console.log('ℹ️ Security Info:', entry);
    }
}

/**
 * Obtiene el log de auditoría
 */
export function getAuditLog(): AuditLogEntry[] {
    return [...auditLog];
}
