/**
 * SEGURIDAD - Headers de seguridad HTTP
 */

// ============================================================================
// SECURITY HEADERS
// ============================================================================

export const SECURITY_HEADERS: Record<string, string> = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://generativelanguage.googleapis.com",
        "frame-src 'self' https://www.youtube.com",
        "object-src 'none'",
        "base-uri 'self'",
    ].join('; '),
};
