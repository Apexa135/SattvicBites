/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandNavy: {
          light: '#4E3F35',
          DEFAULT: '#2C221E',
          dark: '#1A1310',
        },
        brandGreen: {
          light: '#1E3A24',
          DEFAULT: '#112316',
          dark: '#0B160E',
        },
        brandSaffron: {
          light: '#FEF3C7',
          DEFAULT: '#E9C46A',
          dark: '#D4A343',
        },
        brandSage: {
          light: '#E2ECE5',
          DEFAULT: '#4B7A5A',
          dark: '#2E4F37',
        },
        brandOchre: {
          light: '#FDF2E9',
          DEFAULT: '#C2410C',
          dark: '#9A3412',
        },
        brandWarning: {
          light: '#FEFDF6',
          DEFAULT: '#E9C46A',
          dark: '#D4A343',
        },
        brandCanvas: '#FEFDF6',
        brandCard: '#FEFDF6'
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
