/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores institucionales IICA basados en https://iica.int/es/
        'iica': {
          'primary': '#336699',      // Azul IICA principal (rgb(51, 102, 153))
          'secondary': '#FF9900',     // Naranja IICA (rgb(255, 153, 0))
          'green': '#2E7D32',         // Verde institucional
          'blue': '#1976D2',          // Azul complementario
          'dark': '#212121',          // Gris oscuro
          'light': '#F5F5F5',         // Gris claro
          'accent': '#FF6F00',        // Naranja oscuro
        },
      },
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
