/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores institucionales IICA basados en https://iica.int/es/
        'iica': {
          'primary': '#0066cc',       // Azul IICA oficial (del gradiente header)
          'secondary': '#00a651',     // Verde IICA oficial (del gradiente header)
          'green': '#00a651',         // Verde institucional
          'blue': '#0066cc',          // Azul complementario
          'dark': '#212121',          // Gris oscuro
          'light': '#F5F5F5',         // Gris claro
          'accent': '#FF9900',        // Naranja IICA
        },
      },
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
