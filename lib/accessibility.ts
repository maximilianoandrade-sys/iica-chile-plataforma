/**
 * ACCESIBILIDAD - WCAG 2.1 AA Compliance
 * Sistema completo de accesibilidad para usuarios con discapacidades
 */

// ============================================================================
// 1. KEYBOARD NAVIGATION
// ============================================================================

/**
 * Maneja navegación por teclado
 */
export class KeyboardNavigationManager {
    private focusableElements: HTMLElement[] = [];
    private currentIndex = 0;

    constructor(container: HTMLElement) {
        this.updateFocusableElements(container);
    }

    /**
     * Actualiza la lista de elementos enfocables
     */
    updateFocusableElements(container: HTMLElement) {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        this.focusableElements = Array.from(
            container.querySelectorAll(selector)
        ) as HTMLElement[];
    }

    /**
     * Navega al siguiente elemento
     */
    focusNext(): void {
        this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
        this.focusableElements[this.currentIndex]?.focus();
    }

    /**
     * Navega al elemento anterior
     */
    focusPrevious(): void {
        this.currentIndex = this.currentIndex - 1;
        if (this.currentIndex < 0) {
            this.currentIndex = this.focusableElements.length - 1;
        }
        this.focusableElements[this.currentIndex]?.focus();
    }

    /**
     * Enfoca el primer elemento
     */
    focusFirst(): void {
        this.currentIndex = 0;
        this.focusableElements[0]?.focus();
    }

    /**
     * Enfoca el último elemento
     */
    focusLast(): void {
        this.currentIndex = this.focusableElements.length - 1;
        this.focusableElements[this.currentIndex]?.focus();
    }
}

/**
 * Maneja teclas de acceso rápido
 */
export function handleKeyboardShortcuts(event: KeyboardEvent, shortcuts: Record<string, () => void>) {
    const key = event.key.toLowerCase();
    const modifiers = {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
    };

    // Crear clave única para el shortcut
    const shortcutKey = [
        modifiers.ctrl && 'ctrl',
        modifiers.alt && 'alt',
        modifiers.shift && 'shift',
        modifiers.meta && 'meta',
        key
    ].filter(Boolean).join('+');

    const handler = shortcuts[shortcutKey];
    if (handler) {
        event.preventDefault();
        handler();
    }
}

// ============================================================================
// 2. SCREEN READER SUPPORT
// ============================================================================

/**
 * Anuncia mensaje a screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof document === 'undefined') return;

    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remover después de 1 segundo
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Genera ID único para ARIA labels
 */
export function generateAriaId(prefix: string = 'aria'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Crea descripción accesible para elementos
 */
export function createAccessibleDescription(element: HTMLElement, description: string): string {
    const id = generateAriaId('desc');

    const descElement = document.createElement('span');
    descElement.id = id;
    descElement.className = 'sr-only';
    descElement.textContent = description;

    element.appendChild(descElement);
    element.setAttribute('aria-describedby', id);

    return id;
}

// ============================================================================
// 3. FOCUS MANAGEMENT
// ============================================================================

/**
 * Administrador de focus trap para modales
 */
export class FocusTrap {
    private container: HTMLElement;
    private previousFocus: HTMLElement | null = null;
    private focusableElements: HTMLElement[] = [];

    constructor(container: HTMLElement) {
        this.container = container;
        this.updateFocusableElements();
    }

    /**
     * Actualiza elementos enfocables
     */
    private updateFocusableElements() {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        this.focusableElements = Array.from(
            this.container.querySelectorAll(selector)
        ) as HTMLElement[];
    }

    /**
     * Activa el focus trap
     */
    activate() {
        this.previousFocus = document.activeElement as HTMLElement;
        this.updateFocusableElements();

        // Enfocar el primer elemento
        if (this.focusableElements.length > 0) {
            this.focusableElements[0].focus();
        }

        // Agregar event listener
        this.container.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Desactiva el focus trap
     */
    deactivate() {
        this.container.removeEventListener('keydown', this.handleKeyDown);

        // Restaurar focus anterior
        if (this.previousFocus) {
            this.previousFocus.focus();
        }
    }

    /**
     * Maneja eventos de teclado
     */
    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        const firstElement = this.focusableElements[0];
        const lastElement = this.focusableElements[this.focusableElements.length - 1];

        if (event.shiftKey) {
            // Tab + Shift
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement?.focus();
            }
        } else {
            // Tab solo
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement?.focus();
            }
        }
    };
}

/**
 * Guarda y restaura el focus
 */
export class FocusManager {
    private focusHistory: HTMLElement[] = [];

    /**
     * Guarda el focus actual
     */
    save() {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
            this.focusHistory.push(activeElement);
        }
    }

    /**
     * Restaura el último focus guardado
     */
    restore() {
        const element = this.focusHistory.pop();
        if (element && element.focus) {
            element.focus();
        }
    }

    /**
     * Limpia el historial
     */
    clear() {
        this.focusHistory = [];
    }
}

export const focusManager = new FocusManager();

// ============================================================================
// 4. COLOR CONTRAST CHECKER
// ============================================================================

/**
 * Convierte hex a RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Calcula luminancia relativa
 */
function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calcula ratio de contraste entre dos colores
 */
export function getContrastRatio(color1: string, color2: string): number {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica si el contraste cumple WCAG AA
 */
export function meetsWCAG_AA(
    foreground: string,
    background: string,
    fontSize: number = 16,
    isBold: boolean = false
): { passes: boolean; ratio: number; required: number } {
    const ratio = getContrastRatio(foreground, background);

    // Texto grande: 18pt+ o 14pt+ bold
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
    const required = isLargeText ? 3 : 4.5;

    return {
        passes: ratio >= required,
        ratio: Math.round(ratio * 100) / 100,
        required
    };
}

/**
 * Verifica si el contraste cumple WCAG AAA
 */
export function meetsWCAG_AAA(
    foreground: string,
    background: string,
    fontSize: number = 16,
    isBold: boolean = false
): { passes: boolean; ratio: number; required: number } {
    const ratio = getContrastRatio(foreground, background);

    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
    const required = isLargeText ? 4.5 : 7;

    return {
        passes: ratio >= required,
        ratio: Math.round(ratio * 100) / 100,
        required
    };
}

// ============================================================================
// 5. ARIA LIVE REGIONS
// ============================================================================

/**
 * Crea una región ARIA live
 */
export function createLiveRegion(
    priority: 'polite' | 'assertive' = 'polite',
    atomic: boolean = true
): HTMLDivElement {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', atomic.toString());
    region.className = 'sr-only';

    document.body.appendChild(region);

    return region;
}

/**
 * Actualiza región ARIA live
 */
export function updateLiveRegion(region: HTMLElement, message: string) {
    region.textContent = message;
}

// ============================================================================
// 6. SKIP LINKS
// ============================================================================

/**
 * Crea skip link para navegación rápida
 */
export function createSkipLink(targetId: string, text: string = 'Saltar al contenido principal'): HTMLAnchorElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-link';
    skipLink.textContent = text;

    // Estilos para skip link
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
    `;

    // Mostrar en focus
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });

    return skipLink;
}

// ============================================================================
// 7. FORM ACCESSIBILITY
// ============================================================================

/**
 * Valida accesibilidad de formulario
 */
export function validateFormAccessibility(form: HTMLFormElement): string[] {
    const issues: string[] = [];

    // Verificar labels
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input: Element) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');

        if (!id && !ariaLabel && !ariaLabelledBy) {
            issues.push(`Input sin label: ${input.getAttribute('name') || 'sin nombre'}`);
        }

        if (id) {
            const label = form.querySelector(`label[for="${id}"]`);
            if (!label && !ariaLabel && !ariaLabelledBy) {
                issues.push(`Input con ID pero sin label asociado: ${id}`);
            }
        }
    });

    // Verificar fieldsets para grupos de radio/checkbox
    const radioGroups = form.querySelectorAll('input[type="radio"]');
    const checkboxGroups = form.querySelectorAll('input[type="checkbox"]');

    if ((radioGroups.length > 1 || checkboxGroups.length > 1) && !form.querySelector('fieldset')) {
        issues.push('Grupos de radio/checkbox deberían estar en un fieldset');
    }

    return issues;
}

/**
 * Mejora accesibilidad de formulario
 */
export function enhanceFormAccessibility(form: HTMLFormElement) {
    // Agregar aria-required a campos requeridos
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
        input.setAttribute('aria-required', 'true');
    });

    // Agregar aria-invalid a campos con error
    const invalidInputs = form.querySelectorAll(':invalid');
    invalidInputs.forEach(input => {
        input.setAttribute('aria-invalid', 'true');
    });
}

// ============================================================================
// 8. LANDMARK ROLES
// ============================================================================

/**
 * Valida que existan landmarks apropiados
 */
export function validateLandmarks(): string[] {
    const issues: string[] = [];

    const requiredLandmarks = [
        { role: 'banner', selector: 'header[role="banner"], [role="banner"]' },
        { role: 'main', selector: 'main, [role="main"]' },
        { role: 'contentinfo', selector: 'footer[role="contentinfo"], [role="contentinfo"]' },
        { role: 'navigation', selector: 'nav, [role="navigation"]' }
    ];

    requiredLandmarks.forEach(({ role, selector }) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            issues.push(`Falta landmark: ${role}`);
        } else if (elements.length > 1 && role !== 'navigation') {
            issues.push(`Múltiples landmarks ${role} (debería haber solo uno)`);
        }
    });

    return issues;
}

// ============================================================================
// 9. HEADING HIERARCHY
// ============================================================================

/**
 * Valida jerarquía de headings
 */
export function validateHeadingHierarchy(): string[] {
    const issues: string[] = [];
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    if (headings.length === 0) {
        issues.push('No se encontraron headings');
        return issues;
    }

    // Verificar que haya un H1
    const h1Count = headings.filter(h => h.tagName === 'H1').length;
    if (h1Count === 0) {
        issues.push('Falta H1');
    } else if (h1Count > 1) {
        issues.push('Múltiples H1 (debería haber solo uno)');
    }

    // Verificar orden jerárquico
    let previousLevel = 0;
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));

        if (index === 0 && level !== 1) {
            issues.push(`Primer heading es H${level}, debería ser H1`);
        }

        if (level > previousLevel + 1) {
            issues.push(`Salto en jerarquía: H${previousLevel} a H${level}`);
        }

        previousLevel = level;
    });

    return issues;
}

// ============================================================================
// 10. IMAGE ACCESSIBILITY
// ============================================================================

/**
 * Valida accesibilidad de imágenes
 */
export function validateImageAccessibility(): string[] {
    const issues: string[] = [];
    const images = document.querySelectorAll('img');

    images.forEach((img, index) => {
        const alt = img.getAttribute('alt');
        const ariaLabel = img.getAttribute('aria-label');
        const role = img.getAttribute('role');

        // Imágenes decorativas deberían tener alt=""
        if (role === 'presentation' || role === 'none') {
            if (alt !== '') {
                issues.push(`Imagen ${index + 1}: decorativa pero con alt text`);
            }
        } else {
            // Imágenes informativas deben tener alt
            if (alt === null && !ariaLabel) {
                issues.push(`Imagen ${index + 1}: falta alt text`);
            } else if (alt === '') {
                issues.push(`Imagen ${index + 1}: alt vacío (¿es decorativa?)`);
            }
        }
    });

    return issues;
}

// ============================================================================
// 11. ACCESSIBILITY AUDIT
// ============================================================================

/**
 * Ejecuta auditoría completa de accesibilidad
 */
export function runAccessibilityAudit(): {
    landmarks: string[];
    headings: string[];
    images: string[];
    forms: string[];
    overall: 'pass' | 'warning' | 'fail';
} {
    const landmarks = validateLandmarks();
    const headings = validateHeadingHierarchy();
    const images = validateImageAccessibility();

    const forms = Array.from(document.querySelectorAll('form'))
        .flatMap(form => validateFormAccessibility(form));

    const totalIssues = landmarks.length + headings.length + images.length + forms.length;

    let overall: 'pass' | 'warning' | 'fail';
    if (totalIssues === 0) {
        overall = 'pass';
    } else if (totalIssues <= 5) {
        overall = 'warning';
    } else {
        overall = 'fail';
    }

    return {
        landmarks,
        headings,
        images,
        forms,
        overall
    };
}

// ============================================================================
// 12. REDUCED MOTION
// ============================================================================

/**
 * Detecta preferencia de movimiento reducido
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Aplica animaciones respetando preferencias
 */
export function safeAnimate(
    element: HTMLElement,
    animation: Keyframe[] | PropertyIndexedKeyframes,
    options?: KeyframeAnimationOptions
): Animation | null {
    if (prefersReducedMotion()) {
        // Aplicar estado final sin animación
        if (Array.isArray(animation) && animation.length > 0) {
            const finalState = animation[animation.length - 1];
            Object.assign(element.style, finalState);
        }
        return null;
    }

    return element.animate(animation, options);
}
