/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          teal: {
            DEFAULT: '#008080',
            light: '#00b3b3',
            dark: '#004d4d',
            soft: '#e6f2f2'
          },
          amber: {
            DEFAULT: '#FFBF00',
            light: '#ffd24d',
            dark: '#b38600',
            soft: '#fff9e6'
          },
        },
        darkBg: '#121214',
        darkCard: '#1d1d22',
        lightBg: '#FAFAFB',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
