import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        iica: {
          navy: 'var(--iica-navy)',
          blue: 'var(--iica-blue)',
          cyan: 'var(--iica-cyan)',
          yellow: 'var(--iica-yellow)',
          secondary: 'var(--iica-secondary)',
          dark: 'var(--iica-dark)',
          gray: 'var(--iica-gray)',
          border: 'var(--iica-border)',
        },
        primary: {
          DEFAULT: '#003366',
          foreground: '#ffffff',
          light: '#005CB9',
        },
        secondary: {
          DEFAULT: '#2D7A4A',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#D4AF37',
          foreground: '#003366',
        },
        destructive: {
          DEFAULT: '#E74C3C',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#E8EAED',
          foreground: '#666666',
        },
        card: {
          DEFAULT: '#F8F9FA',
          foreground: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
