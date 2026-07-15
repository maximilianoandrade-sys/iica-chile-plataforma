'use client';

/**
 * AccessibilityToolbar — widget nativo de accesibilidad
 *
 * Funcionalidades equivalentes al widget UserWay / creaseFont de fondos.gob.cl:
 *  - Tamaño de fuente: pequeño / normal / grande
 *  - Alto contraste: activar / desactivar
 *
 * Sin dependencias de terceros. Persistencia en localStorage.
 * WCAG AA: foco visible, aria-labels, roles semánticos.
 */

import { useEffect, useState, useCallback } from 'react';
import { getLogger } from '@/lib/utils/logger';
import { AArrowDown, AArrowUp, RotateCcw, Contrast } from 'lucide-react';

const logger = getLogger('AccessibilityToolbar');

const STORAGE_KEY_FONT = 'iica-a11y-font';
const STORAGE_KEY_CONTRAST = 'iica-a11y-contrast';

type FontSize = 'small' | 'default' | 'large';

const FONT_CLASSES: Record<FontSize, string> = {
  small: 'a11y-font-small',
  default: '',
  large: 'a11y-font-large',
};

const FONT_LABELS: Record<FontSize, string> = {
  small: 'Letra pequeña activa',
  default: 'Letra normal activa',
  large: 'Letra grande activa',
};

function applyFontClass(size: FontSize) {
  const html = document.documentElement;
  html.classList.remove('a11y-font-small', 'a11y-font-large');
  if (FONT_CLASSES[size]) html.classList.add(FONT_CLASSES[size]);
}

function applyContrastClass(enabled: boolean) {
  const html = document.documentElement;
  html.classList.toggle('a11y-high-contrast', enabled);
}

export function AccessibilityToolbar() {
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('default');
  const [highContrast, setHighContrast] = useState(false);
  const [open, setOpen] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedFont = (localStorage.getItem(STORAGE_KEY_FONT) as FontSize) ?? 'default';
    const savedContrast = localStorage.getItem(STORAGE_KEY_CONTRAST) === 'true';

    setFontSize(savedFont);
    setHighContrast(savedContrast);
    applyFontClass(savedFont);
    applyContrastClass(savedContrast);

    logger.debug('AccessibilityToolbar restored preferences', { savedFont, savedContrast });
  }, []);

  const updateFont = useCallback((size: FontSize) => {
    setFontSize(size);
    applyFontClass(size);
    localStorage.setItem(STORAGE_KEY_FONT, size);
    logger.debug('Font size changed', { size });
  }, []);

  const toggleContrast = useCallback(() => {
    const next = !highContrast;
    setHighContrast(next);
    applyContrastClass(next);
    localStorage.setItem(STORAGE_KEY_CONTRAST, String(next));
    logger.debug('High contrast toggled', { enabled: next });
  }, [highContrast]);

  const reset = useCallback(() => {
    updateFont('default');
    setHighContrast(false);
    applyContrastClass(false);
    localStorage.removeItem(STORAGE_KEY_CONTRAST);
    logger.debug('Accessibility preferences reset');
  }, [updateFont]);

  if (!mounted) {
    // SSR placeholder — mismas dimensiones para evitar CLS
    return (
      <div className="flex items-center gap-1" aria-hidden="true">
        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  const isModified = fontSize !== 'default' || highContrast;

  return (
    <div className="relative" data-testid="accessibility-toolbar">
      {/* Trigger button */}
      <button
        id="a11y-toolbar-trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="a11y-toolbar-panel"
        aria-label="Opciones de accesibilidad"
        title="Opciones de accesibilidad"
        className={`
          relative flex items-center justify-center w-9 h-9 rounded-lg transition-all
          ${isModified
            ? 'bg-[var(--iica-blue)] text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        `}
      >
        {/* Accessibility universal icon (inline SVG — no extra dep) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="4" r="2" />
          <path d="M19 8.5a1 1 0 0 0-1-1h-4.18l-.64-2H9.82L9.18 7.5H5a1 1 0 0 0 0 2h1.75l1.5 7h7.5l1.5-7H19a1 1 0 0 0 0-1zM8.5 16l-1-5h9l-1 5h-7z" />
        </svg>
        {/* Dot indicator when active */}
        {isModified && (
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--iica-yellow)] rounded-full border-2 border-white dark:border-gray-900"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop (mobile) */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          <div
            id="a11y-toolbar-panel"
            role="dialog"
            aria-label="Opciones de accesibilidad"
            className={`
              absolute right-0 top-full mt-2 z-50
              w-64 rounded-xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-900
              shadow-xl shadow-black/10 dark:shadow-black/40
              p-4 animate-fade-in-up
            `}
          >
            {/* Font size */}
            <fieldset className="mb-4">
              <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Tamaño de letra
              </legend>
              <div
                className="flex gap-1.5"
                role="group"
                aria-label="Tamaño de letra"
              >
                {/* Small */}
                <button
                  type="button"
                  id="a11y-font-small"
                  onClick={() => updateFont('small')}
                  aria-pressed={fontSize === 'small'}
                  aria-label="Letra pequeña"
                  title="Letra pequeña"
                  className={`
                    flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all
                    ${fontSize === 'small'
                      ? 'border-[var(--iica-blue)] bg-blue-50 dark:bg-blue-950 text-[var(--iica-blue)] dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300'
                    }
                  `}
                >
                  <AArrowDown className="w-4 h-4" aria-hidden="true" />
                  <span>Pequeño</span>
                </button>

                {/* Normal */}
                <button
                  type="button"
                  id="a11y-font-default"
                  onClick={() => updateFont('default')}
                  aria-pressed={fontSize === 'default'}
                  aria-label="Letra normal"
                  title="Letra normal"
                  className={`
                    flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all
                    ${fontSize === 'default'
                      ? 'border-[var(--iica-blue)] bg-blue-50 dark:bg-blue-950 text-[var(--iica-blue)] dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300'
                    }
                  `}
                >
                  <span className="text-sm font-bold" aria-hidden="true">A</span>
                  <span>Normal</span>
                </button>

                {/* Large */}
                <button
                  type="button"
                  id="a11y-font-large"
                  onClick={() => updateFont('large')}
                  aria-pressed={fontSize === 'large'}
                  aria-label="Letra grande"
                  title="Letra grande"
                  className={`
                    flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all
                    ${fontSize === 'large'
                      ? 'border-[var(--iica-blue)] bg-blue-50 dark:bg-blue-950 text-[var(--iica-blue)] dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300'
                    }
                  `}
                >
                  <AArrowUp className="w-4 h-4" aria-hidden="true" />
                  <span>Grande</span>
                </button>
              </div>

              {/* Live region for screen reader feedback */}
              <p
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {FONT_LABELS[fontSize]}
              </p>
            </fieldset>

            {/* High contrast */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Alto contraste
              </p>
              <button
                type="button"
                id="a11y-contrast-toggle"
                onClick={toggleContrast}
                aria-pressed={highContrast}
                aria-label={highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste'}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                  ${highContrast
                    ? 'border-[var(--iica-blue)] bg-[var(--iica-navy)] text-white'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <Contrast className="w-4 h-4" aria-hidden="true" />
                  {highContrast ? 'Alto contraste activo' : 'Activar alto contraste'}
                </span>
                {/* Toggle visual */}
                <span
                  className={`
                    inline-flex w-10 h-5 rounded-full transition-colors relative
                    ${highContrast ? 'bg-[var(--iica-blue)]' : 'bg-gray-300 dark:bg-gray-600'}
                  `}
                  aria-hidden="true"
                >
                  <span
                    className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                      ${highContrast ? 'translate-x-5' : 'translate-x-0.5'}
                    `}
                  />
                </span>
              </button>
              <p
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {highContrast ? 'Alto contraste activado' : 'Alto contraste desactivado'}
              </p>
            </div>

            {/* Reset */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                id="a11y-reset"
                onClick={() => { reset(); setOpen(false); }}
                aria-label="Restablecer preferencias de accesibilidad"
                disabled={!isModified}
                className="
                  w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                  text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Restablecer preferencias
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
