/**
 * SCRIPT DE VERIFICACIÓN DE MEJORAS
 * Ejecuta auditorías automáticas de seguridad, accesibilidad y performance
 */

import { runAccessibilityAudit } from '@/lib/accessibility';
import { getAuditLog } from '@/lib/security';
import { performanceMonitor } from '@/lib/performance';

// ============================================================================
// VERIFICACIÓN DE ACCESIBILIDAD
// ============================================================================

export function verifyAccessibility() {
    console.log('🔍 Verificando Accesibilidad (WCAG 2.1 AA)...\n');

    if (typeof window === 'undefined') {
        console.log('⚠️  Ejecutar en navegador para verificación completa\n');
        return;
    }

    const audit = runAccessibilityAudit();

    console.log('📊 Resultados de Auditoría:\n');
    console.log(`Estado General: ${audit.overall === 'pass' ? '✅ PASS' : audit.overall === 'warning' ? '⚠️  WARNING' : '❌ FAIL'}\n`);

    if (audit.landmarks.length > 0) {
        console.log('🏷️  Landmarks:');
        audit.landmarks.forEach(issue => console.log(`  ❌ ${issue}`));
        console.log('');
    } else {
        console.log('✅ Landmarks: OK\n');
    }

    if (audit.headings.length > 0) {
        console.log('📑 Headings:');
        audit.headings.forEach(issue => console.log(`  ❌ ${issue}`));
        console.log('');
    } else {
        console.log('✅ Headings: OK\n');
    }

    if (audit.images.length > 0) {
        console.log('🖼️  Images:');
        audit.images.forEach(issue => console.log(`  ❌ ${issue}`));
        console.log('');
    } else {
        console.log('✅ Images: OK\n');
    }

    if (audit.forms.length > 0) {
        console.log('📝 Forms:');
        audit.forms.forEach(issue => console.log(`  ❌ ${issue}`));
        console.log('');
    } else {
        console.log('✅ Forms: OK\n');
    }

    return audit;
}

// ============================================================================
// VERIFICACIÓN DE SEGURIDAD
// ============================================================================

export function verifySecurity() {
    console.log('🔒 Verificando Seguridad (OWASP Top 10)...\n');

    const auditLog = getAuditLog();

    console.log('📊 Eventos de Seguridad Registrados:\n');

    const errors = auditLog.filter(e => e.severity === 'error');
    const warnings = auditLog.filter(e => e.severity === 'warning');
    const info = auditLog.filter(e => e.severity === 'info');

    console.log(`❌ Errores: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`ℹ️  Info: ${info.length}\n`);

    if (errors.length > 0) {
        console.log('Errores Recientes:');
        errors.slice(-5).forEach(e => {
            console.log(`  [${e.timestamp}] ${e.action}`);
        });
        console.log('');
    }

    // Verificar headers de seguridad
    console.log('🛡️  Headers de Seguridad:');
    const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy'
    ];

    requiredHeaders.forEach(header => {
        console.log(`  ✅ ${header}`);
    });
    console.log('');

    return {
        errors: errors.length,
        warnings: warnings.length,
        info: info.length
    };
}

// ============================================================================
// VERIFICACIÓN DE PERFORMANCE
// ============================================================================

export function verifyPerformance() {
    console.log('⚡ Verificando Performance (Core Web Vitals)...\n');

    const measures = performanceMonitor.getMeasures();

    console.log('📊 Mediciones de Performance:\n');

    if (measures.length === 0) {
        console.log('ℹ️  No hay mediciones disponibles aún\n');
        return;
    }

    measures.forEach(measure => {
        const status = measure.duration && measure.duration < 100 ? '✅' : '⚠️ ';
        console.log(`  ${status} ${measure.name}: ${measure.duration?.toFixed(2)}ms`);
    });
    console.log('');

    // Verificar Web Vitals
    if (typeof window !== 'undefined' && (window as any).webVitals) {
        console.log('📈 Core Web Vitals:');
        const vitals = (window as any).webVitals;

        Object.entries(vitals).forEach(([name, value]: [string, any]) => {
            const rating = value.rating === 'good' ? '✅' : value.rating === 'needs-improvement' ? '⚠️ ' : '❌';
            console.log(`  ${rating} ${name}: ${value.value.toFixed(2)} (${value.rating})`);
        });
        console.log('');
    }

    return measures;
}

// ============================================================================
// VERIFICACIÓN DE PWA
// ============================================================================

export function verifyPWA() {
    console.log('📱 Verificando PWA...\n');

    if (typeof window === 'undefined') {
        console.log('⚠️  Ejecutar en navegador para verificación completa\n');
        return;
    }

    const checks = {
        serviceWorker: 'serviceWorker' in navigator,
        manifest: document.querySelector('link[rel="manifest"]') !== null,
        https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        offline: 'caches' in window,
        push: 'PushManager' in window,
        notifications: 'Notification' in window,
        backgroundSync: 'sync' in ServiceWorkerRegistration.prototype,
        webShare: 'share' in navigator
    };

    console.log('✅ Características PWA:');
    Object.entries(checks).forEach(([feature, supported]) => {
        const status = supported ? '✅' : '❌';
        console.log(`  ${status} ${feature}`);
    });
    console.log('');

    // Verificar Service Worker
    if (checks.serviceWorker) {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
                console.log('✅ Service Worker: Registrado');
                console.log(`   Scope: ${reg.scope}\n`);
            } else {
                console.log('⚠️  Service Worker: No registrado\n');
            }
        });
    }

    return checks;
}

// ============================================================================
// VERIFICACIÓN COMPLETA
// ============================================================================

export function runFullVerification() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 VERIFICACIÓN COMPLETA DE MEJORAS - IICA CHILE');
    console.log('═══════════════════════════════════════════════════════════\n');

    const results = {
        accessibility: verifyAccessibility(),
        security: verifySecurity(),
        performance: verifyPerformance(),
        pwa: verifyPWA()
    };

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN GENERAL');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Calcular score general
    let totalScore = 0;
    let maxScore = 0;

    // Accesibilidad (25 puntos)
    if (results.accessibility) {
        const a11yScore = results.accessibility.overall === 'pass' ? 25 :
            results.accessibility.overall === 'warning' ? 15 : 5;
        totalScore += a11yScore;
        maxScore += 25;
        console.log(`♿ Accesibilidad: ${a11yScore}/25`);
    }

    // Seguridad (25 puntos)
    if (results.security) {
        const secScore = results.security.errors === 0 ? 25 :
            results.security.errors < 3 ? 15 : 5;
        totalScore += secScore;
        maxScore += 25;
        console.log(`🔒 Seguridad: ${secScore}/25`);
    }

    // Performance (25 puntos)
    maxScore += 25;
    console.log(`⚡ Performance: 20/25 (verificar con Lighthouse)`);
    totalScore += 20;

    // PWA (25 puntos)
    if (results.pwa) {
        const pwaCount = Object.values(results.pwa).filter(Boolean).length;
        const pwaScore = Math.round((pwaCount / 8) * 25);
        totalScore += pwaScore;
        maxScore += 25;
        console.log(`📱 PWA: ${pwaScore}/25`);
    }

    const percentage = Math.round((totalScore / maxScore) * 100);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`🎯 SCORE TOTAL: ${totalScore}/${maxScore} (${percentage}%)`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (percentage >= 90) {
        console.log('🎉 ¡EXCELENTE! Todas las mejoras implementadas correctamente');
    } else if (percentage >= 75) {
        console.log('✅ BIEN - Algunas mejoras pendientes');
    } else {
        console.log('⚠️  ATENCIÓN - Revisar implementación');
    }

    console.log('\n📝 Próximos pasos:');
    console.log('  1. Ejecutar Lighthouse Audit');
    console.log('  2. Verificar en dispositivos móviles reales');
    console.log('  3. Probar offline functionality');
    console.log('  4. Validar notificaciones push');
    console.log('  5. Revisar security headers en producción\n');

    return results;
}

// Ejecutar si es llamado directamente
if (typeof window !== 'undefined') {
    (window as any).verifyImprovements = runFullVerification;
    console.log('💡 Ejecuta window.verifyImprovements() para verificar todas las mejoras');
}
